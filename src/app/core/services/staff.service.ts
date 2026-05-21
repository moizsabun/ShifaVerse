import { Injectable, signal, computed, effect } from '@angular/core';
import { StaffAccount, StaffRole } from '../models/staff.model';

@Injectable({ providedIn: 'root' })
export class StaffService {
  private readonly STORAGE_KEY = 'medicare_staff_v1';

  private staffSignal = signal<StaffAccount[]>(this.loadFromStorage());

  staff = this.staffSignal.asReadonly();

  constructor() {
    effect(() => {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.staffSignal()));
    });
  }

  private loadFromStorage(): StaffAccount[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data) as StaffAccount[];
        if (Array.isArray(parsed) && parsed.every(s => typeof s?.id === 'number')) return parsed;
      }
    } catch {}
    const now = new Date().toISOString();
    // Seeds for the two demo clinics (id 1 = shifa, id 2 = alkhidmat)
    return [
      { id: 1, clinicId: 1, role: 'owner',      name: 'Shifa Owner',      email: 'owner@shifa.com',      password: 'shifa123',  createdAt: now },
      { id: 2, clinicId: 1, role: 'doctor',     name: 'Dr. Sarah Mitchell', email: 'doctor@shifa.com',   password: 'doc123',    createdAt: now },
      { id: 3, clinicId: 1, role: 'compounder', name: 'Ali Compounder',   email: 'compounder@shifa.com', password: 'comp123',   createdAt: now },
      { id: 4, clinicId: 2, role: 'owner',      name: 'Al-Khidmat Owner', email: 'owner@alkhidmat.com',  password: 'alk123',    createdAt: now },
      { id: 5, clinicId: 2, role: 'doctor',     name: 'Dr. Ahmed Raza',   email: 'doctor@alkhidmat.com', password: 'doc123',    createdAt: now },
      { id: 6, clinicId: 2, role: 'compounder', name: 'Bilal Comp.',      email: 'compounder@alkhidmat.com', password: 'comp123', createdAt: now }
    ];
  }

  byClinic(clinicId: number): StaffAccount[] {
    return this.staffSignal().filter(s => s.clinicId === clinicId);
  }

  byClinicAndRole(clinicId: number, role: StaffRole): StaffAccount[] {
    return this.staffSignal().filter(s => s.clinicId === clinicId && s.role === role);
  }

  getById(id: number): StaffAccount | undefined {
    return this.staffSignal().find(s => s.id === id);
  }

  findCredentials(email: string, password: string): StaffAccount | undefined {
    const e = email.trim().toLowerCase();
    return this.staffSignal().find(s => s.email.toLowerCase() === e && s.password === password);
  }

  isEmailAvailable(email: string, ignoreId?: number): boolean {
    const e = email.trim().toLowerCase();
    return !this.staffSignal().some(s => s.email.toLowerCase() === e && s.id !== ignoreId);
  }

  createStaff(input: Omit<StaffAccount, 'id' | 'createdAt'>): StaffAccount {
    if (!input.name.trim()) throw new Error('Name is required');
    if (!input.email.trim()) throw new Error('Email is required');
    if (!input.password || input.password.length < 4) throw new Error('Password must be at least 4 characters');
    if (!this.isEmailAvailable(input.email)) throw new Error('This email is already in use');

    const staff: StaffAccount = {
      id: Math.max(0, ...this.staffSignal().map(s => s.id)) + 1,
      clinicId: input.clinicId,
      role: input.role,
      name: input.name.trim(),
      email: input.email.trim().toLowerCase(),
      password: input.password,
      createdAt: new Date().toISOString()
    };
    this.staffSignal.update(arr => [...arr, staff]);
    return staff;
  }

  updateStaff(id: number, patch: Partial<Omit<StaffAccount, 'id' | 'clinicId' | 'createdAt'>>): void {
    if (patch.email && !this.isEmailAvailable(patch.email, id)) {
      throw new Error('This email is already in use');
    }
    this.staffSignal.update(arr => arr.map(s => s.id === id ? { ...s, ...patch } : s));
  }

  deleteStaff(id: number): void {
    this.staffSignal.update(arr => arr.filter(s => s.id !== id));
  }
}
