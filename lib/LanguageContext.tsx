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

/** Le code interne « da » signifie darija, pas danois. Ne jamais inférer la darija
 * depuis le code navigateur « da » ; seul « ary » identifie l'arabe marocain. */
function languageFromBrowserLocale(locale: string | undefined): Language | null {
  const code = locale?.toLowerCase().split('-')[0];
  if (code === 'ary') return 'da';
  if (code === 'fr' || code === 'en' || code === 'ar' || code === 'es') return code;
  return null;
}

function applyToDocument(lang: Language, localizedRoute: boolean) {
  try {
    const effectiveLang = localizedRoute ? lang : 'fr';
    // BCP 47 : « ary » est l'arabe marocain ; « da » est le danois.
    document.documentElement.lang = effectiveLang === 'da' ? 'ary' : effectiveLang;
    document.documentElement.dir =
      localizedRoute && (effectiveLang === 'ar' || effectiveLang === 'da') ? 'rtl' : 'ltr';
  } catch {
    // ignore
  }
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>('fr');
  const pathname = usePathname();
  // À ce stade, seule la page d'accueil dispose d'une traduction complète.
  // Les autres routes doivent rester annoncées en français.
  const localizedRoute = pathname === '/';

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    try {
      localStorage.setItem(LANG_STORAGE_KEY, newLang);
    } catch {
      // stockage indisponible (navigation privée) : la langue vaut pour cette page
    }
  };

  // Le choix enregistré prime ; sinon une langue de navigateur prise en charge,
  // mais jamais « da » qui signifie danois dans les paramètres du navigateur.
  useEffect(() => {
    let initial: Language | null = null;
    try {
      const saved = localStorage.getItem(LANG_STORAGE_KEY);
      if (isLanguage(saved)) initial = saved;
    } catch {
      // ignore
    }
    if (!initial) {
      const browserLocale = typeof navigator !== 'undefined' ? navigator.language : undefined;
      initial = languageFromBrowserLocale(browserLocale);
    }
    if (initial) setLangState(initial);
  }, []);

  // Le fournisseur est global pour préserver le choix, mais les métadonnées HTML
  // ne suivent une langue autre que le français que sur la page réellement traduite.
  useEffect(() => {
    applyToDocument(lang, localizedRoute);
  }, [lang, localizedRoute]);

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
