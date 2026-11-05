// « Bouba et le grand stade » : une série comique et émouvante, 100 % inventée.
// Un petit garçon de neuf ans, ses deux amis, et son grand frère footballeur.
// Le club, le stade, la ville, les noms et les scores sont imaginaires : rien ne
// reproduit un vrai joueur, un vrai club ni un vrai match. La série suit
// seulement le rythme du championnat : un épisode par « journée ».
//
// Même format que histoire.mjs (plans, personnages, gestes, caméra).

export const SERIE = {
  titre: 'Bouba et le grand stade',
  etiquette: 'JOURNÉE',
  dossier: 'videos-foot',
  musique: 'foot',
};

export const PERSOS = {
  bouba: { nom: 'Bouba', voix: 'IbTlccXlWxGVwnbGUHEd', hauteur: 1.3 },
  leo: { nom: 'Léo', voix: 'IbTlccXlWxGVwnbGUHEd', hauteur: 1.18 },
  ines: { nom: 'Inès', voix: 'w85ZODduJOHPSdpVT1ia', hauteur: 1.08 },
  moussa: { nom: 'Moussa', voix: 'IbTlccXlWxGVwnbGUHEd', hauteur: 0.98 },
  agent: { nom: 'L’agent', voix: 'jvSOBXJ1cP2sdvT5RgUP', hauteur: 0.9 },
  narration: { nom: '', voix: 'jvSOBXJ1cP2sdvT5RgUP', hauteur: 1.0 },
};

const un = (id, x, emo = 'neutre', extra = {}) => ({ id, x, emo, ...extra });
const dit = (bg, parle, ton, texte, persos = [], extra = {}) => ({ bg, parle, ton, texte, persos, ...extra });
const reac = (bg, persos, duree, extra = {}) => ({ bg, persos, duree, ...extra });
const trio = (b, l, i) => [un('bouba', -0.8, b[0], b[1]), un('leo', 0, l[0], l[1]), un('ines', 0.8, i[0], i[1])];

export const EPISODES = [
  {
    numero: 1,
    titre: 'On verra',
    demain: 'Le gardien qui avait peur',
    plans: [
      dit('rue', 'narration', 'warm, storyteller', 'Dans le quartier du Port, le samedi, une seule chose compte : le grand match. Et le grand frère de Bouba y joue.', [], { cam: 'pan' }),
      dit('rue', 'bouba', 'excited, shouting', 'Les gars ! Aujourd’hui, Moussa joue au grand stade ! Il m’a promis une place !', trio(['joie', { act: 'secoue' }], ['surprise'], ['joie'])),
      dit('rue', 'leo', 'worried, fast', 'Une place ? Bouba… il t’a donné un billet ? Un vrai ?', trio(['joie'], ['peur', { act: 'avance' }], ['neutre'])),
      dit('rue', 'bouba', 'sheepish', 'Il m’a dit : « on verra ». Pour moi, « on verra », ça veut dire oui.', trio(['tendre', { act: 'poing' }], ['surprise'], ['surprise'])),
      dit('rue', 'ines', 'laughing', 'Pour ta maman, « on verra », ça veut dire non ! Mais on y va quand même !', trio(['joie'], ['peur'], ['joie', { act: 'rire' }]), { cam: 'push' }),
      dit('rue', 'narration', 'playful', 'Alors les trois amis ont fait ce que font tous les héros : ils ont pris le bus, sans billet, mais avec un ballon.', [], { insert: 'ballon' }),
      dit('stade', 'leo', 'amazed, whispering', 'Quarante mille personnes. Les calculs disent qu’on a une chance sur… zéro.', trio(['surprise'], ['peur', { act: 'bouche' }], ['surprise'])),
      dit('stade', 'bouba', 'cheerful, naive', 'Zéro, c’est pas zéro ! C’est juste un nombre qui n’a pas encore essayé !', trio(['joie', { act: 'poing' }], ['surprise'], ['joie', { act: 'rire' }])),
      dit('stade', 'narration', 'dramatic', 'Mais devant la grande porte, un grand monsieur en gilet jaune leur a barré la route.', [un('agent', 0, 'froid', { act: 'avance' })], { cam: 'push' }),
      dit('stade', 'agent', 'gruff', 'Pas de billet, pas de stade, les petits. Allez, circulez.', [un('bouba', -0.5, 'triste', { act: 'baisse' }), un('agent', 0.5, 'froid')]),
      dit('stade', 'bouba', 'small voice, trembling', 'Mon frère joue là-dedans. Il s’appelle Moussa. Il porte le numéro sept.', [un('bouba', 0, 'pleure', { act: 'coeur' })], { cam: 'push' }),
      dit('stade', 'ines', 'firm, proud', 'Regardez ses yeux, monsieur. On ne ment pas avec des yeux comme ça.', trio(['pleure'], ['tendre'], ['colere', { act: 'tend' }])),
      dit('stade', 'agent', 'softening, surprised', 'Moussa ? Celui qui arrive toujours en retard parce qu’il porte les courses de sa mère ? …Entrez.', [un('agent', 0, 'surprise', { emo2: 'tendre' })]),
      dit('tribune', 'narration', 'building, epic', 'Ce soir-là, à la quatre-vingt-dixième minute, Moussa a récupéré le ballon.', [], { cam: 'push', intensite: 0.9 }),
      dit('but', 'narration', 'explosive', 'Et tout le stade s’est levé.', [], { insert: 'but', fx: ['flash'], cam: 'shake' }),
      reac('tribune', trio(['joie', { act: 'secoue' }], ['joie', { act: 'rire' }], ['joie', { act: 'poing' }]), 3.2, { cam: 'push' }),
      dit('stade', 'moussa', 'breathless, laughing', 'Bouba ! Ce but, c’est pour toi, petit frère !', [un('bouba', -0.5, 'surprise'), un('moussa', 0.5, 'joie', { act: 'tend' })]),
      dit('stade', 'bouba', 'crying with joy', 'Je savais bien que « on verra », ça voulait dire oui !', [un('bouba', 0, 'pleure', { emo2: 'joie', act: 'coeur' })], { cam: 'push' }),
      dit('rue', 'narration', 'playful', 'Samedi prochain, nouveau match. Et nouvelle bêtise.', trio(['joie', { act: 'rire' }], ['joie', { act: 'rire' }], ['joie', { act: 'rire' }])),
    ],
  },
];

export const avecVoix = (plan) => !!plan.parle;

export function texteParle(plan) {
  return `[${plan.ton}] ${plan.texte.replace(/\*/g, '')}`;
}
