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
  duree: [75, 270], // secondes, pour le contrôle qualité
};

export const PERSOS = {
  nour: { nom: 'Nour', voix: 'sQfOhaIRbFZ7R8bP1x9f', hauteur: 1.16 },
  yacine: { nom: 'Yacine', voix: 'w85ZODduJOHPSdpVT1ia', hauteur: 1.32 },
  maman: { nom: 'Maman', voix: 'EXAVITQu4vr4xnSDxMaL', hauteur: 1.0 },
  papa: { nom: 'Papa', voix: 'IbTlccXlWxGVwnbGUHEd', hauteur: 0.97 },
  zahra: { nom: 'Lalla Zahra', voix: 'EXAVITQu4vr4xnSDxMaL', hauteur: 0.84 },
  ali: { nom: 'Monsieur Ali', voix: 'IbTlccXlWxGVwnbGUHEd', hauteur: 0.92 },
  hassan: { nom: 'Hassan', voix: 'IbTlccXlWxGVwnbGUHEd', hauteur: 0.92 },
  nejma: { nom: 'Lalla Nejma', voix: 'EXAVITQu4vr4xnSDxMaL', hauteur: 1.08 },
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

  {
    numero: 2,
    titre: 'Ce que dit la lettre',
    demain: 'Karim avoue',
    question: 'Où est Hassan aujourd’hui ?',
    plans: [
      dit('dar', 'narration', 'soft, storyteller', 'La nuit était tombée sur le village. Dans la maison de pierre, Lalla Zahra tenait l’enveloppe comme on tient un oiseau blessé.', [un('nour', -0.5, 'tendre'), un('zahra', 0.5, 'triste')], { theme: 'separation', tint: 'nuit', cam: 'pan' }),
      dit('dar', 'zahra', 'gentle, trembling, old woman', 'Lis-la-moi, ma petite. Mes yeux n’ont jamais appris les lettres, mais mon cœur sait écouter.', [un('nour', -0.5, 'tendre'), un('zahra', 0.5, 'tendre')], { theme: 'separation', tint: 'nuit' }),
      dit('dar', 'nour', 'nervous, soft', '« Ma mère bien-aimée, pardonne mon silence. »', [un('nour', -0.5, 'triste'), un('zahra', 0.5, 'tendre')], { theme: 'mystere', tint: 'nuit' }),
      dit('dar', 'narration', 'soft, storyteller', 'Nour lut lentement, et chaque mot faisait trembler la flamme de la lampe.', [un('nour', -0.5, 'triste'), un('zahra', 0.5, 'triste')], { theme: 'mystere', tint: 'nuit', cam: 'push' }),
      dit('dar', 'nour', 'reading, emotional', '« Je suis parti pour payer une dette que mon père avait laissée, et que vous ignoriez. Je ne voulais pas vous faire porter ce poids. »', [un('nour', -0.5, 'triste'), un('zahra', 0.5, 'pleure')], { theme: 'separation', tint: 'nuit' }),
      dit('dar', 'nour', 'reading, shaky', '« Je vous écrirai chaque mois. Si vous ne me répondez pas avant l’été prochain, je comprendrai que vous ne voulez plus de moi. »', [un('nour', -0.5, 'pleure'), un('zahra', 0.5, 'pleure')], { theme: 'separation', tint: 'nuit', cam: 'push' }),
      dit('dar', 'zahra', 'broken, whispering, old woman', 'Plus de moi ? Moi… ne plus vouloir de mon fils ?', [un('nour', -0.5, 'pleure'), un('zahra', 0.5, 'pleure', { act: 'coeur' })], { theme: 'separation', tint: 'nuit' }),
      reac('dar', [un('nour', -0.5, 'triste'), un('zahra', 0.5, 'pleure')], 3, { theme: 'separation', tint: 'nuit', cam: 'push' }),
      dit('dar', 'papa', 'quiet, guilty', 'Yemma… cette lettre, c’est moi qui l’ai cachée. J’avais treize ans. J’avais peur de la colère de mon père.', [un('papa', -0.5, 'triste'), un('zahra', 0.5, 'surprise')], { theme: 'separation', tint: 'nuit' }),
      dit('dar', 'zahra', 'tender, heartbroken, old woman', 'Treize ans… Tu étais un enfant, Karim. Un enfant qui avait peur.', [un('papa', -0.5, 'pleure'), un('zahra', 0.5, 'tendre', { act: 'tend' })], { theme: 'retrouvailles', tint: 'nuit', cam: 'push' }),
      dit('atlas', 'narration', 'soft, mysterious', 'Cette nuit-là, une lumière douce se posa sur la fenêtre de Nour. Elle ne venait ni de la lune, ni de la lampe.', [un('nour', -0.5, 'surprise')], { theme: 'mystere', tint: 'nuit', cam: 'pan' }),
      dit('atlas', 'nejma', 'warm, ethereal, kind', 'N’aie pas peur, petite. Je suis Lalla Nejma. Je ne viens rien réparer : je viens t’aider à regarder.', [un('nour', -0.5, 'surprise'), un('nejma', 0.5, 'tendre')], { theme: 'espoir', tint: 'nuit' }),
      dit('atlas', 'nour', 'whispering, confused', 'Papa a fait du mal… mais il avait treize ans. Moi, qu’est-ce que je dois faire ?', [un('nour', -0.5, 'triste'), un('nejma', 0.5, 'tendre')], { theme: 'nour', tint: 'nuit' }),
      dit('atlas', 'nejma', 'warm, ethereal, gentle', 'Qu’aurais-tu aimé qu’on te dise, à sa place ? Commence par là.', [un('nour', -0.5, 'tendre'), un('nejma', 0.5, 'tendre', { act: 'tend' })], { theme: 'espoir', tint: 'nuit', cam: 'push' }),
      dit('dar', 'narration', 'soft, storyteller', 'Au matin, Nour relut la fin de la lettre. Il y avait une adresse, écrite en France.', [un('nour', 0, 'surprise')], { theme: 'mystere' }),
      dit('dar', 'nour', 'puzzled, whispering', 'Cette rue… j’ai déjà vu ce nom quelque part.', [], { insert: 'lettre', theme: 'mystere' }),
      dit('atlas', 'narration', 'soft, mysterious', 'Et quelque part, loin de l’Atlas, quelqu’un attendait toujours une réponse.', [], { theme: 'mystere', cam: 'pan' }),
    ],
  },

  {
    numero: 3,
    titre: 'Karim avoue',
    demain: 'Monsieur Ali',
    question: 'Qui a revu Hassan ?',
    plans: [
      dit('dar', 'narration', 'soft, storyteller', 'Le lendemain, la maison de pierre sentait le pain chaud, mais personne n’avait faim.', [un('papa', -0.5, 'triste'), un('zahra', 0.5, 'tendre')], { theme: 'separation', cam: 'pan' }),
      dit('dar', 'papa', 'low, ashamed', 'Je dois tout te dire, Yemma. Pas seulement la lettre.', [un('papa', -0.5, 'triste'), un('zahra', 0.5, 'tendre')], { theme: 'separation' }),
      dit('dar', 'zahra', 'steady, old woman', 'Parle, mon fils. Je suis assez vieille pour entendre.', [un('papa', -0.5, 'triste'), un('zahra', 0.5, 'tendre')], { theme: 'separation' }),
      dit('dar', 'papa', 'low, remembering', 'Il y a dix ans, à Marseille, sur le quai de la gare, j’ai croisé un homme. C’était lui. Hassan.', [un('papa', -0.5, 'triste'), un('zahra', 0.5, 'surprise')], { theme: 'mystere', cam: 'push' }),
      dit('dar', 'zahra', 'whispering, stunned, old woman', 'Tu l’as vu… et tu ne m’as rien dit ?', [un('papa', -0.5, 'triste'), un('zahra', 0.5, 'pleure')], { theme: 'separation' }),
      dit('dar', 'papa', 'breaking, ashamed', 'Il m’a regardé. Et moi, j’ai fait semblant de ne pas le reconnaître. J’ai eu honte, Yemma. Honte de ce que j’avais caché.', [un('papa', -0.5, 'pleure'), un('zahra', 0.5, 'triste')], { theme: 'separation', cam: 'push' }),
      reac('dar', [un('papa', -0.5, 'pleure'), un('zahra', 0.5, 'triste')], 3, { theme: 'separation' }),
      dit('dar', 'narration', 'soft, storyteller', 'Dans le silence, Nour ouvrit la vieille boîte à biscuits. Sous les lettres, il y avait une photo rayée.', [un('nour', 0, 'surprise')], { theme: 'mystere' }),
      dit('dar', 'nour', 'soft, surprised', 'Papa… c’est toi, sur la photo ? Tu avais mon âge, et tu tenais la main d’un garçon plus grand.', [un('nour', -0.5, 'surprise'), un('papa', 0.5, 'tendre')], { theme: 'famille' }),
      dit('dar', 'papa', 'tender, painful', 'Oui. Mon grand frère. C’est lui qui me portait sur ses épaules, quand j’étais petit.', [un('nour', -0.5, 'tendre'), un('papa', 0.5, 'tendre')], { theme: 'famille', cam: 'push' }),
      dit('dar', 'zahra', 'tender, trembling, old woman', 'Il t’aimait plus que tout, Karim. Il t’aimait comme on aime ce qu’on a promis de protéger.', [un('papa', -0.5, 'pleure'), un('zahra', 0.5, 'tendre', { act: 'tend' })], { theme: 'retrouvailles' }),
      dit('atlas', 'narration', 'soft, mysterious', 'Cette nuit-là, la bonne fée revint à la fenêtre de Nour.', [un('nour', -0.5, 'tendre'), un('nejma', 0.5, 'tendre')], { theme: 'espoir', tint: 'nuit', cam: 'pan' }),
      dit('atlas', 'nejma', 'warm, ethereal', 'Tu vois, petite ? Le courage d’avouer arrive toujours en retard. Mais il arrive.', [un('nour', -0.5, 'tendre'), un('nejma', 0.5, 'tendre')], { theme: 'espoir', tint: 'nuit' }),
      dit('atlas', 'nour', 'soft, hopeful', 'Alors Hassan est quelque part. Et on va le retrouver.', [un('nour', -0.5, 'joie'), un('nejma', 0.5, 'tendre')], { theme: 'nour', tint: 'nuit' }),
      dit('atlas', 'narration', 'soft, mysterious', 'Il suffisait de suivre une adresse… jusqu’à une porte que Nour connaissait déjà.', [], { theme: 'mystere', cam: 'pan' }),
    ],
  },
  {
    numero: 4,
    titre: 'Monsieur Ali',
    demain: 'Le voyage de Hassan',
    question: 'Qui est vraiment Monsieur Ali ?',
    plans: [
      dit('rue', 'narration', 'warm, storyteller', 'De retour en France, Nour dépliait la lettre chaque soir, comme une carte au trésor.', [un('nour', -0.5, 'tendre'), un('yacine', 0.5, 'neutre')], { theme: 'mystere', cam: 'pan' }),
      dit('rue', 'yacine', 'curious, small child', 'Nour, pourquoi tu regardes toujours cette enveloppe ? C’est une recette de gâteau ?', [un('nour', -0.5, 'surprise'), un('yacine', 0.5, 'joie')], { theme: 'famille' }),
      dit('rue', 'nour', 'whispering, serious', 'Chut, Yacine. C’est une rue. Et je crois que je sais où elle est.', [un('nour', -0.5, 'tendre'), un('yacine', 0.5, 'surprise')], { theme: 'mystere' }),
      dit('rue', 'narration', 'soft, storyteller', 'Elle descendit l’escalier, traversa la cour de l’immeuble, et s’arrêta devant la porte du vieux voisin du rez-de-chaussée.', [un('nour', 0, 'surprise')], { theme: 'mystere', cam: 'push' }),
      dit('rue', 'nour', 'quiet, amazed', 'Rue des Cèdres, numéro douze… C’est ici. C’est chez Monsieur Ali.', [un('nour', 0, 'surprise')], { theme: 'mystere' }),
      dit('dar', 'ali', 'warm, old man, gentle', 'Nour ! Quelle bonne surprise. Tiens, un bonbon à la menthe, comme chaque été.', [un('nour', -0.5, 'surprise'), un('ali', 0.5, 'joie')], { theme: 'famille' }),
      dit('dar', 'nour', 'hesitant, soft', 'Monsieur Ali… vous avez déjà écrit une lettre pour le Maroc ?', [un('nour', -0.5, 'tendre'), un('ali', 0.5, 'surprise')], { theme: 'mystere' }),
      dit('dar', 'narration', 'soft, mysterious', 'Dans le regard du vieil homme, quelque chose trembla, comme l’eau d’un puits quand on y jette une pierre.', [un('nour', -0.5, 'tendre'), un('ali', 0.5, 'peur')], { theme: 'mystere', cam: 'push' }),
      dit('dar', 'nour', 'brave, soft', 'Cette lettre est de la part d’un certain Hassan. Et c’est votre écriture, Monsieur Ali. Je l’ai reconnue sur vos cartes de vœux.', [un('nour', -0.5, 'tendre'), un('ali', 0.5, 'surprise')], { theme: 'mystere' }),
      dit('dar', 'ali', 'whispering, broken, old man', 'Ma main… Après vingt-cinq ans. Alors elle n’est jamais arrivée.', [un('nour', -0.5, 'tendre'), un('ali', 0.5, 'pleure')], { theme: 'separation', cam: 'push' }),
      dit('dar', 'nour', 'whispering', 'Vous êtes Hassan.', [un('nour', -0.5, 'surprise'), un('ali', 0.5, 'pleure')], { theme: 'retrouvailles' }),
      dit('dar', 'narration', 'soft, storyteller', 'Monsieur Ali ferma les yeux. Les bonbons à la menthe tombèrent sur le tapis, un à un, comme des années.', [un('ali', 0, 'pleure')], { theme: 'separation' }),
      dit('atlas', 'nejma', 'warm, ethereal', 'Les plus longs voyages, petite, sont ceux qu’on fait sans quitter sa rue.', [un('nour', -0.5, 'tendre'), un('nejma', 0.5, 'tendre')], { theme: 'espoir', tint: 'nuit' }),
    ],
  },
  {
    numero: 5,
    titre: 'Le voyage de Hassan',
    demain: 'La place vide',
    question: 'Hassan osera-t-il rentrer ?',
    plans: [
      dit('dar', 'narration', 'warm, storyteller', 'Ce soir-là, dans la petite cuisine de Monsieur Ali, le thé refroidissait.', [un('nour', -0.5, 'tendre'), un('hassan', 0.5, 'triste')], { theme: 'separation', cam: 'pan' }),
      dit('dar', 'hassan', 'low, trembling, old man', 'J’ai écrit chaque mois pendant un an. Sans réponse, j’ai cru que ma mère ne voulait plus de moi.', [un('nour', -0.5, 'tendre'), un('hassan', 0.5, 'triste')], { theme: 'separation' }),
      dit('dar', 'nour', 'gentle', 'Mais la lettre n’est jamais partie, Monsieur. Papa l’avait cachée.', [un('nour', -0.5, 'tendre'), un('hassan', 0.5, 'surprise')], { theme: 'mystere' }),
      dit('dar', 'hassan', 'stunned, soft, old man', 'Karim… Le petit Karim. Il avait treize ans. Je ne lui en veux pas.', [un('nour', -0.5, 'tendre'), un('hassan', 0.5, 'tendre')], { theme: 'famille', cam: 'push' }),
      dit('dar', 'narration', 'soft, storyteller', 'Mais l’histoire était plus lourde que ça : des papiers perdus, une santé fragile, et la honte d’avoir tant tardé.', [un('hassan', 0, 'triste')], { theme: 'separation' }),
      dit('dar', 'hassan', 'ashamed, low, old man', 'Comment me présenter devant elle, avec mes mains vides et mes cheveux blancs ?', [un('nour', -0.5, 'tendre'), un('hassan', 0.5, 'pleure')], { theme: 'separation' }),
      dit('dar', 'nour', 'warm, certain', 'Elle ne vous attend pas riche, Monsieur. Elle vous attend vivant.', [un('nour', -0.5, 'joie'), un('hassan', 0.5, 'surprise')], { theme: 'retrouvailles', cam: 'push' }),
      dit('dar', 'hassan', 'whispering, broken, old man', 'Promets-moi une chose, Nour. Ne dis rien à personne, pas encore. Je dois le faire moi-même.', [un('nour', -0.5, 'tendre'), un('hassan', 0.5, 'pleure')], { theme: 'separation' }),
      dit('dar', 'narration', 'soft, mysterious', 'Sa main tremblait en tenant la tasse. Nour comprit : ce n’était pas Hassan qui avait été perdu. C’était lui qui avait voulu ne pas être retrouvé.', [un('hassan', 0, 'triste')], { theme: 'mystere', cam: 'push' }),
      dit('dar', 'nour', 'brave, whispering', 'Je promets. Mais pas pour toujours.', [un('nour', -0.5, 'tendre'), un('hassan', 0.5, 'tendre')], { theme: 'nour' }),
      dit('atlas', 'nejma', 'warm, ethereal', 'Aider quelqu’un, petite, ce n’est pas parler à sa place. C’est l’attendre sur le seuil.', [un('nour', -0.5, 'tendre'), un('nejma', 0.5, 'tendre')], { theme: 'espoir', tint: 'nuit' }),
      dit('dar', 'narration', 'soft, storyteller', 'Quelques semaines plus tard, Hassan acheta un billet pour le Maroc. Il le garda dans sa poche, sans oser le regarder.', [un('hassan', 0, 'triste')], { theme: 'mystere' }),
      dit('dar', 'hassan', 'whispering, hopeful, old man', 'L’Aïd… Ce sera à l’Aïd. Si je n’ai pas peur… ce sera à l’Aïd.', [un('hassan', 0, 'tendre')], { theme: 'espoir', cam: 'push' }),
    ],
  },
  {
    numero: 6,
    titre: 'La place vide',
    demain: 'Saison 2 : les cèdres',
    question: 'Et si l’histoire de la famille ne faisait que commencer ?',
    plans: [
      dit('atlas', 'narration', 'warm, storyteller', 'Le matin de l’Aïd, le village de l’Atlas sentait la fleur d’oranger et le pain doré.', [], { theme: 'espoir', cam: 'pan' }),
      dit('dar', 'zahra', 'joyful, busy, old woman', 'Nour ! Yacine ! Mettez la table. Six assiettes… non, sept.', [un('yacine', -0.5, 'surprise'), un('zahra', 0.5, 'joie')], { theme: 'famille' }),
      dit('dar', 'yacine', 'puzzled, small child', 'Sept ? Mais on est six, Lalla Zahra !', [un('yacine', -0.5, 'surprise'), un('zahra', 0.5, 'tendre')], { theme: 'famille' }),
      dit('dar', 'zahra', 'soft, mysterious, old woman', 'Sept, mon oiseau. Il y a toujours une assiette pour celui qui est en route.', [un('yacine', -0.5, 'surprise'), un('zahra', 0.5, 'tendre')], { theme: 'retrouvailles', cam: 'push' }),
      dit('dar', 'narration', 'soft, storyteller', 'Vingt-cinq ans qu’elle posait cette place vide, à chaque fête. Puis, un coup résonna à la porte.', [un('zahra', 0, 'surprise')], { theme: 'mystere' }),
      dit('dar', 'zahra', 'trembling, old woman', 'Qui est là ?', [un('zahra', 0, 'peur')], { theme: 'mystere' }),
      dit('dar', 'hassan', 'trembling, old man, behind a door', 'Yemma… c’est moi. C’est Hassan.', [un('zahra', -0.5, 'pleure'), un('hassan', 0.5, 'pleure')], { theme: 'retrouvailles', cam: 'push' }),
      dit('dar', 'narration', 'soft, awed', 'La porte s’ouvrit lentement. Lalla Zahra ne cria pas. Elle ne pleura pas tout de suite. Elle regarda son fils, de la tête aux pieds, comme on relit une lettre.', [un('zahra', -0.5, 'tendre'), un('hassan', 0.5, 'pleure')], { theme: 'retrouvailles' }),
      dit('dar', 'zahra', 'whispering, broken, old woman', 'Tu as les cheveux blancs… Entre, mon fils. Ta place t’attend.', [un('zahra', -0.5, 'pleure', { act: 'tend' }), un('hassan', 0.5, 'pleure')], { theme: 'retrouvailles', cam: 'push' }),
      dit('dar', 'hassan', 'sobbing, old man', 'Pardon, Yemma… pardon d’avoir été si long.', [un('zahra', -0.5, 'pleure'), un('hassan', 0.5, 'pleure')], { theme: 'retrouvailles' }),
      dit('dar', 'zahra', 'tender, old woman', 'Chut. On ne dit pas pardon à une mère qui te serre dans ses bras.', [un('zahra', -0.5, 'tendre'), un('hassan', 0.5, 'pleure')], { theme: 'retrouvailles' }),
      dit('dar', 'papa', 'choked, emotional', 'Hassan… mon frère. C’est moi qui te dois pardon.', [un('papa', -0.5, 'pleure'), un('hassan', 0.5, 'tendre')], { theme: 'retrouvailles' }),
      dit('dar', 'hassan', 'warm, shaky, old man', 'Karim. Petit frère. Viens ici.', [un('papa', -0.5, 'pleure'), un('hassan', 0.5, 'joie')], { theme: 'famille', cam: 'push' }),
      dit('dar', 'narration', 'warm, storyteller', 'Ce jour-là, il y eut sept assiettes, sept sourires, et une lettre posée au milieu de la table, enfin arrivée.', [un('nour', -0.5, 'joie'), un('yacine', 0.5, 'joie')], { theme: 'famille' }),
      dit('atlas', 'nejma', 'warm, ethereal', 'Voilà, petite. Une lettre n’a jamais fini de voyager tant qu’elle n’a pas trouvé un cœur.', [un('nour', -0.5, 'joie'), un('nejma', 0.5, 'joie')], { theme: 'espoir', tint: 'nuit' }),
      dit('route', 'narration', 'soft, warm', 'Et la route du retour, cet été-là, fut la plus légère de toutes.', [un('nour', -0.5, 'joie'), un('yacine', 0.5, 'joie')], { theme: 'famille', cam: 'pan' }),
    ],
  },
];

export const avecVoix = (plan) => !!plan.parle;

export function texteParle(plan) {
  return `[${plan.ton}] ${plan.texte.replace(/\*/g, '')}`;
}
