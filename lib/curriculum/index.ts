import curriculumData from "@/content/curriculum.json";
import {
  CurriculumSchema,
  type Curriculum,
  type Lesson,
  type Level,
  type TrackId,
} from "./types";
import type { LessonStatus } from "@/lib/db/schema";

export const curriculum: Curriculum = CurriculumSchema.parse(curriculumData);

export function getLessonBySlug(slug: string): Lesson | undefined {
  return curriculum.lessons.find((l) => l.slug === slug);
}

export function getLessonById(id: string): Lesson | undefined {
  return curriculum.lessons.find((l) => l.id === id);
}

export function getLessonsByLevel(level: Level): Lesson[] {
  return curriculum.lessons
    .filter((l) => l.level === level && l.tracks.length === 0)
    .sort((a, b) => a.order - b.order);
}

export function getLessonsByModule(moduleId: string): Lesson[] {
  return curriculum.lessons
    .filter((l) => l.module === moduleId && l.tracks.length === 0)
    .sort((a, b) => a.order - b.order);
}

export function getTrackLessons(
  trackId: TrackId,
  level?: Level
): Lesson[] {
  return curriculum.lessons
    .filter(
      (l) =>
        l.tracks.includes(trackId) && (level ? l.level === level : true)
    )
    .sort((a, b) => a.order - b.order);
}

export function getModule(moduleId: string) {
  return curriculum.modules.find((m) => m.id === moduleId);
}

export function getModulesByLevel(level: Level) {
  return curriculum.modules
    .filter((m) => m.level === level)
    .sort((a, b) => a.order - b.order);
}

export type ProgressMap = Record<
  string,
  {
    status: LessonStatus;
    quizScore?: number | null;
    labComplete?: boolean | null;
    readSections?: boolean | null;
  }
>;

export function isPrerequisiteSatisfied(
  prereqId: string,
  progress: ProgressMap
): boolean {
  const prereqLesson = getLessonById(prereqId);
  if (!prereqLesson) return false;

  const stored = progress[prereqId];
  if (!stored) return false;
  if (stored.status === "completed") return true;

  return isLessonComplete(prereqLesson, progress);
}

export function prerequisitesMet(
  lesson: Lesson,
  progress: ProgressMap
): boolean {
  if (lesson.prerequisites.length === 0) return true;
  return lesson.prerequisites.every((id) =>
    isPrerequisiteSatisfied(id, progress)
  );
}

export function canAccessLesson(
  lesson: Lesson,
  progress: ProgressMap,
  enrolledTracks: TrackId[]
): boolean {
  return getLessonStatus(lesson, progress, enrolledTracks) !== "locked";
}

export function canNavigateToNext(
  current: Lesson,
  next: Lesson,
  progress: ProgressMap,
  enrolledTracks: TrackId[]
): boolean {
  if (canAccessLesson(next, progress, enrolledTracks)) return true;

  // Allow advancing when the only unmet requirement is the current lesson
  // and the learner has finished its completion criteria.
  const blockedPrereqs = next.prerequisites.filter(
    (id) => !isPrerequisiteSatisfied(id, progress)
  );
  if (
    blockedPrereqs.length === 1 &&
    blockedPrereqs[0] === current.id &&
    isLessonComplete(current, progress)
  ) {
    return true;
  }

  return false;
}

export function getLessonStatus(
  lesson: Lesson,
  progress: ProgressMap,
  enrolledTracks: TrackId[]
): LessonStatus {
  if (lesson.tracks.length > 0) {
    const enrolled = lesson.tracks.some((t) => enrolledTracks.includes(t));
    if (!enrolled) return "locked";
  }

  if (!prerequisitesMet(lesson, progress)) return "locked";

  const stored = progress[lesson.id];
  if (stored?.status === "completed") return "completed";
  if (stored?.status === "in_progress") return "in_progress";
  return "available";
}

export function isLessonComplete(
  lesson: Lesson,
  progress: ProgressMap
): boolean {
  const stored = progress[lesson.id];
  if (!stored) return false;

  const quizOk =
    !lesson.completion.quizMinScore ||
    (stored.quizScore ?? 0) >= lesson.completion.quizMinScore;
  const labOk = !lesson.completion.requiresLab || !!stored.labComplete;
  const readOk = !lesson.completion.requiresRead || !!stored.readSections;

  return quizOk && labOk && readOk;
}

export function getFirstAvailableLesson(
  progress: ProgressMap,
  enrolledTracks: TrackId[]
): Lesson | undefined {
  const sorted = [...curriculum.lessons].sort((a, b) => a.order - b.order);
  for (const lesson of sorted) {
    const status = getLessonStatus(lesson, progress, enrolledTracks);
    if (status === "available" || status === "in_progress") {
      return lesson;
    }
  }
  return sorted.find(
    (l) => getLessonStatus(l, progress, enrolledTracks) === "completed"
  );
}

export function getLevelProgress(
  level: Level,
  progress: ProgressMap,
  enrolledTracks: TrackId[]
) {
  const lessons = getLessonsByLevel(level);
  const completed = lessons.filter(
    (l) => getLessonStatus(l, progress, enrolledTracks) === "completed"
  ).length;
  return { completed, total: lessons.length };
}

export function getOverallProgress(
  progress: ProgressMap,
  enrolledTracks: TrackId[]
) {
  const coreLessons = curriculum.lessons.filter((l) => l.tracks.length === 0);
  const completed = coreLessons.filter(
    (l) => getLessonStatus(l, progress, enrolledTracks) === "completed"
  ).length;
  return { completed, total: coreLessons.length };
}

/** Ordered lesson sequence for prev/next navigation within core path or a track. */
export function getLessonSequence(lesson: Lesson): Lesson[] {
  if (lesson.tracks.length > 0) {
    return getTrackLessons(lesson.tracks[0]);
  }
  return curriculum.lessons
    .filter((l) => l.tracks.length === 0)
    .sort((a, b) => a.order - b.order);
}

export function getAdjacentLessons(lesson: Lesson): {
  previous: Lesson | null;
  next: Lesson | null;
} {
  const sequence = getLessonSequence(lesson);
  const index = sequence.findIndex((l) => l.id === lesson.id);

  if (index === -1) {
    return { previous: null, next: null };
  }

  return {
    previous: index > 0 ? sequence[index - 1] : null,
    next: index < sequence.length - 1 ? sequence[index + 1] : null,
  };
}
