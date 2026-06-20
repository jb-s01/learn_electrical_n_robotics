import { NextResponse } from "next/server";
import { getOrCreateUser, getUserSettings } from "@/lib/db/client";
import {
  listOllamaModels,
  pickAvailableModel,
  getOllamaBaseUrl,
} from "@/lib/ai/ollama";

export const runtime = "nodejs";

export async function GET() {
  try {
    const user = await getOrCreateUser();
    const settings = await getUserSettings(user.id);
    const selectedModel =
      settings.ollamaModel ??
      process.env.OLLAMA_DEFAULT_MODEL ??
      "llama3.2:3b";

    const models = await listOllamaModels();
    const modelNames = models.map((m) => m.name);
    const resolvedModel = pickAvailableModel(selectedModel, models);
    const modelReady = resolvedModel !== null && modelNames.includes(resolvedModel);
    const usingFallback =
      modelReady && selectedModel !== resolvedModel && !modelNames.includes(selectedModel);

    return NextResponse.json({
      connected: true,
      models,
      defaultModel: process.env.OLLAMA_DEFAULT_MODEL ?? "llama3.2:3b",
      selectedModel,
      resolvedModel,
      modelReady,
      usingFallback,
    });
  } catch {
    return NextResponse.json(
      {
        connected: false,
        models: [],
        error: "Ollama is not running. Install from ollama.com and run: ollama serve",
      },
      { status: 503 }
    );
  }
}
