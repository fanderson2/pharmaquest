import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { auth } from '../lib/firebase/init';
import * as authService from '../services/auth';
import { AppError } from '../utils/errors';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const handleError = (error: unknown) => {
    if (error instanceof AppError) {
      setError(error.message);
    } else {
      setError('An unexpected error occurred');
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      await authService.signIn(email, password);
    } catch (error) {
      handleError(error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      setError(null);
      await authService.signUp(email, password, name);
    } catch (error) {
      handleError(error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      setError(null);
      await authService.signOut();
    } catch (error) {
      handleError(error);
    }
  };

  return {
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut
  };
}