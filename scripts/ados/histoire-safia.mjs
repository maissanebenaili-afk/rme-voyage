// « Safia et le foulard bleu » : la saga dans l'esprit des grands dessins animés
// des années 80 (voir docs/dessins-animes/SAGA-SAFIA.md), 100 % originale.
// Safia, 9 ans, traverse la mer seule vers une grand-mère qu'elle n'a jamais vue.
// Règle du câlin : chaque épisode triste finit sur un geste de réconfort ou un espoir.
// Aucun personnage, lieu, scène ou musique n'est repris d'une œuvre existante.
// Même format que histoire-atlas.mjs ; mêmes thèmes musicaux (musique-atlas.mjs).

export const SERIE = {
  titre: 'Safia et le foulard bleu',
  etiquette: 'ÉPISODE',
  dossier: 'videos-safia',
  musique: 'atlas',
  duree: [60, 180], // secondes, pour le contrôle qualité
};

export const PERSOS = {
  safia: { nom: 'Safia', voix: 'sQfOhaIRbFZ7R8bP1x9f', hauteur: 1.12 },
  safia2: { nom: 'Safia', voix: 'sQfOhaIRbFZ7R8bP1x9f', hauteur: 1.12 }, // sans foulard à l'image
  yemma: { nom: 'Yemma', voix: 'w85ZODduJOHPSdpVT1ia', hauteur: 0.98 },
  jedda: { nom: 'Jedda Fatima', voix: 'EXAVITQu4vr4xnSDxMaL', hauteur: 0.84 },
  driss: { nom: 'Idriss', voix: 'IbTlccXlWxGVwnbGUHEd', hauteur: 1.22 },
  hind: { nom: 'Hind', voix: 'w85ZODduJOHPSdpVT1ia', hauteur: 1.14 },
  larbi: { nom: 'Moulay Larbi', voix: 'IbTlccXlWxGVwnbGUHEd', hauteur: 0.9 },
  narration: { nom: '', voix: 'azure:fr-FR-Soleil:MAI-Voice-2', hauteur: 1 },
};

const un = (id, x, emo = 'neutre', extra = {}) => ({ id, x, emo, ...extra });
const dit = (bg, parle, ton, texte, persos = [], extra = {}) => ({ bg, parle, ton, texte, persos, ...extra });
const reac = (bg, persos, duree, extra = {}) => ({ bg, persos, duree, ...extra });

export const EPISODES = [
  {
    numero: 1,
    titre: 'Le foulard bleu',
    demain: 'La maison sans photos',
    question: 'Pourquoi ne faut-il pas prononcer le nom de sa maman ?',
    plans: [
      dit('hopital', 'safia', 'small, frightened child', 'Yemma… pourquoi tu me donnes ton foulard ? Tu ne l’enlèves jamais.', [un('safia', -0.5, 'peur'), un('yemma', 0.5, 'malade', { emo2: 'tendre' })], { theme: 'separation', cam: 'push' }),
      dit('hopital', 'yemma', 'weak, loving, holding back tears', 'Parce que je dois rester ici pour guérir, mon cœur. Et toi, tu vas traverser la mer. Chez ta grand-mère.', [un('safia', -0.5, 'peur', { emo2: 'triste' }), un('yemma', 0.5, 'tendre', { act: 'tend' })], { theme: 'separation' }),
      dit('hopital', 'safia', 'breaking, child', 'Toute seule ? Mais je ne la connais pas ! Je ne veux pas partir sans toi !', [un('safia', 0, 'pleure', { act: 'secoue' })], { theme: 'separation', cam: 'push' }),
      dit('hopital', 'yemma', 'soft, firm, whisper', 'Tant que ce foulard est à ton poignet, je te tiens la main. Promets-moi d’être courageuse.', [un('safia', -0.5, 'pleure', { emo2: 'triste' }), un('yemma', 0.5, 'tendre', { act: 'coeur' })], { theme: 'famille', cam: 'push' }),
      reac('bateau', [un('safia', 0, 'triste', { act: 'baisse' })], 3, { theme: 'separation', cam: 'pan' }),
      dit('bateau', 'narration', 'low, storyteller', 'Le bateau quitta le port à l’aube. Sur le pont, une petite fille de neuf ans serrait un foulard bleu. Elle avait promis de ne pas pleurer.', [un('safia', 0, 'triste', { emo2: 'froid' })], { theme: 'separation', cam: 'push' }),
      dit('atlas', 'narration', 'soft, storyteller', 'Deux jours plus tard, tout en haut de la montagne, une vieille femme l’attendait devant sa porte. Elle ne souriait pas.', [un('jedda', 0, 'froid')], { theme: 'mystere', cam: 'pan' }),
      dit('atlas', 'safia', 'shy, hopeful child', 'Salam… Jedda. C’est moi, Safia.', [un('safia', -0.5, 'peur', { emo2: 'joie', act: 'salut' }), un('jedda', 0.5, 'froid')], { theme: 'espoir' }),
      dit('atlas', 'jedda', 'stern, low, old woman', 'Tu as les yeux de ta mère. Entre. Mais écoute-moi bien : dans cette maison, on ne prononce pas son nom.', [un('safia', -0.5, 'joie', { emo2: 'surprise' }), un('jedda', 0.5, 'froid', { act: 'doigt' })], { theme: 'mystere', cam: 'push' }),
      dit('dar', 'narration', 'warm, soft', 'Cette nuit-là, Safia s’endormit en serrant le foulard. Elle ne vit pas la vieille main qui remontait doucement la couverture sur son épaule.', [un('safia', -0.5, 'triste'), un('jedda', 0.5, 'froid', { emo2: 'tendre', act: 'tend' })], { theme: 'famille', tint: 'nuit', cam: 'push' }),
    ],
  },
  {
    numero: 2,
    titre: 'La maison sans photos',
    demain: 'Le gardien du puits',
    question: 'Que sait le vieux gardien du puits ?',
    plans: [
      dit('rue', 'hind', 'mocking, proud girl', 'Regardez-la, la Française ! Elle ne sait même pas porter un seau. Et ce vieux chiffon bleu à son poignet !', [un('hind', -0.5, 'joie', { act: 'rire' }), un('safia', 0.5, 'triste', { emo2: 'colere' })], { theme: 'mystere', cam: 'shake' }),
      dit('rue', 'safia', 'hurt, defiant child', 'Ce n’est pas un chiffon ! C’est le foulard de ma maman !', [un('hind', -0.5, 'surprise'), un('safia', 0.5, 'colere', { act: 'poing' })], { theme: 'separation', cam: 'push' }),
      dit('dar', 'narration', 'soft, storyteller', 'Dans la maison de Jedda Fatima, Safia chercha partout. Sur les murs, dans les tiroirs. Pas une seule photo de sa mère.', [un('safia', 0, 'triste', { emo2: 'surprise' })], { theme: 'mystere', cam: 'pan' }),
      dit('dar', 'safia', 'timid, child', 'Jedda… pourquoi il n’y a aucune photo de Yemma ici ?', [un('safia', -0.5, 'peur'), un('jedda', 0.5, 'froid', { emo2: 'triste' })], { theme: 'separation' }),
      dit('dar', 'jedda', 'sharp, hurt, old woman', 'Le pain ne se pétrit pas tout seul. Mets ton tablier, et ne pose plus cette question.', [un('safia', -0.5, 'triste', { act: 'baisse' }), un('jedda', 0.5, 'colere', { emo2: 'triste', act: 'doigt' })], { theme: 'mystere', cam: 'push' }),
      dit('puits', 'driss', 'kind, cheerful boy', 'Ne pleure pas. Moi c’est Idriss. Ta grand-mère n’est pas méchante, tu sais. Elle est triste depuis très longtemps.', [un('safia', -0.5, 'pleure', { emo2: 'surprise' }), un('driss', 0.5, 'tendre', { act: 'salut' })], { theme: 'espoir', cam: 'pan' }),
      dit('puits', 'safia', 'curious, sniffling child', 'Triste à cause de quoi ?', [un('safia', -0.5, 'triste'), un('driss', 0.5, 'neutre', { act: 'hausse' })], { theme: 'mystere' }),
      dit('puits', 'driss', 'whispering, conspiratorial boy', 'Je ne sais pas. Mais Moulay Larbi, le gardien du puits, il sait. Il sait tout. Seulement… il ne parle à personne.', [un('safia', -0.5, 'surprise'), un('driss', 0.5, 'peur', { act: 'explique' })], { theme: 'mystere', cam: 'push' }),
      dit('dar', 'narration', 'warm, soft', 'Ce soir-là, Safia trouva sur son oreiller un petit pain tout chaud, avec du miel. Personne ne dit qui l’avait posé là.', [un('safia', 0, 'triste', { emo2: 'joie' })], { theme: 'famille', tint: 'nuit', cam: 'push' }),
      dit('dar', 'safia', 'whispering to herself, hopeful child', 'Demain, Yemma, j’irai voir le gardien du puits. Je te le promets.', [un('safia', 0, 'tendre', { act: 'coeur' })], { theme: 'espoir', tint: 'nuit', cam: 'push' }),
    ],
  },
  {
    numero: 3,
    titre: 'Le gardien du puits',
    demain: 'La lettre de Lyon',
    question: 'Que dit la lettre venue de l’hôpital ?',
    plans: [
      dit('puits', 'hind', 'spiteful, jealous girl', 'Tu l’aimes tant, ton foulard ? Alors va le chercher !', [un('hind', -0.5, 'colere', { act: 'poing' }), un('safia2', 0.5, 'peur', { act: 'tend' })], { theme: 'mystere', cam: 'shake' }),
      dit('puits', 'safia2', 'screaming, desperate child', 'Non ! Pas dans le puits ! C’est tout ce qu’il me reste d’elle !', [un('safia2', 0, 'pleure', { act: 'choc' })], { theme: 'separation', fx: ['flash'], cam: 'push' }),
      reac('puits', [un('hind', -0.5, 'colere', { emo2: 'peur', act: 'bouche' }), un('safia2', 0.5, 'pleure', { act: 'baisse' })], 3, { theme: 'separation', cam: 'push' }),
      dit('puits', 'larbi', 'gruff, old man, grumbling', 'Qui crie près de mon puits ? Écartez-vous, les enfants. Laissez faire un vieux qui connaît sa corde.', [un('larbi', -0.5, 'colere', { act: 'avance' }), un('safia2', 0.5, 'pleure', { emo2: 'surprise' })], { theme: 'mystere', cam: 'pan' }),
      dit('puits', 'narration', 'low, slow', 'Le vieil homme remonta le seau. Au fond, trempé, le foulard bleu. Il le prit dans ses mains… et ses mains se mirent à trembler.', [un('larbi', 0, 'neutre', { emo2: 'surprise' })], { theme: 'mystere', cam: 'push' }),
      dit('puits', 'larbi', 'shaken, soft, old man', 'Ce foulard… c’est moi qui l’ai vendu à ta mère. Le matin où elle a quitté le village. Elle avait ton âge dans les yeux.', [un('larbi', -0.5, 'triste', { act: 'tend' }), un('safia2', 0.5, 'surprise')], { theme: 'nour', cam: 'push' }),
      dit('puits', 'safia2', 'breathless, child', 'Vous connaissiez Yemma ? Pourquoi elle est partie ? Pourquoi Jedda ne veut plus dire son nom ?', [un('larbi', -0.5, 'triste', { act: 'baisse' }), un('safia2', 0.5, 'surprise', { act: 'avance' })], { theme: 'mystere' }),
      dit('puits', 'larbi', 'grave, gentle, old man', 'Ce n’est pas à moi de le dire, petite. Mais sache une chose : depuis ce matin-là, ta grand-mère n’a jamais refermé ses volets. Elle regarde la route. Tous les soirs.', [un('larbi', -0.5, 'tendre', { act: 'explique' }), un('safia2', 0.5, 'triste', { emo2: 'tendre' })], { theme: 'famille', cam: 'push' }),
      dit('puits', 'hind', 'ashamed, small voice, girl', 'Pardon, Safia. Je ne savais pas. Tiens… je vais t’aider à le faire sécher.', [un('hind', -0.5, 'triste', { act: 'baisse' }), un('safia2', 0.5, 'triste', { emo2: 'joie' })], { theme: 'retrouvailles' }),
      dit('dar', 'narration', 'warm, soft', 'Ce soir-là, sans un mot, Jedda Fatima renoua elle-même le foulard au poignet de Safia. Ses doigts s’attardèrent un instant.', [un('safia', -0.5, 'joie'), un('jedda', 0.5, 'triste', { emo2: 'tendre', act: 'tend' })], { theme: 'retrouvailles', tint: 'nuit', cam: 'push' }),
      dit('dar', 'narration', 'low, mysterious', 'On frappa à la porte. Le facteur tendit une lettre. Elle venait de Lyon. De l’hôpital.', [un('safia', -0.5, 'joie', { emo2: 'peur' }), un('jedda', 0.5, 'tendre', { emo2: 'peur', act: 'choc' })], { theme: 'mystere', insert: 'lettre', tint: 'nuit', fx: ['flash'], cam: 'shake' }),
    ],
  },
  {
    numero: 4,
    titre: 'La lettre de Lyon',
    demain: 'La nuit du départ',
    question: 'Pourquoi Jedda n’a-t-elle jamais envoyé ses lettres ?',
    plans: [
      dit('dar', 'jedda', 'gruff, hiding fear, old woman', 'Je ne sais pas lire le français. Lis, toi. Lis à voix haute.', [un('safia', -0.5, 'peur'), un('jedda', 0.5, 'froid', { emo2: 'peur', act: 'tend' })], { theme: 'mystere', insert: 'lettre', tint: 'nuit', cam: 'push' }),
      dit('dar', 'safia', 'trembling, reading aloud, child', 'Maman… c’est moi. Les médecins vont m’opérer dans dix jours. C’est une grande opération.', [un('safia', 0, 'peur', { emo2: 'pleure' })], { theme: 'separation', tint: 'nuit', cam: 'push' }),
      reac('dar', [un('safia', -0.5, 'pleure'), un('jedda', 0.5, 'peur', { emo2: 'triste', act: 'bouche' })], 2.6, { theme: 'separation', tint: 'nuit', cam: 'push' }),
      dit('dar', 'safia', 'crying softly, reading, child', 'Je ne te demande pas de me pardonner. Je te demande seulement de garder Safia près de toi, si jamais je ne me réveille pas.', [un('safia', -0.5, 'pleure', { act: 'baisse' }), un('jedda', 0.5, 'triste', { emo2: 'pleure' })], { theme: 'separation', tint: 'nuit' }),
      dit('dar', 'jedda', 'breaking, whisper, old woman', 'Ma fille… ma petite fille…', [un('jedda', 0, 'pleure', { act: 'baisse' })], { theme: 'famille', tint: 'nuit', cam: 'push' }),
      dit('dar', 'narration', 'low, slow', 'Alors la vieille femme se leva. Sous son lit, elle tira une boîte en fer. Dedans, des dizaines d’enveloppes. Toutes portaient le même prénom.', [un('safia', -0.5, 'pleure', { emo2: 'surprise' }), un('jedda', 0.5, 'triste', { act: 'tend' })], { theme: 'mystere', insert: 'lettre', tint: 'nuit', cam: 'push' }),
      dit('dar', 'safia', 'astonished whisper, child', 'Jedda… tu lui as écrit ? Toutes ces années ?', [un('safia', -0.5, 'surprise'), un('jedda', 0.5, 'triste')], { theme: 'nour', tint: 'nuit' }),
      dit('dar', 'jedda', 'ashamed, low, old woman', 'Une lettre à chaque Aïd. Neuf ans. Je n’en ai jamais envoyé une seule.', [un('safia', -0.5, 'surprise', { emo2: 'triste' }), un('jedda', 0.5, 'triste', { act: 'secoue' })], { theme: 'separation', tint: 'nuit', cam: 'push' }),
      dit('dar', 'narration', 'warm, soft', 'Cette nuit-là, pour la première fois, Safia s’endormit contre l’épaule de sa grand-mère. Et la vieille main ne lâcha pas la petite.', [un('safia', -0.5, 'triste', { emo2: 'tendre' }), un('jedda', 0.5, 'tendre', { act: 'coeur' })], { theme: 'famille', tint: 'nuit', cam: 'push' }),
    ],
  },
  {
    numero: 5,
    titre: 'La nuit du départ',
    demain: 'Les volets ouverts',
    question: 'Arriveront-elles à temps ?',
    plans: [
      dit('feu', 'jedda', 'confessing, heavy, old woman', 'Ta mère voulait étudier en France. Moi, je voulais la garder ici. Le dernier soir, je lui ai dit : si tu passes cette porte, tu n’as plus de mère.', [un('safia', -0.5, 'triste'), un('jedda', 0.5, 'triste', { act: 'baisse' })], { theme: 'separation', tint: 'nuit', cam: 'push' }),
      dit('feu', 'safia', 'small, careful child', 'Et elle l’a passée…', [un('safia', -0.5, 'triste'), un('jedda', 0.5, 'pleure')], { theme: 'separation', tint: 'nuit' }),
      dit('feu', 'jedda', 'bitter, tearful, old woman', 'Elle avait ma tête dure. Moi, j’avais ma fierté. Neuf ans, j’ai attendu qu’elle revienne dire pardon. Et elle attendait la même chose de moi.', [un('safia', -0.5, 'triste', { emo2: 'tendre' }), un('jedda', 0.5, 'pleure', { act: 'secoue' })], { theme: 'famille', tint: 'nuit', cam: 'push' }),
      dit('feu', 'safia', 'brave, urgent child', 'Alors viens lui dire, Jedda ! Il reste dix jours. Viens avec moi à Lyon !', [un('safia', -0.5, 'tendre', { emo2: 'joie', act: 'avance' }), un('jedda', 0.5, 'pleure', { emo2: 'peur' })], { theme: 'espoir', tint: 'nuit', cam: 'push' }),
      dit('feu', 'jedda', 'frightened, old woman', 'Moi ? Je n’ai jamais quitté cette montagne. Je ne connais ni la mer, ni les trains, ni leur langue.', [un('safia', -0.5, 'joie', { emo2: 'triste' }), un('jedda', 0.5, 'peur', { act: 'recule' })], { theme: 'mystere', tint: 'nuit' }),
      dit('feu', 'safia', 'gentle, sure child', 'Moi non plus, je ne connaissais rien d’ici. J’ai traversé quand même. Cette fois, on sera deux.', [un('safia', -0.5, 'tendre', { act: 'tend' }), un('jedda', 0.5, 'peur', { emo2: 'tendre' })], { theme: 'espoir', tint: 'nuit', cam: 'push' }),
      dit('puits', 'larbi', 'gruff, warm, old man', 'Ma vieille camionnette tousse, mais elle roule. Je vous descends au port avant l’aube. Montez.', [un('larbi', -0.5, 'joie', { act: 'salut' }), un('jedda', 0.5, 'surprise', { emo2: 'tendre' })], { theme: 'nour', cam: 'pan' }),
      dit('puits', 'hind', 'shy, sincere girl', 'Safia, attends ! Prends mon bracelet. Pour que tu reviennes nous voir.', [un('hind', -0.5, 'triste', { emo2: 'joie', act: 'tend' }), un('safia', 0.5, 'surprise', { emo2: 'joie' })], { theme: 'retrouvailles' }),
      dit('bateau', 'narration', 'low, building', 'Le bateau quitta le port à l’aube. Sur le pont, une vieille femme regardait la mer pour la première fois. Elle serrait une boîte en fer contre son cœur.', [un('safia', -0.5, 'joie'), un('jedda', 0.5, 'peur', { emo2: 'tendre' })], { theme: 'espoir', cam: 'pan' }),
      dit('bateau', 'narration', 'grave, soft', 'À Lyon, ce matin-là, on avança l’opération. Personne n’avait pu les prévenir.', [un('safia', 0, 'joie', { emo2: 'peur' })], { theme: 'mystere', fx: ['flash'], cam: 'push' }),
    ],
  },
  {
    numero: 6,
    titre: 'Les volets ouverts',
    demain: 'Fin de la saison',
    question: 'Et vous, à qui n’avez-vous jamais envoyé votre lettre ?',
    plans: [
      dit('hopital', 'safia', 'out of breath, panicked child', 'Yemma ! Où est ma maman ? Le lit est vide !', [un('safia', 0, 'peur', { act: 'choc' })], { theme: 'mystere', cam: 'shake' }),
      dit('hopital', 'narration', 'low, slow', 'L’opération avait duré six heures. Dans le couloir, une petite fille et une vieille femme attendaient, la main dans la main, sans dire un mot.', [un('safia', -0.5, 'peur', { emo2: 'triste' }), un('jedda', 0.5, 'peur', { act: 'baisse' })], { theme: 'separation', cam: 'push' }),
      reac('hopital', [un('safia', -0.5, 'triste'), un('jedda', 0.5, 'triste', { emo2: 'pleure' })], 3, { theme: 'separation', cam: 'push' }),
      dit('hopital', 'yemma', 'very weak, waking', 'Safia… mon cœur… tu as gardé le foulard.', [un('safia', -0.5, 'triste', { emo2: 'joie' }), un('yemma', 0.5, 'malade', { emo2: 'tendre' })], { theme: 'retrouvailles', cam: 'push' }),
      dit('hopital', 'safia', 'laughing through tears, child', 'Yemma ! Tu es réveillée ! Je ne suis pas venue toute seule…', [un('safia', -0.5, 'joie', { act: 'coeur' }), un('yemma', 0.5, 'tendre', { emo2: 'surprise' })], { theme: 'retrouvailles' }),
      dit('hopital', 'narration', 'soft, held breath', 'Dans l’encadrement de la porte, une vieille femme n’osait pas entrer. Neuf ans. Elle ne trouvait plus ses mots.', [un('jedda', 0, 'peur', { emo2: 'pleure' })], { theme: 'separation', cam: 'push' }),
      dit('hopital', 'yemma', 'disbelieving, breaking, whisper', 'Maman ?', [un('yemma', -0.5, 'surprise', { emo2: 'pleure' }), un('jedda', 0.5, 'pleure')], { theme: 'famille', cam: 'push' }),
      dit('hopital', 'jedda', 'sobbing, tender, old woman', 'Pardon, ma fille. C’est moi qui aurais dû passer la porte. Tiens. Elles sont toutes pour toi.', [un('yemma', -0.5, 'pleure'), un('jedda', 0.5, 'pleure', { act: 'tend' })], { theme: 'retrouvailles', insert: 'lettre', cam: 'push' }),
      dit('hopital', 'safia', 'happy, tender child', 'Donnez-moi vos mains. Le foulard est assez long pour trois.', [un('safia', 0, 'joie', { act: 'coeur' })], { theme: 'retrouvailles', cam: 'push' }),
      dit('atlas', 'narration', 'warm, closing', 'Au printemps, tout en haut de la montagne, les volets d’une maison restèrent ouverts. Mais plus personne n’y guettait la route. On y attendait simplement l’heure du pain.', [un('safia', -0.5, 'joie', { act: 'rire' }), un('jedda', 0.5, 'joie')], { theme: 'famille', cam: 'pan' }),
    ],
  },
];

export const avecVoix = (plan) => !!plan.parle;

export function texteParle(plan) {
  return `[${plan.ton}] ${plan.texte.replace(/\*/g, '')}`;
}
