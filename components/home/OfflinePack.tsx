'use client';

import Link from 'next/link';
import { FileText, Gamepad2, Headphones, Palette, Tv, WifiOff } from 'lucide-react';
import { useHomeText } from '@/lib/LanguageContext';

/*
 * Les RME passent 3 à 5 jours sans réseau (route, bateau, hôtel sans code
 * Wi-Fi). Ces pages sont mises en cache par le service worker dès la première
 * visite (voir PUBLIC_PAGES dans public/sw.js) : on les montre en haut de
 * l'accueil au lieu de les ranger dans les tiroirs.
 */
export default function OfflinePack() {
  const h = useHomeText();
  const items = [
    { href: '/feuilletons', label: h.offlineStories, Icon: Headphones },
    { href: '/jeux', label: h.offlineGames, Icon: Gamepad2 },
    { href: '/dessins-animes', label: h.offlineCartoons, Icon: Tv },
    { href: '/coloriages', label: h.offlineColoring, Icon: Palette },
    { href: '/kit-retour', label: h.offlinePapers, Icon: FileText },
  ];
  return (
    <section id="sans-reseau" aria-labelledby="sans-reseau-title" className="mt-10 scroll-mt-20 rounded-3xl bg-[#0f1f3d] p-5 text-white">
      <h2 id="sans-reseau-title" className="flex items-center gap-2 text-xl font-extrabold">
        <WifiOff size={22} aria-hidden="true" className="shrink-0 text-[#fcd34d]" />
        {h.offlineTitle}
      </h2>
      <p className="mt-2 text-[15px] leading-6 text-white/80">{h.offlineText}</p>
      <ul className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {items.map(({ href, label, Icon }) => (
          <li key={href}>
            <Link
              href={href}
              className="flex min-h-14 items-center gap-2 rounded-2xl bg-white/10 px-3 py-3 text-sm font-bold text-white ring-1 ring-white/15 transition hover:bg-white/20"
            >
              <Icon size={20} aria-hidden="true" className="shrink-0 text-[#fcd34d]" />
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
