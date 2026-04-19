interface SubTopic {
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

export type { SubTopic, Topic, Section };