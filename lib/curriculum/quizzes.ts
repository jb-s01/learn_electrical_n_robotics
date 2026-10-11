import quizzesData from "@/content/quizzes.json";
import type {
  GradedQuizQuestion,
  PublicQuizQuestion,
  QuizQuestion,
} from "@/lib/curriculum/quiz-types";

const quizzes = quizzesData as Record<string, QuizQuestion[]>;

export type QuizGrade =
  | {
      ok: true;
      correct: number;
      totalQuestions: number;
      questions: GradedQuizQuestion[];
    }
  | { ok: false; error: string };

export function getQuizForLesson(lessonId: string): QuizQuestion[] {
  return quizzes[lessonId] ?? [];
}

export function getPublicQuizForLesson(lessonId: string): PublicQuizQuestion[] {
  return getQuizForLesson(lessonId).map((question) => ({
    question: question.question,
    options: question.options,
  }));
}

export function gradeQuiz(lessonId: string, answers: readonly number[]): QuizGrade {
  const questions = getQuizForLesson(lessonId);
  if (questions.length === 0) {
    return { ok: false, error: "Quiz has no questions" };
  }
  if (answers.length !== questions.length) {
    return { ok: false, error: "Answer count does not match this quiz" };
  }

  let correct = 0;
  for (let index = 0; index < questions.length; index++) {
    const question = questions[index];
    const answer = answers[index];
    if (answer >= question.options.length) {
      return { ok: false, error: "Answer is outside the available options" };
    }
    if (answer === question.correctIndex) {
      correct += 1;
    }
  }

  return {
    ok: true,
    correct,
    totalQuestions: questions.length,
    questions: questions.map((question) => ({
      correctIndex: question.correctIndex,
      ...(question.explanation ? { explanation: question.explanation } : {}),
    })),
  };
}
