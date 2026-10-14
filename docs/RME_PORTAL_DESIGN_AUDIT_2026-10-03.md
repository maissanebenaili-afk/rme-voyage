# RME Portal — Design & Product Audit 2026-10-03

## Statut
Audit externe + inspection du main. Ce document est une direction de conception, pas une validation de production.

## Constats vérifiés

- RME main possède déjà un accueil très riche : trajet, coût, Live, widgets quotidiens, Hadak, prières/Qibla, actualités, services, météo, calendrier, douane, urgences, sport, TV, boutiques/services, etc.
- Le risque UX principal n'est donc plus l'absence de fonctionnalités mais leur hiérarchie perceptuelle.
- Le projet contient déjà une logique cohérente : intention -> contexte -> prochaine action.
- Radio/TV/sport existent déjà sous forme de liens vers des sources officielles.
- Le manifeste PWA contient déjà des raccourcis Hadak, SOS, Itinéraire et Prières.

## Benchmark externe

### Japon
Japan Travel by NAVITIME combine recherche d'itinéraire, stations, passes, recherche offline de points utiles et planification sur timeline. Sa force est la précision contextuelle plutôt que le volume de fonctions.
Le JNTO Japan Official Travel App agrège transport, lieux, informations de sécurité, hôpitaux adaptés aux étrangers et informations pratiques.

### États-Unis / produits globaux
Wanderlog réunit itinéraire, carte, réservations, optimisation, offline, collaboration, budget et assistant IA, mais conserve une architecture centrée sur le voyage.
Airbnb en 2026 pousse davantage la carte de voyage, les connexions de confiance, les recommandations issues des proches, les quartiers et un assistant contextualisé.

### Insight commun
Les produits forts masquent la complexité derrière un petit nombre de décisions visibles.
La fonction n'est pas la navigation : c'est la réduction du choix.

## Hypothèse RME différenciante

RME ne devrait pas devenir « le plus gros portail marocain ».

Il devrait devenir :
> Le point d'entrée pratique du Marocain/MRE quand il ne sait pas encore quelle action faire.

Le produit doit répondre à:
> « Qu'est-ce que je veux faire maintenant ? »

## Nouvelle grappe légère

Une grappe « Aide / Bons plans / Signaler » peut réunir :
- bonnes adresses vérifiées ;
- signalement Maroc (E-Blagh) ;
- signalement France (PHAROS) ;
- signalement plateforme (Facebook, Instagram, TikTok, YouTube, X) ;
- sécurité numérique / compte compromis ;
- urgence.

RME redirige vers les services officiels. Il ne devient ni autorité, ni modérateur, ni coffre-fort à preuves.

## Principe UX cible

### Accueil
1. Une phrase d'intention.
2. 4 à 6 entrées maximum.
3. Un « Continuer » contextuel.
4. Le reste derrière des couches secondaires.

Proposition de navigation principale:
- Voyager
- Vivre
- Découvrir
- Aide
- Hadak

Le contenu secondaire se découvre au moment où il devient pertinent.

## Principe « profondeur, pas largeur »

Au lieu de 30 cartes visibles:
Accueil -> intention -> carte utile -> action.

Exemple:
« J'ai vu une vidéo bizarre »
-> Aide
-> Signaler
-> France / Maroc / plateforme
-> formulaire officiel.

Exemple:
« Je vais à Taza »
-> Voyager
-> trajet + coût + ferry + météo + prières + bonnes adresses utiles sur le trajet.

## Grappe « Bonnes adresses »

Ne pas lancer un annuaire massif.

V0:
- quelques catégories ;
- quelques établissements vérifiés ;
- gratuit pour présence basique ;
- visibilité professionnelle payante = hypothèse commerciale à tester ;
- aucun prix de 20–30 €/mois considéré comme acquis.

## Anti-usine-à-gaz

Ne pas ajouter maintenant:
- réseau social ;
- messagerie communautaire générale ;
- collecte interne de signalements ;
- stockage permanent de preuves ;
- marketplace généraliste ;
- réservation multi-services propriétaire.

## Différenciation à tester

### « Action Cards »
Chaque information RME devrait pouvoir se terminer par une action unique :
- Appeler
- Itinéraire
- Signaler
- Ouvrir le site officiel
- Comparer
- Enregistrer
- Partager

### « Mode trajet »
Pendant un trajet, masquer les rubriques non pertinentes et ne conserver que:
- prochaine étape ;
- état du trajet ;
- sécurité ;
- pauses/services ;
- météo ;
- prière ;
- aide.

### « Mode Maroc »
À l'arrivée, faire évoluer automatiquement les raccourcis vers:
- bonnes adresses ;
- services ;
- actualités ;
- sport ;
- culture ;
- argent ;
- aide.

Ceci est une hypothèse UX, à prototyper avant généralisation.

## Recommandation

Ne pas ajouter une nouvelle couche fonctionnelle lourde au main maintenant.

Créer d'abord un prototype visuel/lab de la nouvelle hiérarchie:
> INTENTION -> 5 PORTES -> ACTION

Puis comparer le prototype à l'accueil actuel sur mobile.

## Sources benchmark
- Japan Travel by NAVITIME: https://static.japan.travel.navitime.com/app-lp/en/index.html
- JNTO: https://www.japan.travel/
- Wanderlog: https://wanderlog.com/plan-a-trip
- Airbnb 2026: https://news.airbnb.com/airbnb-2026-fall-update

## Classification
- Faits externes: benchmark de fonctionnalités ci-dessus.
- Observation directe: accueil RME actuel très riche.
- Hypothèse: hiérarchie « 5 portes ».
- Hypothèse: Action Cards comme primitive UX.
- Hypothèse commerciale: visibilité professionnelle payante.
- Décision: aucune modification production issue de cet audit sans prototype/validation.
