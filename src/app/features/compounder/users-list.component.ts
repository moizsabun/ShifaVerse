import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { UserService } from '../../core/services/user.service';
import { AppointmentService } from '../../core/services/appointment.service';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="animate-fade-in-up">
      <!-- Header -->
      <div class="flex items-end justify-between mb-8">
        <div>
          <h1 class="font-display text-4xl font-bold text-slate-900">Patients</h1>
          <p class="text-slate-500 mt-2">{{ filteredUsers().length }} registered patient{{ filteredUsers().length !== 1 ? 's' : '' }}</p>
        </div>
        <div class="flex gap-3">
          <div class="relative">
            <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by name or mobile..."
              [(ngModel)]="search"
              class="pl-11 pr-4 py-3 w-80 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all text-sm" />
          </div>
          @if (!isDoctorPortal) {
            <a routerLink="/compounder/new-user"
               class="px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold shadow-lg shadow-emerald-500/30 hover:shadow-xl transition-all flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              New Patient
            </a>
          }
        </div>
      </div>

      <!-- Grid -->
      <div class="grid grid-cols-3 gap-5">
        @for (user of filteredUsers(); track user.id; let i = $index) {
          <a [routerLink]="getUserLink(user.id)"
             class="bg-white rounded-2xl p-6 border border-slate-100 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-100/50 hover:-translate-y-1 transition-all text-left group animate-fade-in-up cursor-pointer block"
             [style.animation-delay]="(i * 0.05) + 's'">
            <div class="flex items-start gap-4 mb-4">
              <div class="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-emerald-500/30">
                {{ getInitials(user.name) }}
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="font-semibold text-slate-900 truncate">{{ user.name }}</h3>
                <p class="text-sm text-slate-500">ID #{{ padId(user.id) }}</p>
              </div>
            </div>
            <div class="space-y-2 mb-4">
              <div class="flex items-center gap-2 text-sm text-slate-600">
                <svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {{ user.mobile }}
              </div>
              <div class="flex items-center gap-2 text-sm text-slate-600">
                <svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454" />
                </svg>
                {{ user.age }} years old
              </div>
            </div>
            <div class="flex items-center justify-between pt-4 border-t border-slate-100">
              <span class="text-xs text-slate-500">{{ getVisitCount(user.id) }} visit{{ getVisitCount(user.id) !== 1 ? 's' : '' }}</span>
              <span class="text-xs font-semibold text-emerald-600 group-hover:gap-2 flex items-center gap-1 transition-all">
                View History 
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </a>
        }
      </div>

      @if (filteredUsers().length === 0) {
        <div class="bg-white rounded-3xl border border-slate-100 shadow-sm p-16 text-center">
          <svg class="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p class="text-slate-500">No patients found</p>
        </div>
      }
    </div>
  `
})
export class UsersListComponent {
  private userService = inject(UserService);
  private appointmentService = inject(AppointmentService);
  private route = inject(ActivatedRoute);

  search = '';
  searchSignal = signal('');

  // Detect if we're in doctor portal
  get isDoctorPortal(): boolean {
    return this.route.snapshot.pathFromRoot
      .map(r => r.routeConfig?.path)
      .includes('doctor');
  }

  filteredUsers = computed(() => {
    const q = this.search.toLowerCase().trim();
    if (!q) return this.userService.users();
    return this.userService.users().filter(u => 
      u.name.toLowerCase().includes(q) || u.mobile.includes(this.search)
    );
  });

  getUserLink(id: number): string {
    return this.isDoctorPortal ? `/doctor/patients/${id}` : `/compounder/users/${id}`;
  }

  getVisitCount(userId: number): number {
    return this.appointmentService.getUserAppointments(userId).length;
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  }

  padId(id: number): string {
    return String(id).padStart(4, '0');
  }
}
