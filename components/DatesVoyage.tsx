'use client';

import { useEffect, useState } from 'react';
import { BookUser, CarFront } from 'lucide-react';
import { formatDateFr, passportCheck, vehicleStay } from '@/lib/datesVoyage';

function todayIso(): string {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

const card = 'rounded-2xl border border-slate-200 bg-white p-5';
const input = 'mt-1 block min-h-12 w-full rounded-xl border border-slate-300 px-3 text-base';
const label = 'mt-3 block text-base font-semibold text-slate-800';

function Result({ tone, children }: { tone: 'good' | 'warn' | 'bad'; children: React.ReactNode }) {
  const colors = {
    good: 'bg-emerald-50 text-emerald-900 border-emerald-200',
    warn: 'bg-amber-50 text-amber-900 border-amber-200',
    bad: 'bg-red-50 text-red-900 border-red-200',
  }[tone];
  return <div className={`mt-4 rounded-xl border p-4 text-base leading-relaxed ${colors}`}>{children}</div>;
}

export function CompteurVoiture() {
  const [today, setToday] = useState('');
  const [entry, setEntry] = useState('');
  const [usedBefore, setUsedBefore] = useState('0');
  useEffect(() => setToday(todayIso()), []);

  const used = usedBefore.trim() === '' ? 0 : Number(usedBefore);
  const stay = entry && today ? vehicleStay({ entry, daysUsedBefore: used, today }) : null;

  return (
    <section id="voiture" aria-labelledby="voiture-title" className={`${card} scroll-mt-6`}>
      <h2 id="voiture-title" className="flex items-center gap-2 text-xl font-black text-[#0f1f3d]">
        <CarFront size={22} aria-hidden="true" /> Ma voiture au Maroc{'\u00a0'}: jusqu&apos;à quand{'\u00a0'}?
      </h2>
      <p className="mt-1 text-sm text-slate-600">
        Une voiture immatriculée à l&apos;étranger peut rester 180 jours par année civile. Au-delà : amende de{' '}
        {'1\u00a0000 à 10\u00a0000\u00a0DH'}.
      </p>
      <label className={label}>
        Date d&apos;entrée au Maroc
        <input type="date" value={entry} onChange={(e) => setEntry(e.target.value)} className={input} />
      </label>
      <label className={label}>
        Jours déjà passés au Maroc avec cette voiture cette année (avant ce séjour)
        <input
          type="number"
          inputMode="numeric"
          min={0}
          max={366}
          value={usedBefore}
          onChange={(e) => setUsedBefore(e.target.value)}
          className={input}
        />
      </label>

      <div aria-live="polite">
        {stay?.status === 'invalid' && <Result tone="warn">Vérifiez la date et le nombre de jours.</Result>}
        {stay?.status === 'no-days-left' && (
          <Result tone="bad">
            Plus aucun jour pour {stay.year} : une voiture qui a déjà passé 180 jours au Maroc ne peut pas y revenir
            avant le 1er janvier, même conduite par quelqu&apos;un d&apos;autre avec une procuration.
          </Result>
        )}
        {(stay?.status === 'ok' || stay?.status === 'late') && (
          <Result tone={stay.status === 'late' ? 'bad' : stay.daysLeft <= 15 ? 'warn' : 'good'}>
            <p>
              Dernier jour au Maroc : <strong>{formatDateFr(stay.deadline)}</strong>
              {stay.status === 'ok' && (
                <>
                  {' '}
                  · encore <strong>{stay.daysLeft} jour{stay.daysLeft > 1 ? 's' : ''}</strong>
                </>
              )}
            </p>
            {stay.status === 'late' && (
              <p className="mt-2">
                Délai dépassé de <strong>{stay.daysLate} jours</strong> : amende prévue{' '}
                <strong>{`${stay.penaltyDh.toLocaleString('fr-FR')}\u00a0DH`}</strong>. Présentez-vous de vous-même au bureau de
                douane le plus proche : la voiture ne doit plus rouler sans son accord.
              </p>
            )}
            {stay.decemberExtension && stay.status === 'ok' && (
              <p className="mt-2">
                Votre admission se termine à partir du 1er décembre : la douane peut la prolonger de 180 jours, sans
                pénalité, sans quitter le Maroc. Faites la demande à partir du 1er décembre, avec la carte grise et la
                carte d&apos;admission temporaire.
              </p>
            )}
            <p className="mt-2 text-sm">
              Estimation (jour d&apos;entrée compté). La date exacte est écrite sur votre carte d&apos;admission
              temporaire.
            </p>
          </Result>
        )}
      </div>
      <p className="mt-3 text-xs text-slate-600">Source : guide « Marocains du Monde 2026 » de la douane marocaine.</p>
    </section>
  );
}

export function VerifPasseport() {
  const [today, setToday] = useState('');
  const [expiry, setExpiry] = useState('');
  const [returnDate, setReturnDate] = useState('');
  useEffect(() => setToday(todayIso()), []);

  const check = expiry && returnDate && today ? passportCheck({ expiry, returnDate, today }) : null;

  return (
    <section id="passeport" aria-labelledby="passeport-title" className={`${card} scroll-mt-6`}>
      <h2 id="passeport-title" className="flex items-center gap-2 text-xl font-black text-[#0f1f3d]">
        <BookUser size={22} aria-hidden="true" /> Mon passeport est-il valable ?
      </h2>
      <p className="mt-1 text-sm text-slate-600">Il doit être valable pendant tout le séjour au Maroc. Vérifiez aussi ceux des enfants.</p>
      <label className={label}>
        Date d&apos;expiration du passeport
        <input type="date" value={expiry} onChange={(e) => setExpiry(e.target.value)} className={input} />
      </label>
      <label className={label}>
        Date du retour
        <input type="date" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} className={input} />
      </label>

      <div aria-live="polite">
        {check?.status === 'invalid' && <Result tone="warn">La date du retour doit être aujourd&apos;hui ou plus tard.</Result>}
        {check?.status === 'expired' && (
          <Result tone="bad">Ce passeport a expiré : il faut le refaire avant de partir.</Result>
        )}
        {check?.status === 'expires-during-trip' && (
          <Result tone="bad">
            Il expire le <strong>{formatDateFr(check.expiry)}</strong>, avant votre retour : faites-le renouveler avant
            de partir.
          </Result>
        )}
        {check?.status === 'ok' && (
          <Result tone="good">
            Valable pour tout le séjour
            {check.daysAfterReturn > 0 ? `, et encore ${check.daysAfterReturn} jours après le retour` : ', jusqu’au jour du retour'}.
          </Result>
        )}
      </div>
      <p className="mt-3 text-xs text-slate-600">Source : France Diplomatie, conseils aux voyageurs (Maroc).</p>
    </section>
  );
}
