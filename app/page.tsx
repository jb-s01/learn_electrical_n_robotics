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
import { ArrowRight, BookOpen, Bot, Layers, Sparkles } from "lucide-react";
import { HoverLift, Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { HeroCircuit } from "@/components/visuals/HeroCircuit";

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
      <section className="relative mb-8 overflow-hidden rounded-3xl border border-zinc-200 bg-gradient-to-br from-white via-blue-50/60 to-cyan-50/60 px-6 py-12 dark:border-zinc-800 dark:from-zinc-950 dark:via-blue-950/20 dark:to-cyan-950/10 sm:px-10">
        <HeroCircuit />
        <div className="relative max-w-xl">
          <Reveal>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-white/80 px-3 py-1 text-xs font-medium text-blue-700 backdrop-blur dark:border-blue-900 dark:bg-zinc-950/70 dark:text-blue-300">
              <Sparkles className="h-3.5 w-3.5" /> Interactive, visual, hands-on
            </span>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
              Welcome to{" "}
              <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                ElectroLearn
              </span>
            </h1>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mt-3 text-lg text-zinc-600 dark:text-zinc-400">
              Learn electronics visually — from atoms to advanced embedded systems
            </p>
          </Reveal>
          {continueLesson && (
            <Reveal delay={0.24}>
              <Link href={`/lesson/${continueLesson.slug}`} className="mt-6 inline-block">
                <Button size="lg" className="gap-2 shadow-lg shadow-blue-600/20">
                  Continue: {continueLesson.title} <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </Reveal>
          )}
        </div>
      </section>

      <Reveal className="grid gap-6 lg:grid-cols-3">
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
      </Reveal>

      <section className="mt-10">
        <Reveal>
          <h2 className="mb-4 text-xl font-semibold">Beginner Modules</h2>
        </Reveal>
        <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {beginnerModules.map((mod) => {
            const lessons = getLessonsByModule(mod.id);
            const completed = lessons.filter(
              (l) => getLessonStatus(l, progress, enrolledTracks) === "completed"
            ).length;
            return (
              <StaggerItem key={mod.id}>
                <ModuleCard
                  moduleId={mod.id}
                  title={mod.title}
                  description={mod.description}
                  completed={completed}
                  total={lessons.length}
                  level="beginner"
                />
              </StaggerItem>
            );
          })}
        </Stagger>
      </section>

      <section className="mt-10">
        <Reveal>
          <h2 className="mb-4 text-xl font-semibold">Learning Paths</h2>
        </Reveal>
        <Stagger className="grid gap-4 sm:grid-cols-3">
          {(["beginner", "intermediate", "advanced"] as const).map((level) => {
            const lp = getLevelProgress(level, progress, enrolledTracks);
            const pct = lp.total > 0 ? (lp.completed / lp.total) * 100 : 0;
            return (
              <StaggerItem key={level}>
                <Link href={`/path/${level}`} className="block h-full">
                  <HoverLift>
                    <Card className="h-full transition-shadow hover:border-blue-200 hover:shadow-md dark:hover:border-blue-900">
                      <CardHeader>
                        <CardTitle className="capitalize">{level}</CardTitle>
                        <CardDescription>
                          {lp.completed}/{lp.total} lessons complete
                        </CardDescription>
                        <div className="mt-2 h-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                          <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400" style={{ width: `${pct}%` }} />
                        </div>
                      </CardHeader>
                    </Card>
                  </HoverLift>
                </Link>
              </StaggerItem>
            );
          })}
        </Stagger>
      </section>
    </div>
  );
}
