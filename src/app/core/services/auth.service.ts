import { Injectable, signal, computed, inject, effect } from '@angular/core';
import { AuthUser, PlatformAdmin, StaffRole } from '../models/staff.model';
import { StaffService } from './staff.service';
import { ClinicService } from './clinic.service';

const SESSION_KEY = 'medicare_session_v1';

const PLATFORM_ADMIN: PlatformAdmin = {
  email: 'admin@medicare.app',
  password: 'admin123'
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private staffService = inject(StaffService);
  private clinicService = inject(ClinicService);

  private currentUserSignal = signal<AuthUser | null>(this.loadSession());

  currentUser = this.currentUserSignal.asReadonly();
  isAuthenticated = computed(() => this.currentUserSignal() !== null);
  currentClinicId = computed(() => this.currentUserSignal()?.clinicId ?? null);

  currentClinic = computed(() => {
    const id = this.currentClinicId();
    return id ? this.clinicService.getById(id) ?? null : null;
  });

  constructor() {
    effect(() => {
      const u = this.currentUserSignal();
      if (u) localStorage.setItem(SESSION_KEY, JSON.stringify(u));
      else localStorage.removeItem(SESSION_KEY);
    });
  }

  private loadSession(): AuthUser | null {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as AuthUser;
      if (parsed && typeof parsed.kind === 'string') return parsed;
    } catch {}
    return null;
  }

  /** Try platform admin login. */
  loginPlatform(email: string, password: string): AuthUser {
    if (email.trim().toLowerCase() !== PLATFORM_ADMIN.email || password !== PLATFORM_ADMIN.password) {
      throw new Error('Invalid platform admin credentials');
    }
    const user: AuthUser = {
      kind: 'platform',
      name: 'Platform Admin',
      email: PLATFORM_ADMIN.email
    };
    this.currentUserSignal.set(user);
    return user;
  }

  /** Try staff (owner/doctor/compounder) login. */
  loginStaff(email: string, password: string): AuthUser {
    const staff = this.staffService.findCredentials(email, password);
    if (!staff) throw new Error('Invalid email or password');
    const clinic = this.clinicService.getById(staff.clinicId);
    if (!clinic || !clinic.active) throw new Error('This clinic is currently inactive. Contact platform admin.');
    if (clinic.suspended && staff.role !== 'owner') {
      throw new Error(`${clinic.name} is suspended due to unpaid bills. Only the owner can log in to clear payment.`);
    }
    const user: AuthUser = {
      kind: 'staff',
      staffId: staff.id,
      clinicId: staff.clinicId,
      role: staff.role,
      name: staff.name,
      email: staff.email
    };
    this.currentUserSignal.set(user);
    return user;
  }

  /** True if the current session belongs to a suspended clinic. */
  isClinicSuspended(): boolean {
    const c = this.currentClinic();
    return !!c?.suspended;
  }

  logout(): void {
    this.currentUserSignal.set(null);
  }

  /** Route based on role after a successful login. */
  defaultRouteForCurrent(): string {
    const u = this.currentUserSignal();
    if (!u) return '/login';
    if (u.kind === 'platform') return '/admin/dashboard';
    switch (u.role) {
      case 'owner':      return '/owner/dashboard';
      case 'doctor':     return '/doctor/dashboard';
      case 'compounder': return '/compounder/dashboard';
      default:           return '/login';
    }
  }

  hasRole(role: StaffRole | 'platform'): boolean {
    const u = this.currentUserSignal();
    if (!u) return false;
    if (role === 'platform') return u.kind === 'platform';
    return u.kind === 'staff' && u.role === role;
  }
}
