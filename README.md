# MediCare+ Clinic Management System

A beautifully designed, fully functional Angular 17+ frontend for clinic management. Built with standalone components, Angular signals, Tailwind CSS, and localStorage persistence.

> **Note:** This is a frontend-only application. State persists via `localStorage`. When you build your .NET Core backend, simply replace the in-memory services in `src/app/core/services/` with HTTP API calls.

## Features

### 🩺 Compounder Module
- **Patient Registration** — Create new patients with name, mobile number, and age (validated)
- **Shift Management** — Daily Morning (9 AM – 2 PM) and Evening (6 PM – 11 PM) shifts with live status
- **Appointment Booking** — Including advance bookings with auto-incrementing sequence numbers per shift+date
- **Strict Validation** — Passed shifts and past dates are blocked from booking and cancellation
- **Cancel Appointments** — Only pending appointments in active shifts
- **Patient History** — View all past visits with diagnoses, symptoms, and prescriptions
- **Shift History** — Daily breakdown of all shifts

### 👨‍⚕️ Doctor Module
- **Today's Queue** — All pending appointments sorted by shift and sequence
- **Patient Examination** — Searchable predefined lists for:
  - Symptoms (23 options)
  - Diagnoses (20 options)
  - Medications (14 options with default dosages)
- **Doctor's Notes** — Free-text field for additional instructions
- **Prescription Generation** — Beautiful thermal-printer-formatted receipt
- **Print to Thermal Printer** — Optimized 80mm CSS print styles
- **Past Visits** — Complete history of all completed treatments
- **Patient Records** — Full medical history per patient

## Tech Stack

- **Angular 17.3** with standalone components
- **Angular Signals** for reactive state management
- **Tailwind CSS 3.4** for styling
- **TypeScript 5.4** with strict mode
- **localStorage** for persistence
- **No external state library** — pure Angular signals + RxJS

## Quick Start

```bash
# Install dependencies
npm install

# Start development server (auto-opens http://localhost:4200)
npm start

# Build for production
npm run build
```

## Project Structure

```
src/
├── app/
│   ├── core/
│   │   ├── models/              # TypeScript interfaces
│   │   │   ├── user.model.ts
│   │   │   ├── shift.model.ts
│   │   │   ├── appointment.model.ts
│   │   │   └── treatment.model.ts
│   │   ├── services/            # Signal-based services (replace with API later)
│   │   │   ├── user.service.ts
│   │   │   ├── appointment.service.ts
│   │   │   └── notification.service.ts
│   │   └── constants/
│   │       └── medical-data.ts  # Predefined diagnoses, symptoms, medications
│   ├── features/
│   │   ├── auth/
│   │   │   └── login.component.ts          # Module selector
│   │   ├── compounder/
│   │   │   ├── compounder-layout.component.ts
│   │   │   ├── dashboard.component.ts
│   │   │   ├── new-user.component.ts
│   │   │   ├── users-list.component.ts
│   │   │   ├── user-detail.component.ts
│   │   │   ├── new-appointment.component.ts
│   │   │   ├── appointments-list.component.ts
│   │   │   └── shift-history.component.ts
│   │   └── doctor/
│   │       ├── doctor-layout.component.ts
│   │       ├── doctor-dashboard.component.ts
│   │       ├── doctor-queue.component.ts
│   │       ├── treatment.component.ts      # Main examination view
│   │       ├── prescription.component.ts   # Thermal printer view
│   │       └── doctor-history.component.ts
│   ├── app.component.ts         # Root + global toast notifications
│   ├── app.config.ts            # Angular providers + router
│   └── app.routes.ts            # Lazy-loaded routes
├── styles.css                   # Tailwind + custom styles + print rules
├── index.html
└── main.ts
```

## Strict Shift Validation Logic

The `AppointmentService` enforces:

```typescript
// Cannot book if shift end time has passed
isShiftPassed(date, shift): boolean

// Cannot book past dates  
createAppointment() throws if date < today

// Cannot cancel if shift has passed
cancelAppointment() throws if isShiftPassed()

// Sequence auto-increments per (date + shift)
// Advance bookings get their own sequence chain
getNextSequence(date, shift): number
```

## Sequence Number Logic

- Sequence numbers are **independent per shift + date combination**
- Booking for `2026-05-20 morning` starts at `#1`
- Booking again for `2026-05-20 morning` becomes `#2`
- Booking for `2026-05-20 evening` starts at `#1` (separate chain)
- Booking for `2026-05-25 morning` starts at `#1` (separate chain)
- Cancelled appointments do **not** decrement the sequence

## Thermal Printer

The prescription view at `/doctor/prescription/:id` uses CSS `@media print` rules to format output for 80mm thermal printers:

- `@page { size: 80mm auto; margin: 5mm; }`
- All non-receipt elements hidden via `.no-print`
- Receipt isolated via `.print-area` class
- Dashed dividers render as printer-friendly borders

Click **"Print to Thermal Printer"** or use `Ctrl+P` / `Cmd+P`.

## Connecting Your .NET Core Backend

Replace the three services in `src/app/core/services/` to call your API:

```typescript
// Before (in-memory)
addUser(user) {
  this.usersSignal.update(arr => [...arr, newUser]);
}

// After (HTTP)
addUser(user) {
  return this.http.post<User>('/api/users', user).pipe(
    tap(saved => this.usersSignal.update(arr => [...arr, saved]))
  );
}
```

The components and routing don't need to change.

## Seeded Data

The app starts with 4 sample patients and 4 sample appointments (1 with a completed treatment). Clear `localStorage` to reset:

```js
localStorage.clear()  // Then refresh the page
```

## Design System

- **Display Font:** Fraunces (serif)
- **Body Font:** Plus Jakarta Sans
- **Mono Font:** JetBrains Mono
- **Brand Colors:** Emerald + Teal gradient
- **Compounder Theme:** Light, clean
- **Doctor Theme:** Dark sidebar, focused workspace

Built with ❤️ for clean clinical workflows.
