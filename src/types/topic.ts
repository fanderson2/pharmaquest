export interface Topic {
  id: string;
  title: string;
  subtopics: string[];
}

export interface Section {
  id: string;
  title: string;
  topics: Topic[];
}