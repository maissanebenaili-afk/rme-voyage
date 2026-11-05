# « Safia et le foulard bleu » : la grande saga

Un feuilleton animé qui reprend **l'ambiance** des grands dessins animés des
années 80 (musique qui serre le cœur, trémolos, injustices, retrouvailles,
cliffhangers) avec une histoire, des personnages et une musique **100 %
originaux**, et une héroïne de la diaspora. Français en langue d'appui, darija
de plus en plus présente, version espagnole puis les autres langues.

C'est la grande sœur de [Kalimat](SERIE.md) : Kalimat reste la petite série
éducative (45 à 60 secondes) ; la saga est le feuilleton qui fait pleurer,
rire et revenir. Les deux vivent sur `/dessins-animes` et sur YouTube.

## Ce qu'on prend, ce qu'on ne prend pas

| On prend (l'ambiance, qui n'appartient à personne) | On ne prend pas (protégé) |
|---|---|
| Une petite héroïne courageuse, seule face à l'injustice | Les personnages, noms, lieux et scènes de Candy, de Princesse Sarah ou d'un autre |
| Les chansons de générique chantées, les trémolos, les silences | Leurs mélodies et leurs paroles |
| Un méchant qui devient presque touchant, un ami fidèle | Leurs dessins et leurs costumes |
| Chaque épisode finit sur une question | Leurs intrigues |

## Le pitch

**Safia, 9 ans, vit à Lyon avec Yemma (sa maman).** Quand Yemma tombe malade
et doit partir se soigner loin, Safia traverse la mer seule, en ferry, vers le
Maroc, chez *Jedda* Fatima, une grand-mère qu'elle n'a jamais vue et qu'on
dit sévère. Elle n'a avec elle que le **foulard bleu** de sa mère.
Dans la montagne, au village, tout est nouveau : la langue, le pain du four,
les cousins qui se moquent, et un secret de famille que personne ne veut dire.
Safia apprend la darija pour comprendre ce secret. **Le spectateur l'apprend
avec elle.**

Le fil qui tient 1000 épisodes : *que s'est-il passé entre Yemma et Jedda, et
Safia retrouvera-t-elle sa mère ?* On répond doucement, saison après saison.

## Les personnages

| Personnage | Rôle |
|---|---|
| **Safia** | 9 ans, cheveux frisés, foulard bleu noué au poignet. Tête dure, grand cœur. |
| **Jedda Fatima** | La grand-mère. Dure dehors, tendre dedans. Fait le pain au four du village. |
| **Idriss** | 10 ans, le garçon du village, ami fidèle, parle un peu français. Berger. |
| **Hind** | 11 ans, la cousine fière et jalouse. Devient peu à peu une alliée. |
| **Moulay Larbi** | Le voisin grincheux, gardien du puits et d'un secret. |
| **Mchicha** | (si on veut faire le lien avec Kalimat) la chatte, qui passe d'une série à l'autre. |

Les prénoms sont courants et sans lien avec un héros connu. Les mots de
darija sont à faire relire par une personne qui la parle avant chaque tournage.

## Le style : 80s, mais pour aujourd'hui

- **Dessin** : grands yeux brillants, regards en gros plan, ciel dramatique,
  cheveux au vent, lumière dorée du soir. C'est ce que la série Kalimat sait
  déjà faire avec `lib/kalimat/dessin.ts`, à pousser plus loin.
- **Musique** : un thème au piano ou au oud, avec trémolo de cordes pour les
  moments forts, et un générique chanté en français avec quelques mots de
  darija. À composer ou à faire composer : **aucune mélodie reprise**.
- **Le fond sonore** (le « petit bruit blanc ») : chaque lieu a son souffle,
  en boucle, très bas : pluie sur le toit en tôle, crépitement du four, vent
  dans les arbres, moteur du ferry, vapeur du hammam. C'est ce qui donne
  l'impression d'être dedans, et l'enfant s'y sent bien.
- **Les voix** : vraies voix d'abord (famille, comédiens, comédiennes qui
  parlent darija). Les voix de synthèse servent à tester. **Jamais de voix
  imitée d'une personne réelle ou d'un acteur connu** : c'est interdit et
  risqué.

## La forme d'un épisode (60 à 90 secondes, vertical)

1. **0 à 3 s : l'accroche.** Une image ou une phrase qui pose la question.
2. **Une scène** : un petit problème, une émotion.
3. **Le moment fort** : silence, trémolo, gros plan.
4. **Les mots du jour** : 2 ou 3 mots de darija, vus et mimés dans l'histoire.
5. **La chute** : une question laissée ouverte. « Demain : … » + un bouton
   pour l'épisode suivant.

Tous les 10 épisodes : un épisode de **récap** (« Ce qui s'est passé »), qui
sert aussi d'entrée pour les nouveaux venus. Pas de lecture automatique sans
fin ni série de jours à ne pas rater : on veut qu'ils reviennent parce qu'ils
aiment, pas parce qu'on les piège.

## Les moments tragiques : jusqu'où aller

Pour que ça touche les enfants dès 3 ans **et** les adultes :

- On montre : la séparation, la solitude, l'injustice, la peur du noir, la
  maladie d'un proche, une lettre perdue, une moquerie.
- On ne montre pas : violence, sang, mort montrée de façon crue, scènes
  effrayantes longues.
- **Règle du câlin** : après chaque moment triste, un geste de réconfort ou
  un petit espoir dans le même épisode. L'enfant ne reste jamais seul avec la
  tristesse.
- Les adultes regardent le même épisode, en famille. Une seule chaîne
  « enfants » (YouTube impose le statut « conçu pour les enfants » quand le
  public visé, ce sont les enfants) : on ne fait donc **pas** de version
  « adulte » sur la même chaîne.

## La darija petit à petit

On suit le plan [PLAN-1000.md](PLAN-1000.md) : environ 10 % de darija dans les
premières saisons, jusqu'à 60 % vers la fin. Dans la saga, c'est **dans
l'histoire** : Safia ne comprend pas au début (les phrases de Jedda
s'affichent en darija, puis le sens), puis elle comprend, puis elle répond.
Le spectateur suit le même chemin.

## Les 5 premiers arcs (50 épisodes, saison 1)

1. **La traversée** (1 à 10) : l'adieu, le ferry, l'arrivée au village.
2. **La maison de Jedda** (11 à 20) : l'épreuve du four, la méfiance, Idriss.
3. **L'école du douar** (21 à 30) : la langue, Hind, la première victoire.
4. **Le puits** (31 à 40) : la sécheresse, Moulay Larbi, le premier secret.
5. **La lettre** (41 à 50) : une lettre de Yemma arrive. Fin de saison.

## Épisode 1 : « Le foulard bleu » (script, à relire)

*Lyon, une cuisine. Pluie sur la fenêtre. Bruit doux de pluie en fond.*

1. Plan large : Safia dessine à la table. Yemma tousse, s'appuie au mur.
2. YEMMA : « Safia, viens. J'ai quelque chose à te dire. »
3. Gros plan sur Safia. Silence. Trémolo.
4. YEMMA : « Je dois me soigner, loin. Tu vas chez *Jedda*, au Maroc. »
5. SAFIA : « Je veux pas ! *Yemma*, je veux pas ! »
6. Yemma lui noue son foulard bleu au poignet : « Tant que tu le portes, je
   suis là. »
7. Port de Sète. Le ferry, énorme. Safia, petite, un sac trop grand.
8. SAFIA (bas) : « *Bslama*, Lyon. »
9. Plan sur la mer. Moteur du ferry en fond. Musique du thème, trémolo.
10. Générique chanté.

**Mots du jour** : *Yemma* (maman), *Jedda* (grand-mère), *Bslama* (au revoir).

**Chute** : à l'arrivée, la porte de la maison de Jedda est fermée. Une voix
derrière : « *Chkoun?* » (qui est-ce ?). Demain : « *Ouvre-moi !* »

## Ce qui peut marcher, et comment on le vérifie

Ce ne sont pas des résultats mesurés : ce sont des raisons de penser que ça
peut marcher, à **tester avant de produire en masse**.

- Les enfants d'aujourd'hui regardent des **vidéos courtes en boucle** : le
  format vertical de 60 à 90 secondes colle à leurs habitudes.
- Les histoires en **feuilleton avec suite** font revenir (on veut savoir la
  suite), à condition de ne pas piéger l'enfant.
- Les **parents** qui ont aimé les dessins animés des années 80 retrouvent
  l'émotion : c'est le moteur du « on regarde ensemble ».
- La **diaspora** n'a presque aucun dessin animé qui lui ressemble.
- On peut doubler dans **plusieurs langues** à partir du même dessin.

**Méthode** : on ne parie pas les 1000 épisodes d'un coup.

1. Faire les **5 premiers épisodes** + le générique, avec de vraies voix.
2. Les publier une semaine, regarder dans YouTube Studio : combien de
   secondes les enfants regardent, combien reviennent le lendemain.
3. Si ça marche : on double ce qui a marché. Sinon on corrige l'histoire, pas
   le nombre d'épisodes.

## Argent : ce qui est réaliste

- **Rien n'est garanti.** Gagner de l'argent avec YouTube demande d'abord
  d'entrer dans le Programme Partenaire (seuils d'abonnés et d'heures de
  visionnage, qui changent) ; les vidéos « pour enfants » paient moins par vue.
- YouTube refuse de monétiser les contenus faits à la chaîne : chaque épisode
  doit avoir une vraie histoire et de vraies voix (voir
  [SERIE.md](SERIE.md)).
- La vraie valeur à long terme, c'est **le public et la marque** : la
  rubrique sur RME Voyage amène du monde vers le portail (partenaires déjà
  branchés), et plus tard des livres illustrés, des peluches, des chansons.
  Rien de tout ça n'est construit aujourd'hui.

## Prochaines étapes

1. Faire relire ce document, le choix des prénoms et les mots de darija.
2. Écrire les épisodes 2 à 5 (même format que ci-dessus).
3. Les ajouter dans `lib/kalimat/episodes.ts` (nouvelle saga à côté de Kalimat)
   et pousser le dessin (ciel, lumière dorée, gros plans).
4. Composer le thème et enregistrer de vraies voix.
5. Publier les 5 premiers, mesurer, décider.
