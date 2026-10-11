import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { ProgressActionSchema } from "@/lib/api/schemas";
import { getOrCreateUser } from "@/lib/db/client";
import { InvalidProgressInputError } from "@/lib/progress/errors";
import {
  enrollTrack,
  exportProgress,
  getProgressData,
  importProgress,
  markLabComplete,
  markLessonRead,
  resetProgress,
  submitQuiz,
} from "@/lib/progress/service";

function invalidInputResponse(error: ZodError) {
  return NextResponse.json(
    { error: "Invalid input", issues: error.flatten() },
    { status: 400 }
  );
}

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
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const parsed = ProgressActionSchema.safeParse(body);
    if (!parsed.success) {
      return invalidInputResponse(parsed.error);
    }

    const action = parsed.data;
    switch (action.action) {
      case "markRead": {
        await markLessonRead(user.id, action.lessonId);
        break;
      }
      case "submitQuiz": {
        const result = await submitQuiz(user.id, action.lessonId, action.answers);
        return NextResponse.json(result);
      }
      case "markLabComplete": {
        await markLabComplete(user.id, action.lessonId);
        break;
      }
      case "enrollTrack": {
        await enrollTrack(user.id, action.trackId, action.enrolled);
        break;
      }
      case "reset": {
        await resetProgress(user.id);
        break;
      }
      case "import": {
        await importProgress(user.id, action.data);
        break;
      }
      default: {
        const _exhaustive: never = action;
        void _exhaustive;
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
      }
    }

    const data = await getProgressData();
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof InvalidProgressInputError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
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
    console.error("Progress export error:", error);
    return NextResponse.json(
      { error: "Failed to export progress" },
      { status: 500 }
    );
  }
}
