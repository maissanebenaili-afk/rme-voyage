# Faire pleurer, étonner, et donner envie de revenir

Règles d'écriture pour **tous** les épisodes (Fil d'or, Atlas, noktas, fables). Objectif : qu'un enfant de 8 ans
et sa grand-mère comprennent la même chose, et soient surpris au même moment. Ces règles servent aussi à la
rentabilité : une histoire qu'on suit jusqu'au bout se regarde en entier, et c'est ce que YouTube récompense.

## Les 8 règles

1. **Un enjeu clair en 15 secondes** : qui veut quoi, et ce qu'il risque de perdre. (Nour veut offrir la lettre. Elle risque de blesser son père.)
2. **On aime avant de faire souffrir.** Le petit frère, les blagues, le thé, puis le drame.
3. **Un indice avant chaque surprise.** Un coup de théâtre qui sort de nulle part agace ; celui qu'on avait « presque vu » fait crier.
4. **Un retournement par épisode**, qui change le sens de ce qu'on a vu (pas seulement un malheur de plus).
5. **Règle de trois pour les mystères** : on montre, on précise, on révèle.
6. **Alterner** : joie, rire, tendresse, peur, larmes. Un épisode entièrement triste fatigue.
7. **Le méchant a ses raisons.** Le public pardonne plus facilement ce qu'il comprend.
8. **Fin d'épisode = une question, pas un malheur.** (« Qui est Hassan ? » plutôt que « Il meurt ».)

## Contrôle automatique (dans `__tests__`)

Chaque épisode doit avoir : une question de fin, au moins un moment de joie ET un moment de peine, et des gestes
qui ne couvrent pas toutes les répliques (les thèmes musicaux variés sont aussi vérifiés pour l'Atlas). Cela ne dit pas si c'est beau :
seul un spectateur le dit.

## « Les Larmes de l'Atlas » : la saison 1 (6 épisodes, tous fabriqués le 7 nov. 2026)

| Ép. | Titre | Ce qui se passe | Le retournement | L'indice à planter avant |
|---|---|---|---|---|
| 1 | **La lettre dans la boîte** ✅ fabriqué | Nour apporte à sa grand-mère une lettre jamais remise | Papa connaissait la lettre | la boîte à biscuits, son silence |
| 2 | **Ce que dit la lettre** ✅ fabriqué | Hassan n'a pas abandonné sa famille : il est parti payer une dette de son père, et promettait d'écrire chaque mois | Les lettres s'arrêtent parce que **la première n'est jamais arrivée** : il a cru que sa mère refusait de répondre | l'écriture sur l'enveloppe, les trois timbres |
| 3 | **Karim avoue** ✅ fabriqué | Papa raconte : à 13 ans, il a caché la lettre, par peur de la colère de son père | Il a **croisé Hassan à Marseille** il y a dix ans et a fait semblant de ne pas le reconnaître | une photo de Karim jeune, rayée |
| 4 | **Monsieur Ali** ✅ fabriqué | Nour retrouve la rue de l'adresse : c'est celle de son immeuble | Le voisin qui lui offre des bonbons à la menthe, **c'est Hassan** | M. Ali et ses bonbons, absent du pilote : à ajouter |
| 5 | **Le voyage de Hassan** ✅ fabriqué | Hassan veut revenir mais n'ose pas ; papiers, santé, honte | Il demande à Nour de ne rien dire : **c'est lui qui voulait ne pas être retrouvé** | sa main qui tremble |
| 6 | **La place vide** ✅ fabriqué | Aïd : Hassan arrive. Lalla Zahra ouvre la porte | Elle a gardé **sa place à table pendant vingt-cinq ans** | l'assiette en trop dans l'épisode 1 |

Chaque ligne est écrite pour qu'on comprenne tout sans connaître les épisodes précédents.

## Ce que je n'ai PAS fait

- Les 6 épisodes sont fabriqués et contrôlés (1 min 38 à 3 min 20). **La bonne fée Lalla Nejma** (voix douce, ailes translucides) conclut les épisodes 2 à 6. M. Ali est introduit à l'épisode 4 (pas dans le pilote : un retour dans l'épisode 1 reste possible).
- Aucun test sur un public réel. Un retournement « étonnant » est une hypothèse tant que des spectateurs ne l'ont pas confirmé.
