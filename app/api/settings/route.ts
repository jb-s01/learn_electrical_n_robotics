import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { eq } from "drizzle-orm";
import { SettingsUpdateSchema } from "@/lib/api/schemas";
import { getDb, getOrCreateUser } from "@/lib/db/client";
import { userSettings } from "@/lib/db/schema";

function invalidInputResponse(error: ZodError) {
  return NextResponse.json(
    { error: "Invalid input", issues: error.flatten() },
    { status: 400 }
  );
}

export async function GET() {
  const user = await getOrCreateUser();
  const db = getDb();
  const settings = await db
    .select()
    .from(userSettings)
    .where(eq(userSettings.userId, user.id))
    .limit(1);

  return NextResponse.json(settings[0] ?? { ollamaModel: "llama3.2:3b" });
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

    const parsed = SettingsUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return invalidInputResponse(parsed.error);
    }

    const db = getDb();
    await db
      .update(userSettings)
      .set({ ollamaModel: parsed.data.ollamaModel })
      .where(eq(userSettings.userId, user.id));

    return NextResponse.json({ ollamaModel: parsed.data.ollamaModel });
  } catch (error) {
    console.error("Settings POST error:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
