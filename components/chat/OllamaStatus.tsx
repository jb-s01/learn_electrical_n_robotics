"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Wifi, WifiOff, AlertTriangle } from "lucide-react";

type OllamaHealth = {
  connected: boolean;
  models: Array<{ name: string; size: number }>;
  selectedModel?: string;
  resolvedModel?: string;
  modelReady?: boolean;
  usingFallback?: boolean;
  error?: string;
};

export function OllamaStatus({ compact = false }: { compact?: boolean }) {
  const [health, setHealth] = useState<OllamaHealth | null>(null);

  useEffect(() => {
    fetch("/api/ollama/health")
      .then((r) => r.json())
      .then(setHealth)
      .catch(() => setHealth({ connected: false, models: [], error: "Unreachable" }));
  }, []);

  if (!health) {
    return <Badge variant="warning">Checking Ollama...</Badge>;
  }

  const activeModel = health.resolvedModel ?? health.selectedModel;
  const modelIssue = health.connected && health.modelReady === false;

  if (compact) {
    if (!health.connected) {
      return (
        <Badge variant="locked" className="gap-1">
          <WifiOff className="h-3 w-3" /> AI Offline
        </Badge>
      );
    }
    if (modelIssue) {
      return (
        <Badge variant="warning" className="gap-1">
          <AlertTriangle className="h-3 w-3" /> Model missing
        </Badge>
      );
    }
    return (
      <Badge variant="success" className="gap-1">
        <Wifi className="h-3 w-3" /> AI Ready{activeModel ? ` (${activeModel})` : ""}
      </Badge>
    );
  }

  return (
    <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      <div className="flex items-center gap-2">
        {!health.connected ? (
          <>
            <WifiOff className="h-4 w-4 text-zinc-400" />
            <span className="text-sm font-medium text-zinc-500">Ollama offline</span>
          </>
        ) : modelIssue ? (
          <>
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <span className="text-sm font-medium text-amber-700 dark:text-amber-400">
              Model not installed
            </span>
          </>
        ) : (
          <>
            <Wifi className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-700 dark:text-green-400">
              Ollama connected{activeModel ? ` — ${activeModel}` : ""}
            </span>
          </>
        )}
      </div>
      {!health.connected && (
        <p className="mt-2 text-xs text-zinc-500">
          Install Ollama from ollama.com, then run:{" "}
          <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">ollama serve</code>
        </p>
      )}
      {health.connected && modelIssue && (
        <p className="mt-2 text-xs text-amber-700 dark:text-amber-400">
          Configured model &quot;{health.selectedModel}&quot; is not installed.
          {health.models.length > 0 ? (
            <> Go to Settings and select: {health.models.map((m) => m.name).join(", ")}</>
          ) : (
            <> Run: ollama pull {health.selectedModel}</>
          )}
        </p>
      )}
      {health.connected && health.usingFallback && health.resolvedModel && (
        <p className="mt-2 text-xs text-zinc-500">
          Using {health.resolvedModel} (configured model {health.selectedModel} was not found).
        </p>
      )}
      {health.connected && health.models.length > 0 && (
        <p className="mt-2 text-xs text-zinc-500">
          Installed: {health.models.map((m) => m.name).join(", ")}
        </p>
      )}
    </div>
  );
}
