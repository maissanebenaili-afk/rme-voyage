# RME Intelligence : ce qui existe, ce qui manque — 2026-10-03

Document de concordance, écrit après relecture du code de `main` (`8454ce6`) et des documents `docs/rme-lab/`. **Aucune décision n'est prise ici.** Les noms « RME Intelligence », « Media Intelligence » et « Live Info » n'apparaissaient nulle part dans le dépôt avant ce document : ils servent ici de fil conducteur, rien d'autre.

États : `CODE` (existe et tourne ou est testé), `SPEC` (écrit seulement dans un document), `DORMANT` (code présent, aucun écran ne l'utilise), `HYPOTHÈSE`, `UNKNOWN`.

## 1. L'idée en une phrase

RME ne doit pas être un agrégateur d'actualités. Il doit transformer une information en quelque chose d'utile au voyageur, pour son trajet et son moment : **INFO → ALERTE → ACTION RECOMMANDÉE**, avec toujours la mention de ce qui est couvert et de ce qui ne l'est pas.

Chaîne visée (HYPOTHÈSE) : sources → collecte → déduplication → vérification → classification → pertinence pour l'itinéraire → flux ou alerte.

## 2. Briques existantes

| Brique | Où | État | Remarque |
|---|---|---|---|
| Niveaux de fiabilité `OFFICIAL`, `MEASURED`, `COMMUNITY`, `INFERRED`, `UNKNOWN` | `lib/trust.ts` | CODE, testé | Couvre déjà la vérification. |
| Événement de trajet (type, résumé, source, lieu, expiration) | `lib/routeEvents.ts` | **DORMANT**, testé (`routeEvents.test.ts`) | Aucun écran ne l'utilise, aucun appel réseau. |
| Événement sportif | `lib/sportEvents.ts` | DORMANT, testé | Même principe. |
| Moments : avant, pendant, après ; actions informatives ou à confirmer | `lib/rmeMoments.ts` | CODE, testé, utilisé par Hadak | C'est le moteur de contexte. |
| Phase du voyage et état sauvegardé | `lib/travel/*`, `journeyState` | CODE | Rattache l'information au moment du trajet. |
| Prochaine meilleure action à partir d'une phrase | `lib/lab/nextBestAction.ts` | CODE (Lab, non fusionné), testé | Extraction de faits depuis l'utilisateur, pas depuis un média. |
| Données lues en direct | `app/api/hadak/route.ts` | CODE | Météo, prière, scores, taux de change. Aucune donnée de route, de ferry ou de frontière. |
| Saisie vocale | `components/HadakAI.tsx` | CODE | Reconnaissance vocale du navigateur : la seule brique « audio vers texte » existante. |
| Fil « Infos voyage » | `components/NewsFeed.tsx`, `app/rss.xml` | CODE, **statique** | Quatre éléments écrits à la main, datés de janvier à juin. Ils ressemblent à du direct : à dater ou retirer. |
| Routeur d'IA | `lib/hadakAiRouter.ts` | CODE | Fournisseurs gratuits, journal des coûts. Gemini gratuit est interdit pour l'Europe (voir `docs/AUDIT_VALORISATION_2026-10-03.md`). |
| Veille et ingestion de sources (BOAMP, data.europa.eu, CORDIS) | `omega-veritas/` | CODE, **autre projet** | Modèle de collecte à réutiliser comme idée, pas comme code. |
| Détection de faits périmés depuis API, RSS, scraping | `ai-agent-auto-improvement/` | CODE, séparé de l'application | Même remarque. Tests non vérifiés. |

## 3. Idées déjà écrites dans `docs/rme-lab/`

| Réf. | Idée | Statut dans le document |
|---|---|---|
| RAD-11 | Signalements d'utilisateurs avec fraîcheur, confirmations et durée de vie (« attente port Tanger Med ~2 h, signalé il y a 40 min, 3 confirmations ») | COMBINE |
| RAD-12 | Cartes proactives selon le contexte | ADAPT |
| RAD-08 | Mode Voyage par étapes (maison, frontière, port, embarquement, arrivée) | STEAL-THE-IDEA |
| RAD-15 | Saisie vocale du navigateur | IMPROVE |
| RAD-16 | whisper.cpp dans le navigateur, modèles darija MIT | WATCH |
| RAD-23 | OCR (Tesseract.js) pour lire un billet de ferry | COMBINE |
| RAD-26 | Portail de transport espagnol (GTFS, NeTEx) ; ferry : **UNKNOWN** | ADAPT |
| RAD-28, RAD-29 | Opération Marhaba, ticket fixe de Tanger Med : **aucune donnée ouverte trouvée** | ADAPT (liens seulement) |
| IV-003 | Route + radio + podcast : lien permis, intégration sous accord | PARTENARIAT / LICENCE |
| IV-007 | Hadak qui connaît la phase du voyage | NEXT |
| IV-008 | Droits d'un événement, axe séparé de la fiabilité | IDÉE, « quand le premier événement arrive » |
| IV-013, IV-015 | Pack hors ligne ; arrivée au port | NEXT / IDÉE |
| COMPETITIVE_GAP | Un concurrent annonce informations du détroit et alertes communautaires | Signal à vérifier |

Rien n'est marqué « abandonné » dans les documents lus, à part RAD-17 (Vosk, « ignorer pour le darija »).

## 4. Ce qui manque

1. **Aucune source en direct pour la route, le ferry, la frontière** dans l'application. Les sources ouvertes réelles sont cartographiées dans `docs/CARTOGRAPHIE_SOURCES_LIVE_MEDIA_2026-10-03.md` : Espagne (DGT) et alertes météo France utilisables ; ferry, frontière et Maroc : rien d'ouvert.
2. **Le lien entre un événement géolocalisé et l'itinéraire** de l'utilisateur. `routeEvents.ts` a un lieu, mais rien ne le compare au trajet.
3. **Aucune ingestion d'articles, de vidéo ou d'audio** dans RME.
4. **Aucun cadre juridique** pour résumer des contenus protégés ni pour transcrire (YouTube l'interdit explicitement pour l'audio extrait).
5. **L'affichage de la couverture** : un fil qui ne dit rien faute de source, alors qu'un ferry est annulé, est pire qu'aucun fil.
6. **Un texte qui nomme l'ensemble**, c'est ce document.

## 5. Règles à garder

- Ne jamais présenter une donnée fictive ou ancienne comme temps réel (règle déjà dans le README).
- Un événement a toujours une source, un niveau de fiabilité et une date de fin (`expiresAt` existe).
- Jamais de recommandation justifiée par une commission.
- Les sources communautaires restent `COMMUNITY`, jamais `OFFICIAL`.
- Aucune nouvelle fonctionnalité avant un premier signal commercial réel (clics, puis conversions).

## 6. Prochaines expériences (rien n'est lancé)

Les expériences E1 à E5 sont dans le document de cartographie. Résultats partiels au 2026-10-03 : le flux espagnol est léger (106 Ko compressés, 0,54 s) et couvre bien l'Andalousie ; près d'un tiers de ses événements n'a pas de catégorie claire.

La plus petite suite utile, quand Tarek le décidera : afficher dans le Lab, pour un trajet Paris → Algésiras → Tanger, **ce qui est couvert et ce qui ne l'est pas**, sans rien promettre.
