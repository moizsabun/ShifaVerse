import { Component, inject, signal, computed, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AppointmentService } from '../../core/services/appointment.service';
import { UserService } from '../../core/services/user.service';
import { NotificationService } from '../../core/services/notification.service';
import { DIAGNOSES, SYMPTOMS, MEDICINES, MEDICAL_TESTS } from '../../core/constants/medical-data';
import { Medication, MedicalTest, Treatment } from '../../core/models/treatment.model';

@Component({
  selector: 'app-treatment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="animate-fade-in-up">
      <button (click)="back()" class="text-sm text-slate-600 hover:text-emerald-600 mb-6 flex items-center gap-1 font-medium transition-colors">
        ← Back to Queue
      </button>

      @if (appointment(); as apt) {
        <!-- Patient Header -->
        <div class="bg-gradient-to-br from-slate-900 via-emerald-900 to-teal-900 rounded-3xl p-6 text-white mb-6 shadow-2xl relative overflow-hidden">
          <div class="absolute top-0 right-0 w-72 h-72 bg-emerald-500/20 rounded-full -translate-y-36 translate-x-36 blur-3xl"></div>
          <div class="relative flex items-center justify-between">
            <div class="flex items-center gap-5">
              <div class="w-16 h-16 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center text-xl font-bold border border-white/20">
                {{ getInitials(apt.userName) }}
              </div>
              <div>
                <p class="text-xs text-emerald-300 uppercase tracking-wider mb-1">Now Examining</p>
                <h1 class="font-display text-3xl font-bold">{{ apt.userName }}</h1>
                <div class="flex items-center gap-4 text-sm text-emerald-100 mt-1">
                  @if (patient(); as p) {
                    <span>{{ p.mobile }}</span><span>•</span>
                    <span>Age {{ p.age }}</span><span>•</span>
                  }
                  <span>{{ pastVisits().length }} past visit{{ pastVisits().length !== 1 ? 's' : '' }}</span>
                </div>
              </div>
            </div>
            <div class="text-right">
              <p class="text-xs text-emerald-300 mb-1">Sequence</p>
              <p class="font-display text-5xl font-bold">#{{ apt.sequence }}</p>
              <p class="text-xs text-emerald-200 mt-1">{{ apt.shiftName }}</p>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-3 gap-6">
          <div class="col-span-2 space-y-6">

            <!-- Symptoms -->
            <div class="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
              <div class="flex items-center justify-between mb-4">
                <div>
                  <h3 class="font-display text-lg font-semibold text-slate-900">Symptoms</h3>
                  <p class="text-xs text-slate-500">{{ selectedSymptoms().length }} selected</p>
                </div>
              </div>
              <input type="text" placeholder="Search symptoms..." [(ngModel)]="symptomSearch"
                     class="w-full px-4 py-2.5 mb-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-100 transition-all text-sm" />
              <div class="flex flex-wrap gap-2">
                @for (symptom of filteredSymptoms(); track symptom) {
                  <button (click)="toggleSymptom(symptom)"
                          class="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                          [class]="selectedSymptoms().includes(symptom)
                            ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30'
                            : 'bg-slate-100 text-slate-700 hover:bg-amber-50 hover:text-amber-700'">
                    {{ symptom }}
                  </button>
                }
              </div>
              @if (errors().symptoms) {
                <p class="text-xs text-rose-500 mt-3">{{ errors().symptoms }}</p>
              }
            </div>

            <!-- Diagnosis -->
            <div class="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
              <div class="flex items-center justify-between mb-4">
                <div>
                  <h3 class="font-display text-lg font-semibold text-slate-900">Diagnosis</h3>
                  <p class="text-xs text-slate-500">{{ selectedDiagnosis().length }} selected</p>
                </div>
              </div>
              <input type="text" placeholder="Search diagnoses..." [(ngModel)]="diagnosisSearch"
                     class="w-full px-4 py-2.5 mb-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all text-sm" />
              <div class="flex flex-wrap gap-2">
                @for (d of filteredDiagnoses(); track d) {
                  <button (click)="toggleDiagnosis(d)"
                          class="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                          [class]="selectedDiagnosis().includes(d)
                            ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                            : 'bg-slate-100 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700'">
                    {{ d }}
                  </button>
                }
              </div>
              @if (errors().diagnosis) {
                <p class="text-xs text-rose-500 mt-3">{{ errors().diagnosis }}</p>
              }
            </div>

            <!-- Medical Tests -->
            <div class="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
              <div class="flex items-center justify-between mb-4">
                <div>
                  <h3 class="font-display text-lg font-semibold text-slate-900">Medical Tests</h3>
                  <p class="text-xs text-slate-500">{{ selectedTests().length }} ordered</p>
                </div>
              </div>

              <div class="flex gap-2 mb-4 flex-wrap">
                @for (cat of MEDICAL_TESTS; track cat.category) {
                  <button (click)="activeTestCategory.set(cat.category)"
                          class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                          [class]="activeTestCategory() === cat.category
                            ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/30'
                            : 'bg-slate-100 text-slate-700 hover:bg-cyan-50 hover:text-cyan-700'">
                    {{ cat.category }}
                  </button>
                }
              </div>

              <input type="text" placeholder="Search tests in {{ activeTestCategory() }}..." [(ngModel)]="testSearch"
                     class="w-full px-4 py-2.5 mb-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100 transition-all text-sm" />

              <div class="flex flex-wrap gap-2">
                @for (t of filteredTests(); track t) {
                  <button (click)="toggleTest(activeTestCategory(), t)"
                          class="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                          [class]="isTestSelected(activeTestCategory(), t)
                            ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/30'
                            : 'bg-slate-100 text-slate-700 hover:bg-cyan-50 hover:text-cyan-700'">
                    {{ t }}
                  </button>
                }
                @if (filteredTests().length === 0) {
                  <p class="text-xs text-slate-400 italic">No tests match your search</p>
                }
              </div>

              @if (selectedTests().length > 0) {
                <div class="mt-5 pt-5 border-t border-slate-100">
                  <p class="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-2">Ordered Tests</p>
                  <div class="flex flex-wrap gap-2">
                    @for (t of selectedTests(); track t.category + '|' + t.name) {
                      <span class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-cyan-50 border border-cyan-200 text-cyan-800 rounded-lg text-xs font-medium">
                        <span class="text-[10px] px-1.5 py-0.5 bg-cyan-500 text-white rounded font-bold uppercase tracking-wider">{{ t.category }}</span>
                        {{ t.name }}
                        <button (click)="removeTest(t)" class="text-cyan-500 hover:text-rose-500 ml-0.5">
                          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                          </svg>
                        </button>
                      </span>
                    }
                  </div>
                </div>
              }
            </div>

            <!-- Prescription Builder -->
            <div class="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
              <div class="flex items-center justify-between mb-4">
                <div>
                  <h3 class="font-display text-lg font-semibold text-slate-900">Prescription</h3>
                  <p class="text-xs text-slate-500">{{ prescription().length }} item{{ prescription().length !== 1 ? 's' : '' }} added</p>
                </div>
              </div>

              <div class="grid grid-cols-12 gap-3 mb-4">
                <div class="col-span-5">
                  <label class="block text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Medicine</label>
                  <select [(ngModel)]="selectedMedicineName" (ngModelChange)="onMedicineChange()"
                          class="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-100 text-sm">
                    <option value="">Select medicine...</option>
                    @for (m of MEDICINES; track m.name) {
                      <option [value]="m.name">{{ m.name }}</option>
                    }
                  </select>
                </div>
                <div class="col-span-5">
                  <label class="block text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Dose</label>
                  <select [(ngModel)]="selectedDose" [disabled]="!selectedMedicineName"
                          class="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-100 text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                    <option value="">{{ selectedMedicineName ? 'Select dose...' : 'Pick medicine first' }}</option>
                    @for (d of availableDoses(); track d) {
                      <option [value]="d">{{ d }}</option>
                    }
                    <option value="__custom__">Custom dose...</option>
                  </select>
                </div>
                <div class="col-span-2 flex items-end">
                  <button (click)="addToPrescription()" [disabled]="!canAdd()"
                          class="w-full px-3 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-xl font-semibold text-sm shadow-md shadow-teal-500/30 hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0">
                    Add
                  </button>
                </div>
              </div>

              @if (selectedDose === '__custom__') {
                <div class="mb-4">
                  <input type="text" placeholder="Enter custom dose instructions..." [(ngModel)]="customDose"
                         class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-100 text-sm" />
                </div>
              }

              @if (prescription().length === 0) {
                <div class="bg-slate-50 border border-dashed border-slate-200 rounded-xl p-8 text-center text-sm text-slate-400">
                  No medications added yet — select medicine + dose above and click Add
                </div>
              } @else {
                <div class="space-y-2">
                  @for (item of prescription(); track item.name + '|' + item.dosage; let i = $index) {
                    <div class="flex items-center gap-3 p-3 bg-teal-50 border border-teal-100 rounded-xl">
                      <div class="w-8 h-8 bg-teal-500 text-white rounded-lg flex items-center justify-center font-bold text-sm">{{ i + 1 }}</div>
                      <div class="flex-1">
                        <p class="font-semibold text-slate-900 text-sm">{{ item.name }}</p>
                        <p class="text-xs text-slate-600">{{ item.dosage }}</p>
                      </div>
                      <button (click)="removeFromPrescription(i)" class="text-slate-400 hover:text-rose-500 p-1">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  }
                </div>
              }
              @if (errors().medications) {
                <p class="text-xs text-rose-500 mt-3">{{ errors().medications }}</p>
              }
            </div>

            <!-- Remarks -->
            <div class="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
              <h3 class="font-display text-lg font-semibold text-slate-900 mb-1">Remarks for Patient</h3>
              <p class="text-xs text-slate-500 mb-3">Shown on the patient's prescription copy</p>
              <textarea [(ngModel)]="remarks" rows="3"
                        placeholder="Follow-up advice, lifestyle recommendations, when to return..."
                        class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all text-sm resize-none"></textarea>
            </div>

            <!-- Internal Notes -->
            <div class="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
              <h3 class="font-display text-lg font-semibold text-slate-900 mb-1">Doctor's Internal Notes</h3>
              <p class="text-xs text-slate-500 mb-3">Only shown on the internal copy</p>
              <textarea [(ngModel)]="notes" rows="3"
                        placeholder="Clinical observations, differential considerations, internal references..."
                        class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all text-sm resize-none"></textarea>
            </div>

            <button (click)="complete()"
                    class="w-full px-6 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl font-bold text-lg shadow-2xl shadow-emerald-500/40 hover:shadow-emerald-500/50 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3">
              Complete & Generate Prescription
            </button>
          </div>

          <!-- Sidebar: Past Visits -->
          <div class="space-y-4">
            <div class="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sticky top-8">
              <h3 class="font-display text-lg font-semibold text-slate-900 mb-4">Past Visits</h3>
              @if (pastVisits().length === 0) {
                <p class="text-sm text-slate-400 italic">No previous medical history</p>
              } @else {
                <div class="space-y-3 max-h-[600px] overflow-y-auto scrollbar-thin">
                  @for (visit of pastVisits().slice(0, 5); track visit.id) {
                    <div class="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <p class="text-xs text-slate-500 mb-2">{{ formatDate(visit.date) }}</p>
                      @if (visit.treatment) {
                        @if (visit.treatment.diagnosis.length > 0) {
                          <div class="flex flex-wrap gap-1 mb-2">
                            @for (d of visit.treatment.diagnosis; track d) {
                              <span class="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] rounded-md font-semibold">{{ d }}</span>
                            }
                          </div>
                        }
                        @if (visit.treatment.medications.length > 0) {
                          <p class="text-xs text-slate-600">
                            <span class="font-semibold">Rx:</span>
                            {{ visit.treatment.medications.length }} medication{{ visit.treatment.medications.length !== 1 ? 's' : '' }}
                          </p>
                        }
                      }
                    </div>
                  }
                </div>
              }
            </div>
          </div>
        </div>
      } @else {
        <div class="bg-white rounded-3xl p-16 text-center">
          <p class="text-slate-500">Appointment not found</p>
        </div>
      }
    </div>
  `
})
export class TreatmentComponent {
  @Input() id?: string;

  private appointmentService = inject(AppointmentService);
  private userService = inject(UserService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  DIAGNOSES = DIAGNOSES;
  SYMPTOMS = SYMPTOMS;
  MEDICINES = MEDICINES;
  MEDICAL_TESTS = MEDICAL_TESTS;

  symptomSearch = '';
  diagnosisSearch = '';
  testSearch = '';
  notes = '';
  remarks = '';

  selectedMedicineName = '';
  selectedDose = '';
  customDose = '';

  activeTestCategory = signal<string>(MEDICAL_TESTS[0]?.category ?? '');

  selectedSymptoms = signal<string[]>([]);
  selectedDiagnosis = signal<string[]>([]);
  selectedTests = signal<MedicalTest[]>([]);
  prescription = signal<Medication[]>([]);
  errors = signal<{ symptoms?: string; diagnosis?: string; medications?: string }>({});

  appointment = computed(() => {
    const aptId = parseInt(this.id || '0', 10);
    return this.appointmentService.getById(aptId);
  });

  patient = computed(() => {
    const apt = this.appointment();
    return apt ? this.userService.getUserById(apt.userId) : undefined;
  });

  pastVisits = computed(() => {
    const apt = this.appointment();
    return apt ? this.appointmentService.getUserHistory(apt.userId) : [];
  });

  filteredSymptoms = computed(() => {
    const q = this.symptomSearch.toLowerCase().trim();
    return q ? SYMPTOMS.filter(s => s.toLowerCase().includes(q)) : SYMPTOMS;
  });

  filteredDiagnoses = computed(() => {
    const q = this.diagnosisSearch.toLowerCase().trim();
    return q ? DIAGNOSES.filter(d => d.toLowerCase().includes(q)) : DIAGNOSES;
  });

  filteredTests = computed(() => {
    const cat = MEDICAL_TESTS.find(c => c.category === this.activeTestCategory());
    const all = cat ? cat.tests : [];
    const q = this.testSearch.toLowerCase().trim();
    return q ? all.filter(t => t.toLowerCase().includes(q)) : all;
  });

  availableDoses(): string[] {
    const m = MEDICINES.find(x => x.name === this.selectedMedicineName);
    return m ? m.doses : [];
  }

  canAdd(): boolean {
    if (!this.selectedMedicineName) return false;
    if (!this.selectedDose) return false;
    if (this.selectedDose === '__custom__') return this.customDose.trim().length > 0;
    return true;
  }

  onMedicineChange(): void {
    this.selectedDose = '';
    this.customDose = '';
  }

  addToPrescription(): void {
    if (!this.canAdd()) return;
    const dosage = this.selectedDose === '__custom__' ? this.customDose.trim() : this.selectedDose;
    const item: Medication = { name: this.selectedMedicineName, dosage };
    this.prescription.update(arr => {
      if (arr.some(m => m.name === item.name && m.dosage === item.dosage)) return arr;
      return [...arr, item];
    });
    this.selectedMedicineName = '';
    this.selectedDose = '';
    this.customDose = '';
    this.errors.update(e => ({ ...e, medications: undefined }));
  }

  removeFromPrescription(index: number): void {
    this.prescription.update(arr => arr.filter((_, i) => i !== index));
  }

  isTestSelected(category: string, name: string): boolean {
    return this.selectedTests().some(t => t.category === category && t.name === name);
  }

  toggleTest(category: string, name: string): void {
    this.selectedTests.update(arr =>
      this.isTestSelected(category, name)
        ? arr.filter(t => !(t.category === category && t.name === name))
        : [...arr, { category, name }]
    );
  }

  removeTest(test: MedicalTest): void {
    this.selectedTests.update(arr =>
      arr.filter(t => !(t.category === test.category && t.name === test.name))
    );
  }

  toggleSymptom(symptom: string): void {
    this.selectedSymptoms.update(arr =>
      arr.includes(symptom) ? arr.filter(s => s !== symptom) : [...arr, symptom]
    );
    this.errors.update(e => ({ ...e, symptoms: undefined }));
  }

  toggleDiagnosis(d: string): void {
    this.selectedDiagnosis.update(arr =>
      arr.includes(d) ? arr.filter(x => x !== d) : [...arr, d]
    );
    this.errors.update(e => ({ ...e, diagnosis: undefined }));
  }

  validate(): boolean {
    const e: { symptoms?: string; diagnosis?: string; medications?: string } = {};
    if (this.selectedSymptoms().length === 0) e.symptoms = 'Select at least one symptom';
    if (this.selectedDiagnosis().length === 0) e.diagnosis = 'Select at least one diagnosis';
    if (this.prescription().length === 0) e.medications = 'Add at least one medication to the prescription';
    this.errors.set(e);
    return Object.keys(e).length === 0;
  }

  complete(): void {
    if (!this.validate()) {
      this.notificationService.error('Please complete all required sections');
      return;
    }

    const apt = this.appointment();
    if (!apt) return;

    const treatment: Treatment = {
      symptoms: this.selectedSymptoms(),
      diagnosis: this.selectedDiagnosis(),
      medications: this.prescription(),
      tests: this.selectedTests(),
      notes: this.notes.trim(),
      remarks: this.remarks.trim()
    };

    this.appointmentService.completeAppointment(apt.id, treatment);
    this.notificationService.success('Treatment recorded successfully');
    this.router.navigate(['/doctor/dashboard']);
  }

  back(): void {
    this.router.navigate(['/doctor/queue']);
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  }
}
