# Mission Omega — rapport de laboratoire : « Quand partir ? »

2026-10-04. Branche expérimentale `claude/lab-crossing-window`. Rien n'est fusionné, déployé ni payé.
Statuts : CONFIRMÉ (source officielle lue), SOURCE (presse ou tiers), HYPOTHÈSE, INCONNU.

## 1. Découverte

Les deux pointes du trajet Europe → Maroc sont publiées **séparément, par deux pays** :
- la France publie à l'avance les jours de route chargée (Bison Futé, calendrier 2026 du 27/03/2026) — CONFIRMÉ ;
- l'Espagne publie après coup les pointes au détroit (bilans de l'Opération Paso del Estrecho) — CONFIRMÉ.

Personne ne relie les deux **pour un voyage donné** : « si je pars de Paris tel jour à telle heure, quel jour suis-je sur la route française, et quel jour j'arrive au port ? ». Un jour vert en France peut faire arriver au port le jour de la pointe.

Preuves :
- Bison Futé 2026 : samedi 1er août « extrêmement difficile » au niveau national ; vendredi 31 juillet « très difficile », « extrêmement difficile » dans le Sud-Ouest (axe Paris → Bordeaux → Espagne) — CONFIRMÉ (PDF officiel ; transcription manuelle à vérifier).
- OPE 2025 : la plus forte concentration de la phase de sortie a eu lieu le premier week-end d'août — CONFIRMÉ (ministère de l'Intérieur espagnol, relayé).
- OPE 2026 : record de 1 929 voitures en 24 h à Tarifa ; 10 056 voitures à Algésiras et Tarifa le samedi 1er août — SOURCE (EFE, 2 août 2026).
- OPE 2026, premier mois : 160 698 véhicules pour tous les ports, soit environ 5 200 par jour — CONFIRMÉ (ministère, 16/07/2026). Le jour du record, Algésiras et Tarifa seuls en ont embarqué presque le double de cette moyenne tous ports confondus.

**Nouveau pour RME** : aucune trace dans le dépôt (0 occurrence de « Bison Futé », « vacances scolaires », « jours de pointe », « quel jour partir »), ni dans le RADAR ni dans l'Idea Vault.

## 2. Trois idées nouvelles

| # | Idée | Ce qu'elle apporte |
|---|---|---|
| 1 | **« Quand partir ? »** : le même voyage suivi dans le temps, route française puis port, avec le piège transfrontalier signalé | Une décision (le jour et l'heure), pas une information |
| 2 | **« Météo du détroit »** : un point hebdomadaire pendant l'OPE, publié et partageable | Distribution saisonnière, sujet que les familles se transmettent déjà |
| 3 | **Widget en marque blanche** du n° 1 pour médias MRE, banques ou assureurs | Revenu B2B possible |

Honnêtement : 2 et 3 sont des couches commerciales de 1, pas trois inventions indépendantes.

**WINNER : n° 1**, le seul qui se construit et se mesure aujourd'hui à 0 €.

## 3. Prototype

- `lib/lab/crossingWindow/data2026.ts` : données sourcées (Bison Futé juillet-août 2026, OPE 2026, jour documenté).
- `lib/lab/crossingWindow/engine.ts` : moteur pur. Calcule les jours passés sur la route française (zones Bison Futé traversées selon la ville de départ), le jour d'arrivée au port, un niveau combiné, le **piège transfrontalier**, et une raison avec son statut pour chaque élément. Un jour sans donnée est « Inconnu », jamais « Fluide ».
- `lib/lab/crossingWindow/trips.ts` : durées réelles de conduite et part française tirées des pages `/trajet` (OSRM).
- `/lab/quand-partir` : écran Lab non lié, non indexé.
- Tests : 12 tests du moteur, 1 test d'écran, 1 mesure.

## 4. Mesures (été 2026, reproductibles : `npx jest __tests__/crossingWindow.experiment.test.ts`)

| Mesure | Résultat |
|---|---|
| Départs évalués | 10 044 (27 villes, 62 jours, 3 heures, 2 façons de rouler) |
| Temps de calcul | 192 ms |
| Départs « verts » en France selon Bison Futé | 4 992 |
| Dont arrivée au port un jour chargé ou plus | 970, soit **19 %** — mais surtout dû à une règle déduite (week-end pendant l'OPE = chargé) |
| Dont arrivée le **week-end de pointe documenté** | **129, soit 2,6 %** — c'est le chiffre solide |

## 5. Échecs et surprises

- Les couleurs de Bison Futé sont **dessinées** dans le PDF, pas écrites : transcription à la main, à vérifier.
- **Aucune série officielle jour par jour** au détroit : seulement des bilans et la presse. Le modèle du port est surtout déduit.
- Mon premier exemple de piège était faux : un départ à 18 h déborde la nuit sur le vendredi rouge. Le moteur l'a montré, le test a été corrigé.
- Le build Next.js n'a pas pu tourner localement (lien `node_modules` du dossier de travail) : la vérification passe par l'aperçu Netlify.
- Le calendrier 2027 de Bison Futé ne paraîtra qu'au printemps 2027 : le produit n'est utile que par saison.

## 6. Red team

- **Les familles savent déjà** qu'il faut éviter le premier week-end d'août. Ce que le moteur ajoute : l'heure et la ville de départ, et le piège du jour vert.
- **Google Maps et Waze** prévoient le trafic à une heure de départ, mais pas la pointe au port le jour d'arrivée — HYPOTHÈSE, non vérifiée en détail.
- **Données d'une seule saison**, modèle du port en partie déduit.
- **Licence** : conditions de réutilisation du calendrier Bison Futé non lues — À VÉRIFIER avant tout usage public.
- **Revenu faible** : voir §7.

**Test des 10 questions** : nouveau (oui, pour ce trajet) ; utile (inconnu) ; mesurable (oui) ; faisable (oui) ; légal (à vérifier) ; peu coûteux (oui) ; monétisable (faible) ; distribuable (oui, par saison) ; défendable (non) ; utilisé demain (non, la saison est finie). **5 oui nets sur 10 : sous le seuil de 7. Verdict honnête : ne pas en faire un produit maintenant.** Le garder comme expérience de contenu pour le printemps 2027, ou l'abandonner.

## 7. Qui paierait

| Payeur | Pourquoi | Combien | Statut |
|---|---|---|---|
| Affiliation ferry (Direct Ferries, en attente) | Réservation sur un jour plus calme | commission inconnue | HYPOTHÈSE, programme non actif |
| Sponsor saisonnier : banques visant les MRE en France (Chaabi Bank, Attijariwafa Bank Europe, Bank of Africa) | Visibilité au moment du départ | À MESURER | Les banques existent et ciblent les MRE (SOURCE) ; budget inconnu |
| Médias MRE (Yabiladi, bladi.net) en marque blanche | Contenu utile pour leur audience | À MESURER | HYPOTHÈSE |

Si la seule réponse était « de la publicité un jour », l'idée serait à rejeter. Ici, le sponsor saisonnier est un vrai acheteur possible, mais aucun budget n'est vérifié.

**Chemin vers le premier euro** : calendrier 2027 publié (mars-avril 2027) → page « Quand partir 2027 » et image partageable → une seule offre de sponsor à une banque ou un média → mesure des partages et des clics.

## 8. Ce que la mission révèle sur RME

- La valeur défendable de RME n'est pas d'afficher des informations, mais de **relier des sources que personne ne relie pour un voyage précis**. Ce prototype en est le premier exemple qui marche.
- **Piste à vérifier, plus grosse que le voyage** : l'argent que les MRE envoient au Maroc chaque année. RME a déjà un comparateur de transferts qui fonctionne, sans aucun lien d'affiliation actif (audit du 03/10). Taille du marché : non chiffrée ici, à vérifier sur une source officielle (Office des changes) — HYPOTHÈSE.

## 9. À arrêter maintenant

Ingestion de médias ; ferry en temps réel ; grosse couche d'IA ; adaptateur météo ; nouvelles PR documentaires sans mesure.

## 10. Candidat d'invention (à faire étudier par un professionnel)

« Propagation d'un voyageur dans le temps le long d'un trajet transfrontalier, avec un niveau de pression différent par pays et par jour, et signalement du décalage entre les sources nationales. » Antériorités probables : planificateurs avec heure de départ (Google, TomTom). **Confiance dans la nouveauté : faible.**

## 11. Prochaine expérience

Une seule question à 5 personnes qui partent l'été prochain : « Si RME vous disait de partir mardi plutôt que vendredi, et pourquoi, changeriez-vous votre jour de départ ? » Mesure : nombre de « oui ».
