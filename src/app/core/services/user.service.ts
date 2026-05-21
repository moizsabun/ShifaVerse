import { Injectable, signal, effect, computed, inject } from '@angular/core';
import { User } from '../models/user.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly STORAGE_KEY = 'medicare_users_v3';

  private auth = inject(AuthService);

  private usersSignal = signal<User[]>(this.loadFromStorage());

  /** Scoped to the current logged-in clinic. */
  users = computed(() => {
    const cid = this.auth.currentClinicId();
    if (!cid) return [];
    return this.usersSignal().filter(u => u.clinicId === cid);
  });

  /** Unscoped, for platform-admin views. */
  allUsers = this.usersSignal.asReadonly();

  constructor() {
    effect(() => {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.usersSignal()));
    });
  }

  private loadFromStorage(): User[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data) as User[];
        if (Array.isArray(parsed) && parsed.every(u => typeof u?.clinicId === 'number')) return parsed;
      }
    } catch {}
    return [
      { id: 1, clinicId: 1, name: 'Ahmed Khan',    mobile: '0301-2345678', age: 34, createdAt: '2025-11-10' },
      { id: 2, clinicId: 1, name: 'Sara Ahmed',    mobile: '0321-9876543', age: 28, createdAt: '2025-12-05' },
      { id: 3, clinicId: 1, name: 'Muhammad Ali',  mobile: '0333-5556677', age: 45, createdAt: '2026-01-15' },
      { id: 4, clinicId: 1, name: 'Fatima Hassan', mobile: '0345-1112233', age: 52, createdAt: '2026-02-20' },
      { id: 5, clinicId: 2, name: 'Imran Sheikh',  mobile: '0301-1111111', age: 40, createdAt: '2026-01-05' },
      { id: 6, clinicId: 2, name: 'Ayesha Malik',  mobile: '0321-2222222', age: 31, createdAt: '2026-02-08' }
    ];
  }

  addUser(input: Omit<User, 'id' | 'createdAt' | 'clinicId'>): User {
    const cid = this.auth.currentClinicId();
    if (!cid) throw new Error('No active clinic context');
    const newUser: User = {
      ...input,
      id: Math.max(0, ...this.usersSignal().map(u => u.id)) + 1,
      clinicId: cid,
      createdAt: new Date().toISOString().split('T')[0]
    };
    this.usersSignal.update(users => [...users, newUser]);
    return newUser;
  }

  getUserById(id: number): User | undefined {
    const cid = this.auth.currentClinicId();
    const u = this.usersSignal().find(x => x.id === id);
    if (!u) return undefined;
    if (cid && u.clinicId !== cid) return undefined;
    return u;
  }

  searchUsers(query: string): User[] {
    if (!query.trim()) return this.users();
    const q = query.toLowerCase();
    return this.users().filter(u =>
      u.name.toLowerCase().includes(q) || u.mobile.includes(query)
    );
  }
}
