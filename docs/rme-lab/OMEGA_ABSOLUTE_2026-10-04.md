# OMEGA ABSOLUTE — 4 octobre 2026

Légende : **MESURÉ** · **SOURCE OFFICIELLE** · **SOURCE SECONDAIRE** · **HYPOTHÈSE** · **INCONNU**.

## 1. Ce que nous pensions savoir
- RME est une application de voyage qui compare.
- Money Flow pouvait devenir un produit.
- L'argent viendrait de l'affiliation.

## 2. Ce qui était faux
| Croyance | Réalité | Preuve |
|---|---|---|
| Le comparateur d'argent classe les prestataires | Il classait des **frais inventés** : 🥇 Wise à 5 519 MAD, alors que le vrai montant était 5 431 MAD (4e) | MESURÉ, production + API Wise |
| Le taux Remitly à 11,08 est une promotion (mon rapport d'hier) | C'est son prix **normal**. La promotion est à 11,21, sur les 500 premiers euros | MESURÉ, API Remitly |
| « Promo ≠ prix normal » est l'atout de RME | IdealRemit l'a publié le 15/09/2026, avec 13 486 relevés | SOURCE SECONDAIRE (Hespress) |
| Le bouton ferry rapporte | Il envoie vers directferries.fr **sans lien partenaire** : 0 € | MESURÉ (`/api/affiliates`) |
| Les fêtes et mariages sont un marché libre | Déjà occupé : Mariage-Marocain.com, Afrah (Île-de-France), mariages.net | SOURCE SECONDAIRE |

## 3. Ce que j'ai découvert
**Le vrai produit n'est pas le comparateur, c'est la décision.** J'ai trouvé quatre fois le même défaut : RME possède la donnée, mais ne prend pas la décision à la place de l'utilisateur.
1. Carburant : la France est à 2,383 €/L, l'Espagne à 1,918 €/L (**−20 %**, bulletin UE). RME affichait le tableau sans dire « fais le plein en Espagne ». Corrigé : **PR #221**.
2. Avion : pour une famille de 4, le tarif affiché est de 1 349 € **sans valise**, et de 1 885 € avec une valise chacun (**+40 %**, MESURÉ sur Kiwi, août 2027). RME demandait le « prix avion » sans préciser. Corrigé : **PR #221**.
3. Argent : RME décernait une médaille à partir d'estimations. Corrigé : **PR #219** (plus de podium sur des estimations).
4. Partenaires : RME envoie des demandes de devis à de vrais commerces (traiteur, caftans, immobilier, bien-être), mais **ne les comptait pas**. Corrigé : **PR #220**. C'était la donnée qui manquait pour leur faire payer quoi que ce soit.

Autre constat : le bulletin carburant du 21/09 expire le 05/10. Le bulletin du 28/09 attend dans la **PR #201**, qui n'est pas fusionnée.

## 4. Les 10 opportunités (après red team)
| # | Opportunité | Premier euro | Statut |
|---|---|---|---|
| 1 | Faire payer les commerces partenaires déjà présents (forfait ou prix par demande) | **Le plus rapide** : relation existante, aucune approbation de tiers | Demandes comptées dès #220 ; volume INCONNU |
| 2 | Affiliation ferry (Direct Ferries Connect) | Rapide si accepté | Code prêt ; compte INCONNU |
| 3 | Vols (Travelpayouts, **déjà actif**) | Peut-être déjà gagné | Revenu INCONNU (tableau de bord de Tarek) |
| 4 | Moteur de décision « voiture ou avion » avec bagages | Indirect (pousse vers ferry ou vols) | Moteur existant, amélioré dans #221 |
| 5 | Conseil carburant pays par pays | 0 € direct ; crée de la confiance | Fait dans #221 |
| 6 | eSIM (Airalo, 10 %) | Petit | Programme confirmé ; compte INCONNU |
| 7 | Annuaire de prestataires de fêtes MRE | Moyen | Marché occupé : avantage faible |
| 8 | Décision argent ponctuelle (« avant de partir ») | Faible, une seule fois | NO-GO comme produit autonome |
| 9 | Widget B2B (`/pro`, « en préparation ») | Lent | Aucune demande mesurée |
| 10 | Données agrégées sur les trajets MRE (B2B) | Lent | Seulement après du trafic |

## 5. Celle qui surclasse les autres
**#1, les partenaires déjà présents.** La piste #2 (ferry) reste le moteur de revenu.
Pourquoi #1 : RME a déjà les relations, les pages et le trafic qui y mène. Il manquait seulement la preuve des demandes envoyées. Pas besoin d'un programme d'affiliation ni de la SAS : un accord simple avec un commerce existant suffit.

## 6. La preuve obtenue
- Mesures réelles : devis d'argent, prix des vols avec et sans bagages, prix carburant officiels, état de production (ferry non rémunéré, médaille sur estimations).
- 3 corrections testées (#219, #220, #221). Chacune a un test qui **échoue sur l'ancien code**.
- Ma propre idée d'hier (Money Flow comme atout) a été falsifiée.

## 7. Ce qui reste à prouver
- Le **trafic** réel de RME. C'est l'inconnue n°1 : toutes les pistes en dépendent.
- Le nombre de demandes envoyées aux partenaires (après fusion de #220).
- Le revenu actuel de Travelpayouts.
- Le taux de commission ferry réel pour RME.

## 8. Comment générer le premier euro
1. Fusionner #220 (décision de Tarek). Compter les demandes pendant 2 à 4 semaines.
2. Montrer ce chiffre à Marwa / Afarah Nassim et proposer un prix par demande ou un petit forfait (décision commerciale de Tarek).
3. En parallèle : ouvrir le compte Direct Ferries Connect pour la saison avril-août 2027.

## 9. Ce qui pourrait devenir le moat
Personne ne relie en un seul endroit : trajet réel pays par pays, prix officiels datés, calendrier Bison Futé et opération Marhaba, choix du port, bagages, argent, et les **demandes mesurées vers des commerces MRE**. Pris séparément, chaque élément se copie. Les **décisions honnêtes** qui en sortent (UNKNOWN plutôt que faux), et l'historique des demandes, ne se copient pas.
Si RME n'obtient pas de trafic, ce moat n'existe pas.

## 10. Recommandation
Faire relire et fusionner, dans cet ordre : #201 (carburant, urgent avant le 05/10), #219, #221, #220. Puis mesurer le trafic et les demandes pendant 4 semaines, avant de construire quoi que ce soit de nouveau.
