// « Le Fil d'or » : feuilleton dramatique pour adolescents (saison 1, 6 épisodes,
// 2 à 3 minutes chacun). Histoire, personnages et dialogues originaux.
// Le fil : Amal, 15 ans, orpheline marquée d'une cicatrice, quitte la maison
// d'enfants de Taza où elle a grandi pour un lycée de riches, et découvre le
// secret du feu qui lui a pris ses parents.
//
// Un plan = un décor, des personnages et, le plus souvent, une réplique.
//   persos : { id, x (-1 à 1), emo, emo2 (émotion en fin de plan), act (geste) }
//   act    : rire, secoue, poing, tend, coeur, bouche, baisse, recule, avance, choc
//   insert : une image sans personnage (feu, lettre, broderie, broche, robe,
//            calendrier, maison, porte) ; peut porter une voix off.
//   cam    : zoom (défaut), pan, push (coup de zoom), shake (secousse), fixe
//   fx     : flash, secousse
// Les mots entre astérisques sont de la darija : ils s'affichent en or.

export const PERSOS = {
  amal: { nom: 'Amal', voix: 'sQfOhaIRbFZ7R8bP1x9f', hauteur: 1.0 },
  ghita: { nom: 'Ghita', voix: 'w85ZODduJOHPSdpVT1ia', hauteur: 0.94 },
  reda: { nom: 'Reda', voix: 'IbTlccXlWxGVwnbGUHEd', hauteur: 0.98 },
  idriss: { nom: 'Idriss', voix: 'IbTlccXlWxGVwnbGUHEd', hauteur: 1.1 },
  rkia: { nom: 'Lalla Rkia', voix: 'EXAVITQu4vr4xnSDxMaL', hauteur: 0.92 },
  kenza: { nom: 'Lalla Kenza', voix: 'EXAVITQu4vr4xnSDxMaL', hauteur: 0.82 },
  narration: { nom: '', voix: 'jvSOBXJ1cP2sdvT5RgUP', hauteur: 0.96 },
};

const un = (id, x, emo = 'neutre', extra = {}) => ({ id, x, emo, ...extra });
const dit = (bg, parle, ton, texte, persos = [], extra = {}) => ({ bg, parle, ton, texte, persos, ...extra });
const vue = (bg, insert, duree, extra = {}) => ({ bg, insert, duree, persos: [], ...extra });
// Un silence joué : les visages réagissent, la musique respire.
const reac = (bg, persos, duree, extra = {}) => ({ bg, persos, duree, ...extra });

export const EPISODES = [
  {
    numero: 1,
    titre: 'Le fil d’or',
    demain: 'La porte d’Al Andalus',
    plans: [
      dit('aube', 'narration', 'softly', 'Taza. Tout en haut de la vieille médina, une maison blanche s’éveille. Vingt-trois enfants y vivent, sans parents.', [], { cam: 'pan' }),
      dit('dar', 'idriss', 'laughing, panicked', 'Amal ! Les petits ont caché mon oud dans le puits !', [un('amal', -0.5, 'joie', { act: 'rire' }), un('idriss', 0.5, 'surprise', { act: 'secoue' })]),
      dit('dar', 'amal', 'laughing', 'Ils ont bien raison ! Tu chantes tellement faux que les chats déménagent !', [un('amal', -0.5, 'joie', { act: 'rire' }), un('idriss', 0.5, 'colere', { emo2: 'joie' })]),
      dit('dar', 'idriss', 'playful, offended', 'Faux ? Je chante comme un rossignol enrhumé. C’est très différent !', [un('amal', -0.5, 'joie', { act: 'rire' }), un('idriss', 0.5, 'joie', { act: 'poing' })]),
      vue('atelier', 'broderie', 3.4),
      dit('atelier', 'amal', 'softly, proud', 'Regarde, Idriss. La fleur est finie. Un seul fil d’or, et elle brille.', [un('amal', 0, 'joie')]),
      dit('atelier', 'idriss', 'gently', 'Ne cache pas ton visage, Amal. Cette cicatrice, c’est la preuve que tu es vivante.', [un('amal', -0.5, 'triste', { act: 'baisse' }), un('idriss', 0.5, 'tendre', { act: 'avance' })]),
      dit('atelier', 'amal', 'sad, soft', 'Elle me rappelle la nuit du feu. Je ne me souviens que d’une voix qui chantait.', [un('amal', 0, 'triste', { emo2: 'pleure' })], { cam: 'push' }),
      dit('feu', 'narration', 'whisper, grave', 'Un feu. Des cris. Et, dans la fumée, une voix qui chantait pour elle.', [], { insert: 'feu', fx: ['flash'], cam: 'shake' }),
      dit('dar', 'rkia', 'excited, out of breath', 'Amal ! Amal ! Une lettre ! Avec un cachet doré !', [un('amal', -0.5, 'surprise', { act: 'recule' }), un('rkia', 0.5, 'joie', { act: 'secoue' })]),
      dit('dar', 'amal', 'trembling, reading', '« Le lycée Al Andalus offre une bourse complète à Mademoiselle Amal. » Mais… qui m’a choisie ?', [], { insert: 'lettre' }),
      dit('dar', 'rkia', 'firm but warm', 'Va, ma fille. Les portes ne s’ouvrent pas deux fois.', [un('amal', -0.5, 'triste'), un('rkia', 0.5, 'tendre', { act: 'tend' })]),
      dit('dar', 'amal', 'crying', 'Et vous ? Et les petits ? Je ne peux pas vous laisser !', [un('amal', 0, 'pleure', { act: 'coeur' })], { cam: 'push' }),
      dit('dar', 'rkia', 'tender, tearful', 'Tu ne nous quittes pas. Tu pars chercher la clé de notre avenir.', [un('amal', -0.5, 'pleure'), un('rkia', 0.5, 'tendre', { emo2: 'pleure' })]),
      dit('toits', 'idriss', 'joking, voice breaking', 'Reviens riche. Que j’achète enfin un oud qui ne fait pas… tchac-tchac !', [un('amal', -0.5, 'tendre', { act: 'rire' }), un('idriss', 0.5, 'tendre', { emo2: 'triste' })]),
      dit('toits', 'idriss', 'softly', 'Prends mon plectre d’oud. Pour que la médina chante dans ta poche.', [un('amal', -0.5, 'pleure'), un('idriss', 0.5, 'tendre', { act: 'tend' })]),
      reac('toits', [un('amal', -0.5, 'pleure', { act: 'baisse' }), un('idriss', 0.5, 'triste', { act: 'avance' })], 3, { cam: 'push' }),
      dit('toits', 'amal', 'whispering, tearful', 'Je reviendrai. Je te le jure sur le fil d’or.', [un('amal', 0, 'pleure', { act: 'coeur' })], { cam: 'push' }),
      dit('villa', 'narration', 'mysterious', 'Cette nuit-là, dans une grande villa, une vieille dame a pleuré en lisant un seul nom : Amal.', [un('kenza', 0, 'triste', { emo2: 'pleure' })], { tint: 'nuit' }),
    ],
  },
  {
    numero: 2,
    titre: 'La porte d’Al Andalus',
    demain: 'La maison qui va fermer',
    plans: [
      dit('lycee', 'narration', 'softly', 'Al Andalus. Ici, les murs sont en zellige, et les sourires sont en glace.', [], { cam: 'pan' }),
      dit('lycee', 'amal', 'nervous whisper', 'Respire, Amal. Tu as ta place ici.', [un('amal', 0, 'peur')]),
      dit('lycee', 'amal', 'panicked', 'Oh non ! Mes livres ! Pardon, pardon !', [un('amal', -0.5, 'surprise', { act: 'recule' }), un('reda', 0.5, 'joie', { act: 'tend' })]),
      dit('lycee', 'reda', 'laughing, warm', 'Doucement ! Moi, c’est Reda. Tu as l’air de quelqu’un qui vient de tomber du ciel.', [un('amal', -0.5, 'joie', { act: 'rire' }), un('reda', 0.5, 'joie', { act: 'rire' })]),
      dit('lycee', 'amal', 'laughing, embarrassed', 'Du ciel, non. Juste de Taza, par le train de six heures.', [un('amal', -0.5, 'joie', { act: 'rire' }), un('reda', 0.5, 'tendre')]),
      dit('lycee', 'reda', 'warm', 'Alors, bienvenue. Et cette cicatrice… ce n’est pas de la honte. C’est du courage.', [un('amal', -0.5, 'surprise'), un('reda', 0.5, 'tendre', { act: 'coeur' })]),
      dit('lycee', 'ghita', 'cold, mocking', 'La fille à la cicatrice. L’orphelinat livre à domicile, maintenant ?', [un('amal', -0.5, 'triste', { act: 'baisse' }), un('ghita', 0.5, 'froid', { act: 'avance' })], { cam: 'push' }),
      dit('lycee', 'narration', 'grave', 'Autour d’eux, les rires ont fusé comme des couteaux.', [un('amal', -0.5, 'triste'), un('ghita', 0.5, 'froid')]),
      reac('lycee', [un('amal', -0.5, 'peur', { act: 'baisse' }), un('ghita', 0.5, 'froid', { act: 'avance' })], 2.4, { cam: 'push' }),
      dit('lycee', 'amal', 'trembling but proud', 'Je m’appelle Amal. Ça veut dire espoir. Retiens-le.', [un('amal', -0.5, 'colere', { act: 'poing' }), un('ghita', 0.5, 'surprise', { act: 'recule' })]),
      dit('lycee', 'ghita', 'furious, shouting', 'Ne me parle pas sur ce ton ! Tu n’es rien, ici !', [un('amal', -0.5, 'colere'), un('ghita', 0.5, 'colere', { act: 'poing' })], { cam: 'shake' }),
      dit('lycee', 'amal', 'gasping, pained', 'Aïe !', [un('amal', -0.5, 'peur', { act: 'choc' }), un('ghita', 0.5, 'colere', { act: 'avance' })], { fx: ['flash'], cam: 'shake' }),
      dit('lycee', 'reda', 'angry', 'Ça suffit, Ghita ! Va-t’en !', [un('ghita', -0.5, 'surprise', { act: 'recule' }), un('reda', 0.5, 'colere', { act: 'avance' })], { cam: 'push' }),
      dit('lycee', 'ghita', 'icy, quiet', 'Tu le regretteras, Reda. Et elle, encore plus.', [un('ghita', 0, 'froid')]),
      reac('lycee', [un('amal', -0.5, 'surprise'), un('reda', 0.5, 'tendre')], 2.4),
      dit('lycee', 'reda', 'warm, a little shy', 'Viens. Je te montre où on mange vraiment bien, à Al Andalus.', [un('amal', -0.5, 'triste'), un('reda', 0.5, 'tendre', { act: 'tend' })]),
      dit('lycee', 'amal', 'laughing through tears', 'Je meurs de faim. Enfin, je crois.', [un('amal', 0, 'joie', { act: 'rire', emo2: 'joie' })]),
      dit('lycee', 'amal', 'shocked whisper', 'Cette broche… ce fil d’or… c’est le point de ma mère. Je le reconnaîtrais entre mille.', [], { insert: 'broche', tint: 'froid' }),
      dit('lycee', 'narration', 'mysterious', 'Une broche. Un secret. Et déjà, une ennemie.', [un('ghita', 0, 'froid')], { tint: 'froid' }),
    ],
  },
  {
    numero: 3,
    titre: 'La maison qui va fermer',
    demain: 'Le prix du silence',
    plans: [
      dit('lycee', 'idriss', 'panicked, on the phone', 'Amal ! Reviens vite. Lalla Rkia pleure. La maison va fermer. Des dettes. Trois semaines.', [un('idriss', 0, 'peur', { act: 'secoue' })], { tint: 'froid', cam: 'push' }),
      dit('lycee', 'amal', 'desperate', 'Fermer ? Et les petits, ils iront où ? Tant pis pour l’examen. Je rentre.', [un('amal', 0, 'pleure', { act: 'coeur' })], { tint: 'froid' }),
      dit('dar', 'narration', 'grave', 'Trois semaines pour trouver l’argent. Ou vingt-trois enfants perdraient leur toit.', [], { insert: 'calendrier' }),
      dit('dar', 'narration', 'low, ominous', 'La nuit, l’orage a éclaté sur Taza.', [], { insert: 'maison', tint: 'pluie', fx: ['flash'] }),
      dit('dar', 'idriss', 'shouting', 'Amal ! Le toit ! Il va céder !', [un('amal', -0.5, 'peur', { act: 'recule' }), un('idriss', 0.5, 'peur', { act: 'secoue' })], { tint: 'pluie', cam: 'shake' }),
      dit('dar', 'amal', 'screaming', 'Idriss, non ! Attention !', [un('amal', -0.5, 'peur', { act: 'avance' }), un('idriss', 0.5, 'peur', { act: 'choc' })], { tint: 'pluie', fx: ['flash'], cam: 'shake' }),
      dit('dar', 'idriss', 'pained, breathless', 'C’est rien… Les petits… sont sortis ?', [un('amal', -0.5, 'pleure', { act: 'tend' }), un('idriss', 0.5, 'malade')], { tint: 'pluie' }),
      dit('dar', 'amal', 'crying, fierce', 'Tous. Tous sont sortis. Tiens bon, Idriss, tiens bon !', [un('amal', 0, 'pleure', { act: 'coeur' })], { tint: 'pluie', cam: 'push' }),
      reac('dar', [un('amal', 0, 'pleure', { act: 'coeur' })], 3, { tint: 'pluie', cam: 'push' }),
      dit('hopital', 'amal', 'terrified', 'Lalla Rkia ! Réveillez-vous, s’il vous plaît !', [un('amal', -0.5, 'peur', { act: 'avance' }), un('rkia', 0.5, 'malade')]),
      dit('hopital', 'rkia', 'weak, tender', 'Ne pleure pas, ma fille. Une maison, c’est des murs. L’amour, personne ne peut le fermer.', [un('amal', -0.5, 'pleure'), un('rkia', 0.5, 'malade', { emo2: 'tendre' })]),
      dit('hopital', 'amal', 'fierce, crying', 'Je sauverai la maison. Je le jure sur le fil d’or.', [un('amal', 0, 'pleure', { act: 'poing' })], { cam: 'push' }),
      dit('hopital', 'idriss', 'weak, trying to joke', 'Dis-moi que… mon oud… a survécu.', [un('amal', -0.5, 'tendre'), un('idriss', 0.5, 'malade', { emo2: 'joie' })]),
      dit('hopital', 'amal', 'laughing through tears', 'Ton oud était dans le puits, idiot ! Le seul à ne pas avoir peur de l’eau !', [un('amal', -0.5, 'joie', { act: 'rire' }), un('idriss', 0.5, 'joie', { act: 'rire' })]),
      dit('hopital', 'idriss', 'sincere', 'Je t’aide. Je vendrai mon oud, s’il le faut.', [un('amal', -0.5, 'tendre'), un('idriss', 0.5, 'tendre', { act: 'tend' })]),
      dit('villa', 'narration', 'mysterious', 'Il restait une seule personne assez riche pour l’aider. Celle qui la détestait.', [un('ghita', 0, 'froid')], { tint: 'nuit' }),
    ],
  },
  {
    numero: 4,
    titre: 'Le prix du silence',
    demain: 'La robe',
    plans: [
      dit('villa', 'narration', 'softly', 'Chez les Benjelloun, même le silence coûte cher.', [], { cam: 'pan' }),
      dit('villa', 'amal', 'steady', 'J’ai besoin d’argent. Ta robe du gala n’est pas finie. Moi, je sais broder.', [un('amal', -0.5, 'neutre', { act: 'avance' }), un('ghita', 0.5, 'surprise')]),
      dit('villa', 'ghita', 'amused, cold', 'Toi ? Broder pour moi ? Marché conclu. Mais personne ne le saura. Jamais.', [un('amal', -0.5, 'triste'), un('ghita', 0.5, 'froid', { emo2: 'joie' })]),
      dit('villa', 'amal', 'tired, steady', 'Personne. Je te le promets sur le fil d’or.', [un('amal', 0, 'triste', { act: 'coeur' })], { cam: 'push' }),
      dit('atelier', 'narration', 'softly', 'Pendant trois nuits, Amal a brodé comme on prie.', [], { insert: 'broderie', tint: 'nuit' }),
      reac('atelier', [un('amal', 0, 'triste', { act: 'baisse' })], 2.6, { tint: 'nuit' }),
      dit('atelier', 'amal', 'yawning, laughing', 'Encore une fleur… et j’ai l’impression que mes yeux ont rétréci.', [un('amal', 0, 'joie', { act: 'rire' })], { tint: 'nuit' }),
      dit('atelier', 'idriss', 'surprised, curious', 'Tu brodes pour qui, à cette heure ?', [un('amal', -0.5, 'surprise', { act: 'recule' }), un('idriss', 0.5, 'surprise', { act: 'avance' })], { tint: 'nuit' }),
      dit('atelier', 'amal', 'hesitating', 'Pour… pour la maison. Ne pose pas de questions.', [un('amal', -0.5, 'peur'), un('idriss', 0.5, 'froid')], { tint: 'nuit' }),
      dit('atelier', 'idriss', 'hurt', 'Pour Ghita ? Celle qui t’a humiliée ? Et moi, je ne compte pas ?', [un('amal', -0.5, 'triste'), un('idriss', 0.5, 'triste', { emo2: 'colere' })], { tint: 'nuit', cam: 'push' }),
      dit('atelier', 'amal', 'shouting, crying', 'Idriss, je n’ai pas le choix !', [un('amal', -0.5, 'pleure', { act: 'poing' }), un('idriss', 0.5, 'colere', { act: 'secoue' })], { tint: 'nuit', cam: 'shake' }),
      dit('atelier', 'idriss', 'shouting', 'Tu as changé depuis Al Andalus !', [un('amal', -0.5, 'surprise', { act: 'choc' }), un('idriss', 0.5, 'colere', { act: 'avance' })], { tint: 'nuit', fx: ['flash'], cam: 'shake' }),
      dit('atelier', 'idriss', 'quiet, broken', 'Peut-être. Mais je comprends quand on me ment.', [un('amal', -0.5, 'pleure'), un('idriss', 0.5, 'triste', { act: 'baisse' })], { tint: 'nuit' }),
      dit('atelier', 'reda', 'quietly stunned', 'Ces points d’or… je les ai déjà vus sur la broche de la grand-mère de Ghita.', [un('amal', -0.5, 'peur'), un('reda', 0.5, 'surprise', { act: 'tend' })], { tint: 'nuit' }),
      dit('atelier', 'amal', 'breathless', 'La grand-mère de Ghita ? Qui est-elle ?', [un('amal', 0, 'surprise', { act: 'avance' })], { tint: 'nuit' }),
      dit('atelier', 'reda', 'low voice', 'Lalla Kenza. La femme la plus riche, et la plus triste, de Taza.', [un('amal', -0.5, 'peur'), un('reda', 0.5, 'neutre')], { tint: 'nuit' }),
      dit('atelier', 'narration', 'mysterious', 'Un secret de plus. Et le gala approchait.', [un('amal', 0, 'peur')], { tint: 'nuit' }),
    ],
  },
  {
    numero: 5,
    titre: 'La robe',
    demain: 'Lalla Kenza',
    plans: [
      dit('gala', 'narration', 'grand', 'Le gala d’Al Andalus. Des lustres, des caftans, et une robe qui brille comme un lever de soleil.', [], { cam: 'pan' }),
      dit('gala', 'reda', 'smiling, awed', 'Amal… tu es magnifique. Enfin, la robe. Enfin, toi aussi.', [un('amal', -0.5, 'joie', { act: 'rire' }), un('reda', 0.5, 'joie', { act: 'tend' })]),
      dit('gala', 'amal', 'laughing, shy', 'Reda ! Tu t’en sors très mal !', [un('amal', -0.5, 'joie', { act: 'rire' }), un('reda', 0.5, 'joie', { act: 'rire' })]),
      dit('gala', 'narration', 'softly', 'Tous les yeux étaient sur la robe. Personne ne regardait celle qui l’avait faite.', [], { insert: 'robe' }),
      dit('gala', 'ghita', 'proud, loud', 'Cette robe, c’est moi qui l’ai brodée. Chaque point.', [un('ghita', 0, 'joie', { act: 'poing' })], { cam: 'push' }),
      dit('gala', 'amal', 'shaken', 'Ghita… tu avais promis.', [un('amal', -0.5, 'surprise', { act: 'recule' }), un('ghita', 0.5, 'froid')]),
      dit('gala', 'ghita', 'ice cold', 'Une promesse à une orpheline ? Personne ne te croira.', [un('amal', -0.5, 'triste'), un('ghita', 0.5, 'froid', { act: 'avance' })]),
      dit('gala', 'amal', 'shouting', 'C’est moi ! Regardez mes mains ! Regardez !', [un('amal', 0, 'colere', { act: 'tend' })], { cam: 'shake' }),
      dit('gala', 'ghita', 'furious, hissing', 'Sors d’ici. Tout de suite.', [un('amal', -0.5, 'peur', { act: 'choc' }), un('ghita', 0.5, 'colere', { act: 'avance' })], { fx: ['flash'], cam: 'shake' }),
      reac('gala', [un('amal', 0, 'pleure', { act: 'baisse' })], 3, { cam: 'push' }),
      dit('gala', 'reda', 'steady', 'Moi, je te crois, Amal.', [un('reda', 0, 'tendre', { act: 'coeur' })], { cam: 'push' }),
      dit('gala', 'narration', 'grave', 'Mais un seul « je te crois » ne suffit pas, devant cent invités.', [un('amal', 0, 'pleure')]),
      dit('toits', 'amal', 'sobbing', 'Plus d’argent. Plus de robe. Plus rien. Pardon, Lalla Rkia. Pardon, les petits.', [un('amal', 0, 'pleure', { act: 'baisse' })], { tint: 'pluie' }),
      dit('toits', 'idriss', 'breathless, warm', 'Je t’ai cherchée partout. Prends. C’est pour la maison.', [un('amal', -0.5, 'pleure'), un('idriss', 0.5, 'tendre', { act: 'tend' })], { tint: 'pluie' }),
      dit('toits', 'amal', 'stunned, crying', 'Cet argent… d’où vient-il ?', [un('amal', 0, 'surprise')], { tint: 'pluie' }),
      dit('toits', 'idriss', 'softly smiling', 'J’ai vendu mon oud. Il chantait faux, de toute façon.', [un('amal', -0.5, 'pleure'), un('idriss', 0.5, 'joie', { emo2: 'tendre' })], { tint: 'pluie' }),
      dit('toits', 'amal', 'sobbing and laughing', 'Idriss… tu es le pire chanteur du monde, et le meilleur des frères.', [un('amal', 0, 'joie', { act: 'rire', emo2: 'pleure' })], { tint: 'pluie', cam: 'push' }),
      dit('villa', 'narration', 'mysterious', 'Et dans une grande maison, une vieille dame venait de tout comprendre.', [un('kenza', 0, 'triste')], { tint: 'nuit' }),
    ],
  },
  {
    numero: 6,
    titre: 'Lalla Kenza',
    demain: 'Saison 2',
    plans: [
      dit('villa', 'narration', 'softly', 'Le lendemain, une vieille dame fit appeler Amal.', [], { cam: 'pan' }),
      dit('villa', 'kenza', 'gentle, shaky', 'Approche, mon enfant. Laisse-moi regarder ton visage.', [un('amal', -0.5, 'peur'), un('kenza', 0.5, 'tendre', { act: 'tend' })]),
      dit('villa', 'amal', 'wary, trembling', 'Pourquoi moi ? Pourquoi la bourse ?', [un('amal', 0, 'peur', { act: 'recule' })]),
      dit('villa', 'kenza', 'emotional', 'Ta mère s’appelait Zineb. Elle est partie d’ici par amour. Je ne le lui ai jamais pardonné.', [un('kenza', 0, 'pleure')], { cam: 'push' }),
      dit('villa', 'amal', 'stunned whisper', 'Zineb… c’était ma mère. Alors vous êtes… ma grand-mère ?', [un('amal', 0, 'surprise', { act: 'bouche' })]),
      dit('villa', 'kenza', 'ashamed', 'La nuit du feu, elle est venue frapper à ma porte, avec toi dans ses bras. Et j’ai refusé d’ouvrir.', [un('amal', -0.5, 'surprise'), un('kenza', 0.5, 'pleure', { act: 'baisse' })]),
      dit('feu', 'narration', 'grave whisper', 'Derrière cette porte fermée, le monde de Zineb a brûlé.', [], { insert: 'feu', fx: ['flash'], cam: 'shake' }),
      dit('villa', 'amal', 'broken, whispering', 'Cette cicatrice… c’est elle qui m’a sauvée. Et vous avez fermé la porte.', [un('amal', 0, 'pleure', { act: 'coeur' })], { cam: 'push' }),
      dit('villa', 'amal', 'shouting, sobbing', 'Seize ans ! Seize ans de silence !', [un('amal', -0.5, 'colere', { act: 'poing' }), un('kenza', 0.5, 'pleure', { act: 'recule' })], { cam: 'shake' }),
      dit('villa', 'kenza', 'crying', 'Je n’ai plus que mon orgueil à perdre. Pardon, Amal. Pardon.', [un('kenza', 0, 'pleure', { act: 'tend' })]),
      reac('villa', [un('amal', -0.5, 'triste', { act: 'tend' }), un('kenza', 0.5, 'pleure')], 3),
      dit('villa', 'ghita', 'stunned', 'Grand-mère ? Elle… c’est ma cousine ?', [un('amal', -0.5, 'triste'), un('ghita', 0.5, 'surprise', { act: 'recule' })]),
      dit('villa', 'amal', 'tired, honest', 'Cousine. Pas ennemie. Si tu veux.', [un('amal', -0.5, 'tendre', { act: 'tend' }), un('ghita', 0.5, 'surprise')]),
      dit('villa', 'ghita', 'small voice, ashamed', 'J’avais peur que tu me voles la seule famille que j’avais.', [un('amal', -0.5, 'tendre'), un('ghita', 0.5, 'pleure', { act: 'baisse' })]),
      dit('villa', 'kenza', 'firm, warm', 'La maison de Lalla Rkia ne fermera pas. Je le jure sur mon nom.', [un('kenza', 0, 'tendre', { act: 'coeur' })], { cam: 'push' }),
      dit('dar', 'idriss', 'ecstatic, laughing', 'Elle ne ferme pas ! Les petits ! Elle ne ferme pas !', [un('amal', -0.5, 'joie', { act: 'rire' }), un('idriss', 0.5, 'joie', { act: 'secoue' })]),
      dit('dar', 'kenza', 'smiling, warm', 'Je t’offrirai un oud, jeune homme. Pour que tu chantes… un peu moins faux.', [un('idriss', -0.5, 'surprise'), un('kenza', 0.5, 'joie')]),
      dit('dar', 'narration', 'warm, hopeful', 'Le fil d’or s’était renoué. Mais Amal avait seize ans de silence à comprendre. Et à Taza, l’histoire ne faisait que commencer.', [un('amal', 0, 'tendre', { act: 'coeur' })], { cam: 'pan' }),
    ],
  },
];

/** Les plans qui ont une voix (les images muettes n'en ont pas). */
export const avecVoix = (plan) => !!plan.parle;

/** Le texte tel que la voix le dit : sans astérisques, darija écrite pour être bien prononcée. */
export function texteParle(plan) {
  const dire = plan.texte.replace(/\*/g, '').replace(/3afak/gi, 'âafak');
  return `[${plan.ton}] ${dire}`;
}
