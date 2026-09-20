/**
 * External visual references used only as category inspiration, never as
 * official partner, product, availability, or service imagery.
 *
 * Unsplash images are governed by https://unsplash.com/license. Attribution is
 * displayed as a courtesy. Wikimedia's Delivery_truck.svg is CC0 as stated on
 * its source page supplied for this project.
 */
export type InspirationImage = {
  src: string;
  sourceUrl: string;
  licenseUrl: string;
  credit: string;
  alt: string;
};

export const INSPIRATION_IMAGES = {
  caftan: {
    src: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?auto=format&fit=crop&w=1200&q=80',
    sourceUrl: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956',
    licenseUrl: 'https://unsplash.com/license',
    credit: 'Unsplash',
    alt: 'Tenue de cérémonie photographiée comme inspiration de style',
  },
  wellness: {
    src: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80',
    sourceUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773',
    licenseUrl: 'https://unsplash.com/license',
    credit: 'Unsplash',
    alt: 'Scène de bien-être utilisée comme illustration d’ambiance',
  },
  catering: {
    src: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=80',
    sourceUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554',
    licenseUrl: 'https://unsplash.com/license',
    credit: 'Unsplash',
    alt: 'Plat préparé utilisé comme illustration culinaire d’ambiance',
  },
  services: {
    src: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1200&q=80',
    sourceUrl: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902',
    licenseUrl: 'https://unsplash.com/license',
    credit: 'Unsplash',
    alt: 'Professionnels échangeant autour d’une table, illustration de services',
  },
  delivery: {
    src: 'https://commons.wikimedia.org/wiki/Special:FilePath/Delivery_truck.svg',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Delivery_truck.svg',
    licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
    credit: 'Wikimedia Commons — CC0',
    alt: 'Illustration d’un camion de livraison',
  },
} satisfies Record<string, InspirationImage>;
