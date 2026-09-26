"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { AnimatedNumber } from "@/components/motion/AnimatedNumber";
import { Readout, Slider, VisualFrame } from "@/components/visuals/VisualFrame";
import { cn } from "@/lib/utils";

type Topology = "series" | "parallel";

const SOURCE_V = 9;
const spring = { type: "spring", stiffness: 260, damping: 26 } as const;

function analyze(topology: Topology, r1: number, r2: number) {
  switch (topology) {
    case "series": {
      const req = r1 + r2;
      const current = SOURCE_V / req;
      return {
        req,
        total: current,
        branches: [
          { v: current * r1, i: current },
          { v: current * r2, i: current },
        ],
        formula: `R_eq = R1 + R2 = ${r1} + ${r2}`,
        insight: "Series: the same current flows through both — the voltage is shared.",
      };
    }
    case "parallel": {
      const req = (r1 * r2) / (r1 + r2);
      return {
        req,
        total: SOURCE_V / req,
        branches: [
          { v: SOURCE_V, i: SOURCE_V / r1 },
          { v: SOURCE_V, i: SOURCE_V / r2 },
        ],
        formula: `R_eq = (R1 × R2) / (R1 + R2) = (${r1} × ${r2}) / ${r1 + r2}`,
        insight: "Parallel: each resistor sees the full voltage — the current is shared.",
      };
    }
    default: {
      const exhaustive: never = topology;
      return exhaustive;
    }
  }
}

function ResistorChip({
  name,
  ohms,
  volts,
  milliamps,
}: {
  name: string;
  ohms: number;
  volts: number;
  milliamps: number;
}) {
  return (
    <motion.div
      layout
      transition={spring}
      className="relative z-10 w-40 rounded-xl border border-amber-300 bg-white px-3 py-2 shadow-sm dark:border-amber-800 dark:bg-zinc-900"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-amber-700 dark:text-amber-300">{name}</span>
        <span className="font-mono text-xs text-zinc-600 dark:text-zinc-400">{ohms} Ω</span>
      </div>
      <svg viewBox="0 0 100 16" className="my-1 h-4 w-full" aria-hidden>
        <polyline
          points="0,8 20,8 26,1 36,15 46,1 56,15 66,1 76,15 80,8 100,8"
          fill="none"
          strokeWidth={2}
          strokeLinejoin="round"
          className="stroke-amber-600 dark:stroke-amber-400"
        />
      </svg>
      <div className="flex justify-between font-mono text-[11px] tabular-nums">
        <span className="text-emerald-700 dark:text-emerald-400">{volts.toFixed(2)} V</span>
        <span className="text-blue-700 dark:text-blue-400">{milliamps.toFixed(1)} mA</span>
      </div>
    </motion.div>
  );
}

export function SeriesParallelExplorer({
  initialR1 = 330,
  initialR2 = 660,
  tryThis = [
    "Make R1 = R2. In parallel, R_eq is exactly half of one resistor",
    "In parallel, R_eq is always smaller than the smallest resistor — check it",
    "In series, which resistor gets the bigger share of the 9 V?",
  ],
}: {
  initialR1?: number;
  initialR2?: number;
  tryThis?: string[];
}) {
  const [topology, setTopology] = useState<Topology>("series");
  const [r1, setR1] = useState(initialR1);
  const [r2, setR2] = useState(initialR2);
  const result = analyze(topology, r1, r2);

  return (
    <VisualFrame
      title="Series vs Parallel Explorer"
      subtitle={`Two resistors connected to a ${SOURCE_V} V source`}
      tryThis={tryThis}
    >
      <div className="mb-4 inline-flex rounded-lg border border-zinc-200 p-0.5 text-sm dark:border-zinc-800">
        {(["series", "parallel"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTopology(t)}
            aria-pressed={topology === t}
            className="relative rounded-md px-3 py-1 capitalize"
          >
            {topology === t && (
              <motion.span layoutId="topology-pill" className="absolute inset-0 rounded-md bg-blue-600" transition={spring} />
            )}
            <span className={cn("relative", topology === t ? "text-white" : "text-zinc-600 dark:text-zinc-400")}>{t}</span>
          </button>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-[1.4fr_1fr]">
        <div className="flex min-h-56 items-center justify-center rounded-xl bg-zinc-50 bg-grid p-6 dark:bg-zinc-900/60">
          <div className="flex items-center">
            <div className="z-10 rounded-lg bg-zinc-900 px-2 py-6 text-center font-mono text-xs font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900">
              {SOURCE_V}V
            </div>
            <div className="h-0.5 w-6 bg-zinc-400" />
            <motion.div
              layout
              transition={spring}
              className={cn(
                "relative flex items-center",
                topology === "series" ? "flex-row gap-6" : "flex-col gap-4 px-5"
              )}
            >
              <AnimatePresence>
                {topology === "series" ? (
                  <motion.div
                    key="series-wire"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 bg-zinc-400"
                  />
                ) : (
                  <motion.div
                    key="parallel-bus"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-y-8 inset-x-0 border-x-2 border-zinc-400"
                  >
                    <div className="absolute inset-x-0 top-0 h-0.5 bg-zinc-400" />
                    <div className="absolute inset-x-0 bottom-0 h-0.5 bg-zinc-400" />
                  </motion.div>
                )}
              </AnimatePresence>
              {[r1, r2].map((ohms, i) => (
                <ResistorChip
                  key={i}
                  name={`R${i + 1}`}
                  ohms={ohms}
                  volts={result.branches[i].v}
                  milliamps={result.branches[i].i * 1000}
                />
              ))}
            </motion.div>
            <div className="h-0.5 w-6 bg-zinc-400" />
          </div>
        </div>

        <div className="space-y-5">
          <Slider label="R1" value={r1} min={100} max={1000} step={10} unit="Ω" onChange={setR1} />
          <Slider label="R2" value={r2} min={100} max={1000} step={10} unit="Ω" onChange={setR2} />
          <div className="grid grid-cols-2 gap-3">
            <Readout label="Equivalent R" tone="blue">
              <AnimatedNumber value={result.req} decimals={1} suffix=" Ω" duration={0.5} />
            </Readout>
            <Readout label="Total current" tone="green">
              <AnimatedNumber value={result.total * 1000} decimals={1} suffix=" mA" duration={0.5} />
            </Readout>
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={topology}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="space-y-2"
            >
              <p className="rounded-lg bg-zinc-50 px-3 py-2 font-mono text-xs text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
                {result.formula}
              </p>
              <p className="text-sm text-zinc-700 dark:text-zinc-300">{result.insight}</p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </VisualFrame>
  );
}
