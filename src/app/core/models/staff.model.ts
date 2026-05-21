export type StaffRole = 'owner' | 'doctor' | 'compounder';

export interface StaffAccount {
  id: number;
  clinicId: number;
  role: StaffRole;
  name: string;
  email: string;
  password: string;
  createdAt: string;
}

export interface PlatformAdmin {
  email: string;
  password: string;
}

export interface AuthUser {
  kind: 'platform' | 'staff';
  staffId?: number;
  clinicId?: number;
  role?: StaffRole;
  name: string;
  email: string;
}
