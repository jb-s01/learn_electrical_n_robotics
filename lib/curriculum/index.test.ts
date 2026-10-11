import { describe, expect, it } from "vitest";
import {
  canAccessLesson,
  canNavigateToNext,
  getLessonById,
  getLessonStatus,
  isLessonComplete,
  type ProgressMap,
} from "@/lib/curriculum";
import type { Lesson } from "@/lib/curriculum/types";

function lesson(id: string): Lesson {
  const found = getLessonById(id);
  if (!found) {
    throw new Error(`Missing lesson ${id}`);
  }
  return found;
}

const atoms = lesson("b1-atoms-charge");
const voltage = lesson("b1-voltage-current");
const power = lesson("b1-power-units");
const ohms = lesson("b3-ohms-law");
const kinematics = lesson("r-i1-kinematics");

function stored(
  status: ProgressMap[string]["status"],
  extra: Omit<ProgressMap[string], "status"> = {}
): ProgressMap[string] {
  return { status, ...extra };
}

describe("curriculum gating", () => {
  it("starts the core path on the first lesson and locks what follows", () => {
    expect(getLessonStatus(atoms, {}, [])).toBe("available");
    expect(getLessonStatus(voltage, {}, [])).toBe("locked");
    expect(canAccessLesson(atoms, {}, [])).toBe(true);
    expect(canAccessLesson(voltage, {}, [])).toBe(false);
  });

  it("unlocks the next lesson once its prerequisite is completed", () => {
    const progress: ProgressMap = {
      [atoms.id]: stored("completed", { quizScore: 100, readSections: true }),
    };

    expect(getLessonStatus(voltage, progress, [])).toBe("available");
    expect(canNavigateToNext(atoms, voltage, progress, [])).toBe(true);
  });

  it("treats met completion criteria as a satisfied prerequisite", () => {
    const progress: ProgressMap = {
      [atoms.id]: stored("in_progress", { quizScore: 80, readSections: true }),
    };

    expect(isLessonComplete(atoms, progress)).toBe(true);
    expect(getLessonStatus(voltage, progress, [])).toBe("available");
  });

  it("keeps the next lesson locked when the quiz score is below the minimum", () => {
    const progress: ProgressMap = {
      [atoms.id]: stored("in_progress", { quizScore: 67, readSections: true }),
    };

    expect(isLessonComplete(atoms, progress)).toBe(false);
    expect(getLessonStatus(voltage, progress, [])).toBe("locked");
    expect(canNavigateToNext(atoms, voltage, progress, [])).toBe(false);
  });

  it("does not skip an earlier unmet prerequisite", () => {
    const progress: ProgressMap = {
      [atoms.id]: stored("completed", { quizScore: 100, readSections: true }),
    };

    expect(getLessonStatus(power, progress, [])).toBe("locked");
    expect(canNavigateToNext(atoms, power, progress, [])).toBe(false);
  });

  it("requires the lab checkpoint before a lab lesson is complete", () => {
    const readAndPassed: ProgressMap = {
      [ohms.id]: stored("in_progress", {
        quizScore: 100,
        readSections: true,
        labComplete: false,
      }),
    };
    const withLab: ProgressMap = {
      [ohms.id]: stored("in_progress", {
        quizScore: 100,
        readSections: true,
        labComplete: true,
      }),
    };

    expect(isLessonComplete(ohms, readAndPassed)).toBe(false);
    expect(isLessonComplete(ohms, withLab)).toBe(true);
  });

  it("locks a track lesson until that track is enrolled and its prerequisite is done", () => {
    const prereqMet: ProgressMap = {
      "i5-pwm": stored("completed", { quizScore: 100, readSections: true }),
    };

    expect(getLessonStatus(kinematics, prereqMet, [])).toBe("locked");
    expect(getLessonStatus(kinematics, prereqMet, ["embedded-ai"])).toBe("locked");
    expect(getLessonStatus(kinematics, {}, ["robotics"])).toBe("locked");
    expect(getLessonStatus(kinematics, prereqMet, ["robotics"])).toBe("available");
    expect(canAccessLesson(kinematics, prereqMet, ["robotics"])).toBe(true);
  });

  it("keeps stored in-progress and completed statuses once the lesson is accessible", () => {
    const progress: ProgressMap = {
      [atoms.id]: stored("completed", { quizScore: 100, readSections: true }),
      [voltage.id]: stored("in_progress", { quizScore: 67, readSections: true }),
    };

    expect(getLessonStatus(atoms, progress, [])).toBe("completed");
    expect(getLessonStatus(voltage, progress, [])).toBe("in_progress");
  });
});
