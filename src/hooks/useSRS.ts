import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { SRSData, QuestionSRSData } from '../types/srs';
import { fetchUserSRSData, updateUserSRSData } from '../services/srsService';
import { calculateNextInterval, calculateNewEasinessFactor, getDefaultSRSData } from '../utils/srsCalculator';

export function useSRS() {
  const { user } = useAuth();
  const [srsData, setSRSData] = useState<QuestionSRSData>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadSRSData() {
      if (!user?.id) {
        setSRSData({});
        setLoading(false);
        return;
      }

      try {
        const data = await fetchUserSRSData(user.id);
        if (isMounted) {
          setSRSData(data);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error loading SRS data:', err);
          setError('Failed to load learning data');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadSRSData();
    return () => { isMounted = false; };
  }, [user?.id]); // Changed from user to user?.id

  const updateQuestionSRS = async (questionId: string, isCorrect: boolean) => {
    if (!user?.id) return;

    try {
      const currentData = srsData[questionId] || getDefaultSRSData();
      const newData: SRSData = {
        repetitionCount: isCorrect ? currentData.repetitionCount + 1 : 0,
        interval: 1,
        easinessFactor: calculateNewEasinessFactor(currentData.easinessFactor, isCorrect),
        lastReviewDate: new Date(),
        nextReviewDate: new Date()
      };

      const daysToAdd = calculateNextInterval(
        newData.repetitionCount,
        currentData.interval,
        newData.easinessFactor
      );
      
      newData.interval = daysToAdd;
      newData.nextReviewDate.setDate(newData.nextReviewDate.getDate() + daysToAdd);

      await updateUserSRSData(user.id, questionId, newData);
      setSRSData(prev => ({
        ...prev,
        [questionId]: newData
      }));
      setError(null);
    } catch (err) {
      console.error('Error updating SRS data:', err);
      setError('Failed to update learning progress');
    }
  };

  const getDueQuestions = (questions: string[]): string[] => {
    if (!user?.id) return questions;
    
    const now = new Date();
    return questions.filter(questionId => {
      const questionData = srsData[questionId];
      if (!questionData) return true;
      return questionData.nextReviewDate <= now;
    });
  };

  return {
    srsData,
    loading,
    error,
    updateQuestionSRS,
    getDueQuestions
  };
}