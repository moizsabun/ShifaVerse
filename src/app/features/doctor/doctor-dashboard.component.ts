import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AppointmentService } from '../../core/services/appointment.service';
import { UserService } from '../../core/services/user.service';

@Component({
  selector: 'app-doctor-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="animate-fade-in-up space-y-8">
      <!-- Header -->
      <div>
        <p class="text-sm text-emerald-600 font-semibold mb-1">{{ formatDate(today) }}</p>
        <h1 class="font-display text-4xl font-bold text-slate-900">Welcome back, Doctor</h1>
        <p class="text-slate-500 mt-2">
          You have <span class="font-semibold text-emerald-600">{{ queue().length }}</span> 
          patient{{ queue().length !== 1 ? 's' : '' }} waiting in the queue.
        </p>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-4 gap-5">
        <div class="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <div class="flex items-start justify-between mb-4">
            <div class="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span class="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded-full">Now</span>
          </div>
          <p class="text-3xl font-bold text-slate-900 font-display">{{ queue().length }}</p>
          <p class="text-sm text-slate-500 mt-1">Today's Queue</p>
        </div>

        <div class="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <div class="flex items-start justify-between mb-4">
            <div class="w-11 h-11 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-teal-500/30">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span class="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded-full">Today</span>
          </div>
          <p class="text-3xl font-bold text-slate-900 font-display">{{ completedToday() }}</p>
          <p class="text-sm text-slate-500 mt-1">Seen Today</p>
        </div>

        <div class="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <div class="flex items-start justify-between mb-4">
            <div class="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <span class="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded-full">All</span>
          </div>
          <p class="text-3xl font-bold text-slate-900 font-display">{{ totalCompleted() }}</p>
          <p class="text-sm text-slate-500 mt-1">Total Examined</p>
        </div>

        <div class="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <div class="flex items-start justify-between mb-4">
            <div class="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <span class="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded-full">Stats</span>
          </div>
          <p class="text-3xl font-bold text-slate-900 font-display">{{ totalPatients() }}</p>
          <p class="text-sm text-slate-500 mt-1">Total Patients</p>
        </div>
      </div>

      <!-- Next Patient Hero -->
      @if (queue().length > 0) {
        <div class="bg-gradient-to-br from-slate-900 via-emerald-900 to-teal-900 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
          <div class="absolute top-0 right-0 w-96 h-96 bg-emerald-500/20 rounded-full -translate-y-48 translate-x-48 blur-3xl"></div>
          <div class="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/10 rounded-full translate-y-32 -translate-x-32 blur-3xl"></div>
          <div class="relative">
            <p class="text-emerald-300 text-sm font-semibold mb-3 uppercase tracking-wider">Next Patient</p>
            <div class="flex items-center gap-5 mb-6">
              <div class="w-24 h-24 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center text-4xl font-bold border border-white/20 font-display">
                #{{ queue()[0].sequence }}
              </div>
              <div>
                <h2 class="font-display text-4xl font-bold mb-1">{{ queue()[0].userName }}</h2>
                <p class="text-emerald-200">{{ queue()[0].shiftName }} • Sequence #{{ queue()[0].sequence }}</p>
                @if (getUserAge(queue()[0].userId); as age) {
                  <p class="text-xs text-slate-300 mt-1">Age {{ age }} years</p>
                }
              </div>
            </div>
            <a [routerLink]="['/doctor/treatment', queue()[0].id]"
               class="inline-flex px-6 py-3 bg-white text-emerald-900 rounded-xl font-bold shadow-2xl hover:bg-emerald-50 hover:-translate-y-0.5 transition-all items-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
              Start Examination
            </a>
          </div>
        </div>
      }

      <!-- Queue Preview -->
      <div class="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div class="p-6 border-b border-slate-100">
          <h3 class="font-display text-xl font-semibold text-slate-900">Today's Queue</h3>
          <p class="text-sm text-slate-500 mt-1">Patients waiting in order</p>
        </div>
        <div class="divide-y divide-slate-100">
          @for (apt of queue().slice(0, 6); track apt.id; let i = $index) {
            <div class="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <div class="flex items-center gap-4">
                <div class="w-11 h-11 rounded-xl flex items-center justify-center font-bold"
                     [class]="i === 0 ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-700'">
                  {{ apt.sequence }}
                </div>
                <div>
                  <p class="font-semibold text-slate-900">{{ apt.userName }}</p>
                  <p class="text-sm text-slate-500">{{ apt.shiftName }}</p>
                </div>
              </div>
              <a [routerLink]="['/doctor/treatment', apt.id]"
                 class="px-4 py-2 text-emerald-600 hover:bg-emerald-50 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1">
                Examine 
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          }
          @if (queue().length === 0) {
            <div class="p-12 text-center text-slate-400">
              <svg class="w-12 h-12 text-emerald-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              All caught up! No patients in queue.
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class DoctorDashboardComponent {
  private appointmentService = inject(AppointmentService);
  private userService = inject(UserService);

  today = new Date().toISOString().split('T')[0];

  queue = computed(() =>
    this.appointmentService.todayAppointments()
      .filter(a => a.status === 'pending')
      .sort((a, b) => {
        if (a.shiftId !== b.shiftId) return a.shiftId - b.shiftId;
        return a.sequence - b.sequence;
      })
  );

  completedToday = computed(() => 
    this.appointmentService.todayAppointments().filter(a => a.status === 'completed').length
  );

  totalCompleted = computed(() => 
    this.appointmentService.completedAppointments().length
  );

  totalPatients = computed(() => this.userService.users().length);

  getUserAge(userId: number): number | undefined {
    return this.userService.getUserById(userId)?.age;
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', { 
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
    });
  }
}
