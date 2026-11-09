// Calendrier « Quand partir ? » : l'affluence prévue jour par jour sur un mois,
// pour choisir sa date de traversée. Fonctions pures, sans réseau : tout vient
// de lib/crossingPressure.ts (calendrier seul, jamais une donnée en direct).

import { crossingPressure, type PressureLevel } from "@/lib/crossingPressure";
import { ANNOUNCED_RELIGIOUS } from "@/lib/moroccanHolidays";

export interface CalendarDay {
  /** « AAAA-MM-JJ ». */
  iso: string;
  day: number;
  /** 0 = lundi … 6 = dimanche. */
  weekday: number;
  level: PressureLevel;
  reason: string;
}

export interface YearMonth {
  year: number;
  /** 1 = janvier … 12 = décembre. */
  month: number;
}

const pad = (n: number) => String(n).padStart(2, "0");

/** Tous les jours du mois, dans l'ordre, avec leur niveau d'affluence. */
export function monthDays({ year, month }: YearMonth): CalendarDay[] {
  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) {
    throw new Error(`Mois invalide : ${year}-${month}`);
  }
  const count = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const days: CalendarDay[] = [];
  for (let day = 1; day <= count; day++) {
    const iso = `${year}-${pad(month)}-${pad(day)}`;
    const { level, reason } = crossingPressure(iso);
    // getUTCDay : 0 = dimanche. On décale pour commencer la semaine le lundi.
    const weekday = (new Date(Date.UTC(year, month - 1, day)).getUTCDay() + 6) % 7;
    days.push({ iso, day, weekday, level, reason });
  }
  return days;
}

/** Mois décalé de `delta` mois (négatif = en arrière), en changeant d'année au besoin. */
export function shiftMonth({ year, month }: YearMonth, delta: number): YearMonth {
  const index = year * 12 + (month - 1) + delta;
  return { year: Math.floor(index / 12), month: (index % 12 + 12) % 12 + 1 };
}

/** Nombre de jours par niveau, pour le résumé du mois. */
export function countByLevel(days: CalendarDay[]): Record<PressureLevel, number> {
  const counts: Record<PressureLevel, number> = { calme: 0, charge: 0, "tres-charge": 0 };
  for (const d of days) counts[d.level]++;
  return counts;
}

/**
 * Vrai si les dates des Aïd de cette année sont déjà annoncées. Sinon le
 * calendrier ne peut pas en tenir compte et la page doit le dire.
 */
export function eidAnnounced(year: number): boolean {
  return ANNOUNCED_RELIGIOUS.some((h) => h.name.startsWith("Aïd al-") && h.date.startsWith(`${year}-`));
}
