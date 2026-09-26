"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { animate, stagger, utils } from "animejs";
import { Check, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { notifyProgressUpdated } from "@/lib/progress/notify";

export type QuizQuestion = {
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
};

type QuizBlockProps = {
  lessonId: string;
  questions: QuizQuestion[];
  minScore?: number;
  onComplete?: (score: number) => void;
};

const SPARK_COUNT = 16;

export function QuizBlock({
  lessonId,
  questions,
  minScore = 80,
  onComplete,
}: QuizBlockProps) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [attempt, setAttempt] = useState(0);
  const sparksRef = useRef<HTMLDivElement>(null);

  const passed = score !== null && score >= minScore;
  const answeredCount = Object.keys(answers).length;
  const allAnswered = (questions ?? []).every((_, i) => answers[i] !== undefined);

  useEffect(() => {
    if (!passed || reduceMotion || !sparksRef.current) return;
    const sparks = sparksRef.current.querySelectorAll("[data-spark]");
    const burst = animate(sparks, {
      x: () => utils.random(-140, 140),
      y: () => utils.random(-90, -10),
      scale: [{ from: 0, to: 1.2, duration: 200 }, { to: 0, duration: 600 }],
      opacity: [{ from: 1, to: 1 }, { to: 0 }],
      rotate: () => utils.random(-180, 180),
      delay: stagger(18),
      duration: 900,
      ease: "outExpo",
    });
    return () => {
      burst.revert();
    };
  }, [passed, reduceMotion, attempt]);

  const handleSubmit = async () => {
    let correct = 0;
    questions.forEach((q, i) => {
      if (answers[i] === q.correctIndex) correct++;
    });
    const pct = Math.round((correct / questions.length) * 100);
    setScore(pct);
    setSubmitted(true);

    await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "submitQuiz",
        lessonId,
        score: correct,
        totalQuestions: questions.length,
      }),
    });

    notifyProgressUpdated();
    router.refresh();

    onComplete?.(pct);
  };

  const handleRetry = () => {
    setAnswers({});
    setSubmitted(false);
    setScore(null);
    setAttempt((n) => n + 1);
  };

  return (
    <div className="my-8 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Knowledge Check</h3>
        <div className="relative">
          <div ref={sparksRef} className="pointer-events-none absolute left-1/2 top-1/2" aria-hidden>
            {Array.from({ length: SPARK_COUNT }, (_, i) => (
              <span
                key={i}
                data-spark
                className={cn(
                  "absolute h-2 w-2 rounded-sm opacity-0",
                  ["bg-blue-500", "bg-cyan-400", "bg-emerald-400", "bg-amber-400"][i % 4]
                )}
              />
            ))}
          </div>
          <AnimatePresence>
            {submitted && score !== null && (
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 18 }}
              >
                <Badge variant={passed ? "success" : "warning"}>
                  Score: {score}% {passed ? "Passed" : `(need ${minScore}%)`}
                </Badge>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="mb-5 h-1.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800" aria-hidden>
        <motion.div
          className={cn("h-full rounded-full", submitted ? (passed ? "bg-emerald-500" : "bg-amber-500") : "bg-blue-500")}
          animate={{ width: `${(answeredCount / questions.length) * 100}%` }}
          transition={{ type: "spring", stiffness: 200, damping: 30 }}
        />
      </div>

      <div className="space-y-6" key={attempt}>
        {questions.map((q, qi) => (
          <div key={qi} className="space-y-2">
            <p className="font-medium">
              {qi + 1}. {q.question}
            </p>
            <div className="space-y-1.5">
              {q.options.map((opt, oi) => {
                const isSelected = answers[qi] === oi;
                const showResult = submitted;
                const isCorrect = oi === q.correctIndex;
                const isWrongPick = showResult && isSelected && !isCorrect;
                return (
                  <motion.button
                    key={oi}
                    type="button"
                    disabled={submitted}
                    onClick={() => setAnswers((prev) => ({ ...prev, [qi]: oi }))}
                    whileTap={submitted ? undefined : { scale: 0.98 }}
                    animate={isWrongPick ? { x: [0, -7, 7, -5, 5, 0] } : { x: 0 }}
                    transition={{ duration: 0.4 }}
                    className={cn(
                      "flex w-full items-center justify-between gap-3 rounded-lg border px-4 py-2.5 text-left text-sm transition-colors",
                      isSelected && !showResult && "border-blue-500 bg-blue-50 ring-2 ring-blue-500/20 dark:bg-blue-950/30",
                      showResult && isCorrect && "border-green-500 bg-green-50 dark:bg-green-950/30",
                      isWrongPick && "border-red-500 bg-red-50 dark:bg-red-950/30",
                      !isSelected && !showResult && "border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800",
                      showResult && !isCorrect && !isSelected && "border-zinc-200 opacity-60 dark:border-zinc-800"
                    )}
                  >
                    <span>{opt}</span>
                    <AnimatePresence>
                      {showResult && (isCorrect || isSelected) && (
                        <motion.span
                          initial={{ scale: 0, rotate: -45 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: "spring", stiffness: 500, damping: 15, delay: 0.1 + qi * 0.08 }}
                          className={cn(
                            "grid h-5 w-5 shrink-0 place-items-center rounded-full text-white",
                            isCorrect ? "bg-green-500" : "bg-red-500"
                          )}
                        >
                          {isCorrect ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>
                );
              })}
            </div>
            <AnimatePresence>
              {submitted && q.explanation && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.3, delay: 0.15 + qi * 0.08 }}
                  className="overflow-hidden text-sm text-zinc-500 dark:text-zinc-400"
                >
                  <span className="mt-1 block border-l-2 border-blue-300 pl-3 dark:border-blue-800">{q.explanation}</span>
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {!submitted && (
        <Button
          className="mt-6"
          onClick={handleSubmit}
          disabled={!allAnswered}
        >
          Submit Quiz
        </Button>
      )}
      {submitted && !passed && (
        <Button variant="outline" className="mt-6 gap-2" onClick={handleRetry}>
          <RotateCcw className="h-4 w-4" /> Review and try again
        </Button>
      )}
    </div>
  );
}
