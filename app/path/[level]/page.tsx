import { notFound } from "next/navigation";
import {
  getModulesByLevel,
  getLessonsByModule,
  getTrackLessons,
  getLessonStatus,
  type ProgressMap,
} from "@/lib/curriculum";
import type { Level } from "@/lib/curriculum/types";
import { getProgressData } from "@/lib/progress/service";
import { LessonCard } from "@/components/progress/ModuleCard";
import { Badge } from "@/components/ui/badge";
import { Stagger, StaggerItem } from "@/components/motion/Reveal";

const validLevels: Level[] = ["beginner", "intermediate", "advanced"];

export default async function PathPage({
  params,
  searchParams,
}: {
  params: Promise<{ level: string }>;
  searchParams: Promise<{ module?: string }>;
}) {
  const { level } = await params;
  const { module: moduleFilter } = await searchParams;

  if (!validLevels.includes(level as Level)) notFound();

  const { progress, enrolledTracks } = await getProgressData();
  const modules = getModulesByLevel(level as Level);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8">
        <Badge variant="info" className="mb-2 capitalize">
          {level} path
        </Badge>
        <h1 className="text-3xl font-bold capitalize">{level} Curriculum</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Complete lessons in order — each unlocks when prerequisites are met.
        </p>
      </div>

      {modules.map((mod) => {
        if (moduleFilter && mod.id !== moduleFilter) return null;
        const lessons = getLessonsByModule(mod.id);
        return (
          <section key={mod.id} className="mb-10">
            <h2 className="mb-1 text-xl font-semibold">
              {mod.id}: {mod.title}
            </h2>
            <p className="mb-4 text-sm text-zinc-500">{mod.description}</p>
            <Stagger className="grid gap-3">
              {lessons.map((lesson) => (
                <StaggerItem key={lesson.id}>
                  <LessonCard
                    lesson={lesson}
                    status={getLessonStatus(lesson, progress as ProgressMap, enrolledTracks)}
                  />
                </StaggerItem>
              ))}
            </Stagger>
          </section>
        );
      })}

      {(level === "intermediate" || level === "advanced") && (
        <section className="mt-12 border-t border-zinc-200 pt-8 dark:border-zinc-800">
          <h2 className="mb-4 text-xl font-semibold">Optional Track Lessons</h2>
          <p className="mb-4 text-sm text-zinc-500">
            Enroll in tracks from the{" "}
            <a href="/tracks" className="text-blue-600 hover:underline">
              Tracks page
            </a>{" "}
            to unlock these lessons.
          </p>
          {(["robotics", "embedded-ai"] as const).map((trackId) => {
            const trackLessons = getTrackLessons(trackId, level as Level);
            if (trackLessons.length === 0) return null;
            return (
              <div key={trackId} className="mb-8">
                <h3 className="mb-3 font-medium capitalize">
                  {trackId.replace("-", " ")} track
                </h3>
                <Stagger className="grid gap-3">
                  {trackLessons.map((lesson) => (
                    <StaggerItem key={lesson.id}>
                      <LessonCard
                        lesson={lesson}
                        status={getLessonStatus(
                          lesson,
                          progress as ProgressMap,
                          enrolledTracks
                        )}
                      />
                    </StaggerItem>
                  ))}
                </Stagger>
              </div>
            );
          })}
        </section>
      )}
    </div>
  );
}
