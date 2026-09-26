import { eq, and } from "drizzle-orm";
import { connection } from "next/server";
import { getDb, getOrCreateUser } from "@/lib/db/client";
import {
  lessonProgress,
  trackEnrollment,
  quizAttempts,
  userSettings,
} from "@/lib/db/schema";
import {
  curriculum,
  getLessonById,
  isLessonComplete,
  getLessonStatus,
  type ProgressMap,
} from "@/lib/curriculum";
import type { TrackId } from "@/lib/curriculum/types";

export async function getProgressData() {
  // better-sqlite3 is synchronous, so without this the dashboard is prerendered
  // at build time and shows stale progress in production.
  await connection();
  const user = await getOrCreateUser();
  const db = getDb();

  const progressRows = await db
    .select()
    .from(lessonProgress)
    .where(eq(lessonProgress.userId, user.id));

  const trackRows = await db
    .select()
    .from(trackEnrollment)
    .where(eq(trackEnrollment.userId, user.id));

  const settings = await db
    .select()
    .from(userSettings)
    .where(eq(userSettings.userId, user.id))
    .limit(1);

  const progressMap: ProgressMap = {};
  for (const row of progressRows) {
    progressMap[row.lessonId] = {
      status: row.status,
      quizScore: row.quizScore,
      labComplete: row.labComplete ?? false,
      readSections: row.readSections ?? false,
    };
  }

  const enrolledTracks: TrackId[] = trackRows
    .filter((t) => t.enrolled)
    .map((t) => t.trackId as TrackId);

  const lessonsWithStatus = curriculum.lessons.map((lesson) => ({
    ...lesson,
    computedStatus: getLessonStatus(lesson, progressMap, enrolledTracks),
  }));

  return {
    userId: user.id,
    progress: progressMap,
    enrolledTracks,
    lessonsWithStatus,
    settings: settings[0] ?? { ollamaModel: "llama3.2:3b" },
  };
}

async function upsertProgress(
  userId: number,
  lessonId: string,
  updates: Partial<{
    status: "locked" | "available" | "in_progress" | "completed";
    quizScore: number;
    labComplete: boolean;
    readSections: boolean;
    completedAt: Date | null;
  }>
) {
  const db = getDb();
  const existing = await db
    .select()
    .from(lessonProgress)
    .where(
      and(
        eq(lessonProgress.userId, userId),
        eq(lessonProgress.lessonId, lessonId)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    const current = existing[0];
    const merged = { ...updates };
    // Revisiting or retaking a finished lesson must never un-complete it
    // (that would re-lock every lesson that depends on it).
    if (current.status === "completed" && merged.status !== "completed") {
      delete merged.status;
    }
    if (merged.quizScore !== undefined && current.quizScore !== null) {
      merged.quizScore = Math.max(merged.quizScore, current.quizScore);
    }
    await db
      .update(lessonProgress)
      .set(merged)
      .where(eq(lessonProgress.id, current.id));
  } else {
    await db.insert(lessonProgress).values({
      userId,
      lessonId,
      status: updates.status ?? "in_progress",
      ...updates,
    });
  }
}

export async function markLessonRead(userId: number, lessonId: string) {
  const lesson = getLessonById(lessonId);
  if (!lesson) throw new Error("Lesson not found");

  await upsertProgress(userId, lessonId, {
    status: "in_progress",
    readSections: true,
  });

  await checkAndComplete(userId, lessonId);
}

export async function submitQuiz(
  userId: number,
  lessonId: string,
  score: number,
  totalQuestions: number
) {
  const db = getDb();
  const lesson = getLessonById(lessonId);
  if (!lesson) throw new Error("Lesson not found");

  await db.insert(quizAttempts).values({
    userId,
    lessonId,
    score,
    totalQuestions,
  });

  const pct = Math.round((score / totalQuestions) * 100);
  await upsertProgress(userId, lessonId, {
    status: "in_progress",
    quizScore: pct,
  });

  await checkAndComplete(userId, lessonId);
  return { score: pct };
}

export async function markLabComplete(userId: number, lessonId: string) {
  await upsertProgress(userId, lessonId, {
    status: "in_progress",
    labComplete: true,
  });
  await checkAndComplete(userId, lessonId);
}

async function checkAndComplete(userId: number, lessonId: string) {
  const lesson = getLessonById(lessonId);
  if (!lesson) return;

  const db = getDb();
  const rows = await db
    .select()
    .from(lessonProgress)
    .where(
      and(
        eq(lessonProgress.userId, userId),
        eq(lessonProgress.lessonId, lessonId)
      )
    )
    .limit(1);

  const row = rows[0];
  if (!row) return;

  const progressMap: ProgressMap = {
    [lessonId]: {
      status: row.status,
      quizScore: row.quizScore,
      labComplete: row.labComplete ?? false,
      readSections: row.readSections ?? false,
    },
  };

  if (isLessonComplete(lesson, progressMap)) {
    await upsertProgress(userId, lessonId, {
      status: "completed",
      completedAt: new Date(),
      quizScore: row.quizScore ?? undefined,
      labComplete: row.labComplete ?? false,
      readSections: row.readSections ?? false,
    });
  }
}

export async function enrollTrack(userId: number, trackId: TrackId, enrolled: boolean) {
  const db = getDb();
  const existing = await db
    .select()
    .from(trackEnrollment)
    .where(
      and(
        eq(trackEnrollment.userId, userId),
        eq(trackEnrollment.trackId, trackId)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(trackEnrollment)
      .set({ enrolled, enrolledAt: enrolled ? new Date() : null })
      .where(eq(trackEnrollment.id, existing[0].id));
  } else {
    await db.insert(trackEnrollment).values({
      userId,
      trackId,
      enrolled,
      enrolledAt: enrolled ? new Date() : null,
    });
  }
}

export async function updateSettings(
  userId: number,
  updates: { ollamaModel?: string }
) {
  const db = getDb();
  await db
    .update(userSettings)
    .set(updates)
    .where(eq(userSettings.userId, userId));
}

export async function resetProgress(userId: number) {
  const db = getDb();
  await db.delete(lessonProgress).where(eq(lessonProgress.userId, userId));
  await db.delete(quizAttempts).where(eq(quizAttempts.userId, userId));
}

export async function exportProgress(userId: number) {
  const db = getDb();
  const progress = await db
    .select()
    .from(lessonProgress)
    .where(eq(lessonProgress.userId, userId));
  const tracks = await db
    .select()
    .from(trackEnrollment)
    .where(eq(trackEnrollment.userId, userId));
  const settings = await db
    .select()
    .from(userSettings)
    .where(eq(userSettings.userId, userId))
    .limit(1);

  return { progress, tracks, settings: settings[0] };
}

export async function importProgress(
  userId: number,
  data: {
    progress: Array<{
      lessonId: string;
      status: string;
      quizScore?: number | null;
      labComplete?: boolean | null;
      readSections?: boolean | null;
    }>;
    tracks: Array<{ trackId: string; enrolled: boolean }>;
  }
) {
  await resetProgress(userId);
  const db = getDb();

  for (const p of data.progress) {
    await db.insert(lessonProgress).values({
      userId,
      lessonId: p.lessonId,
      status: p.status as "locked" | "available" | "in_progress" | "completed",
      quizScore: p.quizScore,
      labComplete: p.labComplete ?? false,
      readSections: p.readSections ?? false,
      completedAt: p.status === "completed" ? new Date() : null,
    });
  }

  for (const t of data.tracks) {
    await enrollTrack(userId, t.trackId as TrackId, t.enrolled);
  }
}
