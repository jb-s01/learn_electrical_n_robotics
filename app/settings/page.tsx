"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OllamaStatus } from "@/components/chat/OllamaStatus";

export default function SettingsPage() {
  const [model, setModel] = useState("llama3.2:3b");
  const [models, setModels] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);
  const [exportData, setExportData] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/settings").then((r) => r.json()),
      fetch("/api/ollama/health").then((r) => r.json()),
    ])
      .then(([settings, health]) => {
        const installed =
          health.models?.map((m: { name: string }) => m.name) ?? [];
        setModels(installed);

        const saved = settings.ollamaModel ?? "llama3.2:3b";
        if (installed.length === 0) {
          setModel(saved);
          return;
        }

        const valid = installed.includes(saved)
          ? saved
          : installed.includes(health.resolvedModel)
            ? health.resolvedModel
            : installed[0];

        setModel(valid);

        if (valid !== saved) {
          fetch("/api/settings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ollamaModel: valid }),
          }).catch(console.error);
        }
      })
      .catch(console.error);
  }, []);

  const saveModel = async (nextModel: string) => {
    setModel(nextModel);
    await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ollamaModel: nextModel }),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const resetProgress = async () => {
    if (!confirm("Reset all progress? This cannot be undone.")) return;
    await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reset" }),
    });
    window.location.href = "/";
  };

  const handleExport = async () => {
    const res = await fetch("/api/progress", { method: "PUT" });
    const data = await res.json();
    setExportData(JSON.stringify(data, null, 2));
  };

  const handleImport = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const text = await file.text();
      const data = JSON.parse(text);
      await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "import", data }),
      });
      window.location.href = "/";
    };
    input.click();
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-3xl font-bold">Settings</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        Configure your AI tutor and manage progress data.
      </p>

      <div className="mt-8 space-y-6">
        <OllamaStatus />

        <Card>
          <CardHeader>
            <CardTitle>Ollama Model</CardTitle>
            <CardDescription>
              Choose which local model powers the AI tutor
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {models.length > 0 ? (
              <select
                value={model}
                onChange={(e) => saveModel(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              >
                {models.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            ) : (
              <Input
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="gemma3:12b"
              />
            )}
            {models.length === 0 && (
              <Button onClick={() => saveModel(model)}>
                {saved ? "Saved!" : "Save Model"}
              </Button>
            )}
            {models.length > 0 && saved && (
              <p className="text-sm text-green-600">Model saved.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Progress Data</CardTitle>
            <CardDescription>Export or import your learning progress</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={handleExport}>
              Export Progress
            </Button>
            <Button variant="outline" onClick={handleImport}>
              Import Progress
            </Button>
            <Button variant="destructive" onClick={resetProgress}>
              Reset All Progress
            </Button>
          </CardContent>
          {exportData && (
            <CardContent>
              <pre data-lenis-prevent className="max-h-48 overflow-auto rounded-lg bg-zinc-100 p-3 text-xs dark:bg-zinc-900">
                {exportData}
              </pre>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
