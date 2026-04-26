import fs from 'fs';
import { parse } from 'csv-parse';
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Supabase client with service role key (required: question_table is
// restricted to service_role writes by the final RLS migration).
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

const BATCH_SIZE = 100;

async function importQuestions() {
  try {
    console.log('Starting questions import...');
    
    const dataDir = path.join(process.cwd(), 'data');
    const files = fs.readdirSync(dataDir)
      .filter(file => file.startsWith('quiz_questions_') && file.endsWith('.csv'));

    console.log(`Found ${files.length} question files to process...`);

    let totalImported = 0;

    for (const file of files) {
      const filePath = path.join(dataDir, file);
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
          question_id: record.question_id,
          topic_id: record.topic_id,
          question_text: record.question_text,
          option_1: record.option_1,
          option_2: record.option_2,
          option_3: record.option_3,
          option_4: record.option_4,
          option_5: record.option_5 || null,
          correct_answer: record.correct_answer,
          explanation: record.explanation
        });

        // Import in batches
        if (records.length >= BATCH_SIZE) {
          const { error } = await supabase
            .from('question_table')
            .upsert(records, {
              onConflict: 'question_id',
              ignoreDuplicates: false
            });

          if (error) throw error;

          totalImported += records.length;
          console.log(`Imported ${totalImported} questions...`);
          records.length = 0; // Clear array
        }
      }

      // Import remaining records
      if (records.length > 0) {
        const { error } = await supabase
          .from('question_table')
          .upsert(records, {
            onConflict: 'question_id',
            ignoreDuplicates: false
          });

        if (error) throw error;

        totalImported += records.length;
        console.log(`Imported ${totalImported} questions...`);
      }
    }

    console.log('✅ Successfully imported questions to Supabase');
    console.log(`Total questions imported: ${totalImported}`);
  } catch (error) {
    console.error('❌ Error importing questions:', error);
    process.exit(1);
  }
}

importQuestions();