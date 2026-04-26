import { supabase } from '../lib/supabase';
import { Section, Topic } from '../types/topic';

interface TopicRecord {
  section_id: string;
  section_title: string;
  topic_id: string;
  topic_title: string;
  subtopic: string | null;
}

export async function fetchTopics(): Promise<Section[]> {
  try {
    const [topicsResult, rpcResult] = await Promise.all([
      supabase.from('topics').select('*').order('section_id, topic_id, subtopic'),
      supabase.rpc('get_question_topic_ids'),
    ]);

    if (topicsResult.error) {
      console.error('Supabase error:', topicsResult.error);
      throw topicsResult.error;
    }

    const data = topicsResult.data;
    if (!data || data.length === 0) {
      return [];
    }

    // Only show topics that have at least one question.
    // If the RPC fails (e.g. migration not yet applied), show all topics rather than none.
    const topicsWithQuestions: Set<string> | null =
      rpcResult.error || !rpcResult.data?.length
        ? null
        : new Set<string>(rpcResult.data.map((r: { topic_id: string }) => r.topic_id));

    // Transform the flat data into the hierarchical structure
    const sectionsMap = new Map<string, {
      id: string;
      title: string;
      topics: Map<string, {
        id: string;
        title: string;
        subtopics: Set<string>;
      }>;
    }>();

    (data as TopicRecord[])
      .filter(r => topicsWithQuestions === null || topicsWithQuestions.has(r.topic_id))
      .forEach(record => {
      // Get or create section
      if (!sectionsMap.has(record.section_id)) {
        sectionsMap.set(record.section_id, {
          id: record.section_id,
          title: record.section_title,
          topics: new Map()
        });
      }
      const section = sectionsMap.get(record.section_id)!;

      // Get or create topic
      if (!section.topics.has(record.topic_id)) {
        section.topics.set(record.topic_id, {
          id: record.topic_id,
          title: record.topic_title,
          subtopics: new Set()
        });
      }
      const topic = section.topics.get(record.topic_id)!;

      // Add subtopic if it exists
      if (record.subtopic) {
        topic.subtopics.add(record.subtopic);
      }
    });

    // Convert Maps and Sets to arrays for the final structure
    return Array.from(sectionsMap.values()).map(section => ({
      id: section.id,
      title: section.title,
      topics: Array.from(section.topics.values()).map(topic => ({
        id: topic.id,
        title: topic.title,
        subtopics: Array.from(topic.subtopics)
      }))
    }));
  } catch (error) {
    console.error('Error in fetchTopics:', error);
    throw error;
  }
}