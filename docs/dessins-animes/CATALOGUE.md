# Catalogue RME Animation : séries, styles, outils, produits

Mis à jour à la main. Chaque ligne dit **ce qui existe réellement** et **ce qui reste à faire**.
Rien ici n'est une promesse de revenu : personne ne peut garantir qu'une vidéo, une série ou un
produit se vende. Ce catalogue sert à produire beaucoup, vite, sans payer, et à **mesurer** ce qui marche.

## 1. Ce qui existe déjà (vérifié sur les fichiers)

| Série | État | Contenu |
|---|---|---|
| **Le Fil d'or** (drame ado, Taza) | 6 épisodes de 3 min 47 à 4 min 05, son synchronisé (écart mesuré 0,000 s) | `scripts/ados/histoire.mjs` |
| **Les Larmes de l'Atlas** (drame familial, voyage France-Maroc) | **saison 1 complète : 6 épisodes** (1 min 38 à 3 min 20), bonne fée Lalla Nejma, tous contrôles OK | `scripts/ados/histoire-atlas.mjs`, bible : `ATLAS-BIBLE.md` |
| **Les Noktas de Joha** (humour populaire, 32 à 53 s) | **10 noktas fabriquées**, tous contrôles OK | `histoire-nokta.mjs` |
| **Bouba et le grand stade** (comédie, foot) | pilote ancien : refaire avec le moteur actuel | `scripts/ados/histoire-foot.mjs` |

## 2. La machine : ce qu'elle fait toute seule

| Étape | Outil | État |
|---|---|---|
| Écrire une histoire | un fichier `histoire-<nom>.mjs` (plans, répliques, gestes, thèmes) | ✅ |
| Dessiner (décors, personnages, émotions, gestes qui suivent la voix, caméra) | `dessin.js` (Chromium + canvas) | ✅ |
| Voix | synthèse ElevenLabs via Speko (1 appel par réplique) | ✅ coûte des crédits, long à saisir |
| Musique | composée par code : `musique.mjs` (hijaz), `musique-foot.mjs`, `musique-atlas.mjs` (6 thèmes) | ✅ jamais écoutée par un humain |
| Montage, mixage, sous-titres | `fabriquer.mjs` (reprenable par morceaux de 10 s) | ✅ |
| Contrôle qualité | `controle.mjs` : format, durée, niveau, crête, silences, **synchro de chaque voix** | ✅ |
| **Produits dérivés** | `produits.mjs` : audio mp3 pour la voiture, version horizontale 16:9, vignette 1280×720, affiche 1080×1920, bande-annonce 45 s, fiche de diffusion | ✅ testé sur le Fil d'or 1 |
| **Styles d'image** | `STYLE=noir|papier|neon` ou `SERIE.style` dans l'histoire | ✅ 3 styles testés sur images |
| Publication | **toi** (YouTube Studio) | ❌ je n'ai pas accès au compte |

## 3. Les styles : une histoire, plusieurs « mangas »

Une même histoire peut sortir dans plusieurs styles sans la réécrire. Chaque style vise un public et un usage.

| Style | Look | Pour quoi | État |
|---|---|---|---|
| **Feuilleton années 80** (défaut) | couleurs chaudes, grands yeux, larmes, trémolo | Fil d'or, Atlas : le drame familial | ✅ |
| **Néon 2050** (`neon`) | lueur, couleurs qui se décalent, lignes de balayage, violet-cyan | science-fiction, manga « futur », éclats pour les réseaux | ✅ image testée, pas encore en vidéo complète |
| **Noir** (`noir`) | noir et blanc contrasté, encre, forte vignette | polar, suspense, flash-back, version « film noir » d'un épisode | ✅ image testée |
| **Papier / ombres** (`papier`) | teinte crème, grain de papier | contes, fables, **noktas** de Joha : le théâtre d'ombres marocain | ✅ image testée |
| **Chibi comique** | personnages ronds, gros yeux, gags | noktas courtes (45 s) | ❌ à construire : variante de `LOOKS` |
| **Manga papier** (pages) | cases, bulles, trames | album à imprimer ou à lire sur téléphone | ❌ à construire : planches tirées des images d'un épisode |

« Style jamais vu, moderne, 2050 » : le **néon** est le début. Aucun style ne sera « jamais vu » parce qu'il est
nouveau pour moi : le seul test qui compte est de savoir si des spectateurs le reconnaissent et en parlent.

## 4. Les sources d'histoires, sans droits à payer

À vérifier pour chaque histoire (texte exact, traduction utilisée) avant publication.

- **Joha (Nasreddin)** : héros populaire du Maghreb et du monde. Les anecdotes sont du folklore ancien ;
  *les recueils modernes et leurs traductions peuvent, eux, être protégés*. On réécrit avec nos mots.
- **Fables d'Ésope** et de **La Fontaine** : domaine public (textes originaux).
- ***Kalila et Dimna*** : recueil de fables, très ancien, domaine public.
- **Proverbes et dictons marocains** : base de gags et de morales, à faire relire.
- **Histoires de famille, voyages, retours au pays** : originales, c'est ce qui touche le plus les familles de la diaspora.

## 5. Le plan de production (ce que je propose, à toi de dire stop)

Ordre pour apprendre vite avec peu de dépense :

1. **10 noktas animées de 45 à 60 s** (style papier ou chibi) : 10 voix de 3 à 5 lignes chacune. Peu cher, publication rapide, public facile.
2. **4 fables de 2 min** (Kalila, La Fontaine, Ésope) : une morale, une émotion.
3. **Les Larmes de l'Atlas, épisodes 2 et 3** : seulement si le pilote émeut vraiment.
4. **Le Fil d'or** : déjà prêt à publier, à relire (darija).
5. **Bouba, pilote refait** : moteur actuel.

Après chaque publication, regarder dans YouTube Studio : pourcentage de vidéo regardée, moment où les gens
partent, nouveaux abonnés. **On garde ce qui retient, on arrête le reste.**

## 6. Les outils dans le monde : ce qui est utilisable, ce qui ne l'est pas

Tous vérifiés « sur le papier » seulement : je n'ai pas d'accès GPU ici.

| Outil | Ce que c'est | Prix | Pour nous |
|---|---|---|---|
| **Wan 2.x** (Alibaba, ouvert) | vidéo à partir d'une image ou d'un texte | gratuit mais **GPU** | clips de ~5 s pour 1 ou 2 plans forts, sur un PC avec carte graphique ou un service gratuit à quota |
| **HunyuanVideo / LTX-Video** (ouverts) | idem | gratuit, GPU | idem, à comparer |
| **ComfyUI** | atelier qui enchaîne ces modèles | gratuit | utile **seulement** avec GPU |
| **AnimateDiff** | anime des images dans un style | gratuit, GPU | style manga, incohérent d'un plan à l'autre |
| **Wav2Lip, LatentSync, MuseTalk** | lèvres synchronisées sur une voix | gratuit, GPU | inutile : mes bouches suivent déjà la voix |
| **Blender (Grease Pencil)** | animation 2D/3D de qualité studio | gratuit | le meilleur pour un vrai style « manga 2050 », mais **long à apprendre** |
| **OpenToonz** | animation 2D des studios (utilisé par Ghibli) | gratuit | pour des animateurs |
| **Krita** | dessin et animation simple | gratuit | pour fabriquer des **personnages dessinés à la main** |
| **Whisper** (OpenAI, ouvert) | transcription | gratuit | sous-titres de vraies voix enregistrées |
| **Piper / Coqui / F5-TTS** (voix ouvertes) | voix de synthèse sans abonnement | gratuit | à tester pour réduire le coût des voix (qualité en français à vérifier) |
| **Kdenlive, DaVinci Resolve (gratuit)** | montage vidéo | gratuit | pour des montages à la main |
| **FFmpeg, Chromium** | déjà utilisés | gratuit | ✅ |
| **Runway, Kling, Veo, Sora, Pika, Luma** | vidéo par IA, services payants | crédits | trop chère pour 24 min, utile pour 1 plan |
| **vidIQ** (déjà connecté) | analyse de chaîne et de mots-clés | 150 crédits/mois | ✅ pour **mesurer** et trouver des titres |

Ce que je n'ai pas fait : installer ou lancer l'un de ces modèles. Sans GPU ni quota vérifié, ce serait annoncer
une qualité que je ne peux pas montrer.

## 7. Les produits dérivés d'une même série

À chaque épisode, `produits.mjs` fabrique déjà : l'audio (voiture), la version horizontale (télé),
la vignette, l'affiche, la bande-annonce et la fiche. Ensuite, par style et par série :

| Produit | Fabricable ? | Remarque |
|---|---|---|
| Podcast audio « pour la route » | ✅ déjà | idéal pour le portail RME Voyage |
| Playlists « 1 h pour un trajet » | ✅ sur le papier | à brancher sur la durée des trajets du site |
| Sous-titres FR / ES / NL | ✅ FR ; ES et NL à écrire et faire relire | |
| Album à imprimer (planches) | ❌ à construire | |
| Cartes à jouer, coloriages des personnages | ❌ à construire : contours des personnages | |
| Affiches, fonds d'écran | ✅ avec `produits.mjs` | |
| Peluches, tasses, vêtements | possible plus tard | **seulement avec des personnages 100 % originaux** (c'est le cas) et après avoir un public |
| Vidéos « pour les petits » séparées | à étudier | changent les règles de YouTube (« conçue pour les enfants ») |

## 8. Argent : ce qui est réaliste

- Aucun produit dérivé ne se vend sans public. Le public vient d'abord des vidéos.
- Chemin habituel : publication régulière → abonnés → monétisation de la chaîne (seuils à vérifier chez YouTube)
  → abonnements de fans → produits.
- Un compte de test de 5 abonnés n'est pas un marché. Les premiers chiffres diront.
- Je ne promets ni « riches » ni « viral ». Je promets de produire vite, de mesurer, et de couper ce qui ne marche pas.

## 9. Ce que tu dois faire

1. Écouter et regarder le pilote de l'Atlas et le Fil d'or 1 : l'histoire te touche-t-elle ?
2. Faire relire la darija.
3. Créer ou garder la chaîne, publier en **Privé** puis en public.
4. Me dire quelles noktas ou fables tu veux en premier.
