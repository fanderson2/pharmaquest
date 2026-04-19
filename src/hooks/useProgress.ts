import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchUserProgress, updateUserProgress, updateQuestionProgress } from '../services/progressService';
import { Progress } from '../types/progress';

// Cache for progress data
const progressCache = new Map<string, {
  data: Progress;
  timestamp: number;
}>();

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function useProgress() {
  const { user } = useAuth();
  const [progress, setProgress] = useState<Progress>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProgress = useCallback(async (userId: string) => {
    const cached = progressCache.get(userId);
    const now = Date.now();

    // Use cached data if available and not expired
    if (cached && (now - cached.timestamp) < CACHE_DURATION) {
      setProgress(cached.data);
      setLoading(false);
      return;
    }

    try {
      const data = await fetchUserProgress(userId);
      // Update cache
      progressCache.set(userId, {
        data,
        timestamp: now
      });
      setProgress(data);
      setError(null);
    } catch (err) {
      console.error('Error loading progress:', err);
      setError('Failed to load progress data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function initProgress() {
      if (!user?.id) {
        setProgress({});
        setLoading(false);
        return;
      }

      if (isMounted) {
        await loadProgress(user.id);
      }
    }

    initProgress();
    return () => { isMounted = false; };
  }, [user?.id, loadProgress]);

  const updateProgress = async (sectionId: string, newProgress: number) => {
    if (!user?.id) return;

    try {
      await updateUserProgress(user.id, sectionId, newProgress);
      // Invalidate cache
      progressCache.delete(user.id);
      setProgress(prev => ({
        ...prev,
        [sectionId]: newProgress
      }));
      setError(null);
    } catch (err) {
      console.error('Error updating progress:', err);
      setError('Failed to update progress');
    }
  };

  const updateQuestionStatus = async (
    sectionId: string,
    topicId: string,
    questionId: string,
    isCorrect: boolean
  ) => {
    if (!user?.id) return;

    try {
      await updateQuestionProgress(user.id, sectionId, topicId, questionId, isCorrect);
      // Invalidate cache
      progressCache.delete(user.id);
      const updatedProgress = await fetchUserProgress(user.id);
      setProgress(updatedProgress);
      setError(null);
    } catch (err) {
      console.error('Error updating question status:', err);
      setError('Failed to update question status');
    }
  };

  return {
    progress,
    loading,
    error,
    updateProgress,
    updateQuestionStatus
  };
}