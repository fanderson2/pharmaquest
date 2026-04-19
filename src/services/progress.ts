import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase/init';
import { AppError } from '../utils/errors';
import type { Progress, QuestionProgress } from '../types/progress';

export async function getProgress(userId: string): Promise<Progress> {
  try {
    const docRef = doc(db, 'progress', userId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      const initialProgress: Progress = {};
      await setDoc(docRef, initialProgress);
      return initialProgress;
    }

    return docSnap.data() as Progress;
  } catch (error) {
    throw AppError.fromFirebaseError(error);
  }
}

export async function updateProgress(userId: string, sectionId: string, progress: number) {
  try {
    const docRef = doc(db, 'progress', userId);
    await updateDoc(docRef, { [sectionId]: progress });
  } catch (error) {
    throw AppError.fromFirebaseError(error);
  }
}

export async function updateQuestionStatus(
  userId: string,
  sectionId: string,
  topicId: string,
  questionId: string,
  isCorrect: boolean
) {
  try {
    const docRef = doc(db, 'progress', userId);
    const topicKey = `${sectionId}_${topicId}_questions`;
    
    const docSnap = await getDoc(docRef);
    const currentProgress = docSnap.exists() ? (docSnap.data() as Progress) : {};
    const topicProgress = currentProgress[topicKey] || {};
    
    const questionProgress: QuestionProgress = {
      completed: true,
      correct: isCorrect,
      lastAttempted: new Date().toISOString(),
      attempts: (topicProgress[questionId]?.attempts || 0) + 1
    };
    
    await updateDoc(docRef, {
      [topicKey]: {
        ...topicProgress,
        [questionId]: questionProgress
      }
    });
  } catch (error) {
    throw AppError.fromFirebaseError(error);
  }
}