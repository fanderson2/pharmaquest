import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// Module-level cache — one Set per session, keyed by first topic_id per section.
let _cached: Set<string> | null = null;

/** Returns the Set of free trial topic_ids (first topic of each section). Null while loading. */
export function useFreeTopic(): Set<string> | null {
  const [freeTopicIds, setFreeTopicIds] = useState<Set<string> | null>(_cached);

  useEffect(() => {
    if (_cached) return;
    supabase
      .from('topics')
      .select('section_id, topic_id')
      .order('section_id', { ascending: true })
      .order('topic_id', { ascending: true })
      .then(({ data }) => {
        const ids = new Set<string>();
        const seen = new Set<string>();
        for (const row of data ?? []) {
          if (!seen.has(row.section_id)) {
            seen.add(row.section_id);
            ids.add(row.topic_id);
          }
        }
        _cached = ids;
        setFreeTopicIds(ids);
      });
  }, []);

  return freeTopicIds;
}
