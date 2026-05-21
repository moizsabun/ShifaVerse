import { Injectable, signal, computed, effect } from '@angular/core';
import { Clinic } from '../models/clinic.model';

@Injectable({ providedIn: 'root' })
export class ClinicService {
  private readonly STORAGE_KEY = 'medicare_clinics_v1';

  private clinicsSignal = signal<Clinic[]>(this.loadFromStorage());

  clinics = this.clinicsSignal.asReadonly();
  activeClinics = computed(() => this.clinicsSignal().filter(c => c.active));

  constructor() {
    effect(() => {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.clinicsSignal()));
    });
  }

  private loadFromStorage(): Clinic[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data) as Partial<Clinic>[];
        if (Array.isArray(parsed) && parsed.every(c => typeof c?.id === 'number')) {
          // Migrate older entries — fill missing fields with safe defaults
          return parsed.map(c => ({
            id: c.id!,
            slug: c.slug ?? `clinic-${c.id}`,
            name: c.name ?? 'Unnamed Clinic',
            address: c.address ?? '',
            phone: c.phone ?? '',
            patientConsultationFee: c.patientConsultationFee ?? 500,
            perAppointmentFee: c.perAppointmentFee ?? 0,
            currency: c.currency ?? 'PKR',
            billingFrequency: c.billingFrequency ?? 'per-shift',
            suspended: c.suspended ?? false,
            createdAt: c.createdAt ?? new Date().toISOString(),
            active: c.active ?? true
          }));
        }
      }
    } catch {}
    const now = new Date().toISOString();
    return [
      { id: 1, slug: 'shifa', name: 'Shifa Family Clinic', address: '123 Main Road, Karachi',
        phone: '+92-21-1234-5678',
        patientConsultationFee: 500, perAppointmentFee: 50,
        currency: 'PKR', billingFrequency: 'per-shift', suspended: false,
        createdAt: now, active: true },
      { id: 2, slug: 'alkhidmat', name: 'Al-Khidmat Medical Center', address: '456 Park Avenue, Lahore',
        phone: '+92-42-9876-5432',
        patientConsultationFee: 800, perAppointmentFee: 75,
        currency: 'PKR', billingFrequency: 'daily', suspended: false,
        createdAt: now, active: true }
    ];
  }

  getById(id: number): Clinic | undefined {
    return this.clinicsSignal().find(c => c.id === id);
  }

  getBySlug(slug: string): Clinic | undefined {
    return this.clinicsSignal().find(c => c.slug.toLowerCase() === slug.toLowerCase());
  }

  isSlugAvailable(slug: string, ignoreId?: number): boolean {
    const s = slug.toLowerCase().trim();
    return !this.clinicsSignal().some(c => c.slug.toLowerCase() === s && c.id !== ignoreId);
  }

  createClinic(input: Omit<Clinic, 'id' | 'createdAt' | 'active' | 'suspended'>): Clinic {
    const slug = input.slug.trim().toLowerCase().replace(/\s+/g, '-');
    if (!slug) throw new Error('Slug is required');
    if (!input.name.trim()) throw new Error('Name is required');
    if (!this.isSlugAvailable(slug)) throw new Error(`Slug "${slug}" is already taken`);
    if (input.perAppointmentFee < 0) throw new Error('Platform service fee cannot be negative');
    if (input.patientConsultationFee < 0) throw new Error('Patient consultation fee cannot be negative');

    const clinic: Clinic = {
      id: Math.max(0, ...this.clinicsSignal().map(c => c.id)) + 1,
      slug,
      name: input.name.trim(),
      address: input.address.trim(),
      phone: input.phone.trim(),
      patientConsultationFee: input.patientConsultationFee,
      perAppointmentFee: input.perAppointmentFee,
      currency: input.currency || 'PKR',
      billingFrequency: input.billingFrequency || 'per-shift',
      suspended: false,
      createdAt: new Date().toISOString(),
      active: true
    };
    this.clinicsSignal.update(arr => [...arr, clinic]);
    return clinic;
  }

  updateClinic(id: number, patch: Partial<Omit<Clinic, 'id' | 'createdAt'>>): void {
    if (patch.slug !== undefined) {
      const slug = patch.slug.trim().toLowerCase().replace(/\s+/g, '-');
      if (!this.isSlugAvailable(slug, id)) throw new Error(`Slug "${slug}" is already taken`);
      patch.slug = slug;
    }
    this.clinicsSignal.update(arr => arr.map(c => c.id === id ? { ...c, ...patch } : c));
  }

  setActive(id: number, active: boolean): void {
    this.updateClinic(id, { active });
  }

  setSuspended(id: number, suspended: boolean): void {
    this.updateClinic(id, { suspended });
  }
}
