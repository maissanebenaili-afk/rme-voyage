// « La Patronne cachée » : feuilleton court pour adultes, 100 % original.
// Salma fait le ménage dans la villa des Bennani, à Casablanca. On l'humilie.
// Personne ne sait qu'elle possède la maison de couture qui fait vivre cette famille.
// Épisodes brefs (environ 1 min 30), chacun finit sur une question.
// Aucun personnage, lieu précis, marque ou musique n'est repris d'une œuvre existante.
// Même format que histoire-atlas.mjs ; mêmes thèmes musicaux (musique-atlas.mjs).

export const SERIE = {
  titre: 'La Patronne cachée',
  etiquette: 'ÉPISODE',
  dossier: 'videos-patronne',
  musique: 'atlas',
  duree: [60, 180], // secondes, pour le contrôle qualité
};

export const PERSOS = {
  salma: { nom: 'Salma', voix: 'sQfOhaIRbFZ7R8bP1x9f', hauteur: 1.0 },
  nadia: { nom: 'Lalla Nadia', voix: 'w85ZODduJOHPSdpVT1ia', hauteur: 0.9 },
  sofia: { nom: 'Sofia', voix: 'EXAVITQu4vr4xnSDxMaL', hauteur: 1.05 },
  omar: { nom: 'Omar', voix: 'IbTlccXlWxGVwnbGUHEd', hauteur: 0.98 },
  mina: { nom: 'Mina', voix: 'EXAVITQu4vr4xnSDxMaL', hauteur: 0.84 },
  adam: { nom: 'Maître Adam', voix: 'IbTlccXlWxGVwnbGUHEd', hauteur: 0.92 },
  narration: { nom: '', voix: 'azure:fr-FR-Soleil:MAI-Voice-2', hauteur: 1 },
};

const un = (id, x, emo = 'neutre', extra = {}) => ({ id, x, emo, ...extra });
const dit = (bg, parle, ton, texte, persos = [], extra = {}) => ({ bg, parle, ton, texte, persos, ...extra });
const reac = (bg, persos, duree, extra = {}) => ({ bg, persos, duree, ...extra });

export const EPISODES = [
  {
    numero: 1,
    titre: 'Le verre renversé',
    demain: 'La broche volée',
    question: 'Qui est vraiment Salma ?',
    plans: [
      dit('gala', 'nadia', 'cold, furious, hissing', 'Regarde ce que tu as fait ! Une robe à trente mille dirhams. Toi, tu ne gagnes même pas ça en un an.', [un('salma', -0.5, 'peur', { act: 'recule' }), un('nadia', 0.5, 'colere', { act: 'doigt' })], { theme: 'mystere', cam: 'shake' }),
      reac('gala', [un('salma', 0, 'surprise', { emo2: 'triste', act: 'bouche' })], 2.2, { theme: 'mystere', cam: 'push' }),
      dit('gala', 'narration', 'low, storyteller', 'Ce soir-là, devant deux cents invités, Salma baissa la tête. Elle faisait le ménage dans cette villa depuis trois ans. Et depuis trois ans, elle se taisait.', [un('salma', 0, 'triste', { act: 'baisse' })], { theme: 'separation', cam: 'push' }),
      dit('gala', 'sofia', 'mocking, sweet poison', 'Laisse, Tata Nadia. Elle ne sait pas ce que c’est, la soie. Chez elle, on s’habille au marché.', [un('sofia', -0.5, 'joie', { act: 'rire' }), un('nadia', 0.5, 'colere', { emo2: 'joie' })], { theme: 'mystere', cam: 'pan' }),
      dit('gala', 'salma', 'quiet, steady', 'Pardon, Lalla. Je vais nettoyer.', [un('salma', 0, 'triste', { emo2: 'froid' })], { theme: 'separation', cam: 'push' }),
      dit('gala', 'omar', 'firm, embarrassed', 'Maman, ça suffit. C’est moi qui l’ai bousculée. Salma n’y est pour rien.', [un('salma', -0.5, 'triste', { emo2: 'surprise' }), un('omar', 0.5, 'colere', { act: 'avance' })], { theme: 'nour', cam: 'pan' }),
      dit('gala', 'nadia', 'icy, low', 'Omar. On ne défend pas une bonne devant mes invités. Demain, elle prend ses affaires.', [un('nadia', -0.5, 'froid', { act: 'doigt' }), un('omar', 0.5, 'colere', { emo2: 'triste', act: 'recule' })], { theme: 'mystere', cam: 'push' }),
      reac('rue', [un('salma', 0, 'triste', { emo2: 'pleure', act: 'baisse' })], 3, { theme: 'separation', tint: 'pluie', cam: 'push' }),
      dit('dar', 'mina', 'tender, worried, old woman', 'Ma fille, pourquoi tu acceptes ça ? Dis-leur qui tu es. Dis-leur, et tout s’arrête.', [un('salma', -0.5, 'pleure'), un('mina', 0.5, 'tendre', { act: 'tend' })], { theme: 'famille', tint: 'nuit', cam: 'pan' }),
      dit('dar', 'salma', 'soft, determined', 'Pas encore, Yemma. Papa disait : pour connaître le cœur des gens, regarde comment ils parlent à ceux qui les servent.', [un('salma', -0.5, 'triste', { emo2: 'tendre', act: 'secoue' }), un('mina', 0.5, 'triste', { act: 'baisse' })], { theme: 'famille', tint: 'nuit', cam: 'push' }),
      dit('dar', 'narration', 'soft, mysterious', 'Alors le téléphone sonna. Un numéro que Salma connaissait par cœur.', [un('salma', 0, 'tendre', { emo2: 'surprise', act: 'choc' })], { theme: 'mystere', tint: 'nuit', cam: 'shake' }),
      dit('dar', 'adam', 'respectful, formal', 'Madame la Présidente, bonsoir. Le conseil de la Maison Bennani se réunit dans trois jours. Ils veulent enfin voir votre visage.', [un('salma', 0, 'surprise', { emo2: 'froid' })], { theme: 'mystere', tint: 'nuit', cam: 'push' }),
      dit('dar', 'narration', 'low, mysterious', 'La femme qu’on venait de chasser possédait tout : les ateliers, la marque, et le toit de ceux qui l’avaient humiliée.', [un('salma', 0, 'froid', { act: 'menton' })], { theme: 'mystere', tint: 'nuit', fx: ['flash'], cam: 'push' }),
    ],
  },
  {
    numero: 2,
    titre: 'La broche volée',
    demain: 'La porte du conseil',
    question: 'Que fera Salma quand elle entrera dans la salle ?',
    plans: [
      dit('villa', 'sofia', 'shrill, screaming', 'Au voleur ! Ma broche ! La broche en or de ma grand-mère a disparu !', [un('sofia', 0, 'colere', { act: 'choc' })], { theme: 'mystere', insert: 'broche', cam: 'shake' }),
      dit('villa', 'narration', 'soft, storyteller', 'Le lendemain, Salma était revenue chercher ses affaires. Elle n’eut pas le temps de dire bonjour.', [un('salma', 0, 'neutre', { emo2: 'peur', act: 'recule' })], { theme: 'mystere', cam: 'pan' }),
      dit('villa', 'sofia', 'accusing, venomous', 'Elle était sur la table. Et qui est passé par là ? La bonne. Toujours la bonne.', [un('sofia', -0.5, 'colere', { act: 'doigt' }), un('salma', 0.5, 'surprise', { emo2: 'triste' })], { theme: 'mystere', cam: 'push' }),
      dit('villa', 'salma', 'calm, hurt', 'Je n’ai jamais rien pris dans cette maison. Pas même un verre d’eau sans demander.', [un('salma', 0, 'triste', { act: 'secoue' })], { theme: 'separation', cam: 'push' }),
      dit('villa', 'nadia', 'contemptuous, slow', 'Vide ton sac. Par terre. Devant tout le monde. Les pauvres, on les connaît.', [un('nadia', -0.5, 'froid', { act: 'doigt' }), un('salma', 0.5, 'triste', { emo2: 'pleure' })], { theme: 'mystere', cam: 'push' }),
      reac('villa', [un('salma', 0, 'pleure', { act: 'baisse' })], 2.6, { theme: 'separation', cam: 'push' }),
      dit('villa', 'narration', 'low, storyteller', 'Salma vida son sac. Un foulard. Des clés. Et la photo d’un vieil homme devant une machine à coudre.', [un('salma', 0, 'triste', { act: 'baisse' })], { theme: 'separation', cam: 'pan' }),
      dit('villa', 'omar', 'struck, slow', 'Cet homme… je le connais. Il est sur le mur du grand atelier. C’est Si Brahim, le tailleur. Celui qui a tout commencé.', [un('omar', -0.5, 'neutre', { emo2: 'surprise', act: 'choc' }), un('salma', 0.5, 'peur', { act: 'recule' })], { theme: 'nour', cam: 'shake' }),
      dit('villa', 'salma', 'guarded, quick', 'C’était un voisin. Rendez-moi ma photo.', [un('salma', 0, 'peur', { emo2: 'froid', act: 'tend' })], { theme: 'mystere', cam: 'push' }),
      dit('villa', 'narration', 'soft, mysterious', 'La broche, elle, dormait au fond du sac de Sofia. Et Sofia le savait très bien.', [un('sofia', 0, 'neutre', { emo2: 'joie', act: 'menton' })], { theme: 'mystere', tint: 'froid', insert: 'broche', cam: 'push' }),
      dit('rue', 'omar', 'out of breath, sincere', 'Salma, attendez ! Je ne crois pas un mot de ce qu’elles disent. Laissez-moi vous aider.', [un('salma', -0.5, 'pleure', { emo2: 'surprise' }), un('omar', 0.5, 'tendre', { act: 'avance' })], { theme: 'espoir', tint: 'pluie', cam: 'pan' }),
      dit('rue', 'salma', 'gentle, sad smile', 'Vous êtes le seul à m’avoir dit bonjour en trois ans, Omar. Je ne l’oublierai pas. Dans trois jours, vous comprendrez.', [un('salma', -0.5, 'triste', { emo2: 'tendre', act: 'coeur' }), un('omar', 0.5, 'surprise')], { theme: 'espoir', tint: 'pluie', cam: 'push' }),
      dit('gala', 'narration', 'low, building', 'Trois jours plus tard, au dernier étage, la famille Bennani attendait le mystérieux propriétaire. Nadia avait mis ses plus beaux bijoux.', [un('nadia', -0.5, 'joie', { act: 'menton' }), un('sofia', 0.5, 'joie', { act: 'rire' })], { theme: 'mystere', cam: 'pan' }),
      dit('gala', 'adam', 'solemn, loud', 'Mesdames, messieurs, levez-vous. La Présidente arrive.', [un('nadia', -0.5, 'joie', { emo2: 'surprise', act: 'choc' }), un('omar', 0.5, 'surprise')], { theme: 'mystere', fx: ['flash'], cam: 'shake' }),
    ],
  },
  {
    numero: 3,
    titre: 'La porte du conseil',
    demain: 'Saison 2 : le traître de l’atelier',
    question: 'Qui a volé l’atelier de Si Brahim, il y a trente ans ?',
    plans: [
      dit('gala', 'narration', 'low, slow', 'La porte s’ouvrit. Pas de tailleur de luxe. Pas de bijoux. Une femme en robe simple, un foulard sur l’épaule.', [un('salma', 0, 'froid', { act: 'avance' })], { theme: 'mystere', cam: 'push' }),
      dit('gala', 'nadia', 'outraged, shouting', 'Qui a laissé entrer la bonne ? Sécurité ! Sortez-la d’ici !', [un('nadia', -0.5, 'colere', { act: 'doigt' }), un('salma', 0.5, 'froid')], { theme: 'mystere', cam: 'shake' }),
      dit('gala', 'adam', 'calm, sharp', 'Madame Bennani, asseyez-vous. Vous parlez à Salma Brahimi, propriétaire de cinquante et un pour cent de cette maison.', [un('adam', -0.5, 'neutre', { act: 'explique' }), un('nadia', 0.5, 'colere', { emo2: 'surprise', act: 'choc' })], { theme: 'mystere', fx: ['flash'], cam: 'push' }),
      reac('gala', [un('sofia', -0.5, 'surprise', { emo2: 'peur', act: 'bouche' }), un('nadia', 0.5, 'peur', { act: 'recule' })], 3, { theme: 'mystere', cam: 'shake' }),
      dit('gala', 'salma', 'steady, quiet power', 'Mon père a cousu la première robe de cette maison, dans une chambre sans fenêtre. Il est mort pauvre. Ses parts, elles, ne sont jamais mortes.', [un('salma', 0, 'triste', { emo2: 'froid', act: 'poing' })], { theme: 'separation', cam: 'push' }),
      dit('gala', 'sofia', 'panicked, pleading', 'Salma… ma chérie… pour la broche, c’était un malentendu, je te jure sur ma vie !', [un('sofia', -0.5, 'peur', { act: 'tend' }), un('salma', 0.5, 'froid')], { theme: 'mystere', cam: 'pan' }),
      dit('gala', 'salma', 'cold, clear', 'La broche est dans ton sac, Sofia. Elle y est depuis le premier jour. Rends-la à ta grand-mère, pas à moi.', [un('sofia', -0.5, 'peur', { emo2: 'pleure', act: 'baisse' }), un('salma', 0.5, 'froid', { act: 'doigt' })], { theme: 'mystere', insert: 'broche', cam: 'push' }),
      dit('gala', 'nadia', 'broken, trembling', 'Tu vas nous jeter à la rue… c’est ça ? Vas-y. Venge-toi. Je le mérite.', [un('nadia', 0, 'peur', { emo2: 'pleure', act: 'baisse' })], { theme: 'separation', cam: 'push' }),
      reac('gala', [un('salma', 0, 'froid', { emo2: 'tendre' })], 2.6, { theme: 'retrouvailles', cam: 'push' }),
      dit('gala', 'salma', 'gentle, firm', 'Non, Lalla. Je ne prends le toit de personne. Mais demain matin, vous irez à l’atelier, et vous direz bonjour à chaque ouvrière. Par son prénom.', [un('salma', -0.5, 'tendre', { act: 'secoue' }), un('nadia', 0.5, 'pleure')], { theme: 'retrouvailles', cam: 'pan' }),
      dit('gala', 'omar', 'moved, smiling', 'Trois ans que vous nous regardiez… Et moi qui voulais vous aider.', [un('omar', -0.5, 'surprise', { emo2: 'tendre', act: 'hausse' }), un('salma', 0.5, 'joie')], { theme: 'espoir', cam: 'push' }),
      dit('gala', 'salma', 'warm, light', 'Vous m’avez aidée, Omar. Vous m’avez dit bonjour.', [un('omar', -0.5, 'joie'), un('salma', 0.5, 'tendre', { act: 'coeur' })], { theme: 'retrouvailles', cam: 'push' }),
      dit('atelier', 'mina', 'proud, tearful, old woman', 'Ton père te regarde, ma fille. Et il sourit.', [un('salma', -0.5, 'joie', { emo2: 'pleure' }), un('mina', 0.5, 'tendre', { act: 'tend' })], { theme: 'famille', cam: 'pan' }),
      dit('atelier', 'narration', 'low, mysterious', 'Mais dans le tiroir du vieux tailleur, Salma trouva une lettre. Et dans cette lettre, le nom de celui qui l’avait trahi.', [un('salma', 0, 'tendre', { emo2: 'surprise', act: 'choc' })], { theme: 'mystere', insert: 'lettre', tint: 'nuit', fx: ['flash'], cam: 'shake' }),
    ],
  },
];

export const avecVoix = (plan) => !!plan.parle;

export function texteParle(plan) {
  return `[${plan.ton}] ${plan.texte.replace(/\*/g, '')}`;
}
