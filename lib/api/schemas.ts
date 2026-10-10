import { z } from "zod";

export const LessonStatusSchema = z.enum([
  "locked",
  "available",
  "in_progress",
  "completed",
]);

export const TrackIdSchema = z.enum(["robotics", "embedded-ai"]);

const lessonIdSchema = z.string().trim().min(1).max(200);

const answerSchema = z.number().int().nonnegative().max(20);

export const MarkReadSchema = z.object({
  action: z.literal("markRead"),
  lessonId: lessonIdSchema,
});

export const SubmitQuizSchema = z.object({
  action: z.literal("submitQuiz"),
  lessonId: lessonIdSchema,
  answers: z.array(answerSchema).max(50),
});

export const MarkLabCompleteSchema = z.object({
  action: z.literal("markLabComplete"),
  lessonId: lessonIdSchema,
});

export const EnrollTrackSchema = z.object({
  action: z.literal("enrollTrack"),
  trackId: TrackIdSchema,
  enrolled: z.boolean(),
});

export const ResetProgressSchema = z.object({
  action: z.literal("reset"),
});

export const ImportProgressItemSchema = z.object({
  lessonId: lessonIdSchema,
  status: LessonStatusSchema,
  quizScore: z.number().int().min(0).max(100).nullable().optional(),
  labComplete: z.boolean().nullable().optional(),
  readSections: z.boolean().nullable().optional(),
});

export const ImportTrackSchema = z.object({
  trackId: TrackIdSchema,
  enrolled: z.boolean(),
});

export const ImportProgressDataSchema = z.object({
  progress: z.array(ImportProgressItemSchema).max(500),
  tracks: z.array(ImportTrackSchema).max(20),
});

export const ImportProgressSchema = z.object({
  action: z.literal("import"),
  data: ImportProgressDataSchema,
});

export const ProgressActionSchema = z.discriminatedUnion("action", [
  MarkReadSchema,
  SubmitQuizSchema,
  MarkLabCompleteSchema,
  EnrollTrackSchema,
  ResetProgressSchema,
  ImportProgressSchema,
]);

export const SettingsUpdateSchema = z.object({
  ollamaModel: z.string().trim().min(1).max(128),
});

export type ProgressAction = z.infer<typeof ProgressActionSchema>;
export type ImportProgressData = z.infer<typeof ImportProgressDataSchema>;
export type SettingsUpdate = z.infer<typeof SettingsUpdateSchema>;
