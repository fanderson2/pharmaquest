export interface SRSData {
  repetitionCount: number;
  interval: number;
  easinessFactor: number;
  nextReviewDate: Date;
  lastReviewDate: Date;
}

export interface QuestionSRSData {
  [questionId: string]: SRSData;
}

export interface UserSRSData {
  [userId: string]: QuestionSRSData;
}