import { eq } from "drizzle-orm";
import {
  getOllamaBaseUrl,
  OllamaModelNotFoundError,
  parseOllamaError,
  resolveOllamaModel,
} from "@/lib/ai/ollama";
import { buildSystemPrompt } from "@/lib/ai/system-prompt";
import { ChatRequestSchema } from "@/lib/api/schemas";
import { getDb, getOrCreateUser, getUserSettings } from "@/lib/db/client";
import { userSettings } from "@/lib/db/schema";

export const runtime = "nodejs";
export const maxDuration = 120;

function jsonError(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError({ error: "Invalid JSON" }, 400);
  }

  const parsed = ChatRequestSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(
      { error: "Invalid input", issues: parsed.error.flatten() },
      400
    );
  }

  try {
    const user = await getOrCreateUser();
    const settings = await getUserSettings(user.id);

    const system = buildSystemPrompt(parsed.data.context);

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

    // Validated turns are only user/assistant, so this server prompt is the
    // only system message Ollama receives.
    const ollamaMessages = [
      { role: "system", content: system },
      ...parsed.data.messages.map((message) => ({
        role: message.role,
        content: message.content,
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
