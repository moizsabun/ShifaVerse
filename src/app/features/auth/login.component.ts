import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

type Mode = 'clinic' | 'platform';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center p-6 mesh-bg"
         [class]="mode() === 'platform' ? 'bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 text-white' : 'bg-gradient-to-br from-slate-50 via-emerald-50/40 to-teal-50/50'">
      <div class="max-w-md w-full">

        <div class="text-center mb-10 animate-fade-in-up">
          <div class="inline-flex items-center gap-3 mb-6">
            <div class="w-16 h-16 rounded-3xl flex items-center justify-center shadow-2xl"
                 [class]="mode() === 'platform' ? 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-indigo-500/40' : 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/40'">
              @if (mode() === 'platform') {
                <svg class="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                </svg>
              } @else {
                <svg class="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
              }
            </div>
          </div>
          <h1 class="font-display text-5xl font-bold mb-2 tracking-tight"
              [class]="mode() === 'platform' ? 'text-white' : 'text-slate-900'">
            MediCare<span class="text-emerald-500 italic">+</span>
          </h1>
          <p class="text-sm font-light"
             [class]="mode() === 'platform' ? 'text-indigo-200' : 'text-slate-500'">
            {{ mode() === 'platform' ? 'Platform Administrator Console' : 'Clinic Staff Portal' }}
          </p>
        </div>

        <div class="rounded-3xl shadow-xl p-7 animate-fade-in-up"
             [class]="mode() === 'platform' ? 'bg-slate-900/70 border border-indigo-500/30 backdrop-blur' : 'bg-white border border-slate-100'">
          <div class="space-y-4">
            <div>
              <label class="block text-xs font-semibold mb-1.5"
                     [class]="mode() === 'platform' ? 'text-indigo-200' : 'text-slate-600'">Email</label>
              <input type="email" [(ngModel)]="email" (keyup.enter)="submit()"
                     [placeholder]="mode() === 'platform' ? 'admin@medicare.app' : 'you@clinic.com'"
                     class="w-full px-4 py-3 rounded-xl focus:outline-none transition-all"
                     [class]="mode() === 'platform' ? 'bg-slate-800/60 border border-indigo-500/30 text-white placeholder-indigo-300/50 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/20' : 'bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100'" />
            </div>
            <div>
              <label class="block text-xs font-semibold mb-1.5"
                     [class]="mode() === 'platform' ? 'text-indigo-200' : 'text-slate-600'">Password</label>
              <input type="password" [(ngModel)]="password" (keyup.enter)="submit()" placeholder="••••••••"
                     class="w-full px-4 py-3 rounded-xl focus:outline-none transition-all"
                     [class]="mode() === 'platform' ? 'bg-slate-800/60 border border-indigo-500/30 text-white placeholder-indigo-300/50 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/20' : 'bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100'" />
            </div>
            @if (error()) {
              <p class="text-xs rounded-lg px-3 py-2"
                 [class]="mode() === 'platform' ? 'text-rose-300 bg-rose-500/10 border border-rose-500/30' : 'text-rose-500 bg-rose-50 border border-rose-200'">
                {{ error() }}
              </p>
            }
            <button (click)="submit()"
                    class="w-full px-6 py-3.5 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                    [class]="mode() === 'platform' ? 'bg-gradient-to-r from-indigo-500 to-purple-600 shadow-indigo-500/30' : 'bg-gradient-to-r from-emerald-500 to-teal-600 shadow-emerald-500/30'">
              Sign In
            </button>
          </div>
        </div>

        <!-- Cross-link to the other portal -->
        <div class="text-center mt-5">
          @if (mode() === 'platform') {
            <a href="login" class="text-xs text-indigo-300 hover:text-indigo-100 underline-offset-2 hover:underline">← Clinic staff login</a>
          } @else {
            <a href="admin/login" class="text-xs text-slate-400 hover:text-slate-600 underline-offset-2 hover:underline">Platform admin login →</a>
          }
        </div>

        <div class="mt-6 rounded-2xl p-5 text-xs space-y-1.5"
             [class]="mode() === 'platform' ? 'bg-slate-900/40 border border-indigo-500/20 text-indigo-100/80' : 'bg-white/60 backdrop-blur border border-slate-200 text-slate-600'">
          <p class="font-bold uppercase tracking-wider text-[10px] mb-2"
             [class]="mode() === 'platform' ? 'text-indigo-300' : 'text-slate-700'">Demo Logins</p>
          @if (mode() === 'platform') {
            <div><span class="font-semibold">Admin:</span> admin&#64;medicare.app / admin123</div>
          } @else {
            <div><span class="font-semibold">Shifa Owner:</span> owner&#64;shifa.com / shifa123</div>
            <div><span class="font-semibold">Shifa Doctor:</span> doctor&#64;shifa.com / doc123</div>
            <div><span class="font-semibold">Shifa Compounder:</span> compounder&#64;shifa.com / comp123</div>
            <div class="pt-2 mt-2 border-t border-slate-200">
              <span class="font-semibold">Public queue:</span>
              <a href="public/shifa" class="text-emerald-600 hover:underline ml-1">/public/shifa</a>
              · <a href="public/alkhidmat" class="text-emerald-600 hover:underline">/public/alkhidmat</a>
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class LoginComponent implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  mode = signal<Mode>('clinic');
  email = '';
  password = '';
  error = signal<string>('');

  ngOnInit(): void {
    const routeMode = this.route.snapshot.data['mode'] as Mode | undefined;
    if (routeMode === 'platform') this.mode.set('platform');
  }

  submit(): void {
    this.error.set('');
    try {
      if (this.mode() === 'platform') {
        this.auth.loginPlatform(this.email, this.password);
      } else {
        this.auth.loginStaff(this.email, this.password);
      }
      this.router.navigateByUrl(this.auth.defaultRouteForCurrent());
    } catch (e: any) {
      this.error.set(e.message);
    }
  }
}
