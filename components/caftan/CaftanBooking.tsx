'use client';

import { useState } from 'react';
import { MessageCircle, Star, Check } from 'lucide-react';
import type { Caftan, Mode } from '@/lib/caftans';
import { CONDITIONS } from '@/lib/caftans';
import { MARWA_WHATSAPP, whatsappLink } from '@/lib/partners';
import { siteUrl } from '@/lib/siteUrl';

const ALL_SIZES = ['XS', 'S', 'M', 'L', 'XL'];

export default function CaftanBooking({ caftan }: { caftan: Caftan }) {
  const [mode, setMode] = useState<Mode>('location');
  const [taille, setTaille] = useState<string>(caftan.tailles[0] ?? '');

  const prix = mode === 'location' ? caftan.prixLocation : caftan.prixVente;

  // L'URL de la page est le détail le plus utile du message : Marwa reçoit un
  // lien cliquable vers le modèle exact au lieu d'un nom à retrouver.
  const message = caftan.dispo
    ? `Bonjour Marwa, je souhaite réserver le Caftan ${caftan.name} (${mode === 'location' ? 'location' : 'achat'}${taille ? `, taille ${taille}` : ''}) — ${siteUrl}/marwa-caftan/${caftan.id}`
    : `Bonjour Marwa, le Caftan ${caftan.name} est indiqué indisponible — pouvez-vous me prévenir quand il se libère ? ${siteUrl}/marwa-caftan/${caftan.id}`;

  return (
    <div className="rounded-3xl border border-[#e2d5c0] bg-white p-6">
      <h1 className="font-display text-3xl font-semibold tracking-tight text-[#0f1f3d]">
        Caftan {caftan.name}
      </h1>
      <p className="mt-1 text-sm text-[#64748b]">{caftan.style} · {caftan.matiere}</p>

      <div className="mt-2 flex items-center gap-1.5">
        <div className="flex">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} size={12} fill={i < caftan.stars ? '#c9903a' : 'none'}
              className={i < caftan.stars ? 'text-[#c9903a]' : 'text-[#e2e8f0]'} />
          ))}
        </div>
        <span className="text-[11px] text-[#94a3b8]">({caftan.avis} avis)</span>
      </div>

      <p className="mt-4 text-sm leading-6 text-[#475569]">{caftan.description}</p>

      {/* Mode */}
      <div className="mt-5 flex overflow-hidden rounded-2xl border border-[#e2d5c0]">
        {(['location', 'vente'] as Mode[]).map(m => (
          <button key={m} onClick={() => setMode(m)} aria-pressed={mode === m}
            className={`flex-1 py-2.5 text-sm font-bold transition ${mode === m ? 'bg-[#c9903a] text-white' : 'text-[#64748b] hover:text-[#0f1f3d]'}`}>
            {m === 'location' ? '📦 Location' : '🛍️ Achat'}
          </button>
        ))}
      </div>

      <div className="mt-4 flex items-end gap-2">
        <span className="font-display text-4xl font-semibold text-[#c9903a]">{prix} €</span>
        {mode === 'location' && <span className="pb-1.5 text-sm font-semibold text-[#94a3b8]">/ semaine</span>}
      </div>
      {mode === 'location' && (
        <p className="mt-0.5 text-xs text-[#94a3b8]">Caution {caftan.caution} € · restituée au retour</p>
      )}

      {/* Tailles */}
      <fieldset className="mt-5">
        <legend className="text-xs font-bold uppercase tracking-wide text-[#64748b]">Taille</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {ALL_SIZES.map(t => {
            const dispo = caftan.tailles.includes(t);
            return (
              <button key={t} onClick={() => dispo && setTaille(t)} disabled={!dispo}
                aria-pressed={taille === t}
                className={`h-10 w-12 rounded-xl border text-sm font-bold transition ${
                  !dispo ? 'cursor-not-allowed border-[#f1f5f9] text-[#cbd5e1] line-through'
                  : taille === t ? 'border-[#c9903a] bg-[#c9903a] text-white'
                  : 'border-[#e2d5c0] text-[#0f1f3d] hover:border-[#c9903a]/60'}`}>
                {t}
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* Disponibilité — jamais de dates inventées */}
      <p className={`mt-5 rounded-2xl px-4 py-3 text-sm font-semibold ${caftan.dispo ? 'bg-[#ecfdf5] text-[#047857]' : 'bg-[#fef2f2] text-[#b91c1c]'}`}>
        {caftan.dispo ? 'Disponible — expédition sous 48 h' : 'Actuellement loué — demandez la liste d\'attente'}
      </p>

      <a href={whatsappLink(MARWA_WHATSAPP, message)} target="_blank" rel="noopener noreferrer"
        className="mt-4 flex items-center justify-center gap-2 rounded-2xl bg-[#25d366] py-3.5 text-sm font-extrabold text-white transition hover:bg-[#1da851]">
        <MessageCircle size={16} />
        {caftan.dispo ? 'Vérifier mes dates avec Marwa' : 'Être prévenue du retour'}
      </a>

      <ul className="mt-5 space-y-1.5 border-t border-[#f1f5f9] pt-4">
        {CONDITIONS.map(c => (
          <li key={c} className="flex items-start gap-2 text-xs leading-5 text-[#64748b]">
            <Check size={12} className="mt-0.5 shrink-0 text-[#c9903a]" /> {c}
          </li>
        ))}
      </ul>
    </div>
  );
}
