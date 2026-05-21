import { Component, inject, computed, signal, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClinicService } from '../../core/services/clinic.service';
import { ShiftService } from '../../core/services/shift.service';
import { AppointmentService } from '../../core/services/appointment.service';

@Component({
  selector: 'app-public-queue',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (clinic(); as c) {
      <div class="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-950 to-teal-900 text-white p-8 relative overflow-hidden">
        <div class="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full -translate-y-48 translate-x-48 blur-3xl"></div>
        <div class="absolute bottom-0 left-0 w-96 h-96 bg-teal-500/10 rounded-full translate-y-48 -translate-x-48 blur-3xl"></div>

        <div class="relative max-w-6xl mx-auto">
          <!-- Header -->
          <div class="flex items-center justify-between mb-10">
            <div>
              <p class="text-xs text-emerald-300 uppercase tracking-[0.3em] mb-2">Live Queue</p>
              <h1 class="font-display text-5xl font-bold">{{ c.name }}</h1>
              <p class="text-emerald-100/80 text-sm mt-2">{{ c.address }} · {{ c.phone }}</p>
            </div>
            <div class="text-right">
              <p class="text-xs text-emerald-300 uppercase tracking-wider mb-1">Now</p>
              <p class="font-display text-4xl font-bold tabular-nums">{{ nowTime() }}</p>
              <p class="text-xs text-emerald-200 mt-1">{{ nowDate() }}</p>
            </div>
          </div>

          @if (activeShift(); as shift) {
            <!-- Shift Banner -->
            <div class="bg-emerald-500/15 border border-emerald-400/30 rounded-2xl p-5 mb-8 backdrop-blur-sm flex items-center justify-between">
              <div>
                <p class="text-xs text-emerald-300 uppercase tracking-wider mb-1">Active Shift</p>
                <p class="font-display text-xl font-semibold">{{ shift.name }} · {{ shift.label }}</p>
              </div>
              <div class="text-right">
                <p class="text-xs text-emerald-300 uppercase tracking-wider mb-1">Avg Service Time</p>
                <p class="font-display text-2xl font-bold tabular-nums">{{ avgServiceLabel() }}</p>
              </div>
            </div>

            <!-- Now Serving + Next Up -->
            <div class="grid grid-cols-2 gap-6 mb-8">
              <!-- Now Serving -->
              <div class="bg-gradient-to-br from-emerald-500/30 to-teal-500/20 border border-emerald-300/40 rounded-3xl p-8 backdrop-blur-sm">
                <p class="text-xs text-emerald-300 uppercase tracking-[0.2em] mb-3">Now Serving</p>
                @if (current(); as cur) {
                  <p class="font-display text-9xl font-bold text-white leading-none">#{{ cur.sequence }}</p>
                  <p class="text-xl text-emerald-100 mt-4 font-semibold">{{ cur.userName }}</p>
                } @else {
                  <p class="font-display text-7xl font-bold text-emerald-300/50 leading-none">—</p>
                  <p class="text-emerald-200/60 mt-4">No patient in queue</p>
                }
              </div>

              <!-- Next Up -->
              <div class="bg-white/10 border border-white/20 rounded-3xl p-8 backdrop-blur-sm">
                <p class="text-xs text-emerald-300 uppercase tracking-[0.2em] mb-3">Up Next</p>
                @if (next(); as nx) {
                  <p class="font-display text-7xl font-bold text-white leading-none">#{{ nx.sequence }}</p>
                  <p class="text-lg text-emerald-100 mt-4 font-semibold">{{ nx.userName }}</p>
                  <p class="text-xs text-emerald-200/70 mt-2">Estimated wait: ~{{ estimatedWait(1) }}</p>
                } @else {
                  <p class="font-display text-5xl font-bold text-white/30 leading-none">—</p>
                  <p class="text-emerald-200/60 mt-4">No one waiting</p>
                }
              </div>
            </div>

            <!-- Queue Tail -->
            <div class="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-sm">
              <p class="text-xs text-emerald-300 uppercase tracking-wider mb-4">In Queue ({{ pending().length }} waiting)</p>
              @if (pending().length === 0) {
                <p class="text-emerald-200/60 text-center py-8">Queue is empty</p>
              } @else {
                <div class="grid grid-cols-4 gap-3">
                  @for (apt of pending().slice(0, 12); track apt.id; let i = $index) {
                    <div class="bg-white/10 border border-white/15 rounded-xl p-4 backdrop-blur-sm"
                         [class.opacity-100]="i < 3" [class.opacity-70]="i >= 3 && i < 6" [class.opacity-50]="i >= 6">
                      <p class="text-[10px] text-emerald-300 uppercase tracking-wider mb-1">Position {{ i + 2 }}</p>
                      <p class="font-display text-3xl font-bold">#{{ apt.sequence }}</p>
                      <p class="text-xs text-emerald-100 mt-1 truncate">{{ apt.userName }}</p>
                      <p class="text-[10px] text-emerald-200/70 mt-1">~{{ estimatedWait(i + 1) }}</p>
                    </div>
                  }
                </div>
                @if (pending().length > 12) {
                  <p class="text-xs text-emerald-200/60 text-center mt-4">… and {{ pending().length - 12 }} more in queue</p>
                }
              }
            </div>
          } @else {
            <div class="bg-white/5 border border-white/10 rounded-3xl p-16 text-center backdrop-blur-sm">
              <div class="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg class="w-10 h-10 text-emerald-300/70" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <p class="font-display text-2xl font-semibold">No shift is currently running</p>
              <p class="text-emerald-200/70 mt-2">Please check back during clinic hours.</p>
            </div>
          }

          <p class="text-center text-xs text-emerald-300/40 mt-10">Auto-refreshing every 5 seconds · powered by MediCare+</p>
        </div>
      </div>
    } @else {
      <div class="min-h-screen flex items-center justify-center bg-slate-900 text-white p-8">
        <div class="text-center">
          <p class="font-display text-3xl font-semibold mb-2">Clinic not found</p>
          <p class="text-slate-400">The clinic with slug "{{ slug }}" does not exist.</p>
        </div>
      </div>
    }
  `
})
export class PublicQueueComponent implements OnInit, OnDestroy {
  @Input() slug?: string;

  private clinicService = inject(ClinicService);
  private shiftService = inject(ShiftService);
  private appointmentService = inject(AppointmentService);

  tick = signal(0);
  private intervalId?: number;

  ngOnInit(): void {
    this.intervalId = window.setInterval(() => this.tick.update(n => n + 1), 5000);
  }

  ngOnDestroy(): void {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  clinic = computed(() => this.slug ? this.clinicService.getBySlug(this.slug) ?? null : null);

  activeShift = computed(() => {
    const c = this.clinic();
    return c ? this.shiftService.activeShiftForClinic(c.id) : null;
  });

  shiftAppointments = computed(() => {
    const shift = this.activeShift();
    if (!shift) return [];
    return this.appointmentService.allAppointments()
      .filter(a => a.shiftId === shift.id && a.status !== 'cancelled')
      .sort((a, b) => a.sequence - b.sequence);
  });

  pending = computed(() =>
    this.shiftAppointments().filter(a => a.status === 'pending')
  );

  /** Lowest-sequence pending = currently being seen. */
  current = computed(() => this.pending()[0] ?? null);
  /** Next pending after current. */
  next = computed(() => this.pending()[1] ?? null);

  avgServiceMs = computed(() => {
    const shift = this.activeShift();
    if (!shift) return null;
    // Re-evaluate when tick changes so the dashboard refreshes.
    this.tick();
    return this.appointmentService.averageServiceMsForShift(shift.id);
  });

  avgServiceLabel(): string {
    const ms = this.avgServiceMs();
    if (ms === null) return 'No data yet';
    return this.formatMs(ms);
  }

  /** Estimated wait for someone at offset `n` ahead in queue (0 = currently being seen). */
  estimatedWait(positionAheadOfYou: number): string {
    const ms = this.avgServiceMs();
    if (ms === null) return '—';
    return this.formatMs(positionAheadOfYou * ms);
  }

  nowTime(): string {
    this.tick();
    return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  }

  nowDate(): string {
    return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  }

  private formatMs(ms: number): string {
    const minutes = Math.round(ms / 60000);
    if (minutes < 1) return '< 1 min';
    if (minutes < 60) return `${minutes} min`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m === 0 ? `${h}h` : `${h}h ${m}m`;
  }
}
