'use client';

import { useState } from 'react';
import { MessageCircle, Percent, ShieldCheck, Camera, Handshake } from 'lucide-react';
import { COMMISSION } from '@/lib/caftans';
import { MARWA_WHATSAPP, whatsappLink } from '@/lib/partners';

const ETAPES = [
  { icon: Camera, t: '1. Décrivez votre caftan', d: 'Modèle, taille, état et prix souhaité — deux minutes.' },
  { icon: Handshake, t: '2. Marwa vérifie', d: 'Elle vous répond sous 24 h et publie l\'annonce après validation.' },
  { icon: Percent, t: '3. Vous êtes payée', d: `Vous touchez votre prix, la plateforme retient ${COMMISSION.pct} % sur la location.` },
];

const MODES = ['Location', 'Vente', 'Échange'];
const ETATS = ['Neuf avec étiquette', 'Excellent état', 'Bon état', 'Porté'];
const TAILLES = ['XS', 'S', 'M', 'L', 'XL'];

export default function CaftanMarketplace() {
  const [modele, setModele] = useState('');
  const [taille, setTaille] = useState('');
  const [etat, setEtat] = useState('');
  const [mode, setMode] = useState('Location');
  const [prix, setPrix] = useState('');
  const [ville, setVille] = useState('');
  const [prenom, setPrenom] = useState('');

  const pret = modele.trim() !== '' && taille !== '' && etat !== '' && ville.trim() !== '';

  const message = [
    `Bonjour Marwa, je souhaite déposer mon caftan sur RME Voyage.`,
    ``,
    `Modèle : ${modele || '—'}`,
    `Taille : ${taille || '—'}`,
    `État : ${etat || '—'}`,
    `Mode : ${mode}`,
    prix ? `Prix souhaité : ${prix} €` : null,
    `Ville : ${ville || '—'}`,
    prenom ? `Prénom : ${prenom}` : null,
  ].filter(Boolean).join('\n');

  const field = 'w-full rounded-xl border border-[#e2d5c0] bg-white px-3 py-2.5 text-sm text-[#0f1f3d] outline-none transition-all duration-200 focus:border-[#c9903a] focus:ring-2 focus:ring-[#c9903a]/30 focus:shadow-md focus:shadow-[#c9903a]/10 hover:border-[#c9903a]/40';
  const label = 'block text-xs font-bold uppercase tracking-wide text-[#64748b]';

  return (
    <section id="communaute" className="scroll-mt-6 border-t border-[#e2d5c0] bg-white py-14">
      <div className="mx-auto max-w-5xl px-5 sm:px-8">
        <p className="text-sm font-extrabold uppercase tracking-[.16em] text-[#b45309]">Le dressing partagé</p>
        <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-[#0f1f3d] sm:text-4xl">
          Votre caftan dort dans l&apos;armoire ?
        </h2>
        <p className="mt-3 max-w-2xl text-[#475569]">
          Mettez-le en location et laissez-le travailler. Vous fixez votre prix, Marwa s&apos;occupe
          du reste — annonce, mise en relation, suivi de la caution.
        </p>

        <div className="mt-8 grid gap-5 sm:grid-cols-3">
          {ETAPES.map(({ icon: Icon, t, d }, idx) => (
            <div key={t} className="group animate-in fade-in slide-in-from-bottom-4 rounded-2xl border border-[#e2d5c0] bg-[#fdf8f2] p-5 transition-all duration-300 hover:border-[#c9903a]/60 hover:shadow-lg hover:shadow-[#c9903a]/10"
              style={{ transitionDelay: `${idx * 100}ms` }}>
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#fef3c7] transition-transform group-hover:scale-110">
                <Icon size={18} className="text-[#c9903a]" />
              </div>
              <h3 className="mt-3 text-sm font-black text-[#0f1f3d]">{t}</h3>
              <p className="mt-1.5 text-xs leading-5 text-[#64748b]">{d}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_.8fr] lg:items-start">
          {/* Formulaire */}
          <div className="rounded-3xl border border-[#e2d5c0] bg-[#fdf8f2] p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className={label} htmlFor="mk-modele">Votre caftan</label>
                <input id="mk-modele" value={modele} onChange={e => setModele(e.target.value)}
                  placeholder="Ex. Takchita brodée main, bleu nuit" className={`mt-1.5 ${field}`} />
              </div>

              <div>
                <label className={label} htmlFor="mk-taille">Taille</label>
                <select id="mk-taille" value={taille} onChange={e => setTaille(e.target.value)} className={`mt-1.5 ${field}`}>
                  <option value="">Choisir…</option>
                  {TAILLES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div>
                <label className={label} htmlFor="mk-etat">État</label>
                <select id="mk-etat" value={etat} onChange={e => setEtat(e.target.value)} className={`mt-1.5 ${field}`}>
                  <option value="">Choisir…</option>
                  {ETATS.map(e2 => <option key={e2} value={e2}>{e2}</option>)}
                </select>
              </div>

              <div>
                <label className={label} htmlFor="mk-mode">Je propose en</label>
                <select id="mk-mode" value={mode} onChange={e => setMode(e.target.value)} className={`mt-1.5 ${field}`}>
                  {MODES.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              <div>
                <label className={label} htmlFor="mk-prix">Prix souhaité (€)</label>
                <input id="mk-prix" inputMode="numeric" value={prix} onChange={e => setPrix(e.target.value.replace(/\D/g, ''))}
                  placeholder="120" className={`mt-1.5 ${field}`} />
              </div>

              <div>
                <label className={label} htmlFor="mk-ville">Ville</label>
                <input id="mk-ville" value={ville} onChange={e => setVille(e.target.value)}
                  placeholder="Lyon" className={`mt-1.5 ${field}`} />
              </div>

              <div>
                <label className={label} htmlFor="mk-prenom">Prénom (optionnel)</label>
                <input id="mk-prenom" value={prenom} onChange={e => setPrenom(e.target.value)}
                  placeholder="Samira" className={`mt-1.5 ${field}`} />
              </div>
            </div>

            {pret ? (
              <a
                href={whatsappLink(MARWA_WHATSAPP, message)}
                target="_blank"
                rel="noopener noreferrer"
                className="group mt-5 flex items-center justify-center gap-2 rounded-2xl bg-[#25d366] py-3.5 text-sm font-extrabold text-white shadow-lg shadow-[#25d366]/30 transition-all duration-300 hover:bg-[#1da851] hover:shadow-xl hover:shadow-[#25d366]/40 hover:scale-105"
              >
                <MessageCircle size={16} className="transition-transform group-hover:scale-110" /> Envoyer mon annonce à Marwa
              </a>
            ) : (
              <button
                type="button"
                disabled
                className="mt-5 flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-2xl bg-[#e2e8f0] py-3.5 text-sm font-extrabold text-[#94a3b8] transition-opacity duration-200"
              >
                <MessageCircle size={16} /> Remplissez modèle, taille, état et ville
              </button>
            )}

            <p className="mt-2.5 text-center text-[11px] leading-4 text-[#94a3b8]">
              Votre annonce part sur WhatsApp. Marwa vous répond sous 24 h et la met en ligne après
              validation. Aucune donnée n&apos;est enregistrée sur ce site.
            </p>
          </div>

          {/* Commission */}
          <div className="rounded-3xl border border-[#c9903a]/30 bg-[#0f1f3d] p-6">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#c9903a]">
                <ShieldCheck size={20} className="text-[#0f1f3d]" />
              </div>
              <div>
                <p className="font-display text-2xl font-semibold text-white">{COMMISSION.pct} %</p>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-[#fde68a]/80">
                  de commission sur la location
                </p>
              </div>
            </div>

            <p className="mt-4 text-sm leading-6 text-white/65">Ce que cela couvre :</p>
            <ul className="mt-2 space-y-1.5">
              {COMMISSION.couvre.map(c => (
                <li key={c} className="flex items-start gap-2 text-[13px] leading-5 text-white/80">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#c9903a]" /> {c}
                </li>
              ))}
            </ul>

            <p className="mt-4 border-t border-white/10 pt-4 text-[11px] leading-4 text-white/45">
              La caution est versée par le locataire et conservée jusqu&apos;au retour du caftan. En cas
              de dommage, Marwa arbitre entre les deux parties et la caution sert à la réparation ou au
              remplacement. Aucun contrat d&apos;assurance n&apos;est souscrit à ce jour.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
