// Fichier généré par scripts/ados/portail.mjs. Ne pas modifier à la main : relancer le script.
export interface SerieAudio { id: string; titre: string; genre: string }
export interface EpisodeAudio { serie: string; numero: number; titre: string; question: string; suite: string; duree: number; octets: number; fichier: string; texte: string }

export const SERIES_AUDIO: SerieAudio[] = [
  {
    "id": "fil-d-or",
    "titre": "Le Fil d’or",
    "genre": "Drame, pour les grands enfants et les familles"
  },
  {
    "id": "atlas",
    "titre": "Les Larmes de l’Atlas",
    "genre": "Drame familial, voyage France-Maroc"
  }
];

export const EPISODES_AUDIO: EpisodeAudio[] = [
  {
    "serie": "fil-d-or",
    "numero": 1,
    "titre": "Le fil d’or",
    "question": "Qui lui a écrit cette lettre ?",
    "suite": "La porte d’Al Andalus",
    "duree": 246,
    "octets": 1719081,
    "fichier": "/feuilletons/fil-d-or-01.mp3",
    "texte": "/feuilletons/fil-d-or-01.json"
  },
  {
    "serie": "fil-d-or",
    "numero": 2,
    "titre": "La porte d’Al Andalus",
    "question": "Que cache la broche en fil d’or ?",
    "suite": "La maison qui va fermer",
    "duree": 242,
    "octets": 1697167,
    "fichier": "/feuilletons/fil-d-or-02.mp3",
    "texte": "/feuilletons/fil-d-or-02.json"
  },
  {
    "serie": "fil-d-or",
    "numero": 3,
    "titre": "La maison qui va fermer",
    "question": "Peut-elle sauver 23 enfants en 3 semaines ?",
    "suite": "Le prix du silence",
    "duree": 234,
    "octets": 1636183,
    "fichier": "/feuilletons/fil-d-or-03.mp3",
    "texte": "/feuilletons/fil-d-or-03.json"
  },
  {
    "serie": "fil-d-or",
    "numero": 4,
    "titre": "Le prix du silence",
    "question": "Idriss lui pardonnera-t-il ?",
    "suite": "La robe",
    "duree": 228,
    "octets": 1594094,
    "fichier": "/feuilletons/fil-d-or-04.mp3",
    "texte": "/feuilletons/fil-d-or-04.json"
  },
  {
    "serie": "fil-d-or",
    "numero": 5,
    "titre": "La robe",
    "question": "Qui est vraiment Lalla Kenza ?",
    "suite": "Lalla Kenza",
    "duree": 233,
    "octets": 1633899,
    "fichier": "/feuilletons/fil-d-or-05.mp3",
    "texte": "/feuilletons/fil-d-or-05.json"
  },
  {
    "serie": "fil-d-or",
    "numero": 6,
    "titre": "Lalla Kenza",
    "question": "Et si le pardon était le plus dur ?",
    "suite": "Saison 2",
    "duree": 241,
    "octets": 1684303,
    "fichier": "/feuilletons/fil-d-or-06.mp3",
    "texte": "/feuilletons/fil-d-or-06.json"
  },
  {
    "serie": "atlas",
    "numero": 1,
    "titre": "La lettre dans la boîte",
    "question": "Pourquoi cette lettre n’est-elle jamais partie ?",
    "suite": "Qui est Hassan ?",
    "duree": 200,
    "octets": 1400826,
    "fichier": "/feuilletons/atlas-01.mp3",
    "texte": "/feuilletons/atlas-01.json"
  },
  {
    "serie": "atlas",
    "numero": 2,
    "titre": "Ce que dit la lettre",
    "question": "Où est Hassan aujourd’hui ?",
    "suite": "Karim avoue",
    "duree": 133,
    "octets": 933110,
    "fichier": "/feuilletons/atlas-02.mp3",
    "texte": "/feuilletons/atlas-02.json"
  },
  {
    "serie": "atlas",
    "numero": 3,
    "titre": "Karim avoue",
    "question": "Qui a revu Hassan ?",
    "suite": "Monsieur Ali",
    "duree": 107,
    "octets": 747377,
    "fichier": "/feuilletons/atlas-03.mp3",
    "texte": "/feuilletons/atlas-03.json"
  },
  {
    "serie": "atlas",
    "numero": 4,
    "titre": "Monsieur Ali",
    "question": "Qui est vraiment Monsieur Ali ?",
    "suite": "Le voyage de Hassan",
    "duree": 98,
    "octets": 685134,
    "fichier": "/feuilletons/atlas-04.mp3",
    "texte": "/feuilletons/atlas-04.json"
  },
  {
    "serie": "atlas",
    "numero": 5,
    "titre": "Le voyage de Hassan",
    "question": "Hassan osera-t-il rentrer ?",
    "suite": "La place vide",
    "duree": 103,
    "octets": 723193,
    "fichier": "/feuilletons/atlas-05.mp3",
    "texte": "/feuilletons/atlas-05.json"
  },
  {
    "serie": "atlas",
    "numero": 6,
    "titre": "La place vide",
    "question": "Et si l’histoire de la famille ne faisait que commencer ?",
    "suite": "Saison 2 : les cèdres",
    "duree": 123,
    "octets": 862039,
    "fichier": "/feuilletons/atlas-06.mp3",
    "texte": "/feuilletons/atlas-06.json"
  }
];
