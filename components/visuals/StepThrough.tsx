"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CheckCircle2, RotateCcw } from "lucide-react";
import { VisualFrame } from "@/components/visuals/VisualFrame";

export function StepThrough({
  title = "Worked Example",
  problem,
  steps,
  answer,
}: {
  title?: string;
  problem: string;
  steps: string[];
  answer?: string;
}) {
  const [shown, setShown] = useState(0);
  const done = shown >= steps.length;

  return (
    <VisualFrame title={title} subtitle="Try each step yourself before revealing it.">
      <p className="mb-4 rounded-lg bg-zinc-50 px-4 py-3 text-sm font-medium text-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
        {problem}
      </p>

      <ol className="relative space-y-3 border-l-2 border-zinc-200 pl-5 dark:border-zinc-800">
        <AnimatePresence initial={false}>
          {steps.slice(0, shown).map((step, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, height: 0, x: -8 }}
              animate={{ opacity: 1, height: "auto", x: 0 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="relative overflow-visible text-sm text-zinc-700 dark:text-zinc-300"
            >
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 20, delay: 0.05 }}
                className="absolute -left-[31px] top-0 grid h-5 w-5 place-items-center rounded-full bg-blue-600 text-[10px] font-bold text-white"
              >
                {i + 1}
              </motion.span>
              {step}
            </motion.li>
          ))}
        </AnimatePresence>
        {!done && (
          <li className="text-sm italic text-zinc-400">
            Step {shown + 1} of {steps.length} — what would you do next?
          </li>
        )}
      </ol>

      <AnimatePresence>
        {done && answer && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="mt-4 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300"
          >
            <CheckCircle2 className="h-4 w-4 shrink-0" /> {answer}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-4 flex gap-2">
        {!done ? (
          <button
            type="button"
            onClick={() => setShown((s) => s + 1)}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Reveal step {shown + 1}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setShown(0)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 px-4 py-2 text-sm hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Try again from scratch
          </button>
        )}
      </div>
    </VisualFrame>
  );
}
