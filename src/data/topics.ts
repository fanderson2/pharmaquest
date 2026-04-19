interface Topic {
  id: string;
  title: string;
  subtopics: string[];
}

export const bnfChapters: Topic[] = [
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
  },
  {
    id: "cardiovascular",
    title: "3. Cardiovascular System",
    subtopics: [
      "Antihypertensives",
      "Antianginals",
      "Anticoagulants and Antiplatelets",
      "Lipid-Lowering Agents",
      "Antiarrhythmics",
      "Heart Failure Medications",
      "Peripheral Vascular Drugs"
    ]
  },
  {
    id: "cns",
    title: "4. Central Nervous System",
    subtopics: [
      "Analgesics",
      "Anxiolytics and Hypnotics",
      "Antidepressants",
      "Antipsychotics",
      "Antiepileptics",
      "Dementia and Alzheimer's Disease",
      "Parkinson's Disease",
      "Multiple Sclerosis",
      "Sleep Disorders"
    ]
  },
  {
    id: "endocrine",
    title: "5. Endocrine System",
    subtopics: [
      "Diabetes Mellitus",
      "Thyroid Disorders",
      "Adrenal Disorders",
      "Pituitary Disorders",
      "Osteoporosis",
      "Growth Disorders",
      "Reproductive Endocrinology"
    ]
  },
  {
    id: "gastrointestinal",
    title: "6. Gastrointestinal System",
    subtopics: [
      "Gastroesophageal Reflux Disease (GERD)",
      "Peptic Ulcer Disease",
      "Inflammatory Bowel Disease (IBD)",
      "Irritable Bowel Syndrome (IBS)",
      "Liver Disorders",
      "Pancreatic Disorders",
      "Nutritional Disorders",
      "Gastrointestinal Bleeding"
    ]
  },
  {
    id: "genitourinary",
    title: "7. Genitourinary System",
    subtopics: [
      "Urinary Tract Infections (UTIs)",
      "Benign Prostatic Hyperplasia (BPH)",
      "Male Erectile Dysfunction",
      "Female Sexual Dysfunction",
      "Kidney Disorders",
      "Renal Replacement Therapy",
      "Urolithiasis",
      "Prostate Cancer"
    ]
  },
  {
    id: "hematological",
    title: "8. Hematological System",
    subtopics: [
      "Anemias",
      "Leukemias and Lymphomas",
      "Coagulation Disorders",
      "Bleeding Disorders",
      "Thrombocytopenia",
      "Hemoglobinopathies",
      "Bone Marrow Transplantation"
    ]
  },
  {
    id: "infectious",
    title: "9. Infectious Diseases",
    subtopics: [
      "HIV/AIDS",
      "Tuberculosis",
      "Sexually Transmitted Infections (STIs)",
      "Meningitis and Encephalitis",
      "Sepsis",
      "Vector-Borne Diseases"
    ]
  },
  {
    id: "musculoskeletal",
    title: "10. Musculoskeletal System",
    subtopics: [
      "Arthritis",
      "Osteoporosis",
      "Muscle Disorders",
      "Bone Pain and Metastases",
      "Gout",
      "Back Pain",
      "Fracture Management"
    ]
  },
  {
    id: "oncology",
    title: "11. Oncology",
    subtopics: [
      "Chemotherapy Agents",
      "Targeted Therapies",
      "Hormonal Therapies",
      "Immunotherapies",
      "Supportive Care in Cancer",
      "Palliative Care"
    ]
  },
  {
    id: "ophthalmology",
    title: "12. Ophthalmology",
    subtopics: [
      "Glaucoma",
      "Conjunctivitis and Allergies",
      "Dry Eye Syndrome",
      "Ocular Infections",
      "Age-Related Macular Degeneration (AMD)",
      "Cataract Management",
      "Uveitis"
    ]
  },
  {
    id: "pain",
    title: "13. Pain Management",
    subtopics: [
      "Acute Pain",
      "Chronic Pain",
      "Neuropathic Pain",
      "Cancer Pain",
      "Non-Pharmacological Therapies",
      "Pain Management Protocols"
    ]
  },
  {
    id: "respiratory",
    title: "14. Respiratory System",
    subtopics: [
      "Asthma",
      "Chronic Obstructive Pulmonary Disease (COPD)",
      "Pneumonia",
      "Tuberculosis",
      "Interstitial Lung Disease",
      "Sleep Apnea",
      "Respiratory Infections"
    ]
  },
  {
    id: "rheumatology",
    title: "15. Rheumatology",
    subtopics: [
      "Rheumatoid Arthritis",
      "Systemic Lupus Erythematosus (SLE)",
      "Gout and Pseudogout",
      "Vasculitis",
      "Sjögren's Syndrome",
      "Fibromyalgia"
    ]
  },
  {
    id: "sexual-health",
    title: "16. Sexual Health",
    subtopics: [
      "Contraception",
      "Sexually Transmitted Infections (STIs)",
      "Fertility Treatments",
      "Erectile Dysfunction",
      "Hormone Replacement Therapy",
      "Sexual Dysfunction in Chronic Illness"
    ]
  },
  {
    id: "skin",
    title: "17. Skin Conditions",
    subtopics: [
      "Eczema and Dermatitis",
      "Psoriasis",
      "Acne",
      "Infections",
      "Skin Cancers",
      "Wound Care",
      "Hyperpigmentation and Vitiligo"
    ]
  },
  {
    id: "special-populations",
    title: "18. Special Populations",
    subtopics: [
      "Pediatrics",
      "Geriatrics",
      "Pregnancy and Breastfeeding",
      "Patients with Renal Impairment",
      "Patients with Hepatic Impairment",
      "Patients with Comorbidities"
    ]
  },
  {
    id: "toxicology",
    title: "19. Toxicology",
    subtopics: [
      "Poisoning Management",
      "Overdose Treatments",
      "Environmental and Occupational Exposures",
      "Substance Abuse",
      "Pesticides and Household Chemicals"
    ]
  },
  {
    id: "vitamins-minerals",
    title: "20. Vitamins and Minerals",
    subtopics: [
      "Vitamin Deficiencies",
      "Mineral Deficiencies",
      "Toxicity and Overdose",
      "Dietary Supplements",
      "Special Considerations"
    ]
  }
];

export const top100Drugs: Topic[] = [
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
  },
  {
    id: "cardiovascular-drugs",
    title: "3. Cardiovascular Drugs",
    subtopics: [
      "Amlodipine",
      "Lisinopril",
      "Simvastatin",
      "Atorvastatin",
      "Metoprolol",
      "Ramipril",
      "Losartan",
      "Furosemide",
      "Spironolactone",
      "Bisoprolol"
    ]
  },
  {
    id: "diabetes",
    title: "4. Diabetes Medications",
    subtopics: [
      "Metformin",
      "Glipizide",
      "Insulin Glargine",
      "Insulin Lispro",
      "Sitagliptin",
      "Canagliflozin",
      "Pioglitazone",
      "Glimepiride",
      "Dapagliflozin",
      "Empagliflozin"
    ]
  },
  {
    id: "respiratory-drugs",
    title: "5. Respiratory Drugs",
    subtopics: [
      "Salbutamol (Albuterol)",
      "Fluticasone",
      "Budesonide",
      "Montelukast",
      "Tiotropium",
      "Formoterol",
      "Salmeterol",
      "Ipratropium",
      "Beclometasone",
      "Prednisolone (for asthma)"
    ]
  }
];

export const highRiskMedications: Topic[] = [
  {
    id: "anticoagulants",
    title: "1. Anticoagulants",
    subtopics: [
      "Vitamin K Antagonists",
      "Heparins",
      "Direct Oral Anticoagulants (DOACs)",
      "Direct Thrombin Inhibitors"
    ]
  },
  {
    id: "insulins",
    title: "2. Insulins and Oral Hypoglycemics",
    subtopics: [
      "Insulins",
      "Sulfonylureas",
      "Meglitinides",
      "SGLT2 Inhibitors",
      "DPP-4 Inhibitors"
    ]
  },
  {
    id: "opioids",
    title: "3. Opioids and Strong Analgesics",
    subtopics: [
      "Natural and Semi-Synthetic Opioids",
      "Synthetic Opioids",
      "Extended-Release/Long-Acting Opioids"
    ]
  }
];

export const calculations: Topic[] = [
  {
    id: "unit-conversions",
    title: "1. Unit Conversions",
    subtopics: [
      "Metric and Imperial Units",
      "Weight, Volume, and Surface Area Conversions"
    ]
  },
  {
    id: "dosage-calculations",
    title: "2. Dosage Calculations",
    subtopics: [
      "Calculating Adult and Pediatric Doses",
      "Weight-Based Dosage Calculations",
      "Body Surface Area (BSA) Calculations"
    ]
  },
  {
    id: "concentration-dilution",
    title: "3. Concentration and Dilution",
    subtopics: [
      "Preparing Solutions of Specific Concentrations",
      "Serial Dilutions",
      "Calculating Final Concentrations"
    ]
  }
];

export const mep: Topic[] = [
  {
    id: "classification",
    title: "1. Classification of Medicines",
    subtopics: [
      "By Therapeutic Use: e.g., analgesics, antibiotics, antihypertensives",
      "By Chemical Structure: e.g., beta-lactams, benzodiazepines",
      "By Legal Category: e.g., Prescription Only Medicines (POM), Pharmacy Medicines (P), General Sales List (GSL)"
    ]
  },
  {
    id: "pharmacology",
    title: "2. Pharmacology and Therapeutics",
    subtopics: [
      "Mechanisms of Action",
      "Pharmacokinetics: Absorption, distribution, metabolism, excretion",
      "Pharmacodynamics",
      "Dose-Response Relationships"
    ]
  },
  {
    id: "prescribing",
    title: "3. Prescribing and Dispensing Medicines",
    subtopics: [
      "Prescription Writing and Interpretation",
      "Dispensing Procedures",
      "Record-Keeping and Documentation",
      "Supply of Prescription-Only Medicines (POMs)"
    ]
  }
];

export const otcConditions: Topic[] = [
  {
    id: "pain-inflammation",
    title: "1. Pain and Inflammation",
    subtopics: [
      "Headaches (Tension, Migraine)",
      "Musculoskeletal Pain (Back Pain, Joint Pain)",
      "Menstrual Cramps"
    ]
  },
  {
    id: "cold-flu",
    title: "2. Cold and Flu",
    subtopics: [
      "Common Cold",
      "Influenza"
    ]
  },
  {
    id: "gastrointestinal",
    title: "3. Gastrointestinal Disorders",
    subtopics: [
      "Indigestion/Heartburn (Dyspepsia)",
      "Constipation",
      "Diarrhea",
      "Nausea and Vomiting",
      "Motion Sickness"
    ]
  }
];

export const otcMedications: Topic[] = [
  {
    id: "analgesics",
    title: "1. Analgesics (Pain Relievers)",
    subtopics: [
      "Paracetamol (Acetaminophen)",
      "Ibuprofen",
      "Aspirin",
      "Naproxen"
    ]
  },
  {
    id: "anti-inflammatories",
    title: "2. Anti-Inflammatories",
    subtopics: [
      "Ibuprofen",
      "Diclofenac Gel"
    ]
  },
  {
    id: "decongestants",
    title: "3. Decongestants",
    subtopics: [
      "Pseudoephedrine",
      "Phenylephrine"
    ]
  }
];

export const ipCourse: Topic[] = [
  {
    id: "clinical-assessment",
    title: "1. Clinical Assessment Skills",
    subtopics: [
      "Patient History Taking",
      "Physical Examination",
      "Clinical Decision Making",
      "Documentation"
    ]
  },
  {
    id: "prescribing-skills",
    title: "2. Prescribing Skills",
    subtopics: [
      "Prescription Writing",
      "Medication Review",
      "Therapeutic Drug Monitoring",
      "Prescribing in Special Populations"
    ]
  },
  {
    id: "consultation-skills",
    title: "3. Consultation Skills",
    subtopics: [
      "Communication Techniques",
      "Patient Education",
      "Shared Decision Making",
      "Cultural Competency"
    ]
  }
];