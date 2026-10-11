import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { and, eq } from "drizzle-orm";
import { getLessonById, getLessonStatus, type ProgressMap } from "@/lib/curriculum";
import { getQuizForLesson } from "@/lib/curriculum/quizzes";
import { getOrCreateUser, setDb, type AppDatabase } from "@/lib/db/client";
import { lessonProgress, quizAttempts, trackEnrollment } from "@/lib/db/schema";
import { InvalidProgressInputError } from "@/lib/progress/errors";
import {
  importProgress,
  markLabComplete,
  markLessonRead,
  submitQuiz,
} from "@/lib/progress/service";
import { openMemoryDatabase } from "@/tests/memory-db";

const EMPTY_QUIZ_LESSON = vi.hoisted(() => "empty-quiz-lesson");

vi.mock("@/lib/curriculum", async () => {
  const actual = await vi.importActual<typeof import("@/lib/curriculum")>(
    "@/lib/curriculum"
  );
  return {
    ...actual,
    getLessonById: (id: string) => {
      if (id === EMPTY_QUIZ_LESSON) {
        const base = actual.getLessonById("b1-atoms-charge");
        if (!base) return undefined;
        return { ...base, id };
      }
      return actual.getLessonById(id);
    },
  };
});

const ATOMS = "b1-atoms-charge";
const OHMS = "b3-ohms-law";
const SERIES = "b3-series-parallel";

function answersFor(lessonId: string, mode: "correct" | "wrong" | "partial"): number[] {
  const questions = getQuizForLesson(lessonId);
  return questions.map((question, index) => {
    const incorrect = question.correctIndex === 0 ? 1 : 0;
    if (mode === "wrong") return incorrect;
    if (mode === "partial" && index === questions.length - 1) return incorrect;
    return question.correctIndex;
  });
}

describe("progress service", () => {
  let sqlite: ReturnType<typeof openMemoryDatabase>["sqlite"];
  let db: AppDatabase;
  let userId: number;

  beforeEach(async () => {
    const opened = openMemoryDatabase();
    sqlite = opened.sqlite;
    db = opened.db;
    setDb(db);
    const user = await getOrCreateUser();
    userId = user.id;
  });

  afterEach(() => {
    setDb(undefined);
    sqlite.close();
  });

  async function progressFor(lessonId: string) {
    const rows = await db
      .select()
      .from(lessonProgress)
      .where(and(eq(lessonProgress.userId, userId), eq(lessonProgress.lessonId, lessonId)))
      .limit(1);
    return rows[0];
  }

  async function progressMap(): Promise<ProgressMap> {
    const rows = await db
      .select()
      .from(lessonProgress)
      .where(eq(lessonProgress.userId, userId));
    const map: ProgressMap = {};
    for (const row of rows) {
      map[row.lessonId] = {
        status: row.status,
        quizScore: row.quizScore,
        labComplete: row.labComplete,
        readSections: row.readSections,
      };
    }
    return map;
  }

  async function completeOhmsLaw() {
    await markLessonRead(userId, OHMS);
    await markLabComplete(userId, OHMS);
    return submitQuiz(userId, OHMS, answersFor(OHMS, "correct"));
  }

  it("grades wrong, partial, and correct quiz answers on the server", async () => {
    const wrong = await submitQuiz(userId, ATOMS, answersFor(ATOMS, "wrong"));
    expect(wrong).toMatchObject({
      score: 0,
      correct: 0,
      totalQuestions: 3,
      passed: false,
    });

    const partial = await submitQuiz(userId, ATOMS, answersFor(ATOMS, "partial"));
    expect(partial).toMatchObject({
      score: 67,
      correct: 2,
      totalQuestions: 3,
      passed: false,
    });

    const correct = await submitQuiz(userId, ATOMS, answersFor(ATOMS, "correct"));
    expect(correct).toMatchObject({
      score: 100,
      correct: 3,
      totalQuestions: 3,
      passed: true,
    });
    expect(correct.questions.map((question) => question.correctIndex)).toEqual(
      getQuizForLesson(ATOMS).map((question) => question.correctIndex)
    );

    const attempts = await db
      .select()
      .from(quizAttempts)
      .where(eq(quizAttempts.userId, userId));
    expect(attempts).toHaveLength(3);
  });

  it("rejects a quiz that has no questions and does not store the attempt", async () => {
    await expect(submitQuiz(userId, EMPTY_QUIZ_LESSON, [])).rejects.toBeInstanceOf(
      InvalidProgressInputError
    );
    await expect(submitQuiz(userId, EMPTY_QUIZ_LESSON, [])).rejects.toThrow(
      "Quiz has no questions"
    );

    expect(await progressFor(EMPTY_QUIZ_LESSON)).toBeUndefined();
    const attempts = await db.select().from(quizAttempts);
    expect(attempts).toHaveLength(0);
  });

  it("keeps a completed lesson completed when it is revisited", async () => {
    const passed = await completeOhmsLaw();
    expect(passed.passed).toBe(true);
    expect((await progressFor(OHMS))?.status).toBe("completed");

    await markLessonRead(userId, OHMS);

    const row = await progressFor(OHMS);
    expect(row?.status).toBe("completed");
    expect(row?.quizScore).toBe(100);
    expect(row?.readSections).toBe(true);
    expect(row?.labComplete).toBe(true);

    const series = getLessonById(SERIES);
    if (!series) throw new Error("Missing series lesson");
    expect(getLessonStatus(series, await progressMap(), [])).toBe("available");

    // Opening a lesson always requests in_progress. A stored completed
    // status has to survive that even when the saved score would not pass
    // a fresh completion check, or the next lesson locks again.
    await importProgress(userId, {
      progress: [
        {
          lessonId: OHMS,
          status: "completed",
          quizScore: 50,
          readSections: true,
          labComplete: false,
        },
      ],
      tracks: [],
    });
    await markLessonRead(userId, OHMS);

    expect((await progressFor(OHMS))?.status).toBe("completed");
    expect(getLessonStatus(series, await progressMap(), [])).toBe("available");
  });

  it("keeps a completed lesson completed after a failed retake", async () => {
    await completeOhmsLaw();

    const failed = await submitQuiz(userId, OHMS, answersFor(OHMS, "wrong"));
    expect(failed).toMatchObject({ score: 0, correct: 0, passed: false });

    const row = await progressFor(OHMS);
    expect(row?.status).toBe("completed");
    expect(row?.quizScore).toBe(100);

    const series = getLessonById(SERIES);
    if (!series) throw new Error("Missing series lesson");
    expect(getLessonStatus(series, await progressMap(), [])).toBe("available");
  });

  it("keeps the higher quiz score when a later attempt scores lower", async () => {
    const first = await submitQuiz(userId, ATOMS, answersFor(ATOMS, "correct"));
    expect(first.score).toBe(100);
    expect((await progressFor(ATOMS))?.status).toBe("in_progress");

    const lower = await submitQuiz(userId, ATOMS, answersFor(ATOMS, "partial"));
    expect(lower.score).toBe(67);
    expect((await progressFor(ATOMS))?.quizScore).toBe(100);

    await submitQuiz(userId, "b1-voltage-current", answersFor("b1-voltage-current", "partial"));
    expect((await progressFor("b1-voltage-current"))?.quizScore).toBe(67);
    await submitQuiz(userId, "b1-voltage-current", answersFor("b1-voltage-current", "correct"));
    expect((await progressFor("b1-voltage-current"))?.quizScore).toBe(100);
  });

  it("rejects an import with an invalid status and leaves existing progress in place", async () => {
    await markLessonRead(userId, ATOMS);
    const before = await progressFor(ATOMS);

    await expect(
      importProgress(userId, {
        progress: [{ lessonId: ATOMS, status: "finished" }],
        tracks: [],
      })
    ).rejects.toMatchObject({
      name: "InvalidProgressInputError",
      message: "Invalid progress import",
    });

    const after = await progressFor(ATOMS);
    expect(after?.id).toBe(before?.id);
    expect(after?.status).toBe("in_progress");
    expect(after?.readSections).toBe(true);
  });

  it("imports only the lesson statuses the schema allows", async () => {
    await importProgress(userId, {
      progress: [
        { lessonId: ATOMS, status: "completed", quizScore: 90, readSections: true },
        { lessonId: "b1-voltage-current", status: "available" },
        { lessonId: "b1-power-units", status: "locked" },
        { lessonId: "b1-safety-intro", status: "in_progress", quizScore: 40 },
      ],
      tracks: [{ trackId: "robotics", enrolled: true }],
    });

    expect((await progressFor(ATOMS))?.status).toBe("completed");
    expect((await progressFor(ATOMS))?.quizScore).toBe(90);
    expect((await progressFor("b1-voltage-current"))?.status).toBe("available");
    expect((await progressFor("b1-power-units"))?.status).toBe("locked");
    expect((await progressFor("b1-safety-intro"))?.status).toBe("in_progress");

    const tracks = await db
      .select()
      .from(trackEnrollment)
      .where(eq(trackEnrollment.userId, userId));
    expect(tracks).toEqual([
      expect.objectContaining({ trackId: "robotics", enrolled: true }),
    ]);
  });
});
