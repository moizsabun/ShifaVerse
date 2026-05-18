import { Medication } from '../models/treatment.model';

export const DIAGNOSES: string[] = [
  'Common Cold', 'Influenza', 'Hypertension', 'Type 2 Diabetes', 'Migraine',
  'Asthma', 'Bronchitis', 'Gastroenteritis', 'Allergic Rhinitis', 'Anxiety Disorder',
  'Acid Reflux (GERD)', 'Urinary Tract Infection', 'Tonsillitis', 'Sinusitis',
  'Dermatitis', 'Conjunctivitis', 'Anemia', 'Hypothyroidism', 'Arthritis', 'Pneumonia'
];

export const SYMPTOMS: string[] = [
  'Fever', 'Cough', 'Headache', 'Sore Throat', 'Fatigue', 'Nausea', 'Vomiting',
  'Dizziness', 'Chest Pain', 'Shortness of Breath', 'Abdominal Pain', 'Diarrhea',
  'Constipation', 'Joint Pain', 'Muscle Ache', 'Skin Rash', 'Loss of Appetite',
  'Weight Loss', 'Insomnia', 'Blurred Vision', 'Ear Pain', 'Runny Nose', 'Sneezing'
];

export interface MedicineCatalogEntry {
  name: string;
  doses: string[];
}

export const MEDICINES: MedicineCatalogEntry[] = [
  {
    name: 'Paracetamol 500mg',
    doses: [
      '1 tablet every 6 hours',
      '1 tablet every 8 hours',
      '2 tablets every 12 hours',
      '1 tablet at bedtime',
      'As needed for fever'
    ]
  },
  {
    name: 'Amoxicillin 250mg',
    doses: [
      '1 capsule three times a day',
      '1 capsule twice a day',
      '1 capsule three times a day for 7 days',
      '1 capsule three times a day for 10 days'
    ]
  },
  {
    name: 'Ibuprofen 400mg',
    doses: [
      '1 tablet every 8 hours after meals',
      '1 tablet every 12 hours after meals',
      '1 tablet as needed for pain (max 3/day)'
    ]
  },
  {
    name: 'Cetirizine 10mg',
    doses: [
      '1 tablet at bedtime',
      '1 tablet daily',
      'Half tablet at bedtime'
    ]
  },
  {
    name: 'Omeprazole 20mg',
    doses: [
      '1 capsule before breakfast',
      '1 capsule before breakfast and dinner',
      '1 capsule before breakfast for 14 days'
    ]
  },
  {
    name: 'Metformin 500mg',
    doses: [
      '1 tablet twice daily with meals',
      '1 tablet once daily with dinner',
      '1 tablet three times daily with meals'
    ]
  },
  {
    name: 'Amlodipine 5mg',
    doses: [
      '1 tablet once daily',
      '1 tablet in the morning',
      'Half tablet once daily'
    ]
  },
  {
    name: 'Salbutamol Inhaler',
    doses: [
      '2 puffs as needed',
      '2 puffs every 4-6 hours',
      '2 puffs before exercise'
    ]
  },
  {
    name: 'Azithromycin 500mg',
    doses: [
      '1 tablet daily for 3 days',
      '1 tablet daily for 5 days',
      '2 tablets on day 1, then 1 tablet daily for 4 days'
    ]
  },
  {
    name: 'Loratadine 10mg',
    doses: [
      '1 tablet daily',
      '1 tablet in the morning'
    ]
  },
  {
    name: 'Pantoprazole 40mg',
    doses: [
      '1 tablet before breakfast',
      '1 tablet before breakfast for 14 days'
    ]
  },
  {
    name: 'Cough Syrup 100ml',
    doses: [
      '10ml three times a day',
      '5ml three times a day',
      '10ml at bedtime'
    ]
  },
  {
    name: 'Multivitamin Tablet',
    doses: [
      '1 tablet daily after breakfast',
      '1 tablet every other day'
    ]
  },
  {
    name: 'ORS Sachet',
    doses: [
      'Mix in 1 glass water, drink as needed',
      'Mix in 1 glass water after each loose stool',
      '1 sachet 3 times daily for 2 days'
    ]
  }
];

// Legacy export — kept for any external readers; not used by the new flow.
export const MEDICATIONS: Medication[] = MEDICINES.map(m => ({
  name: m.name,
  dosage: m.doses[0]
}));

export interface MedicalTestCategory {
  category: string;
  tests: string[];
}

export const MEDICAL_TESTS: MedicalTestCategory[] = [
  {
    category: 'Laboratory',
    tests: [
      'Complete Blood Count (CBC)',
      'Fasting Blood Sugar (FBS)',
      'Random Blood Sugar (RBS)',
      'HbA1c',
      'Lipid Profile',
      'Liver Function Test (LFT)',
      'Renal Function Test (RFT)',
      'Thyroid Function Test (TFT)',
      'Electrolytes',
      'CRP',
      'ESR',
      'Vitamin D',
      'Vitamin B12',
      'Iron Studies',
      'Urine Routine Examination',
      'Urine Culture & Sensitivity',
      'Stool Routine Examination',
      'Blood Culture',
      'Pregnancy Test (beta-hCG)',
      'Dengue NS1 / IgM / IgG',
      'Malaria Parasite (MP)',
      'Typhoid (Widal Test)',
      'HIV Screening',
      'Hepatitis B Surface Antigen (HBsAg)',
      'Hepatitis C Antibody (Anti-HCV)',
      'COVID-19 PCR',
      'D-Dimer'
    ]
  },
  {
    category: 'X-Ray',
    tests: [
      'X-Ray Chest PA View',
      'X-Ray Chest Lateral',
      'X-Ray Abdomen (Erect)',
      'X-Ray Skull',
      'X-Ray Cervical Spine',
      'X-Ray Lumbar Spine',
      'X-Ray Thoracic Spine',
      'X-Ray Pelvis',
      'X-Ray Knee Joint',
      'X-Ray Shoulder',
      'X-Ray Wrist',
      'X-Ray Ankle',
      'X-Ray Hand',
      'X-Ray Foot',
      'X-Ray PNS (Sinuses)'
    ]
  },
  {
    category: 'Ultrasound',
    tests: [
      'USG Abdomen',
      'USG Pelvis',
      'USG KUB',
      'USG Obstetric',
      'USG Thyroid',
      'USG Breast',
      'USG Scrotum',
      'USG Soft Tissue',
      'USG Doppler (Vascular)'
    ]
  },
  {
    category: 'Cardiac / ECG',
    tests: [
      'ECG (12 Lead)',
      'Echocardiography (2D Echo)',
      'Treadmill Stress Test (TMT)',
      'Holter Monitor (24 hr)',
      'Ambulatory Blood Pressure Monitor'
    ]
  },
  {
    category: 'CT / MRI',
    tests: [
      'CT Brain (Plain)',
      'CT Brain (Contrast)',
      'CT Chest',
      'CT Abdomen & Pelvis',
      'CT KUB',
      'MRI Brain',
      'MRI Cervical Spine',
      'MRI Lumbar Spine',
      'MRI Knee Joint',
      'MRI Shoulder'
    ]
  },
  {
    category: 'Endoscopy & Procedures',
    tests: [
      'Upper GI Endoscopy',
      'Colonoscopy',
      'Sigmoidoscopy',
      'Bronchoscopy',
      'Cystoscopy'
    ]
  },
  {
    category: 'Other',
    tests: [
      'Pulmonary Function Test (PFT)',
      'Bone Density (DEXA)',
      'Audiometry',
      'Mammography',
      'Pap Smear',
      'Biopsy / Histopathology'
    ]
  }
];
