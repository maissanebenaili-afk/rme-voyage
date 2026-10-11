'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { Language, translations, TranslationKey } from './i18n';
import { homeText, type HomeText } from './homeI18n';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: TranslationKey) => string;
  isRtl: boolean;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

const LANGS: readonly Language[] = ['fr', 'en', 'ar', 'es', 'da'];
/** La langue choisie dans le sélecteur, gardée d'une visite à l'autre. */
export const LANG_STORAGE_KEY = 'rme-lang';

function isLanguage(value: unknown): value is Language {
  return typeof value === 'string' && (LANGS as readonly string[]).includes(value);
}

function htmlLanguage(lang: Language): string {
  return lang === 'da' ? 'ary' : lang;
}

function applyToDocument(lang: Language) {
  try {
    document.documentElement.lang = htmlLanguage(lang);
    document.documentElement.dir = lang === 'ar' || lang === 'da' ? 'rtl' : 'ltr';
  } catch {
    // ignore
  }
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === '/' || pathname == null;
  const [lang, setLangState] = useState<Language>('fr');

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    applyToDocument(isHome ? newLang : 'fr');
    try {
      localStorage.setItem(LANG_STORAGE_KEY, newLang);
    } catch {
      // stockage indisponible (navigation privée) : la langue vaut pour cette page
    }
  };

  // La préférence est conservée, mais n'affecte le document que sur l'accueil,
  // seule route dont le contenu est entièrement traduit dans les cinq langues.
  useEffect(() => {
    let initial: Language | null = null;
    try {
      const saved = localStorage.getItem(LANG_STORAGE_KEY);
      if (isLanguage(saved)) initial = saved;
    } catch {
      // ignore
    }
    if (!initial) {
      const browserLang = typeof navigator !== 'undefined' ? navigator.language?.split('-')[0] : undefined;
      if (isLanguage(browserLang)) initial = browserLang;
    }
    const effective = isHome && initial ? initial : 'fr';
    setLangState(effective);
    applyToDocument(effective);
  }, [isHome, pathname]);

  const t = (key: TranslationKey) => translations[lang][key] || translations.fr[key] || key;
  const isRtl = lang === 'ar' || lang === 'da';

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, isRtl }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    return {
      lang: 'fr' as Language,
      setLang: (_lang: Language) => {},
      t: (key: TranslationKey) => translations.fr[key] || key,
      isRtl: false,
    };
  }
  return ctx;
}

/** Les textes de l'accueil dans la langue choisie. */
export function useHomeText(): HomeText {
  return homeText(useLanguage().lang);
}
