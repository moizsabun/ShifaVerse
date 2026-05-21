import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ClinicService } from '../../core/services/clinic.service';
import { StaffService } from '../../core/services/staff.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-clinics-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="animate-fade-in-up space-y-6">
      <div class="flex items-end justify-between">
        <div>
          <h1 class="font-display text-4xl font-bold text-slate-900">Clinics</h1>
          <p class="text-slate-500 mt-2">All tenants on the platform</p>
        </div>
        <button (click)="showForm.set(!showForm())"
                class="px-5 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-xl transition-all">
          {{ showForm() ? 'Cancel' : '+ New Clinic' }}
        </button>
      </div>

      @if (showForm()) {
        <div class="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
          <h3 class="font-display text-lg font-semibold text-slate-900 mb-4">Create New Clinic</h3>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-slate-600 mb-1.5">Clinic Name *</label>
              <input type="text" [(ngModel)]="form.name" placeholder="Shifa Family Clinic"
                     class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-600 mb-1.5">URL Slug *</label>
              <input type="text" [(ngModel)]="form.slug" placeholder="shifa-clinic"
                     class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100" />
              <p class="text-[11px] text-slate-500 mt-1">Public URL will be /public/{{ form.slug || 'slug' }}</p>
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-600 mb-1.5">Address</label>
              <input type="text" [(ngModel)]="form.address" placeholder="123 Main Road, Karachi"
                     class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-600 mb-1.5">Phone</label>
              <input type="text" [(ngModel)]="form.phone" placeholder="+92-21-1234-5678"
                     class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-600 mb-1.5">Patient Consultation Fee *</label>
              <input type="number" min="0" step="1" [(ngModel)]="form.patientConsultationFee"
                     class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100" />
              <p class="text-[11px] text-slate-500 mt-1">Charged to the patient · printed on the slip</p>
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-600 mb-1.5">Platform Service Fee (per appointment) *</label>
              <input type="number" min="0" step="1" [(ngModel)]="form.perAppointmentFee"
                     class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100" />
              <p class="text-[11px] text-slate-500 mt-1">What the clinic pays the SaaS platform</p>
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-600 mb-1.5">Currency</label>
              <select [(ngModel)]="form.currency"
                      class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100">
                <option value="PKR">PKR</option>
                <option value="USD">USD</option>
                <option value="INR">INR</option>
                <option value="AED">AED</option>
                <option value="GBP">GBP</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
            <div class="col-span-2">
              <label class="block text-xs font-semibold text-slate-600 mb-1.5">Billing Frequency *</label>
              <select [(ngModel)]="form.billingFrequency"
                      class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100">
                <option value="per-shift">Per Shift — bill each time a shift closes</option>
                <option value="daily">Daily — one invoice per day</option>
                <option value="weekly">Weekly — Mon-Sun, ISO weeks</option>
                <option value="monthly">Monthly — calendar month</option>
              </select>
            </div>
            <div class="col-span-2 pt-3 border-t border-slate-100 mt-2">
              <p class="text-xs font-semibold text-slate-700 mb-2">Initial Owner Account</p>
              <div class="grid grid-cols-3 gap-3">
                <input type="text" [(ngModel)]="form.ownerName" placeholder="Owner full name"
                       class="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
                <input type="email" [(ngModel)]="form.ownerEmail" placeholder="owner@clinic.com"
                       class="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
                <input type="text" [(ngModel)]="form.ownerPassword" placeholder="Password (min 4 chars)"
                       class="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
              </div>
            </div>
          </div>
          @if (error()) {
            <p class="text-xs text-rose-500 mt-3">{{ error() }}</p>
          }
          <div class="mt-5 flex gap-3">
            <button (click)="create()"
                    class="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-xl transition-all">
              Create Clinic
            </button>
            <button (click)="showForm.set(false)" class="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      }

      <div class="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div class="grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wide">
          <div class="col-span-3">Clinic</div>
          <div class="col-span-2">Slug</div>
          <div class="col-span-2 text-right">Patient Fee</div>
          <div class="col-span-2 text-right">Platform Fee</div>
          <div class="col-span-2">Status</div>
          <div class="col-span-1 text-right">Action</div>
        </div>
        <div class="divide-y divide-slate-100">
          @for (c of clinics(); track c.id) {
            <div class="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-slate-50 transition-colors">
              <div class="col-span-3">
                <p class="font-semibold text-slate-900">{{ c.name }}</p>
                <p class="text-xs text-slate-500">{{ c.address }} · {{ c.phone }}</p>
              </div>
              <div class="col-span-2 text-xs font-mono text-emerald-700">/public/{{ c.slug }}</div>
              <div class="col-span-2 text-right text-sm font-semibold">
                {{ c.currency }} {{ c.patientConsultationFee }}
                <p class="text-[10px] font-normal text-slate-500">consultation</p>
              </div>
              <div class="col-span-2 text-right text-sm font-semibold">
                {{ c.currency }} {{ c.perAppointmentFee }}
                <p class="text-[10px] font-normal text-slate-500 capitalize">{{ c.billingFrequency }} SaaS</p>
              </div>
              <div class="col-span-2">
                @if (c.suspended) {
                  <span class="px-2 py-1 bg-rose-100 text-rose-700 rounded-md text-xs font-semibold">SUSPENDED</span>
                } @else if (c.active) {
                  <span class="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-md text-xs font-semibold">ACTIVE</span>
                } @else {
                  <span class="px-2 py-1 bg-slate-200 text-slate-600 rounded-md text-xs font-semibold">INACTIVE</span>
                }
              </div>
              <div class="col-span-1 text-right">
                <a [routerLink]="['/admin/clinics', c.id]" class="text-xs text-indigo-600 font-semibold hover:text-indigo-800">Edit →</a>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class ClinicsListComponent {
  private clinicService = inject(ClinicService);
  private staffService = inject(StaffService);
  private notify = inject(NotificationService);

  clinics = this.clinicService.clinics;
  showForm = signal(false);
  error = signal('');

  form: {
    name: string; slug: string; address: string; phone: string;
    patientConsultationFee: number;
    perAppointmentFee: number; currency: string;
    billingFrequency: 'per-shift' | 'daily' | 'weekly' | 'monthly';
    ownerName: string; ownerEmail: string; ownerPassword: string;
  } = {
    name: '', slug: '', address: '', phone: '',
    patientConsultationFee: 500,
    perAppointmentFee: 50, currency: 'PKR',
    billingFrequency: 'per-shift',
    ownerName: '', ownerEmail: '', ownerPassword: ''
  };

  create(): void {
    this.error.set('');
    try {
      const clinic = this.clinicService.createClinic({
        name: this.form.name,
        slug: this.form.slug,
        address: this.form.address,
        phone: this.form.phone,
        patientConsultationFee: this.form.patientConsultationFee,
        perAppointmentFee: this.form.perAppointmentFee,
        currency: this.form.currency,
        billingFrequency: this.form.billingFrequency
      });
      if (this.form.ownerEmail.trim()) {
        this.staffService.createStaff({
          clinicId: clinic.id,
          role: 'owner',
          name: this.form.ownerName.trim() || 'Owner',
          email: this.form.ownerEmail,
          password: this.form.ownerPassword
        });
      }
      this.notify.success(`${clinic.name} created`);
      this.showForm.set(false);
      this.form = { name: '', slug: '', address: '', phone: '', patientConsultationFee: 500, perAppointmentFee: 50, currency: 'PKR', billingFrequency: 'per-shift', ownerName: '', ownerEmail: '', ownerPassword: '' };
    } catch (e: any) {
      this.error.set(e.message);
    }
  }
}
