import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lock, CheckCircle2, Circle, PlayCircle } from "lucide-react";
import type { Lesson } from "@/lib/curriculum/types";
import type { LessonStatus } from "@/lib/db/schema";

const statusConfig: Record<
  LessonStatus,
  { label: string; variant: "default" | "success" | "warning" | "info" | "locked"; icon: typeof Circle }
> = {
  locked: { label: "Locked", variant: "locked", icon: Lock },
  available: { label: "Available", variant: "info", icon: PlayCircle },
  in_progress: { label: "In Progress", variant: "warning", icon: Circle },
  completed: { label: "Completed", variant: "success", icon: CheckCircle2 },
};

export function LessonCard({
  lesson,
  status,
}: {
  lesson: Lesson;
  status: LessonStatus;
}) {
  const config = statusConfig[status];
  const Icon = config.icon;
  const isLocked = status === "locked";

  const content = (
    <Card className={`transition-shadow ${!isLocked ? "hover:shadow-md" : "opacity-60"}`}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base">{lesson.title}</CardTitle>
          <Badge variant={config.variant} className="shrink-0 gap-1">
            <Icon className="h-3 w-3" />
            {config.label}
          </Badge>
        </div>
        <CardDescription>{lesson.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-zinc-500">{lesson.moduleTitle} · {lesson.module}</p>
      </CardContent>
    </Card>
  );

  if (isLocked) return content;
  return <Link href={`/lesson/${lesson.slug}`}>{content}</Link>;
}

export function ModuleCard({
  moduleId,
  title,
  description,
  completed,
  total,
  level,
}: {
  moduleId: string;
  title: string;
  description: string;
  completed: number;
  total: number;
  level: string;
}) {
  return (
    <Link href={`/path/${level}?module=${moduleId}`}>
      <Card className="h-full transition-shadow hover:shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <Badge variant="info">{moduleId}</Badge>
            <span className="text-sm text-zinc-500">
              {completed}/{total}
            </span>
          </div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
      </Card>
    </Link>
  );
}
