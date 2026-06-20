import { NextResponse } from "next/server";
import {
  getProgressData,
  markLessonRead,
  submitQuiz,
  markLabComplete,
  enrollTrack,
  resetProgress,
  exportProgress,
  importProgress,
} from "@/lib/progress/service";
import { getOrCreateUser } from "@/lib/db/client";

export async function GET() {
  try {
    const data = await getProgressData();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Progress GET error:", error);
    return NextResponse.json(
      { error: "Failed to load progress" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getOrCreateUser();
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case "markRead": {
        await markLessonRead(user.id, body.lessonId);
        break;
      }
      case "submitQuiz": {
        const result = await submitQuiz(
          user.id,
          body.lessonId,
          body.score,
          body.totalQuestions
        );
        return NextResponse.json(result);
      }
      case "markLabComplete": {
        await markLabComplete(user.id, body.lessonId);
        break;
      }
      case "enrollTrack": {
        await enrollTrack(user.id, body.trackId, body.enrolled);
        break;
      }
      case "reset": {
        await resetProgress(user.id);
        break;
      }
      case "import": {
        await importProgress(user.id, body.data);
        break;
      }
      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }

    const data = await getProgressData();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Progress POST error:", error);
    return NextResponse.json(
      { error: "Failed to update progress" },
      { status: 500 }
    );
  }
}

export async function PUT() {
  try {
    const user = await getOrCreateUser();
    const data = await exportProgress(user.id);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to export progress" },
      { status: 500 }
    );
  }
}
