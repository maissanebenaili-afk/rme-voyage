# OMEGA — Preuve commerciale et audit de vérité (4 octobre 2026)

Légende : **MESURÉ** · **CONFIRMÉ (dépôt / production)** · **SOURCE OFFICIELLE** · **HYPOTHÈSE** · **INCONNU**.

## 1. Ce que j'ai découvert

### Illusions de valeur : RME croit créer de la valeur, mais elle se perd
| # | Illusion | Preuve | État |
|---|---|---|---|
| 1 | Les demandes d'achat ou de location des biens de Taza (page détail) partaient vers le WhatsApp de **Marwa** (caftans) | Code : `MARWA_WHATSAPP` au lieu de `property.contact_whatsapp` | **Corrigé** #223 |
| 2 | Comparateur de transferts : 🥇 attribué sur la base de frais **inventés** | MESURÉ : Wise affiché 5 519 MAD, réel 5 431 MAD (4e) | **Corrigé** #219 |
| 3 | Convertisseur de devises : taux **écrits en dur**, faux de 3 à 9 %, sur la même page qu'un taux du jour différent | MESURÉ : MAD 10,8 contre 11,18 ; CAD 1,47 contre 1,60 | **Corrigé** #224 |
| 4 | Bouton « Comparer les ferries » : RME envoie du trafic à Direct Ferries **gratuitement** | Production : `configured:false` | À activer (compte partenaire) |
| 5 | Bulletin carburant expiré : les 57 pages trajet affichaient la France à 1,40 €/L au lieu de 2,383 € | Code + test | **Corrigé** #222 (+ #201 à fusionner) |
| 6 | Mesures « enregistrées » dans des journaux qui **disparaissent en environ 24 h** | `netlify.toml` : offre gratuite ; documentation Netlify | **Bloquant** (voir 6) |
| 7 | Les fonctions « communauté » et « voyages » (Supabase) ne sont **pas branchées** en production | MESURÉ : `/api/tips` répond « storage is not configured », `/api/trips` répond 503 | Signalé |
| 8 | « La plateforme retient 10 % » sur la location de caftans, et le message dit « déposer mon caftan **sur RME Voyage** » | Code : `lib/caftans.ts`, `CaftanMarketplace.tsx` | **Ambigu + risque** (voir 4) |

Contre-exemple honnête : la newsletter **refuse** l'inscription quand rien n'est configuré, et le dit. Ce n'est pas une illusion.

### Angles morts : de la valeur créée sans être mesurée
| Usage silencieux | Pourquoi il compte | État |
|---|---|---|
| Recherche de **garage, consulat, halal, aire de repos, station** sur la route | C'est de la demande réelle et parfois urgente, exactement ce qu'un partenaire d'assistance paierait | **Mesuré désormais** (#224, catégorie seulement, jamais le lieu) |
| Clics de contact vers les commerces | Base de toute facturation | **Mesuré** (#220, #223) |
| Provenance des visites | Savoir ce qui amène les visiteurs (Google, Instagram, pages trajet) | **Mesuré** (#223) |
| Conseil « où faire le plein », coût réel avion avec bagages | Utilité directe pour le voyageur | Non mesuré. Volontairement : aucune valeur commerciale directe |

## 2. Ce que j'ai corrigé (branches, rien sur `main`)
| PR | Contenu |
|---|---|
| #219 | Plus de podium construit sur des estimations |
| #220 → #223 | Comptage des contacts partenaires · bon destinataire immobilier · signature « (vu sur RME Voyage) » · provenance des visites · rapport par partenaire |
| #221 → #222 | Conseil carburant · prix d'avion valises comprises · bulletin périmé affiché et daté au lieu d'une hypothèse |
| **#224** | Convertisseur au taux du jour daté · comptage des recherches de services |

## 3. Ce que j'ai mesuré
- **Simulation de fusion de #201 et de #219 à #224 ensemble : aucun conflit.** tsc OK, **104 suites, 812 tests OK**.
- Chaque correction a un test qui échoue sur l'ancien code et passe sur le nouveau.
- Il n'y a pas de doublon de code. #223 contient #220 ; #222 contient #221.
- Ordre de fusion proposé : **#201 → #222 (avec #221) → #219 → #223 (avec #220) → #224.**

## 4. Les 10 % caftans
- **Texte exact** : « Vous touchez votre prix, la plateforme retient 10 % sur la location ». Ce que couvre la commission : mise en relation, vérification, **suivi de la caution**, médiation.
- **Qui l'exploite ?** Le message pré-rempli dit « déposer mon caftan sur RME Voyage », et Marwa valide. La « plateforme » est donc présentée comme **RME**.
- **Qui encaisse ?** Aucun texte ne le dit. Qui garde la caution ? Pas dit non plus.
- **Ailleurs dans le dépôt** : aucune autre mention. Ni contrat, ni conditions générales, ni compte de paiement.
- **Classement** : **D (ambigu) + E (risque)**. Pas A : aucun revenu RME n'est prouvé.
- **Risques, à vérifier par Tarek (HYPOTHÈSES)** :
  - obligations d'une plateforme en ligne : information sur les frais, conditions générales ;
  - déclaration des revenus des vendeurs à l'administration fiscale (DAC7) si RME est l'opérateur ;
  - garde d'une caution pour le compte de tiers.
- **Rien n'a été modifié.**

## 5. Immobilier : le vrai déroulé, pas un portail
Un MRE en France qui regarde un bien à Taza :
1. Il découvre le bien (page RME) → **intérêt**.
2. Il écrit depuis la France → **demande** (désormais identifiable grâce à la signature).
3. **Il ne peut visiter que pendant son séjour au Maroc.** C'est l'information que seul RME connaît : quand il voyage, et vers quelle ville.
4. Visite → négociation → notaire. Les risques propres au MRE (titre foncier, financement depuis l'étranger) sont **INCONNUS** ici et à vérifier avec un professionnel.

**Événement de valeur propre à RME : « visite programmée pendant votre séjour du … au … ».** Il relie voyage et immobilier. Aucun portail immobilier ne connaît les dates de voyage.

## 6. Deuxième et troisième flux
- **Deuxième (ponctuel, urgent)** : les recherches de **garage** sur la route (#224) vers un partenaire de dépannage ou d'assistance. Demande désormais mesurée, offre INCONNUE.
- **Troisième (récurrent)** : la **gestion locative** des biens des MRE pendant leur absence. HiDOUR propose déjà de la location et du meublé (CONFIRMÉ dans le dépôt). Un propriétaire MRE paierait chaque mois, pas une seule fois. **HYPOTHÈSE**, à demander à HiDOUR dans le même message.

## 7. Conserver les mesures : comparaison sans rien créer
| Option | Coût | Nouveau compte | Nouvelle dépendance | Durable |
|---|---|---|---|---|
| A. Export manuel quotidien des journaux | 0 €, environ 5 minutes par jour | Non | Non | Oui, si fait chaque jour |
| B. Netlify Blobs (stockage inclus dans Netlify) | 0 € (quotas gratuits INCONNUS ; pas d'incrément atomique) | **Non** | 1 (`@netlify/blobs`) | Oui |
| C. Supabase (déjà prévu dans le code, **non branché**) | 0 € (offre gratuite) | **Oui** + clés | Non | Oui |
| D. Netlify Pro | Payant | Non | Non | **Non** (7 jours seulement) |

~~Recommandation : B~~ **Retirée le même jour** après lecture de la documentation officielle : Netlify Blobs n'a pas d'incrément atomique (« last write wins »), et ses quotas gratuits ne sont pas documentés. Voir `OMEGA_TRUTH_ENGINE_2026-10-04.md` §5. **En attendant : A.** Le choix revient à Tarek.

## 8. Ce que nous pouvons maintenant prouver
- RME connaissait des données justes, mais affichait des **décisions fausses** à 5 endroits. Ces endroits sont corrigés et testés.
- Une fois #223 en ligne, chaque contact vers un partenaire est **compté** et **identifiable chez lui**.

## 9. Ce que nous ne pouvons toujours pas prouver
- Le trafic réel.
- Le nombre de demandes sérieuses.
- Une seule vente.
- Un seul euro.
- Le bénéficiaire des 10 %.

## 10. Brevet : avis franc
L'idée la plus originale du projet est la règle « **vérité des données** » : chaque prix porte sa source, sa date et un statut (frais, périmé, hypothèse). Il n'y a jamais de mélange, et une décision est refusée si la donnée ne la permet pas.

C'est une **méthode logicielle** et une bonne pratique. En Europe, un logiciel « en tant que tel » n'est pas brevetable sans effet technique, et la nouveauté de cette règle est faible. **Un brevet coûterait cher pour une protection improbable. Je ne le recommande pas.**

Moins cher et utile : **dater la création** (enveloppe Soleau à l'INPI, quelques dizaines d'euros, à vérifier) et protéger **la marque**. Ce sont des décisions de Tarek, rien n'a été fait.

## Décision
**GO SOUS CONDITIONS : premier test commercial avec HiDOUR Immobilier.**
- Le meilleur candidat reste HiDOUR :
  - une demande a la plus forte valeur ;
  - c'est le seul partenaire où RME apporte une information exclusive (les dates de séjour) ;
  - un besoin récurrent est possible (gestion locative) ;
  - et le bug qui lui faisait perdre ses demandes est corrigé.
- Les caftans passent en second : le modèle des 10 % doit d'abord être clarifié.

**Prochain test le plus informatif.** Mettre #223 en ligne et exporter les journaux chaque jour (option A) pendant 2 à 4 semaines. Puis envoyer à HiDOUR le message prévu (dossier COMMERCIAL_LOOP) avec trois questions :
1. Combien de demandes « (vu sur RME Voyage) » avez-vous reçues ?
2. Combien étaient sérieuses ?
3. Que vaudrait pour vous une demande sérieuse, et une gestion locative pendant l'absence du propriétaire ?

**Action unique de Tarek** : fusionner dans l'ordre proposé, à commencer par **#201 avant le 5 octobre**.
