/**
 * Reads exam-questions/*.csv and appends the questions + section entries
 * to src/data/questionBank.ts and src/data/sections.ts.
 *
 * Topic IDs are prefixed (cln_ / ecal_) to avoid collisions with existing topics.
 * Run: node scripts/importExamQuestions.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

// ── helpers ──────────────────────────────────────────────────────────────────

function parseCsv(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const lines = raw.split(/\r?\n/).filter(Boolean);
  const headers = splitCsvLine(lines[0]);
  return lines.slice(1).map(line => {
    const vals = splitCsvLine(line);
    const obj = {};
    headers.forEach((h, i) => { obj[h] = vals[i] ?? ''; });
    return obj;
  });
}

/** Handles quoted fields containing commas / newlines. */
function splitCsvLine(line) {
  const result = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { field += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      result.push(field);
      field = '';
    } else {
      field += ch;
    }
  }
  result.push(field);
  return result;
}

function toTopicId(prefix, rawId) {
  return prefix + rawId.replace(/-/g, '_');
}

function jsString(s) {
  return JSON.stringify(s);          // handles quotes, newlines, etc.
}

// ── load CSVs ─────────────────────────────────────────────────────────────────

const clinRows = parseCsv(path.join(root, 'exam-questions', 'pharmaquest-all-clinical-scenarios.csv'));
const calRows  = parseCsv(path.join(root, 'exam-questions', 'pharmaquest-all-180-calculations.csv'));

// ── group by topic ────────────────────────────────────────────────────────────

function groupByTopic(rows, prefix) {
  const map = new Map(); // topicId → { title, questions[] }
  for (const row of rows) {
    const tid = toTopicId(prefix, row.topic_id);
    if (!map.has(tid)) map.set(tid, { title: row.topic_title, questions: [] });
    const opts = [row.option_a, row.option_b, row.option_c, row.option_d, row.option_e]
      .filter(o => o && o.trim());
    map.get(tid).questions.push({
      id: row.question_id,
      text: row.question_text,
      options: opts,
      correctAnswer: row.correct_answer,
      explanation: row.explanation,
    });
  }
  return map;
}

const clinTopics = groupByTopic(clinRows, 'cln_');
const calTopics  = groupByTopic(calRows,  'ecal_');

// ── build questionBank additions ──────────────────────────────────────────────

function renderTopicEntry(topicId, questions) {
  const qs = questions.map(q => {
    const optsJs = q.options.map(o => `    ${jsString(o)}`).join(',\n');
    return `  {
    "id": ${jsString(q.id)},
    "text": ${jsString(q.text)},
    "options": [\n${optsJs}\n  ],
    "correctAnswer": ${jsString(q.correctAnswer)},
    "explanation": ${jsString(q.explanation)}
  }`;
  }).join(',\n');
  return `  ${jsString(topicId)}: [\n${qs}\n  ]`;
}

const bankEntries = [];
for (const [tid, data] of clinTopics) bankEntries.push(renderTopicEntry(tid, data.questions));
for (const [tid, data] of calTopics)  bankEntries.push(renderTopicEntry(tid, data.questions));

// Append to questionBank.ts — insert before the closing `};`
const bankPath = path.join(root, 'src', 'data', 'questionBank.ts');
let bankSrc = fs.readFileSync(bankPath, 'utf8');

const bankInsert = ',\n' + bankEntries.join(',\n');
// Insert just before the final `};`
bankSrc = bankSrc.replace(/\n\};?\s*$/, `${bankInsert}\n};\n`);
fs.writeFileSync(bankPath, bankSrc, 'utf8');
console.log(`questionBank.ts updated (+${bankEntries.length} topic keys)`);

// ── build sections additions ──────────────────────────────────────────────────

function renderSectionEntry(sectionId, sectionTitle, topicsMap) {
  const topicsJs = [...topicsMap.entries()].map(([tid, data]) => {
    return `      {
        "id": ${jsString(tid)},
        "title": ${jsString(data.title)},
        "subtopics": []
      }`;
  }).join(',\n');
  return `  {
    "id": ${jsString(sectionId)},
    "title": ${jsString(sectionTitle)},
    "topics": [\n${topicsJs}\n    ]
  }`;
}

const sectionEntries = [
  renderSectionEntry('CLN', 'Clinical Scenario Exam Questions', clinTopics),
  renderSectionEntry('ECAL', 'Exam Calculation Questions', calTopics),
];

const sectionsPath = path.join(root, 'src', 'data', 'sections.ts');
let sectionsSrc = fs.readFileSync(sectionsPath, 'utf8');

const sectionsInsert = ',\n' + sectionEntries.join(',\n');
sectionsSrc = sectionsSrc.replace(/\n\];\s*$/, `${sectionsInsert}\n];\n`);
fs.writeFileSync(sectionsPath, sectionsSrc, 'utf8');
console.log(`sections.ts updated (+2 sections: CLN, ECAL)`);

// ── summary ───────────────────────────────────────────────────────────────────
const clinQ = clinRows.length;
const calQ  = calRows.length;
console.log(`Done. Added ${clinQ} clinical scenario questions and ${calQ} calculation questions.`);
