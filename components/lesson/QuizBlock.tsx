"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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

export function QuizBlock({
  lessonId,
  questions,
  minScore = 80,
  onComplete,
}: QuizBlockProps) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);

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

  const allAnswered = (questions ?? []).every((_, i) => answers[i] !== undefined);

  return (
    <div className="my-8 rounded-xl border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-900/50">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Knowledge Check</h3>
        {submitted && score !== null && (
          <Badge variant={score >= minScore ? "success" : "warning"}>
            Score: {score}% {score >= minScore ? "Passed" : `(need ${minScore}%)`}
          </Badge>
        )}
      </div>

      <div className="space-y-6">
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
                return (
                  <button
                    key={oi}
                    type="button"
                    disabled={submitted}
                    onClick={() => setAnswers((prev) => ({ ...prev, [qi]: oi }))}
                    className={cn(
                      "block w-full rounded-lg border px-4 py-2.5 text-left text-sm transition-colors",
                      isSelected && !showResult && "border-blue-500 bg-blue-50 dark:bg-blue-950/30",
                      showResult && isCorrect && "border-green-500 bg-green-50 dark:bg-green-950/30",
                      showResult && isSelected && !isCorrect && "border-red-500 bg-red-50 dark:bg-red-950/30",
                      !isSelected && !showResult && "border-zinc-200 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
                    )}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
            {submitted && q.explanation && (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">{q.explanation}</p>
            )}
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
    </div>
  );
}
