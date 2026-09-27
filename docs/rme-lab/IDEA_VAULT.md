# RME Idea Vault

Started 2026-09-27 from the product conversations (Tarek, ChatGPT « directeur produit », Claude). Scores: LOW / MEDIUM / HIGH / UNKNOWN, each with a factual reason. No invented figures.

Existing building blocks referred to below:

| Name | What it is | Where |
|---|---|---|
| Moments | Contract for a situation and its proposed actions | `lib/rmeMoments.ts` |
| Trust Layer | Provenance level of each answer | `lib/trust.ts`, `lib/hadakGuidance.ts` |
| Route Events | Contract for route events | `lib/routeEvents.ts` |
| Sports | Contract for sports events | `lib/sportEvents.ts` |
| Mon voyage | Phases of the trip, saved on the device | `TravelHub` + `lib/travel/*` |
| Router | Free AI providers + ledger | `lib/hadakAiRouter.ts` |

## Horizons

| Horizon | Content |
|---|---|
| NOW | Google Play: signed AAB, closed test (owner) |
| NEXT | Stabilise after the first testers: fix what the 12 testers report |
| MONTH 1 | Read `[hadak-intent]`: resolution rate per intent, the most frequent `generic` questions → new local answers |
| MONTH 2–3 | IV-001 Voice → Moment, IV-013 Road pack, IV-002 Planned breaks |
| MONTH 4–6 | IV-005 « Montre-moi », IV-007 Phase-aware Hadak, first partners (affiliate IDs) |
| YEAR 1 | IV-006 RME Family, IV-008 licensed events, iOS if Apple is paid |
| LONG TERM | IV-009 RME Première, IV-017 B2B API |
| R&D | `RADAR.md` |

## Entries

### IV-001 — Voice → Moment
- **Update 2026-09-27:** now **EXPERIMENT**. Contract `lib/tripFacts.ts` (`extractTripFacts`): a pure function, no AI, no network. It extracts only what the user said (FACT_USER); everything else goes to `unknown`. Covers FR, Latin-script Darija, NL, ES, IT, EN. Not wired into production.
- **Problem:** saying « Hadak, je rentre au Maroc samedi avec les enfants » today gets a text answer. Nothing is prepared.
- **Idea:** pull out the facts the user said: destination, date, family (`IntentConfidence: EXPLICIT`). Propose a « Voyage Maroc » Moment (trip, papers, weather on arrival day), confirm, then pre-fill the planner.
- **Inspiration:** voice assistants that turn a sentence into a structured task.
- **RME fit:** HIGH. This is exactly INTENTION → CONTEXT → MOMENT.
- **Feasibility:** MEDIUM. Browser speech-to-text already exists in Hadak. The date and destination can be pulled out with rules, without an LLM (`detectCity` exists). No date parsing exists yet.
- **Cost:** LOW. Local rules first, then the free router.
- **Legal:** LOW risk. Stays on the device, only user-provided facts, expiry.
- **Business:** MEDIUM. Leads naturally to ferry / transfer.
- **User value:** HIGH.
- **Status:** IDEA.
- **Smallest experiment:** a pure function `extractTripFacts(text)`, tested on 30 real sentences (FR / Darija), then measure the share of `trip` intents turned into a Moment.

### IV-002 — Planned breaks + fuel along the route
- **Problem:** « Tu arrives dans 2h10, il reste 18 % de carburant, une station 4 min après ta pause » requires the car's fuel level. **That data is not available** (UNKNOWN: no link to the vehicle).
- **Idea:** the reachable version. From the computed route, suggest a break about every 2 h, and the nearest stations to those points from OpenStreetMap.
- **Inspiration:** stop suggestions in GPS apps.
- **RME fit:** HIGH (RME Route).
- **Feasibility:** MEDIUM. The route geometry already exists. OSM querying (Overpass) is free but rate-limited, with usage limits to respect (UNKNOWN in production).
- **Cost:** LOW.
- **Legal:** OSM data under ODbL, attribution required.
- **Status:** IDEA.
- **Smallest experiment:** 3 fixed routes (Paris → Tanger, Bruxelles → Nador, Madrid → Algeciras), breaks computed offline, checked by hand.

### IV-003 — Route + Radio + Hadak (« 1 + 1 + 1 = 10 »)
- **Idea:** « 4 h de route : voici une radio marocaine, un podcast et deux pauses. »
- **Feasibility:** MEDIUM.
- **Legal:** UNKNOWN. Rights to relay radio streams are to be checked station by station. A link to the official player is always allowed. Embedding a stream is not, without agreement.
- **Status:** PARTNERSHIP / LICENSE REQUIRED for embedding. IDEA for links.
- **Smallest experiment:** a « Radios » list linking to official sites, shown when the planned route is longer than 3 h. Measure clicks.

### IV-004 — Education: explain, practise, check
- **Existing:** education mode (6 modes, 9 levels, hints first).
- **Idea:** a loop of explanation → one similar exercise → Hadak checks the answer.
- **Feasibility:** HIGH, via the existing router.
- **Cost:** LOW (free tokens, `maxTokens` capped).
- **Status:** BACKLOG.
- **Smallest experiment:** a « Je m'entraîne » button after an explanation. Measure the share of students who answer.

### IV-005 — « Montre-moi » (photo)
- **Idea:** photograph an exercise, a sign, a menu or a document; Hadak contextualises it.
- **Feasibility:** MEDIUM. Browser OCR exists (Tesseract.js, licence to check in `RADAR.md`). Vision models on a free plan: UNKNOWN.
- **Risk:** HIGH on documents (identity) and medical or mechanical diagnosis. No promise; the RME guide stays « à vérifier ».
- **Status:** EXPERIMENT (school exercises and menus only).
- **Smallest experiment:** OCR in the browser (no upload) on 20 exercise photos; measure the rate of usable text.

### IV-006 — RME Family
- **Idea:** one phone, several contexts (parent, child, grandparent) without an advertising account. Local profiles only.
- **Legal:** HIGH care needed. Minors mean GDPR and Play « Families » policy requirements.
- **Status:** BACKLOG (after the release).

### IV-007 — Hadak aware of the trip phase
- **Existing:** `TravelHub` knows BEFORE / ROUTE / MAROC.
- **Idea:** the « Et maintenant ? » suggestions change with the phase: before, papers; on departure day, route and breaks; in Morocco, local weather and prayer times.
- **Feasibility:** HIGH. Pure function `nextActionsFor(intent, lang, phase)`.
- **Status:** NEXT candidate once the first measurements are in.
- **Smallest experiment:** reorder the existing suggestions by phase; compare `hadak_next_action` before and after.

### IV-008 — Events with provenance and rights
- **Idea:** extend events with a **rights** axis separate from truth: `LIVE`, `LICENSED`, `RME_EXCLUSIVE` next to `OFFICIAL` / `COMMUNITY` / `INFERRED`.
- **Architecture:** a separate `rights` field, never mixed with `TruthLevel`.
- **Status:** IDEA. To add when the first event arrives, not before.

### IV-009 — RME Première
- **Idea:** every few months, a licensed event (match, concert, preview).
- **Rights to check each time:** territory, duration, support, streaming, mobile / web / TV, replay, advertising, monetisation.
- **Cost:** UNKNOWN (licences).
- **Status:** PARTNERSHIP / LICENSE REQUIRED.

### IV-010 — Contextual sponsorship without touching the truth
- **Idea:** a sponsor for a Moment (e.g. « Préparer le départ »), shown in a labelled block outside Hadak's answer.
- **Architecture rule:** the sponsored block never reads the answer text and never changes the suggestions.
- **Status:** IDEA. Current house ad: the book (`BookAd`), declared « Contient des annonces ».

### IV-011 — Useful recurring appointments (no casino)
- **Idea:** « 30 jours avant ton départ : vérifie ton passeport » (the rule already shown by the app: passport valid 6 months).
- **Feasibility:** LOW today. Notifications are neither implemented nor declared. Push needs an FCM project (free, ADMIN) and a new declaration.
- **Status:** BACKLOG.
- **Smallest experiment:** the in-app reminder already in `TravelHub` (countdown), measured before any push.

### IV-012 — RME Lab flag
- **Idea:** experiments behind an env variable (never on by default in production), to test a provider, an API or an interface without polluting users.
- **Feasibility:** HIGH.
- **Status:** BACKLOG, created with the first experiment.

### IV-013 — Road pack (offline)
- **Problem:** on the ferry and in some areas there is no network.
- **Idea:** before leaving, save on the phone the trip summary, the chosen crossing, the papers checklist and the emergency numbers.
- **Feasibility:** MEDIUM. The service worker already caches public pages. The trip summary is already in `localStorage`.
- **User value:** HIGH.
- **Status:** NEXT candidate.
- **Smallest experiment:** a « Mon trajet hors ligne » page reading `localStorage` only; test in airplane mode.

### IV-014 — Collective sports Moment
- **Idea:** a match becomes a shared moment (score, where to watch, reactions).
- **Risk:** HIGH. Moderating a chat has a cost; broadcast rights apply.
- **Status:** WATCH.

### IV-015 — Arrival at the port
- **Idea:** at Tanger Med / Nador, official links only (port, customs); never « officiel Marhaba » without a partnership.
- **Status:** IDEA. Official sources to list in `RADAR.md`.

### IV-016 — « Je suis bien arrivé »
- **Idea:** a prepared message (WhatsApp / SMS) the user sends themself to their family. No automatic location tracking.
- **Feasibility:** HIGH (native sharing via Capacitor Share, already present).
- **Status:** BACKLOG.

### IV-017 — B2B API / licensed data
- **Idea:** expose the Europe ↔ Maroc route calculations (already computed, `lib/data/routePages.json`) to partners.
- **Status:** LONG TERM. Depends on audience and ODbL (OSM data).

### IV-018 — Close the « generic » gap
- **Problem:** unrecognised questions go to the AI or offline.
- **Idea:** every month, turn the 5 most frequent `generic` themes (read in `[hadak-intent]`, without the question text) into local answers or new intents.
- **Feasibility:** HIGH.
- **Status:** MONTH 1.
- **Measure:** resolution rate per intent before and after.

### IV-019 — Limite de débit partagée entre instances
- **Problème :**
  - Sur Netlify, le compteur mémoire de `proxy.ts` ne tient que sur une instance.
  - La règle native (Edge Functions) est déployée, mais son effet n'a pas été observé le 27/09/2026.
- **Idée :** compteur par IP dans Netlify Blobs, ou un autre stockage gratuit, lu par le proxy pour `/api/hadak` et `/api/faical`.
- **Faisabilité :** MOYENNE.
- **Coût :** UNKNOWN (quotas Blobs du plan gratuit).
- **Statut :** BACKLOG. À faire seulement si la règle native reste inactive ET si des clés IA sont posées.
- **Plus petite expérience :** lire les logs de validation de la règle native avant tout code.


### IV-020…023 — Test Lab (digital twin)
- **Update 2026-09-27:** now **EXPERIMENT**. The 4 scenarios live in `lib/lab/scenarios.ts`, tested by `__tests__/labScenarios.test.ts`: 16 tests, including 6 languages and adversarial cases. Martil exists only in the Lab (`LAB_EXTRA_DESTINATIONS`); `MOROCCO_CITIES` is unchanged.
- **Idea:** an isolated environment that plays fake users through the chain intent → journey → offers → recommendations → clicks. No real data, no production calls.
- **Starting scenarios:**
  - IV-020: Paris → Taza by car;
  - IV-021: Paris → Martil with family;
  - IV-022: Conakry → Casablanca → final destination (Morocco as a hub);
  - IV-023: France → Omra (official sources only).
- **Adversarial cases:** missing data, stale price, removed offer, API down, contradicting sources, bad translation, fake owner, changed formality, partner unavailable.
- **Pass criterion:** the system fails cleanly (UNKNOWN / UNVERIFIABLE / ABORT) and never invents.
- **Feasibility:** MEDIUM. Starting point: extend the existing Jest suite with scenario tests on `detectIntent`, `nextActionsFor` and `provenanceOf`.
- **Status:** BACKLOG. First useful step once IV-001 (voice/text → intent) exists.
- **Framework:** `NORTH_STAR.md`.
