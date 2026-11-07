# Publier « Coloriages du Maroc » sur Amazon KDP : ce que toi seule peux faire

Fichiers à envoyer (déjà fabriqués, envoyés dans la conversation) :
- `interieur.pdf` : 28 pages, 8,5 × 11 pouces, noir et blanc
- `couverture-avant.png` : 2550 × 3300 pixels
Régénérer : `node scripts/coloriages/fabriquer.mjs` (écrit dans `coloriages-livres/`, hors Git).

## Étapes (environ 40 minutes, une seule fois)
1. Créer le compte sur kdp.amazon.com (identité, informations fiscales et bancaires : c'est toi qui les saisis).
2. *Créer* → *Livre broché*.
3. **Détails** : langue Français ; titre `Coloriages du Maroc` ; sous-titre `25 dessins à colorier : zellige, rosaces, lanternes et thé à la menthe` ; description ci-dessous ; mots-clés ci-dessous ; catégories : choisir « Coloriage » et « Voyage / Maroc » dans la liste proposée.
4. ISBN : prendre l'ISBN gratuit KDP.
5. **Contenu** : papier *blanc*, encre *noir et blanc*, format *8,5 × 11 pouces*, *sans fond perdu* ; envoyer `interieur.pdf` ; couverture : *Créateur de couverture* avec `couverture-avant.png` (ou envoyer une couverture complète si tu en fabriques une).
6. Répondre à la question sur l'**intelligence artificielle** (voir `RENTABILITE.md`).
7. **Tarification** : lire le coût d'impression affiché, choisir un prix **5,99 € à 7,99 €** (jamais en dessous du minimum).
8. Commander **un exemplaire d'épreuve** avant de publier : vérifier les marges et les traits au crayon.
9. Publier. Une fois en ligne, copier le lien du livre et me le donner : je l'ajoute dans `lib/coloriages.ts` (la page `/coloriages` affichera alors le bouton d'achat).

## Description (à coller)
Plongez dans les couleurs du Maroc ! 25 dessins originaux à colorier : rosaces de Fès et de Marrakech, pavages de zellige, portes de médina, lanternes, théière et verres de thé à la menthe, khamsa porte-bonheur. Des traits nets et des zones assez grandes pour les crayons de couleur, pour les enfants comme pour les grands. Format 8,5 × 11 pouces, impression noir et blanc recto-verso. Un livre à offrir, à emporter en voyage ou à colorier en famille sur la route des vacances.

## Mots-clés (7 emplacements)
1. coloriage maroc
2. livre coloriage zellige
3. mandala marocain à colorier
4. motifs orientaux coloriage enfant adulte
5. coloriage lanterne théière thé à la menthe
6. cadeau voyage maroc enfant
7. activité voiture vacances coloriage

## Autres plateformes
- **PDF à imprimer** : Etsy ou Gumroad (aucun coût d'impression). Même `interieur.pdf`.
- **Livre papier ailleurs** : Lulu, ou la distribution élargie de KDP (à lire dans KDP).
- Pour chaque lien publié, remplir `lib/coloriages.ts` : seuls les liens https vers des boutiques connues sont affichés.
