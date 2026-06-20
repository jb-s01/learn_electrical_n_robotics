import { NextResponse } from "next/server";
import { getOrCreateUser, getDb } from "@/lib/db/client";
import { userSettings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

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
  const user = await getOrCreateUser();
  const { ollamaModel } = await request.json();
  const db = getDb();

  await db
    .update(userSettings)
    .set({ ollamaModel })
    .where(eq(userSettings.userId, user.id));

  return NextResponse.json({ ollamaModel });
}
