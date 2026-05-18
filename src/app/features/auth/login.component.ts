import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center p-6 mesh-bg bg-gradient-to-br from-slate-50 via-emerald-50/40 to-teal-50/50">
      <div class="max-w-5xl w-full">

        <!-- Header / Brand -->
        <div class="text-center mb-14 animate-fade-in-up">
          <div class="inline-flex items-center gap-3 mb-7">
            <div class="relative">
              <div class="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-emerald-500/40 rotate-6 hover:rotate-0 transition-transform duration-500">
                <svg class="w-11 h-11 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
              </div>
              <div class="absolute -top-2 -right-2 w-7 h-7 bg-rose-500 rounded-full border-3 border-white flex items-center justify-center shadow-lg animate-pulse-ring">
                <svg class="w-3.5 h-3.5 text-white" fill="white" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              </div>
            </div>
          </div>
          <h1 class="font-display text-7xl font-bold text-slate-900 mb-4 tracking-tight">
            MediCare<span class="text-emerald-600 italic">+</span>
          </h1>
          <p class="text-slate-600 text-lg font-light tracking-wide">Intelligent Clinic Management System</p>
          <div class="flex items-center justify-center gap-2 mt-5 text-sm text-slate-500">
            <svg class="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l1.5 6.5L20 10l-6.5 1.5L12 18l-1.5-6.5L4 10l6.5-1.5z"/>
            </svg>
            <span class="font-medium tracking-wider">PREMIUM HEALTHCARE SUITE · V2.6</span>
          </div>
        </div>

        <!-- Module Selection -->
        <div class="grid md:grid-cols-2 gap-6">
          
          <!-- Compounder Portal -->
          <a 
            routerLink="/compounder"
            class="group relative overflow-hidden bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100 hover:shadow-2xl hover:shadow-emerald-200/40 hover:-translate-y-2 transition-all duration-500 animate-fade-in-up cursor-pointer"
            style="animation-delay: 0.1s">
            <div class="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-emerald-100 to-teal-50 rounded-full -translate-y-24 translate-x-24 group-hover:scale-150 transition-transform duration-700"></div>
            <div class="relative">
              <div class="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mb-7 shadow-lg shadow-emerald-500/30 group-hover:rotate-6 transition-transform">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 class="font-display text-3xl font-semibold text-slate-900 mb-2">Compounder</h3>
              <p class="text-slate-600 mb-7 leading-relaxed">
                Manage patient registrations, schedule appointments, and oversee daily clinic operations.
              </p>
              <div class="space-y-2.5 mb-7">
                <div class="flex items-center gap-2 text-sm text-slate-600">
                  <div class="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                  Patient Registration
                </div>
                <div class="flex items-center gap-2 text-sm text-slate-600">
                  <div class="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                  Shift Management
                </div>
                <div class="flex items-center gap-2 text-sm text-slate-600">
                  <div class="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                  Appointment Booking & Cancellation
                </div>
                <div class="flex items-center gap-2 text-sm text-slate-600">
                  <div class="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                  Visit History
                </div>
              </div>
              <div class="flex items-center text-emerald-600 font-semibold group-hover:gap-3 gap-2 transition-all">
                Enter Portal 
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </a>

          <!-- Doctor Portal -->
          <a 
            routerLink="/doctor"
            class="group relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 rounded-3xl p-8 shadow-xl shadow-slate-300/50 hover:shadow-2xl hover:shadow-slate-400/50 hover:-translate-y-2 transition-all duration-500 animate-fade-in-up cursor-pointer"
            style="animation-delay: 0.2s">
            <div class="absolute top-0 right-0 w-48 h-48 bg-emerald-500/20 rounded-full -translate-y-24 translate-x-24 group-hover:scale-150 transition-transform duration-700 blur-2xl"></div>
            <div class="relative">
              <div class="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center mb-7 shadow-lg shadow-emerald-500/50 group-hover:rotate-6 transition-transform">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <h3 class="font-display text-3xl font-semibold text-white mb-2">Doctor</h3>
              <p class="text-slate-300 mb-7 leading-relaxed">
                Review appointments, examine patients, prescribe treatments, and print prescriptions.
              </p>
              <div class="space-y-2.5 mb-7">
                <div class="flex items-center gap-2 text-sm text-slate-300">
                  <div class="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                  Today's Appointments Queue
                </div>
                <div class="flex items-center gap-2 text-sm text-slate-300">
                  <div class="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                  Medical Diagnosis & Treatment
                </div>
                <div class="flex items-center gap-2 text-sm text-slate-300">
                  <div class="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                  Prescription Writer
                </div>
                <div class="flex items-center gap-2 text-sm text-slate-300">
                  <div class="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                  Thermal Printer Output
                </div>
              </div>
              <div class="flex items-center text-emerald-400 font-semibold group-hover:gap-3 gap-2 transition-all">
                Enter Portal 
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </a>
        </div>

        <!-- Footer -->
        <div class="text-center mt-12 text-sm text-slate-500">
          <div class="flex items-center justify-center gap-8">
            <span class="flex items-center gap-1.5">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Secure
            </span>
            <span class="flex items-center gap-1.5">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Real-time
            </span>
            <span class="flex items-center gap-1.5">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              Patient-First
            </span>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {}
