'use client';

import { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { languages, Language } from '@/lib/i18n';
import { useLanguage } from '@/lib/LanguageContext';

export default function LanguageSwitcher() {
  const { lang, setLang } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const current = languages.find((l) => l.code === lang) || languages[0];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-2 py-1.5 text-xs font-medium text-white transition-colors hover:bg-white/10 sm:gap-1.5 sm:px-3 sm:text-sm"
        aria-label="Changer de langue"
        aria-expanded={open}
      >
        <Globe className="h-3.5 w-3.5 shrink-0" />
        <span className="hidden sm:inline">{current.label}</span>
        <span className="sm:hidden">{current.code.toUpperCase()}</span>
        <ChevronDown className={`h-3 w-3 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-44 overflow-hidden rounded-2xl border border-white/10 bg-zellige-800 shadow-warm-lg z-50">
          {languages.map((l) => (
            <button
              key={l.code}
              onClick={() => {
                setLang(l.code as Language);
                setOpen(false);
              }}
              className={`flex w-full items-center gap-2 px-4 py-2.5 text-sm text-left transition-colors hover:bg-white/10 ${
                lang === l.code ? 'bg-white/10 text-safran-300' : 'text-white'
              } ${l.rtl ? 'flex-row-reverse text-right' : ''}`}
            >
              <span>{l.flag}</span>
              <span>{l.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
