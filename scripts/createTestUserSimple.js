import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createTestUser() {
  try {
    console.log('Creating test user account...');

    // First check if user already exists by trying to sign in
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'test@example.com',
      password: 'test123'
    });

    if (signInData?.user) {
      console.log('✅ Test user already exists!');
      console.log('📧 Email: test@example.com');
      console.log('🔑 Password: test123');
      console.log('User ID:', signInData.user.id);
      await supabase.auth.signOut();
      return;
    }

    // Create new user
    const { data, error } = await supabase.auth.signUp({
      email: 'test@example.com',
      password: 'test123',
      options: {
        emailRedirectTo: undefined
      }
    });

    if (error) {
      console.error('❌ Error creating test user:', error.message);
      process.exit(1);
    }

    console.log('✅ Test user created successfully!');
    console.log('📧 Email: test@example.com');
    console.log('🔑 Password: test123');
    console.log('User ID:', data.user?.id);

    // Sign out after creation
    await supabase.auth.signOut();

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createTestUser();
