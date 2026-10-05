# RME Voyage — rapport d'exécution (4 octobre 2026, soir)

Ordre de bataille : **1. production saine → 2. acquisition → 3. mesure → 4. première monétisation → 5. partenaires → 6. financement → 7. croissance.**
Légende : **MESURÉ** (vu aujourd'hui) · **OFFICIEL** (source de l'autorité) · **SECONDAIRE** (presse, guide) · **HYPOTHÈSE** · **UNKNOWN**.
Règle maintenue : Claude ne fusionne aucune PR et ne publie rien en production (CLAUDE.md). Il prépare jusqu'au dernier clic.

## 1. État réel

| Fait | Statut | Preuve |
|---|---|---|
| La production sert le commit `8295f7f` du **2 octobre à 21 h 43**, publié par l'API (`deploy_source: api`), et non par GitHub | MESURÉ | Netlify, déploiement `6ac0256b…`, `locked: null` |
| `main` a 6 commits d'avance, dont #235, #239 et #240. **Aucun n'a déclenché de construction Netlify** : aucun statut Netlify sur ces commits, alors que chaque PR a sa version de test | MESURÉ | statuts GitHub de `f458dd6` et `8af15ea` |
| `/pitch` affiche encore « 2100 km » ; l'accueil a l'erreur React #418 | MESURÉ | `curl`, navigateur |
| Tests de `main` + PR : 807 réussis, `tsc` et ESLint propres | MESURÉ | Jest |
| Toutes les PR de la liste de fusion se fusionnent sans conflit (#226 réparée ce soir) | MESURÉ | API GitHub `mergeable` |

## 2. Exécuté aujourd'hui (PR prêtes, aucune fusionnée par Claude)

| PR | Effet | Preuve |
|---|---|---|
| #239 ✅ fusionnée par Tarek | Page jury sans fausse affirmation | tests |
| #240 ✅ fusionnée par Tarek | Fin de l'erreur #418 (deux causes) | test qui échoue sur l'ancien code ; navigateur : 0 erreur à +0, +3 et +30 jours |
| #226 | Conflit avec `main` réglé (une ligne) | 807 tests |
| **#241** | Calendrier : Fête de l'Unité (31 octobre) ajoutée, Aïd al-Adha corrigé (27 mai), jamais vide | 6 tests + navigateur ; sources Habous via la presse |
| **#242** | Hadak : « Je suis à Algésiras, que faire ? » ne donne plus l'heure | 3 tests qui échouent sur l'ancien code |
| **#244** | Faux avis d'utilisateurs retirés (« Fatima_Paris », 234 votes, faux conseil de sécurité) | test qui échoue sur l'ancien code |
| **#245** | Widget douane de l'accueil : ne calcule plus de faux droits (cadeaux « 1 000 MAD » au lieu de 20 000 DH, électronique « 20 % », devises « 10 000 EUR ») | 2 tests qui échouent sur l'ancien code |
| **#246** | Zakat : le nisab « 85 g d'or ≈ 50 000 MAD » était faux de moitié (environ 103 000 MAD) ; un montant « à payer » s'affichait sous le seuil | 3 tests qui échouent sur l'ancien code |
| **#247** | SIM : forfaits et tarif d'itinérance inventés retirés (widget + Hadak en 4 langues) ; pièce d'identité obligatoire depuis 2014 (sourcé) | 5 tests qui échouent sur l'ancien code |
| **#243** | **Mesure durable** : chaque clic partenaire gardé dans une table en écriture seule | 6 tests ; SQL exécuté sur PostgreSQL 16 (7 cas) |

## 3. Mesure (étape 3)

- **Existant (MESURÉ)** : 10 événements anonymes. Les plus utiles : `page_view`, `route_computed` et `partner_click` (avec `partner`, `product`, `placement`, `prefilled`).
- **Manque (MESURÉ)** : ces lignes vivent environ 1 jour dans les journaux Netlify. **Aucune preuve de clic au-delà.** La #243 corrige ce point dès que Tarek a créé la table (15 min).
- **Entonnoir mesurable après #243** : VISITE (`page_view`) → INTENTION (`route_computed`) → CLIC (`partner_click`). La suite (CONTACT, VENTE, COMMISSION) se lit seulement dans le tableau de bord de chaque partenaire.

## 4. Monétisation (étape 4)

| Flux | État | Classe | Prochaine action |
|---|---|---|---|
| **Vols (Travelpayouts / Aviasales)** | **LIEN ACTIF en production** (`TRAVELPAYOUTS_FLIGHT_URL`). Bouton « Comparer les vols » après un itinéraire + carte comparateur ; clic compté | **A** | (1) Vérifier dans Travelpayouts que le programme est approuvé et lire clics et réservations. (2) Poser `TRAVELPAYOUTS_FLIGHT_DEEPLINK_TEMPLATE` pour ouvrir Aviasales **sur le trajet déjà rempli** au lieu de la page d'accueil (voir FOUNDER ACTIONS) |
| eSIM (Airalo, Yesim) + activités (KKday, Klook) | Liens remis à Tarek ; **#207 prête** (fusion propre) ; variables non posées | **A** | Fusionner #207, poser 4 variables |
| Ferry | Aucun lien affilié configuré (`/api/affiliates?type=ferry` → `configured: false`) ; Direct Ferries et AFerry (Awin) = CANDIDATS | B | Inscription Awin → AFerry |
| Transfert d'argent | Comparateur présent ; aucun lien affilié | B | WorldRemit / Wise (inscription) |
| Colis | Eurosender = CANDIDAT | B | Inscription |
| Assurance, voiture, hôtel | Cartes Travelpayouts « À activer » | B | Choisir les programmes dans Travelpayouts |
| Paris sportifs | Code présent, aucun lien | D (décision de Tarek, risque réglementaire) | Décider |
| Services auto, immobilier, commerces locaux | Annuaire ; **aucun accord écrit connu** | C | Voir partenaires |
| Investissement MRE au Maroc | Hors produit | D | — |

**Victoire intermédiaire visée** : un visiteur calcule un itinéraire → clique « Comparer les vols » → le clic est en base (#243) → Travelpayouts montre une réservation → RME prouve un euro.

## 5. Partenaires (étape 5)

- Statuts à respecter : CANDIDATE → REFERENCED → CONTACTED → INTERESTED → PARTNER → AFFILIATE (#227, #230).
- **Aucun accord écrit n'est connu** avec Marwa, HiDOUR, Belisamae ou Afarah. Ils restent au mieux REFERENCED tant que Tarek ne dit pas le contraire.
- La #230 retire les faux catalogues, y compris **20 adresses du plan du site** (13 caftans, 7 biens), que Google indexe aujourd'hui.

## 6. Acquisition et SEO (étape 2)

| Point | État |
|---|---|
| `robots.txt`, plan du site (85 adresses), 57 pages trajet avec titre, description, canonique et données structurées (`WebApplication`, `BreadcrumbList`) | ✅ MESURÉ |
| Google Search Console | ❌ non branchée → aucune donnée de recherche (FOUNDER ACTION) |
| 20 pages de faux catalogues dans le plan du site | ❌ corrigé par #230 |
| Contenu daté manquant | ❌ Fête de l'Unité, réparé par #241 |

Canaux à coût nul et forte intention (HYPOTHÈSE, à mesurer avec un paramètre UTM) :
1. groupes Facebook MRE « route Maroc » en juillet-août ;
2. réponses utiles sur des forums (Bladi, Yabiladi), avec un lien vers la page trajet exacte ;
3. TikTok et YouTube « trajet en voiture vers le Maroc ».

Ne rien publier avant que la production soit à jour.

## 7. Financement (étape 6)

| Dispositif | Montant | Conditions clés | Adéquation | Source |
|---|---|---|---|---|
| **Agefiph, aide à la création** | 3 000 € forfaitaires | Étude du projet avec un expert habilité ; investissement ≥ 7 500 € dont 1 200 € d'apport ; statut de dirigeant | HYPOTHÈSE forte (à confirmer par Tarek) | [Fiche Agefiph 2026](https://www.agefiph.fr/sites/default/files/medias/fichiers/2026-01/Agefiph-Aide-creation-reprise_2026-01.pdf), [Bpifrance Création](https://bpifrance-creation.fr/encyclopedie/aides-a-creation-a-reprise-dentreprise/aides-sociales-financieres/aide-a-creation) |
| **Prêt d'honneur Initiative France** | 3 000 à 50 000 € à taux zéro, sans garantie (souvent 5 000 à 30 000 €) | Passage devant un comité local | Bonne | [Hayot Expertise](https://hayot-expertise.fr/blog/pret-honneur-initiative-reseau-entreprendre-2026) (SECONDAIRE) |
| **Bourse French Tech (Bpifrance)** | ≤ 30 000 €, 70 % des dépenses au maximum | Société de moins d'un an, projet innovant, 30 % autofinancés | UNKNOWN (existe-t-il une société ? depuis quand ?) | [Hayot Expertise](https://hayot-expertise.fr/en/blog/french-tech-grant-bpifrance) (SECONDAIRE) |
| MDM Invest (Tamwilcom, Maroc) | Prime de 10 % | Investissement ≥ 1 MDH au Maroc | Faible aujourd'hui | [LesMRE](https://www.lesmre.com/fr/actualites/mdm-invest-et-mdm-tamwil-comment-financer-un-projet-au-maroc-en-2026) |

Ordre conseillé : **Agefiph** (via un conseiller Cap emploi ou un expert habilité), puis **Initiative France** local (le prêt d'honneur aide aussi à obtenir un prêt bancaire). Aucune candidature n'a été déposée.

## 8. Risques

- **Tant que Netlify ne publie pas `main`, chaque correction reste invisible** : c'est le risque n°1.
- Le lien vols est « actif » côté RME, mais l'approbation du programme chez Travelpayouts reste UNKNOWN.
- Les clés IA de Hadak ont transité par une conversation le 27/09 : à régénérer (déjà noté dans `ADMIN_CHECKLIST.md`).
- Code inutilisé avec de faux avis d'utilisateurs (`app/api/tips`) : retiré dans #244.
- Paris sportifs : composant présent, même défaut d'hydratation latent que la carte « Vols » si un lien est posé.

## 9. FOUNDER ACTIONS (dans l'ordre, avec Delphine)

0. **Remettre la production à jour (5 min)** : https://app.netlify.com/projects/rme-voyage/deploys
   - S'il n'y a aucun déploiement pour `f458dd6` : bouton **Trigger deploy → Deploy site**.
   - Puis **Project configuration → Build & deploy → Continuous deployment** : vérifier que la branche de production est `main` et que les constructions ne sont pas arrêtées (« Stopped builds »).
   - Contrôle : `/pitch` ne doit plus afficher « 2100 km ».
1. **Travelpayouts (10 min)** : https://www.travelpayouts.com
   - Programme Aviasales : approuvé ? Combien de clics et de réservations depuis le 27/09 ?
   - Dans l'outil de liens profonds (« deep link ») d'Aviasales, générer un lien vers `https://www.aviasales.com/`. Dans ce lien, remplacer l'adresse Aviasales encodée par `{url}` : le lien doit finir par `…&u={url}`.
   - Poser le résultat dans Netlify sous `TRAVELPAYOUTS_FLIGHT_DEEPLINK_TEMPLATE`. Le bouton ouvrira alors Aviasales sur le trajet exact.
2. **Fusionner, une PR à la fois** (contrôle de chacune), dans l'ordre :
   1. #241, avant le 31 octobre ;
   2. #242 ;
   3. #243 ;
   4. #207 ;
   5. #244 ;
   6. #245, #246, #247 (fusion successive vérifiée sans conflit) ;
   7. puis la liste du plan OMEGA 10.
3. **Mesure durable (15 min)** : suivre `docs/ADMIN_CHECKLIST.md` → « Mesure durable » (Supabase gratuit, un fichier SQL, deux variables).
4. **Liens eSIM et activités** : poser `AIRALO_AFFILIATE_URL`, `YESIM_AFFILIATE_URL`, `KKDAY_AFFILIATE_URL` et `KLOOK_AFFILIATE_URL` dans Netlify (après #207).
5. **Google Search Console** : `docs/ADMIN_CHECKLIST.md` → « Google Search Console ».
6. **Financement** : prendre rendez-vous avec un conseiller (Cap emploi ou Agefiph) pour l'étude de projet qui conditionne l'aide de 3 000 € ; demander à l'Initiative France locale la date du prochain comité.
7. **Vercel** : désinstaller l'application Vercel du dépôt (GitHub → Settings → GitHub Apps). Elle met une croix rouge sur chaque PR.

## 10. Les 10 prochaines actions de Claude (sans attendre)

1. Vérifier la production, page par page, dès que Netlify a publié `main` (Forge complète).
2. ~~Retirer les faux avis~~ : fait (#244).
3. Protéger les paris sportifs du même défaut d'hydratation (dès que Tarek a décidé de les garder).
4. Pré-remplir aussi le lien ferry si un programme fournit un format de lien documenté.
5. Publier dans la #243 un tableau de bord SQL prêt à copier : clics par partenaire et par page.
6. Ajouter le paramètre `utm_source` aux liens partagés depuis RME, pour mesurer les canaux.
7. Tenir à jour les dates religieuses 2027 dès les annonces des Habous.
8. Relancer la Forge sur production après chaque publication.
9. Préparer les textes de candidature (Agefiph, Initiative) à partir des preuves mesurées.
10. Écrire un guide sourcé « arrivée au port » (Opération Marhaba) pour Hadak.


## 11. Vérification publique (outil prêt, point de départ mesuré)

`docs/rme-lab/verif/prodcheck.js` contrôle en lecture seule, dans un vrai navigateur et par l'API, ce qu'un visiteur voit réellement. Il fait 16 contrôles (accueil, calendrier, douane, zakat, SIM, page jury, partenaires, lien vols, avis, événements, Hadak).

**Production le 4 octobre 2026 à 22 h 48 UTC (commit `8295f7f` du 2 octobre) : 5 sur 16.**
- Hadak en ligne répond par l'IA à « Quelle franchise douane au Maroc ? » : « 250 USD pour les hommes et… ». C'est un chiffre inventé, servi aux visiteurs. Corrigé par #226, déjà fusionnée mais **pas publiée**.
- Hadak donne l'heure au voyageur d'Algésiras ; « 4G dans tout le pays » ; « Grimaldi » pour Nador. Ces trois réponses sont corrigées dans `main`, mais pas publiées.
- Il reste à faire en dehors du code : poser `TRAVELPAYOUTS_FLIGHT_DEEPLINK_TEMPLATE` pour ouvrir le lien vols sur le bon trajet.

Après publication de `main` (avec #245, #246 et #247), on attend 15 sur 16 ; seul le lien vols pré-rempli restera à faire. À relancer : `node docs/rme-lab/verif/prodcheck.js` (mode d’emploi : `docs/rme-lab/BOUCLE.md`).

## 12. État business au 4 octobre 2026 (mesuré ou UNKNOWN)

| Maillon | État | Preuve |
|---|---|---|
| Version corrigée en ligne | **NON** : production du 2 octobre | Netlify `commit_ref 8295f7f` |
| Liens affiliés actifs | 1 (vols, Aviasales), non pré-rempli | `/api/partners`, `/api/affiliates` |
| Clics mesurés et conservés | **NON** : journaux d'environ un jour ; #243 fusionnée, table pas encore créée | code |
| Programme Aviasales approuvé | UNKNOWN | compte Travelpayouts |
| Conversions, revenu | UNKNOWN : 0 € prouvé | — |
| Trafic | UNKNOWN : Search Console non branchée | — |

**Première expérience commerciale proposée** :
- **Hypothèse** : un visiteur qui calcule un itinéraire clique sur « Comparer les vols ».
- **Mesure** : `partner_click` (product = flight) divisé par `route_computed`, sur 14 jours, dans `rme_events`.
- **Seuil** : 2 % ou plus. En dessous de 0,5 %, l'emplacement ou le message sont à revoir.
- **Préalables** : production à jour, table `rme_events` créée, lien pré-rempli posé.


## 13. Après publication : premières corrections (mesurées le 4 octobre à 23 h 13 sur l'aperçu #228, identique à `main` 373ed24)

Aucune PR ouverte (mandat : la publication d'abord).

| # | Question réelle | Réponse de Hadak | Cause | Correction proposée |
|---|---|---|---|---|
| 1 | « Combien de **temps** je peux laisser ma voiture française au Maroc ? » | Météo de Casablanca | `temps` déclenche toujours la météo (`app/api/hadak/route.ts`, détection des intentions) | Exclure « combien de temps », « en combien de temps », « temps de… » de la météo |
| 2 | « Combien coûte le **péage** Tanger Casablanca ? » | Météo de Casablanca | Toute question non reconnue qui cite une ville part vers la météo (`intent === 'generic' && cityKey`) au lieu de l'IA ou d'un « je ne sais pas » | Réserver ce raccourci aux messages sans autre mot que la ville |
| 3 | « Mon enfant mineur voyage seul au Maroc, il faut quel papier ? » | Passeport seulement | Réponse générique « documents » | Ajouter l'autorisation de sortie du territoire (AST) **après vérification sur service-public.fr** |
| 4 | Argent liquide en quittant la France, assurance, médicaments | Réponses de l'IA, sans source | Pas de réponse locale | À sourcer ou à renvoyer vers la source officielle |

Les cas 1 et 2 sont des erreurs silencieuses : la personne reçoit une réponse sûre d'elle, mais sur un autre sujet. Chacun deviendra un test de non-régression et un scénario de la Forge.
