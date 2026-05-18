import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { Appointment, AppointmentStatus } from '../models/appointment.model';
import { Shift } from '../models/shift.model';
import { Treatment } from '../models/treatment.model';
import { ShiftService } from './shift.service';

@Injectable({ providedIn: 'root' })
export class AppointmentService {
  private readonly STORAGE_KEY = 'medicare_appointments_v2';

  private shiftService = inject(ShiftService);

  private appointmentsSignal = signal<Appointment[]>(this.loadFromStorage());

  appointments = this.appointmentsSignal.asReadonly();

  todayAppointments = computed(() => {
    const today = this.getTodayString();
    return this.appointmentsSignal().filter(a => a.date === today);
  });

  pendingAppointments = computed(() =>
    this.appointmentsSignal().filter(a => a.status === 'pending')
  );

  completedAppointments = computed(() =>
    this.appointmentsSignal().filter(a => a.status === 'completed')
  );

  activeShiftAppointments = computed(() => {
    const active = this.shiftService.activeShift();
    if (!active) return [];
    return this.appointmentsSignal()
      .filter(a => a.shiftId === active.id)
      .sort((a, b) => a.sequence - b.sequence);
  });

  constructor() {
    effect(() => {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.appointmentsSignal()));
    });
  }

  private loadFromStorage(): Appointment[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data) as Appointment[];
        if (Array.isArray(parsed) && parsed.every(a => typeof a?.shiftId === 'number')) {
          return parsed;
        }
      }
    } catch {
    }
    const today = new Date().toISOString().split('T')[0];
    return [
      {
        id: 1, userId: 1, userName: 'Ahmed Khan', date: today,
        shiftId: 1, shiftName: 'Morning Shift',
        sequence: 1, status: 'completed', createdAt: today,
        treatment: {
          diagnosis: ['Common Cold', 'Sinusitis'],
          symptoms: ['Cough', 'Headache', 'Runny Nose'],
          medications: [
            { name: 'Paracetamol 500mg', dosage: '1 tablet every 6 hours' },
            { name: 'Cetirizine 10mg', dosage: '1 tablet at bedtime' }
          ],
          notes: 'Rest for 3 days, drink plenty of fluids'
        }
      }
    ];
  }

  getTodayString(): string {
    return new Date().toISOString().split('T')[0];
  }

  /**
   * Returns the set of sequence numbers already taken in a shift
   * (excluding cancelled appointments).
   */
  private usedSequences(shiftId: number): Set<number> {
    return new Set(
      this.appointmentsSignal()
        .filter(a => a.shiftId === shiftId && a.status !== 'cancelled')
        .map(a => a.sequence)
    );
  }

  isSequenceAvailable(shiftId: number, sequence: number): boolean {
    return !this.usedSequences(shiftId).has(sequence);
  }

  /**
   * Next auto sequence = smallest positive integer not yet taken in this shift.
   * Manual (advance-time) tokens reserve a slot, and the auto counter skips
   * over them and continues onwards once it catches up.
   */
  getNextSequence(shiftId: number): number {
    const used = this.usedSequences(shiftId);
    let n = 1;
    while (used.has(n)) n++;
    return n;
  }

  /**
   * Create appointment for the currently active shift.
   * - shift must be active (endedAt === null)
   * - manualSequence (optional): compounder-assigned token for an advance-time
   *   patient calling in. Must be a positive integer not already used in this shift.
   */
  createAppointment(
    userId: number,
    userName: string,
    shift: Shift,
    manualSequence?: number
  ): Appointment {
    if (shift.endedAt !== null) {
      throw new Error('This shift has been closed. Cannot book appointment.');
    }

    let sequence: number;
    if (manualSequence !== undefined && manualSequence !== null) {
      if (!Number.isInteger(manualSequence) || manualSequence < 1) {
        throw new Error('Manual token must be a positive whole number.');
      }
      if (!this.isSequenceAvailable(shift.id, manualSequence)) {
        throw new Error(`Token #${manualSequence} is already assigned in this shift.`);
      }
      sequence = manualSequence;
    } else {
      sequence = this.getNextSequence(shift.id);
    }

    const newAppointment: Appointment = {
      id: Math.max(0, ...this.appointmentsSignal().map(a => a.id)) + 1,
      userId,
      userName,
      date: this.getTodayString(),
      shiftId: shift.id,
      shiftName: shift.name,
      sequence,
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0]
    };

    this.appointmentsSignal.update(apts => [...apts, newAppointment]);
    return newAppointment;
  }

  cancelAppointment(id: number): void {
    const apt = this.appointmentsSignal().find(a => a.id === id);
    if (!apt) throw new Error('Appointment not found');
    if (apt.status !== 'pending') {
      throw new Error('Only pending appointments can be cancelled');
    }
    const shift = this.shiftService.getById(apt.shiftId);
    if (shift && shift.endedAt !== null) {
      throw new Error('Cannot cancel - the shift has been closed');
    }
    this.appointmentsSignal.update(apts =>
      apts.map(a => a.id === id ? { ...a, status: 'cancelled' as AppointmentStatus } : a)
    );
  }

  completeAppointment(id: number, treatment: Treatment): void {
    this.appointmentsSignal.update(apts =>
      apts.map(a => a.id === id
        ? { ...a, status: 'completed' as AppointmentStatus, treatment }
        : a
      )
    );
  }

  getById(id: number): Appointment | undefined {
    return this.appointmentsSignal().find(a => a.id === id);
  }

  byShift(shiftId: number): Appointment[] {
    return this.appointmentsSignal()
      .filter(a => a.shiftId === shiftId)
      .sort((a, b) => a.sequence - b.sequence);
  }

  getUserAppointments(userId: number): Appointment[] {
    return this.appointmentsSignal()
      .filter(a => a.userId === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  getUserHistory(userId: number): Appointment[] {
    return this.appointmentsSignal()
      .filter(a => a.userId === userId && a.status === 'completed')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
}
