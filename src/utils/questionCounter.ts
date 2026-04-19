import { questionBank } from '../data/questionBank';
import { sections } from '../data/sections';
import { Progress, TopicProgress } from '../types/progress';

export function getQuestionCountForSection(sectionId: string): number {
  // Get all topic IDs for this section
  const section = sections.find(s => s.id === sectionId);
  if (!section) return 0;

  // Sum up questions for all topics in this section
  return section.topics.reduce((total, topic) => {
    const topicQuestions = questionBank[topic.id] || [];
    return total + topicQuestions.length;
  }, 0);
}

export function getQuestionCountForTopic(topicId: string, subtopic?: string): number {
  const questions = questionBank[topicId] || [];
  
  if (subtopic) {
    return questions.filter(q => 
      q.text.toLowerCase().includes(subtopic.toLowerCase())
    ).length;
  }
  
  return questions.length;
}

export function getAvailableQuestionCount(
  topicId: string, 
  progress: Progress, 
  sectionId: string,
  subtopic?: string
): number {
  const allQuestions = questionBank[topicId] || [];
  const topicKey = `${sectionId}_${topicId}_questions`;
  const topicProgress = progress[topicKey] as TopicProgress;

  // Filter questions based on progress
  const availableQuestions = allQuestions.filter(question => {
    if (!topicProgress) return true;
    const questionProgress = topicProgress[question.id];
    return !questionProgress || !questionProgress.correct;
  });

  // Apply subtopic filter if specified
  if (subtopic) {
    return availableQuestions.filter(q => 
      q.text.toLowerCase().includes(subtopic.toLowerCase())
    ).length;
  }

  return availableQuestions.length;
}