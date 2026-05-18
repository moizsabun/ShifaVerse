export interface Medication {
  name: string;
  dosage: string;
}

export interface MedicalTest {
  category: string;
  name: string;
}

export interface Treatment {
  diagnosis: string[];
  symptoms: string[];
  medications: Medication[];
  tests?: MedicalTest[];
  notes: string;
  remarks?: string;
}
