import { z } from "zod";

export const LessonCompletionSchema = z.object({
  quizMinScore: z.number().min(0).max(100).default(80),
  requiresLab: z.boolean().default(false),
  requiresRead: z.boolean().default(true),
});

export const LessonSchema = z.object({
  id: z.string(),
  slug: z.string(),
  level: z.enum(["beginner", "intermediate", "advanced"]),
  module: z.string(),
  moduleTitle: z.string(),
  title: z.string(),
  description: z.string(),
  learningObjectives: z.array(z.string()),
  prerequisites: z.array(z.string()),
  completion: LessonCompletionSchema,
  tracks: z.array(z.enum(["robotics", "embedded-ai"])).default([]),
  circuitFile: z.string().optional(),
  order: z.number(),
});

export const ModuleSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  level: z.enum(["beginner", "intermediate", "advanced"]),
  order: z.number(),
});

export const TrackSchema = z.object({
  id: z.enum(["robotics", "embedded-ai"]),
  title: z.string(),
  description: z.string(),
  minLevel: z.enum(["intermediate", "advanced"]),
});

export const CurriculumSchema = z.object({
  modules: z.array(ModuleSchema),
  lessons: z.array(LessonSchema),
  tracks: z.array(TrackSchema),
});

export type Lesson = z.infer<typeof LessonSchema>;
export type Module = z.infer<typeof ModuleSchema>;
export type Track = z.infer<typeof TrackSchema>;
export type Curriculum = z.infer<typeof CurriculumSchema>;
export type LessonCompletion = z.infer<typeof LessonCompletionSchema>;

export type Level = Lesson["level"];
export type TrackId = Track["id"];
