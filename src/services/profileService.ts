import { supabase } from '../lib/supabase';
import type { Profile } from '../types/profile';

export async function deleteAccount(): Promise<void> {
  // Deletion is performed server-side by the delete-account Edge Function,
  // which uses the SERVICE_ROLE_KEY to delete public data AND auth.users.
  const { error } = await supabase.functions.invoke('delete-account')
  if (error) throw new Error(error.message ?? 'Failed to delete account')
}

export async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  return data;
}

export async function upsertProfile(
  userId: string,
  updates: Partial<Omit<Profile, 'user_id' | 'created_at' | 'updated_at'>>,
): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .upsert({ user_id: userId, ...updates }, { onConflict: 'user_id' });
  if (error) throw error;
}
