// Fichier généré par scripts/ados/portail.mjs. Ne pas modifier à la main : relancer le script.
export interface SerieAudio { id: string; titre: string; genre: string; etiquette: string }
export interface EpisodeAudio { serie: string; numero: number; titre: string; question: string; suite: string; duree: number; octets: number; fichier: string; texte: string }

export const SERIES_AUDIO: SerieAudio[] = [
  {
    "id": "fil-d-or",
    "titre": "Le Fil d’or",
    "genre": "Drame, pour les grands enfants et les familles",
    "etiquette": "Épisode"
  },
  {
    "id": "atlas",
    "titre": "Les Larmes de l’Atlas",
    "genre": "Drame familial, voyage France-Maroc",
    "etiquette": "Épisode"
  },
  {
    "id": "nokta",
    "titre": "Les Noktas de Joha",
    "genre": "Humour populaire, moins d’une minute",
    "etiquette": "Nokta"
  },
  {
    "id": "fable",
    "titre": "Les Fables de la route",
    "genre": "Fables anciennes, une morale chacune",
    "etiquette": "Fable"
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
  },
  {
    "serie": "nokta",
    "numero": 1,
    "titre": "La clé sous le lampadaire",
    "question": "Et vous, où cherchez-vous ce que vous avez perdu ?",
    "suite": "Une marmite qui a eu un bébé",
    "duree": 33,
    "octets": 228267,
    "fichier": "/feuilletons/nokta-01.mp3",
    "texte": "/feuilletons/nokta-01.json"
  },
  {
    "serie": "nokta",
    "numero": 2,
    "titre": "La marmite qui a eu un bébé",
    "question": "Et vous, que croiriez-vous si cela vous arrangeait ?",
    "suite": "Mange, ma veste !",
    "duree": 48,
    "octets": 338646,
    "fichier": "/feuilletons/nokta-02.mp3",
    "texte": "/feuilletons/nokta-02.json"
  },
  {
    "serie": "nokta",
    "numero": 3,
    "titre": "Mange, ma veste !",
    "question": "Qui invite-t-on vraiment : la personne ou son habit ?",
    "suite": "La clé sous le lampadaire",
    "duree": 35,
    "octets": 246150,
    "fichier": "/feuilletons/nokta-03.mp3",
    "texte": "/feuilletons/nokta-03.json"
  },
  {
    "serie": "nokta",
    "numero": 4,
    "titre": "L’âne qui apprend à lire",
    "question": "Quel problème trop grand attendez-vous que le temps règle ?",
    "suite": "Le sermon",
    "duree": 45,
    "octets": 312185,
    "fichier": "/feuilletons/nokta-04.mp3",
    "texte": "/feuilletons/nokta-04.json"
  },
  {
    "serie": "nokta",
    "numero": 5,
    "titre": "Le sermon",
    "question": "Qu’avez-vous appris que vous pourriez transmettre ?",
    "suite": "La lune dans le puits",
    "duree": 53,
    "octets": 369118,
    "fichier": "/feuilletons/nokta-05.mp3",
    "texte": "/feuilletons/nokta-05.json"
  },
  {
    "serie": "nokta",
    "numero": 6,
    "titre": "La lune dans le puits",
    "question": "Quelle lune avez-vous déjà voulu sauver ?",
    "suite": "Chaud et froid",
    "duree": 44,
    "octets": 305374,
    "fichier": "/feuilletons/nokta-06.mp3",
    "texte": "/feuilletons/nokta-06.json"
  },
  {
    "serie": "nokta",
    "numero": 7,
    "titre": "Chaud et froid",
    "question": "Dites-vous toujours la même chose à tout le monde ?",
    "suite": "Le père, le fils et l’âne",
    "duree": 44,
    "octets": 310911,
    "fichier": "/feuilletons/nokta-07.mp3",
    "texte": "/feuilletons/nokta-07.json"
  },
  {
    "serie": "nokta",
    "numero": 8,
    "titre": "Le père, le fils et l’âne",
    "question": "À qui essayez-vous de plaire, au lieu d’être tranquille ?",
    "suite": "Le chat pesé",
    "duree": 58,
    "octets": 406434,
    "fichier": "/feuilletons/nokta-08.mp3",
    "texte": "/feuilletons/nokta-08.json"
  },
  {
    "serie": "nokta",
    "numero": 9,
    "titre": "Le chat pesé",
    "question": "Quelle excuse a déjà failli marcher chez vous ?",
    "suite": "Le son contre l’odeur",
    "duree": 41,
    "octets": 286466,
    "fichier": "/feuilletons/nokta-09.mp3",
    "texte": "/feuilletons/nokta-09.json"
  },
  {
    "serie": "nokta",
    "numero": 10,
    "titre": "Le son contre l’odeur",
    "question": "Qu’est-ce qui vaut vraiment de l’argent, selon vous ?",
    "suite": "La clé sous le lampadaire",
    "duree": 35,
    "octets": 242376,
    "fichier": "/feuilletons/nokta-10.mp3",
    "texte": "/feuilletons/nokta-10.json"
  },
  {
    "serie": "fable",
    "numero": 1,
    "titre": "Le marchand et le beau parleur",
    "question": "Qui vous flatte pour obtenir quelque chose ?",
    "suite": "Le chanteur et la voisine",
    "duree": 46,
    "octets": 324287,
    "fichier": "/feuilletons/fable-01.mp3",
    "texte": "/feuilletons/fable-01.json"
  },
  {
    "serie": "fable",
    "numero": 2,
    "titre": "Le chanteur et la voisine",
    "question": "Qu’avez-vous préparé pour l’hiver ?",
    "suite": "Le coureur et le vieux marcheur",
    "duree": 54,
    "octets": 376194,
    "fichier": "/feuilletons/fable-02.mp3",
    "texte": "/feuilletons/fable-02.json"
  },
  {
    "serie": "fable",
    "numero": 3,
    "titre": "Le coureur et le vieux marcheur",
    "question": "Avancez-vous régulièrement, ou par à-coups ?",
    "suite": "Le sultan et le petit",
    "duree": 46,
    "octets": 322776,
    "fichier": "/feuilletons/fable-03.mp3",
    "texte": "/feuilletons/fable-03.json"
  },
  {
    "serie": "fable",
    "numero": 4,
    "titre": "Le sultan et le petit",
    "question": "Qui avez-vous déjà méprisé, et qui vous a aidé ?",
    "suite": "Le marchand et le beau parleur",
    "duree": 46,
    "octets": 321506,
    "fichier": "/feuilletons/fable-04.mp3",
    "texte": "/feuilletons/fable-04.json"
  }
];
