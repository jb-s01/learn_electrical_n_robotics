import { readFileSync } from "node:fs";
import path from "node:path";

type CurriculumLesson = {
  id: string;
  prerequisites: string[];
};

/** Lessons that must be completed before `lessonId` is unlocked. */
export function prerequisiteIds(lessonId: string): string[] {
  const file = path.join(process.cwd(), "content", "curriculum.json");
  const curriculum = JSON.parse(readFileSync(file, "utf8")) as {
    lessons: CurriculumLesson[];
  };
  const byId = new Map(curriculum.lessons.map((lesson) => [lesson.id, lesson]));
  const target = byId.get(lessonId);
  if (!target) {
    throw new Error(`Unknown lesson ${lessonId}`);
  }

  const ordered: string[] = [];
  const seen = new Set<string>();

  const visit = (id: string) => {
    if (seen.has(id)) return;
    seen.add(id);
    const lesson = byId.get(id);
    if (!lesson) {
      throw new Error(`Unknown lesson ${id}`);
    }
    for (const prereq of lesson.prerequisites) {
      visit(prereq);
    }
    ordered.push(id);
  };

  for (const prereq of target.prerequisites) {
    visit(prereq);
  }
  return ordered;
}
