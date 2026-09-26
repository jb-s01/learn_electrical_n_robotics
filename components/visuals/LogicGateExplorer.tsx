"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { VisualFrame } from "@/components/visuals/VisualFrame";
import { cn } from "@/lib/utils";

const GATES = ["AND", "OR", "XOR", "NAND", "NOR", "NOT"] as const;
type Gate = (typeof GATES)[number];

const HIGH = "#10b981";
const LOW = "#a1a1aa";

const AND_BODY = "M60 20 H100 A40 40 0 0 1 100 100 H60 Z";
const OR_BODY = "M55 20 Q80 60 55 100 Q115 100 145 60 Q115 20 55 20 Z";
const XOR_TAIL = "M45 20 Q70 60 45 100";
const NOT_BODY = "M60 20 L130 60 L60 100 Z";

function evaluate(gate: Gate, a: boolean, b: boolean): boolean {
  switch (gate) {
    case "AND":
      return a && b;
    case "OR":
      return a || b;
    case "XOR":
      return a !== b;
    case "NAND":
      return !(a && b);
    case "NOR":
      return !(a || b);
    case "NOT":
      return !a;
    default: {
      const exhaustive: never = gate;
      return exhaustive;
    }
  }
}

function gateShape(gate: Gate): { body: string; tail?: string; bubbleX?: number; outX: number } {
  switch (gate) {
    case "AND":
      return { body: AND_BODY, outX: 140 };
    case "NAND":
      return { body: AND_BODY, bubbleX: 146, outX: 152 };
    case "OR":
      return { body: OR_BODY, outX: 145 };
    case "NOR":
      return { body: OR_BODY, bubbleX: 151, outX: 157 };
    case "XOR":
      return { body: OR_BODY, tail: XOR_TAIL, outX: 145 };
    case "NOT":
      return { body: NOT_BODY, bubbleX: 136, outX: 142 };
    default: {
      const exhaustive: never = gate;
      return exhaustive;
    }
  }
}

function Toggle({ label, on, onChange }: { label: string; on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={`Input ${label}`}
      onClick={() => onChange(!on)}
      className="flex items-center gap-2"
    >
      <span className="w-4 font-mono text-sm font-semibold">{label}</span>
      <span
        className={cn(
          "flex h-7 w-12 items-center rounded-full p-1 transition-colors",
          on ? "justify-end bg-emerald-500" : "justify-start bg-zinc-300 dark:bg-zinc-700"
        )}
      >
        <motion.span layout transition={{ type: "spring", stiffness: 700, damping: 30 }} className="h-5 w-5 rounded-full bg-white shadow" />
      </span>
      <span className="w-3 font-mono text-sm tabular-nums">{on ? 1 : 0}</span>
    </button>
  );
}

export function LogicGateExplorer({ initialGate = "AND" }: { initialGate?: Gate }) {
  const [gate, setGate] = useState<Gate>(initialGate);
  const [a, setA] = useState(false);
  const [b, setB] = useState(false);
  const singleInput = gate === "NOT";
  const out = evaluate(gate, a, b);
  const shape = gateShape(gate);

  const rows = singleInput
    ? [[false, false], [true, false]]
    : [[false, false], [false, true], [true, false], [true, true]];

  return (
    <VisualFrame
      title="Logic Gate Explorer"
      subtitle="Flip the inputs, watch the output, and trace your row in the truth table"
      tryThis={[
        "Predict the output before you flip each switch",
        "Which gate outputs 1 only when the inputs are different?",
        "Compare AND and NAND tables — what is the relationship?",
      ]}
    >
      <div className="mb-5 flex flex-wrap gap-1.5">
        {GATES.map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => setGate(g)}
            aria-pressed={gate === g}
            className="relative rounded-lg px-3 py-1 font-mono text-sm"
          >
            {gate === g && (
              <motion.span layoutId="gate-pill" className="absolute inset-0 rounded-lg bg-blue-600" transition={{ type: "spring", stiffness: 400, damping: 30 }} />
            )}
            <span className={cn("relative", gate === g ? "text-white" : "text-zinc-600 dark:text-zinc-400")}>{g}</span>
          </button>
        ))}
      </div>

      <div className="grid items-center gap-6 md:grid-cols-[auto_1fr_auto]">
        <div className="flex flex-col gap-4">
          <Toggle label="A" on={a} onChange={setA} />
          {!singleInput && <Toggle label="B" on={b} onChange={setB} />}
        </div>

        <svg viewBox="0 0 220 120" className="w-full max-w-sm" role="img" aria-label={`${gate} gate, output ${out ? 1 : 0}`}>
          {singleInput ? (
            <motion.line x1={0} x2={60} y1={60} y2={60} strokeWidth={4} animate={{ stroke: a ? HIGH : LOW }} />
          ) : (
            <>
              <motion.line x1={0} x2={64} y1={40} y2={40} strokeWidth={4} animate={{ stroke: a ? HIGH : LOW }} />
              <motion.line x1={0} x2={64} y1={80} y2={80} strokeWidth={4} animate={{ stroke: b ? HIGH : LOW }} />
            </>
          )}
          <AnimatePresence mode="wait">
            <motion.g
              key={gate}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.18 }}
              style={{ transformOrigin: "100px 60px" }}
            >
              <path d={shape.body} strokeWidth={3} className="fill-white stroke-zinc-800 dark:fill-zinc-900 dark:stroke-zinc-200" />
              {shape.tail && <path d={shape.tail} fill="none" strokeWidth={3} className="stroke-zinc-800 dark:stroke-zinc-200" />}
              {shape.bubbleX && (
                <circle cx={shape.bubbleX} cy={60} r={6} strokeWidth={3} className="fill-white stroke-zinc-800 dark:fill-zinc-900 dark:stroke-zinc-200" />
              )}
              <motion.line x1={shape.outX} x2={196} y1={60} y2={60} strokeWidth={4} animate={{ stroke: out ? HIGH : LOW }} />
            </motion.g>
          </AnimatePresence>
          <motion.circle
            cx={206}
            cy={60}
            r={10}
            animate={{ fill: out ? HIGH : "#3f3f46", scale: out ? 1.15 : 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 20 }}
            style={{ filter: out ? "drop-shadow(0 0 8px rgba(16,185,129,0.9))" : "none" }}
          />
        </svg>

        <div role="table" aria-label={`${gate} truth table`} className="min-w-40 text-center font-mono text-sm">
          <div role="row" className={cn("grid text-xs text-zinc-500", singleInput ? "grid-cols-2" : "grid-cols-3")}>
            <span role="columnheader" className="px-3 py-1">A</span>
            {!singleInput && <span role="columnheader" className="px-3 py-1">B</span>}
            <span role="columnheader" className="px-3 py-1">Out</span>
          </div>
          {rows.map(([ra, rb]) => {
            const active = ra === a && (singleInput || rb === b);
            const rowOut = evaluate(gate, ra, rb);
            return (
              <div
                role="row"
                key={`${ra}${rb}`}
                aria-current={active ? "true" : undefined}
                className={cn("relative grid", singleInput ? "grid-cols-2" : "grid-cols-3")}
              >
                {active && (
                  <motion.span
                    layoutId="truth-row"
                    className="absolute inset-0 rounded-md bg-blue-100 dark:bg-blue-900/40"
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  />
                )}
                <span role="cell" className="relative px-3 py-1">{ra ? 1 : 0}</span>
                {!singleInput && <span role="cell" className="relative px-3 py-1">{rb ? 1 : 0}</span>}
                <span
                  role="cell"
                  className={cn("relative px-3 py-1 font-semibold", rowOut ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-400")}
                >
                  {rowOut ? 1 : 0}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </VisualFrame>
  );
}
