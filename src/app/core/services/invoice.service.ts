import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { Invoice, InvoiceStatus, PaymentMethod, PaymentRecord, BillingPeriod } from '../models/invoice.model';
import { ClinicService } from './clinic.service';
import { AppointmentService } from './appointment.service';
import { Shift } from '../models/shift.model';

@Injectable({ providedIn: 'root' })
export class InvoiceService {
  // v2: shift-close based; v1 (calendar-month-only) is incompatible.
  private readonly STORAGE_KEY = 'medicare_invoices_v2';

  private clinicService = inject(ClinicService);
  private appointmentService = inject(AppointmentService);

  private invoicesSignal = signal<Invoice[]>(this.loadFromStorage());
  invoices = this.invoicesSignal.asReadonly();

  constructor() {
    effect(() => {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.invoicesSignal()));
    });
  }

  private loadFromStorage(): Invoice[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data) as Invoice[];
        if (Array.isArray(parsed) && parsed.every(i => typeof i?.id === 'number' && typeof i?.period === 'string')) {
          return parsed;
        }
      }
    } catch {}
    return [];
  }

  // -------------- Queries --------------

  byClinic(clinicId: number): Invoice[] {
    return this.invoicesSignal()
      .filter(i => i.clinicId === clinicId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  all(): Invoice[] {
    return this.invoicesSignal()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  paidAmount(invoice: Invoice): number {
    return invoice.payments.reduce((s, p) => s + p.amount, 0);
  }

  remaining(invoice: Invoice): number {
    return Math.max(0, invoice.total - this.paidAmount(invoice));
  }

  totalsForClinic(clinicId: number): { invoiced: number; paid: number; outstanding: number } {
    const invs = this.byClinic(clinicId);
    const invoiced = invs.reduce((s, i) => s + i.total, 0);
    const paid = invs.reduce((s, i) => s + this.paidAmount(i), 0);
    return { invoiced, paid, outstanding: Math.max(0, invoiced - paid) };
  }

  hasOverdueUnpaid(clinicId: number): boolean {
    return this.byClinic(clinicId).some(i =>
      (i.status === 'awaiting-payment' || i.status === 'partial') &&
      this.remaining(i) > 0
    );
  }

  // -------------- Period helpers --------------

  private isoWeekKey(date: Date): string {
    // ISO 8601 week number
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const week = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return `${d.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
  }

  private periodKeyFor(period: BillingPeriod, anchor: Date, shiftId?: number): string {
    switch (period) {
      case 'per-shift':
        if (shiftId === undefined) throw new Error('shiftId required for per-shift period');
        return `shift-${shiftId}`;
      case 'daily':
        return anchor.toISOString().substring(0, 10);
      case 'weekly':
        return this.isoWeekKey(anchor);
      case 'monthly':
        return anchor.toISOString().substring(0, 7);
    }
  }

  private periodWindow(period: BillingPeriod, anchor: Date): { start: string; end: string } {
    const startOfDay = new Date(anchor); startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(anchor); endOfDay.setHours(23, 59, 59, 999);
    switch (period) {
      case 'per-shift':
      case 'daily':
        return { start: startOfDay.toISOString(), end: endOfDay.toISOString() };
      case 'weekly': {
        const day = anchor.getDay() || 7; // Sunday=0 → 7
        const monday = new Date(anchor); monday.setDate(anchor.getDate() - (day - 1)); monday.setHours(0, 0, 0, 0);
        const sunday = new Date(monday); sunday.setDate(monday.getDate() + 6); sunday.setHours(23, 59, 59, 999);
        return { start: monday.toISOString(), end: sunday.toISOString() };
      }
      case 'monthly': {
        const first = new Date(anchor.getFullYear(), anchor.getMonth(), 1, 0, 0, 0, 0);
        const last = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0, 23, 59, 59, 999);
        return { start: first.toISOString(), end: last.toISOString() };
      }
    }
  }

  // -------------- Main hook: called when a shift is closed --------------

  /**
   * Triggered when a shift closes. Generates / updates the invoice for the
   * clinic's configured billing frequency. All entertained patients —
   * everyone the clinic took on (completed + pending), cancelled excluded —
   * are billed.
   */
  onShiftClosed(shift: Shift): Invoice | null {
    const clinic = this.clinicService.getById(shift.clinicId);
    if (!clinic) return null;

    const billableCount = this.appointmentService.allAppointments()
      .filter(a => a.shiftId === shift.id && a.status !== 'cancelled').length;

    if (billableCount === 0) return null; // nothing to bill

    const anchor = new Date(shift.endedAt ?? shift.startedAt);
    const period = clinic.billingFrequency ?? 'per-shift';
    const periodKey = this.periodKeyFor(period, anchor, shift.id);

    if (period === 'per-shift') {
      const { start, end } = this.periodWindow(period, anchor);
      const inv: Invoice = {
        id: this.nextId(),
        clinicId: clinic.id,
        period,
        periodKey,
        periodStart: start,
        periodEnd: end,
        shiftIds: [shift.id],
        appointmentCount: billableCount,
        feePerAppointment: clinic.perAppointmentFee,
        total: billableCount * clinic.perAppointmentFee,
        currency: clinic.currency,
        status: 'awaiting-payment',
        payments: [],
        createdAt: new Date().toISOString(),
        finalizedAt: new Date().toISOString()
      };
      this.invoicesSignal.update(arr => [...arr, inv]);
      this.autoFinalizeOldPeriods(clinic.id, period, periodKey); // no-op for per-shift but safe
      return inv;
    }

    // Periodic: find-or-create an OPEN invoice for the current period
    const existing = this.invoicesSignal().find(i =>
      i.clinicId === clinic.id && i.periodKey === periodKey && i.status === 'open'
    );

    if (existing) {
      this.invoicesSignal.update(arr => arr.map(i => {
        if (i.id !== existing.id) return i;
        const shiftIds = i.shiftIds.includes(shift.id) ? i.shiftIds : [...i.shiftIds, shift.id];
        const newCount = i.appointmentCount + billableCount;
        return {
          ...i,
          shiftIds,
          appointmentCount: newCount,
          total: newCount * i.feePerAppointment,
          periodEnd: this.periodWindow(period, anchor).end
        };
      }));
      this.autoFinalizeOldPeriods(clinic.id, period, periodKey);
      return this.invoicesSignal().find(i => i.id === existing.id) ?? null;
    } else {
      const { start, end } = this.periodWindow(period, anchor);
      const inv: Invoice = {
        id: this.nextId(),
        clinicId: clinic.id,
        period,
        periodKey,
        periodStart: start,
        periodEnd: end,
        shiftIds: [shift.id],
        appointmentCount: billableCount,
        feePerAppointment: clinic.perAppointmentFee,
        total: billableCount * clinic.perAppointmentFee,
        currency: clinic.currency,
        status: 'open',
        payments: [],
        createdAt: new Date().toISOString()
      };
      this.invoicesSignal.update(arr => [...arr, inv]);
      this.autoFinalizeOldPeriods(clinic.id, period, periodKey);
      return inv;
    }
  }

  /** Finalize any older 'open' invoices when the period has rolled over. */
  private autoFinalizeOldPeriods(clinicId: number, period: BillingPeriod, currentKey: string): void {
    const now = new Date().toISOString();
    this.invoicesSignal.update(arr => arr.map(i => {
      if (i.clinicId !== clinicId) return i;
      if (i.period !== period) return i;
      if (i.status !== 'open') return i;
      if (i.periodKey === currentKey) return i;
      return { ...i, status: 'awaiting-payment' as InvoiceStatus, finalizedAt: now };
    }));
  }

  /** Manual finalize: owner/admin can finalize the current open invoice early. */
  finalizeOpenInvoice(invoiceId: number): void {
    this.invoicesSignal.update(arr => arr.map(i =>
      i.id === invoiceId && i.status === 'open'
        ? { ...i, status: 'awaiting-payment' as InvoiceStatus, finalizedAt: new Date().toISOString() }
        : i
    ));
  }

  /** Fallback: scan all clinic's closed shifts and ensure their invoices exist. */
  reconcileForClinic(clinicId: number, shifts: Shift[]): number {
    const clinic = this.clinicService.getById(clinicId);
    if (!clinic) return 0;
    let generated = 0;
    for (const s of shifts) {
      if (s.endedAt === null) continue;
      const billable = this.appointmentService.allAppointments()
        .filter(a => a.shiftId === s.id && a.status !== 'cancelled').length;
      if (billable === 0) continue;

      // Does an invoice already cover this shift?
      const covered = this.invoicesSignal().some(i =>
        i.clinicId === clinicId && i.shiftIds.includes(s.id)
      );
      if (covered) continue;

      this.onShiftClosed(s);
      generated++;
    }
    return generated;
  }

  // -------------- Payments + admin actions --------------

  recordPayment(invoiceId: number, amount: number, method: PaymentMethod, reference: string, notes: string): void {
    const inv = this.invoicesSignal().find(i => i.id === invoiceId);
    if (!inv) throw new Error('Invoice not found');
    if (amount <= 0) throw new Error('Amount must be positive');
    if (inv.status === 'open') throw new Error('This invoice is still open. Finalize it before recording payment.');
    const payment: PaymentRecord = {
      paidAt: new Date().toISOString(),
      amount,
      method,
      reference: reference.trim(),
      notes: notes.trim()
    };
    this.invoicesSignal.update(arr => arr.map(i => {
      if (i.id !== invoiceId) return i;
      const payments = [...i.payments, payment];
      const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
      const status: InvoiceStatus = totalPaid >= i.total ? 'paid' : 'partial';
      return { ...i, payments, status };
    }));
  }

  requestClearance(invoiceId: number, note: string): void {
    this.invoicesSignal.update(arr => arr.map(i =>
      i.id === invoiceId
        ? { ...i, clearanceRequestedAt: new Date().toISOString(), clearanceRequestNote: note.trim() }
        : i
    ));
  }

  // -------------- Internal --------------

  private nextId(): number {
    return Math.max(0, ...this.invoicesSignal().map(i => i.id)) + 1;
  }
}
