// Deux calculs de dates qui évitent les mauvaises surprises au retour au bled.
// Fonctions pures, sans réseau. Les dates sont des chaînes « AAAA-MM-JJ »
// comptées en jours calendaires, sans fuseau horaire.
//
// 1. Voiture en admission temporaire — guide « Marocains du Monde 2026 » de
//    l'ADII (p. 9 et 17) : 180 jours par année civile, en continu ou en
//    plusieurs fois ; une admission qui finit à partir du 1er décembre peut
//    être prolongée de 180 jours (comptés sur l'année suivante) sans pénalité ;
//    une voiture qui a fait ses 180 jours ne revient pas la même année ;
//    pénalités : 1 000 DH (≤ 30 jours de retard), 2 500 DH (31 à 60),
//    5 000 DH (61 jours à 6 mois), 10 000 DH (plus de 180 jours).
//    La date exacte fait foi sur la carte d'admission remise à l'entrée :
//    ce calcul est une estimation (jour d'entrée compté).
//
// 2. Passeport — France Diplomatie : il doit être valable pendant tout le
//    séjour au Maroc.

export const AT_DAYS_PER_YEAR = 180;

const ISO = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Jour calendaire (nombre de jours depuis 1970), ou null si la date n'existe pas. */
export function dayNumber(iso: string): number | null {
  const m = ISO.exec(iso);
  if (!m) return null;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const ms = Date.UTC(y, mo - 1, d);
  const back = new Date(ms);
  if (back.getUTCFullYear() !== y || back.getUTCMonth() !== mo - 1 || back.getUTCDate() !== d) return null;
  return Math.round(ms / 86_400_000);
}

export function isoFromDay(day: number): string {
  return new Date(day * 86_400_000).toISOString().slice(0, 10);
}

/** « 12 mars 2027 ». */
export function formatDateFr(iso: string): string {
  const day = dayNumber(iso);
  if (day === null) return iso;
  return new Date(day * 86_400_000).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
}

/** Barème du guide 2026, selon le nombre de jours de retard. */
export function atPenaltyDh(daysLate: number): number {
  if (daysLate <= 0) return 0;
  if (daysLate <= 30) return 1000;
  if (daysLate <= 60) return 2500;
  if (daysLate <= 180) return 5000;
  return 10000;
}

export type VehicleStay =
  | { status: 'invalid' }
  | { status: 'no-days-left'; year: number }
  | {
      status: 'ok' | 'late';
      /** Dernier jour où la voiture peut être au Maroc (estimation). */
      deadline: string;
      /** Jours restants à partir d'aujourd'hui, jour même compris (0 si en retard). */
      daysLeft: number;
      daysLate: number;
      penaltyDh: number;
      /** L'admission finit à partir du 1er décembre : prolongation possible sans pénalité. */
      decemberExtension: boolean;
    };

/**
 * Date limite de sortie d'une voiture entrée au Maroc le jour `entry`, quand
 * elle y a déjà passé `daysUsedBefore` jours la même année civile.
 */
export function vehicleStay(input: { entry: string; daysUsedBefore: number; today: string }): VehicleStay {
  const entry = dayNumber(input.entry);
  const today = dayNumber(input.today);
  const used = input.daysUsedBefore;
  if (entry === null || today === null || !Number.isInteger(used) || used < 0 || used > 366) return { status: 'invalid' };
  const year = Number(input.entry.slice(0, 4));
  const remaining = AT_DAYS_PER_YEAR - used;
  if (remaining <= 0) return { status: 'no-days-left', year };

  const deadlineDay = entry + remaining - 1;
  const deadline = isoFromDay(deadlineDay);
  const decemberExtension = deadline.slice(5) >= '12-01' || Number(deadline.slice(0, 4)) > year;
  const daysLate = Math.max(0, today - deadlineDay);
  const daysLeft = today < entry ? remaining : Math.max(0, deadlineDay - today + 1);
  return {
    status: daysLate > 0 ? 'late' : 'ok',
    deadline,
    daysLeft,
    daysLate,
    penaltyDh: atPenaltyDh(daysLate),
    decemberExtension,
  };
}

export type PassportCheck =
  | { status: 'invalid' }
  | { status: 'expired' }
  | { status: 'expires-during-trip'; expiry: string }
  | { status: 'ok'; daysAfterReturn: number };

/** Le passeport est-il valable jusqu'au jour du retour, inclus ? */
export function passportCheck(input: { expiry: string; returnDate: string; today: string }): PassportCheck {
  const expiry = dayNumber(input.expiry);
  const back = dayNumber(input.returnDate);
  const today = dayNumber(input.today);
  if (expiry === null || back === null || today === null || back < today) return { status: 'invalid' };
  if (expiry < today) return { status: 'expired' };
  if (expiry < back) return { status: 'expires-during-trip', expiry: input.expiry };
  return { status: 'ok', daysAfterReturn: expiry - back };
}
