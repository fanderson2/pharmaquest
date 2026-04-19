import { supabase } from '../lib/supabase';
import { AppError } from '../utils/errors';

export async function signUp(email: string, password: string, name: string) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name
        }
      }
    });

    if (error) throw error;
    return data.user;
  } catch (error: any) {
    if (error.message?.includes('already registered')) {
      throw new AppError('Email already in use', 'AUTH_EMAIL_EXISTS');
    }
    throw AppError.fromSupabaseError(error);
  }
}

export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      if (error.message?.includes('Invalid login credentials')) {
        throw new AppError('Invalid email or password', 'AUTH_INVALID_CREDENTIALS');
      }
      throw error;
    }
    return data.user;
  } catch (error: any) {
    if (error instanceof AppError) {
      throw error;
    }
    throw AppError.fromSupabaseError(error);
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error) {
    throw AppError.fromSupabaseError(error);
  }
}