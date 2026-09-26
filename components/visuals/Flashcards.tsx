"use client";

import { useState } from "react";
import { AnimatePresence, motion, type Variants } from "motion/react";
import { Check, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { VisualFrame } from "@/components/visuals/VisualFrame";
import { cn } from "@/lib/utils";

export type Flashcard = { front: string; back: string };

const slide: Variants = {
  enter: (direction: number) => ({ x: direction * 60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({ x: direction * -60, opacity: 0 }),
};

export function Flashcards({ cards, title = "Recall Practice" }: { cards: Flashcard[]; title?: string }) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState<Set<number>>(new Set());

  if (cards.length === 0) return null;
  const card = cards[index];

  const go = (delta: number) => {
    setDirection(delta);
    setFlipped(false);
    setIndex((i) => (i + delta + cards.length) % cards.length);
  };

  const mark = (isKnown: boolean) => {
    setKnown((prev) => {
      const next = new Set(prev);
      if (isKnown) next.add(index);
      else next.delete(index);
      return next;
    });
    go(1);
  };

  return (
    <VisualFrame
      title={title}
      subtitle="Answer in your head first, then flip. Retrieval beats re-reading."
      actions={
        <span className="font-mono text-xs text-zinc-500">
          {known.size}/{cards.length} known
        </span>
      }
    >
      <div className="mb-3 flex gap-1" aria-hidden>
        {cards.map((_, i) => (
          <motion.span
            key={i}
            className={cn(
              "h-1.5 flex-1 rounded-full",
              known.has(i) ? "bg-emerald-500" : i === index ? "bg-blue-500" : "bg-zinc-200 dark:bg-zinc-800"
            )}
            animate={{ scaleY: i === index ? 1.4 : 1 }}
          />
        ))}
      </div>

      <div className="relative h-44">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={index}
            custom={direction}
            variants={slide}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
            className="absolute inset-0 [perspective:1200px]"
          >
            <motion.button
              type="button"
              onClick={() => setFlipped((f) => !f)}
              aria-label={flipped ? `Answer: ${card.back}. Click to show question.` : `Question: ${card.front}. Click to reveal answer.`}
              animate={{ rotateY: flipped ? 180 : 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 26 }}
              className="absolute inset-0 w-full cursor-pointer [transform-style:preserve-3d]"
            >
              <span className="absolute inset-0 flex flex-col items-center justify-center rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 p-6 text-center [backface-visibility:hidden] dark:border-blue-900 dark:from-blue-950/40 dark:to-cyan-950/30">
                <span className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">Question</span>
                <span className="text-lg font-medium text-zinc-900 dark:text-zinc-100">{card.front}</span>
                <span className="mt-3 text-xs text-zinc-500">Click to flip</span>
              </span>
              <span className="absolute inset-0 flex flex-col items-center justify-center rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-6 text-center [backface-visibility:hidden] [transform:rotateY(180deg)] dark:border-emerald-900 dark:from-emerald-950/40 dark:to-teal-950/30">
                <span className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">Answer</span>
                <span className="text-base text-zinc-900 dark:text-zinc-100">{card.back}</span>
              </span>
            </motion.button>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-1">
          <button type="button" onClick={() => go(-1)} aria-label="Previous card" className="rounded-lg border border-zinc-200 p-2 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => go(1)} aria-label="Next card" className="rounded-lg border border-zinc-200 p-2 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800">
            <ChevronRight className="h-4 w-4" />
          </button>
          <span className="self-center px-2 font-mono text-xs text-zinc-500">
            {index + 1} / {cards.length}
          </span>
        </div>
        <AnimatePresence>
          {flipped && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              className="flex gap-2"
            >
              <button
                type="button"
                onClick={() => mark(false)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-sm text-amber-800 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-300"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Still learning
              </button>
              <button
                type="button"
                onClick={() => mark(true)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-sm text-white hover:bg-emerald-700"
              >
                <Check className="h-3.5 w-3.5" /> I knew it
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </VisualFrame>
  );
}
