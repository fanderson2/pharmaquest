import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import vm from 'vm';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '..', 'src', 'data');

function loadTsData(filePath, exportName) {
  let src = fs.readFileSync(filePath, 'utf8');
  // Strip import lines
  src = src.replace(/^import\s+.*?;?\s*$/gm, '');
  // Strip type annotations (: TypeName or : TypeName[])
  src = src.replace(/:\s*[A-Z][A-Za-z0-9_<>\[\]|&]+/g, '');
  // Strip export keyword
  src = src.replace(/^export\s+/gm, '');
  const script = new vm.Script(`${src}; __result = ${exportName};`);
  const ctx = vm.createContext({ __result: undefined });
  script.runInContext(ctx);
  return ctx.__result;
}

const sections = loadTsData(path.join(dataDir, 'sections.ts'), 'sections');
const questionBank = loadTsData(path.join(dataDir, 'questionBank.ts'), 'questionBank');

// Build a lookup: topicId → { sectionId, sectionTitle, topicTitle }
const topicMeta = {};
for (const section of sections) {
  for (const topic of section.topics) {
    topicMeta[topic.id] = {
      sectionId: section.id,
      sectionTitle: section.title,
      topicId: topic.id,
      topicTitle: topic.title,
    };
  }
}

function escapeCsv(value) {
  if (value == null) return '';
  const str = String(value);
  if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

const header = [
  'section_id', 'section_title', 'topic_id', 'topic_title',
  'question_id', 'question_text',
  'option_a', 'option_b', 'option_c', 'option_d', 'option_e',
  'correct_answer', 'explanation',
];

const rows = [header.join(',')];
let totalQuestions = 0;
let unmappedTopics = new Set();

for (const [topicId, questions] of Object.entries(questionBank)) {
  const meta = topicMeta[topicId];
  if (!meta) {
    unmappedTopics.add(topicId);
  }
  for (const q of questions) {
    const opts = q.options || [];
    const row = [
      meta?.sectionId ?? topicId,
      meta?.sectionTitle ?? '',
      topicId,
      meta?.topicTitle ?? topicId,
      q.id,
      q.text,
      opts[0] ?? '',
      opts[1] ?? '',
      opts[2] ?? '',
      opts[3] ?? '',
      opts[4] ?? '',
      q.correctAnswer,
      q.explanation,
    ].map(escapeCsv);
    rows.push(row.join(','));
    totalQuestions++;
  }
}

const outputPath = path.join(__dirname, '..', 'pharmaquest_questions.csv');
fs.writeFileSync(outputPath, rows.join('\n'), 'utf8');

console.log(`Exported ${totalQuestions} questions across ${Object.keys(questionBank).length} topics.`);
if (unmappedTopics.size > 0) {
  console.log(`Note: ${unmappedTopics.size} topic IDs in question bank have no matching section entry: ${[...unmappedTopics].join(', ')}`);
}
console.log(`CSV written to: ${outputPath}`);
