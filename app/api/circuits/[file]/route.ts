import { NextResponse } from "next/server";
import { getCircuitContent } from "@/lib/content/lessons";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ file: string }> }
) {
  const { file } = await params;
  const content = getCircuitContent(file);
  if (!content) {
    return NextResponse.json({ error: "Circuit not found" }, { status: 404 });
  }
  return new Response(content, {
    headers: { "Content-Type": "text/plain" },
  });
}
