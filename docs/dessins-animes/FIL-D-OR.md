# « Le Fil d'or » : le feuilleton dramatique pour adolescents

Une série originale, dans l'ambiance des grands feuilletons animés des années 80
(musique qui serre le cœur, injustice, orphelins, secret de famille,
retrouvailles), avec des personnages marocains, du français et un peu de
darija. Aucun personnage, aucune scène et aucune mélodie repris d'une œuvre
existante. Remplace le dossier `SAGA-SAFIA.md` (version pour enfants, jamais
animée), gardé pour mémoire.

## L'histoire

**Amal** (« espoir »), 15 ans, orpheline, grandit à Taza dans une maison
d'enfants, Dar Lalla Rkia. Elle a une **cicatrice** au visage, souvenir de la nuit
du feu où elle a perdu ses parents. Elle brode : son fil d'or est son seul
héritage. Une bourse anonyme l'envoie au lycée de riches Al Andalus. Elle y
trouve une rivale, un garçon bon, une broche qui porte le point de sa mère, et
un secret. Quand la maison d'enfants risque de fermer, elle doit choisir.

| Personnage | Rôle |
|---|---|
| **Amal** | Héroïne. Cicatrice sur la joue, tête dure, grand cœur. |
| **Idriss** (16) | Orphelin lui aussi, joue de l'oud, loyal, cicatrice au menton. |
| **Ghita** (15) | La riche rivale, seule derrière sa froideur. Sa cousine, en vrai. |
| **Reda** (17) | Garçon riche et juste. |
| **Lalla Rkia** | Directrice de la maison d'enfants. Douce et fatiguée. |
| **Lalla Kenza** | La mystérieuse bienfaitrice : la grand-mère d'Amal. |

Saison 1 (les 6 premiers chapitres) : 6 épisodes de 2 à 3 minutes, format vertical, chacun finissant
sur une question. La saison entière (120 chapitres) est planifiée dans
[FIL-D-OR-SAISON-1.md](FIL-D-OR-SAISON-1.md). Voir `scripts/ados/histoire.mjs`.

1. **Le fil d'or** : la lettre, l'adieu, la nuit où une vieille dame pleure.
2. **La porte d'Al Andalus** : humiliation, un ami, la broche.
3. **La maison qui va fermer** : trois semaines pour sauver les enfants.
4. **Le prix du silence** : un marché avec la rivale.
5. **La robe** : la trahison au gala, l'oud vendu.
6. **Lalla Kenza** : le secret du feu. Fin de saison, la suite : les années
   passent, les personnages grandissent.

## Ce qui est fabriqué, et comment

Tout est dans `scripts/ados/` :
- `histoire.mjs` : l'histoire, les répliques, les personnages ;
- `dessin.js` : le dessin (décors, personnages, émotions, larmes, bouche qui
  suit la voix, gestes : poing, main sur le cœur, bras tendu, rire, recul sous le
  choc ; plans d'insertion : feu, lettre, broderie, broche, robe, calendrier,
  maison ; caméra qui avance, secoue ou balaie ; pétales et rayons de lumière) ;
- `montage.mjs` : le minutage et le découpage en shorts ;
- `assembler.mjs` : film complet ou shorts ;
- `musique.mjs` : la musique, composée par le code : un thème en ré hijaz à
  l'oud, doublé par des cordes en trémolo quand l'émotion monte, avec un souffle
  de pièce et la pluie ;
- `fabriquer.mjs` : assemble images, voix et musique en vidéo.

```
# voix : un fichier par réplique dans videos-ados/voix/epN/NN.wav (NN = plan, à partir de 01)
node scripts/ados/fabriquer.mjs          # tous les épisodes
node scripts/ados/fabriquer.mjs 3 4      # seulement le 3 et le 4
node scripts/ados/assembler.mjs film     # tous les épisodes en un seul film
node scripts/ados/assembler.mjs shorts 60  # des shorts d'environ 60 s, coupés entre deux plans
```

Résultat : `videos-ados/fil-d-or-NN.mp4` (1080 × 1920) et son `.srt`
(sous-titres pour YouTube). Le dossier n'est pas dans Git (fichiers lourds).
Il faut `ffmpeg` et Playwright sur la machine.

Voix : synthèse ElevenLabs via Speko (le plus économique pour tester :
environ 5 centimes la minute). Le mieux reste de **vraies voix marocaines**.
Pour cela, enregistrer chaque réplique dans `videos-ados/voix/epN/NN.wav` :
le reste se refait tout seul.

## Limites à connaître, honnêtement

- Je n'ai pas pu **écouter** la musique ni les voix : j'ai vérifié le
  volume, la durée et le spectre, pas le plaisir d'écoute. À faire écouter.
- Le dessin est stylisé (vectoriel, sobre), pas de l'animation de studio.
  La force de la série doit venir de l'histoire, des voix et de la musique.
- Ce n'est pas l'esprit « enfants » : le public visé a 13 ans et plus. Sur
  YouTube, la case « conçu pour les enfants » ne s'applique pas ; vérifier la
  tranche d'âge avec les règles du moment.
- La darija est encore très rare dans les dialogues de la saison 1 :
  à augmenter épisode après épisode, et à faire relire par une personne qui la
  parle.
- Aucun revenu n'est garanti.

## Prochaines étapes

1. Écouter, corriger le ton de chaque voix.
2. Publier les 6 épisodes en privé, puis regarder dans YouTube Studio combien
   de secondes les gens regardent et combien reviennent.
3. Si ça marche : saison 2 (les personnages grandissent), version espagnole,
   puis les autres langues.
