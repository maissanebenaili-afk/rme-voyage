# Question Value Gate : mesure du 2026-10-03

Hypothèse : une question n'est utile que si sa réponse change matériellement l'action, l'état du voyage ou la validité de la recommandation. Les 30 % de réponses « sans changement visible » de `RESOLUTION_LOOP.md` peuvent-ils être supprimés sans perdre d'information utile ?
Mesure : `__tests__/labQuestionGate.experiment.test.ts` (rejoue les 43 réponses des 26 scénarios, données dans `__tests__/fixtures/labScenarios.ts`). Le code du produit n'a pas été modifié.

## Observations

1. `rankedChoices()` compte comme « changement du plan » un changement du texte de justification (`planDistance` compare type + lien + texte). Les « 49 % précisent » mêlaient des changements décisionnels et du simple vocabulaire.
2. Les 43 réponses sont donc reclassées par effet réel : débloque une action, change l'action (type, lien, partenaire, ordre), change le voyage enregistré, change le contenu de la recommandation, change seulement le texte du vol, rien.
3. Deux capacités du produit décident de la valeur d'une question : les liens de vol sont-ils pré-remplis avec départ et date (PR #197, non fusionnée) ? Le voyage enregistré compte-t-il (il n'existe que si l'utilisateur appuie sur « Enregistrer ») ?

## Mesures (43 réponses)

Effet réel de la réponse, produit d'aujourd'hui : débloque une action 4, change l'action 7, change le voyage enregistré 10, **change seulement le texte du vol 20**, rien 2. Avec la #197, les 20 réponses « texte du vol » deviennent des changements d'action : 20 sur 43 n'étaient « sans effet » que parce que le produit n'utilise pas encore la réponse.

Le gate décide avant la réponse, à partir des réponses possibles : ASK (toutes changent quelque chose), OFFER (certaines confirment seulement le défaut : on montre le plan et on offre les autres réponses), DEFER (effet seulement si le produit s'en sert plus tard), SKIP (aucun effet).

| Hypothèse sur le produit | Décisions du gate | Questions posées (base 43) | Même résultat décisionnel | Réponses utiles perdues |
|---|---|---|---|---|
| aujourd'hui, voyage enregistré compté | ASK 21, OFFER 9, DEFER 13 | **24** (-44 %) | 21 sur 21 | 0 |
| aujourd'hui, plan visible seulement | ASK 6, OFFER 24, DEFER 13 | **14** (-67 %) | 21 sur 21 | 0 |
| avec #197, voyage enregistré compté | ASK 34, OFFER 9 | **34** (-21 %) | 21 sur 21 | 0 |
| avec #197, plan visible seulement | ASK 19, OFFER 24 | **24** (-44 %) | 21 sur 21 | 0 |

Par question (aujourd'hui) : la destination est toujours ASK ; l'origine est DEFER (13 fois sur 15) ; le mode est ASK, ou OFFER si l'on ne compte que le plan visible (« Avion » ne change que le voyage enregistré) ; la date est OFFER (seule une date proche change l'ordre).

Le classement actuel des questions est trompé par le vocabulaire : la première question posée est la même qu'avec un classement sémantique dans **1 scénario sur 11** aujourd'hui, 6 sur 11 avec la #197. Le classement actuel suppose en fait déjà les liens pré-remplis.

## Règles possibles

- R1 : classer et décider sur le changement décisionnel, jamais sur le texte.
- R2 : réévaluer toutes les questions non posées après chaque réponse (voir contre-exemple 1).
- R3 : DEFER n'est permis que s'il existe un moment où la question sera posée (enregistrer le voyage, pré-remplir le vol, calculer la route en voiture). Sans ce déclencheur, DEFER est une perte.
- R4 : OFFER (« Avion » déjà supposé, proposer « Pas en avion ? ») seulement si le défaut est le cas le plus fréquent. Non mesuré.
- R5 : avant de supprimer une question, chercher si le produit peut utiliser la réponse (pré-remplissage).

## Contre-exemples et limites

1. Un gate statique perdait de l'information dans 3 scénarios sur 21 : l'origine ne compte pour la route en voiture qu'une fois le mode « voiture » connu. La valeur d'une question dépend des autres réponses. Corrigé par R2 : 0 perte.
2. Ce que le gate « sauve » n'est pas gratuit : le voyage final ne contient plus l'origine ou la date dans 9 à 15 scénarios sur 21. La décision reste identique, mais le fait n'est plus capturé. Sans moment pour le redemander (R3), c'est une perte.
3. Le scénario 05 est écarté : la boucle de référence s'y arrête sur une origine qui n'est pas dans les 3 villes à toucher.
4. La part de voyageurs qui enregistrent leur voyage est inconnue : elle fait passer la réduction de -44 % à -67 %.
5. Les vérités cachées (mode « Avion » par défaut, origines) sont écrites par nous, pas observées. 26 scénarios, un utilisateur synthétique. Rien ne prouve que de vraies personnes répondent ainsi.
6. Un défaut hors sujet trouvé en chemin : deux commits ajoutés à la branche le 29/09 avaient laissé des `\n` littéraux dans `labResolutionLoop.experiment.test.ts`, qui ne se compilait plus. Réparé ici.

## Décision

- **KEEP** : le classement sémantique des réponses comme standard de mesure.
- **REJECT** : « supprimer les 30 % de questions sans effet » tel que posé. Ce chiffre venait du texte, et la valeur d'une question dépend de ce que le produit fait de la réponse.
- **MODIFY / EXPÉRIMENTER** : la suite n'est pas de construire le gate, mais de décider si la #197 avance, car elle change la valeur de 20 réponses sur 43. Ensuite, rejouer cette mesure sur de vraies phrases (celles que Tarek et sa famille tapent sur l'aperçu).
- Rien n'est construit.
