# OMEGA MAX — Où est l'argent dans le flux France ↔ Maroc (4 octobre 2026)

Branche de laboratoire `claude/lab-money-hunt`. Aucune PR, `main` non modifié, rien dépensé.
Légende : **MESURÉ** (fait aujourd'hui) · **CONFIRMÉ** (source officielle) · **À VÉRIFIER** (source secondaire) · **HYPOTHÈSE** · **UNKNOWN**.

## Qu'avons-nous découvert que nous ne savions pas avant ?

1. **RME envoie déjà ses visiteurs chez Direct Ferries, gratuitement.** Le bouton « Comparer les ferries » (`components/BookingCards.tsx:119`) pointe vers `directferries.fr` sans lien partenaire (clic enregistré sous le nom `direct_ferries_public`). En production, `/api/affiliates?type=ferry` répond `configured:false` (**MESURÉ**). Le code d'activation existe déjà et il est testé (`lib/affiliate.ts`, `__tests__/affiliate.test.ts`) : il ne manque qu'un lien partenaire approuvé.
2. **Ce lien peut être rejeté sans que personne ne le voie.** RME n'accepte que `www.directferries.fr`, `www.directferries.com`, `directferries.com` (et `tp.media`). Le domaine du lien que fournira Direct Ferries Connect est UNKNOWN. S'il est différent, le bouton reste non rémunéré, sans aucune erreur visible (**MESURÉ** par test).
3. **Je corrige mon rapport d'hier.** Le taux Remitly à 11,08 **n'est pas** une promotion. Le calculateur de Remitly sépare lui-même son prix normal (`base_rate` 11,08) de sa promotion (`promotional_exchange_rate` 11,21, limitée aux 500 premiers euros d'un nouveau client) (**MESURÉ**, API publique Remitly). Remitly est donc aussi le meilleur pour un client habituel, ce 4 octobre.
4. **L'idée « promo du premier envoi ≠ prix normal » n'appartient pas à RME.** IdealRemit, un comparateur spécialisé Maroc, l'a publiée le 15/09/2026 : 10 opérateurs, 13 486 relevés, un relevé toutes les 2 heures (Hespress). Ma propre idée est falsifiée en tant qu'avantage différenciant.
5. **Le comparateur de référence lui-même mélange les publics.** Les données de Wise ne disent ni « promotion » ni « réservé aux clients de la banque » (aucun champ pour cela). BNP (0 €) n'est valable que pour un client BNP (**HYPOTHÈSE** logique : c'est un tarif de banque).

## 1. Le comparateur RME (preuve)

| Élément | Où | Nature |
|---|---|---|
| Frais (3,89 € Wise…) et marges | `app/api/remittance/route.ts`, tableau `PROVIDERS` | **inventés**, codés en dur |
| Taux de référence | fawazahmed0/currency-api | réel, sans garantie |
| Montant reçu, classement | `(montant − frais) × taux × (1 − marge)`, puis tri | **déduit de valeurs inventées** |
| Affichage | `components/RemittanceComparator.tsx:130-147` | 🥇 + badge « Meilleur taux » |

À 500 €, l'utilisateur voit en production : **🥇 Wise · Meilleur taux · 5 519 MAD reçus**. En réalité, Wise donne 5 431 MAD et arrive **4e** (Remitly 5 540, BNP 5 515, Western Union 5 445) (**MESURÉ**). Un petit texte dit « estimations », mais la médaille et le badge présentent le résultat comme un fait.

Trois options, sans choix à ta place :
- **A.** Retirer médaille et badge, garder la liste sans classement. 2 lignes. Le problème disparaît, l'utilité aussi.
- **B.** Garder la liste, remplacer le badge par « estimation RME, non vérifiée ». Le classement reste faux.
- **C.** Données autorisées et datées (accord Wise, ou calculateurs officiels de chaque prestataire), avec le modèle du laboratoire. Bloqué tant qu'il n'y a pas d'autorisation.

## 2. Modèle Money Flow (construit en laboratoire)

`lib/lab/moneyFlow/quotes.ts` : chaque devis porte le prestataire, le montant envoyé, les frais, le taux, le montant reçu, le **public** (nouveau client / tout client / client de la banque / UNKNOWN), la **nature du prix** (promotion / normal / UNKNOWN), le plafond de la promotion, les conditions, la date, la source et la **confiance** (API du prestataire / comparateur tiers / estimation / UNKNOWN).

Règle : un devis n'est classé que s'il s'applique vraiment à l'expéditeur. Une promotion « nouveau client » disparaît pour qui a déjà utilisé ce prestataire. Une estimation n'est jamais classée. Un prix dont on ne sait pas s'il est une promotion est écarté, avec la raison.

Test sur 5 expéditeurs réels (`__tests__/moneyHunt.test.ts`, 8 tests OK) :

| Expéditeur | Résultat |
|---|---|
| Premier envoi, 500 € | Remitly 5 605 MAD, marqué « premier envoi seulement » |
| Habitué Remitly, 500 € | Remitly prix normal 5 540 MAD ; promotion écartée |
| Habitué Wise, 500 € | Changer de prestataire rapporte **108,71 MAD par envoi** |
| Premier envoi, 1 000 € | La promotion ne rapporte que **65 MAD** (plafond de 500 €) |
| Pas client BNP | BNP, La Banque Postale, OFX et Western Union écartés, chacun avec sa raison |
| Données de production RME | 0 devis classable : ce ne sont que des estimations |

## 3. Wise : deux questions séparées

| Question | Réponse | Statut |
|---|---|---|
| Programme d'affiliation | Oui, réseau Partnerize | **CONFIRMÉ** (guide Wise) |
| Rémunération | 10 £ par nouveau particulier, 50 £ par entreprise | **CONFIRMÉ** |
| Attribution | Cookie de 12 mois. Pas d'enchères sur la marque Wise. Le client doit d'abord arriver sur le site du partenaire | **CONFIRMÉ** |
| Comparer Wise à ses concurrents | « Contactez notre équipe pour créer une affirmation comparative » | **CONFIRMÉ** (règles partenaires) |
| Utiliser leurs prix et données | « Si vous gérez un site comparateur… contactez-nous pour notre API » | **CONFIRMÉ** |
| Autorisation écrite | **Nécessaire** avant toute comparaison publique | **CONFIRMÉ** |

Être affilié à Wise ne donne pas le droit d'afficher ses prix ni ceux des autres. L'API publique de comparaison utilisée ici n'a pas de conditions d'usage lues : elle sert au laboratoire uniquement.

## 4. Autres acteurs (commissions non inventées)

| Acteur | Programme | Type de revenu | Statut |
|---|---|---|---|
| Remitly | 1,60 $ par premier transfert | une fois | **À VÉRIFIER** |
| WorldRemit | 0,40 £ par inscrit, 24 £ par activation | une fois | **À VÉRIFIER** |
| Western Union, MoneyGram, BNP, Ria, LemFi | — | — | **À CONTACTER** |
| **Direct Ferries** | Programme maison « Connect » : 50 % de la commission versée par les compagnies | **à chaque réservation, chaque année** | **CONFIRMÉ** (page officielle). Taux réel UNKNOWN : 1,6 % à 4 % selon les réseaux (**À VÉRIFIER**) |
| Ferryhopper | 1 % à 3 % selon le réseau | à chaque réservation | **À VÉRIFIER** |
| Airalo (eSIM) | 10 % par vente, cookie 30 jours, plateforme Impact | à chaque voyage | **CONFIRMÉ** (FAQ Airalo) |
| Travelpayouts (vols) | **déjà actif en production** (`aviasales.tp.st`) | à chaque réservation | **MESURÉ** (actif). Revenu : UNKNOWN |

## 5. Économie (hypothèses marquées, rien d'inventé comme fait)

Revenu = utilisateurs × part qui réserve via RME × panier × commission.

**Ferry.** Panier Sète–Tanger avec voiture, 2 personnes et cabine : 600 à 1 200 € (**À VÉRIFIER**). Le panier Algésiras–Tanger Med est UNKNOWN.
- Pessimiste : 2 % réservent × 600 € × 1,6 % = 0,19 € par utilisateur et par an.
- Central : 5 % × 900 € × 2,4 % = 1,08 €.
- Haut : 10 % × 1 200 € × 4 % = 4,80 €.

**Argent.**
- Pessimiste : 1 % × 1,40 € = 0,014 €.
- Central : 3 % × 11,50 € (Wise) = 0,35 €.
- Haut : 5 % × 25 € = 1,25 €.
- **Une seule fois par client.**

| Utilisateurs/an | Ferry pess. | Ferry central | Ferry haut | Argent pess. | Argent central | Argent haut |
|---|---|---|---|---|---|---|
| 100 | 19 € | 108 € | 480 € | 1 € | 35 € | 125 € |
| 1 000 | 192 € | 1 080 € | 4 800 € | 14 € | 345 € | 1 250 € |
| 10 000 | 1 920 € | 10 800 € | 48 000 € | 140 € | 3 450 € | 12 500 € |
| 100 000 | 19 200 € | 108 000 € | 480 000 € | 1 400 € | 34 500 € | 125 000 € |

- Coût d'infrastructure supplémentaire : environ 0 € (le code existe).
- Coût d'acquisition : UNKNOWN.
- Hypothèse la plus fragile : la **part qui réserve via RME**, jamais mesurée.

Valeur pour l'utilisateur côté argent (**MESURÉ**) : 108,71 MAD, soit environ 9,7 €, par envoi de 500 € pour un habitué Wise qui passe chez Remitly. Pour 12 envois par an, environ 117 €. Cette valeur va à l'utilisateur ; RME ne touche rien sur les envois suivants.

## 6. Dix décisions que RME pourrait prendre (source → décision → monétisation)

1. **Billet ferry à date fixe obligatoire en août** (depuis 2025, **À VÉRIFIER**) → « Réserve maintenant, pas au port » → commission ferry.
2. **« Quand partir ? »** (#218, pics Bison Futé et port) + traversée → « Pars le 30, traversée du 31 au matin » → ferry.
3. Réservation en avril-mai annoncée 30 à 50 % moins chère (**À VÉRIFIER**) → alerte au printemps → ferry.
4. Promotion du premier envoi (**MESURÉ**) → « Utilise-la pour le gros envoi d'avant l'été ; ensuite, prix normal » → CPA, une fois.
5. Habitué Wise (**MESURÉ**, +108 MAD) → « Ta famille reçoit 9,7 € de plus par envoi ailleurs » → CPA, une fois.
6. Frais bancaires de La Banque Postale, 37,90 € (**MESURÉ**) → « Sur 100 €, ta famille reçoit 38 % de moins » → CPA.
7. Arrivée au Maroc → eSIM avant le départ → Airalo 10 %.
8. Retrait au distributeur au Maroc : refuser la conversion proposée par l'appareil (**HYPOTHÈSE**, non mesurée) → aucune monétisation, confiance.
9. Vol plutôt que voiture pour 1 ou 2 personnes (`lib/tripEconomics.ts` existe) → vols, déjà actif.
10. Retour Maroc → Europe (garde-fous de #199) → ferry retour, deuxième commission dans l'année.

## 7. Combinaisons : où est l'avantage propre à RME

- **Argent seul** : NO-GO comme produit. IdealRemit, Wise, Hellosafe et wafir.ma y sont déjà, avec plus de données. Revenu unique et faible. Risque réglementaire **(HYPOTHÈSE, à vérifier)** : recommander des services de paiement contre rémunération pourrait exiger une immatriculation ORIAS (intermédiaire en opérations de banque et services de paiement).
- **Voyage + moment + ferry** : c'est le seul endroit où RME sait ce que les comparateurs ne savent pas. Qui part, d'où, en voiture, quand, avec quel risque de pic au port. La décision de réserver le ferry tombe à ce moment-là. Et elle revient chaque année, à l'aller et au retour.
- **Voyage + argent** : utile seulement comme conseil à un moment précis (« avant de partir »), pas comme comparateur.

## 8. Red team

| Attaque | Réponse |
|---|---|
| Direct Ferries refuse RME ou paie peu | Taux réel UNKNOWN. Plan B : Ferryhopper ou compagnies (GNV, FRS déjà prévues dans `lib/affiliate.ts`) |
| Le lien fourni est rejeté par RME sans bruit | **Mesuré : risque réel.** Vérifier le domaine dès réception du lien ; ajout d'un domaine = petite modification de code, sur décision |
| Personne ne réserve via RME | Hypothèse la plus fragile. Moyen le plus rapide de la falsifier : compter les clics `direct_ferries_public` déjà enregistrés dans les journaux Netlify |
| Google ou Direct Ferries captent le client directement | Probable pour qui cherche « ferry Tanger ». RME ne gagne qu'au moment du « quand partir » |
| Un seul marché, une seule saison | Vrai : revenu concentré d'avril à août. Le retour en double l'occasion |
| Copie | Le lien d'affiliation se copie, pas l'audience MRE ni le moment de la décision |
| Données qui disparaissent | Ferry : aucune donnée de prix nécessaire, le partenaire affiche ses prix. Argent : dépend d'API non autorisées |
| Responsabilité en cas d'erreur | Ferry : le prix est affiché par le partenaire. Argent : RME affiche aujourd'hui des montants faux |

## 9. Classement (score sur 100, jugement explicite)

| # | Opportunité | Revenu | Vitesse | Technique | Réglem. | Partenaire | Avantage RME | Fréquence | Capital | Risque | Sans SAS | **Total** |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Activer l'affiliation ferry | 8 | 8 | 10 | 9 | 6 | 8 | 7 | 10 | 7 | 7 | **80** |
| 2 | Mesurer les vols (déjà actifs) | 6 | 9 | 9 | 9 | 9 | 4 | 6 | 10 | 8 | 9 | **79** |
| 3 | eSIM avant le départ (Airalo) | 3 | 7 | 9 | 9 | 7 | 5 | 6 | 10 | 8 | 7 | **71** |
| 4 | Conseil argent « avant de partir » | 3 | 5 | 7 | 4 | 5 | 4 | 3 | 10 | 5 | 6 | **52** |
| 5 | Comparateur d'argent autonome | 4 | 3 | 5 | 4 | 3 | 2 | 4 | 10 | 4 | 6 | **45** |

Les vols sont presque à égalité, mais ils sont déjà branchés : il n'y a rien à débloquer, seulement à mesurer. **Choix : le ferry.**

## 10. Démonstrateur et prochaine expérience

- Démonstrateur : aucun code nouveau n'est nécessaire, l'activation existe et elle est testée. Le test du laboratoire mesure ce qui manque (un lien approuvé) et le piège du domaine.
- Prochaine expérience : compter les clics `direct_ferries_public` d'août-septembre 2026 dans les journaux Netlify. Cela donne en une minute le nombre de visiteurs déjà envoyés gratuitement.
- Limites : aucun taux de commission ferry confirmé pour RME ; part de réservation jamais mesurée ; données d'argent non autorisées à l'affichage.

## Décision

**Ferry : GO SOUS CONDITIONS.**
1. Compte Direct Ferries Connect (ou Ferryhopper) approuvé.
2. Domaine du lien vérifié par rapport aux domaines acceptés par RME.
3. Premier comptage des clics ferry existants.

**Money Flow : NO-GO comme produit autonome.** Gardé comme modèle de laboratoire et comme conseil ponctuel dans le voyage. Le comparateur actuel reste un **NO-GO commercial** tant que l'option A, B ou C n'est pas choisie.

## HUMAIN — ACTION UNIQUE

Tarek : demander un compte partenaire sur Direct Ferries Connect (gratuit, page officielle `directferries.com/affiliate.htm`), puis envoyer le lien obtenu **sans le mettre en ligne**, pour vérification de son domaine.
