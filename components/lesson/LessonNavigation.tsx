"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Lesson } from "@/lib/curriculum/types";
import {
  canNavigateToNext,
  type ProgressMap,
} from "@/lib/curriculum";

type LessonNavigationProps = {
  lesson: Lesson;
  previous: Lesson | null;
  next: Lesson | null;
  initialNextAccessible: boolean;
};

export function LessonNavigation({
  lesson,
  previous,
  next,
  initialNextAccessible,
}: LessonNavigationProps) {
  const [nextAccessible, setNextAccessible] = useState(initialNextAccessible);

  const refreshAccess = useCallback(async () => {
    if (!next) return;

    try {
      const res = await fetch("/api/progress");
      if (!res.ok) return;
      const data = await res.json();
      const progress = data.progress as ProgressMap;
      const enrolledTracks = data.enrolledTracks ?? [];
      setNextAccessible(
        canNavigateToNext(lesson, next, progress, enrolledTracks)
      );
    } catch {
      // keep current state
    }
  }, [lesson, next]);

  useEffect(() => {
    setNextAccessible(initialNextAccessible);
  }, [initialNextAccessible]);

  useEffect(() => {
    refreshAccess();

    const onProgressUpdated = () => refreshAccess();
    window.addEventListener("lesson-progress-updated", onProgressUpdated);
    return () =>
      window.removeEventListener("lesson-progress-updated", onProgressUpdated);
  }, [refreshAccess]);

  const courseHref =
    lesson.tracks.length > 0
      ? `/path/${lesson.level}`
      : `/path/${lesson.level}?module=${lesson.module}`;

  const courseLabel =
    lesson.tracks.length > 0
      ? `${lesson.level} path`
      : `${lesson.module}: ${lesson.moduleTitle}`;

  return (
    <nav
      aria-label="Lesson navigation"
      className="mt-10 border-t border-zinc-200 pt-6 dark:border-zinc-800"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch sm:justify-between">
        <div className="flex-1">
          {previous ? (
            <Link href={`/lesson/${previous.slug}`} className="group block h-full">
              <div className="flex h-full items-center gap-3 rounded-xl border border-zinc-200 p-4 transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:border-zinc-700 dark:hover:bg-zinc-900/50">
                <ChevronLeft className="h-5 w-5 shrink-0 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300" />
                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                    Previous
                  </p>
                  <p className="truncate font-medium">{previous.title}</p>
                </div>
              </div>
            </Link>
          ) : (
            <div className="flex h-full items-center rounded-xl border border-dashed border-zinc-200 p-4 dark:border-zinc-800">
              <p className="text-sm text-zinc-400">First lesson in this sequence</p>
            </div>
          )}
        </div>

        <Link href={courseHref} className="shrink-0 self-center">
          <Button variant="outline" className="gap-2">
            <List className="h-4 w-4" />
            {courseLabel}
          </Button>
        </Link>

        <div className="flex-1">
          {next ? (
            nextAccessible ? (
              <Link href={`/lesson/${next.slug}`} className="group block h-full">
                <div className="flex h-full items-center justify-end gap-3 rounded-xl border border-zinc-200 p-4 transition-colors hover:border-blue-300 hover:bg-blue-50 dark:border-zinc-800 dark:hover:border-blue-900 dark:hover:bg-blue-950/30">
                  <div className="min-w-0 text-right">
                    <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                      Next
                    </p>
                    <p className="truncate font-medium group-hover:text-blue-700 dark:group-hover:text-blue-300">
                      {next.title}
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 shrink-0 text-zinc-400 group-hover:text-blue-600" />
                </div>
              </Link>
            ) : (
              <div className="flex h-full items-center justify-end gap-3 rounded-xl border border-dashed border-zinc-200 p-4 dark:border-zinc-800">
                <div className="min-w-0 text-right">
                  <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                    Next
                  </p>
                  <p className="truncate text-sm text-zinc-400">
                    {next.title} — finish this lesson&apos;s quiz and reading to unlock
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 shrink-0 text-zinc-300" />
              </div>
            )
          ) : (
            <div className="flex h-full items-center justify-end rounded-xl border border-dashed border-zinc-200 p-4 dark:border-zinc-800">
              <p className="text-sm text-zinc-400">Last lesson in this sequence</p>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
