'use client';

import { useEffect, useState } from 'react';
import { X, ExternalLink } from 'lucide-react';

// Recherche Amazon.fr par titre + auteur : fonctionne sans ASIN.
// À remplacer par https://www.amazon.fr/dp/<ASIN> dès que l'ASIN FR est connu.
const AMAZON_URL =
  'https://www.amazon.fr/s?k=L%27%C3%89quation+du+D%C3%A9sir+Les+Nombres+Interdits+Tarek+Benaili';

const DISMISS_KEY = 'rme-book-ad-dismissed';
const SHOW_AFTER_MS = 12000;
// Le hero porte le CTA principal : on n'affiche la pub qu'une fois dépassé.
const SHOW_AFTER_SCROLL_PX = 700;

function MiniCover() {
  return (
    <div
      className="relative h-[72px] w-[46px] shrink-0 overflow-hidden rounded-[3px] bg-[#c8202c] shadow-md"
      aria-hidden="true"
    >
      <div
        className="absolute inset-x-0 top-0 h-2/3 opacity-30"
        style={{
          backgroundImage:
            'repeating-linear-gradient(90deg, #8b1520 0 1.5px, transparent 1.5px 5px)',
          borderBottomLeftRadius: '60% 40%',
          borderBottomRightRadius: '60% 40%',
        }}
      />
      <div className="absolute inset-x-[3px] top-[10px] text-center">
        <p className="text-[6px] font-light leading-[7px] tracking-tight text-white">
          L&apos;Équation
          <br />
          du Désir
        </p>
      </div>
      <p className="absolute inset-x-[3px] bottom-[4px] text-right text-[4px] font-light leading-[5px] tracking-wide text-white">
        TAREK
        <br />
        BENAÏLI
      </p>
    </div>
  );
}

export default function BookAd() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(DISMISS_KEY)) return;
    } catch {
      // Stockage indisponible (navigation privée) : on affiche quand même.
    }

    let elapsed = false;
    const reveal = () => {
      if (elapsed && window.scrollY > SHOW_AFTER_SCROLL_PX) {
        setVisible(true);
        window.removeEventListener('scroll', reveal);
      }
    };
    const timer = setTimeout(() => {
      elapsed = true;
      reveal();
    }, SHOW_AFTER_MS);
    window.addEventListener('scroll', reveal, { passive: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', reveal);
    };
  }, []);

  function dismiss() {
    setVisible(false);
    try {
      localStorage.setItem(DISMISS_KEY, '1');
    } catch {
      // Sans stockage, la pub réapparaîtra au prochain chargement.
    }
  }

  if (!visible) return null;

  return (
    <aside
      aria-label="Publicité"
      className="fixed bottom-6 left-4 z-40 w-[228px] animate-[fadeIn_.4s_ease-out] rounded-2xl border border-white/10 bg-[#0f1f3d]/95 p-3 shadow-2xl backdrop-blur sm:left-6 sm:w-[252px]"
    >
      <button
        onClick={dismiss}
        aria-label="Fermer la publicité"
        className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full border border-white/15 bg-[#0f1f3d] text-white/50 transition hover:text-white"
      >
        <X size={12} />
      </button>

      <p className="mb-2 text-[9px] font-bold uppercase tracking-widest text-white/30">
        Publicité
      </p>

      <a
        href={AMAZON_URL}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="group flex gap-3"
      >
        <MiniCover />
        <div className="min-w-0">
          <p className="text-[12px] font-black leading-4 text-white">
            L&apos;Équation du Désir
          </p>
          <p className="mt-0.5 text-[10px] leading-3 text-white/45">
            Les Nombres Interdits — Tome 1
          </p>
          <p className="mt-1 text-[10px] font-bold text-[#f59e0b]">Tarek Benaïli</p>
          <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-white/60 transition group-hover:text-white">
            Voir sur Amazon <ExternalLink size={9} />
          </span>
        </div>
      </a>
    </aside>
  );
}
