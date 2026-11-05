// « Le Fil d'or » : feuilleton dramatique pour adolescents (saison 1, 6 épisodes).
// Histoire, personnages et dialogues originaux. Le fil : Amal, 15 ans, orpheline
// marquée d'une cicatrice, quitte la maison d'enfants où elle a grandi pour un
// lycée de riches, et découvre le secret du feu qui lui a pris ses parents.
//
// Un plan = un décor, des personnages (position x de -1 à 1, émotion), et au
// plus une réplique. Les mots entre astérisques (*Yemma*) sont de la darija :
// ils s'affichent en or. `ton` est l'indication jouée par la voix.

export const PERSOS = {
  amal: { nom: 'Amal', voix: 'sQfOhaIRbFZ7R8bP1x9f', hauteur: 1.0 },
  ghita: { nom: 'Ghita', voix: 'w85ZODduJOHPSdpVT1ia', hauteur: 0.94 },
  reda: { nom: 'Reda', voix: 'IbTlccXlWxGVwnbGUHEd', hauteur: 0.98 },
  idriss: { nom: 'Idriss', voix: 'IbTlccXlWxGVwnbGUHEd', hauteur: 1.1 },
  rkia: { nom: 'Lalla Rkia', voix: 'EXAVITQu4vr4xnSDxMaL', hauteur: 0.92 },
  kenza: { nom: 'Lalla Kenza', voix: 'EXAVITQu4vr4xnSDxMaL', hauteur: 0.82 },
  narration: { nom: '', voix: 'jvSOBXJ1cP2sdvT5RgUP', hauteur: 0.96 },
};

const un = (id, x, emo = 'neutre') => ({ id, x, emo });

export const EPISODES = [
  {
    numero: 1,
    titre: 'Le fil d’or',
    demain: 'La porte d’Al Andalus',
    plans: [
      { bg: 'aube', parle: 'narration', ton: 'softly', texte: 'Fès. Une vieille maison blanche, au fond de la médina. Vingt-trois enfants y vivent, sans parents.', persos: [] },
      { bg: 'atelier', parle: 'amal', ton: 'happy', texte: 'Regarde, Idriss ! La fleur est finie. Un seul fil d’or, et elle brille !', persos: [un('amal', 0, 'joie')] },
      { bg: 'atelier', parle: 'idriss', ton: 'gently', texte: 'Ne cache pas ton visage, Amal. Cette cicatrice, c’est la preuve que tu es vivante.', persos: [un('amal', -0.5, 'triste'), un('idriss', 0.5, 'tendre')] },
      { bg: 'atelier', parle: 'amal', ton: 'sad, soft', texte: 'Elle me rappelle la nuit du feu. Je ne me souviens que d’une voix qui chantait.', persos: [un('amal', 0, 'triste')] },
      { bg: 'atelier', parle: 'rkia', ton: 'excited', texte: 'Amal ! Une lettre avec un cachet doré ! Le lycée Al Andalus t’offre une bourse !', persos: [un('amal', -0.5, 'surprise'), un('rkia', 0.5, 'joie')] },
      { bg: 'atelier', parle: 'amal', ton: 'surprised', texte: 'Pour moi ? Personne ne connaît mon nom, dehors. Qui m’a choisie ?', persos: [un('amal', 0, 'surprise')] },
      { bg: 'atelier', parle: 'rkia', ton: 'firm but warm', texte: 'Va, ma fille. Les portes ne s’ouvrent pas deux fois.', persos: [un('amal', -0.5, 'triste'), un('rkia', 0.5, 'tendre')] },
      { bg: 'toits', parle: 'idriss', ton: 'softly', texte: 'Prends mon plectre d’oud. Pour que la médina chante dans ta poche.', persos: [un('amal', -0.5, 'tendre'), un('idriss', 0.5, 'tendre')] },
      { bg: 'villa', tint: 'nuit', parle: 'narration', ton: 'mysterious', texte: 'Cette nuit-là, une vieille dame, dans une grande villa, a pleuré en lisant un seul nom : Amal.', persos: [un('kenza', 0, 'triste')] },
    ],
  },
  {
    numero: 2,
    titre: 'La porte d’Al Andalus',
    demain: 'La maison qui va fermer',
    plans: [
      { bg: 'lycee', parle: 'narration', ton: 'softly', texte: 'Al Andalus. Ici, les murs sont en zellige, et les sourires sont en glace.', persos: [] },
      { bg: 'lycee', parle: 'amal', ton: 'nervous whisper', texte: 'Respire, Amal. Tu as ta place ici.', persos: [un('amal', 0, 'peur')] },
      { bg: 'lycee', parle: 'ghita', ton: 'cold, mocking', texte: 'La fille à la cicatrice. L’orphelinat livre à domicile, maintenant ?', persos: [un('amal', -0.5, 'triste'), un('ghita', 0.5, 'froid')] },
      { bg: 'lycee', parle: 'amal', ton: 'trembling but proud', texte: 'Je m’appelle Amal. Ça veut dire espoir. Retiens-le.', persos: [un('amal', -0.5, 'colere'), un('ghita', 0.5, 'surprise')] },
      { bg: 'lycee', parle: 'reda', ton: 'calm, firm', texte: 'Ça suffit, Ghita. Elle est dans ma classe.', persos: [un('ghita', -0.5, 'colere'), un('reda', 0.5, 'neutre')] },
      { bg: 'lycee', parle: 'reda', ton: 'warm', texte: 'Moi, c’est Reda. Cette cicatrice, ce n’est pas de la honte. C’est du courage.', persos: [un('amal', -0.5, 'surprise'), un('reda', 0.5, 'joie')] },
      { bg: 'lycee', tint: 'froid', parle: 'amal', ton: 'shocked whisper', texte: 'Cette broche… ce fil d’or… c’est le point de ma mère. Je le reconnaîtrais entre mille.', persos: [un('amal', 0, 'surprise')] },
      { bg: 'lycee', tint: 'froid', parle: 'narration', ton: 'mysterious', texte: 'Une broche. Un secret. Et déjà, une ennemie.', persos: [un('ghita', 0, 'froid')] },
    ],
  },
  {
    numero: 3,
    titre: 'La maison qui va fermer',
    demain: 'Le prix du silence',
    plans: [
      { bg: 'lycee', tint: 'froid', parle: 'idriss', ton: 'panicked', texte: 'Amal ! Lalla Rkia pleure. La maison va fermer. Des dettes. Trois semaines.', persos: [un('idriss', 0, 'peur')] },
      { bg: 'lycee', tint: 'froid', parle: 'amal', ton: 'desperate', texte: 'Fermer ? Et les petits, ils iront où ? Tant pis pour l’examen. Je rentre.', persos: [un('amal', 0, 'pleure')] },
      { bg: 'hopital', parle: 'narration', ton: 'grave', texte: 'Trois semaines pour trouver l’argent. Ou vingt-trois enfants perdraient leur toit.', persos: [un('amal', -0.5, 'triste'), un('idriss', 0.5, 'triste')] },
      { bg: 'hopital', parle: 'rkia', ton: 'weak, tender', texte: 'Ne pleure pas, ma fille. Une maison, c’est des murs. L’amour, personne ne peut le fermer.', persos: [un('amal', -0.5, 'pleure'), un('rkia', 0.5, 'malade')] },
      { bg: 'hopital', parle: 'amal', ton: 'fierce, crying', texte: 'Je sauverai la maison. Je le jure sur le fil d’or.', persos: [un('amal', 0, 'pleure')] },
      { bg: 'hopital', parle: 'idriss', ton: 'sincere', texte: 'Je t’aide. Je vendrai mon oud s’il le faut.', persos: [un('amal', -0.5, 'tendre'), un('idriss', 0.5, 'tendre')] },
      { bg: 'villa', tint: 'nuit', parle: 'narration', ton: 'mysterious', texte: 'Il restait une seule personne assez riche pour l’aider. Celle qui la détestait.', persos: [un('ghita', 0, 'froid')] },
    ],
  },
  {
    numero: 4,
    titre: 'Le prix du silence',
    demain: 'La robe',
    plans: [
      { bg: 'villa', parle: 'narration', ton: 'softly', texte: 'Chez les Benjelloun, même le silence coûte cher.', persos: [] },
      { bg: 'villa', parle: 'amal', ton: 'steady', texte: 'J’ai besoin d’argent. Ta robe du gala n’est pas finie. Moi, je sais broder.', persos: [un('amal', -0.5, 'neutre'), un('ghita', 0.5, 'surprise')] },
      { bg: 'villa', parle: 'ghita', ton: 'amused, cold', texte: 'Marché conclu. Mais personne ne le saura. Jamais.', persos: [un('amal', -0.5, 'triste'), un('ghita', 0.5, 'froid')] },
      { bg: 'atelier', tint: 'nuit', parle: 'amal', ton: 'tired, soft', texte: 'C’est pour la maison, Idriss. Pour les petits. Je n’ai pas le choix.', persos: [un('amal', -0.5, 'triste'), un('idriss', 0.5, 'colere')] },
      { bg: 'atelier', tint: 'nuit', parle: 'idriss', ton: 'hurt', texte: 'Elle t’a humiliée. Et moi, je ne compte pas ? Tu as changé depuis Al Andalus.', persos: [un('amal', -0.5, 'surprise'), un('idriss', 0.5, 'triste')] },
      { bg: 'atelier', tint: 'nuit', parle: 'reda', ton: 'quietly stunned', texte: 'Ces points d’or… je les ai déjà vus sur la broche de la grand-mère de Ghita.', persos: [un('amal', -0.5, 'peur'), un('reda', 0.5, 'surprise')] },
      { bg: 'atelier', tint: 'nuit', parle: 'narration', ton: 'mysterious', texte: 'Un secret de plus. Et le gala approchait.', persos: [un('amal', 0, 'peur')] },
    ],
  },
  {
    numero: 5,
    titre: 'La robe',
    demain: 'Lalla Kenza',
    plans: [
      { bg: 'gala', parle: 'narration', ton: 'grand', texte: 'Le gala d’Al Andalus. Des lustres, des caftans, et une robe qui brille comme un lever de soleil.', persos: [] },
      { bg: 'gala', parle: 'ghita', ton: 'proud, loud', texte: 'Cette robe, c’est moi qui l’ai brodée. Chaque point.', persos: [un('ghita', 0, 'joie')] },
      { bg: 'gala', parle: 'amal', ton: 'shaken', texte: 'Ghita… tu avais promis.', persos: [un('amal', -0.5, 'surprise'), un('ghita', 0.5, 'froid')] },
      { bg: 'gala', parle: 'ghita', ton: 'ice cold', texte: 'Une promesse à une orpheline ? Personne ne te croira.', persos: [un('amal', -0.5, 'triste'), un('ghita', 0.5, 'froid')] },
      { bg: 'gala', parle: 'reda', ton: 'steady', texte: 'Moi, je te crois, Amal.', persos: [un('reda', 0, 'tendre')] },
      { bg: 'toits', tint: 'pluie', parle: 'amal', ton: 'sobbing', texte: 'Plus d’argent. Plus de robe. Plus rien. Pardon, Lalla Rkia. Pardon, les petits.', persos: [un('amal', 0, 'pleure')] },
      { bg: 'toits', tint: 'pluie', parle: 'idriss', ton: 'soft, warm', texte: 'Je l’ai vendu, mon oud. Prends. C’est pour la maison.', persos: [un('amal', -0.5, 'pleure'), un('idriss', 0.5, 'tendre')] },
      { bg: 'villa', tint: 'nuit', parle: 'narration', ton: 'mysterious', texte: 'Et dans une grande maison, une vieille dame venait de tout comprendre.', persos: [un('kenza', 0, 'triste')] },
    ],
  },
  {
    numero: 6,
    titre: 'Lalla Kenza',
    demain: 'Saison 2',
    plans: [
      { bg: 'villa', parle: 'narration', ton: 'softly', texte: 'Le lendemain, une vieille dame fit appeler Amal.', persos: [] },
      { bg: 'villa', parle: 'kenza', ton: 'gentle, shaky', texte: 'Approche, mon enfant. Laisse-moi regarder ton visage.', persos: [un('amal', -0.5, 'peur'), un('kenza', 0.5, 'tendre')] },
      { bg: 'villa', parle: 'kenza', ton: 'emotional', texte: 'Ta mère, Zineb, est partie d’ici par amour. Elle revenait me demander pardon, la nuit du feu.', persos: [un('kenza', 0, 'pleure')] },
      { bg: 'villa', parle: 'amal', ton: 'stunned whisper', texte: 'Zineb… c’était ma mère. Alors vous êtes… ma grand-mère ?', persos: [un('amal', 0, 'surprise')] },
      { bg: 'villa', parle: 'kenza', ton: 'ashamed', texte: 'C’est moi qui ai envoyé la bourse. Et Ghita est ta cousine. Pardonne-moi.', persos: [un('amal', -0.5, 'surprise'), un('kenza', 0.5, 'triste')] },
      { bg: 'villa', parle: 'amal', ton: 'broken, whispering', texte: 'Cette cicatrice… c’est elle qui m’a sauvée. Et vous avez fermé la porte.', persos: [un('amal', 0, 'pleure')] },
      { bg: 'villa', parle: 'kenza', ton: 'crying', texte: 'Je n’ai plus que mon orgueil à perdre. La maison de Lalla Rkia ne fermera pas.', persos: [un('amal', -0.5, 'triste'), un('kenza', 0.5, 'pleure')] },
      { bg: 'aube', parle: 'narration', ton: 'warm, hopeful', texte: 'Le fil d’or s’était renoué. Mais Amal avait seize ans de silence à comprendre.', persos: [un('amal', 0, 'tendre')] },
    ],
  },
];

/** Le texte tel que la voix le dit : sans astérisques, darija écrite pour être bien prononcée. */
export function texteParle(plan) {
  const dire = plan.texte.replace(/\*/g, '').replace(/3afak/gi, 'âafak');
  return `[${plan.ton}] ${dire}`;
}
