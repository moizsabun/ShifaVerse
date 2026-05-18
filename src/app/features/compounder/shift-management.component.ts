import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ShiftService } from '../../core/services/shift.service';
import { AppointmentService } from '../../core/services/appointment.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-shift-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="animate-fade-in-up">
      <div class="mb-8">
        <h1 class="font-display text-4xl font-bold text-slate-900">Shift Management</h1>
        <p class="text-slate-500 mt-2">Open a shift, take appointments, then close it when done.</p>
      </div>

      <!-- Active Shift Card -->
      <div class="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden mb-6">
        @if (active(); as shift) {
          <div class="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 border-b border-emerald-100">
            <div class="flex items-start justify-between">
              <div>
                <div class="flex items-center gap-2 mb-2">
                  <div class="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span class="text-xs font-semibold text-emerald-700 uppercase tracking-wide">Active Shift</span>
                </div>
                <h3 class="font-display text-2xl font-semibold text-slate-900">{{ shift.name }}</h3>
                <p class="text-sm text-slate-600 mt-1">{{ shift.label }}</p>
                <div class="flex items-center gap-2 mt-3 flex-wrap">
                  <span class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/70 border border-emerald-200 rounded-lg text-[11px] font-semibold text-slate-700">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                    {{ formatDateOnly(shift.startedAt) }}
                  </span>
                  <span class="text-xs text-slate-500">Started {{ formatTimeOnly(shift.startedAt) }}</span>
                </div>
              </div>
              <div class="text-right">
                <p class="text-xs text-slate-500 mb-1">Tokens issued</p>
                <p class="font-display text-4xl font-bold text-emerald-600">{{ activeShiftCount() }}</p>
              </div>
            </div>
          </div>
          <div class="p-6 flex items-center justify-between">
            <p class="text-sm text-slate-600">
              When closed, no further appointments can be booked for this shift.
            </p>
            <button (click)="confirmClose()"
                    class="px-5 py-3 bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-xl font-semibold shadow-lg shadow-rose-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
              Close Shift
            </button>
          </div>
        } @else {
          <div class="p-10 text-center">
            <div class="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg class="w-7 h-7 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <p class="font-semibold text-slate-700">No active shift</p>
            <p class="text-sm text-slate-500 mt-1">Open a shift below to start taking appointments.</p>
          </div>
        }
      </div>

      <!-- Open New Shift -->
      @if (!active()) {
        <div class="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 mb-6">
          <h3 class="font-display text-lg font-semibold text-slate-900 mb-4">Open a New Shift</h3>
          <div class="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-2">Shift Name</label>
              <input type="text"
                     [(ngModel)]="newName"
                     placeholder="e.g. Morning Shift"
                     class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all" />
            </div>
            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-2">Time Label</label>
              <input type="text"
                     [(ngModel)]="newLabel"
                     placeholder="e.g. 9:00 AM - 2:00 PM"
                     class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all" />
            </div>
          </div>
          <div class="flex gap-2 mb-4 flex-wrap">
            @for (p of presets; track p.name) {
              <button (click)="applyPreset(p)"
                      class="text-xs px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-emerald-100 hover:text-emerald-700 transition-colors">
                {{ p.name }} ({{ p.label }})
              </button>
            }
          </div>
          @if (error()) {
            <p class="text-xs text-rose-500 mb-3">{{ error() }}</p>
          }
          <button (click)="open()"
                  [disabled]="!canOpen()"
                  class="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
            </svg>
            Open Shift
          </button>
        </div>
      }

      <!-- Closed Shift History -->
      <div class="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div class="p-6 border-b border-slate-100">
          <h3 class="font-display text-lg font-semibold text-slate-900">Past Shifts</h3>
          <p class="text-sm text-slate-500 mt-1">{{ closed().length }} closed shift{{ closed().length !== 1 ? 's' : '' }}</p>
        </div>
        @if (closed().length === 0) {
          <div class="p-10 text-center text-slate-400 text-sm">No past shifts yet</div>
        } @else {
          <div class="divide-y divide-slate-100">
            @for (s of closed(); track s.id) {
              <div class="p-5 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                <div class="w-11 h-11 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center text-slate-600 font-bold">
                  {{ countForShift(s.id) }}
                </div>
                <div class="flex-1">
                  <p class="font-semibold text-slate-900">{{ s.name }}</p>
                  <p class="text-xs text-slate-500">{{ s.label }}</p>
                  <div class="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span class="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 rounded-md text-[10px] font-semibold text-slate-600">
                      {{ formatDateOnly(s.startedAt) }}
                    </span>
                    <span class="text-[11px] text-slate-400">
                      {{ formatTimeOnly(s.startedAt) }} → {{ formatTimeOnly(s.endedAt!) }}
                    </span>
                  </div>
                </div>
                <span class="px-3 py-1 bg-slate-200 text-slate-600 rounded-full text-xs font-semibold">CLOSED</span>
              </div>
            }
          </div>
        }
      </div>

      <!-- Close confirmation modal -->
      @if (showConfirmClose()) {
        <div class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div class="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6">
            <h3 class="font-display text-xl font-semibold text-slate-900 mb-2">Close this shift?</h3>
            <p class="text-sm text-slate-600 mb-5">
              {{ pendingInActive() }} pending appointment{{ pendingInActive() !== 1 ? 's' : '' }} will remain visible but no new appointments can be booked.
            </p>
            <div class="flex gap-3 justify-end">
              <button (click)="showConfirmClose.set(false)"
                      class="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-colors">
                Cancel
              </button>
              <button (click)="closeActive()"
                      class="px-4 py-2.5 bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-xl font-semibold shadow-lg shadow-rose-500/30 hover:shadow-xl transition-all">
                Yes, close shift
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class ShiftManagementComponent {
  private shiftService = inject(ShiftService);
  private appointmentService = inject(AppointmentService);
  private notificationService = inject(NotificationService);

  presets = [
    { name: 'Morning Shift', label: '9:00 AM - 2:00 PM' },
    { name: 'Evening Shift', label: '6:00 PM - 11:00 PM' },
    { name: 'Night Shift', label: '11:00 PM - 5:00 AM' }
  ];

  newName = '';
  newLabel = '';
  error = signal<string>('');
  showConfirmClose = signal(false);

  active = computed(() => this.shiftService.activeShift());
  closed = computed(() => this.shiftService.closedShifts());

  activeShiftCount = computed(() => {
    const a = this.active();
    return a ? this.appointmentService.byShift(a.id).filter(x => x.status !== 'cancelled').length : 0;
  });

  pendingInActive = computed(() => {
    const a = this.active();
    return a ? this.appointmentService.byShift(a.id).filter(x => x.status === 'pending').length : 0;
  });

  canOpen(): boolean {
    return this.newName.trim().length > 0 && this.newLabel.trim().length > 0;
  }

  applyPreset(p: { name: string; label: string }): void {
    this.newName = p.name;
    this.newLabel = p.label;
  }

  open(): void {
    try {
      const shift = this.shiftService.openShift(this.newName, this.newLabel);
      this.notificationService.success(`${shift.name} is now open`);
      this.newName = '';
      this.newLabel = '';
      this.error.set('');
    } catch (e: any) {
      this.error.set(e.message);
    }
  }

  confirmClose(): void {
    this.showConfirmClose.set(true);
  }

  closeActive(): void {
    const a = this.active();
    if (!a) return;
    try {
      this.shiftService.closeShift(a.id);
      this.notificationService.success(`${a.name} closed`);
    } catch (e: any) {
      this.notificationService.error(e.message);
    } finally {
      this.showConfirmClose.set(false);
    }
  }

  countForShift(id: number): number {
    return this.appointmentService.byShift(id).filter(a => a.status !== 'cancelled').length;
  }

  formatDateTime(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleString('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true
    });
  }

  formatDateOnly(iso: string): string {
    return new Date(iso).toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
    });
  }

  formatTimeOnly(iso: string): string {
    return new Date(iso).toLocaleTimeString('en-US', {
      hour: '2-digit', minute: '2-digit', hour12: true
    });
  }
}
