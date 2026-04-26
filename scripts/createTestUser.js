import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createTestUser() {
  try {
    console.log('Creating test user...');

    // Create user with admin API
    const { data, error } = await supabase.auth.admin.createUser({
      email: 'test@pharmaquest.co.uk',
      password: 'TestUser123!',
      email_confirm: true,
      user_metadata: { name: 'Test User' },
    });

    if (error) {
      if (error.message?.includes('already been registered')) {
        console.log('ℹ️  User already exists — no changes made.');
        return;
      }
      console.error('❌ Error creating test user:', error);
      process.exit(1);
    }

    console.log('✅ Test user created successfully!');
    console.log('📧 Email: test@pharmaquest.co.uk');
    console.log('🔑 Password: TestUser123!');
    console.log('User ID:', data.user.id);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createTestUser();
