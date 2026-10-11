import fs from "fs";
import path from "path";
import matter from "gray-matter";

const lessonsDir = path.join(/* turbopackIgnore: true */ process.cwd(), "content/lessons");

const LESSON_SLUG_PATTERN = /^[\w-]+$/;
const CIRCUIT_FILENAME_PATTERN = /^[\w-]+\.txt$/;

function isInsideBase(baseDir: string, filePath: string): boolean {
  const base = path.resolve(baseDir);
  const resolved = path.resolve(filePath);
  return resolved.startsWith(base + path.sep);
}

export type LessonFrontmatter = {
  title: string;
  description?: string;
  lessonId: string;
};

export function getLessonContent(slug: string) {
  if (!LESSON_SLUG_PATTERN.test(slug)) return null;
  const filePath = path.join(lessonsDir, `${slug}.mdx`);
  if (!isInsideBase(lessonsDir, filePath) || !fs.existsSync(filePath)) {
    return null;
  }
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  return {
    frontmatter: data as LessonFrontmatter,
    content,
  };
}

export function getAllLessonSlugs(): string[] {
  if (!fs.existsSync(lessonsDir)) return [];
  return fs
    .readdirSync(lessonsDir)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""));
}

export function getCircuitContent(filename: string): string | null {
  if (!CIRCUIT_FILENAME_PATTERN.test(filename)) return null;
  const circuitsDir = path.join(/* turbopackIgnore: true */ process.cwd(), "content/circuits");
  const filePath = path.join(circuitsDir, filename);
  if (!isInsideBase(circuitsDir, filePath) || !fs.existsSync(filePath)) return null;
  return fs.readFileSync(filePath, "utf-8");
}
