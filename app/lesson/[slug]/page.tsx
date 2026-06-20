import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getLessonBySlug } from "@/lib/curriculum";
import { getLessonContent } from "@/lib/content/lessons";
import { getProgressData } from "@/lib/progress/service";
import { getLessonStatus, getAdjacentLessons, canNavigateToNext } from "@/lib/curriculum";
import { mdxComponents } from "@/lib/mdx/mdx-components";
import { getQuizForLesson } from "@/lib/curriculum/quizzes";
import { CircuitSimulator } from "@/components/simulator/CircuitSimulator";
import { QuizBlock } from "@/components/lesson/QuizBlock";
import { LessonNavigation } from "@/components/lesson/LessonNavigation";
import { TutorChat } from "@/components/chat/TutorChat";
import { LessonReader } from "@/components/lesson/LessonReader";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const lesson = getLessonBySlug(slug);
  if (!lesson) notFound();

  const content = getLessonContent(slug);
  if (!content) notFound();

  const { progress, enrolledTracks } = await getProgressData();
  const status = getLessonStatus(lesson, progress, enrolledTracks);

  if (status === "locked") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Lesson Locked</h1>
        <p className="mt-2 text-zinc-500">
          Complete the prerequisite lessons before accessing &quot;{lesson.title}&quot;.
        </p>
        <Link href={`/path/${lesson.level}`} className="mt-4 inline-block text-blue-600 hover:underline">
          ← Back to {lesson.level} path
        </Link>
      </div>
    );
  }

  const trackContext = enrolledTracks.includes("robotics")
    ? "robotics"
    : enrolledTracks.includes("embedded-ai")
      ? "embedded-ai"
      : null;

  const quizQuestions = getQuizForLesson(lesson.id);
  const { previous, next } = getAdjacentLessons(lesson);
  const initialNextAccessible = next
    ? canNavigateToNext(lesson, next, progress, enrolledTracks)
    : false;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <LessonReader lessonId={lesson.id} />

      <Link
        href={`/path/${lesson.level}`}
        className="mb-4 inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
      >
        <ChevronLeft className="h-4 w-4" /> Back to {lesson.level} path
      </Link>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Badge variant="info">{lesson.module}</Badge>
        <Badge variant={status === "completed" ? "success" : "default"} className="capitalize">
          {status.replace("_", " ")}
        </Badge>
        {lesson.tracks.map((t) => (
          <Badge key={t} variant="warning" className="capitalize">
            {t.replace("-", " ")}
          </Badge>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <article className="prose-container lg:col-span-2">
          <h1 className="mb-2 text-3xl font-bold">{lesson.title}</h1>
          <p className="mb-6 text-zinc-600 dark:text-zinc-400">{lesson.description}</p>
          <MDXRemote
            source={content.content}
            components={{
              ...mdxComponents,
              CircuitSimulator: (props) => (
                <CircuitSimulator {...props} lessonId={lesson.id} />
              ),
            }}
          />
          {quizQuestions.length > 0 && (
            <QuizBlock
              lessonId={lesson.id}
              minScore={lesson.completion.quizMinScore}
              questions={quizQuestions}
            />
          )}
          <LessonNavigation
            lesson={lesson}
            previous={previous}
            next={next}
            initialNextAccessible={initialNextAccessible}
          />
        </article>

        <aside className="lg:sticky lg:top-4 lg:self-start">
          <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
            <TutorChat
              compact
              context={{
                lessonId: lesson.id,
                lessonTitle: lesson.title,
                learningObjectives: lesson.learningObjectives,
                optionalTrack: trackContext,
              }}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
