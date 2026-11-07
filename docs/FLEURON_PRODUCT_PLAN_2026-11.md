# RME Voyage — plan produit fleuron

Date : 2026-11-04. Base : main. Statut : audit documentaire initial, non exhaustif ; pas une validation de production.

## Décision produit
RME Voyage doit devenir le compagnon de décision France/Europe ↔ Maroc : savoir comment partir, combien cela coûte, quoi préparer et comment réagir aux imprévus. La promesse n'est pas « beaucoup de widgets », mais « un voyage mieux préparé ».

North Star Metric proposée : voyages préparés avec au moins une action utile terminée (itinéraire calculé, checklist sauvegardée, comparaison consultée ou partenaire ouvert) par utilisateur actif. Une page vue seule ne compte pas.

## Faits observés
- app/HomeClient.tsx orchestre de nombreux widgets : itinéraire, décision, prière, carte, actualités, checklist, change, transferts, comparateurs, météo, douane, urgence, calendrier, eSIM, carburant et contenus commerce.
- Le code d'accueil documente déjà un principe : prochaine étape visible, outils secondaires rangés. Préserver et vérifier ce principe.
- MONETISATION.md indique que les clics sont mesurables, mais conversions/revenus réels non mesurés ; partenaires configurables et liens approuvés requis.
- ARCHITECTURE.md indique Supabase optionnel, mode dégradé et mobile non publié.
- Documents d'audit/deploiement sont datés et historiques. Ils ne prouvent pas l'état actuel sans contrôle des commits, CI et Netlify.

## P0 — vérité opérationnelle
1. Matrice ACTIVE / CONFIGURABLE / LAB / NOT VERIFIED pour chaque fonctionnalité affichée.
2. Vérifier le déploiement Netlify actuel et son SHA comparé à main.
3. Depuis une copie propre, lancer lint, typecheck, tests et build ; relever les résultats réels.
4. Auditer secrets, routes API, rate limits, logs et données personnelles.
5. Corriger les blockers avant toute promesse de disponibilité.

## P1 — parcours principal
1. CTA primaire unique : Préparer mon voyage.
2. Demander seulement départ, destination, date/période et mode de transport ; compte facultatif.
3. Résultat synthétique : durée/coût estimés, étapes/alternatives, source et fraîcheur.
4. Checklist contextualisée, sauvegardable localement et utilisable hors connexion.
5. Outils secondaires accessibles sans encombrer le parcours.
6. États explicites : chargement, erreur, indisponible, estimation, source et dernière mise à jour.

## P1 — données et confiance
- Données volatiles : source, date, statut live/cache/estimation/indisponible.
- Ne jamais inventer tarifs, horaires, disponibilités, affiliations ou revenus.
- Repli clair en cas d'erreur fournisseur ; vérifier timeout, cache, retry et données obsolètes.

## P1 — conversion responsable
1. Funnel : trip_started, route_calculated, comparison_viewed, partner_click, checklist_saved.
2. Ne pas transmettre adresses, villes saisies, documents, identifiants ou données sensibles.
3. Séparer clic partenaire, conversion confirmée et commission reçue.
4. Rapport par placement/produit seulement si collecte réellement active.
5. Afficher affiliation uniquement pour URL et compte validés.

## P2 — accessibilité, performance, rétention
- Tester petit écran, clavier, lecteur d'écran, contraste, zoom et français simple.
- Mesurer le bundle initial : l'accueil importe de nombreux composants ; différer ceux non nécessaires au premier écran.
- Mesurer LCP, INP, CLS et erreurs JS sans ajouter un analytics coûteux avant décision.
- PWA : cache sûr, choix utilisateur, purge et version vérifiés.
- Parcours famille/voiture/ferry/avion sans demander toutes les données à tous.

## Critères de sortie
- Parcours principal compréhensible en moins de 10 secondes en test utilisateur.
- Aucun CTA sans action réelle ni faux succès.
- Source/fraîcheur visible pour données volatiles.
- Lint, typecheck, tests et build réussis sur commit candidat.
- Tests mobile/accessibilité documentés.
- Aucun secret dans bundle/logs.
- SHA production identique au commit validé.
- Tracking distingue clic et revenu.
- Fonctions non vérifiées étiquetées ou retirées de la promesse.

## Ordre d'exécution
1. Contrôle Git/CI/Netlify et matrice de vérité.
2. Test parcours principal et audit UX mobile.
3. Correctifs P0 + tests.
4. Réduction friction et états data.
5. Tracking et validation partenaires.
6. Performance/accessibilité et tests terrain.
7. Publication après validation SHA + production.

## Limites
Note initiale issue des documents et fichiers d'entrée consultés. Elle ne prétend pas avoir exécuté les tests, inspecté toutes les routes, vérifié les comptes partenaires, testé les appareils ou contrôlé Netlify en temps réel. Ces validations restent nécessaires avant merge/déploiement.
