# Audit de valorisation — 2026-10-03

Lecture seule de `main` (`8454ce6`). Rien n'a été construit, modifié, fusionné ni déployé.
Preuves : `CODE` (lu dans `main`), `PROD` (lecture publique du site, 2026-10-03), `WEB` (page officielle lue aujourd'hui), `UNKNOWN`.
États toujours séparés : CODE PRÉSENT ≠ PARTENAIRE APPROUVÉ ≠ LIEN ACTIF ≠ CLIC ≠ CONVERSION ≠ REVENU.

## 1. Les 5 actifs dormants à plus fort potentiel

Pas de classement financier : aucune commission n'est vérifiée. L'ordre suit « le besoin de l'utilisateur est clair » puis « ce qui manque est petit ».

| # | Actif | État réel | Ce qui manque | Valeur potentielle | Risque | Qui |
|---|---|---|---|---|---|---|
| 1 | **Lien vol Travelpayouts** | CODE présent. LIEN ACTIF en PROD (`aviasales.tp.st/…`). Lien profond prérempli : code sur `main`, mais la PROD sert le lien générique (cause UNKNOWN : déploiement ancien ou variable absente). Clic mesurable ? UNKNOWN. | Modèle de lien profond dans `TRAVELPAYOUTS_FLIGHT_DEEPLINK_TEMPLATE` ; confirmer le déploiement ; vérifier qu'un clic laisse une trace. | Le trajet Europe↔Maroc est le cœur du site. Un lien prérempli évite à l'utilisateur de ressaisir sa recherche. | Moyen : sans mesure du clic, on ne saura pas si ça marche. | Tarek |
| 2 | **Comparateur d'envoi d'argent** (Wise, WorldRemit, Remitly, WU, MoneyGram) | CODE présent, taux réel (PROD répond). 0 lien affilié (`isAffiliate:false`). Frais estimés, affichés comme estimés. Guide `/affilies` existe mais est en noindex. | Inscription aux programmes et variables `*_AFFILIATE_URL`. | Le public (diaspora) envoie de l'argent au Maroc : besoin réel, récurrent. | Faible : le code refuse déjà un lien non validé. Frais estimés à ne pas présenter comme garantis. | Tarek |
| 3 | **9 partenaires « À activer »** (ferry Direct Ferries, hôtel, voiture, assurance, 4 de la #207) | CODE présent, tous `pending` en PROD. Aucun n'est présenté comme réservable. | Liens courts Travelpayouts, puis variables (ordre dans `docs/ADMIN_CHECKLIST.md`, PR #214). | Le ferry est le maillon manquant du trajet Europe↔Maroc en voiture. | Faible. | Tarek |
| 4 | **Lab « Magic Intent »** (une phrase → actions) | CODE présent, 946 tests, banc de 210 phrases, garde-fous. 404 en production (voulu). Branche #195–#199, non fusionnée. | GO pour le montrer à 5 personnes ; relecture darija ; décision sur la fusion. | Réduit les questions posées (mesuré en simulation : 5,96 contre 8,45) ; seul actif qui améliore le parcours lui-même. | Moyen : les gains mesurés sont synthétiques, pas encore sur de vrais utilisateurs. | Tarek |
| 5 | **Application Android + fiche Play Store** | CODE présent (`android/`, Capacitor, `play-store-listing/` avec icône, visuel, captures). Publication : UNKNOWN. | Savoir si elle est publiée ; compte Play ; vérifier les captures face au site actuel. | Canal d'accès direct, sans dépendre du navigateur. | Les captures peuvent être périmées : à vérifier. | Tarek |

Mentionné, non retenu : `omega-veritas` (veille BOAMP, 105 fichiers, étape « Open a pull request » en échec, cause UNKNOWN) et `/pro` (offre B2B volontairement non construite, ne rien promettre).

## 2. Licences : vérifiées aujourd'hui sur les sources officielles

Lecture des conditions, pas un avis juridique. Chaque ligne cite la page lue.

| Service | Où dans le code | Ce que dit la source | Conséquence |
|---|---|---|---|
| **Open-Meteo (gratuit)** | `app/api/hadak/route.ts` (météo) | « You may only use the free API services for non-commercial purposes. » (open-meteo.com/en/terms). CC-BY 4.0, moins de 10 000 appels/jour. | RME porte des liens d'affiliation : l'usage est probablement commercial. À régler (offre payante ou autre source) avant de monétiser. |
| **OSRM serveur de démonstration** | `app/api/route/route.ts` | « restricted to reasonable, non-commercial use-cases », « 1 request per second », « no guarantees wrt. uptime » (wiki officiel). | Même question. Le code le dit déjà (« pas un SLA de production »). |
| **Gemini API gratuit** | `lib/hadakAiRouter.ts` (fournisseur `gemini`, `freeTier:true`) | « You may use only Paid Services when making API Clients available to users in the European Economic Area, Switzerland, or the United Kingdom. » Les contenus envoyés servent à améliorer les produits Google (ai.google.dev/gemini-api/terms). | Le public est en France : si la clé n'est pas sur offre payante, c'est interdit. État de la clé en PROD : UNKNOWN. Décision Tarek : retirer la clé, ou passer en payant. |
| **TheSportsDB (clé gratuite)** | `app/api/faical`, `app/api/hadak` | Documentation : clé gratuite `123`, 30 requêtes/minute. Rien d'explicite sur l'usage commercial. Le code utilise la clé `3`, pas `123`. | UNKNOWN. À clarifier avec le fournisseur ; écart de clé à noter. |
| **Aladhan (horaires de prière)** | `app/api/prayer`, `app/api/hadak` | La page lue ne contient pas les conditions (lien vers « terms »). | UNKNOWN. Page des conditions à lire. |
| Nominatim, Overpass, devises (fawazahmed0) | `serverGeocode`, `app/api/services`, `app/api/remittance` | Non revérifiés aujourd'hui. | UNKNOWN. À relire avant de monétiser. |

## 3. Constats de passage

- Pages hors sitemap : `/affilies`, `/pitch`, `/pro` (+ `/auth`, `/auth/confirm`, normal). Volontaire ou oubli : UNKNOWN.
- Le suivi des clics s'appuie, selon `MONETISATION.md`, sur Vercel Analytics ; la production tourne sur Netlify et le compte Vercel est bloqué. Si le suivi passe par là, il ne mesure rien. À confirmer (UNKNOWN).

## 4. Ce que l'audit ne dit pas

Aucun chiffre de revenu, de trafic ou de conversion : aucun n'est mesuré. Aucune valeur financière n'est avancée.
