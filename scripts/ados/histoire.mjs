// « Le Fil d'or » : feuilleton dramatique pour adolescents (saison 1, 6 épisodes).
// Histoire, personnages et dialogues originaux. Le fil de l'histoire : une
// brodeuse de Fès, sa fille, un secret de famille vieux de seize ans.
//
// Un plan = un décor, des personnages (position x de -1 à 1, émotion), et au
// plus une réplique. Les mots entre astérisques (*Yemma*) sont de la darija :
// ils s'affichent en or. `ton` est l'indication jouée par la voix.

export const PERSOS = {
  salma: { nom: 'Salma', voix: 'sQfOhaIRbFZ7R8bP1x9f', hauteur: 1.0 },
  ghita: { nom: 'Ghita', voix: 'w85ZODduJOHPSdpVT1ia', hauteur: 0.94 },
  reda: { nom: 'Reda', voix: 'IbTlccXlWxGVwnbGUHEd', hauteur: 0.98 },
  anas: { nom: 'Anas', voix: 'IbTlccXlWxGVwnbGUHEd', hauteur: 1.08 },
  zineb: { nom: 'Zineb', voix: 'EXAVITQu4vr4xnSDxMaL', hauteur: 0.92 },
  kenza: { nom: 'Lalla Kenza', voix: 'EXAVITQu4vr4xnSDxMaL', hauteur: 0.84 },
  narration: { nom: '', voix: 'jvSOBXJ1cP2sdvT5RgUP', hauteur: 0.96 },
};

const un = (id, x, emo = 'neutre') => ({ id, x, emo });

export const EPISODES = [
  {
    numero: 1,
    titre: 'Le fil d’or',
    demain: 'Al Andalus',
    plans: [
      { bg: 'aube', parle: 'narration', ton: 'softly', texte: 'Fès. Cinq heures du matin. Dans la médina, une seule fenêtre est déjà allumée.', persos: [] },
      { bg: 'atelier', parle: 'salma', ton: 'happy', texte: 'Encore un point, *Yemma*, et la fleur est finie.', persos: [un('salma', 0, 'joie')] },
      { bg: 'atelier', parle: 'zineb', ton: 'gently', texte: 'Tes mains travaillent comme les miennes. Mais ton cœur voit plus loin.', persos: [un('salma', -0.5, 'tendre'), un('zineb', 0.5, 'tendre')] },
      { bg: 'atelier', parle: 'zineb', ton: 'coughing', texte: 'Ce n’est rien. Un peu de poussière.', persos: [un('salma', -0.5, 'peur'), un('zineb', 0.5, 'malade')] },
      { bg: 'atelier', parle: 'anas', ton: 'excited', texte: 'Salma ! Le facteur ! Une lettre avec un cachet doré. Pour toi !', persos: [un('salma', -0.5, 'surprise'), un('anas', 0.5, 'joie')] },
      { bg: 'atelier', parle: 'salma', ton: 'surprised', texte: 'Le lycée Al Andalus m’offre une bourse complète… Mais qui a bien pu ?', persos: [un('salma', 0, 'surprise')] },
      { bg: 'atelier', parle: 'zineb', ton: 'firm but warm', texte: 'Tu y vas, ma fille. Le fil d’or ne s’arrête jamais.', persos: [un('salma', -0.5, 'triste'), un('zineb', 0.5, 'tendre')] },
      { bg: 'toits', parle: 'anas', ton: 'softly', texte: 'Garde ça. Pour te souvenir de la musique de la médina.', persos: [un('salma', -0.5, 'tendre'), un('anas', 0.5, 'tendre')] },
      { bg: 'atelier', tint: 'nuit', parle: 'narration', ton: 'mysterious', texte: 'Ce soir-là, Zineb a regardé une vieille photo. Celle qu’elle cachait depuis seize ans.', persos: [un('zineb', 0, 'triste')] },
    ],
  },
  {
    numero: 2,
    titre: 'La porte d’Al Andalus',
    demain: 'Les mains de Yemma',
    plans: [
      { bg: 'lycee', parle: 'narration', ton: 'softly', texte: 'Al Andalus. Ici, les murs sont en zellige, et les sourires sont en glace.', persos: [] },
      { bg: 'lycee', parle: 'salma', ton: 'nervous whisper', texte: 'Respire, Salma. Tu as ta place ici.', persos: [un('salma', 0, 'peur')] },
      { bg: 'lycee', parle: 'ghita', ton: 'cold, mocking', texte: 'Une boursière. On dirait que le lycée ramasse tout ce qui traîne.', persos: [un('salma', -0.5, 'triste'), un('ghita', 0.5, 'froid')] },
      { bg: 'lycee', parle: 'salma', ton: 'trembling but proud', texte: 'Je m’appelle Salma. Pas « tout ce qui traîne ».', persos: [un('salma', -0.5, 'colere'), un('ghita', 0.5, 'surprise')] },
      { bg: 'lycee', parle: 'reda', ton: 'calm, firm', texte: 'Laisse-la, Ghita. Elle est dans ma classe.', persos: [un('ghita', -0.5, 'colere'), un('reda', 0.5, 'neutre')] },
      { bg: 'lycee', parle: 'reda', ton: 'warm', texte: 'Bienvenue à Al Andalus. Moi, c’est Reda. J’ai vu ton bracelet : tu brodes, n’est-ce pas ?', persos: [un('salma', -0.5, 'surprise'), un('reda', 0.5, 'joie')] },
      { bg: 'lycee', tint: 'froid', parle: 'salma', ton: 'shocked whisper', texte: 'Cette broche… c’est le point de *Yemma*. Comment est-ce possible ?', persos: [un('salma', 0, 'surprise')] },
      { bg: 'lycee', tint: 'froid', parle: 'narration', ton: 'mysterious', texte: 'Une broche. Un secret. Et déjà, une ennemie.', persos: [un('ghita', 0, 'froid')] },
    ],
  },
  {
    numero: 3,
    titre: 'Les mains de Yemma',
    demain: 'Le prix du silence',
    plans: [
      { bg: 'lycee', tint: 'froid', parle: 'anas', ton: 'panicked', texte: 'Salma ! C’est ta mère ! Elle est tombée dans l’atelier. Viens vite !', persos: [un('anas', 0, 'peur')] },
      { bg: 'lycee', tint: 'froid', parle: 'salma', ton: 'desperate', texte: 'Tant pis pour l’examen. *Yemma* passe avant tout.', persos: [un('salma', 0, 'pleure')] },
      { bg: 'hopital', parle: 'narration', ton: 'grave', texte: 'Le médecin a parlé de trois semaines. Trois semaines pour réunir l’argent d’une opération.', persos: [un('salma', -0.5, 'triste'), un('anas', 0.5, 'triste')] },
      { bg: 'hopital', parle: 'zineb', ton: 'weak, tender', texte: 'Ne pleure pas, ma fille. Les brodeuses ne pleurent pas. Elles recousent.', persos: [un('salma', -0.5, 'pleure'), un('zineb', 0.5, 'malade')] },
      { bg: 'hopital', parle: 'salma', ton: 'fierce, crying', texte: 'Je trouverai l’argent. Je te le jure sur le fil d’or.', persos: [un('salma', 0, 'pleure')] },
      { bg: 'hopital', parle: 'anas', ton: 'sincere', texte: 'Je t’aide. Je vendrai mon oud s’il le faut.', persos: [un('salma', -0.5, 'tendre'), un('anas', 0.5, 'tendre')] },
      { bg: 'villa', tint: 'nuit', parle: 'narration', ton: 'mysterious', texte: 'Il restait une seule personne assez riche pour l’aider. Celle qui la détestait.', persos: [un('ghita', 0, 'froid')] },
    ],
  },
  {
    numero: 4,
    titre: 'Le prix du silence',
    demain: 'La robe',
    plans: [
      { bg: 'villa', parle: 'narration', ton: 'softly', texte: 'Chez les Benjelloun, même le silence coûte cher.', persos: [] },
      { bg: 'villa', parle: 'salma', ton: 'steady', texte: 'J’ai besoin d’argent. Et ta robe du gala n’est pas finie. Je sais broder.', persos: [un('salma', -0.5, 'neutre'), un('ghita', 0.5, 'surprise')] },
      { bg: 'villa', parle: 'ghita', ton: 'amused, cold', texte: 'Marché conclu. Mais personne ne le saura. Jamais.', persos: [un('salma', -0.5, 'triste'), un('ghita', 0.5, 'froid')] },
      { bg: 'atelier', tint: 'nuit', parle: 'salma', ton: 'tired, soft', texte: 'C’est pour *Yemma*, Anas. Je n’ai pas le choix.', persos: [un('salma', -0.5, 'triste'), un('anas', 0.5, 'colere')] },
      { bg: 'atelier', tint: 'nuit', parle: 'anas', ton: 'hurt', texte: 'Elle t’a humiliée. Et moi, je ne compte pas ? Tu as changé depuis Al Andalus.', persos: [un('salma', -0.5, 'surprise'), un('anas', 0.5, 'triste')] },
      { bg: 'atelier', tint: 'nuit', parle: 'reda', ton: 'quietly stunned', texte: 'Ces points d’or… je les ai déjà vus sur la broche de la grand-mère de Ghita.', persos: [un('salma', -0.5, 'peur'), un('reda', 0.5, 'surprise')] },
      { bg: 'atelier', tint: 'nuit', parle: 'narration', ton: 'mysterious', texte: 'Un secret de plus. Et le gala approchait.', persos: [un('salma', 0, 'peur')] },
    ],
  },
  {
    numero: 5,
    titre: 'La robe',
    demain: 'Lalla Kenza',
    plans: [
      { bg: 'gala', parle: 'narration', ton: 'grand', texte: 'Le gala d’Al Andalus. Des lustres, des caftans, et une robe qui brille comme un lever de soleil.', persos: [] },
      { bg: 'gala', parle: 'ghita', ton: 'proud, loud', texte: 'Cette robe, c’est moi qui l’ai brodée. Chaque point.', persos: [un('ghita', 0, 'joie')] },
      { bg: 'gala', parle: 'salma', ton: 'shaken', texte: 'Ghita… tu avais promis.', persos: [un('salma', -0.5, 'surprise'), un('ghita', 0.5, 'froid')] },
      { bg: 'gala', parle: 'ghita', ton: 'ice cold', texte: 'Une promesse à une boursière ? Personne ne te croira.', persos: [un('salma', -0.5, 'triste'), un('ghita', 0.5, 'froid')] },
      { bg: 'gala', parle: 'reda', ton: 'steady', texte: 'Je te crois, Salma.', persos: [un('reda', 0, 'tendre')] },
      { bg: 'toits', tint: 'pluie', parle: 'salma', ton: 'sobbing', texte: 'Plus d’argent. Plus de robe. Plus rien. *Yemma*, pardonne-moi.', persos: [un('salma', 0, 'pleure')] },
      { bg: 'toits', tint: 'pluie', parle: 'anas', ton: 'soft, warm', texte: 'Je l’ai vendu, mon oud. Prends. C’est pour elle.', persos: [un('salma', -0.5, 'pleure'), un('anas', 0.5, 'tendre')] },
      { bg: 'villa', tint: 'nuit', parle: 'narration', ton: 'mysterious', texte: 'Et dans une grande maison, une vieille dame venait de tout comprendre.', persos: [un('kenza', 0, 'triste')] },
    ],
  },
  {
    numero: 6,
    titre: 'Lalla Kenza',
    demain: 'Saison 2',
    plans: [
      { bg: 'villa', parle: 'narration', ton: 'softly', texte: 'Le lendemain, une vieille dame fit appeler Salma.', persos: [] },
      { bg: 'villa', parle: 'kenza', ton: 'gentle, shaky', texte: 'Approche, mon enfant. Montre-moi tes mains.', persos: [un('salma', -0.5, 'peur'), un('kenza', 0.5, 'tendre')] },
      { bg: 'villa', parle: 'kenza', ton: 'emotional', texte: 'Ces points… c’est le point de ma fille Zineb. Elle est partie il y a seize ans, par amour.', persos: [un('kenza', 0, 'pleure')] },
      { bg: 'villa', parle: 'salma', ton: 'stunned whisper', texte: 'Zineb, c’est ma mère. Alors vous êtes… ma grand-mère ?', persos: [un('salma', 0, 'surprise')] },
      { bg: 'villa', parle: 'kenza', ton: 'ashamed', texte: 'C’est moi qui ai envoyé la bourse. Par orgueil, je n’osais pas écrire mon nom. Et Ghita est ta cousine.', persos: [un('salma', -0.5, 'surprise'), un('kenza', 0.5, 'triste')] },
      { bg: 'hopital', parle: 'zineb', ton: 'whispering, weak', texte: '*Yemma*… c’est toi ?', persos: [un('kenza', -0.5, 'pleure'), un('zineb', 0.5, 'malade')] },
      { bg: 'hopital', parle: 'kenza', ton: 'crying', texte: 'Pardon, Zineb. Pardonne à ta vieille mère.', persos: [un('kenza', -0.5, 'pleure'), un('zineb', 0.5, 'tendre')] },
      { bg: 'aube', parle: 'narration', ton: 'warm, hopeful', texte: 'Le fil d’or s’était renoué. Mais l’histoire de Salma ne faisait que commencer.', persos: [un('salma', 0, 'tendre')] },
    ],
  },
];

/** Le texte tel que la voix le dit : sans astérisques, darija écrite pour être bien prononcée. */
export function texteParle(plan) {
  const dire = plan.texte.replace(/\*/g, '').replace(/3afak/gi, 'âafak');
  return `[${plan.ton}] ${dire}`;
}
