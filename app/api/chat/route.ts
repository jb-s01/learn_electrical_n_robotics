import { buildSystemPrompt } from "@/lib/ai/system-prompt";
import { ChatContextSchema } from "@/lib/ai/context";
import { getOrCreateUser, getDb, getUserSettings } from "@/lib/db/client";
import { userSettings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import {
  getOllamaBaseUrl,
  resolveOllamaModel,
  OllamaModelNotFoundError,
  parseOllamaError,
} from "@/lib/ai/ollama";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(req: Request) {
  try {
    const user = await getOrCreateUser();
    const settings = await getUserSettings(user.id);
    const { messages, context } = await req.json();

    const parsedContext = context
      ? ChatContextSchema.safeParse(context)
      : { success: false as const, data: undefined };

    const system = buildSystemPrompt(
      parsedContext.success ? parsedContext.data : undefined
    );

    const requestedModel =
      settings.ollamaModel ??
      process.env.OLLAMA_DEFAULT_MODEL ??
      "llama3.2:3b";

    const { model, fallback, requestedModel: original } =
      await resolveOllamaModel(requestedModel);

    if (fallback) {
      const db = getDb();
      await db
        .update(userSettings)
        .set({ ollamaModel: model })
        .where(eq(userSettings.userId, user.id));
    }

    const baseUrl = getOllamaBaseUrl();

    const ollamaMessages = [
      { role: "system", content: system },
      ...messages.map((m: { role: string; content: string }) => ({
        role: m.role,
        content: m.content,
      })),
    ];

    const ollamaRes = await fetch(`${baseUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        messages: ollamaMessages,
        stream: true,
      }),
    });

    if (!ollamaRes.ok) {
      const detail = await parseOllamaError(ollamaRes);
      if (ollamaRes.status === 404) {
        return new Response(JSON.stringify({ error: detail }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }
      throw new Error(detail);
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        if (fallback) {
          controller.enqueue(
            encoder.encode(
              `0:${JSON.stringify(`[Using ${model} — "${original}" is not installed]\n\n`)}\n`
            )
          );
        }

        const reader = ollamaRes.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }

        const decoder = new TextDecoder();
        let buffer = "";

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() ?? "";

            for (const line of lines) {
              if (!line.trim()) continue;
              try {
                const json = JSON.parse(line);
                const text = json.message?.content ?? "";
                if (text) {
                  controller.enqueue(
                    encoder.encode(`0:${JSON.stringify(text)}\n`)
                  );
                }
                if (json.done) {
                  controller.enqueue(encoder.encode("d:{}\n"));
                }
              } catch {
                // skip malformed lines
              }
            }
          }
        } catch (streamError) {
          console.error("Ollama stream error:", streamError);
          controller.error(streamError);
          return;
        }

        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Vercel-AI-Data-Stream": "v1",
        ...(fallback ? { "X-Ollama-Model-Fallback": model } : {}),
      },
    });
  } catch (error) {
    if (error instanceof OllamaModelNotFoundError) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (
      error instanceof Error &&
      (error.message.includes("ECONNREFUSED") ||
        error.message.includes("fetch failed") ||
        error.message.includes("Failed to list Ollama"))
    ) {
      return new Response(
        JSON.stringify({
          error: "Ollama is not running. Start it with: ollama serve",
        }),
        { status: 503, headers: { "Content-Type": "application/json" } }
      );
    }

    console.error("Chat error:", error);
    return new Response(
      JSON.stringify({
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate response",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
