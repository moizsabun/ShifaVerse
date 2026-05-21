import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppointmentService } from '../../core/services/appointment.service';
import { ShiftService } from '../../core/services/shift.service';
import { Shift } from '../../core/models/shift.model';
import { Appointment } from '../../core/models/appointment.model';

interface ShiftGroup {
  shift: Shift;
  appointments: Appointment[];
}

@Component({
  selector: 'app-shift-history',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="animate-fade-in-up">
      <div class="mb-8">
        <h1 class="font-display text-4xl font-bold text-slate-900">Shift History</h1>
        <p class="text-slate-500 mt-2">Per-shift breakdown of appointments</p>
      </div>

      <div class="space-y-6">
        @for (group of groups(); track group.shift.id) {
          <div class="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div class="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 class="font-display text-xl font-semibold text-slate-900">{{ group.shift.name }}</h3>
                <p class="text-sm text-slate-500 mt-1">{{ group.shift.label }}</p>
                <div class="flex items-center gap-2 mt-2 flex-wrap">
                  <span class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded-lg text-[11px] font-semibold text-slate-700">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                    {{ formatDateOnly(group.shift.startedAt) }}
                  </span>
                  <span class="text-[11px] text-slate-400">
                    {{ formatTimeOnly(group.shift.startedAt) }}
                    @if (group.shift.endedAt) {
                      → {{ formatTimeOnly(group.shift.endedAt) }}
                    }
                  </span>
                </div>
              </div>
              <div class="text-right">
                @if (group.shift.endedAt === null) {
                  <span class="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500 text-white rounded-full text-xs font-semibold">
                    <span class="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                    LIVE
                  </span>
                } @else {
                  <span class="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-semibold">CLOSED</span>
                }
                <p class="mt-2 text-2xl font-bold font-display text-slate-900">{{ group.appointments.length }}</p>
              </div>
            </div>
            <div class="p-4">
              @if (group.appointments.length === 0) {
                <p class="text-sm text-slate-400 italic px-2 py-3">No appointments</p>
              } @else {
                <div class="space-y-1">
                  @for (apt of group.appointments; track apt.id) {
                    <div class="flex items-center gap-3 p-2.5 hover:bg-slate-50 rounded-lg">
                      <span class="inline-flex items-center justify-center w-9 h-9 bg-gradient-to-br from-emerald-100 to-teal-100 text-emerald-700 rounded-lg font-bold text-sm">
                        {{ apt.sequence }}
                      </span>
                      <span class="text-sm text-slate-700 flex-1 font-medium">{{ apt.userName }}</span>
                      <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                            [class]="getStatusClass(apt.status)">
                        {{ apt.status | titlecase }}
                      </span>
                    </div>
                  }
                </div>
              }
            </div>
          </div>
        }
        @if (groups().length === 0) {
          <div class="bg-white rounded-3xl p-16 text-center">
            <p class="text-slate-500">No shifts opened yet</p>
          </div>
        }
      </div>
    </div>
  `
})
export class ShiftHistoryComponent {
  private appointmentService = inject(AppointmentService);
  private shiftService = inject(ShiftService);

  groups = computed<ShiftGroup[]>(() => {
    const shifts = [...this.shiftService.shifts()];
    return shifts
      .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
      .map(shift => ({
        shift,
        appointments: this.appointmentService.byShift(shift.id)
      }));
  });

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

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      pending: 'bg-amber-100 text-amber-700',
      completed: 'bg-emerald-100 text-emerald-700',
      cancelled: 'bg-rose-100 text-rose-700'
    };
    return map[status] || '';
  }
}
