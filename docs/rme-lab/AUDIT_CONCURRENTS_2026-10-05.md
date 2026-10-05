# Audit des meilleurs concurrents — 5 octobre 2026

Méthode : pages publiques lues avec un vrai navigateur (Chromium), aucun compte créé, aucun contact. Ce qui n'a pas été vérifié est marqué HYPOTHÈSE.

## 1. Ce qu'ils font

| Concurrent | Ce qui est réel (lu sur leur page) | Faiblesse constatée |
|---|---|---|
| **Tariq** (Google Play) | Budget total du trajet (ferry + nuits + carburant + péages). Files d'attente des ferries remontées par la communauté (Algésiras, Tanger Med). Hôtels « adaptés MRE » (parking sûr, chambres familiales, halal à côté). Prix officiels du carburant France et Espagne, bornes électriques. Numéros d'urgence et douane hors ligne. Convoi. Gratuit, sans pub, sans compte. | « 1+ téléchargement » au 5/10 : presque personne ne l'utilise. Les sources des péages et ferry ne sont pas affichées. |
| **Trekna** (site) | Recherche de vols (prix Amadeus). Attente au détroit en direct avec météo et vent. Comparaison des modes de transport avec un prix par personne. Calculateur (transport, logement, activités, CO₂). Alertes de la communauté (faux policiers sur l'A7, attente de plus de 3 h à Tanger Med, aire de repos sûre). | Les prix par mode (189 €, 320 €, 240 €, 290 €) n'ont pas de source. Il affirme que « voiture + ferry inclut péages » sans donner le détail. Il cite « FRS Iberia » (HYPOTHÈSE : nom ou ligne peut-être plus à jour). « GNV, Grimaldi » est présenté comme générique. |
| **Blog SEO** morocco-road-trip.onrender.com | Il donne des fourchettes : péages France 80–100 €, ferry 85–110 €. | Aucune source. C'est exactement le type de chiffre que RME a retiré. |
| **Marhaba 2026** (officiel, Fondation Mohammed V) | Du 10 juin au 15 septembre, environ 3,6 millions de MRE, 26 espaces d'accueil. | Pas d'application officielle trouvée : c'est une place libre. |

## 2. Où RME est déjà plus fort (démontré par les tests)

- Chaque chiffre a une source (douane ADII, zakat sur le prix de l'or, SIM, jours fériés), et aucun prix n'est inventé. Les tests empêchent le retour des faux chiffres.
- Pour les péages, RME dit « à ajouter » au lieu d'inventer un montant (#249), là où Trekna et le blog affichent des montants sans source.
- Hadak répond dans 4 langues et renvoie vers le site officiel du sujet quand il ne sait pas (#248).

## 3. À reprendre en mieux (par ordre de valeur)

1. **Attente aux ports, mais sourcée.** Tariq et Trekna montrent une attente « en direct ». RME doit afficher l'attente seulement avec sa source et l'heure (Tanger Med ou l'opérateur portuaire), et sinon écrire « inconnu ». L'heure du relevé doit toujours être visible. Une donnée de port sans source officielle reste une HYPOTHÈSE : à vérifier avant de coder.
2. **Étape hôtel sur la route.** RME dispose déjà du partenaire hôtels Travelpayouts (code présent, partenaire non approuvé). Il faut proposer une nuit à mi-chemin (Bordeaux, Madrid, Algésiras) avec les critères MRE de Tariq : parking, chambre familiale. C'est utile au voyageur, et une commission devient possible seulement après approbation du partenaire et activation du lien.
3. **Péages avec source.** Il faut les tarifs officiels des sociétés d'autoroute (France : sites des concessionnaires ; Espagne : la plupart des grands axes sont gratuits depuis 2020-2021, HYPOTHÈSE à vérifier tronçon par tronçon). C'est la pièce qui manque au « budget total ». Ne pas reprendre les montants du blog.
4. **Alertes de la communauté** (faux policiers, aires sûres) : utile, mais demande de la modération. On l'écarte tant qu'il n'y a pas d'utilisateurs, à cause du risque de fausses alertes.
5. **Comparaison des modes de transport** : seulement avec des prix réels (le lien vols est actif) et la mention « prix au moment de la recherche ». Pas de prix fixes comme Trekna.

## 4. Ce qu'on ne copie pas

- Les prix par personne sans source (Trekna).
- Les fourchettes péages et ferry sans source (blog).
- Le « en direct » quand on ne connaît pas la source.

## 5. Décision

Aucune nouvelle PR maintenant (consigne : production d'abord). Les idées 1 et 3 se font chacune avec une source vérifiée et un test, après la mise en production. L'idée 2 attend l'approbation du partenaire hôtels.
