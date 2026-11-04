# « Kalimat — les mots du bled » : série de dessins animés

Mini-série pour enfants de 4 à 10 ans (et leurs parents), dans la langue des
familles de la diaspora : le « marocain de la rue », du français plein de
darija, avec de temps en temps un mot néerlandais ou espagnol.
Diffusée sur YouTube et dans la rubrique Médias de RME Voyage.

Personnages, noms et dessins **originaux** : style « anime » (grands yeux
expressifs, couleurs vives), sans reprendre un personnage existant (pas de
Caillou, de Candy ni d'autre héros connu).

## Le principe

Chaque épisode raconte une petite histoire de vacances au Maroc. Trois mots
de darija y reviennent plusieurs fois, sont mimés, puis récapitulés à la fin :
« Les mots du jour ». Les enfants les apprennent sans s'en rendre compte.

## La langue : le marocain de la rue

On parle comme à la maison et au bled, pas comme dans un manuel :

- **La base, c'est le français**, pour que tout enfant de France, de Belgique
  ou de Suisse comprenne l'histoire.
- **Beaucoup de darija dans chaque phrase** : *wakha* (d'accord), *safi*
  (c'est bon), *yallah* (allez), *zid* (vas-y), *chouf* (regarde), *3afak*
  (s'il te plaît), *mzyan* (bien), *hchouma* (la honte), *khoya* / *khti*
  (mon frère / ma sœur), *wa3er* (trop fort), *bsaha* (bon appétit).
- **De temps en temps un mot néerlandais**, par Nour, la cousine de Rotterdam :
  *lekker* (bon), *mooi* (beau), *kijk* (regarde), *doei* (salut, en partant).
- **De temps en temps un mot espagnol**, par Yassine, comme on parle dans le
  Nord : *vale* (d'accord), *venga* (allez), *hombre* (mais enfin), et les mots
  de darija venus de l'espagnol (*simana*, la semaine ; *kozina*, la cuisine).
- **Un ou deux mots étrangers au maximum par épisode**, pour que ça reste drôle et pas
  confus. Les trois « mots du jour » restent en darija.
- **Jamais de gros mots ni de jurons**, même ceux qu'on entend dans la rue :
  c'est une série pour enfants.

Exemple de réplique : « *Yallah* Adam, *zid*, la voiture elle attend ! —
*Wakha wakha*, j'arrive ! »

## Les personnages

| Personnage | Âge | Ce qu'il apporte |
|---|---|---|
| **Inès** | 8 ans | Vit à Lyon, curieuse, pose les questions. Cheveux bouclés, sac à dos jaune. |
| **Adam** | 5 ans | Son petit frère, rigolo, répète tout de travers (comique). Casquette rouge. |
| **Yassine** | 9 ans | Leur cousin de Tanger, parle darija et français, explique les mots, glisse un *vale* ou un *venga* du Nord. Skate. |
| **Nour** | 10 ans | La cousine de Rotterdam, sûre d'elle, drôle, lâche un mot néerlandais quand elle s'emballe (*lekker*, *mooi*). Baskets blanches, tresses. |
| **Mima Zohra** | grand-mère | Douce et drôle, raconte des histoires, cuisine. Foulard vert. |
| **Mchicha** | chatte | « Petite chatte » en darija. Ne parle pas, mime les émotions. |

## Format

- **Épisode court (Short vertical) : 45 à 60 secondes**, un par jour.
- **Compilation de la semaine : 3 à 5 minutes**, en vidéo classique, pour le
  temps de visionnage (utile pour la monétisation).
- Structure fixe : générique (5 s) · histoire (35-45 s) · « Les mots du
  jour » (10 s) · « À demain ! — Bslama ! » (2 s).

## Écrire un épisode

1. Un lieu : port, voiture, marché, plage, cuisine de Mima, mariage…
2. Un petit problème simple (on a perdu Mchicha, on a soif, Adam veut tout…).
3. Trois mots de darija, chacun dit 2 à 3 fois, avec un geste qui montre le sens.
4. Une fin positive, et le récapitulatif des mots.

Mots validés à vérifier avec une personne marocaine avant chaque tournage
(prononciation, sens régional).

## Avant de publier sur YouTube : ce qu'il faut savoir

- **Chaîne au nom de Nova Presta**, créée par toi (je ne peux pas la créer à ta place).
- **Vidéos « conçues pour les enfants »** : c'est obligatoire pour ce public.
  Conséquences : pas de publicité personnalisée, donc des revenus plus faibles
  par vue, et pas de commentaires.
- **Monétisation** : il faut d'abord entrer dans le Programme Partenaire
  YouTube (seuils d'abonnés et de visionnage). Les revenus viennent après
  plusieurs mois de publication régulière.
- **Contenu produit en série** : YouTube refuse de monétiser les vidéos
  répétitives ou fabriquées à la chaîne. Chaque épisode doit avoir une vraie
  histoire différente, des voix soignées et une vraie valeur pour l'enfant.
- **Voix** : idéalement de vraies voix (famille, amis, comédiens) ; la darija
  doit être prononcée par quelqu'un qui la parle.

## Fabrication : les options

| Option | Coût | Qualité | Ce que je fais |
|---|---|---|---|
| Animation simple (images fixes animées, « motion design ») | faible | correcte, régulière | scripts, découpage, textes à l'écran, montage guidé |
| Outil vidéo IA (Canva, vidIQ…) | abonnement ou crédits | variable, personnages difficiles à garder identiques | scripts et consignes image par image |
| Animateur freelance | le plus cher | la meilleure | scripts et cahier des charges |

Je recommande de commencer par l'animation simple : régulière, pas chère, et
les personnages restent les mêmes d'un épisode à l'autre.

## Sur RME Voyage

Les épisodes 1 à 3 sont animés et se regardent sur la page `/dessins-animes`
(lien depuis « Radios et télé » et l'accueil). Ils marchent sans réseau une
fois la page ouverte.

- Le dessin est fait par le code (`lib/kalimat/dessin.ts`) : personnages,
  décors, bulles avec les mots de darija en couleur.
- Les épisodes sont des données (`lib/kalimat/episodes.ts`) : pour en ajouter
  un, on écrit ses plans (décor, personnages, réplique), le reste suit.
- Pas encore de voix : les bulles se lisent à voix haute.

## Fabriquer les vidéos YouTube

```
npm run build && npx next start -p 3200
node scripts/kalimat-video.mjs http://localhost:3200 videos-kalimat
```

Pour chaque épisode, le dossier `videos-kalimat/` reçoit :

- `kalimat-01.mp4` : la vidéo verticale 1080 × 1920 (format Short), son muet ;
- `kalimat-01.srt` : les sous-titres, à envoyer sur YouTube. C'est aussi le
  texte minuté pour enregistrer les voix ;
- `kalimat-01.jpg` : la miniature.

Pour les voix : enregistrer chaque réplique au moment indiqué dans le `.srt`,
puis remplacer le son muet (dans YouTube Studio, CapCut ou tout outil de
montage). Pour la musique, la bibliothèque audio de YouTube Studio est
gratuite et sans droits à payer.
