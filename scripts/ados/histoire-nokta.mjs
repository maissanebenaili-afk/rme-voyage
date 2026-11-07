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
  sultan: { nom: 'Le sultan', voix: 'jvSOBXJ1cP2sdvT5RgUP', hauteur: 0.8 },
  femme: { nom: 'Sa femme', voix: 'EXAVITQu4vr4xnSDxMaL', hauteur: 1.0 },
  fils: { nom: 'Son fils', voix: 'w85ZODduJOHPSdpVT1ia', hauteur: 1.25 },
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

  {
    numero: 4,
    titre: 'L’âne qui apprend à lire',
    demain: 'Le sermon',
    question: 'Quel problème trop grand attendez-vous que le temps règle ?',
    plans: [
      dit('gala', 'narration', 'warm, storyteller', 'Un jour, Joha promet au sultan d’apprendre à lire à son âne, en dix ans, contre une bourse d’or.', [un('joha', -0.5, 'joie'), un('sultan', 0.5, 'neutre')], { cam: 'pan' }),
      dit('gala', 'sultan', 'skeptical, imposing', 'Dix ans ? Et si l’âne ne lit toujours pas ?', [un('joha', -0.5, 'neutre'), un('sultan', 0.5, 'colere')]),
      dit('gala', 'joha', 'calm, smiling', 'Alors, Majesté, vous aurez bien le temps de vous fâcher.', [un('joha', -0.5, 'joie'), un('sultan', 0.5, 'surprise')]),
      dit('rue', 'voisin', 'worried', 'Joha ! Un âne ne lira jamais !', [un('joha', -0.5, 'neutre'), un('voisin', 0.5, 'peur')]),
      dit('rue', 'joha', 'playful, whispering', 'Dans dix ans, le sultan sera peut-être mort. Ou moi. Ou l’âne. Et qui saura ?', [un('joha', -0.5, 'joie'), un('voisin', 0.5, 'surprise')]),
      dit('rue', 'narration', 'warm, gentle', 'Quand un problème est trop grand, le temps change parfois les règles.', [un('joha', 0, 'tendre')]),
    ],
  },
  {
    numero: 5,
    titre: 'Le sermon',
    demain: 'La lune dans le puits',
    question: 'Qu’avez-vous appris que vous pourriez transmettre ?',
    plans: [
      dit('rue', 'narration', 'warm, storyteller', 'Un jour, Joha monte sur la place et crie à la foule :', [un('joha', 0, 'joie')], { cam: 'pan' }),
      dit('rue', 'joha', 'loud, cheerful', 'Savez-vous ce que je vais vous dire ?', [un('joha', -0.5, 'joie'), un('hote', 0.5, 'neutre')]),
      dit('rue', 'hote', 'shouting', 'Non !', [un('joha', -0.5, 'neutre'), un('hote', 0.5, 'neutre')]),
      dit('rue', 'joha', 'matter-of-fact', 'Alors, à quoi bon vous le dire ? Au revoir !', [un('joha', -0.5, 'joie'), un('hote', 0.5, 'surprise')]),
      dit('rue', 'narration', 'warm, storyteller', 'Le lendemain, il pose la même question. Cette fois, tout le monde crie :', [un('joha', 0, 'neutre')]),
      dit('rue', 'voisin', 'shouting, proud', 'Oui, nous savons !', [un('joha', -0.5, 'neutre'), un('voisin', 0.5, 'joie')]),
      dit('rue', 'joha', 'matter-of-fact', 'Alors pas besoin de le répéter ! Au revoir !', [un('joha', -0.5, 'joie'), un('voisin', 0.5, 'surprise')]),
      dit('rue', 'narration', 'warm, storyteller', 'Le troisième jour, la foule hésite : la moitié dit oui, l’autre moitié dit non.', [un('joha', 0, 'neutre')]),
      dit('rue', 'joha', 'delighted', 'Parfait ! Que ceux qui savent l’expliquent à ceux qui ne savent pas !', [un('joha', -0.5, 'joie'), un('hote', 0.5, 'joie')]),
    ],
  },
  {
    numero: 6,
    titre: 'La lune dans le puits',
    demain: 'Chaud et froid',
    question: 'Quelle lune avez-vous déjà voulu sauver ?',
    plans: [
      dit('puits', 'narration', 'warm, storyteller', 'Une nuit, Joha se penche sur un puits, et il y voit la lune.', [un('joha', -0.5, 'surprise')], { cam: 'pan' }),
      dit('puits', 'joha', 'alarmed', 'Oh non ! La lune est tombée ! Il faut la sauver !', [un('joha', -0.5, 'peur')]),
      dit('puits', 'narration', 'warm, storyteller', 'Il lance une corde, tire de toutes ses forces… et la corde casse. Joha tombe sur le dos.', [un('joha', -0.5, 'surprise')]),
      dit('puits', 'joha', 'amazed, relieved', 'Ça alors… La lune est remontée ! Quel travail !', [un('joha', -0.5, 'joie')]),
      dit('puits', 'narration', 'warm, gentle', 'Joha s’endort, fier de lui. Il a sauvé la lune, qui n’avait rien demandé à personne.', [un('joha', -0.5, 'tendre')]),
    ],
  },
  {
    numero: 7,
    titre: 'Chaud et froid',
    demain: 'Le père, le fils et l’âne',
    question: 'Dites-vous toujours la même chose à tout le monde ?',
    plans: [
      dit('dar', 'narration', 'warm, storyteller', 'Par un matin glacé, Joha dîne chez un ami. Il souffle sur ses mains.', [un('joha', 0, 'froid')], { cam: 'pan' }),
      dit('dar', 'hote', 'curious', 'Pourquoi souffles-tu sur tes mains ?', [un('joha', -0.5, 'froid'), un('hote', 0.5, 'neutre')]),
      dit('dar', 'joha', 'matter-of-fact', 'Pour les réchauffer.', [un('joha', -0.5, 'neutre'), un('hote', 0.5, 'neutre')]),
      dit('dar', 'narration', 'warm, storyteller', 'Puis on lui sert une soupe brûlante. Il souffle dessus. Son ami demande encore pourquoi.', [un('joha', 0, 'neutre')]),
      dit('dar', 'joha', 'matter-of-fact', 'Pour la refroidir.', [un('joha', -0.5, 'joie'), un('hote', 0.5, 'surprise')]),
      dit('dar', 'hote', 'indignant', 'Sors d’ici ! Je ne mange pas avec quelqu’un qui souffle le chaud et le froid avec la même bouche !', [un('joha', -0.5, 'surprise'), un('hote', 0.5, 'colere')]),
      dit('dar', 'joha', 'playful, wistful', 'Dommage… la soupe était bonne.', [un('joha', -0.5, 'triste'), un('hote', 0.5, 'colere')]),
    ],
  },
  {
    numero: 8,
    titre: 'Le père, le fils et l’âne',
    demain: 'Le chat pesé',
    question: 'À qui essayez-vous de plaire, au lieu d’être tranquille ?',
    plans: [
      dit('rue', 'narration', 'warm, storyteller', 'Joha et son fils vont au marché avec leur âne. Le fils monte, Joha marche.', [un('joha', -0.5, 'joie'), un('fils', 0.5, 'joie')], { cam: 'pan' }),
      dit('rue', 'voisin', 'indignant', 'Quel garçon mal élevé ! Il laisse son père à pied !', [un('joha', -0.5, 'neutre'), un('voisin', 0.5, 'colere')]),
      dit('rue', 'narration', 'warm, storyteller', 'Alors Joha monte, et son fils marche.', [un('joha', -0.5, 'neutre'), un('fils', 0.5, 'triste')]),
      dit('rue', 'hote', 'indignant', 'Quel père cruel ! Il laisse son fils à pied !', [un('joha', -0.5, 'surprise'), un('hote', 0.5, 'colere')]),
      dit('rue', 'narration', 'warm, amused', 'Alors ils montent tous les deux. Puis ils portent l’âne sur leurs épaules, et tout le village éclate de rire.', [un('joha', -0.5, 'surprise'), un('fils', 0.5, 'surprise')]),
      dit('rue', 'fils', 'confused', 'Papa, pourquoi tout le monde se moque de nous ?', [un('joha', -0.5, 'joie'), un('fils', 0.5, 'triste')]),
      dit('rue', 'joha', 'gentle, wise', 'Retiens ceci, mon fils : quoi qu’on fasse, quelqu’un trouvera toujours à redire.', [un('joha', -0.5, 'tendre'), un('fils', 0.5, 'neutre')]),
      dit('rue', 'narration', 'warm, gentle', 'Fais ce qui te semble juste, et marche tranquille.', [un('joha', -0.5, 'joie'), un('fils', 0.5, 'joie')]),
    ],
  },
  {
    numero: 9,
    titre: 'Le chat pesé',
    demain: 'Le son contre l’odeur',
    question: 'Quelle excuse a déjà failli marcher chez vous ?',
    plans: [
      dit('dar', 'narration', 'warm, storyteller', 'La femme de Joha achète un kilo de viande. Pendant qu’elle sort, Joha mange tout.', [un('joha', 0, 'joie')], { cam: 'pan' }),
      dit('dar', 'femme', 'suspicious', 'Joha ! Où est la viande ?', [un('joha', -0.5, 'neutre'), un('femme', 0.5, 'colere')]),
      dit('dar', 'joha', 'innocent', 'Le chat l’a mangée.', [un('joha', -0.5, 'tendre'), un('femme', 0.5, 'neutre')]),
      dit('dar', 'narration', 'warm, amused', 'Sa femme pose le chat sur la balance : exactement un kilo.', [un('joha', -0.5, 'surprise'), un('femme', 0.5, 'neutre')]),
      dit('dar', 'femme', 'triumphant', 'Si c’est la viande, où est le chat ? Et si c’est le chat, où est la viande ?', [un('joha', -0.5, 'peur'), un('femme', 0.5, 'joie')]),
      dit('dar', 'joha', 'sheepish, playful', 'Ma foi… tu poses de bonnes questions.', [un('joha', -0.5, 'joie'), un('femme', 0.5, 'joie')]),
    ],
  },
  {
    numero: 10,
    titre: 'Le son contre l’odeur',
    demain: 'La clé sous le lampadaire',
    question: 'Qu’est-ce qui vaut vraiment de l’argent, selon vous ?',
    plans: [
      dit('rue', 'narration', 'warm, storyteller', 'Devant un restaurant, Joha mange son pain en respirant l’odeur des grillades.', [un('joha', -0.5, 'joie'), un('hote', 0.5, 'neutre')], { cam: 'pan' }),
      dit('rue', 'hote', 'indignant', 'Tu as respiré mes grillades : paie-moi !', [un('joha', -0.5, 'surprise'), un('hote', 0.5, 'colere')]),
      dit('rue', 'joha', 'innocent', 'Moi ? Je n’ai rien mangé chez vous.', [un('joha', -0.5, 'neutre'), un('hote', 0.5, 'neutre')]),
      dit('rue', 'hote', 'insistent', 'L’odeur vaut de l’argent !', [un('joha', -0.5, 'neutre'), un('hote', 0.5, 'colere')]),
      dit('rue', 'narration', 'warm, amused', 'Joha sort deux pièces et les fait tinter dans sa main.', [un('joha', -0.5, 'joie'), un('hote', 0.5, 'surprise')]),
      dit('rue', 'joha', 'cheerful, matter-of-fact', 'Voilà : le son des pièces paie l’odeur de la viande.', [un('joha', -0.5, 'joie'), un('hote', 0.5, 'surprise')]),
    ],
  },
];

export const avecVoix = (plan) => !!plan.parle;

export function texteParle(plan) {
  return `[${plan.ton}] ${plan.texte.replace(/\*/g, '')}`;
}
