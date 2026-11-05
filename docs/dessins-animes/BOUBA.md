# « Bouba et le grand stade » : une série comique et émouvante, 100 % inventée

Un petit garçon de neuf ans, Bouba, ses deux amis Léo et Inès, et son grand frère
footballeur Moussa. Chaque épisode : une bêtise, une peur, une grande joie.

## La règle qui ne bouge pas : tout est inventé

- Le club, le stade, la ville, les noms et les scores sont imaginaires.
- Aucun vrai joueur, aucun vrai frère de joueur, aucun vrai club, aucune marque,
  aucun logo. Un test (`__tests__/boubaFoot.test.ts`) refuse tout nom réel.
- Aucune musique du commerce : la musique est composée par le code
  (`scripts/ados/musique-foot.mjs`). **On ne dit jamais « sponsorisé » ni
  « partenaire »** : ce serait faux.
- Pas de caricature : des personnages simples, tendres et drôles.

## La famille (inventée) : d'origine marocaine, dans un club espagnol

Moussa est un jeune footballeur d'origine marocaine qui joue dans un **club espagnol
imaginaire**. Bouba, Léo et Inès vivent dans le quartier du port d'une ville
imaginaire de la côte. C'est un point de départ général, pas le portrait d'une vraie
famille : prénoms, histoires, visages et couleurs du club sont tous inventés.

Ce que ça apporte : la darija à la maison (*yemma*, *wakha*, *safi*, *bslama*), le thé
et le pain de la maman, le va-et-vient entre l'Espagne et le Maroc, les vacances au
pays. Même principe que « Le Fil d'or » : surtout du français, un peu de darija, de
plus en plus au fil des épisodes.

## Suivre le championnat, sans copier personne

Un épisode par « journée » : le rythme (jour, ambiance de week-end, suspense) suit
le calendrier d'un championnat, mais les équipes, les buts et les résultats sont
inventés. Pour attirer du monde, on peut publier le jour des vrais matchs : c'est le
**moment** qui attire, pas un vrai nom.

## Le pilote : « On verra »

Bouba a la promesse de son frère : « on verra ». Pour lui, ça veut dire oui. Les trois
amis tentent d'entrer au stade sans billet. Un agent les arrête. Bouba dit juste le
nom de son frère. Le but arrive, la joie aussi.

## Fabriquer

```
SERIE=foot node scripts/ados/fabriquer.mjs 1     # sortie : videos-foot/foot-01.mp4
```

Les voix vont dans `videos-foot/voix/ep1/NN.wav` (une par réplique).

## Pour toucher beaucoup de monde, honnêtement

- Régularité : un épisode par journée, même jour, même heure.
- Un format court et facile à partager, avec une fin qui donne envie du suivant.
- Si un joueur ou un club le partage un jour, ce sera parce que la série leur plaît
  vraiment, pas parce qu'on a fait croire à un lien qui n'existe pas.
