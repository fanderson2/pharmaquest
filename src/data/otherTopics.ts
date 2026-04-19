export interface SubTopic {
  name: string;
}

export interface Topic {
  id: string;
  name: string;
  subTopics: SubTopic[];
}

export const mepTopics: Topic[] = [
  {
    id: '1',
    name: 'Classification of Medicines',
    subTopics: [
      { name: 'By Therapeutic Use: e.g., analgesics, antibiotics, antihypertensives' },
      { name: 'By Chemical Structure: e.g., beta-lactams, benzodiazepines' },
      { name: 'By Legal Category: e.g., Prescription Only Medicines (POM), Pharmacy Medicines (P), General Sales List (GSL)' }
    ]
  },
  {
    id: '2',
    name: 'Pharmacology and Therapeutics',
    subTopics: [
      { name: 'Mechanisms of Action' },
      { name: 'Pharmacokinetics: Absorption, distribution, metabolism, excretion' },
      { name: 'Pharmacodynamics' },
      { name: 'Dose-Response Relationships' }
    ]
  },
  {
    id: '3',
    name: 'Prescribing and Dispensing Medicines',
    subTopics: [
      { name: 'Prescription Writing and Interpretation' },
      { name: 'Dispensing Procedures' },
      { name: 'Record-Keeping and Documentation' },
      { name: 'Supply of Prescription-Only Medicines (POMs)' }
    ]
  },
  {
    id: '4',
    name: 'Medicines Management Systems',
    subTopics: [
      { name: 'Stock Control and Inventory Management' },
      { name: 'Ordering and Storage Requirements' },
      { name: 'Expiry Date Management' },
      { name: 'Pharmaceutical Waste Disposal' }
    ]
  },
  {
    id: '5',
    name: 'Patient Counseling and Education',
    subTopics: [
      { name: 'Effective Communication Techniques' },
      { name: 'Providing Medication Instructions' },
      { name: 'Managing Patient Queries and Concerns' },
      { name: 'Ensuring Adherence to Therapy' }
    ]
  },
  {
    id: '6',
    name: 'Adverse Drug Reactions (ADRs) and Interactions',
    subTopics: [
      { name: 'Identifying and Managing ADRs' },
      { name: 'Drug-Drug Interactions' },
      { name: 'Drug-Food Interactions' },
      { name: 'Reporting ADRs' }
    ]
  },
  {
    id: '7',
    name: 'Legal and Ethical Considerations',
    subTopics: [
      { name: 'Medicines Act and Related Legislation' },
      { name: 'Confidentiality and Data Protection' },
      { name: 'Ethical Principles in Pharmacy Practice' },
      { name: 'Patient Consent and Autonomy' }
    ]
  },
  {
    id: '8',
    name: 'Over-the-Counter (OTC) Medicines',
    subTopics: [
      { name: 'Classification and Regulation' },
      { name: 'Common OTC Medications and Uses' },
      { name: 'Safety and Appropriate Use' },
      { name: 'When to Refer to a Healthcare Professional' }
    ]
  },
  {
    id: '9',
    name: 'Controlled Drugs Management',
    subTopics: [
      { name: 'Scheduling and Classification' },
      { name: 'Storage and Security Requirements' },
      { name: 'Record-Keeping and Compliance' },
      { name: 'Dispensing Protocols' }
    ]
  },
  {
    id: '10',
    name: 'Vaccines and Immunizations',
    subTopics: [
      { name: 'Types of Vaccines' },
      { name: 'Administration Techniques' },
      { name: 'Storage and Handling' },
      { name: 'Patient Education and Consent' }
    ]
  }
];

export const otcConditions: Topic[] = [
  {
    id: '1',
    name: 'Pain and Inflammation',
    subTopics: [
      { name: 'Headaches (Tension, Migraine)' },
      { name: 'Musculoskeletal Pain (Back Pain, Joint Pain)' },
      { name: 'Menstrual Cramps' }
    ]
  },
  {
    id: '2',
    name: 'Cold and Flu',
    subTopics: [
      { name: 'Common Cold' },
      { name: 'Influenza' }
    ]
  },
  {
    id: '3',
    name: 'Gastrointestinal Disorders',
    subTopics: [
      { name: 'Indigestion/Heartburn (Dyspepsia)' },
      { name: 'Constipation' },
      { name: 'Diarrhea' },
      { name: 'Nausea and Vomiting' },
      { name: 'Motion Sickness' }
    ]
  },
  {
    id: '4',
    name: 'Dermatological Conditions',
    subTopics: [
      { name: 'Acne' },
      { name: 'Eczema and Dermatitis' },
      { name: 'Minor Burns and Wounds' },
      { name: 'Fungal Infections (e.g., Athlete\'s Foot)' }
    ]
  },
  {
    id: '5',
    name: 'Allergic Conditions',
    subTopics: [
      { name: 'Seasonal Allergies (Hay Fever)' },
      { name: 'Allergic Rhinitis' }
    ]
  }
];

export const otcMedications: Topic[] = [
  {
    id: '1',
    name: 'Analgesics (Pain Relievers)',
    subTopics: [
      { name: 'Paracetamol (Acetaminophen)' },
      { name: 'Ibuprofen' },
      { name: 'Aspirin' },
      { name: 'Naproxen' }
    ]
  },
  {
    id: '2',
    name: 'Anti-Inflammatories',
    subTopics: [
      { name: 'Ibuprofen' },
      { name: 'Diclofenac Gel' }
    ]
  },
  {
    id: '3',
    name: 'Decongestants',
    subTopics: [
      { name: 'Pseudoephedrine' },
      { name: 'Phenylephrine' }
    ]
  },
  {
    id: '4',
    name: 'Antihistamines',
    subTopics: [
      { name: 'Loratadine' },
      { name: 'Cetirizine' },
      { name: 'Chlorphenamine' }
    ]
  },
  {
    id: '5',
    name: 'Cough Suppressants and Expectorants',
    subTopics: [
      { name: 'Dextromethorphan' },
      { name: 'Guaifenesin' }
    ]
  }
];

export interface CalculationSubTopic {
  name: string;
}

export interface CalculationTopic {
  id: string;
  name: string;
  subTopics: CalculationSubTopic[];
}

// Rest of the calculations array remains the same...

export const ipCourse = {
  name: 'Independent Prescribing Course',
  items: [
    'Clinical Assessment',
    'Prescribing Framework',
    'Consultation Skills',
    'Clinical Decision Making',
    'Prescribing Governance',
    'Professional Accountability',
    'Evidence-Based Practice',
    'Clinical Management Plans'
  ]
};