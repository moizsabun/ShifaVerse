import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ClinicService } from '../../core/services/clinic.service';
import { InvoiceService } from '../../core/services/invoice.service';
import { AppointmentService } from '../../core/services/appointment.service';
import { ShiftService } from '../../core/services/shift.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="animate-fade-in-up space-y-6">
      <div class="flex items-end justify-between">
        <div>
          <h1 class="font-display text-4xl font-bold text-slate-900">Platform Overview</h1>
          <p class="text-slate-500 mt-2">All clinics and their SaaS billing at a glance.</p>
        </div>
        <button (click)="reconcile()" class="px-5 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all">
          Reconcile from Closed Shifts
        </button>
      </div>

      <div class="grid grid-cols-4 gap-5">
        <div class="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <p class="text-xs font-semibold text-slate-500 uppercase tracking-wide">Clinics</p>
          <p class="text-3xl font-bold text-slate-900 font-display mt-3">{{ clinicCount() }}</p>
          <p class="text-xs text-slate-500 mt-1">{{ activeCount() }} active</p>
        </div>
        <div class="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <p class="text-xs font-semibold text-slate-500 uppercase tracking-wide">Appointments (all-time)</p>
          <p class="text-3xl font-bold text-slate-900 font-display mt-3">{{ totalAppointments() }}</p>
        </div>
        <div class="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <p class="text-xs font-semibold text-slate-500 uppercase tracking-wide">Invoiced (all-time)</p>
          <p class="text-3xl font-bold text-slate-900 font-display mt-3">{{ totalInvoiced() | number:'1.0-0' }}</p>
          <p class="text-xs text-slate-500 mt-1">PKR</p>
        </div>
        <div class="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <p class="text-xs font-semibold text-slate-500 uppercase tracking-wide">Outstanding</p>
          <p class="text-3xl font-bold text-rose-600 font-display mt-3">{{ totalOutstanding() | number:'1.0-0' }}</p>
          <p class="text-xs text-slate-500 mt-1">PKR</p>
        </div>
      </div>

      <div class="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div class="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 class="font-display text-xl font-semibold text-slate-900">Clinics</h3>
            <p class="text-sm text-slate-500 mt-1">Per-clinic usage and billing summary</p>
          </div>
          <a routerLink="/admin/clinics" class="text-sm text-indigo-600 font-semibold hover:text-indigo-700">Manage all →</a>
        </div>
        <div class="grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wide">
          <div class="col-span-3">Clinic</div>
          <div class="col-span-2">Slug / Public URL</div>
          <div class="col-span-1 text-right">Fee / Cycle</div>
          <div class="col-span-2 text-right">Open Bills</div>
          <div class="col-span-2 text-right">Outstanding</div>
          <div class="col-span-2 text-right">Action</div>
        </div>
        <div class="divide-y divide-slate-100">
          @for (row of rows(); track row.clinic.id) {
            <div class="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-slate-50 transition-colors">
              <div class="col-span-3">
                <p class="font-semibold text-slate-900">{{ row.clinic.name }}</p>
                <p class="text-xs text-slate-500">{{ row.clinic.address }}</p>
              </div>
              <div class="col-span-2">
                <a [href]="'public/' + row.clinic.slug" target="_blank" class="text-xs text-emerald-600 hover:underline font-mono">/public/{{ row.clinic.slug }}</a>
              </div>
              <div class="col-span-1 text-right text-sm font-semibold text-slate-700">
                {{ row.clinic.currency }} {{ row.clinic.perAppointmentFee }}
                <p class="text-[10px] font-normal text-slate-500 capitalize">{{ row.clinic.billingFrequency }}</p>
              </div>
              <div class="col-span-2 text-right">
                <p class="font-bold" [class.text-rose-600]="row.openBills > 0" [class.text-slate-900]="row.openBills === 0">{{ row.openBills }}</p>
                <p class="text-[11px] text-slate-500">unpaid / partial</p>
              </div>
              <div class="col-span-2 text-right">
                @if (row.totals.outstanding > 0) {
                  <p class="font-bold text-rose-600">{{ row.totals.outstanding | number:'1.0-0' }}</p>
                } @else {
                  <p class="font-bold text-emerald-600">0</p>
                }
                <p class="text-[11px] text-slate-500">{{ row.clinic.currency }}</p>
              </div>
              <div class="col-span-2 text-right">
                @if (row.clinic.suspended) {
                  <span class="inline-block mb-1 px-2 py-0.5 bg-rose-100 text-rose-700 rounded-md text-[10px] font-semibold">SUSPENDED</span>
                }
                <a [routerLink]="['/admin/clinics', row.clinic.id]" class="block text-xs text-indigo-600 hover:text-indigo-800 font-semibold">View →</a>
              </div>
            </div>
          }
          @if (rows().length === 0) {
            <div class="p-12 text-center text-slate-400">No clinics yet</div>
          }
        </div>
      </div>
    </div>
  `
})
export class AdminDashboardComponent {
  private clinicService = inject(ClinicService);
  private invoiceService = inject(InvoiceService);
  private appointmentService = inject(AppointmentService);
  private shiftService = inject(ShiftService);
  private notify = inject(NotificationService);

  clinicCount = computed(() => this.clinicService.clinics().length);
  activeCount = computed(() => this.clinicService.activeClinics().length);
  totalAppointments = computed(() => this.appointmentService.allAppointments().filter(a => a.status !== 'cancelled').length);

  rows = computed(() => this.clinicService.clinics().map(clinic => {
    const invs = this.invoiceService.byClinic(clinic.id);
    const openBills = invs.filter(i => i.status === 'awaiting-payment' || i.status === 'partial').length;
    return {
      clinic,
      openBills,
      totals: this.invoiceService.totalsForClinic(clinic.id)
    };
  }));

  totalInvoiced = computed(() => this.rows().reduce((s, r) => s + r.totals.invoiced, 0));
  totalOutstanding = computed(() => this.rows().reduce((s, r) => s + r.totals.outstanding, 0));

  reconcile(): void {
    let total = 0;
    for (const c of this.clinicService.clinics()) {
      const shifts = this.shiftService.allShifts().filter(s => s.clinicId === c.id);
      total += this.invoiceService.reconcileForClinic(c.id, shifts);
    }
    this.notify.success(total > 0 ? `Generated ${total} missing invoice(s)` : 'No missing invoices');
  }
}
