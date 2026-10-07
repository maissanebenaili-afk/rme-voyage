'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

/**
 * Un outil rangé : une ligne (icône, titre, une phrase) qui s'ouvre sur place.
 * Un lien vers /#id (Hadak, autres pages) qui vise le tiroir ou un bloc qu'il
 * contient l'ouvre, au lieu d'arriver sur un bloc replié.
 */
export default function ToolDrawer({ id, icon, title, text, children }: { id: string; icon: ReactNode; title: string; text: string; children: ReactNode }) {
  const ref = useRef<HTMLDetailsElement | null>(null);

  useEffect(() => {
    const openIfTargeted = () => {
      const drawer = ref.current;
      const hash = window.location.hash.slice(1);
      if (!drawer || !hash) return;
      const target = document.getElementById(decodeURIComponent(hash));
      if (!target || !drawer.contains(target)) return;
      drawer.open = true;
      target.scrollIntoView({ block: 'start' });
    };
    openIfTargeted();
    window.addEventListener('hashchange', openIfTargeted);
    return () => window.removeEventListener('hashchange', openIfTargeted);
  }, [id]);

  return (
    <details ref={ref} id={id} className="depth-card group scroll-mt-4 rounded-2xl bg-white ring-1 ring-black/5 open:ring-[#0f1f3d]/15">
      <summary className="flex min-h-16 cursor-pointer list-none items-center gap-3 rounded-2xl px-4 py-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0369a1] [&::-webkit-details-marker]:hidden">
        <span aria-hidden="true" className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#f6f3ec] text-xl">{icon}</span>
        <span className="min-w-0 flex-1">
          <span className="block font-extrabold text-[#0f1f3d]">{title}</span>
          <span className="block truncate text-sm text-slate-500">{text}</span>
        </span>
        <ChevronDown size={20} aria-hidden="true" className="shrink-0 text-slate-400 transition-transform group-open:rotate-180" />
      </summary>
      <div className="space-y-6 border-t border-slate-100 p-3 sm:p-5">{children}</div>
    </details>
  );
}
