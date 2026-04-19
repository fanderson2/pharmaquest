import fs from 'fs';
import { parse } from 'csv-parse';
import path from 'path';

const BATCH_SIZE = 500;

async function processFile(filePath) {
  const questions = new Map();
  let currentBatch = [];
  let totalProcessed = 0;

  const parser = fs
    .createReadStream(filePath)
    .pipe(parse({
      delimiter: ',',
      columns: true,
      skip_empty_lines: true,
      trim: true
    }));

  for await (const record of parser) {
    currentBatch.push(record);
    
    if (currentBatch.length >= BATCH_SIZE) {
      processBatch(currentBatch, questions);
      totalProcessed += currentBatch.length;
      console.log(`Processed ${totalProcessed} questions from ${path.basename(filePath)}...`);
      currentBatch = [];
    }
  }

  // Process remaining records
  if (currentBatch.length > 0) {
    processBatch(currentBatch, questions);
    totalProcessed += currentBatch.length;
    console.log(`Processed ${totalProcessed} questions from ${path.basename(filePath)}...`);
  }

  return questions;
}

function processBatch(batch, questions) {
  batch.forEach(record => {
    const {
      topic_id,
      question_id,
      question_text,
      option_1,
      option_2,
      option_3,
      option_4,
      option_5,
      correct_answer,
      explanation
    } = record;

    if (!questions.has(topic_id)) {
      questions.set(topic_id, []);
    }

    const options = [option_1, option_2, option_3, option_4, option_5]
      .filter(option => option && option.trim() !== '');

    questions.get(topic_id).push({
      id: question_id,
      text: question_text,
      options,
      correctAnswer: correct_answer,
      explanation
    });
  });
}

function mergeQuestionMaps(maps) {
  const merged = new Map();
  
  maps.forEach(map => {
    map.forEach((questions, topicId) => {
      if (!merged.has(topicId)) {
        merged.set(topicId, []);
      }
      merged.get(topicId).push(...questions);
    });
  });

  return merged;
}

function transformToQuestionsStructure(questionsMap) {
  const result = {};
  for (const [topicId, topicQuestions] of questionsMap.entries()) {
    if (topicId && topicQuestions.length > 0) {
      result[topicId] = topicQuestions;
    }
  }
  return result;
}

async function main() {
  try {
    console.log('Starting quiz questions import...');
    
    const dataDir = path.join(process.cwd(), 'data');
    const outputDir = path.join(process.cwd(), 'src', 'data');
    
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Process all CSV files in the data directory
    const files = fs.readdirSync(dataDir)
      .filter(file => file.startsWith('quiz_questions_') && file.endsWith('.csv'));

    console.log(`Found ${files.length} question files to process...`);

    const questionMaps = await Promise.all(
      files.map(file => processFile(path.join(dataDir, file)))
    );

    console.log('Merging question data...');
    const mergedQuestions = mergeQuestionMaps(questionMaps);
    const questionsData = transformToQuestionsStructure(mergedQuestions);

    // Generate output files
    const typesContent = `export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface QuestionBank {
  [topicId: string]: Question[];
}`;

    const dataContent = `import type { QuestionBank } from './questionTypes';

export const questionBank: QuestionBank = ${JSON.stringify(questionsData, null, 2)};`;

    console.log('Writing output files...');
    await Promise.all([
      fs.promises.writeFile(path.join(outputDir, 'questionTypes.ts'), typesContent),
      fs.promises.writeFile(path.join(outputDir, 'questionBank.ts'), dataContent)
    ]);

    const totalQuestions = Object.values(questionsData)
      .reduce((acc, questions) => acc + questions.length, 0);

    console.log('✅ Successfully imported quiz questions');
    console.log(`Total topics: ${Object.keys(questionsData).length}`);
    console.log(`Total questions: ${totalQuestions}`);
  } catch (error) {
    console.error('❌ Error importing quiz questions:', error);
    process.exit(1);
  }
}

main();