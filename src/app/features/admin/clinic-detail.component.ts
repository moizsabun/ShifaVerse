import { Component, inject, computed, Input, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClinicService } from '../../core/services/clinic.service';
import { StaffService } from '../../core/services/staff.service';
import { InvoiceService } from '../../core/services/invoice.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-clinic-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="animate-fade-in-up">
      <button (click)="location.back()" class="text-sm text-slate-600 hover:text-indigo-600 mb-6 flex items-center gap-1 font-medium transition-colors">
        ← Back
      </button>

      @if (clinic(); as c) {
        <div class="mb-6">
          <h1 class="font-display text-4xl font-bold text-slate-900">{{ c.name }}</h1>
          <p class="text-slate-500 mt-2">Tenant configuration & billing summary</p>
        </div>

        <!-- Edit Card -->
        <div class="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 mb-6">
          <h3 class="font-display text-lg font-semibold text-slate-900 mb-4">Clinic Settings</h3>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-slate-600 mb-1.5">Name</label>
              <input type="text" [(ngModel)]="edit.name" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-indigo-500" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-600 mb-1.5">Slug</label>
              <input type="text" [(ngModel)]="edit.slug" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-indigo-500" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-600 mb-1.5">Address</label>
              <input type="text" [(ngModel)]="edit.address" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-indigo-500" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-600 mb-1.5">Phone</label>
              <input type="text" [(ngModel)]="edit.phone" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-indigo-500" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-600 mb-1.5">Patient Consultation Fee</label>
              <input type="number" min="0" [(ngModel)]="edit.patientConsultationFee" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-indigo-500" />
              <p class="text-[11px] text-slate-500 mt-1">Charged to patient · printed on slip</p>
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-600 mb-1.5">Platform Service Fee (per appointment)</label>
              <input type="number" min="0" [(ngModel)]="edit.perAppointmentFee" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-indigo-500" />
              <p class="text-[11px] text-slate-500 mt-1">What clinic pays SaaS platform</p>
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-600 mb-1.5">Currency</label>
              <select [(ngModel)]="edit.currency" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-indigo-500">
                <option value="PKR">PKR</option>
                <option value="USD">USD</option>
                <option value="INR">INR</option>
                <option value="AED">AED</option>
                <option value="GBP">GBP</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
            <div class="col-span-2">
              <label class="block text-xs font-semibold text-slate-600 mb-1.5">Billing Frequency</label>
              <select [(ngModel)]="edit.billingFrequency" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-indigo-500">
                <option value="per-shift">Per Shift — invoice posted each time a shift closes</option>
                <option value="daily">Daily — one invoice per day, accumulates across shifts</option>
                <option value="weekly">Weekly — ISO weeks (Mon-Sun)</option>
                <option value="monthly">Monthly — calendar month</option>
              </select>
              <p class="text-[11px] text-slate-500 mt-1">Determines when the billing department receives a finalized invoice for collection.</p>
            </div>
          </div>
          @if (error()) {
            <p class="text-xs text-rose-500 mt-3">{{ error() }}</p>
          }
          <div class="flex gap-3 mt-5 flex-wrap">
            <button (click)="save()" class="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-xl transition-all">
              Save Changes
            </button>
            <button (click)="toggleActive()" [class.bg-amber-100]="c.active" [class.text-amber-700]="c.active" [class.bg-emerald-100]="!c.active" [class.text-emerald-700]="!c.active"
                    class="px-5 py-3 rounded-xl font-semibold hover:opacity-80 transition-all">
              {{ c.active ? 'Deactivate Clinic' : 'Reactivate Clinic' }}
            </button>
            <button (click)="toggleSuspend()"
                    [class]="c.suspended ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'"
                    class="px-5 py-3 rounded-xl font-semibold hover:opacity-80 transition-all">
              {{ c.suspended ? 'Resume Clinic (lift suspension)' : 'Suspend Clinic (block staff login)' }}
            </button>
          </div>
        </div>

        @if (c.suspended) {
          <div class="bg-rose-50 border-l-4 border-rose-500 rounded-2xl p-5 mb-6 flex items-start gap-3">
            <svg class="w-6 h-6 text-rose-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            <div>
              <p class="font-bold text-rose-900">Clinic is SUSPENDED</p>
              <p class="text-sm text-rose-700 mt-1">Doctors and compounders cannot log in. Only the owner can sign in (to clear payment).</p>
            </div>
          </div>
        }

        <!-- Billing Summary -->
        <div class="grid grid-cols-3 gap-4 mb-6">
          <div class="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <p class="text-xs font-semibold text-slate-500 uppercase tracking-wide">Invoiced</p>
            <p class="text-3xl font-bold text-slate-900 font-display mt-3">{{ totals().invoiced | number:'1.0-0' }}</p>
            <p class="text-xs text-slate-500 mt-1">{{ c.currency }}</p>
          </div>
          <div class="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <p class="text-xs font-semibold text-slate-500 uppercase tracking-wide">Paid</p>
            <p class="text-3xl font-bold text-emerald-600 font-display mt-3">{{ totals().paid | number:'1.0-0' }}</p>
            <p class="text-xs text-slate-500 mt-1">{{ c.currency }}</p>
          </div>
          <div class="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <p class="text-xs font-semibold text-slate-500 uppercase tracking-wide">Outstanding</p>
            <p class="text-3xl font-bold text-rose-600 font-display mt-3">{{ totals().outstanding | number:'1.0-0' }}</p>
            <p class="text-xs text-slate-500 mt-1">{{ c.currency }}</p>
          </div>
        </div>

        <!-- Staff Summary -->
        <div class="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div class="p-6 border-b border-slate-100">
            <h3 class="font-display text-lg font-semibold text-slate-900">Staff Accounts</h3>
            <p class="text-sm text-slate-500 mt-1">{{ staff().length }} account(s) — owner manages staff from their portal</p>
          </div>
          <div class="divide-y divide-slate-100">
            @for (s of staff(); track s.id) {
              <div class="px-6 py-4 flex items-center justify-between">
                <div>
                  <p class="font-semibold text-slate-900">{{ s.name }}</p>
                  <p class="text-xs text-slate-500">{{ s.email }}</p>
                </div>
                <span class="px-2 py-1 rounded-md text-xs font-semibold uppercase"
                      [class]="roleBadge(s.role)">
                  {{ s.role }}
                </span>
              </div>
            }
            @if (staff().length === 0) {
              <div class="p-8 text-center text-slate-400 text-sm">No staff accounts yet</div>
            }
          </div>
        </div>
      } @else {
        <div class="bg-white rounded-3xl p-16 text-center">
          <p class="text-slate-500">Clinic not found</p>
        </div>
      }
    </div>
  `
})
export class ClinicDetailComponent {
  @Input() id?: string;

  private clinicService = inject(ClinicService);
  private staffService = inject(StaffService);
  private invoiceService = inject(InvoiceService);
  private notify = inject(NotificationService);
  location = inject(Location);

  error = signal('');
  edit = {
    name: '', slug: '', address: '', phone: '',
    patientConsultationFee: 0,
    perAppointmentFee: 0, currency: 'PKR',
    billingFrequency: 'per-shift' as 'per-shift' | 'daily' | 'weekly' | 'monthly'
  };

  clinic = computed(() => {
    const cid = parseInt(this.id || '0', 10);
    const c = this.clinicService.getById(cid);
    if (c && this.edit.name === '' && this.edit.slug === '') {
      this.edit = {
        name: c.name, slug: c.slug, address: c.address, phone: c.phone,
        patientConsultationFee: c.patientConsultationFee,
        perAppointmentFee: c.perAppointmentFee, currency: c.currency,
        billingFrequency: c.billingFrequency
      };
    }
    return c;
  });

  staff = computed(() => {
    const c = this.clinic();
    return c ? this.staffService.byClinic(c.id) : [];
  });

  totals = computed(() => {
    const c = this.clinic();
    return c ? this.invoiceService.totalsForClinic(c.id) : { invoiced: 0, paid: 0, outstanding: 0 };
  });

  save(): void {
    this.error.set('');
    const c = this.clinic();
    if (!c) return;
    try {
      this.clinicService.updateClinic(c.id, this.edit);
      this.notify.success('Clinic updated');
    } catch (e: any) {
      this.error.set(e.message);
    }
  }

  toggleActive(): void {
    const c = this.clinic();
    if (!c) return;
    this.clinicService.setActive(c.id, !c.active);
    this.notify.success(c.active ? 'Clinic deactivated' : 'Clinic reactivated');
  }

  toggleSuspend(): void {
    const c = this.clinic();
    if (!c) return;
    this.clinicService.setSuspended(c.id, !c.suspended);
    this.notify.success(c.suspended ? 'Clinic resumed' : 'Clinic suspended — staff blocked');
  }

  roleBadge(role: string): string {
    return ({
      owner: 'bg-purple-100 text-purple-700',
      doctor: 'bg-emerald-100 text-emerald-700',
      compounder: 'bg-amber-100 text-amber-700'
    } as Record<string, string>)[role] ?? 'bg-slate-100 text-slate-700';
  }
}
