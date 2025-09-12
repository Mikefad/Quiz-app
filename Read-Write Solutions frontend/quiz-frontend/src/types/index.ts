export interface User {
  id: number;
  email: string;
}

export interface QuestionOption {
  id?: number;
  text: string;
  isCorrect?: boolean;
}

export interface Question {
  id: number;
  text: string;
  options: QuestionOption[];
}

export interface QuizResult {
  total: number;
  correct: number;
  timeTakenMs: number;
}
