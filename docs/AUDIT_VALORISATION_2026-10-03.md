# Audit de valorisation — 2026-10-03 (version complète)

Lecture seule de `main` (`8454ce6`), des PR #207 et #214, et de la production publique. Rien n'a été construit, modifié, fusionné ni déployé. Aucun secret ni lien d'affiliation n'est reproduit ici.

Preuves : `CODE` (lu dans `main`), `PROD` (lecture publique du site le 2026-10-03), `WEB` (page officielle lue le 2026-10-03), `UNKNOWN`.
États toujours séparés : CODE PRÉSENT ≠ PARTENAIRE APPROUVÉ ≠ LIEN ACTIF ≠ CLIC ≠ CONVERSION ≠ REVENU.

## 1. Résultat en cinq lignes

1. Le site a déjà beaucoup de code commercial. Un seul lien est actif en production : Travelpayouts Vols. Les 9 autres partenaires sont « À activer ».
2. Le lien de vol prérempli est sur `main` depuis le 2026-10-03 à 02h37, mais **la production ne l'a probablement pas** : le déploiement semble plus ancien que ce commit (voir §4).
3. Le clic partenaire est mesuré par le code vers `/api/events`, sans Vercel. La conversion et le revenu ne sont mesurés nulle part.
4. Trois services gratuits posent un problème de conditions d'usage, dont Gemini (§3).
5. Cinq pistes méritent une expérience (§5). Aucune n'est un revenu : ce sont des hypothèses à tester.

## 2. Inventaire des actifs commerciaux

| Actif | Où | Code | Lien actif en PROD | Clic mesuré | Remarque |
|---|---|---|---|---|---|
| Vols Travelpayouts | `lib/affiliate.ts`, `lib/flightSearch.ts`, `/api/affiliates` | oui | **oui** (lien court `tp.st`) | code oui, journal PROD UNKNOWN | prérempli : non servi en PROD |
| Hôtel, voiture, assurance | `lib/partnerCatalogue.ts` | oui | non (`pending`) | n/a | 3 liens courts à générer |
| Ferry : Direct Ferries, GNV, FRS | `lib/affiliate.ts`, `lib/ferryCrossings.ts`, 56 pages `/trajet` | oui | non | n/a | le bouton ferry existe sur chaque page de trajet |
| eSIM, activités (Airalo, Yesim, KKday, Klook) | PR #207 | oui, non fusionné | non | n/a | n'existent pas dans le code déployé |
| Envoi d'argent (Wise, WorldRemit, Remitly, WU, MoneyGram) | `/api/remittance`, `components/RemittanceComparator.tsx` | oui | **non** (`isAffiliate:false`) | code oui | taux réel, frais **estimés** |
| Paris sportifs (Unibet, Betclic, Winamax, bet365) | `lib/sportsPartners.ts` | oui | non | n/a | **secteur régulé**, voir §3 |
| Immobilier Taza, caftans Marwa, traiteur | `/taza-immobilier`, `/marwa-caftan`, `/afarah-nassim` | oui | contact WhatsApp direct | UNKNOWN | vente hors plateforme |
| Dons | `/api/support/checkout`, Stripe | oui | UNKNOWN (clé Stripe non observable) | n/a | répond 503 si non configuré |
| Newsletter | `/api/newsletter`, Resend | oui | UNKNOWN | n/a | canal de reciblage, pas un revenu |
| Offre B2B `/pro` | `app/pro/page.tsx` | volontairement non construite | n/a | n/a | ne rien promettre |
| Application Android | `android/`, `play-store-listing/` | oui | publication UNKNOWN | n/a | captures peut-être périmées |
| Lab « Magic Intent » | `lib/lab/*`, `/lab/intention` | oui, PR non fusionnées | 404 en PROD (voulu) | n/a | 946 tests, banc de 210 phrases |
| Données de trajet | `lib/data/routePages.json`, `fuelPrices.json`, `/api/route` | oui | public | n/a | idée « API / B2B » : hypothèse, rien ne la prouve |
| Veille BOAMP `omega-veritas` | `omega-veritas/` | oui | n/a | n/a | étape « Open a pull request » en échec, cause UNKNOWN |

## 3. Conditions d'usage : fait vérifié, restriction contractuelle, reste à vérifier

Pages officielles lues le 2026-10-03. Lecture des conditions, pas un avis juridique.

| Service (où dans le code) | Fait vérifié | Restriction contractuelle (citation) | Reste à vérifier |
|---|---|---|---|
| **Open-Meteo gratuit** (`app/api/hadak/route.ts`) | La page des conditions existe et distingue offre gratuite et offres Standard, Professional, Enterprise. Limites gratuites : 10 000 appels/jour, 5 000/heure, 600/minute. Licence CC-BY 4.0. | « You may only use the free API services for non-commercial purposes. » (open-meteo.com/en/terms) | RME est-il « commercial » (liens d'affiliation, un livre en publicité) : décision de Tarek. Tarif commercial : non lu. Attribution CC-BY affichée sur le site : UNKNOWN. |
| **OSRM serveur de démonstration** (`app/api/route/route.ts`) | Le wiki officiel décrit le serveur comme une démonstration. | « restricted to reasonable, non-commercial use-cases », « Do not exceed 1 request per second », « no guarantees wrt. uptime, latency, or data updates ». | Même décision « commercial ». Coût d'un OSRM ou d'un service payant de remplacement : UNKNOWN. |
| **Gemini API gratuit** (`lib/hadakAiRouter.ts`, fournisseur `gemini`) | Les conditions existent et séparent services gratuits et payants. | « You may use only Paid Services when making API Clients available to users in the European Economic Area, Switzerland, or the United Kingdom. » Les contenus envoyés servent à améliorer les produits Google. (ai.google.dev/gemini-api/terms) | **La clé en production est-elle sur offre gratuite ou payante ?** UNKNOWN, visible seulement dans la console Google. La restriction s'applique si elle est gratuite. |
| Paris sportifs (`lib/sportsPartners.ts`) | Les opérateurs doivent être agréés par l'ANJ ; Betclic, Winamax et Unibet le sont. Pour bet365.fr, la recherche n'a montré qu'un agrément courses hippiques. | Cadre ANJ, non lu en détail. | Paris sportifs sur bet365 : UNKNOWN. Décision juridique de Tarek. |
| TheSportsDB gratuit (`app/api/faical`, `hadak`) | Clé gratuite `123`, 30 requêtes/minute. Le code utilise la clé `3`. | Rien d'explicite sur l'usage commercial. | UNKNOWN. |
| Aladhan (`app/api/prayer`, `hadak`) | — | — | La page lue ne contient pas les conditions : UNKNOWN. |
| Nominatim, Overpass, devises (fawazahmed0) | — | — | Non revérifiés aujourd'hui : UNKNOWN. |

Aucune étape de la séance d'activation ne met en service Open-Meteo, OSRM ou Gemini : ces trois services tournent déjà. Ce qui change avec l'activation, c'est qu'elle rend le site plus clairement commercial. D'où la règle : **décider d'abord, accélérer ensuite.**

## 4. Contrôle de cohérence avec #207, #214 et la production

| Point | Constat | Preuve |
|---|---|---|
| Variables lues par `main` et citées par la checklist #214 | Toutes les variables lues sont dans la checklist, sauf `NODE_ENV` (sans intérêt). Les 4 variables de paris y figurent comme « hors activation ». Aucune variable inventée par la doc, à part les secrets Android (CI) et des noms de documents, normaux. | CODE, comparaison automatique des noms |
| `AI_ROUTER_FREE_ONLY` | Lue par le code, présente dans la doc. En PROD, `free_only:true`. | CODE, PROD `/api/health` |
| Lien de vol prérempli en PROD | `/api/affiliates?type=flight…` répond sans `prefilled:true`. Le code l'ajoute dès que le modèle est posé **et** déployé. Le commit du prérempli date du 2026-10-03 à 02h37 (heure de Paris). La page d'accueil en cache a 20,7 heures (stockée vers 23h45 le 2026-10-02) : Netlify vide le cache à chaque déploiement, donc aucun déploiement n'a eu lieu depuis. Le déploiement en production est donc **antérieur** au commit du lien prérempli. | PROD, en-têtes `age`, `date` ; CODE `git log` |
| Conséquence | La cause la plus probable est un **déploiement ancien**, pas seulement une variable absente. Il faudra les deux : déploiement récent et modèle de lien. Indice fort, pas une preuve : le commit exact déployé reste UNKNOWN. | — |
| Suivi des clics | Le code envoie `partner_click` à `/api/events` (journal `rme-event` des fonctions Netlify), pas à Vercel. `MONETISATION.md` dit encore « Vercel Analytics » : **documentation périmée**. `/api/events` répond (400 sur un événement invalide, comme prévu). Durée de conservation des journaux sur l'offre gratuite : UNKNOWN. | CODE `lib/partnerTracking.ts`, PROD |
| `MONETISATION.md` (signalé, **non modifié**) | Ligne 24 : « Hôtels, eSIM, assurance, location voiture : pas de code ». Faux aujourd'hui : le catalogue existe. Ligne 31 : le clic est envoyé à « Vercel Analytics ». Faux aujourd'hui : il part vers `/api/events`. À remettre en cohérence plus tard, par une PR documentaire séparée. | CODE `lib/partnerCatalogue.ts`, `lib/partnerTracking.ts` |
| Partenaires en PROD | 1 actif sur 10 (Travelpayouts Vols), les 9 autres `pending`. | PROD `/api/partners` |
| Statut Vercel rouge sur #207 | Compte Vercel bloqué, sans lien avec le code. Le site tourne sur Netlify. | GitHub |
| Pages hors sitemap | `/affilies`, `/pitch`, `/pro` (+ `/auth`, normal). Volontaire ou oubli : UNKNOWN. | CODE, PROD |

## 5. Les 5 pistes qui méritent une expérience

Chaque piste est une hypothèse, pas un revenu. Aucune commission n'est vérifiée.

### P1. Lien de vol prérempli
- **Actif / lieu** : `lib/flightSearch.ts`, `lib/affiliate.ts`, `/api/affiliates`.
- **Valeur** : le trajet Europe↔Maroc est le cœur du site ; un lien prérempli évite de ressaisir la recherche.
- **Mécanisme** : commission Travelpayouts sur un billet réservé après clic.
- **Dépendances** : déploiement récent de `main` ; `TRAVELPAYOUTS_FLIGHT_DEEPLINK_TEMPLATE` ; modèle valide (https, hôte `tp.media`, un seul `{url}`).
- **Effort / risque** : faible. Risque : lien mal formé (le code le refuse et retombe sur le lien générique).
- **Preuve disponible** : lien générique actif ; code et tests présents. **Manquante** : un clic prérempli visible dans les journaux.
- **Test minimal** : après la séance d'activation (#214), un clic réel de Tarek, puis lecture du journal `rme-event`.

### P2. Comparateur d'envoi d'argent
- **Actif / lieu** : `/api/remittance`, `RemittanceComparator.tsx`.
- **Valeur** : besoin récurrent de la diaspora ; taux réel déjà affiché.
- **Mécanisme** : commission par fournisseur après inscription à son programme.
- **Dépendances** : approbation du programme, puis `*_AFFILIATE_URL`.
- **Effort / risque** : faible côté code ; délai d'approbation inconnu. Risque : frais estimés présentés comme exacts (le code les étiquette « estimated »).
- **Preuve** : comparateur répond en PROD, `isAffiliate:false`. **Manquante** : un programme approuvé.
- **Test minimal** : activer un seul fournisseur et lire les clics sur une semaine.

### P3. Ferry sur les 56 pages de trajet
- **Actif / lieu** : `lib/affiliate.ts`, `lib/ferryCrossings.ts`, `/trajet/[slug]`.
- **Valeur** : le ferry est le maillon indispensable des trajets en voiture ; chaque page a déjà son bouton.
- **Mécanisme** : commission Direct Ferries (ou GNV, FRS) après clic.
- **Dépendances** : approbation du programme ; `DIRECT_FERRIES_AFFILIATE_URL`.
- **Effort / risque** : faible. Risque : trafic de ces pages inconnu.
- **Preuve** : bouton présent, `pending`. **Manquante** : trafic, programme approuvé.
- **Test minimal** : activer le lien et compter les clics `partner_click` par page.

### P4. Pack partenaires voyage (hôtel, voiture, assurance, eSIM, activités)
- **Actif / lieu** : `lib/partnerCatalogue.ts`, PR #207.
- **Valeur** : un voyage complet a plus de besoins que le billet.
- **Mécanisme** : commissions Travelpayouts par partenaire.
- **Dépendances** : liens courts `tp.st` générés dans le compte ; #207 fusionnée pour les 4 nouveaux ; accès du compte à chaque programme (à confirmer).
- **Effort / risque** : faible. Risque : afficher un partenaire non approuvé comme réservable (le code l'interdit).
- **Preuve** : 4 liens reçus, tests OK. **Manquante** : approbation de chaque programme.
- **Test minimal** : activer d'abord hôtel et voiture, qui servent le plus de trajets.

### P5. Lab « Magic Intent » devant 5 vrais utilisateurs
- **Actif / lieu** : `lib/lab/*`, `components/lab/MagicIntent.tsx`.
- **Valeur** : moins de questions posées (en simulation : 5,96 contre 8,45) et un chemin direct vers les liens ci-dessus.
- **Mécanisme** : meilleure conversion d'une intention en clic. Hypothèse.
- **Dépendances** : GO de Tarek ; relecture des 3 notes en darija ; décision sur la fusion des PR.
- **Effort / risque** : moyen. Risque : les gains mesurés sont synthétiques.
- **Preuve** : 946 tests, banc de 210 phrases. **Manquante** : un seul vrai utilisateur.
- **Test minimal** : 5 personnes, 3 phrases chacune, relevé des phrases mal comprises.

### Écartées pour l'instant
- **Paris sportifs** : décision juridique d'abord (ANJ).
- **`/pro` B2B et « API de données »** : rien de construit, aucune demande observée.
- **Dons Stripe** : état de la clé UNKNOWN ; pas un levier d'affiliation.
- **Application Android** : publication UNKNOWN ; à vérifier avant d'y investir.
- **Veille BOAMP** : cause de l'échec UNKNOWN.

## 6. Contrôle final : #207, #214, #215 et `main`

| Question | Réponse | Preuve |
|---|---|---|
| #214 décrit-elle toutes les variables nécessaires ? | Oui. Toutes les variables lues par `main` y figurent (hors `NODE_ENV`). Corrigée le 2026-10-03 : l'étape 0 dit maintenant que le déploiement actuel n'est pas prouvé récent, et Gemini est ajouté aux décisions de licence. | CODE, comparaison des noms |
| L'ordre d'activation peut-il mettre en service une fonction dépendant d'un service non validé ? | Non : aucune étape n'active Open-Meteo, OSRM ni Gemini, qui tournent déjà. Mais l'activation rend le site plus commercial : les décisions de licence passent **avant** (séquence §7). Les paris restent hors activation. | CODE |
| Le lien de vol prérempli sera-t-il vérifiable après déploiement ? | Oui, sans clic : `/api/affiliates?type=flight&origin=Paris&destination=Tanger&date=<date future>` doit contenir `"prefilled":true` et une adresse `https://tp.media/r?`. Paris et Tanger ont un code d'aéroport dans le code. Le forme du modèle `…&u={url}` est acceptée par le contrôle du code. | CODE `lib/flightSearch.ts` |
| Les 4 partenaires de #207 restent-ils isolés ? | Oui. Chacun a sa propre variable (`AIRALO_`, `YESIM_`, `KKDAY_`, `KLOOK_AFFILIATE_URL`) ; absente ou refusée, la carte reste « À activer ». La PR ne touche que le catalogue, ses tests et la documentation (3 fichiers). | CODE, diff de la PR |
| Obsolescences de `MONETISATION.md` | Signalées au §4, non modifiées. | — |
| Point à trancher dans #214 | #214 dit « Un clic produit une ligne `partner_click` » et aussi « Ne cliquer ni acheter via ses propres liens pour tester ». Les deux phrases se contredisent. Proposition : ne pas cliquer soi-même, attendre les premiers clics réels. | CODE, doc |

## 7. Séquence d'activation recommandée

Seules les étapes humaines indispensables, dans l'ordre exact. Ne rien faire dans Netlify avant l'étape 5.

**Avant Netlify (hors production)**
1. **Lire** #214 et #207. Si OK, fusionner d'abord #207, puis #214. #215 est un simple document, sans effet.
2. **Tranche Gemini** dans la console Google : offre payante, ou retirer la clé `GEMINI_API_KEY` plus tard dans la séance. Sans réponse, noter UNKNOWN et ne pas accélérer.
3. **Tranche « RME est commercial »** (Open-Meteo, OSRM) : oui ou non. Si oui, prévoir offre payante ou source de remplacement. Les paris restent hors activation.
4. **Dans Travelpayouts** : générer le lien long d'une recherche Aviasales et remplacer l'adresse par `{url}` ; générer les trois liens courts hôtel, voiture, assurance ; confirmer que les programmes Airalo, Yesim, KKday et Klook sont connectés au compte.

**Dans Netlify (séance unique, groupe par groupe, vérification après chaque déploiement)**
5. Regarder le commit publié. S'il est antérieur à `f2d4d0a` : Trigger deploy, sans changer de variable. Vérifier `/api/partners` : un seul partenaire actif.
6. Poser `TRAVELPAYOUTS_FLIGHT_DEEPLINK_TEMPLATE`, déployer, vérifier `"prefilled":true`.
7. Poser les trois liens hôtel, voiture, assurance, déployer, vérifier `/api/partners`.
8. Poser les quatre liens Airalo, Yesim, KKday, Klook (seulement si #207 est fusionnée), déployer, vérifier `/api/partners`.
9. Remplir le journal d'activation de #214. S'arrêter.

**Après**
10. Attendre de vrais clics (5 personnes, voir P5), lire les lignes `rme-event`, et seulement alors parler de conversion.

## 8. Ce qui reste hors de portée ici
Le commit réellement déployé, l'état des variables Netlify (volontairement non lues), la conservation des journaux, tout chiffre de trafic, de clic, de conversion ou de revenu.
