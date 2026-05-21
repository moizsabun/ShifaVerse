import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UserService } from '../../core/services/user.service';
import { AppointmentService } from '../../core/services/appointment.service';
import { ShiftService } from '../../core/services/shift.service';

@Component({
  selector: 'app-compounder-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="animate-fade-in-up space-y-8">
      <div class="flex items-end justify-between">
        <div>
          <p class="text-sm text-emerald-600 font-semibold mb-1">{{ formatDate(today) }}</p>
          <h1 class="font-display text-4xl font-bold text-slate-900">Good day, Compounder</h1>
          <p class="text-slate-500 mt-2">Here's what's happening at the clinic today.</p>
        </div>
        <div class="flex gap-3">
          <a routerLink="/compounder/shifts"
             class="px-5 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-semibold hover:border-emerald-400 hover:text-emerald-700 transition-all flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            Manage Shifts
          </a>
          <a routerLink="/compounder/new-appointment"
             [class.pointer-events-none]="!active()"
             [class.opacity-50]="!active()"
             class="px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            New Appointment
          </a>
        </div>
      </div>

      <div class="grid grid-cols-4 gap-5">
        <div class="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <span class="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded-full">Total</span>
          <p class="text-3xl font-bold text-slate-900 font-display mt-4">{{ totalPatients() }}</p>
          <p class="text-sm text-slate-500 mt-1">Total Patients</p>
        </div>
        <div class="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <span class="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded-full">Today</span>
          <p class="text-3xl font-bold text-slate-900 font-display mt-4">{{ todayCount() }}</p>
          <p class="text-sm text-slate-500 mt-1">Today's Appointments</p>
        </div>
        <div class="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <span class="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded-full">Active</span>
          <p class="text-3xl font-bold text-slate-900 font-display mt-4">{{ pendingCount() }}</p>
          <p class="text-sm text-slate-500 mt-1">Pending</p>
        </div>
        <div class="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <span class="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded-full">Done</span>
          <p class="text-3xl font-bold text-slate-900 font-display mt-4">{{ completedCount() }}</p>
          <p class="text-sm text-slate-500 mt-1">Completed</p>
        </div>
      </div>

      <!-- Active Shift -->
      <div class="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        @if (active(); as shift) {
          <div class="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 border-b border-emerald-100 flex items-center justify-between">
            <div>
              <div class="flex items-center gap-2 mb-1">
                <div class="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span class="text-xs font-semibold text-emerald-700 uppercase tracking-wide">Active Shift</span>
              </div>
              <h3 class="font-display text-2xl font-semibold text-slate-900">{{ shift.name }}</h3>
              <p class="text-sm text-slate-600 mt-1">{{ shift.label }}</p>
              <p class="text-xs text-slate-500 mt-2">{{ formatShiftDate(shift.startedAt) }}</p>
            </div>
            <div class="text-right">
              <p class="text-xs text-slate-500 mb-1">Appointments</p>
              <p class="font-display text-4xl font-bold text-emerald-600">{{ activeShiftAppointments().length }}</p>
            </div>
          </div>
          <div class="p-4 max-h-96 overflow-y-auto scrollbar-thin">
            @if (activeShiftAppointments().length === 0) {
              <p class="text-center text-sm text-slate-400 py-8">No appointments yet in this shift</p>
            } @else {
              <div class="space-y-2">
                @for (apt of activeShiftAppointments(); track apt.id) {
                  <div class="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl transition-colors">
                    <div class="w-9 h-9 bg-gradient-to-br from-emerald-100 to-teal-100 text-emerald-700 rounded-lg flex items-center justify-center font-bold text-sm">
                      {{ apt.sequence }}
                    </div>
                    <div class="flex-1">
                      <p class="text-sm font-semibold text-slate-900">{{ apt.userName }}</p>
                    </div>
                    <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                          [class]="getStatusClass(apt.status)">
                      {{ apt.status | titlecase }}
                    </span>
                  </div>
                }
              </div>
            }
          </div>
        } @else {
          <div class="p-12 text-center">
            <div class="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg class="w-7 h-7 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <p class="font-semibold text-slate-700">No shift is currently open</p>
            <p class="text-sm text-slate-500 mt-1 mb-4">Open a shift to start taking appointments.</p>
            <a routerLink="/compounder/shifts"
               class="inline-block px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold shadow-md shadow-emerald-500/30 hover:shadow-lg transition-all">
              Open Shift
            </a>
          </div>
        }
      </div>

      <!-- Recent Activity -->
      <div class="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div class="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 class="font-display text-xl font-semibold text-slate-900">Recent Activity</h3>
            <p class="text-sm text-slate-500 mt-1">Latest appointments and updates</p>
          </div>
          <a routerLink="/compounder/appointments" class="text-sm text-emerald-600 font-semibold hover:text-emerald-700">
            View all →
          </a>
        </div>
        <div class="divide-y divide-slate-100">
          @for (apt of recentAppointments(); track apt.id) {
            <div class="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <div class="flex items-center gap-4">
                <div class="w-11 h-11 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl flex items-center justify-center text-emerald-700 font-semibold">
                  {{ getInitials(apt.userName) }}
                </div>
                <div>
                  <p class="font-semibold text-slate-900">{{ apt.userName }}</p>
                  <p class="text-sm text-slate-500">{{ formatDate(apt.date) }} • {{ apt.shiftName }} • Seq #{{ apt.sequence }}</p>
                </div>
              </div>
              <span class="px-3 py-1 rounded-full text-xs font-semibold"
                    [class]="getStatusClass(apt.status)">
                {{ apt.status | titlecase }}
              </span>
            </div>
          }
          @if (recentAppointments().length === 0) {
            <div class="p-12 text-center text-slate-400">No appointments yet</div>
          }
        </div>
      </div>
    </div>
  `
})
export class CompounderDashboardComponent {
  private userService = inject(UserService);
  private appointmentService = inject(AppointmentService);
  private shiftService = inject(ShiftService);

  today = new Date().toISOString().split('T')[0];

  active = computed(() => this.shiftService.activeShift());
  activeShiftAppointments = computed(() => this.appointmentService.activeShiftAppointments());

  totalPatients = computed(() => this.userService.users().length);
  todayCount = computed(() => this.appointmentService.todayAppointments().length);
  pendingCount = computed(() => this.appointmentService.pendingAppointments().length);
  completedCount = computed(() => this.appointmentService.completedAppointments().length);

  recentAppointments = computed(() =>
    [...this.appointmentService.appointments()]
      .sort((a, b) => b.id - a.id)
      .slice(0, 5)
  );

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
    });
  }

  formatShiftDate(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true
    });
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
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
