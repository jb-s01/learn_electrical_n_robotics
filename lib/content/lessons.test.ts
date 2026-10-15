import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { getCircuitContent, getLessonContent } from "@/lib/content/lessons";

const rejectedLessonSlugs = [
  "..",
  ".",
  "../package",
  "../../package",
  "ohms-law/../../../etc/passwd",
  "/etc/passwd",
  "ohms-law.mdx",
  "ohms-law.txt",
  "",
  "ohms-law/ohms-law",
  "..\\..\\package",
  "ohms-law\0",
  "ohms-law%00",
];

const rejectedCircuitFiles = [
  "..",
  "../package.json",
  "../../package.json",
  "..\\..\\package.json",
  "/etc/passwd",
  "ohms-law.mdx",
  "ohms-law.txt/../../package.json",
  "../lessons/ohms-law.mdx",
  "",
  ".txt",
  "ohms-law.TXT",
  "ohms-law.txt ",
];

describe("lesson and circuit path validation", () => {
  it("reads a lesson slug that stays inside content/lessons", () => {
    const lesson = getLessonContent("ohms-law");
    expect(lesson?.frontmatter.lessonId).toBe("b3-ohms-law");
    expect(lesson?.frontmatter.title).toBe("Ohm's Law");
    expect(lesson?.content).toContain("V = I × R");
  });

  it("rejects lesson slugs that leave the lessons directory", () => {
    for (const slug of rejectedLessonSlugs) {
      expect(getLessonContent(slug), slug).toBeNull();
    }
  });

  it("returns null for a well-formed lesson slug that does not exist", () => {
    expect(getLessonContent("not-a-real-lesson")).toBeNull();
  });

  it("reads a circuit filename that stays inside content/circuits", () => {
    const expected = readFileSync(
      path.join(process.cwd(), "content/circuits/ohms-law.txt"),
      "utf8"
    );
    expect(getCircuitContent("ohms-law.txt")).toBe(expected);
  });

  it("rejects circuit filenames that leave the circuits directory", () => {
    for (const filename of rejectedCircuitFiles) {
      expect(getCircuitContent(filename), filename).toBeNull();
    }
  });

  it("returns null for a well-formed circuit filename that does not exist", () => {
    expect(getCircuitContent("not-a-real-circuit.txt")).toBeNull();
  });
});
