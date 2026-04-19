export interface DrugSubTopic {
  name: string;
}

export interface DrugTopic {
  id: string;
  name: string;
  subTopics: DrugSubTopic[];
}

export const highRiskMeds: DrugTopic[] = [
  {
    id: '1',
    name: 'Anticoagulants',
    subTopics: [
      { name: 'Vitamin K Antagonists' },
      { name: 'Heparins' },
      { name: 'Direct Oral Anticoagulants (DOACs)' },
      { name: 'Direct Thrombin Inhibitors' }
    ]
  },
  {
    id: '2',
    name: 'Insulins and Oral Hypoglycemics',
    subTopics: [
      { name: 'Insulins' },
      { name: 'Sulfonylureas' },
      { name: 'Meglitinides' },
      { name: 'SGLT2 Inhibitors' },
      { name: 'DPP-4 Inhibitors' }
    ]
  },
  {
    id: '3',
    name: 'Opioids and Strong Analgesics',
    subTopics: [
      { name: 'Natural and Semi-Synthetic Opioids' },
      { name: 'Synthetic Opioids' },
      { name: 'Extended-Release/Long-Acting Opioids' }
    ]
  },
  {
    id: '4',
    name: 'Chemotherapy Agents',
    subTopics: [
      { name: 'Alkylating Agents' },
      { name: 'Antimetabolites' },
      { name: 'Plant Alkaloids' },
      { name: 'Topoisomerase Inhibitors' }
    ]
  },
  {
    id: '5',
    name: 'Potassium Supplements and Potassium-Sparing Diuretics',
    subTopics: [
      { name: 'Potassium Supplements' },
      { name: 'Potassium-Sparing Diuretics' }
    ]
  },
  {
    id: '6',
    name: 'Diuretics',
    subTopics: [
      { name: 'Loop Diuretics' },
      { name: 'Thiazide Diuretics' },
      { name: 'Thiazide-Like Diuretics' },
      { name: 'Carbonic Anhydrase Inhibitors' }
    ]
  },
  {
    id: '7',
    name: 'Lithium',
    subTopics: [
      { name: 'Lithium Carbonate' }
    ]
  },
  {
    id: '8',
    name: 'Biological Therapies and Immunosuppressants',
    subTopics: [
      { name: 'TNF Inhibitors' },
      { name: 'Interleukin Inhibitors' },
      { name: 'Calcineurin Inhibitors' },
      { name: 'mTOR Inhibitors' }
    ]
  },
  {
    id: '9',
    name: 'Cytotoxic and Targeted Therapies',
    subTopics: [
      { name: 'Trastuzumab' },
      { name: 'Imatinib' },
      { name: 'Bevacizumab' },
      { name: 'Erlotinib' },
      { name: 'Gefitinib' }
    ]
  },
  {
    id: '10',
    name: 'Inhaled Medications',
    subTopics: [
      { name: 'Beta-2 Agonists' },
      { name: 'Corticosteroids' },
      { name: 'Combination Inhalers' }
    ]
  },
  {
    id: '11',
    name: 'Antiepileptics',
    subTopics: [
      { name: 'Phenytoin' },
      { name: 'Valproate (Valproic Acid)' },
      { name: 'Carbamazepine' },
      { name: 'Lamotrigine' },
      { name: 'Levetiracetam' },
      { name: 'Topiramate' }
    ]
  },
  {
    id: '12',
    name: 'Theophylline',
    subTopics: [
      { name: 'Theophylline Tablets' },
      { name: 'Theophylline Extended-Release' }
    ]
  },
  {
    id: '13',
    name: 'Antipsychotics',
    subTopics: [
      { name: 'Typical Antipsychotics' },
      { name: 'Atypical Antipsychotics' }
    ]
  },
  {
    id: '14',
    name: 'Opioid Substitution Therapies',
    subTopics: [
      { name: 'Methadone' },
      { name: 'Buprenorphine/Naloxone (Suboxone)' },
      { name: 'Buprenorphine Alone (Subutex)' }
    ]
  },
  {
    id: '15',
    name: 'Cardiac Glycosides',
    subTopics: [
      { name: 'Digoxin' }
    ]
  },
  {
    id: '16',
    name: 'Thyroid Hormones',
    subTopics: [
      { name: 'Levothyroxine' }
    ]
  },
  {
    id: '17',
    name: 'Vancomycin',
    subTopics: [
      { name: 'Vancomycin Hydrochloride' }
    ]
  },
  {
    id: '18',
    name: 'Antiarrhythmics',
    subTopics: [
      { name: 'Amiodarone' },
      { name: 'Lidocaine' },
      { name: 'Procainamide' }
    ]
  },
  {
    id: '19',
    name: 'Antidepressants (High-Risk)',
    subTopics: [
      { name: 'Monoamine Oxidase Inhibitors (MAOIs)' },
      { name: 'Tricyclic Antidepressants (TCAs)' }
    ]
  },
  {
    id: '20',
    name: 'Non-Steroidal Anti-Inflammatory Drugs (NSAIDs)',
    subTopics: [
      { name: 'Indomethacin' },
      { name: 'Celecoxib' },
      { name: 'Naproxen' }
    ]
  }
];