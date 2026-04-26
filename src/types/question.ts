export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  topicId?: string; // set in focus-mode questions to record correct topic
}