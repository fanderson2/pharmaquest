import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// Module-level cache so the DB is only queried once per session.
let _cached: string | null = null;

/** Returns the topic_id of the one free trial topic (first in section/topic order). */
export function useFreeTopic(): string | null {
  const [freeTopicId, setFreeTopicId] = useState<string | null>(_cached);

  useEffect(() => {
    if (_cached) return;
    supabase
      .from('topics')
      .select('topic_id')
      .order('section_id', { ascending: true })
      .order('topic_id', { ascending: true })
      .limit(1)
      .single()
      .then(({ data }) => {
        if (data?.topic_id) {
          _cached = data.topic_id;
          setFreeTopicId(data.topic_id);
        }
      });
  }, []);

  return freeTopicId;
}
