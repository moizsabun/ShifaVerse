import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { StaffService } from '../../core/services/staff.service';
import { NotificationService } from '../../core/services/notification.service';
import { StaffRole } from '../../core/models/staff.model';

@Component({
  selector: 'app-staff-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="animate-fade-in-up space-y-6">
      <div class="flex items-end justify-between">
        <div>
          <h1 class="font-display text-4xl font-bold text-slate-900">Staff</h1>
          <p class="text-slate-500 mt-2">Manage doctor and compounder accounts for your clinic</p>
        </div>
        <button (click)="showForm.set(!showForm())"
                class="px-5 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-semibold shadow-lg shadow-amber-500/30 hover:shadow-xl transition-all">
          {{ showForm() ? 'Cancel' : '+ Add Staff' }}
        </button>
      </div>

      @if (showForm()) {
        <div class="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
          <h3 class="font-display text-lg font-semibold text-slate-900 mb-4">{{ editingId() ? 'Edit Staff' : 'New Staff Member' }}</h3>
          <div class="grid grid-cols-4 gap-3">
            <div>
              <label class="block text-xs font-semibold text-slate-600 mb-1.5">Role</label>
              <select [(ngModel)]="form.role" [disabled]="editingId() !== null"
                      class="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm disabled:opacity-50">
                <option value="doctor">Doctor</option>
                <option value="compounder">Compounder</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-600 mb-1.5">Full Name</label>
              <input type="text" [(ngModel)]="form.name" class="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-600 mb-1.5">Email</label>
              <input type="email" [(ngModel)]="form.email" class="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-600 mb-1.5">Password</label>
              <input type="text" [(ngModel)]="form.password" placeholder="min 4 chars" class="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
            </div>
          </div>
          @if (error()) {
            <p class="text-xs text-rose-500 mt-3">{{ error() }}</p>
          }
          <div class="flex gap-3 mt-5">
            <button (click)="save()" class="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-semibold shadow-lg shadow-amber-500/30 hover:shadow-xl transition-all">
              {{ editingId() ? 'Save Changes' : 'Create Account' }}
            </button>
            <button (click)="cancelForm()" class="px-5 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200">Cancel</button>
          </div>
        </div>
      }

      <div class="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div class="grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wide">
          <div class="col-span-2">Role</div>
          <div class="col-span-3">Name</div>
          <div class="col-span-4">Email</div>
          <div class="col-span-3 text-right">Actions</div>
        </div>
        <div class="divide-y divide-slate-100">
          @for (s of staff(); track s.id) {
            <div class="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-slate-50 transition-colors">
              <div class="col-span-2">
                <span class="px-2 py-1 rounded-md text-xs font-semibold uppercase"
                      [class]="roleBadge(s.role)">
                  {{ s.role }}
                </span>
              </div>
              <div class="col-span-3 font-semibold text-slate-900">{{ s.name }}</div>
              <div class="col-span-4 text-sm text-slate-600">{{ s.email }}</div>
              <div class="col-span-3 text-right flex justify-end gap-2">
                <button (click)="startEdit(s.id)" class="px-3 py-1.5 text-amber-700 hover:bg-amber-50 rounded-lg text-xs font-semibold">Edit</button>
                @if (s.role !== 'owner') {
                  <button (click)="deleteStaff(s.id)" class="px-3 py-1.5 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-semibold">Delete</button>
                }
              </div>
            </div>
          }
          @if (staff().length === 0) {
            <div class="p-12 text-center text-slate-400">No staff yet</div>
          }
        </div>
      </div>
    </div>
  `
})
export class StaffManagementComponent {
  private auth = inject(AuthService);
  private staffService = inject(StaffService);
  private notify = inject(NotificationService);

  showForm = signal(false);
  editingId = signal<number | null>(null);
  error = signal('');

  form: { role: StaffRole; name: string; email: string; password: string } = {
    role: 'doctor', name: '', email: '', password: ''
  };

  staff = computed(() => {
    const cid = this.auth.currentClinicId();
    return cid ? this.staffService.byClinic(cid) : [];
  });

  roleBadge(role: string): string {
    return ({
      owner: 'bg-purple-100 text-purple-700',
      doctor: 'bg-emerald-100 text-emerald-700',
      compounder: 'bg-amber-100 text-amber-700'
    } as Record<string, string>)[role] ?? 'bg-slate-100 text-slate-700';
  }

  startEdit(id: number): void {
    const s = this.staffService.getById(id);
    if (!s) return;
    this.editingId.set(id);
    this.form = { role: s.role, name: s.name, email: s.email, password: s.password };
    this.showForm.set(true);
  }

  cancelForm(): void {
    this.showForm.set(false);
    this.editingId.set(null);
    this.form = { role: 'doctor', name: '', email: '', password: '' };
    this.error.set('');
  }

  save(): void {
    this.error.set('');
    const cid = this.auth.currentClinicId();
    if (!cid) return;
    try {
      if (this.editingId() !== null) {
        this.staffService.updateStaff(this.editingId()!, {
          name: this.form.name, email: this.form.email, password: this.form.password
        });
        this.notify.success('Staff updated');
      } else {
        this.staffService.createStaff({
          clinicId: cid,
          role: this.form.role,
          name: this.form.name,
          email: this.form.email,
          password: this.form.password
        });
        this.notify.success('Staff account created');
      }
      this.cancelForm();
    } catch (e: any) {
      this.error.set(e.message);
    }
  }

  deleteStaff(id: number): void {
    if (!confirm('Delete this staff account?')) return;
    this.staffService.deleteStaff(id);
    this.notify.success('Staff deleted');
  }
}
