"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { notifyProgressUpdated } from "@/lib/progress/notify";

declare global {
  interface Window {
    CircuitJS1?: {
      importCircuit: (circuit: string, subcircuitsOnly?: boolean) => void;
      exportCircuit: () => string;
      setSimRunning: (run: boolean) => void;
      isRunning: () => boolean;
      getNodeVoltage: (name: string) => number;
      getElements: () => Array<{ getType: () => string; getInfo: () => string }>;
      onanalyze?: (sim: unknown) => void;
    };
    oncircuitjsloaded?: () => void;
  }
}

type CircuitSimulatorProps = {
  circuitFile?: string;
  lessonId?: string;
  onLabComplete?: () => void;
  labInstructions?: string[];
};

export function CircuitSimulator({
  circuitFile,
  lessonId,
  onLabComplete,
  labInstructions = [],
}: CircuitSimulatorProps) {
  const router = useRouter();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [labDone, setLabDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCircuit = useCallback(async () => {
    if (!circuitFile || !iframeRef.current?.contentWindow?.CircuitJS1) return;

    try {
      const res = await fetch(`/api/circuits/${circuitFile}`);
      if (!res.ok) throw new Error("Failed to load circuit");
      const circuit = await res.text();
      iframeRef.current.contentWindow.CircuitJS1.importCircuit(circuit);
    } catch {
      setError("Could not load circuit file");
    }
  }, [circuitFile]);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleLoad = () => {
      const win = iframe.contentWindow;
      if (!win) return;

      win.oncircuitjsloaded = () => {
        setLoaded(true);
        if (circuitFile) {
          fetch(`/api/circuits/${circuitFile}`)
            .then((r) => r.text())
            .then((circuit) => {
              win.CircuitJS1?.importCircuit(circuit);
            })
            .catch(() => setError("Could not load circuit"));
        }
      };
    };

    iframe.addEventListener("load", handleLoad);
    return () => iframe.removeEventListener("load", handleLoad);
  }, [circuitFile]);

  const handleVerifyLab = () => {
    const sim = iframeRef.current?.contentWindow?.CircuitJS1;
    if (!sim) return;

    sim.setSimRunning(true);
    setLabDone(true);
    onLabComplete?.();

    if (lessonId) {
      fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "markLabComplete", lessonId }),
      })
        .then(() => {
          notifyProgressUpdated();
          router.refresh();
        })
        .catch(console.error);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold">Circuit Simulator</h3>
          <Badge variant={loaded ? "success" : "warning"}>
            {loaded ? "Ready" : "Loading..."}
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadCircuit} disabled={!loaded}>
            Reset Circuit
          </Button>
          {labInstructions.length > 0 && (
            <Button size="sm" onClick={handleVerifyLab} disabled={!loaded || labDone}>
              {labDone ? "Lab Complete" : "Complete Lab"}
            </Button>
          )}
        </div>
      </div>

      {labInstructions.length > 0 && (
        <ul className="list-inside list-disc space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
          {labInstructions.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
        <iframe
          ref={iframeRef}
          src="/circuitjs/circuitjs.html"
          title="Circuit Simulator"
          className="h-[420px] w-full bg-white"
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
    </div>
  );
}
