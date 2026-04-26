import fs from 'fs';
import { parse } from 'csv-parse';
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Supabase client with service role key (required: topics table is
// restricted to service_role writes by the final RLS migration).
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function importTopics() {
  try {
    console.log('Starting topics import...');
    
    const filePath = path.join(process.cwd(), 'data', 'topics.csv');
    const records = [];

    // Parse CSV file
    const parser = fs
      .createReadStream(filePath)
      .pipe(parse({
        delimiter: ',',
        columns: true,
        skip_empty_lines: true,
        trim: true
      }));

    for await (const record of parser) {
      records.push({
        section_id: record.section_id,
        section_title: record.section_title,
        topic_id: record.topic_id,
        topic_title: record.topic_title,
        subtopic: record.subtopic || null
      });
    }

    // Clear existing data
    console.log('Clearing existing topics...');
    const { error: deleteError } = await supabase
      .from('topics')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records

    if (deleteError) {
      throw deleteError;
    }

    // Insert records in batches of 100
    const batchSize = 100;
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      const { error } = await supabase
        .from('topics')
        .insert(batch);

      if (error) {
        throw error;
      }

      console.log(`Imported ${Math.min(i + batchSize, records.length)} of ${records.length} records...`);
    }

    console.log('✅ Successfully imported topics to Supabase');
  } catch (error) {
    console.error('❌ Error importing topics:', error);
    process.exit(1);
  }
}

importTopics();