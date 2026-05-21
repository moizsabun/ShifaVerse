export interface Shift {
  id: number;
  clinicId: number;
  name: string;
  label: string;
  startedAt: string;
  endedAt: string | null;
}

export function isShiftActive(s: Shift): boolean {
  return s.endedAt === null;
}
