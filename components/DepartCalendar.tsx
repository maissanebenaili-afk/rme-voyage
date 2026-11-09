'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, MessageCircle } from 'lucide-react';
import { nearestCalmerDay, PRESSURE_RULES, type PressureLevel } from '@/lib/crossingPressure';
import { countByLevel, eidAnnounced, monthDays, shiftMonth, type YearMonth } from '@/lib/departureCalendar';
import { whatsappShareUrl } from '@/components/WhatsAppShare';

const WEEKDAYS = ['lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.', 'dim.'];

// Le niveau n'est jamais porté par la couleur seule : chaque case a aussi un signe.
const STYLE: Record<PressureLevel, { cell: string; sign: string }> = {
  calme: { cell: 'bg-emerald-100 text-emerald-950 ring-emerald-300', sign: '✓' },
  charge: { cell: 'bg-amber-100 text-amber-950 ring-amber-400', sign: '!' },
  'tres-charge': { cell: 'bg-red-200 text-red-950 ring-red-400', sign: '!!' },
};

const labelOf = (level: PressureLevel) => PRESSURE_RULES.find((r) => r.level === level)!.label;

const utc = (iso: string) => new Date(`${iso}T00:00:00Z`);
const longDate = (iso: string) =>
  new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(utc(iso));
const monthTitle = ({ year, month }: YearMonth) =>
  new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(Date.UTC(year, month - 1, 1)));

const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;

function validDay(value: string | null): string | null {
  if (!value || !ISO_DAY.test(value)) return null;
  const date = utc(value);
  return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value ? null : value;
}

const navButton =
  'inline-flex min-h-12 min-w-12 items-center justify-center rounded-xl border border-slate-300 bg-white text-[#0f1f3d] disabled:opacity-40';

export default function DepartCalendar({ initial }: { initial: YearMonth }) {
  const [shown, setShown] = useState<YearMonth>(initial);
  const [selected, setSelected] = useState<string | null>(null);

  // Un lien partagé (« ?jour=2027-07-10 ») ouvre directement ce jour.
  useEffect(() => {
    const day = validDay(new URLSearchParams(window.location.search).get('jour'));
    if (!day) return;
    setSelected(day);
    setShown({ year: Number(day.slice(0, 4)), month: Number(day.slice(5, 7)) });
  }, []);

  const days = monthDays(shown);
  const counts = countByLevel(days);
  const picked = selected ? days.find((d) => d.iso === selected) ?? null : null;
  const calmer = picked ? nearestCalmerDay(picked.iso) : null;

  function open(iso: string) {
    setSelected(iso);
    setShown({ year: Number(iso.slice(0, 4)), month: Number(iso.slice(5, 7)) });
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <button type="button" className={navButton} aria-label="Mois précédent" onClick={() => setShown(shiftMonth(shown, -1))}>
          <ChevronLeft size={22} aria-hidden="true" />
        </button>
        <h2 className="text-xl font-black capitalize" aria-live="polite">
          {monthTitle(shown)}
        </h2>
        <button type="button" className={navButton} aria-label="Mois suivant" onClick={() => setShown(shiftMonth(shown, 1))}>
          <ChevronRight size={22} aria-hidden="true" />
        </button>
      </div>

      <p className="mt-2 text-base text-slate-700">
        Ce mois-ci : {counts.calme} jours calmes, {counts.charge} chargés, {counts['tres-charge']} très chargés.
      </p>

      <div className="mt-4 grid grid-cols-7 gap-1.5 text-center" role="group" aria-label={`Jours de ${monthTitle(shown)}`}>
        {WEEKDAYS.map((w) => (
          <span key={w} aria-hidden="true" className="text-xs font-bold uppercase text-slate-600">
            {w}
          </span>
        ))}
        {days.map((d) => (
          <button
            key={d.iso}
            type="button"
            style={d.day === 1 ? { gridColumnStart: d.weekday + 1 } : undefined}
            aria-pressed={d.iso === selected}
            aria-label={`${longDate(d.iso)} : ${labelOf(d.level)}`}
            onClick={() => setSelected(d.iso)}
            className={`flex min-h-12 flex-col items-center justify-center rounded-xl text-base font-bold ring-1 ${STYLE[d.level].cell} ${
              d.iso === selected ? 'outline outline-4 outline-offset-1 outline-[#0f1f3d]' : ''
            }`}
          >
            {d.day}
            <span aria-hidden="true" className="text-xs leading-none">
              {STYLE[d.level].sign}
            </span>
          </button>
        ))}
      </div>

      <ul className="mt-4 space-y-1 text-sm text-slate-700">
        {PRESSURE_RULES.map((rule) => (
          <li key={rule.level} className="flex items-start gap-2">
            <span aria-hidden="true" className={`mt-0.5 inline-flex h-6 w-8 shrink-0 items-center justify-center rounded-md text-xs font-bold ring-1 ${STYLE[rule.level].cell}`}>
              {STYLE[rule.level].sign}
            </span>
            <span>
              <strong>{rule.label}</strong> : {rule.when}.
            </span>
          </li>
        ))}
      </ul>

      {!eidAnnounced(shown.year) && (
        <p className="mt-3 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950">
          Les dates des Aïd de {shown.year} ne sont pas encore annoncées : ce calendrier n&apos;en tient pas compte pour
          l&apos;instant.
        </p>
      )}

      <div aria-live="polite" className="mt-6">
        {picked ? (
          <section aria-labelledby="jour-title" className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 id="jour-title" className="text-xl font-black capitalize">
              {longDate(picked.iso)}
            </h2>
            <p className="mt-2 text-lg">
              <strong>{labelOf(picked.level)}</strong> — {picked.reason}.
            </p>
            {calmer && (
              <p className="mt-3 text-base">
                Jour plus calme le plus proche :{' '}
                <button type="button" className="font-bold text-blue-800 underline" onClick={() => open(calmer.date)}>
                  {longDate(calmer.date)}
                </button>{' '}
                ({labelOf(calmer.level).toLowerCase()}).
              </p>
            )}
            <div className="mt-4 flex flex-wrap gap-3">
              <a
                href={whatsappShareUrl(
                  `Pour la traversée vers le Maroc, le ${longDate(picked.iso)} s'annonce « ${labelOf(picked.level).toLowerCase()} ». Le calendrier :`,
                  `/quand-partir?jour=${picked.iso}`,
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#14532d] px-4 text-base font-bold text-white"
              >
                <MessageCircle size={18} aria-hidden="true" /> Envoyer ce jour à la famille
              </a>
              <Link href="/trajet" className="inline-flex min-h-12 items-center rounded-xl bg-[#0f1f3d] px-4 text-base font-bold text-white">
                Voir mon trajet et les ferries
              </Link>
            </div>
          </section>
        ) : (
          <p className="rounded-2xl border border-dashed border-slate-300 p-5 text-base text-slate-700">
            Touchez un jour pour voir le détail et l&apos;envoyer à la famille.
          </p>
        )}
      </div>
    </div>
  );
}
