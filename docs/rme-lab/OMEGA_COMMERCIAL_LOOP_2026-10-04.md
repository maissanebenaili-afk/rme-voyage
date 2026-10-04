# OMEGA COMMERCIAL LOOP — 4 octobre 2026

Légende : **MESURÉ** · **CONFIRMÉ (dépôt)** · **SOURCE OFFICIELLE** · **HYPOTHÈSE** · **INCONNU**.

## A. Corrections effectuées (branches, rien sur `main`)
| PR | Problème | Correction |
|---|---|---|
| **#223** | 🐞 Une demande sur la page d'un bien immobilier à Taza partait vers le WhatsApp de **Marwa** (caftans) au lieu de **HiDOUR Immobilier** | La page utilise le contact du bien |
| #223 | Le commerçant ne pouvait pas savoir quelles demandes venaient de RME | Chaque message pré-rempli finit par « (vu sur RME Voyage) » |
| #223 | Les boutons WhatsApp des caftans n'étaient pas comptés (oubli de #220) | Comptés |
| #223 | On ignorait d'où venaient les visites | `page_view` porte la provenance : page RME précédente, site d'origine seul, ou `direct` |
| #223 | Aucun moyen de lire les mesures par partenaire | `scripts/partner-funnel.mjs` (export des journaux → tableau) |
| **#222** | Bulletin expiré : les 57 pages `/trajet` affichaient le gazole français à **1,40 €/L** au lieu de 2,383 € (Paris → Tanger : 176 € au lieu d'environ 265 €), avec une note fausse | Le dernier bulletin reste affiché 14 jours de plus, marqué « périmé », puis l'hypothèse, clairement annoncée |

## B. Tests
- Chaque correction a un test qui **échoue sur l'ancien code** (vérifié).
- #223 : 100 suites et 796 tests OK.
- #222 : 99 suites et 789 tests OK.
- tsc et eslint OK.

## C. Ce que RME peut mesurer
| Étape | Statut |
|---|---|
| Visite d'une page (adresse) | **MESURABLE** (`page_view`) |
| Provenance de la visite | **MESURABLE** après #223 |
| Vue de la page du partenaire | **MESURABLE** (adresse de la page) |
| Vue du partenaire dans un encart de l'accueil | **POSSIBLE À MESURER** (non fait : pas prioritaire) |
| Clic WhatsApp, appel ou site | **MESURABLE** après #220 / #223 |
| Message réellement envoyé | **IMPOSSIBLE SANS LE PARTENAIRE**. Rendu **comptable** par la signature « (vu sur RME Voyage) » : le partenaire les compte dans WhatsApp |
| Devis, client, vente | **IMPOSSIBLE SANS LE PARTENAIRE** |
| Personnes distinctes | **NON MESURABLE** (aucun identifiant, par choix). On compte des événements |

⚠️ **Découverte bloquante.** `netlify.toml` indique l'offre gratuite de Netlify. Les journaux de fonctions n'y sont gardés qu'**environ 24 heures** (documentation Netlify, SOURCE OFFICIELLE). Toutes les mesures RME disparaissent donc chaque jour si personne ne les exporte. Pour conserver une preuve, deux solutions : un export manuel quotidien (gratuit, pénible) ou un stockage (décision d'infrastructure de Tarek).

## D. Meilleur partenaire à tester
| Partenaire | Valeur d'une demande | Proximité MRE | Fréquence | Facilité de validation | Rang |
|---|---|---|---|---|---|
| **HiDOUR Immobilier (Taza)** | Biens affichés de 900 000 à 2 500 000 DH à la vente, et de 2 800 à 8 000 DH/mois à la location (CONFIRMÉ dans le dépôt ; réalité des annonces INCONNUE) | Très forte : numéro français, investissement dans la ville d'origine | Faible | Un seul interlocuteur | **1** |
| Marwa Caftan / Afarah Nassim (même entreprise) | INCONNUE : les prix sont « sur demande », ceux de `lib/caftans.ts` ne sont pas publiés comme vérifiés | Moyenne (fêtes en France) | Plus forte | Facile, une conversation pour deux activités | 2 |
| Belisamae (bien-être) | INCONNUE | Faible (hors voyage MRE) | — | — | 3 |

**Pourquoi HiDOUR.** Une seule vente pèse plus que des centaines de commissions de ferry. Un vrai bug lui faisait perdre les demandes venues de RME, et il est corrigé. Il a besoin de très peu de demandes pour juger.
Réserve : la réglementation de l'intermédiation immobilière au Maroc est INCONNUE (à vérifier avant toute commission sur vente).

## E. Première expérience commerciale (sans paiement ni contrat)
**Prérequis :** #220 et #223 en ligne, puis 2 à 4 semaines de mesures exportées.

**Message proposé (Tarek → HiDOUR), à adapter :**
> « Bonjour Aziz, depuis le [date], les demandes qui vous arrivent par RME Voyage se terminent par "(vu sur RME Voyage)". Sur [période], la page de vos biens a été vue [X] fois et [Y] personnes ont cliqué pour vous écrire. Combien de ces messages étaient de vrais acheteurs ou locataires ? Si RME vous apportait ce volume chaque mois, qu'est-ce qui vous paraîtrait juste : rien, un montant par demande sérieuse, un forfait mensuel, ou une part sur une vente conclue ? »

Ce test répond à trois questions :
- les demandes sont-elles **sérieuses** ? Seul le partenaire le sait ;
- quel **modèle** il préfère ;
- **son** prix, au lieu d'un prix inventé par nous.

| Modèle | Qui paie / quand | Risque |
|---|---|---|
| Par demande qualifiée | Le partenaire, chaque mois, sur sa propre déclaration | Il faut sa confiance (la signature aide) |
| Forfait visibilité | Le partenaire, à l'avance | Difficile à justifier sans trafic |
| Part sur vente | À la vente | Long ; réglementation INCONNUE |
| Commission marketplace caftans (10 %, déjà affichée) | Voir H | Voir H |

## F. Ce qui reste inconnu
- Le trafic réel.
- Le taux de clic des pages partenaires.
- La part de demandes sérieuses.
- Le prix acceptable pour un commerçant.
- La réalité des annonces immobilières et caftans.
- L'offre Netlify exacte.

**Trafic minimal pour une première preuve (HYPOTHÈSES de taux de clic : 2 %, 5 %, 10 %).** Pour obtenir 5 clics de contact par mois chez un partenaire, il faut environ **250, 100 ou 50 vues de sa page par mois**. En dessous de 5, aucune conversation commerciale n'est crédible.

## G. 5 décisions RME à fort potentiel
| Décision | Valeur | Fréquence | Confiance des données | Commercial | État |
|---|---|---|---|---|---|
| Où faire le plein | Moyenne (environ 23 € pour 50 L) | Chaque trajet | Officielle (UE) | Aucun | **Fait** (#221, #222) |
| Voiture ou avion, bagages compris | Forte | Une fois par voyage | Mesurée | Vols / ferry | **Fait** (#221) |
| Quel port pour traverser (Algésiras, Tarifa, Almería) | Forte | Chaque traversée | Distances oui, prix ferry INCONNUS | Ferry | Preuve insuffisante : pas fait |
| Quand partir (pics Bison Futé et ports) | Forte | Chaque été | Officielle + déduite | Ferry | Laboratoire #218 (5/10) : pas fait |
| Premier envoi d'argent ou envoi habituel | Moyenne | Mensuelle | Mesurée, **droits d'usage absents** | CPA unique | Bloqué |

## H. Nouvelle découverte : un flux déjà présent
`components/caftan/CaftanMarketplace.tsx` annonce publiquement : « **la plateforme retient 10 %** sur la location », avec mise en relation, vérification, **suivi de la caution** et médiation (`lib/caftans.ts`, `COMMISSION.pct = 10`).
- Qui est « la plateforme », RME ou Marwa ? **INCONNU**.
- Qui touche les 10 % ? **INCONNU**.
- « Suivi de la caution » : promettre de gérer l'argent de tiers pourrait poser une question réglementaire (**HYPOTHÈSE**, à vérifier).

C'est le seul endroit du dépôt où une **commission de RME** est déjà publiée. Il faut le clarifier avant tout le reste : c'est à la fois une source de revenu et un engagement public.

## I. Décision
**GO SOUS CONDITIONS — boucle commerciale avec HiDOUR.**
1. Fusionner #220 et #223 (bon destinataire, signature RME, comptage).
2. Conserver les mesures plus de 24 heures (export quotidien ou stockage).
3. Après 2 à 4 semaines, envoyer le message E avec les chiffres réels.

**Onglets et blocs dépliants : pas maintenant.** Aucune donnée d'usage par section n'existe aujourd'hui, et les journaux disparaissent en 24 heures. On décidera de l'interface avec ces mesures, pas à l'intuition.

## Le prochain euro que RME peut réalistement chercher
**Une rémunération de HiDOUR Immobilier pour des demandes d'acheteurs ou de locataires MRE que RME peut désormais prouver.** Pas encore d'abonnement : d'abord la question « ces demandes étaient-elles sérieuses, et combien valent-elles pour vous ? », posée avec des chiffres réels.
