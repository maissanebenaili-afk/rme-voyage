// « Les Noktas de Joha » : de très courtes histoires drôles (45 s) tirées d'anecdotes populaires
// très anciennes, réécrites avec nos mots. Joha (Nasreddin) est un héros du folklore, sans auteur.
// Même format que histoire-atlas.mjs. Style d'image : « papier » (théâtre d'ombres).

export const SERIE = {
  titre: 'Les Noktas de Joha',
  etiquette: 'NOKTA',
  dossier: 'videos-noktas',
  style: 'papier',
  duree: [20, 75], // secondes, pour le contrôle qualité
};

export const PERSOS = {
  joha: { nom: 'Joha', voix: 'IbTlccXlWxGVwnbGUHEd', hauteur: 0.9 },
  voisin: { nom: 'Le voisin', voix: 'jvSOBXJ1cP2sdvT5RgUP', hauteur: 1.0 },
  hote: { nom: 'L’hôte', voix: 'jvSOBXJ1cP2sdvT5RgUP', hauteur: 0.88 },
  narration: { nom: '', voix: 'azure:fr-FR-Soleil:MAI-Voice-2', hauteur: 1 },
};

const un = (id, x, emo = 'neutre', extra = {}) => ({ id, x, emo, ...extra });
const dit = (bg, parle, ton, texte, persos = [], extra = {}) => ({ bg, parle, ton, texte, persos, ...extra });

export const EPISODES = [
  {
    numero: 1,
    titre: 'La clé sous le lampadaire',
    demain: 'Une marmite qui a eu un bébé',
    question: 'Et vous, où cherchez-vous ce que vous avez perdu ?',
    plans: [
      dit('lampadaire', 'narration', 'warm, storyteller', 'Un soir, Joha cherche quelque chose par terre, sous le réverbère.', [un('joha', 0, 'neutre')], { theme: 'famille', cam: 'pan' }),
      dit('lampadaire', 'voisin', 'curious', 'Joha, qu’as-tu perdu ?', [un('joha', -0.5, 'neutre'), un('voisin', 0.5, 'surprise')]),
      dit('lampadaire', 'joha', 'worried', 'Ma clé, mon ami.', [un('joha', -0.5, 'triste'), un('voisin', 0.5, 'neutre')]),
      dit('lampadaire', 'voisin', 'curious', 'Et tu l’as perdue ici ?', [un('joha', -0.5, 'neutre'), un('voisin', 0.5, 'neutre')]),
      dit('lampadaire', 'joha', 'cheerful, matter-of-fact', 'Non, chez moi. Mais ici, il y a de la lumière !', [un('joha', -0.5, 'joie'), un('voisin', 0.5, 'surprise')]),
      dit('lampadaire', 'narration', 'warm, gentle', 'Parfois, on cherche là où c’est facile, et pas là où c’est vrai.', [un('joha', 0, 'tendre')]),
    ],
  },
  {
    numero: 2,
    titre: 'La marmite qui a eu un bébé',
    demain: 'Mange, ma veste !',
    question: 'Et vous, que croiriez-vous si cela vous arrangeait ?',
    plans: [
      dit('rue', 'narration', 'warm, storyteller', 'Joha emprunte une grande marmite à son voisin. Le lendemain, il la rend avec une toute petite marmite dedans.', [un('joha', 0, 'joie')], { cam: 'pan' }),
      dit('rue', 'voisin', 'curious', 'C’est quoi, ça ?', [un('joha', -0.5, 'joie'), un('voisin', 0.5, 'surprise')]),
      dit('rue', 'joha', 'proud, cheerful', 'Ta marmite a eu un bébé, mon ami !', [un('joha', -0.5, 'joie'), un('voisin', 0.5, 'joie')]),
      dit('rue', 'narration', 'warm, storyteller', 'Content, le voisin garde les deux. Quelques jours plus tard, Joha lui redemande la grande marmite… et ne la rend plus.', [un('joha', -0.5, 'neutre'), un('voisin', 0.5, 'neutre')]),
      dit('rue', 'voisin', 'worried', 'Et ma marmite ?', [un('joha', -0.5, 'triste'), un('voisin', 0.5, 'peur')]),
      dit('rue', 'joha', 'sad, solemn', 'Hélas… elle est morte.', [un('joha', -0.5, 'triste'), un('voisin', 0.5, 'surprise')]),
      dit('rue', 'voisin', 'indignant', 'Une marmite, ça ne meurt pas !', [un('joha', -0.5, 'neutre'), un('voisin', 0.5, 'colere')]),
      dit('rue', 'joha', 'playful', 'Elle a bien eu un bébé, non ?', [un('joha', -0.5, 'joie'), un('voisin', 0.5, 'surprise')]),
    ],
  },
  {
    numero: 3,
    titre: 'Mange, ma veste !',
    demain: 'La clé sous le lampadaire',
    question: 'Qui invite-t-on vraiment : la personne ou son habit ?',
    plans: [
      dit('dar', 'narration', 'warm, storyteller', 'Joha est invité à un grand repas, en vêtements simples. Personne ne lui parle, et on ne lui donne rien.', [un('joha', 0, 'triste')], { cam: 'pan' }),
      dit('dar', 'narration', 'warm, storyteller', 'Il rentre chez lui, met sa plus belle veste, et revient. Cette fois, on l’accueille avec des honneurs.', [un('joha', 0, 'neutre')]),
      dit('dar', 'joha', 'playful, whispering', 'Mange, ma veste, mange !', [un('joha', -0.5, 'joie'), un('hote', 0.5, 'surprise')]),
      dit('dar', 'hote', 'surprised', 'Que fais-tu, Joha ?', [un('joha', -0.5, 'joie'), un('hote', 0.5, 'surprise')]),
      dit('dar', 'joha', 'gentle, wise', 'C’est elle que vous avez invitée, pas moi.', [un('joha', -0.5, 'tendre'), un('hote', 0.5, 'triste')]),
    ],
  },
];

export const avecVoix = (plan) => !!plan.parle;

export function texteParle(plan) {
  return `[${plan.ton}] ${plan.texte.replace(/\*/g, '')}`;
}
