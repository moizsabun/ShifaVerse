import { Injectable, signal, effect } from '@angular/core';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly STORAGE_KEY = 'medicare_users';
  
  private usersSignal = signal<User[]>(this.loadFromStorage());
  
  users = this.usersSignal.asReadonly();

  constructor() {
    // Auto-persist to localStorage on changes
    effect(() => {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.usersSignal()));
    });
  }

  private loadFromStorage(): User[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Failed to load users', e);
    }
    // Seed data
    return [
      { id: 1, name: 'Ahmed Khan', mobile: '0301-2345678', age: 34, createdAt: '2025-11-10' },
      { id: 2, name: 'Sara Ahmed', mobile: '0321-9876543', age: 28, createdAt: '2025-12-05' },
      { id: 3, name: 'Muhammad Ali', mobile: '0333-5556677', age: 45, createdAt: '2026-01-15' },
      { id: 4, name: 'Fatima Hassan', mobile: '0345-1112233', age: 52, createdAt: '2026-02-20' }
    ];
  }

  addUser(user: Omit<User, 'id' | 'createdAt'>): User {
    const newUser: User = {
      ...user,
      id: Math.max(0, ...this.usersSignal().map(u => u.id)) + 1,
      createdAt: new Date().toISOString().split('T')[0]
    };
    this.usersSignal.update(users => [...users, newUser]);
    return newUser;
  }

  getUserById(id: number): User | undefined {
    return this.usersSignal().find(u => u.id === id);
  }

  searchUsers(query: string): User[] {
    if (!query.trim()) return this.usersSignal();
    const q = query.toLowerCase();
    return this.usersSignal().filter(u => 
      u.name.toLowerCase().includes(q) || u.mobile.includes(query)
    );
  }
}
