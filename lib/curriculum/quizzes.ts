import quizzesData from "@/content/quizzes.json";
import type { QuizQuestion } from "@/components/lesson/QuizBlock";

const quizzes = quizzesData as Record<string, QuizQuestion[]>;

export function getQuizForLesson(lessonId: string): QuizQuestion[] {
  return quizzes[lessonId] ?? [];
}
