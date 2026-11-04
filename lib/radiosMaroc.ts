// Radios et télé du Maroc : listes vérifiées, sans réseau.
//
// - Radios jouées sur la page : flux https publics, relevés dans l'annuaire
//   communautaire Radio Browser et écoutés un par un le 4 novembre 2026
//   (réponse audio/mpeg ou audio/aac). Les flux http (bloqués sur une page
//   https), HLS ou injoignables ont été écartés.
// - Radios et chaînes de la SNRT : liens vers leurs pages officielles
//   snrtlive.ma (vérifiées le même jour), ouvertes dans un nouvel onglet ;
//   RME ne rediffuse pas la télévision.

export interface RadioStation {
  id: string;
  name: string;
  /** Ce qu'on y écoute, en quelques mots. */
  genre: string;
  stream: string;
  homepage: string;
}

export const RADIOS: readonly RadioStation[] = [
  { id: 'hit-radio', name: 'Hit Radio', genre: 'Hits, rap, musique urbaine', stream: 'https://hitradio-maroc.ice.infomaniak.ch/hitradio-maroc-128.mp3', homepage: 'https://www.hitradio.ma/' },
  { id: 'medi1-hits', name: 'Medi1 Hits', genre: 'Hits', stream: 'https://cdn.live.easybroadcast.io/medi1radio/Hits', homepage: 'https://www.medi1.com/' },
  { id: 'radio-mars', name: 'Radio Mars', genre: 'Sport, football', stream: 'https://radiomars.ice.infomaniak.ch/radiomars-128.mp3', homepage: 'https://www.radiomars.ma/' },
  { id: 'aswat', name: 'Radio Aswat', genre: 'Infos et musique', stream: 'https://aswat.ice.infomaniak.ch/aswat-high.mp3', homepage: 'https://www.radioaswat.ma/' },
  { id: 'med-radio', name: 'Med Radio', genre: 'Infos, débats, musique', stream: 'https://medradio.ice.infomaniak.ch/medradio-128.mp3', homepage: 'https://medradio.ma/' },
  { id: 'medina-fm', name: 'Medina FM', genre: 'Actualités, musique marocaine', stream: 'https://medinafm.ice.infomaniak.ch/medinafm-64.mp3', homepage: 'https://medinafm.ma/' },
  { id: 'medina-tarab', name: 'Medina FM Tarab', genre: 'Tarab, nostalgie', stream: 'https://medinatarab.ice.infomaniak.ch/medinatarab-128.mp3', homepage: 'https://medinafm.ma/' },
  { id: 'medina-andalou', name: 'Medina FM Andalou', genre: 'Musique andalouse, malhoun', stream: 'https://medinaandalou.ice.infomaniak.ch/medinaandalou-128.mp3', homepage: 'https://medinafm.ma/' },
  { id: 'medina-amazigh', name: 'Medina FM Amazigh', genre: 'Musique amazighe', stream: 'https://medinaamazigh.ice.infomaniak.ch/medinaamazigh-128.mp3', homepage: 'https://medinafm.ma/' },
  { id: 'radio-azawan', name: 'Radio Azawan', genre: 'Musique amazighe et du monde', stream: 'https://az-maroc.ice.infomaniak.ch/az-maroc-64.aac', homepage: 'https://radioazawan.ma/' },
  { id: 'u-radio', name: 'U Radio', genre: 'Pop, années 80 à 2000', stream: 'https://uradio-aac.ice.infomaniak.ch/uradio.aac', homepage: 'https://radiolive.ma/station/u-radio/' },
  { id: 'cap-radio', name: 'Cap Radio', genre: 'Musique', stream: 'https://listen.radioking.com/radio/710810/stream/776366', homepage: 'https://capradiotv.com/' },
];

export interface OfficialLink {
  id: string;
  name: string;
  detail: string;
  url: string;
}

const SNRT = 'https://snrtlive.ma/fr';

export const SNRT_RADIOS: readonly OfficialLink[] = [
  { id: 'mohammed-6-coran', name: 'Radio Mohammed VI du Saint Coran', detail: 'Récitation et émissions religieuses', url: `${SNRT}/idaat-mohammed-assadiss` },
  { id: 'chaine-inter', name: 'Chaîne Inter', detail: 'Radio publique en français', url: `${SNRT}/chaine-inter` },
  { id: 'idaa-watania', name: 'Al Idaa Al Watania', detail: 'Radio nationale en arabe', url: `${SNRT}/alidaa-alwatania` },
  { id: 'idaa-amazighia', name: 'Al Idaa Al Amazighia', detail: 'Radio nationale amazighe', url: `${SNRT}/alidaa-alamazighia` },
];

export const TV_CHANNELS: readonly OfficialLink[] = [
  { id: 'al-aoula', name: 'Al Aoula', detail: 'Chaîne publique généraliste', url: `${SNRT}/al-aoula` },
  { id: 'al-maghribia', name: 'Al Maghribia', detail: 'La chaîne des Marocains du monde', url: `${SNRT}/almaghribia` },
  { id: 'assadissa', name: 'Assadissa', detail: 'Chaîne religieuse', url: `${SNRT}/assadissa` },
  { id: 'athaqafia', name: 'Athaqafia', detail: 'Culture', url: `${SNRT}/athaqafia` },
  { id: 'tamazight', name: 'Tamazight', detail: 'Chaîne amazighe', url: `${SNRT}/tamazight` },
  { id: 'laayoune', name: 'Laâyoune TV', detail: 'Chaîne régionale', url: `${SNRT}/laayoune` },
  { id: '2m', name: '2M', detail: 'Site officiel de la chaîne', url: 'https://2m.ma/' },
  { id: 'medi1-tv', name: 'Medi1 TV', detail: 'Site officiel de la chaîne', url: 'https://www.medi1tv.com/' },
];

/** Origines des flux, pour la règle media-src de la politique de sécurité. */
export const RADIO_MEDIA_SOURCES = [
  'https://*.ice.infomaniak.ch',
  'https://cdn.live.easybroadcast.io',
  'https://listen.radioking.com',
] as const;

/** Vrai si l'adresse du flux est couverte par une origine autorisée. */
export function isAllowedStream(stream: string): boolean {
  let host: string;
  try {
    const url = new URL(stream);
    if (url.protocol !== 'https:') return false;
    host = url.host;
  } catch {
    // Adresse illisible : refusée.
    return false;
  }
  return RADIO_MEDIA_SOURCES.some((source) => {
    const allowed = source.replace('https://', '');
    return allowed.startsWith('*.') ? host.endsWith(allowed.slice(1)) : host === allowed;
  });
}

export const LAST_RADIO_KEY = 'rme-radio-derniere';

export function radioById(id: string | null): RadioStation | undefined {
  return id ? RADIOS.find((r) => r.id === id) : undefined;
}
