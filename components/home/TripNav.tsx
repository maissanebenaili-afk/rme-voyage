'use client';

import { useEffect, useRef, useState } from 'react';

export const TRIP_STEPS = [
  { id: 'la-route', label: 'Route' },
  { id: 'ferry', label: 'Ferry' },
  { id: 'route', label: 'Coût' },
  { id: 'preparer', label: 'Documents' },
  { id: 'meteo', label: 'Météo' },
  { id: 'services', label: 'À proximité' },
] as const;

/**
 * « Votre trajet » : les étapes du voyage, collées en haut pendant qu'on
 * descend, l'étape lue mise en avant. Simples liens d'ancre : sans
 * JavaScript, la navigation fonctionne quand même.
 */
export default function TripNav() {
  const [active, setActive] = useState<string | null>(null);
  const listRef = useRef<HTMLOListElement | null>(null);

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: '-35% 0px -55% 0px' },
    );
    TRIP_STEPS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  // Garde la pastille active visible dans la barre, sans faire bouger la page.
  useEffect(() => {
    const list = listRef.current;
    const pill = active ? list?.querySelector<HTMLElement>(`[data-step="${active}"]`) : null;
    if (!list || !pill) return;
    list.scrollTo?.({ left: pill.offsetLeft - 16, behavior: 'smooth' });
  }, [active]);

  return (
    <nav aria-label="Votre trajet" className="sticky top-0 z-30 border-b border-black/5 bg-[#f6f3ec]/85 backdrop-blur-md">
      <ol ref={listRef} className="mx-auto flex max-w-2xl gap-1.5 overflow-x-auto px-5 py-2.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {TRIP_STEPS.map(({ id, label }) => {
          const on = active === id;
          return (
            <li key={id} className="shrink-0">
              <a
                href={`#${id}`}
                data-step={id}
                aria-current={on ? 'location' : undefined}
                className={`inline-flex min-h-10 items-center rounded-full px-4 text-sm font-bold transition ${on ? 'bg-[#0f1f3d] text-white' : 'text-slate-600 hover:bg-black/5 hover:text-[#0f1f3d]'}`}
              >
                {label}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
