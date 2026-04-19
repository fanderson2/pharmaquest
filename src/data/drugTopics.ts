interface DrugTopic {
  id: string;
  title: string;
  subtopics: string[];
}

export const top100Drugs: DrugTopic[] = [
  {
    id: "analgesics",
    title: "1. Analgesics and Anti-Inflammatories",
    subtopics: [
      "Paracetamol (Acetaminophen)",
      "Ibuprofen",
      "Aspirin",
      "Naproxen",
      "Diclofenac",
      "Celecoxib",
      "Mefenamic Acid",
      "Codeine",
      "Tramadol",
      "Morphine"
    ]
  },
  {
    id: "antibiotics",
    title: "2. Antibiotics",
    subtopics: [
      "Amoxicillin",
      "Cefalexin",
      "Clarithromycin",
      "Doxycycline",
      "Ciprofloxacin",
      "Azithromycin",
      "Co-amoxiclav (Amoxicillin/Clavulanic Acid)",
      "Erythromycin",
      "Metronidazole",
      "Trimethoprim/Sulfamethoxazole"
    ]
  }
  // Add remaining drug topics...
];