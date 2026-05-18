import { Component, inject, computed, Input } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { UserService } from '../../core/services/user.service';
import { AppointmentService } from '../../core/services/appointment.service';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="animate-fade-in-up">
      <button (click)="location.back()"
              class="text-sm text-slate-600 hover:text-emerald-600 mb-6 flex items-center gap-1 font-medium transition-colors">
        ← Back
      </button>

      @if (user(); as u) {
        <!-- Profile header -->
        <div class="bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700 rounded-3xl p-8 text-white mb-6 shadow-2xl shadow-emerald-500/30 relative overflow-hidden">
          <div class="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32 blur-3xl"></div>
          <div class="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24 blur-2xl"></div>
          <div class="relative flex items-start justify-between">
            <div class="flex items-center gap-5">
              <div class="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-3xl font-bold border border-white/30">
                {{ getInitials(u.name) }}
              </div>
              <div>
                <h1 class="font-display text-4xl font-bold mb-1">{{ u.name }}</h1>
                <p class="text-emerald-100">Patient ID #{{ padId(u.id) }}</p>
                <div class="flex items-center gap-4 mt-3 text-sm">
                  <span class="flex items-center gap-1.5">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {{ u.mobile }}
                  </span>
                  <span class="flex items-center gap-1.5">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454" />
                    </svg>
                    {{ u.age }} years
                  </span>
                  <span class="flex items-center gap-1.5">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Joined {{ formatDate(u.createdAt) }}
                  </span>
                </div>
              </div>
            </div>
            <div class="text-right">
              <div class="text-5xl font-bold font-display">{{ appointments().length }}</div>
              <div class="text-sm text-emerald-100">Total Visits</div>
            </div>
          </div>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-3 gap-4 mb-6">
          <div class="bg-white rounded-2xl p-5 border border-slate-100">
            <p class="text-sm text-slate-500 mb-1">Completed Visits</p>
            <p class="text-3xl font-bold font-display text-emerald-600">{{ completedCount() }}</p>
          </div>
          <div class="bg-white rounded-2xl p-5 border border-slate-100">
            <p class="text-sm text-slate-500 mb-1">Pending</p>
            <p class="text-3xl font-bold font-display text-amber-600">{{ pendingCount() }}</p>
          </div>
          <div class="bg-white rounded-2xl p-5 border border-slate-100">
            <p class="text-sm text-slate-500 mb-1">Cancelled</p>
            <p class="text-3xl font-bold font-display text-rose-600">{{ cancelledCount() }}</p>
          </div>
        </div>

        <!-- Visit History -->
        <div class="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div class="p-6 border-b border-slate-100">
            <h3 class="font-display text-xl font-semibold text-slate-900">Visit History</h3>
            <p class="text-sm text-slate-500 mt-1">Complete medical history and past appointments</p>
          </div>
          <div class="divide-y divide-slate-100">
            @for (apt of appointments(); track apt.id) {
              <div class="p-6">
                <div class="flex items-start justify-between mb-3">
                  <div>
                    <div class="flex items-center gap-3 mb-1">
                      <h4 class="font-semibold text-slate-900">{{ formatDate(apt.date) }}</h4>
                      <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                            [class]="getStatusClass(apt.status)">
                        {{ apt.status | titlecase }}
                      </span>
                    </div>
                    <p class="text-sm text-slate-500">{{ apt.shiftName }} • Sequence #{{ apt.sequence }}</p>
                  </div>
                </div>
                @if (apt.treatment) {
                  <div class="mt-4 grid grid-cols-3 gap-4 bg-slate-50 rounded-2xl p-4">
                    <div>
                      <p class="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Diagnosis</p>
                      <div class="flex flex-wrap gap-1">
                        @for (d of apt.treatment.diagnosis; track d) {
                          <span class="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-md font-medium">{{ d }}</span>
                        }
                      </div>
                    </div>
                    <div>
                      <p class="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Symptoms</p>
                      <div class="flex flex-wrap gap-1">
                        @for (s of apt.treatment.symptoms; track s) {
                          <span class="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-md font-medium">{{ s }}</span>
                        }
                      </div>
                    </div>
                    <div>
                      <p class="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Medications</p>
                      <div class="space-y-1">
                        @for (m of apt.treatment.medications; track m.name) {
                          <p class="text-xs text-slate-700">
                            <span class="font-semibold">{{ m.name }}</span>
                          </p>
                        }
                      </div>
                    </div>
                  </div>
                  @if (apt.treatment.notes) {
                    <div class="mt-3 text-sm text-slate-600 bg-blue-50 border border-blue-100 rounded-xl p-3">
                      <span class="font-semibold text-blue-900">Notes:</span> {{ apt.treatment.notes }}
                    </div>
                  }
                }
              </div>
            }
            @if (appointments().length === 0) {
              <div class="p-12 text-center text-slate-400">No visits recorded yet</div>
            }
          </div>
        </div>
      } @else {
        <div class="bg-white rounded-3xl p-16 text-center">
          <p class="text-slate-500">Patient not found</p>
        </div>
      }
    </div>
  `
})
export class UserDetailComponent {
  @Input() id?: string;
  
  private userService = inject(UserService);
  private appointmentService = inject(AppointmentService);
  location = inject(Location);

  user = computed(() => {
    const userId = parseInt(this.id || '0', 10);
    return this.userService.getUserById(userId);
  });

  appointments = computed(() => {
    const userId = parseInt(this.id || '0', 10);
    return this.appointmentService.getUserAppointments(userId);
  });

  completedCount = computed(() => 
    this.appointments().filter(a => a.status === 'completed').length
  );
  pendingCount = computed(() => 
    this.appointments().filter(a => a.status === 'pending').length
  );
  cancelledCount = computed(() => 
    this.appointments().filter(a => a.status === 'cancelled').length
  );

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', { 
      weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' 
    });
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
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
