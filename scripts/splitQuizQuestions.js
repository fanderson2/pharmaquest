import fs from 'fs';
import { parse } from 'csv-parse';
import { stringify } from 'csv-stringify';
import path from 'path';

const QUESTIONS_PER_FILE = 2000;

async function splitFile(inputFile) {
  const records = [];
  let fileCounter = 1;
  let currentBatch = [];
  
  const parser = fs
    .createReadStream(inputFile)
    .pipe(parse({
      delimiter: ',',
      columns: true,
      skip_empty_lines: true,
      trim: true
    }));

  // Get header row
  const headerRow = await new Promise(resolve => {
    parser.once('headers', headers => resolve(headers));
  });

  for await (const record of parser) {
    currentBatch.push(record);
    
    if (currentBatch.length >= QUESTIONS_PER_FILE) {
      await writeChunkToFile(currentBatch, fileCounter, headerRow);
      console.log(`Written file ${fileCounter} with ${currentBatch.length} questions`);
      fileCounter++;
      currentBatch = [];
    }
  }

  // Write remaining records
  if (currentBatch.length > 0) {
    await writeChunkToFile(currentBatch, fileCounter, headerRow);
    console.log(`Written file ${fileCounter} with ${currentBatch.length} questions`);
  }
}

async function writeChunkToFile(records, fileNumber, headers) {
  const outputFile = path.join(
    process.cwd(), 
    'data', 
    `quiz_questions_${String(fileNumber).padStart(3, '0')}.csv`
  );

  return new Promise((resolve, reject) => {
    stringify(
      records, 
      { 
        header: true,
        columns: headers
      },
      (err, output) => {
        if (err) reject(err);
        fs.writeFile(outputFile, output, (err) => {
          if (err) reject(err);
          resolve();
        });
      }
    );
  });
}

async function main() {
  try {
    console.log('Starting to split quiz questions file...');
    
    const inputFile = path.join(process.cwd(), 'data', 'quiz_questions.csv');
    
    if (!fs.existsSync(inputFile)) {
      throw new Error('Input file quiz_questions.csv not found!');
    }

    await splitFile(inputFile);
    console.log('✅ Successfully split quiz questions into multiple files');
  } catch (error) {
    console.error('❌ Error splitting quiz questions:', error);
    process.exit(1);
  }
}

main();