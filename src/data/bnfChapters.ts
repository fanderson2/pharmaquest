interface Chapter {
  id: string;
  title: string;
  subtopics: string[];
}

export const bnfChapters: Chapter[] = [
  {
    id: "anaesthesia",
    title: "1. Anaesthesia and Intensive Care",
    subtopics: [
      "General Anaesthesia",
      "Local Anaesthetics",
      "Sedation",
      "Analgesia in Intensive Care",
      "Muscle Relaxants",
      "Anaesthetic Equipment and Agents",
      "Emergency Drugs"
    ]
  },
  {
    id: "antimicrobial",
    title: "2. Antimicrobial Agents",
    subtopics: [
      "Antibiotics",
      "Antivirals",
      "Antifungals",
      "Antiparasitics",
      "Mechanisms of Action",
      "Clinical Guidelines for Use"
    ]
  }
  // Add remaining chapters...
];