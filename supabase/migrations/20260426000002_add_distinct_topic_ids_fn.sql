-- Returns the distinct set of topic_ids that have at least one question.
-- Called by topicService to filter the topic list to only show quizzable topics.
create or replace function get_question_topic_ids()
returns table(topic_id text)
language sql
security definer
set search_path = public, pg_temp
as $$
  select distinct topic_id from question_table order by topic_id;
$$;
