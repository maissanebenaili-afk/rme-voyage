# MASTER CONTROL — registre de vérité versionné

> **Une carte, pas le territoire.** Rien n'est vrai parce que c'est écrit ici. Chaque ligne pointe vers sa preuve (GitHub, production, AppDeploy, documentation officielle, comptes, pièces). En cas de désaccord entre ce fichier et la preuve, la preuve gagne et ce fichier est corrigé.

- Créé le : 2026-09-28 — par Claude (audit), à partir du dossier ChatGPT (49 points + addendum) confronté aux sources.
- Dernière vérification complète : 2026-09-28.
- Registre public : aucune valeur secrète, aucune procédure d'accès aux comptes, aucune donnée personnelle. Ces éléments restent hors dépôt.

**Statuts** : `CURRENT` vérifié maintenant · `HISTORICAL` vrai à une date passée · `SUPERSEDED` remplacé · `DECLARED` affirmé, non vérifié · `UNKNOWN` pas de preuve · `CONTRADICTED` la preuve dit le contraire · `FROZEN` protégé.
**Consensus de modèles = hypothèse.** Un accord ChatGPT + Claude n'est jamais une preuve.

---

## 1. SYSTEM STATUS (une page)

| Domaine | État au 2026-09-28 | Statut | Preuve |
|---|---|---|---|
| RME Voyage | En production sur Netlify, CI verte, **0 partenaire actif sur 10**, aucune commission vérifiée | CURRENT | `GET /api/partners` (tous `pending`) ; CI run 464 sur `1d1c31d` |
| Nova Presta | Nommée éditrice de RME ; données commerciales non vérifiées | DECLARED | `app/page.tsx`, `lib/i18n.ts` |
| Trading V7 | En ligne, version `1789949066573`, capital réel non engagé | CURRENT / FROZEN | Page servie par AppDeploy (appVersion lu dans le HTML) |
| Trading V8 Lab | En ligne, version `1790170229681` ; API non observable de l'extérieur | CURRENT / CONTRADICTED (voir C-004) | `GET /api/health` renvoie du HTML |
| Candidate A / Harness | Gelé | FROZEN | Non accessible depuis ce dépôt |
| Video Lab | Aucun code trouvé dans un dépôt | UNKNOWN | Voir U-006 |
| Money Graph | Concept, aucune transaction | DECLARED | Aucun code sous ce nom |
| Omega-Veritas | Veille BOAMP : capture OK, ouverture de PR en échec | CURRENT | Run 36415419388, étape 8 en échec |

**Revenu vérifié : aucune commission ni conversion vérifiée.**

## 2. CURRENT PRIORITIES (sans classement subjectif)

| Piste | Délai jusqu'au cash | Niveau de preuve | Effort humain | Coût | Blocage | Chemin vers le revenu |
|---|---|---|---|---|---|---|
| Nova Presta : activité B2B | UNKNOWN | DECLARED | faible | UNKNOWN | cadre juridique de la prestation (C-006) | facture B2B |
| French Tech Nova | pas de cash (accompagnement) | CURRENT (ouvert) | moyen | UNKNOWN | éligibilité (maturité) | indirect |
| RME : 1ʳᵉ affiliation | mois | CURRENT (surfaces prêtes) | faible | UNKNOWN | comptes partenaires, trafic, licences | commission |
| BOAMP 26-92637 | 3-7 mois (HEURISTIC) | CURRENT (avis capturé) | élevé (offre) | UNKNOWN | adéquation, exigences du DCE | marché public |

## 3. PROJECT MATRIX

| Projet | Technique | Commercial | Preuve | Coût | Risque | Blocage humain | Prochaine action sûre |
|---|---|---|---|---|---|---|---|
| RME | avancé, CI verte | 0 partenaire actif | élevé (code, prod) | UNKNOWN (plans gratuits aujourd'hui, coût futur non vérifié) | licences, conditions IA (C-001) | activations partenaires, Search Console | H-002 à H-004 |
| Nova Presta | — | UNKNOWN | faible | UNKNOWN | prêt de main-d'œuvre | données de l'entreprise | vérification des données commerciales (U-001) |
| Trading V7 | en ligne | aucun | version observée | UNKNOWN | aucun (capital 0) | — | aucune (gelé) |
| Trading V8 | en ligne | aucun | API non observable | UNKNOWN | faux PASS | — | spécifier la représentation de transport déterministe |
| Video Lab | UNKNOWN | aucun | aucune | UNKNOWN | facturation auto | localiser le code | U-006 |
| Money Graph | concept | aucun | aucune | — | dispersion | — | aucune avant la 1ʳᵉ commission (D-003) |
| Omega-Veritas | fonctionne | indirect | run du jour | UNKNOWN | branches orphelines | autoriser la correction | diagnostiquer le réglage Actions (lecture) |

## 4. ECONOMIC PROOF

`UNKNOWN` tant qu'une étape n'est pas prouvée. Surface ≠ partenaire ≠ clic ≠ conversion ≠ commission ≠ paiement.

| Piste | Partenaire | Trafic | Clic | Conversion | Commission | Paiement | Revenu vérifié |
|---|---|---|---|---|---|---|---|
| Ferry (Direct Ferries / GNV / FRS) | NON ACTIF | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | 0 |
| Vols (Travelpayouts) | NON ACTIF | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | 0 |
| eSIM (Airalo) | NON ACTIF (code accepte seulement esimmorocco.org) | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | 0 |
| Transferts (Wise, etc.) | NON ACTIF | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | 0 |
| Immobilier Taza / Caftan | accord non prouvé | UNKNOWN | non mesuré | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN |
| Dons `/soutenir` | non configuré | — | — | — | — | — | 0 |
| Nova Presta B2B | clients DECLARED | — | — | UNKNOWN | — | UNKNOWN | UNKNOWN |

Mesure disponible : journal d'événements anonyme côté serveur (dont `page_view`, `partner_click`). Visiteurs : non comptés (docs/MONTH1_METRICS.md).

## 5. FROZEN / PROTECTED

| Élément | Raison | Qui autorise | Lecture autorisée | Interdit |
|---|---|---|---|---|
| Trading V7 production | référence historique | OWNER, explicitement | GET publics | redéployer, remplacer, fusionner avec V8 |
| Candidate A / Harness (snapshot `1789982434757`, DECLARED) | problème d'identité des octets bruts non résolu | OWNER | lecture | recalculer, modifier, redéployer |
| Secrets et identifiants | sécurité | OWNER | aucune dans ce registre | afficher, copier, écrire dans un fichier |
| Paiements, signatures, engagements juridiques | irréversibles | OWNER | préparation | exécution par une IA |
| Branches `boamp-watch-*` | contenu non relu | OWNER | lecture | suppression |
| Intégration Vercel ↔ GitHub | encore active (Vercel Agent Review OK le 28/09) | OWNER | lecture | débrancher sans analyse d'impact |
| Liens de paris sportifs | secteur ANJ | OWNER (décision juridique) | lecture | activation |

## 6. HUMAN ACTIONS REQUIRED

Procédures détaillées hors dépôt public.

| ID | Action | Nature | Statut |
|---|---|---|---|
| H-001 | French Tech Nova : décision go/no-go et dépôt éventuel | HUMAN REQUIRED | PENDING — **échéance 2026-09-30** |
| H-002 | Activation Travelpayouts | HUMAN REQUIRED | PENDING |
| H-003 | Activation Airalo | HUMAN REQUIRED | PENDING |
| H-004 | Validation Search Console | HUMAN REQUIRED | PENDING |
| H-005 | Revue de sécurité des identifiants | HUMAN REQUIRED | PENDING |
| H-006 | Décision de conformité fournisseur IA (C-001) | HUMAN REQUIRED | PENDING |
| H-007 | Validation des données commerciales nécessaires | HUMAN REQUIRED | PENDING |
| H-009 | Décision licences Open-Meteo / OSRM (C-002) | HUMAN REQUIRED | PENDING |

## 7. OPEN BLOCKERS

- RME : aucun partenaire actif (H-002, H-003) ; aucun trafic mesuré en visiteurs.
- RME : conformité fournisseur IA (C-001) et licences (C-002).
- V8 : API non observable de l'extérieur (C-004).
- Omega-Veritas : étape « Open a pull request » en échec (cause UNKNOWN, probablement un réglage du dépôt).
- Nova Presta : données commerciales non vérifiées (U-001).

## 8. UNKNOWN / MISSING EVIDENCE

| ID | Question | Pourquoi | Preuve nécessaire | Qui | Prochain test sûr |
|---|---|---|---|---|---|
| U-001 | Données commerciales de Nova Presta non vérifiées | priorité commerciale, aides régionales, veille BOAMP | preuve externe | OWNER | H-007 |
| U-004 | Trafic réel de RME | toute projection de revenu | journal `page_view` | OWNER / agent autorisé | compter les `page_view` sur 7 jours |
| U-005 | 745 tests verts (historique) | qualité | exécuter `npm test` | Claude | lancer la suite avec dépendances installées. Observé : 90 fichiers dans `__tests__/` au 2026-09-28 |
| U-006 | Où est le code de Video Lab ? | éviter de le refaire | dépôt ou archive | OWNER / ChatGPT | l'archive V0.1 connue était hors dépôt, dans un espace temporaire : probablement perdue |
| U-007 | Résultats V8 actuels | tout jugement quantitatif | run observé de l'extérieur | — | dépend de C-004 |
| U-008 | Direct Ferries : programme accessible ? | surface ferry | page officielle ou catalogue d'un réseau | OWNER | vérifier après H-002 |
| U-009 | Conditions commerciales de Groq, OpenRouter, TheSportsDB (clé publique de test), Nominatim, Overpass | conformité | CGU officielles | Claude | lecture des conditions |
| U-011 | APK signé, Google Play | publication mobile | Play Console | OWNER | — (DECLARED : non signé, non soumis) |
| U-012 | Onglets « Sport & TV » et « Services » disponibles quelle que soit la phase | non-régression du Travel Hub | test de l'interface | Claude | test navigateur sur la production |

## 9. OPEN CONTRADICTIONS

| ID | Affirmation A | Affirmation B | Sources | Statut | Ce qui la résoudrait |
|---|---|---|---|---|---|
| C-001 | Hadak peut utiliser l'offre gratuite de Gemini | Les conditions de l'API Gemini indiquent : « You may use only Paid Services when making API Clients available to users in the EEA, Switzerland, or the UK » | `lib/hadakAiRouter.ts` (ordre groq → gemini → openrouter) ; ai.google.dev/gemini-api/terms, lu le 2026-09-28 | OPEN — vérification de conformité à finaliser, pas un avis juridique | confirmer les conditions applicables et le mode de facturation réel du projet Google. Impact technique d'un retrait : Hadak passe de Groq à OpenRouter, un fournisseur non configuré est ignoré par `isEligible` |
| C-002 | Open-Meteo et OSRM démo utilisables | usage commercial exclu ; publicité = commercial (Open-Meteo) ; « reasonable, non-commercial » 1 req/s (OSRM) | open-meteo.com/en/terms et wiki OSRM, lus le 2026-09-28 ; RME affiche une publicité et des liens affiliés | OPEN | décision H-009 |
| C-003 | Direct Ferries : programme vérifié (dossier ChatGPT §23) | aucune page d'affiliation trouvée | recherche Claude 2026-09-28 ; docs/MONETISATION_SURFACES.md (« À VÉRIFIER ») | OPEN | U-008 |
| C-004 | V8 : manifest et en-têtes vérifiables par un auditeur externe | `/api/health` et `/api/runs` renvoient une page HTML AppDeploy | GET du 2026-09-28 | OPEN | endpoint servant les octets bruts, ou représentation de transport déterministe spécifiée |
| C-005 | Nova Presta en Île-de-France (TP'up, docs/MONEY_HUNT_OPPORTUNITIES.md) | profil Pays de la Loire, départements 44-85 (omega-veritas) | deux fichiers du dépôt | OPEN | U-001 |
| C-006 | Mise à disposition de personnel par Nova Presta | prêt de main-d'œuvre à but lucratif interdit hors ETT (Code du travail L8241-1) | dossier ChatGPT ; droit applicable à vérifier | OPEN | avis d'un avocat ou d'un expert-comptable sur le contrat type |
| C-007 | `8302aae` / `2addaff` = anciens commits de `main` | ce sont les commits des branches de #112 / #114 | `git branch -r --contains` ; clone partiel : place exacte dans `main` non vérifiable | OPEN (faible impact) | inspection de l'historique complet |

## 10. DECISIONS

| ID | Date | Décision | Raison | Réversible | Réouvrir quand |
|---|---|---|---|---|---|
| D-001 | 2026-09-27 | Netlify devient l'hébergeur de production | compte Vercel bloqué (usage commercial) | oui | changement d'offre |
| D-002 | 2026-09-28 | Plus de nouvelle fonctionnalité RME avant le 1ᵉʳ partenaire actif | le frein est commercial, pas technique | oui | 1ᵉʳ `partner_click` visible chez un partenaire |
| D-003 | 2026-09-28 | Ne pas construire Money Graph / Router / Lead Wallet | aucune transaction vérifiée | oui | 1ʳᵉ commission vérifiée |
| D-004 | 2026-09-28 | Registre des gains = tableau simple (date, source, partenaire, clic, conversion, commission attendue/confirmée, paiement, statut) | suffisant jusqu'à 10 transactions | oui | > 10 transactions |
| D-005 | historique | Trading : OBSERVE → RESEARCH → PAPER → CANDIDATE → LIVE ; aucun capital réel | capital non engagé, aucun candidat démontré | oui | preuve à chaque étape |
| D-006 | historique | Video Lab : ZERO_EURO (aucun déclenchement de facturation automatique) | budget nul | oui | budget décidé par OWNER |
| D-007 | historique | Pas de 4ᵉ automatisation ; renforcer Money Hunt | quota d'automatisations atteint | oui | nouveau quota |
| D-008 | 2026-09-28 | Ne rien débrancher côté Vercel avant analyse d'impact | Vercel Agent Review encore actif | oui | analyse faite |
| D-009 | historique | Travel Hub : store partagé au niveau module + `useSyncExternalStore`, phase pure `computeTravelPhase` | pas de nouvelle librairie d'état | oui | problème prouvé |
| D-010 | historique | Non-régression : parcours, API, suivi, surfaces partenaires, PWA et tests de sécurité doivent rester intacts | stabilité avant élégance | — | — |

## 11. DEADLINES

| Échéance | Date | Source | Conséquence | Action | Humain | Statut |
|---|---|---|---|---|---|---|
| French Tech Nova | 2026-09-30 | lafrenchtech.gouv.fr (lu le 2026-09-28) | opportunité perdue | H-001 | oui | PENDING |
| BOAMP 26-92637, Nantes Métropole, formation hygiène alimentaire | 2026-11-02 12:00 UTC | capture Omega-Veritas du 2026-09-28 | marché perdu | télécharger le DCE, go/no-go | oui | PENDING |
| France Tourisme Tech | 2026-09-27 (DECLARED) | docs/MONEY_HUNT_OPPORTUNITIES.md | — | archiver pour la prochaine promotion | — | SUPERSEDED (passée) |

## 12. EXTERNAL DEPENDENCIES

| Service | Usage | Commercial autorisé ? | Quota / coût | Conditions lues le | Si absent |
|---|---|---|---|---|---|
| Open-Meteo | météo Hadak | **non** en gratuit (publicité = commercial) | < 10 000 appels/jour | 2026-09-28 | pas de météo |
| OSRM démo | itinéraire `/api/route` | **non** (« reasonable, non-commercial ») | 1 req/s | 2026-09-28 | pas d'itinéraire |
| Nominatim | géocodage | UNKNOWN (politique citée dans le code, non relue) | UNKNOWN | — | — |
| Overpass | services à proximité | UNKNOWN | UNKNOWN | — | — |
| TheSportsDB (clé publique de test) | Faical, Hadak foot | UNKNOWN | UNKNOWN | — | pas de pronostic |
| Gemini API | Hadak (secours 2) | à vérifier (C-001) : les conditions lues réservent aux offres payantes les API clients servant l'EEE | UNKNOWN | 2026-09-28 | Hadak → OpenRouter |
| Groq | Hadak (1er) | UNKNOWN | UNKNOWN | — | Hadak → Gemini → OpenRouter |
| OpenRouter (`openrouter/free`) | Hadak (secours 3) | UNKNOWN | UNKNOWN | — | réponse locale / OFFLINE |
| Travelpayouts | affiliation | oui | inscription gratuite, paiement mensuel ; seuil UNKNOWN | 2026-09-28 | — |
| Airalo | affiliation eSIM | oui | 10 % via Impact, payé fin du mois suivant (date de la FAQ ancienne) | 2026-09-28 | — |
| Wise | affiliation transferts | oui | via Partnerize ; commission non publiée | 2026-09-28 | — |
| Direct Ferries | affiliation ferry | UNKNOWN (C-003) | UNKNOWN | — | — |
| CoinGecko | V8 | UNKNOWN | UNKNOWN (AVAX RATE_LIMITED le 2026-09-23, HISTORICAL) | — | couverture < 100 % |
| NVIDIA NIM | Lab uniquement | **non** en production (développement seulement) | — | 2026-09-27 (#189) | — |

## 13. PRODUCTION

| Projet | Environnement | URL | Version / commit | Vérifié le | Santé | Statut |
|---|---|---|---|---|---|---|
| RME | Netlify | https://rme-voyage.netlify.app | `main` `1d1c31d` (déploiement lié à `main`, DECLARED) | 2026-09-28 | 200 ; `manifest.webmanifest` 200 ; sitemap 85 URL ; balise Search Console absente | CURRENT |
| RME | Vercel | rme-route.vercel.app | — | — | compte bloqué | SUPERSEDED |
| Trading V7 | AppDeploy | https://trading-intelligence-260ud1.v2.appdeploy.ai/ | `1789949066573` | 2026-09-28 | page servie | CURRENT / FROZEN |
| Trading V8 | AppDeploy | https://trading-intelligence-v8-verified-lab-alx8h8.v2.appdeploy.ai/ | `1790170229681` | 2026-09-28 | page servie ; API renvoie du HTML | CURRENT |

## 14. REPOSITORIES

`maissanebenaili-afk/rme-voyage` — seul dépôt accessible aux agents au 2026-09-28.
- `main` : `1d1c31d` (fusion #192), CI « Lint, Test & Build » et CodeQL verts.
- PR ouvertes : #173 (radio), #174 (inventaire publicitaire), sans activité depuis le 2026-09-27.
- Fusionnées récemment : #175 à #192 (sauf #190, fermée sans fusion). #112, #114, #115, #116, #117 fusionnées les 25-26/09.
- Branches orphelines connues : `boamp-watch-2026-09-25` à `-28`, `money-hunt-2026-09-27` / `-28`.
- Statut GitHub résiduel : « Vercel — Account is blocked » (bruit, voir D-008).
- Trading, Video Lab, Candidate A : dépôts non accessibles (UNKNOWN).

## 15. MODEL DISAGREEMENTS

| Question | ChatGPT | Claude | Preuve pour A | Preuve pour B | Test qui tranche |
|---|---|---|---|---|---|
| Place de Nova Presta | 5ᵉ, à vérifier avant d'accélérer | 2ᵉ | aucune donnée financière | seul actif avec acheteurs identifiés (DECLARED) | preuve commerciale externe (U-001) |
| Licences Open-Meteo / OSRM | à régler avant la grande échelle | à régler avant d'activer les partenaires | trafic faible | conditions : la publicité suffit à rendre l'usage commercial | décision H-009 |
| Nouvel audit global avant d'agir | oui | non, faits suffisants | — | — | — (préférence de méthode) |

## 16. HISTORICAL CONTEXT (pointeurs, pas de copie)

- Architecture Travel Hub et phases : `lib/travel/travelPhase.ts`, `lib/travel/useTravelStorage.ts`, `lib/travel/useTravelPhase.ts` (CURRENT).
- North Star, Test Lab, radar d'innovation : `docs/rme-lab/`.
- Hébergement et stores : `docs/ADMIN_CHECKLIST.md`.
- Surfaces de monétisation : `docs/MONETISATION_SURFACES.md`.
- Opportunités : `docs/MONEY_HUNT_OPPORTUNITIES.md` (entrées non revérifiées : DECLARED).
- Mesure : `docs/MONTH1_METRICS.md`.
- Veille et provenance : `omega-veritas/README.md`.
- Trading V8, seuils de rejet (DD > 12 %, < 20 trades insuffisants, etc.), Risk Gate (« UNKNOWN ne devient jamais PASS ») : dossier ChatGPT, HISTORICAL. Run `v8-mue45ohc` du 2026-09-23 : couverture 85,7 %, REJECTED_BY_COVERAGE, SANDBOX_ONLY. Aucun candidat démontré.

## 17. CHANGELOG

| Date | Acteur | Changement | Source |
|---|---|---|---|
| 2026-09-28 | Claude | Création du registre à partir du dossier ChatGPT (49 points + addendum), dédupliqué et confronté aux sources | GitHub, production RME, AppDeploy, conditions officielles |
| 2026-09-28 | Claude | Révision d'exposition publique (1) : retrait des informations personnelles et des procédures d'accès, coûts non vérifiés passés en UNKNOWN, C-001 formulé comme vérification de conformité | relecture ChatGPT / OWNER |
| 2026-09-28 | Claude | Révision d'exposition publique (2) : nom du propriétaire remplacé par OWNER, montants financiers remplacés par des états, données commerciales de Nova Presta généralisées (U-002/U-003 fusionnées dans U-001) | relecture ChatGPT / OWNER |

## 18. VERIFICATION PROTOCOL

1. Avant d'agir sur une ligne, revérifier sa source si `LAST_VERIFIED` date de plus de 7 jours.
2. Toute nouvelle affirmation entre en `DECLARED` ; elle ne devient `CURRENT` qu'avec une source datée.
3. Une contradiction reste ouverte jusqu'à sa preuve de résolution. On ne l'efface jamais en silence.
4. `UNKNOWN — evidence unavailable` est une réponse valide.
5. Classer chaque test : LOCAL / CI / PREVIEW / PRODUCTION / E2E / MANUAL / OBSERVED.
6. Aucune valeur secrète, aucune procédure d'accès, aucune donnée personnelle dans ce registre public.
7. Chaque mise à jour ajoute une ligne au CHANGELOG.
8. Le fichier reste court : il pointe vers la preuve, il ne la recopie pas.
