# Boucle de résolution : ce qui a été mesuré (2026-09-29)

Hypothèse : RME a déjà les briques d'une boucle « faits → inconnues → question → réponse → nouveaux faits → action → état », mais elles n'ont jamais été évaluées ensemble.
Tests : `__tests__/labResolutionLoop.experiment.test.ts` (26 scénarios) et `__tests__/labTransfer.experiment.test.ts`. Le code du produit n'a pas été modifié pour les mesurer.

## 1. La boucle sur RME : partiellement vraie

**Observation.** Un utilisateur synthétique répond aux questions posées, avec une vérité cachée par scénario. Sur 26 scénarios : 21 bouclent (phrase → question → réponse → recalcul correct → action → état enregistrable), 4 s'arrêtent correctement sans action (annulation, souvenir, retour ×2), 1 se rompt.

**Preuve (43 réponses simulées).**

| Effet de la réponse | Nombre | Part |
|---|---|---|
| débloque une action qui n'existait pas | 4 | 9 % |
| change l'action principale | 5 | 12 % |
| précise seulement (même action, texte différent) | 21 | 49 % |
| **ne change rien de visible** | **13** | **30 %** |

*Mise à jour 2026-10-03 : la ligne « ne change rien de visible » (30 %) comptait le texte de justification comme un changement de plan. La mesure sémantique est dans `QUESTION_VALUE_GATE.md` : seules 2 réponses sur 43 ne changent vraiment rien ; 20 ne changent que le texte du vol, et deviendraient des changements d'action avec la #197.*

Dans 16 scénarios sur 20 avec question, une action existait déjà avant la première question : la question raffine plus qu'elle ne débloque. Classer les questions par gain donne un premier gain moyen de 1,72 contre 1,60 en ordre naturel (+7 %, 20 phrases). Le +33 % mesuré sur 10 phrases dans la #198 ne se confirme pas sur ce jeu plus large.

**Ruptures trouvées.**
- *Corrigée :* « en avion ou en voiture » ne se résolvait jamais : la réponse « en voiture » était ignorée. 3 questions inutiles par scénario. La dernière mention gagne maintenant.
- *Corrigée :* pour un retour, le bouton « Enregistrer ce voyage » enregistrait une date de départ avec des villes vides. L'état du voyageur, partagé avec la checklist d'accueil, croyait à un aller. Le bouton n'apparaît plus pour un retour. Un voyage annulé ne pouvait déjà pas être enregistré (aucune action, donc pas de bouton).
- *Ouverte :* l'origine n'offre que Paris, Bruxelles, Amsterdam. Lyon n'est pas « tapable ».
- *Ouverte :* la réponse « Avion » ne change rien, car le plan suppose déjà l'avion. Seules « Voiture » et « Ferry » changent le plan. Une question dont la réponse habituelle confirme la valeur par défaut coûte plus qu'elle ne rapporte.
- *Ouverte :* pour un transfert d'argent ou une SIM, RME pose 3 questions (date, origine, mode) alors que l'action voulue est déjà proposée.
- *Ouverte :* « voyageurs » (famille, enfants) n'est jamais demandé : la complétude ne peut pas atteindre 5 sur 5.

**Plus petit prototype à mesurer.** Ne poser une question que si sa réponse non habituelle change l'action principale, et proposer sinon un correctif d'un toucher (« Pas en avion ? ») à la place de la question. Critère de succès : moins de réponses sans effet, sans perdre d'actions débloquées. Non construit.

## 2. Le mécanisme est-il plus général que le voyage ? Partiellement démontré

**Observation.** Un noyau de 10 lignes classe les questions par changement moyen du plan sur leurs réponses possibles.

**Preuve 1.** Branché sur le parseur et le planificateur de RME, sans les modifier, il reproduit exactement `rankedChoices()` (ordre et valeurs) sur 21 phrases : le mécanisme est séparable du voyage.

**Preuve 2, domaine synthétique** (éligibilité à 8 aides, 9 critères, 2 592 profils énumérés ; seule l'aide 1 paraphrase des règles réelles, les 7 autres sont inventées) :

| Façon d'aider | Faits à établir par l'utilisateur |
|---|---|
| liste complète | 9 (25 lignes à lire) |
| questions en ordre fixe | 8,45 en moyenne |
| questions classées par le noyau | **5,96** |
| minimum théorique (avec le recul) | 5,48 |

Le noyau bat l'ordre fixe pour 2 320 profils sur 2 592 et le perd pour 51. Il atteint le minimum pour 1 665 profils. Toutes les façons d'aider donnent la même éligibilité, et elle est correcte.

**Limites.** Règles inventées. L'ordre fixe est arbitraire. Rien ne prouve que des personnes réelles y gagnent. Le mécanisme est classique (questions adaptatives) : ce qui est réutilisable, c'est le noyau, pas le code de RME, qui reste lié au voyage. Un seul cas réel : French Tech Nova pour Nova Presta s'est décidé par un seul fait (la date d'immatriculation).

**Prochaine expérience.** Rejouer le comparatif sur 2 ou 3 démarches réelles décrites par leurs textes officiels, en mesurant le nombre de faits demandés à des personnes réelles.
