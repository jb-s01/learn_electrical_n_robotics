import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const userProfile = sqliteTable("user_profile", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const lessonProgress = sqliteTable("lesson_progress", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id")
    .notNull()
    .references(() => userProfile.id),
  lessonId: text("lesson_id").notNull(),
  status: text("status", {
    enum: ["locked", "available", "in_progress", "completed"],
  })
    .notNull()
    .default("locked"),
  quizScore: integer("quiz_score"),
  labComplete: integer("lab_complete", { mode: "boolean" }).default(false),
  readSections: integer("read_sections", { mode: "boolean" }).default(false),
  completedAt: integer("completed_at", { mode: "timestamp" }),
});

export const quizAttempts = sqliteTable("quiz_attempts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id")
    .notNull()
    .references(() => userProfile.id),
  lessonId: text("lesson_id").notNull(),
  score: integer("score").notNull(),
  totalQuestions: integer("total_questions").notNull(),
  attemptedAt: integer("attempted_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const trackEnrollment = sqliteTable("track_enrollment", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id")
    .notNull()
    .references(() => userProfile.id),
  trackId: text("track_id", { enum: ["robotics", "embedded-ai"] }).notNull(),
  enrolled: integer("enrolled", { mode: "boolean" }).notNull().default(false),
  enrolledAt: integer("enrolled_at", { mode: "timestamp" }),
});

export const userSettings = sqliteTable("user_settings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id")
    .notNull()
    .references(() => userProfile.id)
    .unique(),
  ollamaModel: text("ollama_model").default("llama3.2:3b"),
});

export type LessonStatus =
  | "locked"
  | "available"
  | "in_progress"
  | "completed";

export type TrackId = "robotics" | "embedded-ai";
