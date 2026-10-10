export type QuizQuestion = {
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
};

export type PublicQuizQuestion = {
  question: string;
  options: string[];
};

export type GradedQuizQuestion = {
  correctIndex: number;
  explanation?: string;
};

export type QuizSubmitResult = {
  score: number;
  correct: number;
  totalQuestions: number;
  passed: boolean;
  questions: GradedQuizQuestion[];
};
