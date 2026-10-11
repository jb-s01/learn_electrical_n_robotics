import { describe, expect, it } from "vitest";
import {
  ImportProgressDataSchema,
  ProgressActionSchema,
  SettingsUpdateSchema,
} from "@/lib/api/schemas";

const lessonStatuses = ["locked", "available", "in_progress", "completed"] as const;

describe("ProgressActionSchema", () => {
  it("accepts each progress action", () => {
    expect(
      ProgressActionSchema.parse({
        action: "markRead",
        lessonId: "b1-atoms-charge",
      })
    ).toEqual({ action: "markRead", lessonId: "b1-atoms-charge" });

    expect(
      ProgressActionSchema.parse({
        action: "submitQuiz",
        lessonId: "b1-atoms-charge",
        answers: [0, 1, 1],
      })
    ).toEqual({
      action: "submitQuiz",
      lessonId: "b1-atoms-charge",
      answers: [0, 1, 1],
    });

    expect(
      ProgressActionSchema.parse({
        action: "markLabComplete",
        lessonId: "b3-ohms-law",
      })
    ).toEqual({ action: "markLabComplete", lessonId: "b3-ohms-law" });

    expect(
      ProgressActionSchema.parse({
        action: "enrollTrack",
        trackId: "robotics",
        enrolled: true,
      })
    ).toEqual({ action: "enrollTrack", trackId: "robotics", enrolled: true });

    expect(ProgressActionSchema.parse({ action: "reset" })).toEqual({
      action: "reset",
    });

    expect(
      ProgressActionSchema.parse({
        action: "import",
        data: {
          progress: [{ lessonId: "b1-atoms-charge", status: "completed" }],
          tracks: [{ trackId: "embedded-ai", enrolled: false }],
        },
      })
    ).toEqual({
      action: "import",
      data: {
        progress: [{ lessonId: "b1-atoms-charge", status: "completed" }],
        tracks: [{ trackId: "embedded-ai", enrolled: false }],
      },
    });
  });

  it("rejects an unknown action", () => {
    expect(
      ProgressActionSchema.safeParse({ action: "drop", lessonId: "b1" }).success
    ).toBe(false);
  });

  it("rejects empty, blank, and oversized lesson ids", () => {
    expect(
      ProgressActionSchema.safeParse({ action: "markRead", lessonId: "" }).success
    ).toBe(false);
    expect(
      ProgressActionSchema.safeParse({ action: "markRead", lessonId: "   " })
        .success
    ).toBe(false);
    expect(
      ProgressActionSchema.safeParse({
        action: "markRead",
        lessonId: "x".repeat(201),
      }).success
    ).toBe(false);
  });

  it("trims lesson ids", () => {
    expect(
      ProgressActionSchema.parse({ action: "markRead", lessonId: "  b1  " })
    ).toEqual({ action: "markRead", lessonId: "b1" });
  });

  it("rejects quiz answers that are not small nonnegative integers", () => {
    const base = { action: "submitQuiz" as const, lessonId: "b1" };
    expect(ProgressActionSchema.safeParse({ ...base, answers: [-1] }).success).toBe(
      false
    );
    expect(
      ProgressActionSchema.safeParse({ ...base, answers: [1.5] }).success
    ).toBe(false);
    expect(ProgressActionSchema.safeParse({ ...base, answers: [21] }).success).toBe(
      false
    );
    expect(
      ProgressActionSchema.safeParse({ ...base, answers: Array(51).fill(0) })
        .success
    ).toBe(false);
    expect(ProgressActionSchema.parse({ ...base, answers: [0, 20] })).toEqual({
      action: "submitQuiz",
      lessonId: "b1",
      answers: [0, 20],
    });
  });

  it("rejects an unknown track id", () => {
    expect(
      ProgressActionSchema.safeParse({
        action: "enrollTrack",
        trackId: "aviation",
        enrolled: true,
      }).success
    ).toBe(false);
  });
});

describe("ImportProgressDataSchema", () => {
  it.each(lessonStatuses)("accepts status %s", (status) => {
    const parsed = ImportProgressDataSchema.parse({
      progress: [{ lessonId: "b1-atoms-charge", status }],
      tracks: [],
    });
    expect(parsed.progress[0]?.status).toBe(status);
  });

  it("rejects an unknown import status", () => {
    expect(
      ImportProgressDataSchema.safeParse({
        progress: [{ lessonId: "b1-atoms-charge", status: "finished" }],
        tracks: [],
      }).success
    ).toBe(false);
    expect(
      ImportProgressDataSchema.safeParse({
        progress: [{ lessonId: "b1-atoms-charge", status: "COMPLETE" }],
        tracks: [],
      }).success
    ).toBe(false);
  });

  it("rejects quiz scores outside 0-100 and accepts null", () => {
    expect(
      ImportProgressDataSchema.safeParse({
        progress: [
          { lessonId: "b1-atoms-charge", status: "completed", quizScore: 101 },
        ],
        tracks: [],
      }).success
    ).toBe(false);
    expect(
      ImportProgressDataSchema.safeParse({
        progress: [
          { lessonId: "b1-atoms-charge", status: "completed", quizScore: -1 },
        ],
        tracks: [],
      }).success
    ).toBe(false);
    expect(
      ImportProgressDataSchema.parse({
        progress: [
          { lessonId: "b1-atoms-charge", status: "completed", quizScore: null },
        ],
        tracks: [],
      }).progress[0]?.quizScore
    ).toBeNull();
  });
});

describe("SettingsUpdateSchema", () => {
  it("trims a model name and rejects empty or oversized values", () => {
    expect(SettingsUpdateSchema.parse({ ollamaModel: "  llama3.2:3b  " })).toEqual({
      ollamaModel: "llama3.2:3b",
    });
    expect(SettingsUpdateSchema.safeParse({ ollamaModel: "   " }).success).toBe(false);
    expect(
      SettingsUpdateSchema.safeParse({ ollamaModel: "m".repeat(129) }).success
    ).toBe(false);
  });
});
