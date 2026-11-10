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
      dit('gala', 'nadia', 'cold, furious, hissing', 'Regarde ce que tu as fait ! Une robe à trente mille dirhams. Toi, tu ne gagnes même pas ça en un an.', [un('salma', -0.5, 'peur', { act: 'recule' }), un('nadia', 0.5, 'colere', { act: 'doigt' })], { theme: 'mystere', fx: ['flash'], cam: 'shake' }),
      dit('gala', 'narration', 'low, storyteller', 'Ce soir-là, devant deux cents invités, Salma baissa la tête. Elle faisait le ménage dans cette villa depuis trois ans. Et depuis trois ans, elle se taisait.', [un('salma', 0, 'triste', { act: 'baisse' })], { theme: 'separation', cam: 'push' }),
      dit('gala', 'sofia', 'mocking, sweet poison', 'Laisse, Tata Nadia. Elle ne sait pas ce que c’est, la soie. Chez elle, on s’habille au marché.', [un('sofia', -0.5, 'joie', { act: 'rire' }), un('nadia', 0.5, 'colere')], { theme: 'mystere' }),
      dit('gala', 'salma', 'quiet, steady', 'Pardon, Lalla. Je vais nettoyer.', [un('salma', 0, 'triste')], { theme: 'separation' }),
      dit('gala', 'omar', 'firm, embarrassed', 'Maman, ça suffit. C’est moi qui l’ai bousculée. Salma n’y est pour rien.', [un('salma', -0.5, 'surprise'), un('omar', 0.5, 'colere')], { theme: 'nour' }),
      dit('gala', 'nadia', 'icy, low', 'Omar. On ne défend pas une bonne devant mes invités. Demain, elle prend ses affaires.', [un('nadia', -0.5, 'froid'), un('omar', 0.5, 'triste')], { theme: 'mystere', cam: 'push' }),
      reac('rue', [un('salma', 0, 'pleure')], 3, { theme: 'separation', tint: 'pluie', cam: 'push' }),
      dit('dar', 'mina', 'tender, worried, old woman', 'Ma fille, pourquoi tu acceptes ça ? Dis-leur qui tu es. Dis-leur, et tout s’arrête.', [un('salma', -0.5, 'triste'), un('mina', 0.5, 'tendre', { act: 'tend' })], { theme: 'famille', tint: 'nuit' }),
      dit('dar', 'salma', 'soft, determined', 'Pas encore, Yemma. Papa disait : pour connaître le cœur des gens, regarde comment ils parlent à ceux qui les servent.', [un('salma', -0.5, 'tendre'), un('mina', 0.5, 'triste')], { theme: 'famille', tint: 'nuit' }),
      dit('dar', 'narration', 'soft, mysterious', 'Alors le téléphone sonna. Un numéro que Salma connaissait par cœur.', [un('salma', 0, 'surprise')], { theme: 'mystere', tint: 'nuit' }),
      dit('dar', 'adam', 'respectful, formal', 'Madame la Présidente, bonsoir. Le conseil de la Maison Bennani se réunit dans trois jours. Ils veulent enfin voir votre visage.', [un('salma', 0, 'neutre')], { theme: 'mystere', tint: 'nuit', cam: 'push' }),
      dit('dar', 'narration', 'low, mysterious', 'La femme qu’on venait de chasser possédait tout : les ateliers, la marque, et le toit de ceux qui l’avaient humiliée.', [un('salma', 0, 'froid')], { theme: 'mystere', tint: 'nuit', fx: ['flash'], cam: 'push' }),
    ],
  },
  {
    numero: 2,
    titre: 'La broche volée',
    demain: 'La porte du conseil',
    question: 'Que fera Salma quand elle entrera dans la salle ?',
    plans: [
      dit('villa', 'narration', 'soft, storyteller', 'Le lendemain, Salma revint chercher ses affaires. Dans la villa, tout le monde criait.', [un('nadia', 0, 'colere')], { theme: 'mystere', cam: 'pan' }),
      dit('villa', 'sofia', 'shrill, accusing', 'Ma broche ! La broche en or de ma grand-mère ! Elle était sur la table, et la bonne est passée par là !', [un('sofia', -0.5, 'colere', { act: 'doigt' }), un('salma', 0.5, 'surprise')], { theme: 'mystere', insert: 'broche', fx: ['flash'] }),
      dit('villa', 'salma', 'calm, hurt', 'Je n’ai jamais rien pris dans cette maison. Pas même un verre d’eau sans demander.', [un('salma', 0, 'triste')], { theme: 'separation' }),
      dit('villa', 'nadia', 'contemptuous', 'Vide ton sac. Devant tout le monde. Les pauvres, on les connaît.', [un('nadia', -0.5, 'froid', { act: 'doigt' }), un('salma', 0.5, 'triste')], { theme: 'mystere', cam: 'push' }),
      dit('villa', 'narration', 'low, storyteller', 'Salma vida son sac. Un foulard. Des clés. Et la photo d’un vieil homme devant une machine à coudre.', [un('salma', 0, 'triste', { act: 'baisse' })], { theme: 'separation' }),
      dit('villa', 'omar', 'struck, slow', 'Cet homme… je le connais. Il est sur le mur du grand atelier. C’est Si Brahim, le tailleur. Celui qui a tout commencé.', [un('omar', -0.5, 'surprise', { act: 'choc' }), un('salma', 0.5, 'peur')], { theme: 'nour', cam: 'push' }),
      dit('villa', 'salma', 'guarded, quick', 'C’était un voisin. Rendez-moi ma photo.', [un('salma', 0, 'peur', { act: 'recule' })], { theme: 'mystere' }),
      dit('villa', 'narration', 'soft, mysterious', 'La broche, elle, dormait au fond du sac de Sofia. Sofia le savait très bien.', [un('sofia', 0, 'joie')], { theme: 'mystere', tint: 'froid' }),
      dit('rue', 'omar', 'out of breath, sincere', 'Salma, attendez ! Je ne crois pas un mot de ce qu’elles disent. Laissez-moi vous aider.', [un('salma', -0.5, 'triste'), un('omar', 0.5, 'tendre', { act: 'avance' })], { theme: 'espoir' }),
      dit('rue', 'salma', 'gentle, sad smile', 'Vous êtes le seul à m’avoir dit bonjour en trois ans, Omar. Je ne l’oublierai pas. Dans trois jours, vous comprendrez.', [un('salma', -0.5, 'tendre'), un('omar', 0.5, 'surprise')], { theme: 'espoir' }),
      dit('gala', 'narration', 'low, building', 'Trois jours plus tard, la famille Bennani attendait, au dernier étage, le mystérieux propriétaire. Nadia avait mis ses plus beaux bijoux.', [un('nadia', -0.5, 'joie'), un('sofia', 0.5, 'joie')], { theme: 'mystere', cam: 'pan' }),
      dit('gala', 'adam', 'solemn, loud', 'Mesdames, messieurs, levez-vous. La Présidente arrive.', [un('nadia', -0.5, 'surprise'), un('omar', 0.5, 'surprise')], { theme: 'mystere', fx: ['flash'], cam: 'push' }),
    ],
  },
  {
    numero: 3,
    titre: 'La porte du conseil',
    demain: 'Saison 2 : le traître de l’atelier',
    question: 'Qui a volé l’atelier de Si Brahim, il y a trente ans ?',
    plans: [
      dit('gala', 'narration', 'low, slow', 'La porte s’ouvrit. Pas de tailleur de luxe. Pas de bijoux. Une femme en robe simple, un foulard sur l’épaule.', [un('salma', 0, 'neutre')], { theme: 'mystere', cam: 'push' }),
      dit('gala', 'nadia', 'outraged', 'Qui a laissé entrer la bonne ? Sécurité !', [un('nadia', -0.5, 'colere', { act: 'doigt' }), un('salma', 0.5, 'neutre')], { theme: 'mystere', cam: 'shake' }),
      dit('gala', 'adam', 'calm, sharp', 'Madame Bennani, asseyez-vous. Vous parlez à Salma Brahimi, propriétaire de cinquante et un pour cent de cette maison.', [un('adam', -0.5, 'neutre'), un('nadia', 0.5, 'surprise', { act: 'choc' })], { theme: 'mystere', fx: ['flash'] }),
      reac('gala', [un('sofia', -0.5, 'peur', { act: 'bouche' }), un('nadia', 0.5, 'peur')], 3, { theme: 'mystere', cam: 'push' }),
      dit('gala', 'salma', 'steady, quiet power', 'Mon père a cousu la première robe de cette maison, dans une chambre sans fenêtre. Il est mort pauvre. Ses parts, elles, ne sont jamais mortes.', [un('salma', 0, 'triste')], { theme: 'separation', cam: 'push' }),
      dit('gala', 'sofia', 'panicked, pleading', 'Salma… ma chérie… pour la broche, c’était un malentendu, je te jure !', [un('sofia', -0.5, 'peur'), un('salma', 0.5, 'froid')], { theme: 'mystere' }),
      dit('gala', 'salma', 'cold, clear', 'La broche est dans ton sac, Sofia. Elle y est depuis le premier jour. Rends-la à ta grand-mère, pas à moi.', [un('sofia', -0.5, 'pleure', { act: 'baisse' }), un('salma', 0.5, 'froid')], { theme: 'mystere', insert: 'broche' }),
      dit('gala', 'nadia', 'broken, trembling', 'Tu vas nous mettre à la rue… c’est ça ? Vas-y. Venge-toi.', [un('nadia', 0, 'pleure')], { theme: 'separation', cam: 'push' }),
      dit('gala', 'salma', 'gentle, firm', 'Non, Lalla. Je ne prends le toit de personne. Mais demain matin, vous irez à l’atelier, et vous direz bonjour à chaque ouvrière. Par son prénom.', [un('salma', -0.5, 'tendre'), un('nadia', 0.5, 'pleure')], { theme: 'retrouvailles' }),
      dit('gala', 'omar', 'moved, smiling', 'Trois ans que vous nous regardiez… Et moi qui voulais vous aider.', [un('omar', -0.5, 'tendre'), un('salma', 0.5, 'joie')], { theme: 'espoir' }),
      dit('gala', 'salma', 'warm, light', 'Vous m’avez aidée, Omar. Vous m’avez dit bonjour.', [un('omar', -0.5, 'joie'), un('salma', 0.5, 'tendre', { act: 'coeur' })], { theme: 'retrouvailles', cam: 'push' }),
      dit('atelier', 'mina', 'proud, tearful, old woman', 'Ton père te regarde, ma fille. Et il sourit.', [un('salma', -0.5, 'pleure'), un('mina', 0.5, 'tendre', { act: 'tend' })], { theme: 'famille' }),
      dit('atelier', 'narration', 'low, mysterious', 'Mais dans le tiroir du vieux tailleur, Salma trouva une lettre. Et dans cette lettre, le nom de celui qui l’avait trahi.', [un('salma', 0, 'surprise')], { theme: 'mystere', insert: 'lettre', tint: 'nuit', cam: 'push' }),
    ],
  },
];

export const avecVoix = (plan) => !!plan.parle;

export function texteParle(plan) {
  return `[${plan.ton}] ${plan.texte.replace(/\*/g, '')}`;
}
