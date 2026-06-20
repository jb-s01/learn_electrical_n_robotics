import fs from "fs";
import path from "path";
import matter from "gray-matter";

const lessonsDir = path.join(/* turbopackIgnore: true */ process.cwd(), "content/lessons");

export type LessonFrontmatter = {
  title: string;
  description?: string;
  lessonId: string;
};

export function getLessonContent(slug: string) {
  const filePath = path.join(lessonsDir, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) {
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
  const filePath = path.join(/* turbopackIgnore: true */ process.cwd(), "content/circuits", filename);
  if (!fs.existsSync(filePath)) return null;
  return fs.readFileSync(filePath, "utf-8");
}
