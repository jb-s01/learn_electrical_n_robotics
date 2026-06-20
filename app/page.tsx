import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProgressRing } from "@/components/progress/ProgressRing";
import { ModuleCard } from "@/components/progress/ModuleCard";
import { OllamaStatus } from "@/components/chat/OllamaStatus";
import {
  curriculum,
  getFirstAvailableLesson,
  getLevelProgress,
  getOverallProgress,
  getModulesByLevel,
  getLessonsByModule,
  getLessonStatus,
} from "@/lib/curriculum";
import { getProgressData } from "@/lib/progress/service";
import { ArrowRight, BookOpen, Bot, Layers } from "lucide-react";

export default async function DashboardPage() {
  const { progress, enrolledTracks } = await getProgressData();
  const overall = getOverallProgress(progress, enrolledTracks);
  const beginner = getLevelProgress("beginner", progress, enrolledTracks);
  const intermediate = getLevelProgress("intermediate", progress, enrolledTracks);
  const advanced = getLevelProgress("advanced", progress, enrolledTracks);
  const continueLesson = getFirstAvailableLesson(progress, enrolledTracks);

  const beginnerModules = getModulesByLevel("beginner");

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Welcome to ElectroLearn</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Learn electronics visually — from atoms to advanced embedded systems
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Your Progress</CardTitle>
            <CardDescription>Core curriculum completion</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center gap-8">
              <ProgressRing
                completed={overall.completed}
                total={overall.total}
                label="core lessons"
              />
              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-medium">Beginner:</span>{" "}
                  {beginner.completed}/{beginner.total}
                </p>
                <p>
                  <span className="font-medium">Intermediate:</span>{" "}
                  {intermediate.completed}/{intermediate.total}
                </p>
                <p>
                  <span className="font-medium">Advanced:</span>{" "}
                  {advanced.completed}/{advanced.total}
                </p>
              </div>
            </div>
            {continueLesson && (
              <div className="mt-6 flex items-center gap-4 rounded-lg bg-blue-50 p-4 dark:bg-blue-950/30">
                <BookOpen className="h-8 w-8 text-blue-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-200">
                    Continue learning
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    {continueLesson.title}
                  </p>
                </div>
                <Link href={`/lesson/${continueLesson.slug}`}>
                  <Button className="gap-2">
                    Continue <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <OllamaStatus />
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/tutor" className="flex items-center gap-2 text-sm hover:text-blue-600">
                <Bot className="h-4 w-4" /> AI Tutor
              </Link>
              <Link href="/tracks" className="flex items-center gap-2 text-sm hover:text-blue-600">
                <Layers className="h-4 w-4" /> Optional Tracks
              </Link>
              <Link href="/path/beginner" className="flex items-center gap-2 text-sm hover:text-blue-600">
                <BookOpen className="h-4 w-4" /> Beginner Path
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      <section className="mt-10">
        <h2 className="mb-4 text-xl font-semibold">Beginner Modules</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {beginnerModules.map((mod) => {
            const lessons = getLessonsByModule(mod.id);
            const completed = lessons.filter(
              (l) => getLessonStatus(l, progress, enrolledTracks) === "completed"
            ).length;
            return (
              <ModuleCard
                key={mod.id}
                moduleId={mod.id}
                title={mod.title}
                description={mod.description}
                completed={completed}
                total={lessons.length}
                level="beginner"
              />
            );
          })}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="mb-4 text-xl font-semibold">Learning Paths</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {(["beginner", "intermediate", "advanced"] as const).map((level) => {
            const lp = getLevelProgress(level, progress, enrolledTracks);
            return (
              <Link key={level} href={`/path/${level}`}>
                <Card className="transition-shadow hover:shadow-md">
                  <CardHeader>
                    <CardTitle className="capitalize">{level}</CardTitle>
                    <CardDescription>
                      {lp.completed}/{lp.total} lessons complete
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
