import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../../core/services/user.service';
import { AppointmentService } from '../../core/services/appointment.service';
import { ShiftService } from '../../core/services/shift.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-new-appointment',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="animate-fade-in-up">
      <button (click)="back()"
              class="text-sm text-slate-600 hover:text-emerald-600 mb-6 flex items-center gap-1 font-medium transition-colors">
        ← Back
      </button>

      <div class="mb-8">
        <h1 class="font-display text-4xl font-bold text-slate-900">Book Appointment</h1>
        <p class="text-slate-500 mt-2">Active shift only — advance-time bookings allowed via manual token</p>
      </div>

      @if (!activeShift()) {
        <div class="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6 flex items-start gap-3">
          <svg class="w-6 h-6 text-amber-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <div class="flex-1">
            <p class="font-semibold text-amber-900">No active shift</p>
            <p class="text-sm text-amber-700 mt-1">Open a shift first to take appointments.</p>
            <a routerLink="/compounder/shifts"
               class="inline-block mt-3 px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-semibold hover:bg-amber-700 transition-colors">
              Go to Shift Management
            </a>
          </div>
        </div>
      }

      <div class="grid grid-cols-3 gap-6">
        <!-- Main Form -->
        <div class="col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
          <h3 class="font-display text-lg font-semibold text-slate-900 mb-6">Appointment Details</h3>

          <!-- Patient Selection -->
          <div class="mb-6">
            <label class="block text-sm font-semibold text-slate-700 mb-2">Select Patient</label>
            @if (!selectedUser()) {
              <div class="relative mb-3">
                <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search patient by name or mobile..."
                  [(ngModel)]="userSearch"
                  class="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all" />
              </div>
              <div class="max-h-56 overflow-y-auto scrollbar-thin border border-slate-100 rounded-xl">
                @for (u of filteredUsers(); track u.id) {
                  <button (click)="selectUser(u.id)"
                          class="w-full px-4 py-3 flex items-center gap-3 hover:bg-emerald-50 transition-colors text-left border-b border-slate-50 last:border-0">
                    <div class="w-9 h-9 bg-gradient-to-br from-emerald-100 to-teal-100 text-emerald-700 rounded-lg flex items-center justify-center text-xs font-bold">
                      {{ getInitials(u.name) }}
                    </div>
                    <div class="flex-1">
                      <p class="text-sm font-semibold text-slate-900">{{ u.name }}</p>
                      <p class="text-xs text-slate-500">{{ u.mobile }} • Age {{ u.age }}</p>
                    </div>
                  </button>
                }
                @if (filteredUsers().length === 0) {
                  <div class="p-6 text-center text-sm text-slate-400">No patients found</div>
                }
              </div>
            } @else {
              <div class="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                <div class="w-11 h-11 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-xl flex items-center justify-center font-bold">
                  {{ getInitials(selectedUser()!.name) }}
                </div>
                <div class="flex-1">
                  <p class="font-semibold text-slate-900">{{ selectedUser()!.name }}</p>
                  <p class="text-xs text-slate-600">{{ selectedUser()!.mobile }} • Age {{ selectedUser()!.age }}</p>
                </div>
                <button (click)="clearUser()" class="text-slate-400 hover:text-rose-500 p-1">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            }
            @if (errors().userId) {
              <p class="text-xs text-rose-500 mt-1.5">{{ errors().userId }}</p>
            }
          </div>

          <!-- Active Shift (read-only) -->
          <div class="mb-6">
            <label class="block text-sm font-semibold text-slate-700 mb-2">Active Shift</label>
            @if (activeShift(); as s) {
              <div class="p-4 rounded-xl border-2 border-emerald-500 bg-emerald-50">
                <div class="flex items-center justify-between mb-1">
                  <span class="font-semibold text-slate-900 text-sm">{{ s.name }}</span>
                  <span class="text-[10px] px-1.5 py-0.5 bg-emerald-500 text-white rounded font-semibold">ACTIVE</span>
                </div>
                <p class="text-xs text-slate-500">{{ s.label }}</p>
                <p class="text-[11px] text-slate-500 mt-1">{{ formatShiftDate(s.startedAt) }}</p>
              </div>
            } @else {
              <div class="p-4 rounded-xl border-2 border-slate-200 bg-slate-50 text-sm text-slate-500">
                No active shift — booking disabled
              </div>
            }
          </div>

          <!-- Manual Token (optional) -->
          <div class="mb-6">
            <label class="block text-sm font-semibold text-slate-700 mb-2">
              Manual Token #
              <span class="ml-1 text-xs font-normal text-slate-500">(optional — for advance-time bookings)</span>
            </label>
            <input
              type="number"
              min="1"
              step="1"
              [placeholder]="autoSequence() ? 'Leave blank to auto-assign #' + autoSequence() : 'No active shift'"
              [(ngModel)]="manualTokenInput"
              [disabled]="!activeShift()"
              class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed" />
            @if (manualTokenInput && manualTaken()) {
              <p class="text-xs text-rose-500 mt-1.5">
                Token #{{ manualTokenInput }} is already assigned in this shift
              </p>
            } @else {
              <p class="text-xs text-slate-500 mt-1.5">
                Use this when a patient calls in for a later time in the same shift.
                Auto-tokens will skip over reserved numbers.
              </p>
            }
          </div>

          <!-- Buttons -->
          <div class="flex gap-3 pt-4 border-t border-slate-100">
            <button (click)="submit()"
                    [disabled]="!canSubmit()"
                    class="flex-1 px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0">
              Book Appointment
            </button>
            <button (click)="back()"
                    class="px-6 py-3.5 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-colors">
              Cancel
            </button>
          </div>
        </div>

        <!-- Preview Sidebar -->
        <div class="bg-gradient-to-br from-slate-900 to-emerald-900 rounded-3xl p-6 text-white shadow-2xl h-fit sticky top-8">
          <h4 class="text-xs uppercase tracking-wider text-emerald-300 mb-4">Appointment Preview</h4>
          @if (selectedUser() && activeShift()) {
            <div class="mb-6">
              <p class="text-xs text-slate-400 mb-1">Patient</p>
              <p class="font-display text-xl font-semibold">{{ selectedUser()!.name }}</p>
            </div>
            <div class="space-y-4 mb-6">
              <div>
                <p class="text-xs text-slate-400 mb-1">Date</p>
                <p class="font-semibold">{{ formatDate(today) }}</p>
              </div>
              <div>
                <p class="text-xs text-slate-400 mb-1">Shift</p>
                <p class="font-semibold">{{ activeShift()!.name }}</p>
                <p class="text-xs text-slate-400">{{ activeShift()!.label }}</p>
              </div>
            </div>
            <div class="bg-emerald-500/20 border border-emerald-500/30 rounded-2xl p-4 text-center">
              <p class="text-xs text-emerald-300 mb-1">
                {{ manualTokenInput && manualTokenInput > 0 ? 'Manual Token' : 'Auto Token' }}
              </p>
              <p class="font-display text-5xl font-bold text-white">#{{ effectiveSequence() }}</p>
            </div>
          } @else {
            <div class="text-center py-12 text-slate-400 text-sm">
              <svg class="w-12 h-12 text-slate-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {{ !activeShift() ? 'No active shift' : 'Select a patient to see preview' }}
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class NewAppointmentComponent {
  private userService = inject(UserService);
  private appointmentService = inject(AppointmentService);
  private shiftService = inject(ShiftService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  today = new Date().toISOString().split('T')[0];

  userSearch = '';
  manualTokenInput: number | null = null;
  selectedUserId = signal<number | null>(null);
  errors = signal<{ userId?: string; sequence?: string }>({});

  activeShift = computed(() => this.shiftService.activeShift());

  filteredUsers = computed(() => {
    const q = this.userSearch.toLowerCase().trim();
    const users = this.userService.users();
    if (!q) return users;
    return users.filter(u =>
      u.name.toLowerCase().includes(q) || u.mobile.includes(this.userSearch)
    );
  });

  selectedUser = computed(() => {
    const id = this.selectedUserId();
    return id ? this.userService.getUserById(id) : null;
  });

  autoSequence = computed(() => {
    const s = this.activeShift();
    return s ? this.appointmentService.getNextSequence(s.id) : 0;
  });

  effectiveSequence = computed(() => {
    const manual = this.manualTokenInput;
    if (manual && Number.isInteger(manual) && manual > 0) return manual;
    return this.autoSequence();
  });

  manualTaken = computed(() => {
    const s = this.activeShift();
    const manual = this.manualTokenInput;
    if (!s || !manual || !Number.isInteger(manual) || manual < 1) return false;
    return !this.appointmentService.isSequenceAvailable(s.id, manual);
  });

  canSubmit = computed(() =>
    !!this.selectedUserId() && !!this.activeShift() && !this.manualTaken()
  );

  selectUser(id: number): void {
    this.selectedUserId.set(id);
    this.errors.update(e => ({ ...e, userId: undefined }));
  }

  clearUser(): void {
    this.selectedUserId.set(null);
  }

  submit(): void {
    const shift = this.activeShift();
    if (!shift) {
      this.notificationService.error('No active shift — cannot book.');
      return;
    }
    if (!this.selectedUserId()) {
      this.errors.set({ userId: 'Please select a patient' });
      return;
    }
    if (this.manualTaken()) {
      this.errors.set({ sequence: `Token #${this.manualTokenInput} is already assigned` });
      return;
    }

    try {
      const user = this.selectedUser()!;
      const manual = this.manualTokenInput && this.manualTokenInput > 0 ? this.manualTokenInput : undefined;
      const apt = this.appointmentService.createAppointment(user.id, user.name, shift, manual);
      const tokenLabel = manual ? `Manual token #${apt.sequence}` : `Token #${apt.sequence}`;
      this.notificationService.success(
        `Appointment booked! ${tokenLabel} for ${shift.name}`
      );
      this.router.navigate(['/compounder/appointments']);
    } catch (err: any) {
      this.notificationService.error(err.message);
    }
  }

  back(): void {
    this.router.navigate(['/compounder/appointments']);
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
    });
  }

  formatShiftDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
    });
  }
}
