import { Progress, TopicProgress } from '../types/progress';

export function getTotalCompletedQuestions(
  progress: Progress,
  sectionId: string
): number {
  return Object.keys(progress)
    .filter(key => key.startsWith(`${sectionId}_`) && key.endsWith('_questions'))
    .reduce((total, key) => {
      const topicProgress = progress[key] as TopicProgress;
      if (!topicProgress) return total;
      return total + Object.values(topicProgress)
        .filter(q => q.completed && q.correct).length;
    }, 0);
}

export function getCompletedQuestionCount(
  progress: Progress,
  sectionId: string,
  topicId: string
): number {
  const topicKey = `${sectionId}_${topicId}_questions`;
  const topicProgress = progress[topicKey] as TopicProgress;
  
  if (!topicProgress) return 0;
  
  return Object.values(topicProgress)
    .filter(q => q.completed && q.correct).length;
}