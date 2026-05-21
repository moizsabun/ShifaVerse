import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { AppointmentService } from '../../core/services/appointment.service';
import { StaffService } from '../../core/services/staff.service';
import { InvoiceService } from '../../core/services/invoice.service';
import { ShiftService } from '../../core/services/shift.service';

@Component({
  selector: 'app-owner-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="animate-fade-in-up space-y-6">
      <div>
        <h1 class="font-display text-4xl font-bold text-slate-900">{{ clinic()?.name }}</h1>
        <p class="text-slate-500 mt-2">Welcome back, {{ auth.currentUser()?.name }}</p>
      </div>

      <div class="grid grid-cols-4 gap-5">
        <div class="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <p class="text-xs font-semibold text-slate-500 uppercase tracking-wide">Active Shift</p>
          <p class="text-3xl font-bold text-slate-900 font-display mt-3">{{ activeShift() ? '1' : '0' }}</p>
          <p class="text-xs text-slate-500 mt-1">{{ activeShift()?.name ?? 'No shift open' }}</p>
        </div>
        <div class="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <p class="text-xs font-semibold text-slate-500 uppercase tracking-wide">Staff Accounts</p>
          <p class="text-3xl font-bold text-slate-900 font-display mt-3">{{ staffCount() }}</p>
          <p class="text-xs text-slate-500 mt-1">{{ doctorCount() }} doctor · {{ compounderCount() }} compounder</p>
        </div>
        <div class="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <p class="text-xs font-semibold text-slate-500 uppercase tracking-wide">Open Bills</p>
          <p class="text-3xl font-bold" [class.text-rose-600]="liveCount() > 0" [class.text-slate-900]="liveCount() === 0">{{ liveCount() }}</p>
          <p class="text-xs text-slate-500 mt-1">{{ feeLabel() }} platform fee/appt</p>
        </div>
        <div class="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <p class="text-xs font-semibold text-slate-500 uppercase tracking-wide">Outstanding</p>
          <p class="text-3xl font-bold text-rose-600 font-display mt-3">{{ totals().outstanding | number:'1.0-0' }}</p>
          <p class="text-xs text-slate-500 mt-1">{{ clinic()?.currency }}</p>
        </div>
      </div>

      <div class="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
        <h3 class="font-display text-lg font-semibold text-slate-900 mb-3">Fee Configuration</h3>
        <p class="text-xs text-slate-500 mb-4">Set by the platform admin · contact admin to change</p>
        <div class="grid grid-cols-2 gap-4">
          <div class="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
            <p class="text-[11px] font-semibold uppercase tracking-wide text-emerald-700">Patient Consultation Fee</p>
            <p class="font-display text-3xl font-bold text-emerald-900 mt-2">{{ clinic()?.currency }} {{ clinic()?.patientConsultationFee }}</p>
            <p class="text-[11px] text-emerald-700 mt-1">Charged to patient · printed on slip</p>
          </div>
          <div class="bg-indigo-50 border border-indigo-200 rounded-2xl p-4">
            <p class="text-[11px] font-semibold uppercase tracking-wide text-indigo-700">Platform Service Fee</p>
            <p class="font-display text-3xl font-bold text-indigo-900 mt-2">{{ clinic()?.currency }} {{ clinic()?.perAppointmentFee }}</p>
            <p class="text-[11px] text-indigo-700 mt-1">Your cost · per appointment · billed {{ clinic()?.billingFrequency }}</p>
          </div>
        </div>
      </div>

      <div class="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl border border-amber-100 p-6">
        <p class="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-2">Public Queue URL</p>
        <p class="font-mono text-lg font-bold text-slate-900">{{ publicUrl() }}</p>
        <p class="text-xs text-slate-600 mt-2">Anyone can view your live queue at this address — no login needed.</p>
        <a [href]="publicLinkHref()" target="_blank" class="inline-block mt-3 px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-semibold hover:bg-amber-700 transition-colors">
          Open Public Dashboard ↗
        </a>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <a routerLink="/owner/staff" class="block bg-white rounded-3xl border border-slate-100 shadow-sm p-6 hover:shadow-lg transition-shadow">
          <h3 class="font-display text-lg font-semibold text-slate-900">Manage Staff →</h3>
          <p class="text-sm text-slate-500 mt-1">Add doctors and compounders, manage their credentials</p>
        </a>
        <a routerLink="/owner/billing" class="block bg-white rounded-3xl border border-slate-100 shadow-sm p-6 hover:shadow-lg transition-shadow">
          <h3 class="font-display text-lg font-semibold text-slate-900">View Billing →</h3>
          <p class="text-sm text-slate-500 mt-1">Monthly invoices and payment history</p>
        </a>
      </div>
    </div>
  `
})
export class OwnerDashboardComponent {
  auth = inject(AuthService);
  private appointmentService = inject(AppointmentService);
  private staffService = inject(StaffService);
  private invoiceService = inject(InvoiceService);
  private shiftService = inject(ShiftService);

  clinic = computed(() => this.auth.currentClinic());
  activeShift = computed(() => this.shiftService.activeShift());

  staffCount = computed(() => {
    const c = this.clinic();
    return c ? this.staffService.byClinic(c.id).length : 0;
  });
  doctorCount = computed(() => {
    const c = this.clinic();
    return c ? this.staffService.byClinicAndRole(c.id, 'doctor').length : 0;
  });
  compounderCount = computed(() => {
    const c = this.clinic();
    return c ? this.staffService.byClinicAndRole(c.id, 'compounder').length : 0;
  });
  liveCount = computed(() => {
    const c = this.clinic();
    if (!c) return 0;
    return this.invoiceService.byClinic(c.id)
      .filter(i => i.status === 'awaiting-payment' || i.status === 'partial').length;
  });
  totals = computed(() => {
    const c = this.clinic();
    return c ? this.invoiceService.totalsForClinic(c.id) : { invoiced: 0, paid: 0, outstanding: 0 };
  });

  feeLabel(): string {
    const c = this.clinic();
    return c ? `${c.currency} ${c.perAppointmentFee}` : '';
  }

  publicUrl(): string {
    const c = this.clinic();
    return c ? `${window.location.origin}${this.baseHref()}public/${c.slug}` : '';
  }

  publicLinkHref(): string {
    const c = this.clinic();
    return c ? `public/${c.slug}` : '#';
  }

  private baseHref(): string {
    const el = document.querySelector('base');
    return el?.getAttribute('href') ?? '/';
  }
}
