import fs from 'fs';
import { parse } from 'csv-parse';
import path from 'path';

const processFile = async (filePath) => {
  const records = [];
  const parser = fs
    .createReadStream(filePath)
    .pipe(parse({
      delimiter: ',',
      columns: true,
      skip_empty_lines: true,
      trim: true
    }));

  for await (const record of parser) {
    records.push(record);
  }
  return records;
};

const transformToTopicsStructure = (csvRecords) => {
  const sections = new Map();

  csvRecords.forEach(record => {
    const {
      section_id,
      section_title,
      topic_id,
      topic_title,
      subtopic
    } = record;

    if (!sections.has(section_id)) {
      sections.set(section_id, {
        id: section_id,
        title: section_title,
        topics: new Map()
      });
    }

    const section = sections.get(section_id);
    
    if (!section.topics.has(topic_id)) {
      section.topics.set(topic_id, {
        id: topic_id,
        title: topic_title,
        subtopics: new Set()
      });
    }

    if (subtopic) {
      section.topics.get(topic_id).subtopics.add(subtopic);
    }
  });

  // Convert to final format
  return Array.from(sections.values()).map(section => ({
    id: section.id,
    title: section.title,
    topics: Array.from(section.topics.values()).map(topic => ({
      id: topic.id,
      title: topic.title,
      subtopics: Array.from(topic.subtopics)
    }))
  }));
};

const generateTypeScriptInterface = () => {
  return `interface SubTopic {
  name: string;
}

interface Topic {
  id: string;
  title: string;
  subtopics: string[];
}

interface Section {
  id: string;
  title: string;
  topics: Topic[];
}

export type { SubTopic, Topic, Section };`;
};

const main = async () => {
  try {
    // Ensure the data directory exists
    const dataDir = path.join(process.cwd(), 'src', 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Process CSV file
    const csvPath = path.join(process.cwd(), 'data', 'topics.csv');
    const records = await processFile(csvPath);
    const topicsData = transformToTopicsStructure(records);

    // Generate TypeScript files
    const typesContent = generateTypeScriptInterface();
    const dataContent = `import { Section } from './types';

export const sections: Section[] = ${JSON.stringify(topicsData, null, 2)};`;

    // Write files
    fs.writeFileSync(
      path.join(dataDir, 'types.ts'),
      typesContent
    );

    fs.writeFileSync(
      path.join(dataDir, 'sections.ts'),
      dataContent
    );

    console.log('✅ Successfully imported topics data');
  } catch (error) {
    console.error('❌ Error importing topics:', error);
    process.exit(1);
  }
};

main();