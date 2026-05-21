import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { InvoiceService } from '../../core/services/invoice.service';
import { NotificationService } from '../../core/services/notification.service';
import { PaymentMethod, InvoiceStatus } from '../../core/models/invoice.model';

@Component({
  selector: 'app-owner-billing',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="animate-fade-in-up space-y-6">
      @if (auth.isClinicSuspended()) {
        <div class="bg-rose-50 border-l-4 border-rose-500 rounded-2xl p-5 flex items-start gap-3">
          <svg class="w-6 h-6 text-rose-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          <div>
            <p class="font-bold text-rose-900">Your clinic is currently suspended for non-payment.</p>
            <p class="text-sm text-rose-700 mt-1">Doctors and compounders cannot log in until outstanding bills are cleared. Use the payment buttons below to record bank transfer / cheque / cash payment, then ask the platform admin to lift suspension.</p>
          </div>
        </div>
      }

      <div class="flex items-end justify-between">
        <div>
          <h1 class="font-display text-4xl font-bold text-slate-900">Billing & Invoices</h1>
          <p class="text-slate-500 mt-2">
            {{ clinic()?.currency }} {{ clinic()?.perAppointmentFee }} per appointment ·
            Billed <span class="font-semibold">{{ frequencyLabel() }}</span> · Auto-generated when shifts close
          </p>
        </div>
      </div>

      <div class="grid grid-cols-4 gap-5">
        <div class="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <p class="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Invoiced</p>
          <p class="text-3xl font-bold text-slate-900 font-display mt-3">{{ totals().invoiced | number:'1.0-0' }}</p>
          <p class="text-xs text-slate-500 mt-1">{{ clinic()?.currency }}</p>
        </div>
        <div class="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <p class="text-xs font-semibold text-slate-500 uppercase tracking-wide">Paid</p>
          <p class="text-3xl font-bold text-emerald-600 font-display mt-3">{{ totals().paid | number:'1.0-0' }}</p>
        </div>
        <div class="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <p class="text-xs font-semibold text-slate-500 uppercase tracking-wide">Outstanding</p>
          <p class="text-3xl font-bold text-rose-600 font-display mt-3">{{ totals().outstanding | number:'1.0-0' }}</p>
        </div>
        <div class="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <p class="text-xs font-semibold text-slate-500 uppercase tracking-wide">Clearance Requests</p>
          <p class="text-3xl font-bold text-amber-600 font-display mt-3">{{ clearanceCount() }}</p>
          <p class="text-xs text-slate-500 mt-1">unaddressed</p>
        </div>
      </div>

      <div class="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div class="p-6 border-b border-slate-100">
          <h3 class="font-display text-lg font-semibold text-slate-900">Invoices</h3>
        </div>
        @if (invoices().length === 0) {
          <div class="p-12 text-center text-slate-400">
            No invoices yet — they appear automatically when a shift is closed.
          </div>
        } @else {
          <div class="divide-y divide-slate-100">
            @for (inv of invoices(); track inv.id) {
              <div class="p-5">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="font-display text-lg font-semibold text-slate-900">{{ periodTitle(inv) }}</p>
                    <p class="text-sm text-slate-500">
                      {{ inv.appointmentCount }} appointments × {{ inv.currency }} {{ inv.feePerAppointment }}
                      · <span class="text-slate-400">{{ inv.shiftIds.length }} shift(s)</span>
                    </p>
                  </div>
                  <div class="text-right">
                    <p class="text-2xl font-bold text-slate-900 font-display">{{ inv.currency }} {{ inv.total | number:'1.0-0' }}</p>
                    <span class="inline-block mt-1 px-2 py-0.5 rounded-md text-[10px] font-semibold" [class]="statusClass(inv.status)">
                      {{ statusLabel(inv.status) }}
                    </span>
                  </div>
                </div>

                @if (inv.clearanceRequestedAt) {
                  <div class="mt-3 bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs">
                    <p class="font-semibold text-amber-800">⚠ Clearance requested by platform admin · {{ formatDate(inv.clearanceRequestedAt) }}</p>
                    @if (inv.clearanceRequestNote) {
                      <p class="text-amber-700 mt-1">{{ inv.clearanceRequestNote }}</p>
                    }
                  </div>
                }

                @if (inv.payments.length > 0) {
                  <div class="mt-3 pt-3 border-t border-slate-100">
                    <p class="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-2">Payments</p>
                    <div class="space-y-1">
                      @for (p of inv.payments; track $index) {
                        <div class="flex items-center justify-between text-xs">
                          <span class="text-slate-600">
                            {{ formatDate(p.paidAt) }} · <span class="font-semibold">{{ methodLabel(p.method) }}</span>
                            @if (p.reference) { · <span class="font-mono text-slate-500">{{ p.reference }}</span> }
                          </span>
                          <span class="font-semibold text-emerald-700">{{ inv.currency }} {{ p.amount | number:'1.0-0' }}</span>
                        </div>
                      }
                    </div>
                  </div>
                }

                @if (inv.status === 'awaiting-payment' || inv.status === 'partial') {
                  <div class="mt-3">
                    <button (click)="openPayDialog(inv.id)" class="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold hover:bg-emerald-100">
                      Record Payment
                    </button>
                  </div>
                }
              </div>
            }
          </div>
        }
      </div>

      @if (payDialog().open) {
        <div class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div class="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6">
            <h3 class="font-display text-xl font-semibold text-slate-900 mb-1">Record Payment</h3>
            <p class="text-xs text-slate-500 mb-4">Remaining: {{ payDialog().remaining | number:'1.0-0' }} {{ payDialog().currency }}</p>
            <div class="space-y-3 mb-4">
              <div>
                <label class="block text-xs font-semibold text-slate-600 mb-1.5">Amount ({{ payDialog().currency }})</label>
                <input type="number" min="0" [(ngModel)]="payAmount" class="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-600 mb-1.5">Payment Method</label>
                <div class="grid grid-cols-3 gap-2">
                  @for (m of methods; track m) {
                    <button (click)="payMethod = m" type="button"
                            class="px-3 py-2.5 rounded-xl text-sm font-semibold transition-all border"
                            [class]="payMethod === m ? 'bg-amber-500 text-white border-amber-500' : 'bg-white border-slate-200 text-slate-700 hover:border-amber-300'">
                      {{ methodLabel(m) }}
                    </button>
                  }
                </div>
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-600 mb-1.5">Reference / Receipt #</label>
                <input type="text" [(ngModel)]="payReference"
                       [placeholder]="payMethod === 'cheque' ? 'Cheque number' : payMethod === 'bank-transfer' ? 'Transaction ID' : 'Receipt #'"
                       class="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-600 mb-1.5">Notes (optional)</label>
                <input type="text" [(ngModel)]="payNotes" class="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
              </div>
            </div>
            <div class="flex gap-3 justify-end">
              <button (click)="closeDialog()" class="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200">Cancel</button>
              <button (click)="submitPayment()" class="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold shadow-md hover:shadow-lg">Record</button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class OwnerBillingComponent {
  auth = inject(AuthService);
  private invoiceService = inject(InvoiceService);
  private notify = inject(NotificationService);

  methods: PaymentMethod[] = ['cash', 'bank-transfer', 'cheque'];

  clinic = computed(() => this.auth.currentClinic());
  invoices = computed(() => {
    const cid = this.auth.currentClinicId();
    return cid ? this.invoiceService.byClinic(cid) : [];
  });
  totals = computed(() => {
    const cid = this.auth.currentClinicId();
    return cid ? this.invoiceService.totalsForClinic(cid) : { invoiced: 0, paid: 0, outstanding: 0 };
  });
  clearanceCount = computed(() =>
    this.invoices().filter(i => i.clearanceRequestedAt && i.status !== 'paid').length
  );

  payDialog = signal<{ open: boolean; invoiceId: number; remaining: number; currency: string }>({
    open: false, invoiceId: 0, remaining: 0, currency: ''
  });
  payAmount = 0;
  payMethod: PaymentMethod = 'bank-transfer';
  payReference = '';
  payNotes = '';

  frequencyLabel(): string {
    const f = this.clinic()?.billingFrequency;
    return ({ 'per-shift': 'per shift', daily: 'daily', weekly: 'weekly', monthly: 'monthly' } as const)[f as 'per-shift'] ?? '';
  }

  methodLabel(m: PaymentMethod): string {
    return ({ cash: 'Cash', 'bank-transfer': 'Bank Transfer', cheque: 'Cheque' } as const)[m];
  }

  statusLabel(s: InvoiceStatus): string {
    return ({ open: 'OPEN', 'awaiting-payment': 'AWAITING', partial: 'PARTIAL', paid: 'PAID' } as const)[s];
  }

  statusClass(s: InvoiceStatus): string {
    return ({
      open: 'bg-blue-100 text-blue-700',
      'awaiting-payment': 'bg-rose-100 text-rose-700',
      partial: 'bg-amber-100 text-amber-700',
      paid: 'bg-emerald-100 text-emerald-700'
    } as const)[s];
  }

  periodTitle(inv: { period: string; periodKey: string; periodStart: string }): string {
    if (inv.period === 'per-shift') return `Shift Invoice · ${this.formatShortDate(inv.periodStart)}`;
    if (inv.period === 'daily')     return `Daily · ${inv.periodKey}`;
    if (inv.period === 'weekly')    return `Weekly · ${inv.periodKey}`;
    if (inv.period === 'monthly') {
      const [y, m] = inv.periodKey.split('-').map(Number);
      return new Date(y, m - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
    return inv.periodKey;
  }

  openPayDialog(invoiceId: number): void {
    const inv = this.invoices().find(i => i.id === invoiceId);
    if (!inv) return;
    const remaining = this.invoiceService.remaining(inv);
    this.payAmount = remaining;
    this.payMethod = 'bank-transfer';
    this.payReference = '';
    this.payNotes = '';
    this.payDialog.set({ open: true, invoiceId, remaining, currency: inv.currency });
  }

  closeDialog(): void {
    this.payDialog.set({ open: false, invoiceId: 0, remaining: 0, currency: '' });
  }

  submitPayment(): void {
    try {
      this.invoiceService.recordPayment(
        this.payDialog().invoiceId,
        Number(this.payAmount),
        this.payMethod,
        this.payReference,
        this.payNotes
      );
      this.notify.success('Payment recorded');
      this.closeDialog();
    } catch (e: any) {
      this.notify.error(e.message);
    }
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  formatShortDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
}
