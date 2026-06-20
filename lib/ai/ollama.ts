const DEFAULT_BASE_URL = "http://localhost:11434";

export type OllamaModelInfo = {
  name: string;
  size?: number;
};

export class OllamaModelNotFoundError extends Error {
  constructor(
    public readonly requestedModel: string,
    public readonly availableModels: string[]
  ) {
    super(
      availableModels.length > 0
        ? `Model "${requestedModel}" is not installed. Available: ${availableModels.join(", ")}. Select one in Settings or run: ollama pull ${requestedModel}`
        : `Model "${requestedModel}" is not installed and no models are available. Run: ollama pull ${requestedModel}`
    );
    this.name = "OllamaModelNotFoundError";
  }
}

export function getOllamaBaseUrl() {
  return process.env.OLLAMA_BASE_URL ?? DEFAULT_BASE_URL;
}

export async function listOllamaModels(): Promise<OllamaModelInfo[]> {
  const baseUrl = getOllamaBaseUrl();
  const res = await fetch(`${baseUrl}/api/tags`, {
    signal: AbortSignal.timeout(5000),
  });

  if (!res.ok) {
    throw new Error(`Failed to list Ollama models (${res.status})`);
  }

  const data = await res.json();
  return (data.models ?? []).map((m: { name: string; size?: number }) => ({
    name: m.name,
    size: m.size,
  }));
}

export function pickAvailableModel(
  requested: string,
  available: OllamaModelInfo[]
): string | null {
  const names = available.map((m) => m.name);
  if (names.includes(requested)) return requested;

  const base = requested.split(":")[0];
  const variantMatch = names.find((n) => n === base || n.startsWith(`${base}:`));
  if (variantMatch) return variantMatch;

  return names[0] ?? null;
}

export async function resolveOllamaModel(requested: string): Promise<{
  model: string;
  fallback: boolean;
  requestedModel: string;
}> {
  const available = await listOllamaModels();
  const names = available.map((m) => m.name);

  if (names.includes(requested)) {
    return { model: requested, fallback: false, requestedModel: requested };
  }

  const resolved = pickAvailableModel(requested, available);
  if (resolved) {
    return { model: resolved, fallback: true, requestedModel: requested };
  }

  throw new OllamaModelNotFoundError(requested, names);
}

export async function parseOllamaError(res: Response): Promise<string> {
  try {
    const data = await res.json();
    if (typeof data.error === "string") return data.error;
  } catch {
    // ignore
  }
  return `Ollama request failed (${res.status})`;
}
