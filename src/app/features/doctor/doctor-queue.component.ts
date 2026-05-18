import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AppointmentService } from '../../core/services/appointment.service';
import { UserService } from '../../core/services/user.service';

@Component({
  selector: 'app-doctor-queue',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="animate-fade-in-up">
      <div class="mb-8">
        <h1 class="font-display text-4xl font-bold text-slate-900">Today's Queue</h1>
        <p class="text-slate-500 mt-2">{{ queue().length }} patient{{ queue().length !== 1 ? 's' : '' }} waiting for examination</p>
      </div>

      @if (queue().length === 0) {
        <div class="bg-white rounded-3xl border border-slate-100 shadow-sm p-16 text-center">
          <div class="w-20 h-20 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <svg class="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <p class="font-display text-2xl font-semibold text-slate-900 mb-2">All caught up!</p>
          <p class="text-slate-500">There are no patients waiting at the moment.</p>
        </div>
      } @else {
        <div class="grid grid-cols-2 gap-5">
          @for (apt of queue(); track apt.id; let i = $index) {
            <div class="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-emerald-100/50 hover:-translate-y-1 transition-all animate-fade-in-up relative overflow-hidden"
                 [style.animation-delay]="(i * 0.05) + 's'">
              
              @if (i === 0) {
                <div class="absolute top-4 right-4 px-3 py-1 bg-emerald-500 text-white text-[10px] font-bold rounded-full uppercase tracking-wider shadow-lg shadow-emerald-500/50 animate-pulse-ring">
                  Next
                </div>
              }

              <div class="flex items-start gap-4 mb-5">
                <div class="w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-xl shadow-lg"
                     [class]="i === 0 
                       ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-emerald-500/30' 
                       : 'bg-slate-100 text-slate-700'">
                  #{{ apt.sequence }}
                </div>
                <div class="flex-1">
                  <h3 class="font-display text-xl font-semibold text-slate-900">{{ apt.userName }}</h3>
                  <div class="flex items-center gap-2 mt-1.5">
                    <span class="text-xs font-medium px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700">
                      {{ apt.shiftName }}
                    </span>
                    @if (getUserAge(apt.userId); as age) {
                      <span class="text-xs text-slate-500">Age {{ age }}</span>
                    }
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3 mb-5 text-sm">
                <div class="bg-slate-50 rounded-xl p-3">
                  <p class="text-xs text-slate-500 mb-0.5">Past Visits</p>
                  <p class="font-semibold text-slate-900">{{ getVisitCount(apt.userId) }}</p>
                </div>
                <div class="bg-slate-50 rounded-xl p-3">
                  <p class="text-xs text-slate-500 mb-0.5">Mobile</p>
                  <p class="font-semibold text-slate-900 text-xs">{{ getUserMobile(apt.userId) }}</p>
                </div>
              </div>

              <a [routerLink]="['/doctor/treatment', apt.id]"
                 class="w-full px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 transition-all flex items-center justify-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
                Start Examination
              </a>
            </div>
          }
        </div>
      }
    </div>
  `
})
export class DoctorQueueComponent {
  private appointmentService = inject(AppointmentService);
  private userService = inject(UserService);

  queue = computed(() =>
    this.appointmentService.todayAppointments()
      .filter(a => a.status === 'pending')
      .sort((a, b) => {
        if (a.shiftId !== b.shiftId) return a.shiftId - b.shiftId;
        return a.sequence - b.sequence;
      })
  );

  getUserAge(userId: number): number | undefined {
    return this.userService.getUserById(userId)?.age;
  }

  getUserMobile(userId: number): string {
    return this.userService.getUserById(userId)?.mobile || '-';
  }

  getVisitCount(userId: number): number {
    return this.appointmentService.getUserHistory(userId).length;
  }
}
