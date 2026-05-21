import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClinicService } from '../../core/services/clinic.service';
import { InvoiceService } from '../../core/services/invoice.service';
import { ShiftService } from '../../core/services/shift.service';
import { NotificationService } from '../../core/services/notification.service';
import { PaymentMethod, InvoiceStatus } from '../../core/models/invoice.model';

type Filter = 'all' | InvoiceStatus;

@Component({
  selector: 'app-billing-overview',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="animate-fade-in-up space-y-6">
      <div class="flex items-end justify-between">
        <div>
          <h1 class="font-display text-4xl font-bold text-slate-900">Billing Department</h1>
          <p class="text-slate-500 mt-2">All invoices across all clinics — generated automatically when shifts close</p>
        </div>
        <button (click)="reconcileAll()" class="px-5 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-semibold hover:border-indigo-400 hover:text-indigo-700 transition-all">
          Reconcile from Closed Shifts
        </button>
      </div>

      <div class="flex gap-1 bg-white border border-slate-200 rounded-xl p-1 w-fit">
        @for (f of filters; track f) {
          <button (click)="filter.set(f)"
                  class="px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize"
                  [class]="filter() === f ? 'bg-indigo-500 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'">
            {{ f === 'all' ? 'All' : (f === 'awaiting-payment' ? 'Awaiting Payment' : f) }}
          </button>
        }
      </div>

      <div class="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        @if (rows().length === 0) {
          <div class="p-12 text-center text-slate-400">
            No invoices match this filter. Invoices generate automatically when shifts close.
          </div>
        } @else {
          <div class="divide-y divide-slate-100">
            @for (inv of rows(); track inv.id) {
              <div class="p-5">
                <div class="flex items-center justify-between mb-3">
                  <div>
                    <p class="font-display text-lg font-semibold text-slate-900">{{ clinicName(inv.clinicId) }}</p>
                    <p class="text-xs text-slate-500 mt-0.5">
                      <span class="font-mono">{{ inv.periodKey }}</span>
                      · {{ inv.period }}
                      · {{ inv.appointmentCount }} appointments × {{ inv.currency }} {{ inv.feePerAppointment }}
                    </p>
                  </div>
                  <div class="text-right">
                    <p class="text-2xl font-bold text-slate-900 font-display">{{ inv.currency }} {{ inv.total | number:'1.0-0' }}</p>
                    <span class="inline-block mt-1 px-2 py-0.5 rounded-md text-[10px] font-semibold"
                          [class]="statusClass(inv.status)">
                      {{ statusLabel(inv.status) }}
                    </span>
                    @if (inv.clearanceRequestedAt) {
                      <span class="inline-block ml-1.5 mt-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-md text-[10px] font-semibold">REQUEST SENT</span>
                    }
                  </div>
                </div>

                @if (inv.payments.length > 0) {
                  <div class="mt-2 pt-2 border-t border-slate-100">
                    <p class="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-2">Payment History</p>
                    <div class="space-y-1">
                      @for (p of inv.payments; track $index) {
                        <div class="flex items-center justify-between text-xs">
                          <span class="text-slate-600">
                            {{ formatDate(p.paidAt) }} · <span class="font-semibold">{{ methodLabel(p.method) }}</span>
                            @if (p.reference) { · <span class="font-mono text-slate-500">{{ p.reference }}</span> }
                            @if (p.notes) { · <span class="text-slate-400">{{ p.notes }}</span> }
                          </span>
                          <span class="font-semibold text-emerald-700">{{ inv.currency }} {{ p.amount | number:'1.0-0' }}</span>
                        </div>
                      }
                    </div>
                  </div>
                }

                <div class="mt-3 flex gap-2 flex-wrap">
                  @if (inv.status === 'open') {
                    <button (click)="finalize(inv.id)" class="px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-xs font-semibold hover:bg-amber-100">
                      Finalize Period Early
                    </button>
                  }
                  @if (inv.status === 'awaiting-payment' || inv.status === 'partial') {
                    <button (click)="openPayDialog(inv.id)" class="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold hover:bg-emerald-100">
                      Record Payment
                    </button>
                    <button (click)="openClearanceDialog(inv.id)" class="px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-xs font-semibold hover:bg-amber-100">
                      Request Clearance
                    </button>
                  }
                </div>
              </div>
            }
          </div>
        }
      </div>

      <!-- Pay dialog -->
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
                            [class]="payMethod === m ? 'bg-indigo-500 text-white border-indigo-500' : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-300'">
                      {{ methodLabel(m) }}
                    </button>
                  }
                </div>
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-600 mb-1.5">Reference</label>
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

      <!-- Clearance request dialog -->
      @if (clearanceDialog().open) {
        <div class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div class="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6">
            <h3 class="font-display text-xl font-semibold text-slate-900 mb-1">Request Payment Clearance</h3>
            <p class="text-xs text-slate-500 mb-4">An alert is posted to the clinic owner. Note is optional.</p>
            <textarea [(ngModel)]="clearanceNote" rows="3" placeholder="e.g. Please clear May invoice by 31st"
                      class="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm mb-4"></textarea>
            <div class="flex gap-3 justify-end">
              <button (click)="closeClearance()" class="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200">Cancel</button>
              <button (click)="submitClearance()" class="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-semibold shadow-md hover:shadow-lg">Send Request</button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class BillingOverviewComponent {
  private clinicService = inject(ClinicService);
  private invoiceService = inject(InvoiceService);
  private shiftService = inject(ShiftService);
  private notify = inject(NotificationService);

  filters: Filter[] = ['all', 'open', 'awaiting-payment', 'partial', 'paid'];
  filter = signal<Filter>('all');
  methods: PaymentMethod[] = ['cash', 'bank-transfer', 'cheque'];

  rows = computed(() => {
    const f = this.filter();
    const all = this.invoiceService.all();
    return f === 'all' ? all : all.filter(i => i.status === f);
  });

  payDialog = signal<{ open: boolean; invoiceId: number; remaining: number; currency: string }>({
    open: false, invoiceId: 0, remaining: 0, currency: ''
  });
  payAmount = 0;
  payMethod: PaymentMethod = 'bank-transfer';
  payReference = '';
  payNotes = '';

  clearanceDialog = signal<{ open: boolean; invoiceId: number }>({ open: false, invoiceId: 0 });
  clearanceNote = '';

  clinicName(id: number): string {
    return this.clinicService.getById(id)?.name ?? 'Unknown';
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

  openPayDialog(invoiceId: number): void {
    const inv = this.rows().find(i => i.id === invoiceId);
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

  openClearanceDialog(invoiceId: number): void {
    this.clearanceNote = '';
    this.clearanceDialog.set({ open: true, invoiceId });
  }

  closeClearance(): void {
    this.clearanceDialog.set({ open: false, invoiceId: 0 });
  }

  submitClearance(): void {
    this.invoiceService.requestClearance(this.clearanceDialog().invoiceId, this.clearanceNote);
    this.notify.success('Clearance request sent to clinic owner');
    this.closeClearance();
  }

  finalize(invoiceId: number): void {
    this.invoiceService.finalizeOpenInvoice(invoiceId);
    this.notify.success('Invoice finalized — sent to billing');
  }

  reconcileAll(): void {
    let total = 0;
    for (const c of this.clinicService.clinics()) {
      // Use unscoped allShifts (we're in admin context, can see all)
      const shifts = this.shiftService.allShifts().filter(s => s.clinicId === c.id);
      total += this.invoiceService.reconcileForClinic(c.id, shifts);
    }
    this.notify.success(total > 0 ? `Generated ${total} missing invoice(s)` : 'No missing invoices');
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }
}
