export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface QuestionBank {
  [topicId: string]: Question[];
}