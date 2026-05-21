import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent),
    data: { mode: 'clinic' }
  },
  {
    path: 'admin/login',
    loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent),
    data: { mode: 'platform' }
  },

  // ====== Public queue dashboard (no auth) ======
  {
    path: 'public/:slug',
    loadComponent: () => import('./features/public/public-queue.component').then(m => m.PublicQueueComponent)
  },

  // ====== Platform Admin ======
  {
    path: 'admin',
    canActivate: [authGuard(['platform'])],
    loadComponent: () => import('./features/admin/admin-layout.component').then(m => m.AdminLayoutComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', loadComponent: () => import('./features/admin/admin-dashboard.component').then(m => m.AdminDashboardComponent) },
      { path: 'clinics',   loadComponent: () => import('./features/admin/clinics-list.component').then(m => m.ClinicsListComponent) },
      { path: 'clinics/:id', loadComponent: () => import('./features/admin/clinic-detail.component').then(m => m.ClinicDetailComponent) },
      { path: 'billing',   loadComponent: () => import('./features/admin/billing-overview.component').then(m => m.BillingOverviewComponent) }
    ]
  },

  // ====== Clinic Owner ======
  {
    path: 'owner',
    canActivate: [authGuard(['owner'])],
    loadComponent: () => import('./features/owner/owner-layout.component').then(m => m.OwnerLayoutComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', loadComponent: () => import('./features/owner/owner-dashboard.component').then(m => m.OwnerDashboardComponent) },
      { path: 'staff',     loadComponent: () => import('./features/owner/staff-management.component').then(m => m.StaffManagementComponent) },
      { path: 'billing',   loadComponent: () => import('./features/owner/owner-billing.component').then(m => m.OwnerBillingComponent) }
    ]
  },

  // ====== Compounder ======
  {
    path: 'compounder',
    canActivate: [authGuard(['compounder', 'owner'])],
    loadComponent: () => import('./features/compounder/compounder-layout.component').then(m => m.CompounderLayoutComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard',       loadComponent: () => import('./features/compounder/dashboard.component').then(m => m.CompounderDashboardComponent) },
      { path: 'users',           loadComponent: () => import('./features/compounder/users-list.component').then(m => m.UsersListComponent) },
      { path: 'users/:id',       loadComponent: () => import('./features/compounder/user-detail.component').then(m => m.UserDetailComponent) },
      { path: 'new-user',        loadComponent: () => import('./features/compounder/new-user.component').then(m => m.NewUserComponent) },
      { path: 'new-appointment', loadComponent: () => import('./features/compounder/new-appointment.component').then(m => m.NewAppointmentComponent) },
      { path: 'appointments',    loadComponent: () => import('./features/compounder/appointments-list.component').then(m => m.AppointmentsListComponent) },
      { path: 'shifts',          loadComponent: () => import('./features/compounder/shift-management.component').then(m => m.ShiftManagementComponent) },
      { path: 'shift-history',   loadComponent: () => import('./features/compounder/shift-history.component').then(m => m.ShiftHistoryComponent) },
      { path: 'prescription/:id',loadComponent: () => import('./features/doctor/prescription.component').then(m => m.PrescriptionComponent) }
    ]
  },

  // ====== Doctor ======
  {
    path: 'doctor',
    canActivate: [authGuard(['doctor', 'owner'])],
    loadComponent: () => import('./features/doctor/doctor-layout.component').then(m => m.DoctorLayoutComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard',       loadComponent: () => import('./features/doctor/doctor-dashboard.component').then(m => m.DoctorDashboardComponent) },
      { path: 'queue',           loadComponent: () => import('./features/doctor/doctor-queue.component').then(m => m.DoctorQueueComponent) },
      { path: 'treatment/:id',   loadComponent: () => import('./features/doctor/treatment.component').then(m => m.TreatmentComponent) },
      { path: 'prescription/:id',loadComponent: () => import('./features/doctor/prescription.component').then(m => m.PrescriptionComponent) },
      { path: 'history',         loadComponent: () => import('./features/doctor/doctor-history.component').then(m => m.DoctorHistoryComponent) },
      { path: 'patients',        loadComponent: () => import('./features/compounder/users-list.component').then(m => m.UsersListComponent) },
      { path: 'patients/:id',    loadComponent: () => import('./features/compounder/user-detail.component').then(m => m.UserDetailComponent) }
    ]
  },

  { path: '**', redirectTo: 'login' }
];
