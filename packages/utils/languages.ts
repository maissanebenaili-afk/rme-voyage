export type LanguageCode =
  | 'da' | 'fr' | 'en' | 'ar' | 'es'  // Current support
  | 'wo' | 'ff' | 'bm' | 'yo' | 'ig' | 'ha' | 'sw' | 'ln' | 'rw' | 'mg';  // African diaspora

export interface LanguageConfig {
  code: LanguageCode;
  name: string;
  nativeName: string;
  region: string;
  countries: string[];
  isAfrican: boolean;
  isEuropean: boolean;
  voiceCode?: string;
}

export const LANGUAGE_CONFIGS: Record<LanguageCode, LanguageConfig> = {
  // Current languages
  da: {
    code: 'da',
    name: 'Darija (Moroccan Arabic)',
    nativeName: 'الدارجة',
    region: 'North Africa',
    countries: ['Morocco'],
    isAfrican: true,
    isEuropean: false,
  },
  fr: {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    region: 'Europe/Africa',
    countries: ['France', 'Belgium', 'Senegal', 'Mali', 'Guinea', 'DRC', 'Ivory Coast'],
    isAfrican: true,
    isEuropean: true,
    voiceCode: 'fr-FR',
  },
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    region: 'Europe/Africa',
    countries: ['UK', 'US', 'Nigeria', 'Kenya', 'Ghana'],
    isAfrican: true,
    isEuropean: true,
    voiceCode: 'en-US',
  },
  ar: {
    code: 'ar',
    name: 'Modern Standard Arabic',
    nativeName: 'العربية',
    region: 'Middle East/Africa',
    countries: ['Saudi Arabia', 'Egypt', 'UAE', 'Morocco', 'Algeria'],
    isAfrican: true,
    isEuropean: false,
    voiceCode: 'ar-SA',
  },
  es: {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    region: 'Europe/Americas',
    countries: ['Spain', 'Argentina', 'Mexico'],
    isAfrican: false,
    isEuropean: true,
    voiceCode: 'es-ES',
  },

  // West African languages - Senegal/Mali cluster
  wo: {
    code: 'wo',
    name: 'Wolof',
    nativeName: 'Wolof',
    region: 'West Africa',
    countries: ['Senegal', 'Mauritania', 'Gambia'],
    isAfrican: true,
    isEuropean: false,
  },
  ff: {
    code: 'ff',
    name: 'Pulaar (Fula)',
    nativeName: 'Pulaar',
    region: 'West Africa',
    countries: ['Guinea', 'Mali', 'Senegal', 'Mauritania', 'Burkina Faso'],
    isAfrican: true,
    isEuropean: false,
  },
  bm: {
    code: 'bm',
    name: 'Bambara',
    nativeName: 'Bamanankan',
    region: 'West Africa',
    countries: ['Mali', 'Burkina Faso', 'Guinea'],
    isAfrican: true,
    isEuropean: false,
  },

  // Nigeria cluster
  yo: {
    code: 'yo',
    name: 'Yoruba',
    nativeName: 'Yorùbá',
    region: 'West Africa',
    countries: ['Nigeria', 'Benin', 'Togo'],
    isAfrican: true,
    isEuropean: false,
  },
  ig: {
    code: 'ig',
    name: 'Igbo',
    nativeName: 'Asụsụ Igbo',
    region: 'West Africa',
    countries: ['Nigeria', 'Cameroon'],
    isAfrican: true,
    isEuropean: false,
  },
  ha: {
    code: 'ha',
    name: 'Hausa',
    nativeName: 'Hausa',
    region: 'West Africa',
    countries: ['Nigeria', 'Niger', 'Ghana', 'Cameroon'],
    isAfrican: true,
    isEuropean: false,
  },

  // East/Central African languages
  sw: {
    code: 'sw',
    name: 'Swahili',
    nativeName: 'Kiswahili',
    region: 'East Africa',
    countries: ['Kenya', 'Tanzania', 'Uganda', 'DRC'],
    isAfrican: true,
    isEuropean: false,
    voiceCode: 'sw-KE',
  },
  ln: {
    code: 'ln',
    name: 'Lingala',
    nativeName: 'Lingála',
    region: 'Central Africa',
    countries: ['DRC', 'Congo', 'Central African Republic'],
    isAfrican: true,
    isEuropean: false,
  },
  rw: {
    code: 'rw',
    name: 'Kinyarwanda',
    nativeName: 'Kinyarwanda',
    region: 'East-Central Africa',
    countries: ['Rwanda', 'Burundi', 'DRC', 'Uganda'],
    isAfrican: true,
    isEuropean: false,
  },
  mg: {
    code: 'mg',
    name: 'Malagasy',
    nativeName: 'Malagasy',
    region: 'East Africa',
    countries: ['Madagascar', 'Mauritius'],
    isAfrican: true,
    isEuropean: false,
  },
};

export const SUPPORTED_LANGUAGES = Object.keys(LANGUAGE_CONFIGS) as LanguageCode[];

export const AFRICAN_LANGUAGES = SUPPORTED_LANGUAGES.filter(
  (code) => LANGUAGE_CONFIGS[code].isAfrican
);

export const DIASPORA_LANGUAGES = ['wo', 'ff', 'bm', 'yo', 'ig', 'ha', 'sw', 'ln', 'rw', 'mg'] as LanguageCode[];

export function getLanguageConfig(code: string): LanguageConfig | null {
  return LANGUAGE_CONFIGS[code as LanguageCode] || null;
}

export function getLanguagesByCountry(country: string): LanguageCode[] {
  return SUPPORTED_LANGUAGES.filter((code) =>
    LANGUAGE_CONFIGS[code].countries.some(
      (c) => c.toLowerCase() === country.toLowerCase()
    )
  );
}

export function getLanguagesByRegion(region: string): LanguageCode[] {
  return SUPPORTED_LANGUAGES.filter((code) =>
    LANGUAGE_CONFIGS[code].region.toLowerCase().includes(region.toLowerCase())
  );
}
