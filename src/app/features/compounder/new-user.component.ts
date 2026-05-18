import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../core/services/user.service';
import { NotificationService } from '../../core/services/notification.service';

interface FormErrors {
  name?: string;
  mobile?: string;
  age?: string;
}

@Component({
  selector: 'app-new-user',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="animate-fade-in-up max-w-2xl">
      <!-- Back button -->
      <button (click)="back()" 
              class="text-sm text-slate-600 hover:text-emerald-600 mb-6 flex items-center gap-1 font-medium transition-colors">
        ← Back
      </button>

      <div class="mb-8">
        <h1 class="font-display text-4xl font-bold text-slate-900">New Patient</h1>
        <p class="text-slate-500 mt-2">Register a new patient in the clinic system</p>
      </div>

      <div class="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
        <div class="space-y-6">
          
          <!-- Name -->
          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
            <div class="relative">
              <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <input 
                type="text"
                [(ngModel)]="form.name"
                (input)="errors.update(e => ({ ...e, name: undefined }))"
                placeholder="e.g., Muhammad Ahmed"
                class="w-full pl-11 pr-4 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:bg-white focus:ring-4 focus:ring-emerald-100 transition-all"
                [class]="errors().name ? 'border-rose-300 focus:border-rose-500' : 'border-slate-200 focus:border-emerald-500'" />
            </div>
            @if (errors().name) {
              <p class="text-xs text-rose-500 mt-1.5 flex items-center gap-1">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                {{ errors().name }}
              </p>
            }
          </div>

          <!-- Mobile -->
          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-2">Mobile Number</label>
            <div class="relative">
              <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <input 
                type="tel"
                [(ngModel)]="form.mobile"
                (input)="errors.update(e => ({ ...e, mobile: undefined }))"
                placeholder="e.g., 0301-2345678"
                class="w-full pl-11 pr-4 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:bg-white focus:ring-4 focus:ring-emerald-100 transition-all"
                [class]="errors().mobile ? 'border-rose-300 focus:border-rose-500' : 'border-slate-200 focus:border-emerald-500'" />
            </div>
            @if (errors().mobile) {
              <p class="text-xs text-rose-500 mt-1.5 flex items-center gap-1">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                {{ errors().mobile }}
              </p>
            }
          </div>

          <!-- Age -->
          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-2">Age</label>
            <div class="relative">
              <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z" />
              </svg>
              <input 
                type="number"
                [(ngModel)]="form.age"
                (input)="errors.update(e => ({ ...e, age: undefined }))"
                placeholder="e.g., 32"
                min="1"
                max="120"
                class="w-full pl-11 pr-4 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:bg-white focus:ring-4 focus:ring-emerald-100 transition-all"
                [class]="errors().age ? 'border-rose-300 focus:border-rose-500' : 'border-slate-200 focus:border-emerald-500'" />
            </div>
            @if (errors().age) {
              <p class="text-xs text-rose-500 mt-1.5 flex items-center gap-1">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                {{ errors().age }}
              </p>
            }
          </div>

          <!-- Submit -->
          <div class="flex gap-3 pt-4">
            <button (click)="submit()"
                    class="flex-1 px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 hover:-translate-y-0.5 transition-all">
              Register Patient
            </button>
            <button (click)="back()"
                    class="px-6 py-3.5 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class NewUserComponent {
  private userService = inject(UserService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  form = { name: '', mobile: '', age: null as number | null };
  errors = signal<FormErrors>({});

  validate(): boolean {
    const e: FormErrors = {};
    
    if (!this.form.name.trim()) {
      e.name = 'Name is required';
    } else if (this.form.name.trim().length < 2) {
      e.name = 'Name must be at least 2 characters';
    }

    if (!this.form.mobile.trim()) {
      e.mobile = 'Mobile number is required';
    } else if (!/^[\d\-+\s()]{10,15}$/.test(this.form.mobile.trim())) {
      e.mobile = 'Invalid mobile number format';
    }

    if (!this.form.age) {
      e.age = 'Age is required';
    } else if (this.form.age < 1 || this.form.age > 120) {
      e.age = 'Age must be between 1 and 120';
    }

    this.errors.set(e);
    return Object.keys(e).length === 0;
  }

  submit(): void {
    if (!this.validate()) return;

    try {
      const user = this.userService.addUser({
        name: this.form.name.trim(),
        mobile: this.form.mobile.trim(),
        age: this.form.age!
      });
      this.notificationService.success(`Patient ${user.name} registered successfully`);
      this.router.navigate(['/compounder/users']);
    } catch (err: any) {
      this.notificationService.error(err.message);
    }
  }

  back(): void {
    this.router.navigate(['/compounder/users']);
  }
}
