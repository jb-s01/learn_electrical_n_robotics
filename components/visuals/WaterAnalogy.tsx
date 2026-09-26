"use client";

import { motion } from "motion/react";
import { DiagramBlock } from "@/components/lesson/DiagramBlock";
import { Stagger, StaggerItem } from "@/components/motion/Reveal";

function PressureGauge() {
  return (
    <svg viewBox="0 0 80 50" className="mx-auto h-12 w-20" aria-hidden>
      <path d="M8 44 A32 32 0 0 1 72 44" fill="none" strokeWidth={6} strokeLinecap="round" className="stroke-zinc-200 dark:stroke-zinc-800" />
      <path d="M8 44 A32 32 0 0 1 72 44" fill="none" strokeWidth={6} strokeLinecap="round" strokeDasharray="70 200" className="stroke-blue-500" />
      <motion.line
        x1={40}
        y1={44}
        x2={40}
        y2={18}
        strokeWidth={3}
        strokeLinecap="round"
        className="stroke-zinc-800 dark:stroke-zinc-200"
        style={{ transformOrigin: "40px 44px" }}
        animate={{ rotate: [-40, 20, 5, 25, -40] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      <circle cx={40} cy={44} r={4} className="fill-zinc-800 dark:fill-zinc-200" />
    </svg>
  );
}

function FlowingPipe() {
  return (
    <svg viewBox="0 0 80 50" className="mx-auto h-12 w-20" aria-hidden>
      <rect x={2} y={17} width={76} height={16} rx={8} className="fill-sky-100 stroke-sky-300 dark:fill-sky-950 dark:stroke-sky-800" />
      {[0, 1, 2, 3].map((i) => (
        <motion.circle
          key={i}
          cy={25}
          r={4}
          className="fill-sky-500"
          initial={{ cx: 8 }}
          animate={{ cx: [8, 72] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear", delay: i * 0.5 }}
        />
      ))}
    </svg>
  );
}

function NarrowPipe() {
  return (
    <svg viewBox="0 0 80 50" className="mx-auto h-12 w-20" aria-hidden>
      <path
        d="M2 15 H26 L34 21 H46 L54 15 H78 V35 H54 L46 29 H34 L26 35 H2 Z"
        className="fill-sky-100 stroke-amber-500 dark:fill-sky-950"
        strokeWidth={1.5}
      />
      {[0, 1, 2].map((i) => (
        <motion.circle
          key={i}
          cy={25}
          r={3}
          className="fill-sky-500"
          animate={{ cx: [6, 26, 40, 54, 74] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear", times: [0, 0.2, 0.5, 0.8, 1], delay: i }}
        />
      ))}
    </svg>
  );
}

const items = [
  { title: "Voltage", body: "Water pressure — pushes charge", unit: "volts (V)", Visual: PressureGauge },
  { title: "Current", body: "Flow rate — charge per second", unit: "amperes (A)", Visual: FlowingPipe },
  { title: "Resistance", body: "Narrow pipe — opposes flow", unit: "ohms (Ω)", Visual: NarrowPipe },
];

export function WaterAnalogy() {
  return (
    <DiagramBlock title="Water Pipe Analogy">
      <Stagger className="grid gap-4 sm:grid-cols-3">
        {items.map(({ title, body, unit, Visual }) => (
          <StaggerItem key={title}>
            <motion.div
              whileHover={{ y: -4 }}
              className="h-full rounded-lg border border-transparent bg-white p-4 text-center transition-colors hover:border-blue-200 dark:bg-zinc-950 dark:hover:border-blue-900"
            >
              <Visual />
              <p className="mt-2 font-semibold">{title}</p>
              <p className="text-xs text-zinc-500">{body}</p>
              <p className="mt-1 font-mono text-[11px] text-blue-600 dark:text-blue-400">{unit}</p>
            </motion.div>
          </StaggerItem>
        ))}
      </Stagger>
    </DiagramBlock>
  );
}
