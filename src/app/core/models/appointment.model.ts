import { Treatment } from './treatment.model';

export type AppointmentStatus = 'pending' | 'completed' | 'cancelled';

export interface Appointment {
  id: number;
  clinicId: number;
  userId: number;
  userName: string;
  date: string;
  shiftId: number;
  shiftName: string;
  sequence: number;
  status: AppointmentStatus;
  createdAt: string;
  completedAt?: string;
  treatment?: Treatment;
}
