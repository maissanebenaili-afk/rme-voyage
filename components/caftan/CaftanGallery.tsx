'use client';

import { useState } from 'react';
import type { Caftan, CaftanView } from '@/lib/caftans';
import CaftanVisual, { isIllustration } from './CaftanVisual';

const VIEWS: { key: CaftanView; label: string }[] = [
  { key: 'face', label: 'Face' },
  { key: 'dos', label: 'Dos' },
  { key: 'detail', label: 'Broderie' },
];

export default function CaftanGallery({ caftan }: { caftan: Caftan }) {
  const [view, setView] = useState<CaftanView>('face');
  const [transitioning, setTransitioning] = useState(false);

  const handleViewChange = (newView: CaftanView) => {
    if (newView === view) return;
    setTransitioning(true);
    setTimeout(() => {
      setView(newView);
      setTransitioning(false);
    }, 150);
  };

  return (
    <div>
      <div
        id={`vue-${view}`}
        role="tabpanel"
        aria-label={`Caftan ${caftan.name}, ${VIEWS.find(v => v.key === view)?.label}`}
        className={`relative aspect-[3/4] overflow-hidden rounded-3xl border border-[#e2d5c0] bg-[#f4ece0] transition-opacity duration-200 ${
          transitioning ? 'opacity-70' : 'opacity-100'
        }`}
      >
        <CaftanVisual caftan={caftan} view={view} variant="full" />
        {isIllustration(caftan) && (
          <span className="absolute bottom-3 left-3 animate-in fade-in duration-500 rounded-full bg-black/45 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white/90 backdrop-blur-sm">
            Illustration
          </span>
        )}
      </div>

      <div role="tablist" aria-label="Vues du modèle" className="mt-4 flex gap-2.5">
        {VIEWS.map((v, idx) => (
          <button
            key={v.key}
            role="tab"
            aria-label={v.label}
            aria-selected={view === v.key}
            aria-controls={`vue-${v.key}`}
            onClick={() => handleViewChange(v.key)}
            className={`group relative flex-1 overflow-hidden rounded-2xl border transition-all duration-300 ${
              view === v.key
                ? 'border-[#c9903a] ring-2 ring-[#c9903a]/40 shadow-md shadow-[#c9903a]/20'
                : 'border-[#e2d5c0] hover:border-[#c9903a]/60 hover:shadow-sm hover:shadow-[#c9903a]/10'
            }`}
            style={{ transitionDelay: `${idx * 30}ms` }}
          >
            <span className="block aspect-[3/4] bg-[#f4ece0]">
              <CaftanVisual caftan={caftan} view={v.key} variant="thumb" />
            </span>
            <span className={`block py-2 text-[11px] font-bold transition-colors duration-200 ${
              view === v.key ? 'bg-[#c9903a]/5 text-[#8a5a14]' : 'text-[#0f1f3d] group-hover:text-[#c9903a]/70'
            }`}>
              {v.label}
            </span>
          </button>
        ))}
      </div>

      {isIllustration(caftan) && (
        <p className="mt-4 text-[11px] leading-4 text-[#475569] transition-opacity duration-300">
          Les visuels sont des illustrations du modèle. Demandez les photos réelles à Marwa avant de réserver.
        </p>
      )}
    </div>
  );
}
