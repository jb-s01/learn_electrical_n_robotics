"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { notifyProgressUpdated } from "@/lib/progress/notify";

export function LessonReader({ lessonId }: { lessonId: string }) {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "markRead", lessonId }),
      })
        .then(() => {
          notifyProgressUpdated();
          router.refresh();
        })
        .catch(console.error);
    }, 3000);

    return () => clearTimeout(timer);
  }, [lessonId, router]);

  return null;
}
