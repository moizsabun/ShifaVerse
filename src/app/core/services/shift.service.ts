import { Injectable, signal, computed, effect } from '@angular/core';
import { Shift } from '../models/shift.model';

@Injectable({ providedIn: 'root' })
export class ShiftService {
  private readonly STORAGE_KEY = 'medicare_shifts_v2';

  private shiftsSignal = signal<Shift[]>(this.loadFromStorage());

  shifts = this.shiftsSignal.asReadonly();

  activeShift = computed<Shift | null>(() =>
    this.shiftsSignal().find(s => s.endedAt === null) ?? null
  );

  closedShifts = computed<Shift[]>(() =>
    this.shiftsSignal()
      .filter(s => s.endedAt !== null)
      .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
  );

  constructor() {
    effect(() => {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.shiftsSignal()));
    });
  }

  private loadFromStorage(): Shift[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data) as Shift[];
        if (Array.isArray(parsed) && parsed.every(s => typeof s?.id === 'number')) {
          return parsed;
        }
      }
    } catch {
    }
    const today = new Date().toISOString().split('T')[0];
    return [
      {
        id: 1,
        name: 'Morning Shift',
        label: '9:00 AM - 2:00 PM',
        startedAt: `${today}T09:00:00`,
        endedAt: `${today}T14:00:00`
      }
    ];
  }

  openShift(name: string, label: string): Shift {
    if (this.activeShift()) {
      throw new Error('Another shift is already active. Close it before opening a new one.');
    }
    const trimmedName = name.trim();
    const trimmedLabel = label.trim();
    if (!trimmedName) throw new Error('Shift name is required.');
    if (!trimmedLabel) throw new Error('Shift label is required.');

    const newShift: Shift = {
      id: Math.max(0, ...this.shiftsSignal().map(s => s.id)) + 1,
      name: trimmedName,
      label: trimmedLabel,
      startedAt: new Date().toISOString(),
      endedAt: null
    };
    this.shiftsSignal.update(arr => [...arr, newShift]);
    return newShift;
  }

  closeShift(id: number): void {
    const shift = this.shiftsSignal().find(s => s.id === id);
    if (!shift) throw new Error('Shift not found.');
    if (shift.endedAt !== null) throw new Error('Shift is already closed.');
    this.shiftsSignal.update(arr =>
      arr.map(s => s.id === id ? { ...s, endedAt: new Date().toISOString() } : s)
    );
  }

  getById(id: number): Shift | undefined {
    return this.shiftsSignal().find(s => s.id === id);
  }
}
