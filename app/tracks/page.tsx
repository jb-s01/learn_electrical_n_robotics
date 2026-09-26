"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { curriculum, getTrackLessons } from "@/lib/curriculum";
import { Bot, Cpu } from "lucide-react";
import { Stagger, StaggerItem } from "@/components/motion/Reveal";

export default function TracksPage() {
  const [enrolledTracks, setEnrolledTracks] = useState<string[]>([]);
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/progress")
      .then((r) => r.json())
      .then((data) => setEnrolledTracks(data.enrolledTracks ?? []))
      .catch(console.error);
  }, []);

  const toggleTrack = async (trackId: string, enrolled: boolean) => {
    setLoading(trackId);
    try {
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "enrollTrack", trackId, enrolled }),
      });
      const data = await res.json();
      setEnrolledTracks(data.enrolledTracks ?? []);
    } finally {
      setLoading(null);
    }
  };

  const trackIcons = {
    robotics: Bot,
    "embedded-ai": Cpu,
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-3xl font-bold">Optional Learning Tracks</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        Opt in to specialized tracks at intermediate and advanced levels. These do not block the core curriculum.
      </p>

      <Stagger className="mt-8 space-y-6">
        {curriculum.tracks.map((track) => {
          const Icon = trackIcons[track.id];
          const isEnrolled = enrolledTracks.includes(track.id);
          const lessons = getTrackLessons(track.id);
          const intermediateCount = lessons.filter((l) => l.level === "intermediate").length;
          const advancedCount = lessons.filter((l) => l.level === "advanced").length;

          return (
            <StaggerItem key={track.id}>
              <Card className="transition-shadow hover:shadow-md">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30">
                        <Icon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle>{track.title}</CardTitle>
                        <CardDescription>{track.description}</CardDescription>
                      </div>
                    </div>
                    <Badge variant={isEnrolled ? "success" : "default"}>
                      {isEnrolled ? "Enrolled" : "Not enrolled"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="mb-4 text-sm text-zinc-500">
                    {intermediateCount} intermediate + {advancedCount} advanced lessons · Available from {track.minLevel} level
                  </p>
                  <Button
                    variant={isEnrolled ? "outline" : "default"}
                    onClick={() => toggleTrack(track.id, !isEnrolled)}
                    disabled={loading === track.id}
                  >
                    {isEnrolled ? "Unenroll" : "Enroll in track"}
                  </Button>
                </CardContent>
              </Card>
            </StaggerItem>
          );
        })}
      </Stagger>
    </div>
  );
}
