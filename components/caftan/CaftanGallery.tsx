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

  return (
    <div>
      <div
        id={`vue-${view}`}
        role="tabpanel"
        aria-label={`Caftan ${caftan.name}, ${VIEWS.find(v => v.key === view)?.label}`}
        className="relative aspect-[3/4] overflow-hidden rounded-3xl border border-[#e2d5c0] bg-[#f4ece0]"
      >
        <CaftanVisual caftan={caftan} view={view} variant="full" />
        {isIllustration(caftan) && (
          <span className="absolute bottom-3 left-3 rounded-full bg-black/45 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white/90 backdrop-blur-sm">
            Illustration
          </span>
        )}
      </div>

      <div role="tablist" aria-label="Vues du modèle" className="mt-3 flex gap-3">
        {VIEWS.map(v => (
          <button
            key={v.key}
            role="tab"
            aria-label={v.label}
            aria-selected={view === v.key}
            aria-controls={`vue-${v.key}`}
            onClick={() => setView(v.key)}
            className={`flex-1 overflow-hidden rounded-2xl border transition ${
              view === v.key
                ? 'border-[#c9903a] ring-2 ring-[#c9903a]/30'
                : 'border-[#e2d5c0] hover:border-[#c9903a]/50'
            }`}
          >
            <span className="block aspect-[3/4] bg-[#f4ece0]">
              <CaftanVisual caftan={caftan} view={v.key} variant="thumb" />
            </span>
            <span className="block py-1.5 text-[11px] font-bold text-[#0f1f3d]">{v.label}</span>
          </button>
        ))}
      </div>

      {isIllustration(caftan) && (
        <p className="mt-3 text-[11px] leading-4 text-[#94a3b8]">
          Les visuels sont des illustrations du modèle. Demandez les photos réelles à Marwa avant de réserver.
        </p>
      )}
    </div>
  );
}
