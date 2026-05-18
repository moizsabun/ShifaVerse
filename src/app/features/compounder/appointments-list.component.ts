import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AppointmentService } from '../../core/services/appointment.service';
import { ShiftService } from '../../core/services/shift.service';
import { NotificationService } from '../../core/services/notification.service';
import { AppointmentStatus } from '../../core/models/appointment.model';

type FilterType = 'all' | AppointmentStatus;

@Component({
  selector: 'app-appointments-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="animate-fade-in-up">
      <!-- Header -->
      <div class="flex items-end justify-between mb-8">
        <div>
          <h1 class="font-display text-4xl font-bold text-slate-900">Appointments</h1>
          <p class="text-slate-500 mt-2">View, manage, and track all appointments</p>
        </div>
        <div class="flex items-center gap-3">
          <div class="flex gap-1 bg-white border border-slate-200 rounded-xl p-1">
            @for (f of filters; track f) {
              <button (click)="filter.set(f)"
                      class="px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize"
                      [class]="filter() === f 
                        ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30' 
                        : 'text-slate-600 hover:bg-slate-50'">
                {{ f }}
              </button>
            }
          </div>
          <a routerLink="/compounder/new-appointment"
             class="px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold shadow-lg shadow-emerald-500/30 hover:shadow-xl transition-all flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            New
          </a>
        </div>
      </div>

      <!-- Table -->
      <div class="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div class="grid grid-cols-12 gap-4 px-6 py-4 bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wide">
          <div class="col-span-1">Seq</div>
          <div class="col-span-3">Patient</div>
          <div class="col-span-2">Date</div>
          <div class="col-span-2">Shift</div>
          <div class="col-span-2">Status</div>
          <div class="col-span-2 text-right">Action</div>
        </div>
        <div class="divide-y divide-slate-100">
          @for (apt of filteredAppointments(); track apt.id) {
            <div class="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-slate-50 transition-colors">
              <div class="col-span-1">
                <span class="inline-flex items-center justify-center w-9 h-9 bg-gradient-to-br from-emerald-100 to-teal-100 text-emerald-700 rounded-lg font-bold text-sm">
                  {{ apt.sequence }}
                </span>
              </div>
              <div class="col-span-3">
                <p class="font-semibold text-slate-900">{{ apt.userName }}</p>
                <p class="text-xs text-slate-500">ID #{{ padId(apt.userId) }}</p>
              </div>
              <div class="col-span-2 text-sm text-slate-600">{{ formatDate(apt.date) }}</div>
              <div class="col-span-2">
                <span class="text-xs font-medium px-2 py-1 rounded-md bg-indigo-100 text-indigo-700">
                  {{ apt.shiftName }}
                </span>
              </div>
              <div class="col-span-2">
                <span class="px-3 py-1 rounded-full text-xs font-semibold"
                      [class]="getStatusClass(apt.status)">
                  {{ apt.status | titlecase }}
                </span>
              </div>
              <div class="col-span-2 text-right">
                @if (canCancel(apt.id)) {
                  <button (click)="cancel(apt.id)"
                          class="px-3 py-1.5 text-rose-600 hover:bg-rose-50 rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-1">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Cancel
                  </button>
                }
              </div>
            </div>
          }
          @if (filteredAppointments().length === 0) {
            <div class="p-16 text-center text-slate-400">
              <svg class="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              No appointments found
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class AppointmentsListComponent {
  private appointmentService = inject(AppointmentService);
  private shiftService = inject(ShiftService);
  private notificationService = inject(NotificationService);

  filters: FilterType[] = ['all', 'pending', 'completed', 'cancelled'];
  filter = signal<FilterType>('all');

  filteredAppointments = computed(() => {
    const f = this.filter();
    let result = this.appointmentService.appointments();
    if (f !== 'all') {
      result = result.filter(a => a.status === f);
    }
    return [...result].sort((a, b) => {
      const dateCompare = new Date(b.date).getTime() - new Date(a.date).getTime();
      if (dateCompare !== 0) return dateCompare;
      return a.sequence - b.sequence;
    });
  });

  canCancel(id: number): boolean {
    const apt = this.appointmentService.getById(id);
    if (!apt) return false;
    if (apt.status !== 'pending') return false;
    const shift = this.shiftService.getById(apt.shiftId);
    return !!shift && shift.endedAt === null;
  }

  cancel(id: number): void {
    try {
      this.appointmentService.cancelAppointment(id);
      this.notificationService.success('Appointment cancelled');
    } catch (err: any) {
      this.notificationService.error(err.message);
    }
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', { 
      weekday: 'short', month: 'short', day: 'numeric' 
    });
  }

  padId(id: number): string {
    return String(id).padStart(4, '0');
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
