export interface QuestionProgress {
  completed: boolean;
  correct: boolean;
  lastAttempted: string;
  attempts: number;
}

export interface TopicProgress {
  [questionId: string]: QuestionProgress;
}

export interface Progress {
  [key: string]: number | TopicProgress;
}