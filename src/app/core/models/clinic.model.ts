export type BillingFrequency = 'per-shift' | 'daily' | 'weekly' | 'monthly';

export interface Clinic {
  id: number;
  slug: string;
  name: string;
  address: string;
  phone: string;
  /** Fee the clinic charges the patient per consultation (printed on patient slip). */
  patientConsultationFee: number;
  /** Fee the SaaS platform charges the clinic per appointment (billing dept). */
  perAppointmentFee: number;
  currency: string;
  billingFrequency: BillingFrequency;
  suspended: boolean;
  createdAt: string;
  active: boolean;
}
