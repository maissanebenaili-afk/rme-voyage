'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, translations, TranslationKey } from './i18n';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: TranslationKey) => string;
  isRtl: boolean;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>('fr');
  const [mounted, setMounted] = useState(false);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    if (typeof window !== 'undefined') {
      try {
        document.documentElement.lang = newLang;
        document.documentElement.dir = (newLang === 'ar' || newLang === 'da') ? 'rtl' : 'ltr';
      } catch (e) {
        // ignore
      }
    }
  };

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
      try {
        const browserLang = navigator.language?.split('-')[0];
        if (browserLang && ['fr', 'en', 'ar', 'es', 'da'].includes(browserLang)) {
          setLang(browserLang as Language);
        }
      } catch (e) {
        // ignore
      }
    }
  }, []);

  const t = (key: TranslationKey) => translations[lang][key] || translations.fr[key] || key;
  const isRtl = lang === 'ar' || lang === 'da';

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, isRtl }}>
      {mounted ? children : children}
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
