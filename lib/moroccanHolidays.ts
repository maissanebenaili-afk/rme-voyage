// Moroccan public holidays.
//
// Civil holidays fall on a fixed day: they are generated for any year, so the
// calendar never runs empty (it used to hold 2026 only). Religious holidays
// depend on the sighting of the crescent and are announced by the Ministry of
// Habous a few days ahead: only announced dates are listed, never a guess.

export type Holiday = {
  name: string;
  emoji: string;
  date: string; // ISO date, Moroccan local day
  type: "islamic" | "national";
};

const CIVIL: { month: number; day: number; name: string; emoji: string }[] = [
  { month: 1, day: 1, name: "Jour de l'An", emoji: "🎆" },
  { month: 1, day: 11, name: "Manifeste de l'Indépendance", emoji: "📜" },
  { month: 1, day: 14, name: "Nouvel An amazigh", emoji: "🌾" },
  { month: 5, day: 1, name: "Fête du Travail", emoji: "🛠️" },
  { month: 7, day: 30, name: "Fête du Trône", emoji: "👑" },
  { month: 8, day: 14, name: "Allégeance de Oued Ed-Dahab", emoji: "🏜️" },
  { month: 8, day: 20, name: "Révolution du Roi et du Peuple", emoji: "✊" },
  { month: 8, day: 21, name: "Fête de la Jeunesse", emoji: "🎉" },
  // Instituted by royal decision on 2025-11-04, first observed in 2026
  // (decrees 2.25.1140 and 2.26.14).
  { month: 10, day: 31, name: "Fête de l'Unité", emoji: "🤝" },
  { month: 11, day: 6, name: "Anniversaire de la Marche Verte", emoji: "🟢" },
  { month: 11, day: 18, name: "Fête de l'Indépendance", emoji: "🇲🇦" },
];

const UNITY_DAY_FIRST_YEAR = 2026;

// Dates announced by the Ministry of Habous after the crescent was sighted.
// Add the next ones only once announced.
export const ANNOUNCED_RELIGIOUS: Holiday[] = [
  { name: "Aïd al-Fitr", emoji: "🎉", date: "2026-03-20", type: "islamic" }, // announced 2026-03-19
  { name: "Aïd al-Adha", emoji: "🐑", date: "2026-05-27", type: "islamic" }, // announced 2026-05-17
  { name: "Jour de l'An hégirien", emoji: "🌙", date: "2026-06-17", type: "islamic" }, // announced 2026-06-15
  { name: "Aïd al-Mawlid", emoji: "🕌", date: "2026-08-25", type: "islamic" }, // announced 2026-08-13
];

const pad = (n: number) => String(n).padStart(2, "0");

export function civilHolidays(year: number): Holiday[] {
  return CIVIL.filter((h) => !(h.month === 10 && h.day === 31 && year < UNITY_DAY_FIRST_YEAR)).map((h) => ({
    name: h.name,
    emoji: h.emoji,
    date: `${year}-${pad(h.month)}-${pad(h.day)}`,
    type: "national",
  }));
}

/** Whole days from `now` to the start of `date` (local time), rounded up. */
export function daysUntil(date: string, now: number): number {
  const target = new Date(date + "T00:00:00");
  return Math.ceil((target.getTime() - now) / (1000 * 60 * 60 * 24));
}

/**
 * Holidays from yesterday on, over this year and the next, sorted, at most
 * `limit`. Also tells which shown year has no announced religious date yet.
 */
export function upcomingHolidays(now: number, limit = 8): { holidays: Holiday[]; religiousPendingYears: number[] } {
  const year = new Date(now).getFullYear();
  const years = [year, year + 1];
  const all = [...years.flatMap(civilHolidays), ...ANNOUNCED_RELIGIOUS]
    .filter((h) => daysUntil(h.date, now) >= -1)
    .sort((a, b) => a.date.localeCompare(b.date));
  const holidays = all.slice(0, limit);
  const shownYears = new Set(holidays.map((h) => Number(h.date.slice(0, 4))));
  // A year with no announced religious date at all: its Aïd are still to come
  // but not listed, so the page must say so.
  const religiousPendingYears = years.filter(
    (y) => shownYears.has(y) && !ANNOUNCED_RELIGIOUS.some((h) => h.date.startsWith(`${y}-`)),
  );
  return { holidays, religiousPendingYears };
}
