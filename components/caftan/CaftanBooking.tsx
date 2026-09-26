'use client';

import { useState } from 'react';
import { MessageCircle, Check } from 'lucide-react';
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
      <p className="mt-1 text-sm text-[#475569]">{caftan.style} · {caftan.matiere}</p>


      <p className="mt-4 text-sm leading-6 text-[#475569]">{caftan.description}</p>

      {/* Mode */}
      <div className="mt-5 flex overflow-hidden rounded-2xl border border-[#e2d5c0] bg-[#f9f5f0]">
        {(['location', 'vente'] as Mode[]).map(m => (
          <button key={m} onClick={() => setMode(m)} aria-pressed={mode === m}
            className={`flex-1 py-2.5 text-sm font-bold transition-all duration-300 ${mode === m ? 'bg-[#c9903a] text-[#0f1f3d] shadow-md shadow-[#c9903a]/30' : 'text-[#475569] hover:text-[#0f1f3d]'}`}>
            {m === 'location' ? '📦 Location' : '🛍️ Achat'}
          </button>
        ))}
      </div>

      <div className="mt-5 space-y-1 overflow-hidden rounded-2xl bg-gradient-to-br from-[#fef3c7]/40 to-[#fde68a]/20 p-4">
        <div className="flex items-end gap-2">
          <span className="font-display text-4xl font-semibold text-[#c9903a]">{prix} €</span>
          {mode === 'location' && <span className="pb-1.5 text-sm font-semibold text-[#475569]">/ semaine</span>}
        </div>
        {mode === 'location' && (
          <p className="text-xs text-[#475569]">Caution {caftan.caution} € · restituée au retour</p>
        )}
      </div>

      {/* Tailles */}
      <fieldset className="mt-5">
        <legend className="text-xs font-bold uppercase tracking-wide text-[#475569]">Taille</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {ALL_SIZES.map((t, idx) => {
            const dispo = caftan.tailles.includes(t);
            return (
              <button key={t} onClick={() => dispo && setTaille(t)} disabled={!dispo}
                aria-pressed={taille === t}
                style={{ transitionDelay: `${idx * 30}ms` }}
                className={`group relative h-10 w-12 rounded-xl border text-sm font-bold transition-all duration-300 ${
                  !dispo ? 'cursor-not-allowed border-[#f1f5f9] bg-[#f8fafc] text-[#cbd5e1] line-through'
                  : taille === t ? 'border-[#c9903a] bg-[#c9903a] text-[#0f1f3d] shadow-lg shadow-[#c9903a]/40'
                  : 'border-[#e2d5c0] text-[#0f1f3d] hover:border-[#c9903a]/70 hover:bg-[#fef3c7]/30 hover:shadow-sm'}`}>
                {t}
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* Disponibilité — jamais de dates inventées */}
      <p className={`mt-5 animate-in fade-in slide-in-from-top-2 rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-300 ${caftan.dispo ? 'bg-[#ecfdf5] text-[#047857] ring-1 ring-[#6ee7b7]/50' : 'bg-[#fef2f2] text-[#b91c1c] ring-1 ring-[#fca5a5]/50'}`}>
        {caftan.dispo ? '✓ Disponible — expédition sous 48 h' : '⌚ Actuellement loué — demandez la liste d\'attente'}
      </p>

      <a href={whatsappLink(MARWA_WHATSAPP, message)} target="_blank" rel="noopener noreferrer"
        className="group mt-4 flex items-center justify-center gap-2 rounded-2xl bg-[#25d366] py-3.5 text-sm font-extrabold text-[#0f1f3d] shadow-lg shadow-[#25d366]/30 transition-all duration-300 hover:bg-[#1da851] hover:shadow-xl hover:shadow-[#25d366]/40 hover:scale-105">
        <MessageCircle size={16} className="transition-transform group-hover:scale-110" />
        {caftan.dispo ? 'Vérifier mes dates avec Marwa' : 'Être prévenue du retour'}
      </a>

      <ul className="mt-5 space-y-2 border-t border-[#f1f5f9] pt-4">
        {CONDITIONS.map((c, idx) => (
          <li key={c} className="flex items-start gap-2 text-xs leading-5 text-[#475569] animate-in fade-in"
              style={{ transitionDelay: `${idx * 50}ms` }}>
            <Check size={12} className="mt-0.5 shrink-0 text-[#c9903a]" /> {c}
          </li>
        ))}
      </ul>
    </div>
  );
}
