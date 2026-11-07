// « Les Larmes de l'Atlas » : un drame familial marocain, 100 % original.
// Nour, 9 ans, part avec ses parents et son petit frère rejoindre sa grand-mère dans l'Atlas.
// Dans la boîte à biscuits de son père, elle a pris une lettre jamais ouverte, adressée à sa
// grand-mère il y a vingt-cinq ans. Tout ce que la lettre touche va changer.
// Aucun personnage, lieu précis, marque ou musique n'est repris d'une œuvre existante.
// Même format que histoire.mjs. `theme` choisit le thème musical du plan (musique-atlas.mjs).

export const SERIE = {
  titre: 'Les Larmes de l’Atlas',
  etiquette: 'ÉPISODE',
  dossier: 'videos-atlas',
  musique: 'atlas',
};

export const PERSOS = {
  nour: { nom: 'Nour', voix: 'sQfOhaIRbFZ7R8bP1x9f', hauteur: 1.16 },
  yacine: { nom: 'Yacine', voix: 'w85ZODduJOHPSdpVT1ia', hauteur: 1.32 },
  maman: { nom: 'Maman', voix: 'EXAVITQu4vr4xnSDxMaL', hauteur: 1.0 },
  papa: { nom: 'Papa', voix: 'IbTlccXlWxGVwnbGUHEd', hauteur: 0.97 },
  zahra: { nom: 'Lalla Zahra', voix: 'EXAVITQu4vr4xnSDxMaL', hauteur: 0.84 },
  narration: { nom: '', voix: 'azure:fr-FR-Soleil:MAI-Voice-2', hauteur: 1 },
};

const un = (id, x, emo = 'neutre', extra = {}) => ({ id, x, emo, ...extra });
const dit = (bg, parle, ton, texte, persos = [], extra = {}) => ({ bg, parle, ton, texte, persos, ...extra });
const reac = (bg, persos, duree, extra = {}) => ({ bg, persos, duree, ...extra });
const vue = (bg, insert, duree, extra = {}) => ({ bg, insert, duree, persos: [], ...extra });

export const EPISODES = [
  {
    numero: 1,
    titre: 'La lettre dans la boîte',
    demain: 'Qui est Hassan ?',
    question: 'Pourquoi cette lettre n’est-elle jamais partie ?',
    plans: [
      dit('route', 'narration', 'warm, storyteller', 'Chaque été, la famille de Nour quitte la France et prend la route du Maroc. Trois mille kilomètres, un bateau, et les mille questions d’un petit frère qui ne sait pas se taire.', [un('nour', -0.5, 'joie'), un('yacine', 0.5, 'joie')], { theme: 'famille', cam: 'pan' }),
      dit('route', 'yacine', 'excited, small child', 'On est bientôt arrivés ? Papa ? On est bientôt arrivés ? Papa ! Papa !', [un('nour', -0.5, 'joie'), un('yacine', 0.5, 'surprise')], { theme: 'famille' }),
      dit('route', 'papa', 'laughing, patient', 'Yacine, nous avons passé Tanger il y a une heure. Il reste encore des heures de route, *habibi*. Compte les moutons.', [un('nour', -0.5, 'joie'), un('yacine', 0.5, 'neutre')], { theme: 'famille' }),
      dit('route', 'yacine', 'grumbling, small child', 'Il y a pas de moutons. Il y a que des camions.', [un('nour', -0.5, 'joie', { act: 'rire' }), un('yacine', 0.5, 'triste')], { theme: 'famille' }),
      dit('route', 'maman', 'warm, amused', 'Alors compte les camions. Et laisse ta sœur tranquille : elle a l’air de préparer un grand secret.', [un('nour', -0.5, 'surprise'), un('maman', 0.5, 'tendre')], { theme: 'famille' }),
      dit('route', 'nour', 'whispering, guilty', 'Je n’aurais pas dû la prendre. Mais elle était là, dans la boîte à biscuits de papa, avec le nom de Lalla Zahra écrit dessus. Une lettre qui n’a jamais voyagé.', [], { insert: 'lettre', theme: 'mystere' }),
      dit('route', 'narration', 'soft, mysterious', 'Nour ne savait pas encore qu’une enveloppe peut peser plus lourd qu’une valise.', [un('nour', 0, 'triste')], { theme: 'mystere', tint: 'nuit' }),
      reac('route', [un('nour', -0.5, 'triste'), un('yacine', 0.5, 'tendre')], 3.2, { theme: 'mystere', tint: 'nuit', cam: 'push' }),
      dit('route', 'papa', 'low, tired, to himself', 'Salma, j’ai peur de la regarder dans les yeux. Il y a des choses que je n’ai jamais dites à ma mère.', [un('papa', -0.5, 'triste'), un('maman', 0.5, 'tendre')], { theme: 'separation', tint: 'nuit' }),
      dit('route', 'maman', 'gentle, steady', 'Elle t’attend depuis cinq ans, Karim. Une mère ne compte pas les années. Elle compte les jours où son fils revient.', [un('papa', -0.5, 'triste'), un('maman', 0.5, 'tendre')], { theme: 'separation', tint: 'nuit' }),
      reac('route', [un('nour', 0, 'surprise', { act: 'coeur' })], 3, { theme: 'mystere', tint: 'nuit', cam: 'push' }),
      dit('atlas', 'narration', 'soft, awed', 'À l’aube, la route monta vers l’Atlas. Là-haut, entre les cèdres et la neige, un village attendait. Et devant la plus petite maison, une silhouette blanche agitait la main.', [], { theme: 'espoir', cam: 'pan' }),
      dit('atlas', 'yacine', 'ecstatic, small child', 'Lalla Zahra ! Lalla Zahra ! C’est nous ! C’est nous !', [un('yacine', 0, 'joie', { act: 'secoue' })], { theme: 'espoir' }),
      dit('atlas', 'zahra', 'joyful, tearful, old woman', 'Mes oiseaux ! Mes petits oiseaux sont revenus ! *Hamdoullah*, *hamdoullah*. Venez que je vous regarde.', [un('nour', -0.5, 'joie'), un('zahra', 0.5, 'joie', { emo2: 'tendre' })], { theme: 'retrouvailles' }),
      dit('atlas', 'zahra', 'emotional, trembling', 'Karim… mon fils. Tu as maigri. Viens ici, que je sente ton odeur.', [un('papa', -0.5, 'triste'), un('zahra', 0.5, 'tendre', { act: 'tend' })], { theme: 'retrouvailles', cam: 'push' }),
      dit('atlas', 'papa', 'voice breaking', '*Yemma*… pardon d’avoir été si long.', [un('papa', 0, 'pleure', { act: 'coeur' })], { theme: 'retrouvailles', cam: 'push' }),
      dit('atlas', 'zahra', 'tender, firm', 'Chut. On ne dit pas pardon à une mère qui te serre dans ses bras.', [un('papa', -0.5, 'pleure'), un('zahra', 0.5, 'tendre', { act: 'coeur' })], { theme: 'retrouvailles' }),
      dit('dar', 'narration', 'warm', 'Pendant trois jours, la maison de pierre fut remplie de pain chaud, de thé à la menthe et de rires. Mais dans le sac de Nour, l’enveloppe brûlait chaque heure un peu plus.', [un('nour', 0, 'triste')], { theme: 'famille', cam: 'pan' }),
      dit('dar', 'nour', 'trembling, brave', 'Lalla… j’ai quelque chose à te donner. Je crois que c’est à toi depuis très longtemps.', [un('nour', -0.5, 'peur'), un('zahra', 0.5, 'surprise')], { theme: 'mystere' }),
      dit('dar', 'zahra', 'reading, trembling', '« Pour ma mère, Lalla Zahra, de la part de son fils Hassan. » Hassan ?', [un('zahra', 0, 'surprise', { act: 'bouche' })], { theme: 'mystere', cam: 'push' }),
      dit('dar', 'papa', 'shocked, from the doorway', 'Nour… où as-tu trouvé ça ?', [un('nour', -0.5, 'peur', { act: 'recule' }), un('papa', 0.5, 'surprise', { act: 'choc' })], { theme: 'mystere', fx: ['flash'], cam: 'shake' }),
      dit('dar', 'zahra', 'whispering, broken', 'Hassan… mon premier-né. Vingt-cinq ans que je pleure un fils qui ne m’a jamais écrit.', [un('zahra', 0, 'pleure')], { theme: 'separation', cam: 'push' }),
      dit('atlas', 'narration', 'low, mysterious', 'Ce soir-là, sous les étoiles de l’Atlas, une mère ouvrit enfin une lettre. Et dans cette lettre, il y avait un nom, une adresse, et un secret que son fils cadet gardait depuis toute une vie.', [], { theme: 'mystere', tint: 'nuit', cam: 'pan' }),
    ],
  },
];

export const avecVoix = (plan) => !!plan.parle;

export function texteParle(plan) {
  return `[${plan.ton}] ${plan.texte.replace(/\*/g, '')}`;
}
