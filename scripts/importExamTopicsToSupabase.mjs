/**
 * Inserts CLN and ECAL topic rows into Supabase's `topics` table.
 * Safe to re-run — deletes existing CLN/ECAL rows first, then re-inserts.
 *
 * Run: node scripts/importExamTopicsToSupabase.mjs
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function parseCsv(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const lines = raw.split(/\r?\n/).filter(Boolean);
  const headers = splitLine(lines[0]);
  return lines.slice(1).map(line => {
    const vals = splitLine(line);
    const obj = {};
    headers.forEach((h, i) => { obj[h] = vals[i] ?? ''; });
    return obj;
  });
}

function splitLine(line) {
  const result = [];
  let field = '', inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { field += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) { result.push(field); field = ''; }
    else field += ch;
  }
  result.push(field);
  return result;
}

function toTopicId(prefix, rawId) {
  return prefix + rawId.replace(/-/g, '_');
}

const clinRows = parseCsv(path.join(__dirname, '..', 'exam-questions', 'pharmaquest-all-clinical-scenarios.csv'));
const calRows  = parseCsv(path.join(__dirname, '..', 'exam-questions', 'pharmaquest-all-180-calculations.csv'));

// Build unique topic rows (one row per topic with null subtopic)
function buildTopicRows(rows, sectionId, sectionTitle, prefix) {
  const seen = new Set();
  const out = [];
  for (const row of rows) {
    const topicId = toTopicId(prefix, row.topic_id);
    if (seen.has(topicId)) continue;
    seen.add(topicId);
    out.push({
      section_id: sectionId,
      section_title: sectionTitle,
      topic_id: topicId,
      topic_title: row.topic_title,
      subtopic: null,
    });
  }
  return out;
}

const clinTopicRows = buildTopicRows(clinRows, 'CLN', 'Clinical Scenario Exam Questions', 'cln_');
const calTopicRows  = buildTopicRows(calRows,  'ECAL', 'Exam Calculation Questions',       'ecal_');
const allRows = [...clinTopicRows, ...calTopicRows];

async function run() {
  // Remove any previously inserted CLN/ECAL rows so re-runs stay clean
  for (const sectionId of ['CLN', 'ECAL']) {
    const { error } = await supabase.from('topics').delete().eq('section_id', sectionId);
    if (error) { console.error(`Failed to delete existing ${sectionId} rows:`, error.message); process.exit(1); }
  }
  console.log('Cleared existing CLN/ECAL topic rows.');

  // Insert in batches of 50
  const batchSize = 50;
  for (let i = 0; i < allRows.length; i += batchSize) {
    const batch = allRows.slice(i, i + batchSize);
    const { error } = await supabase.from('topics').insert(batch);
    if (error) { console.error('Insert error:', error.message); process.exit(1); }
    console.log(`Inserted ${Math.min(i + batchSize, allRows.length)} / ${allRows.length} topic rows…`);
  }

  console.log(`\n✅ Done. Inserted ${clinTopicRows.length} CLN topics and ${calTopicRows.length} ECAL topics.`);
}

run();
