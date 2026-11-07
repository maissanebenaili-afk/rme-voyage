# « Les Larmes de l'Atlas » : la bible de la série

Série originale, produite dans ce dépôt (`scripts/ados/histoire-atlas.mjs`). Elle s'ajoute au
« Fil d'or » et à « Bouba » : rien n'est supprimé.

## Le concept retenu (parmi trois)

| # | Idée | Pour | Contre |
|---|---|---|---|
| 1 | **Les Larmes de l'Atlas** : une famille franco-marocaine en route vers sa grand-mère, une lettre jamais envoyée qui révèle un secret | Se regarde **dans la voiture** pendant le trajet, ce que fait déjà RME Voyage. Plusieurs générations à l'écran. Mystère qui tient une saison | Il faut des décors de voyage |
| 2 | Une petite fille séparée de sa grand-mère par la mer (lettres entre deux rives) | Très émouvant, simple à dessiner | Moins de suspense, peu de personnages |
| 3 | Un frère et une sœur qui traversent le Maroc pour retrouver un proche | Aventure, beaux paysages | Plus cher à animer, moins familial |

**Choix : le n° 1.** Il rejoint le portail (voyage, MRE, enfants à l'arrière), donne aux parents un vrai
sujet (ce qu'on ne dit pas à sa mère) et aux enfants un personnage à aimer (Nour).

## Les personnages

- **Nour** (9 ans) : curieuse, têtue, fait passer les autres avant elle. Pull jaune. Thème musical : *nour*.
- **Yacine** (5 ans) : le petit frère qui pose mille questions. C'est lui qui fait rire, donc qui rend le drame plus fort.
- **Karim, le papa** : calme, travailleur, un silence qu'il traîne depuis vingt-cinq ans.
- **Salma, la maman** : douce, lucide, elle voit tout.
- **Lalla Zahra, la grand-mère** : voile blanc, mains qui sentent le pain. Elle attend un fils depuis toujours.
- **Hassan** : le fils aîné, absent. Il n'existe encore que par une lettre.

## Le secret (à ne révéler que peu à peu)

Il y a vingt-cinq ans, Hassan, fâché avec son père, est parti. Il a écrit à sa mère. Karim, treize ans
et en colère contre son frère, a caché la lettre. Il l'a gardée dans une boîte à biscuits, honteux, sans
jamais oser la remettre. Nour la trouve et l'apporte à sa grand-mère.
Épisode 1 : la lettre arrive. Épisode 2 : ce qu'elle dit. Épisode 3 : Karim avoue.
Le pardon n'est jamais facile : il doit être mérité.

## Direction artistique

- Même moteur de dessin que le reste (vectoriel, style feuilleton des années 80), nouveaux visages.
- Décors : la route vers le Maroc au coucher du soleil, le village de l'Atlas au crépuscule, la maison de pierre.
- Couleurs chaudes pour la famille (jaune, orange, bois), bleu-violet pour le mystère.
- Pas de réalisme photographique : ce serait payant, et le style dessiné est notre signature.

## Voix

- **Narratrice** : la voix « Soleil », adoucie au mixage (aigus calmés, chaleur, débit plus lent).
  Voix de synthèse originale, pas le clone d'une comédienne.
- **Dialogues** : voix de synthèse différenciées par personnage. Les voix d'enfants sont des voix
  d'adultes relevées : c'est une limite connue. **Le mieux serait de vraies voix**, enregistrées
  par des personnes qui parlent darija et français.

## Musique (originale, composée par le code, sans licence à vérifier)

Six thèmes qui reviennent : **nour** (héroïne), **famille**, **séparation**, **mystère**, **espoir**,
**retrouvailles**. Instruments : piano, harpe, cordes avec trémolo, flûte, petit tambour (bendir).
Un plan nomme son thème ; la musique passe de l'un à l'autre. **Chaque émotion a aussi sa couleur** (`PROFILS` dans `musique-atlas.mjs`) : joie = harpe, guitare, tambour, tempo plus vif ; tendresse = flûte et piano doux ; tristesse et larmes = violon, cordes qui tremblent, tempo ralenti ; peur = bourdon grave et cœur qui bat ; colère = notes graves martelées ; surprise = petits éclats aigus. C'est le **principe** des grandes bandes originales de feuilletons (la même mélodie change de sens selon l'émotion), jamais leurs mélodies. Voir `scripts/ados/musique-atlas.mjs`.

## Darija : glossaire (à faire relire)

| Mot | Sens | Où |
|---|---|---|
| *habibi* | mon chéri (à un garçon) | Papa à Yacine |
| *Hamdoullah* | Dieu merci | Lalla Zahra |
| *Yemma* | maman | Karim à sa mère |
| *Lalla* | madame, respect | titre de la grand-mère |

Ces mots sont courants, mais **une personne qui parle darija doit les relire** avant toute publication.

## Les langues

Le français est la version de référence. Espagnol et néerlandais : même dessin, même musique, nouvelles
voix et nouveaux sous-titres. Pour l'instant : sous-titres seulement (fichiers `.es.srt`, `.nl.srt`
à relire par un natif) ; les voix viendront après validation du pilote.

## Outils

- **Utilisés** : le moteur de ce dépôt, `ffmpeg`, Chromium (Playwright), voix de synthèse déjà payées.
- **Examinés, pas utilisés** : ComfyUI, Wan, AnimateDiff, Blender, OpenToonz. Ils demandent un GPU
  que cet environnement n'a pas, et leurs clips (5 s environ) changeraient l'apparence des personnages.
  Utilisables plus tard sur **un ou deux plans forts** par épisode, avec accord.

## Conditions de validation du pilote

1. `SERIE=atlas node scripts/ados/controle.mjs` : tous les contrôles passent (format, durée, niveau, synchro).
2. Une personne écoute et dit si **elle a eu envie de voir la suite**.
3. Darija relue. Titre vérifié (originalité) avant publication.
4. Seulement ensuite : épisodes 2 et 3.

## Ce qui n'est PAS fait

- Les voix des enfants ne sonnent pas comme de vrais enfants.
- Aucune écoute humaine n'a eu lieu.
- Le téléchargement hors connexion dans RME Voyage n'est pas encore construit (voir plus bas).

## Plan : vidéos hors connexion dans RME Voyage

Une URL n'est pas un téléchargement. À construire après validation : service worker + Cache Storage /
IndexedDB, téléchargement par épisode et par langue, reprise après coupure, qualité 480p, suppression,
test réseau coupé. Aucune vidéo ne se télécharge sans l'accord de la personne.
