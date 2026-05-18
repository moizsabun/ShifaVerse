import { Component, inject, computed, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AppointmentService } from '../../core/services/appointment.service';
import { UserService } from '../../core/services/user.service';

@Component({
  selector: 'app-prescription',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="animate-fade-in-up">
      <!-- Toolbar (hidden in print) -->
      <div class="no-print mb-6 flex items-center justify-between">
        <button (click)="back()" class="text-sm text-slate-600 hover:text-emerald-600 flex items-center gap-1 font-medium transition-colors">
          ← Back to Queue
        </button>
        <a routerLink="/doctor/queue"
           class="px-5 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-colors">
          Done
        </a>
      </div>

      @if (appointment(); as apt) {
        @if (apt.treatment; as treatment) {
          <div class="grid grid-cols-2 gap-6 max-w-5xl mx-auto">

            <!-- Patient Copy -->
            <div>
              <div class="no-print flex items-center justify-between mb-3">
                <div>
                  <h3 class="font-display text-lg font-semibold text-slate-900">Patient Copy</h3>
                  <p class="text-xs text-slate-500">Prescription + remarks only</p>
                </div>
                <button (click)="printPatient()"
                        class="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg font-semibold shadow-md shadow-emerald-500/30 hover:shadow-lg transition-all text-sm flex items-center gap-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Print
                </button>
              </div>

              <div class="print-area print-patient bg-white shadow-2xl rounded-2xl overflow-hidden border border-slate-200">
                <div class="p-6 font-mono text-xs leading-relaxed text-slate-900">
                  <!-- Header -->
                  <div class="text-center pb-4 border-b-2 border-dashed border-slate-300">
                    <div class="text-2xl mb-1">★ MediCare<span class="font-bold">+</span> ★</div>
                    <div class="text-[10px] uppercase tracking-widest text-slate-600">Intelligent Clinic</div>
                    <div class="text-[10px] text-slate-500 mt-1">123 Healthcare Avenue</div>
                    <div class="text-[10px] text-slate-500">Tel: +92-21-1234-5678</div>
                  </div>

                  <!-- Rx Number -->
                  <div class="text-center py-3 border-b border-dashed border-slate-300">
                    <div class="text-[10px] text-slate-500">PRESCRIPTION</div>
                    <div class="text-base font-bold tracking-wider">RX-{{ formatRxNumber(apt.id) }}</div>
                  </div>

                  <!-- Date/Time -->
                  <div class="flex justify-between py-3 border-b border-dashed border-slate-300 text-[11px]">
                    <div>
                      <div class="text-slate-500">DATE</div>
                      <div class="font-semibold">{{ formatDate(apt.date) }}</div>
                    </div>
                    <div class="text-right">
                      <div class="text-slate-500">TIME</div>
                      <div class="font-semibold">{{ formatTime() }}</div>
                    </div>
                  </div>

                  <!-- Patient -->
                  <div class="py-3 border-b border-dashed border-slate-300">
                    <div class="text-[10px] text-slate-500 mb-1">PATIENT</div>
                    <div class="font-bold text-sm">{{ apt.userName }}</div>
                    @if (patient(); as p) {
                      <div class="text-[10px] text-slate-600 mt-1">Age {{ p.age }} • {{ p.mobile }}</div>
                    }
                  </div>

                  <!-- Medications (Rx) -->
                  <div class="py-3 border-b border-dashed border-slate-300">
                    <div class="text-[10px] text-slate-500 mb-2">℞  MEDICATIONS</div>
                    <div class="space-y-3">
                      @for (m of treatment.medications; track m.name + m.dosage; let i = $index) {
                        <div>
                          <div class="font-bold text-[12px]">{{ i + 1 }}. {{ m.name }}</div>
                          <div class="text-[10px] text-slate-600 pl-3">→ {{ m.dosage }}</div>
                        </div>
                      }
                    </div>
                  </div>

                  <!-- Tests Advised -->
                  @if (treatment.tests && treatment.tests.length > 0) {
                    <div class="py-3 border-b border-dashed border-slate-300">
                      <div class="text-[10px] text-slate-500 mb-2">TESTS ADVISED</div>
                      @for (t of treatment.tests; track t.category + '|' + t.name; let i = $index) {
                        <div class="text-[11px] mb-1">
                          <span class="font-bold">{{ i + 1 }}. {{ t.name }}</span>
                          <span class="text-slate-500"> · {{ t.category }}</span>
                        </div>
                      }
                    </div>
                  }

                  <!-- Remarks -->
                  @if (treatment.remarks) {
                    <div class="py-3 border-b border-dashed border-slate-300">
                      <div class="text-[10px] text-slate-500 mb-1">REMARKS</div>
                      <div class="text-[11px]">{{ treatment.remarks }}</div>
                    </div>
                  }

                  <!-- Doctor -->
                  <div class="pt-4 text-center">
                    <div class="text-[10px] text-slate-500 mb-1">Prescribed by</div>
                    <div class="font-bold">Dr. Sarah Mitchell</div>
                    <div class="text-[10px] text-slate-600">General Physician</div>
                    <div class="text-[10px] text-slate-500 mt-1">License: MED-2024-8847</div>
                  </div>

                  <div class="pt-4 mt-3 border-t-2 border-dashed border-slate-300 text-center">
                    <div class="text-[11px] font-semibold">★ Get Well Soon ★</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Internal Copy -->
            <div>
              <div class="no-print flex items-center justify-between mb-3">
                <div>
                  <h3 class="font-display text-lg font-semibold text-slate-900">Internal Copy</h3>
                  <p class="text-xs text-slate-500">Full record — symptoms, diagnosis, notes</p>
                </div>
                <button (click)="printInternal()"
                        class="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg font-semibold shadow-md shadow-indigo-500/30 hover:shadow-lg transition-all text-sm flex items-center gap-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Print
                </button>
              </div>

              <div class="print-area print-internal bg-white shadow-2xl rounded-2xl overflow-hidden border border-slate-200">
                <div class="p-6 font-mono text-xs leading-relaxed text-slate-900">
                  <div class="text-center pb-4 border-b-2 border-dashed border-slate-300">
                    <div class="text-2xl mb-1">★ MediCare<span class="font-bold">+</span> ★</div>
                    <div class="text-[10px] uppercase tracking-widest text-slate-600">Internal Record</div>
                    <div class="text-[10px] text-slate-500 mt-1">123 Healthcare Avenue</div>
                  </div>

                  <div class="text-center py-3 border-b border-dashed border-slate-300">
                    <div class="text-[10px] text-slate-500">PRESCRIPTION</div>
                    <div class="text-base font-bold tracking-wider">RX-{{ formatRxNumber(apt.id) }}</div>
                  </div>

                  <div class="flex justify-between py-3 border-b border-dashed border-slate-300 text-[11px]">
                    <div>
                      <div class="text-slate-500">DATE</div>
                      <div class="font-semibold">{{ formatDate(apt.date) }}</div>
                    </div>
                    <div class="text-right">
                      <div class="text-slate-500">TIME</div>
                      <div class="font-semibold">{{ formatTime() }}</div>
                    </div>
                  </div>

                  <div class="flex justify-between py-3 border-b border-dashed border-slate-300 text-[11px]">
                    <div>
                      <div class="text-slate-500">SHIFT</div>
                      <div class="font-semibold">{{ apt.shiftName }}</div>
                    </div>
                    <div class="text-right">
                      <div class="text-slate-500">SEQUENCE</div>
                      <div class="font-bold text-base">#{{ apt.sequence }}</div>
                    </div>
                  </div>

                  <div class="py-3 border-b border-dashed border-slate-300">
                    <div class="text-[10px] text-slate-500 mb-1">PATIENT</div>
                    <div class="font-bold text-sm">{{ apt.userName }}</div>
                    @if (patient(); as p) {
                      <div class="text-[10px] text-slate-600 mt-1">
                        ID #{{ padId(p.id) }} • Age {{ p.age }} • {{ p.mobile }}
                      </div>
                    }
                  </div>

                  <div class="py-3 border-b border-dashed border-slate-300">
                    <div class="text-[10px] text-slate-500 mb-2">SYMPTOMS</div>
                    @for (s of treatment.symptoms; track s) {
                      <div class="text-[11px]">• {{ s }}</div>
                    }
                  </div>

                  <div class="py-3 border-b border-dashed border-slate-300">
                    <div class="text-[10px] text-slate-500 mb-2">DIAGNOSIS</div>
                    @for (d of treatment.diagnosis; track d) {
                      <div class="text-[11px] font-semibold">▸ {{ d }}</div>
                    }
                  </div>

                  <div class="py-3 border-b border-dashed border-slate-300">
                    <div class="text-[10px] text-slate-500 mb-2">℞  MEDICATIONS</div>
                    <div class="space-y-3">
                      @for (m of treatment.medications; track m.name + m.dosage; let i = $index) {
                        <div>
                          <div class="font-bold text-[12px]">{{ i + 1 }}. {{ m.name }}</div>
                          <div class="text-[10px] text-slate-600 pl-3">→ {{ m.dosage }}</div>
                        </div>
                      }
                    </div>
                  </div>

                  @if (treatment.tests && treatment.tests.length > 0) {
                    <div class="py-3 border-b border-dashed border-slate-300">
                      <div class="text-[10px] text-slate-500 mb-2">TESTS ADVISED</div>
                      @for (t of treatment.tests; track t.category + '|' + t.name; let i = $index) {
                        <div class="text-[11px] mb-1">
                          <span class="font-bold">{{ i + 1 }}. {{ t.name }}</span>
                          <span class="text-slate-500"> · {{ t.category }}</span>
                        </div>
                      }
                    </div>
                  }

                  @if (treatment.remarks) {
                    <div class="py-3 border-b border-dashed border-slate-300">
                      <div class="text-[10px] text-slate-500 mb-1">PATIENT REMARKS</div>
                      <div class="text-[11px] italic">{{ treatment.remarks }}</div>
                    </div>
                  }

                  @if (treatment.notes) {
                    <div class="py-3 border-b border-dashed border-slate-300">
                      <div class="text-[10px] text-slate-500 mb-1">INTERNAL NOTES</div>
                      <div class="text-[11px] italic">{{ treatment.notes }}</div>
                    </div>
                  }

                  <div class="pt-4 text-center">
                    <div class="text-[10px] text-slate-500 mb-1">Prescribed by</div>
                    <div class="font-bold">Dr. Sarah Mitchell</div>
                    <div class="text-[10px] text-slate-600">General Physician</div>
                    <div class="text-[10px] text-slate-500 mt-1">License: MED-2024-8847</div>
                  </div>

                  <div class="pt-4 mt-3 border-t-2 border-dashed border-slate-300 text-center">
                    <div class="text-[9px] text-slate-400">Computer-generated internal copy</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <p class="no-print text-center text-xs text-slate-500 mt-6">
            💡 Each copy has its own print button — patient gets the left copy, internal record stays with the clinic
          </p>
        }
      } @else {
        <div class="bg-white rounded-3xl p-16 text-center">
          <p class="text-slate-500">Prescription not found</p>
        </div>
      }
    </div>
  `
})
export class PrescriptionComponent {
  @Input() id?: string;

  private appointmentService = inject(AppointmentService);
  private userService = inject(UserService);
  private router = inject(Router);

  appointment = computed(() => {
    const aptId = parseInt(this.id || '0', 10);
    return this.appointmentService.getById(aptId);
  });

  patient = computed(() => {
    const apt = this.appointment();
    return apt ? this.userService.getUserById(apt.userId) : undefined;
  });

  private printWithMode(mode: 'patient' | 'internal'): void {
    const body = document.body;
    body.classList.add(`print-mode-${mode}`);
    const cleanup = () => {
      body.classList.remove('print-mode-patient', 'print-mode-internal');
      window.removeEventListener('afterprint', cleanup);
    };
    window.addEventListener('afterprint', cleanup);
    setTimeout(() => window.print(), 0);
  }

  printPatient(): void { this.printWithMode('patient'); }
  printInternal(): void { this.printWithMode('internal'); }

  back(): void {
    this.router.navigate(['/doctor/queue']);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  }

  formatTime(): string {
    return new Date().toLocaleTimeString('en-US', {
      hour: '2-digit', minute: '2-digit', hour12: true
    });
  }

  formatRxNumber(id: number): string {
    return new Date().getFullYear() + '-' + String(id).padStart(6, '0');
  }

  padId(id: number): string {
    return String(id).padStart(4, '0');
  }
}
