export type InvoiceStatus = 'open' | 'awaiting-payment' | 'partial' | 'paid';
export type PaymentMethod = 'cash' | 'bank-transfer' | 'cheque';
export type BillingPeriod = 'per-shift' | 'daily' | 'weekly' | 'monthly';

export interface PaymentRecord {
  paidAt: string;
  amount: number;
  method: PaymentMethod;
  reference: string;
  notes: string;
}

export interface Invoice {
  id: number;
  clinicId: number;
  period: BillingPeriod;
  /**
   * Unique key per period for this clinic:
   *  - per-shift: `shift-<shiftId>`
   *  - daily:     `YYYY-MM-DD`
   *  - weekly:    `YYYY-Www` (ISO week)
   *  - monthly:   `YYYY-MM`
   */
  periodKey: string;
  periodStart: string;
  periodEnd: string | null; // null when still accumulating (open status)
  shiftIds: number[];
  appointmentCount: number;
  feePerAppointment: number;
  total: number;
  currency: string;
  status: InvoiceStatus;
  payments: PaymentRecord[];
  clearanceRequestedAt?: string;
  clearanceRequestNote?: string;
  createdAt: string;
  finalizedAt?: string;
}
