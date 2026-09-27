# RME North Star

*27/09/2026 — the product direction set by Tarek. It decides which features get built next; it is not a rewrite plan.*

## The promise

> **« Je vais où ? Je veux faire quoi ? Aide-moi. »**
> Ne pas demander à l'utilisateur de comprendre le système : faire comprendre le système à l'utilisateur.

The user sees one simple screen. Behind it, RME **orchestrates what already exists**: public data, APIs, partners, owners, local services. It does not rebuild Booking, Airbnb or Google.

```
EXISTING SOURCE → NORMALISE → CONTEXT → INTELLIGENCE → NEXT ACTION → CONFIRMATION → ACTION → MEASURE
```

## Target layers mapped to what already exists

The whole vision grows out of today's code, with no rewrite.

| Target layer | Already in RME | Missing (build only once a real need is measured) |
|---|---|---|
| **Intent Engine** | `detectIntent()` (Hadak), `[hadak-intent]`, `detectCity()` | One multilingual intent (FR / Darija / NL / ES / IT / EN / AR) extracting origin, destination, dates, travellers → IV-001 |
| **Context / constraints** | `lib/travel/*` (trip saved on the device, date), the checklist | Stated constraints: children, budget, transport mode |
| **Journey Engine** | `TravelHub` phases (Before / Route / Morocco), `RmeMoment`, « Reprendre ce trajet » | Chaining transport → accommodation → papers → money → SIM → arrival |
| **Data Graph** | OSRM route, EU fuel bulletin, Open-Meteo, AlAdhan, `routePages.json` | A single source entry with its licence (RADAR) |
| **Offer Graph** | `lib/partnerCatalogue.ts`, `lib/affiliate.ts`, money-transfer comparison | Direct owner offers (Taza, Martil) with BASIC / VERIFIED / PARTNER levels |
| **Verification** | `lib/trust.ts` (TruthLevel), Trust Layer « Pourquoi ? » | Check date per fact, stale data expiring |
| **Recommendation** | « Et maintenant ? » (`nextActionsFor`, always informational) | Suggestions that depend on the trip phase → IV-007 |
| **Event** | `lib/routeEvents.ts`, `lib/sportEvents.ts` | A rights axis separate from truth → IV-008 |
| **Measurement** | `docs/MONTH1_METRICS.md`, ledger, events | Retention, resolution per intent (after launch) |
| **Revenue Graph** | `partner_click` | `recommendation_shown`, `affiliate_shown`, `conversion_confirmed`. **Conversion and revenue = UNKNOWN until a partner confirms them** |

## Non-negotiable rules

1. **Predict, never invent.** Every piece of information carries one of these statuses:

   | Status | Meaning | Existing TruthLevel |
   |---|---|---|
   | FACT_USER | said by the user | — |
   | FACT_SOURCE | read from a source | `OFFICIAL` / `MEASURED` |
   | INFERENCE | deduced by RME | `INFERRED` |
   | ESTIMATE | estimate | — |
   | UNKNOWN | unknown | `UNKNOWN` |

   A deduction is shown as a deduction.
2. **Zero invention.** No invented price, availability, timetable, formality, visa, commission, partner, conversion, revenue or statistic. What is unknown is written UNKNOWN.
3. **Administrative matters** (visa, passport, entry rules, Hajj / Omra, health, safety): official source + check date + status. Otherwise: « Information à confirmer auprès de la source officielle ». RME does not replace an administration.
4. **« Vérifié » only after a real check.** AI puts an owner's listing into shape (title, translation, photo order) but never adds a sea view, pool, air conditioning, parking or bedroom that was not provided.
5. **No scraping of protected data.** For each outside source, name its basis: official API, authorised feed, partnership, affiliation, link, public data, simple reference.
6. **No partnership is assumed** (Royal Air Maroc or any other). RME's core depends on no single provider.
7. **Free first.** Use free options first: open source, public data, cache, fallbacks. A cost only comes in when it is backed by a measured value. Licence traps are listed in `ADMIN_CHECKLIST.md`: Open-Meteo, OSRM.
8. **Truth ≠ money.** Monetisation fits the intent, is labelled, and never changes an answer. Sensitivity increases in this order: information → recommendation → action → transaction. The more sensitive the step, the stronger the check.
9. **Security over sophistication.** UNVERIFIABLE or ABORT rather than a false but elegant answer.

## The 4-question filter (before any feature)

1. Which **real problem**?
2. Which **data / offer already exists**?
3. How does RME make it **simpler or better**?
4. Which **measurable value**?

Fewer than 4 answers → `BACKLOG`. **Build small, measure, prove, extend.** No microservices, queues or paid infrastructure without a demonstrated need.

## Execution rule for agents

Whatever is **decided, safe, reversible and in scope gets done without asking**, then tested and reported. A human is only asked for:

- identity, MFA, a secret;
- payment, a signature;
- a legal decision;
- anything irreversible or destructive;
- a choice that cannot be deduced.

Inspection, audit, tests, documentation and preparing a change never interrupt the owner.

## Verticals in view (ideas, see `IDEA_VAULT.md`)

- **MRE Europe ↔ Maroc**: the current core.
- **Accommodation / local services**: Taza, then Martil.
- **Morocco as a hub**: Africa ↔ Europe ↔ Middle East, origin → hub → destination.
- **Hajj / Omra**: official sources only.

Each one enters production only through the Lab gate (`README.md`).
