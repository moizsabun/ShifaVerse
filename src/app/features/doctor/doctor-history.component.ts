import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AppointmentService } from '../../core/services/appointment.service';

@Component({
  selector: 'app-doctor-history',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="animate-fade-in-up">
      <div class="mb-8">
        <h1 class="font-display text-4xl font-bold text-slate-900">Past Visit History</h1>
        <p class="text-slate-500 mt-2">{{ visits().length }} completed treatment{{ visits().length !== 1 ? 's' : '' }} recorded</p>
      </div>

      <div class="space-y-4">
        @for (visit of visits(); track visit.id) {
          <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 hover:shadow-lg transition-shadow">
            <div class="flex items-start justify-between mb-4">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 bg-gradient-to-br from-emerald-100 to-teal-100 text-emerald-700 rounded-xl flex items-center justify-center font-bold">
                  {{ getInitials(visit.userName) }}
                </div>
                <div>
                  <div class="flex items-center gap-2 mb-1">
                    <h3 class="font-display text-lg font-semibold text-slate-900">{{ visit.userName }}</h3>
                    <span class="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] rounded-md font-semibold">COMPLETED</span>
                  </div>
                  <p class="text-sm text-slate-500">
                    {{ formatDate(visit.date) }} • {{ visit.shiftName }} • Sequence #{{ visit.sequence }}
                  </p>
                </div>
              </div>
              <a [routerLink]="['/doctor/patients', visit.userId]"
                 class="text-sm text-emerald-600 font-semibold hover:text-emerald-700 flex items-center gap-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                View Patient
              </a>
            </div>
            @if (visit.treatment; as t) {
              <div class="grid grid-cols-3 gap-4 bg-slate-50 rounded-2xl p-4">
                <div>
                  <p class="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Diagnosis</p>
                  <div class="flex flex-wrap gap-1">
                    @for (d of t.diagnosis; track d) {
                      <span class="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-md font-medium">{{ d }}</span>
                    }
                  </div>
                </div>
                <div>
                  <p class="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Symptoms</p>
                  <div class="flex flex-wrap gap-1">
                    @for (s of t.symptoms; track s) {
                      <span class="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-md font-medium">{{ s }}</span>
                    }
                  </div>
                </div>
                <div>
                  <p class="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Medications ({{ t.medications.length }})</p>
                  <div class="space-y-0.5">
                    @for (m of t.medications.slice(0, 3); track m.name) {
                      <p class="text-xs text-slate-700 truncate">• {{ m.name }}</p>
                    }
                    @if (t.medications.length > 3) {
                      <p class="text-xs text-slate-500">+{{ t.medications.length - 3 }} more</p>
                    }
                  </div>
                </div>
              </div>
              @if (t.tests && t.tests.length > 0) {
                <div class="mt-3">
                  <p class="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Tests Advised ({{ t.tests.length }})</p>
                  <div class="flex flex-wrap gap-1">
                    @for (tst of t.tests; track tst.category + '|' + tst.name) {
                      <span class="px-2 py-0.5 bg-cyan-50 border border-cyan-200 text-cyan-800 text-[10px] rounded-md font-medium">
                        <span class="text-[9px] font-bold text-cyan-600">{{ tst.category }}:</span> {{ tst.name }}
                      </span>
                    }
                  </div>
                </div>
              }
              @if (t.notes) {
                <div class="mt-3 text-sm text-slate-600 bg-blue-50 border border-blue-100 rounded-xl p-3">
                  <span class="font-semibold text-blue-900">Notes:</span> {{ t.notes }}
                </div>
              }
            }
          </div>
        }
        @if (visits().length === 0) {
          <div class="bg-white rounded-3xl p-16 text-center">
            <svg class="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p class="text-slate-500">No past treatments recorded yet</p>
          </div>
        }
      </div>
    </div>
  `
})
export class DoctorHistoryComponent {
  private appointmentService = inject(AppointmentService);

  visits = computed(() => 
    [...this.appointmentService.completedAppointments()]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  );

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', { 
      weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' 
    });
  }
}
