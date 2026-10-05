# RME Competitive Gap — 2026-10-03

## Purpose

This note is a current market check, not a claim of exhaustive global prior art.

## Confirmed direct overlaps

### Tariq — Route, Ferry, Bled

Tariq is currently published on Google Play and the App Store. Its public store descriptions explicitly target the Moroccan diaspora driving to Morocco from France, Belgium or the Netherlands.

Publicly documented capabilities include:
- road-trip planning to Algeciras, Tarifa and Almería;
- ferry waiting-time reports from the MRE community;
- MRE-oriented hotels;
- fuel prices and EV charging;
- offline emergency/help information and customs guidance;
- convoy/family travel coordination;
- entry-form/OCR updates;
- Booking.com affiliate integration.

Therefore RME must NOT claim that these isolated capabilities are unique:
- MRE road-trip planner;
- ferry queue/community reports;
- offline help;
- MRE-friendly stops/hotels;
- convoy/community;
- OCR/customs assistance.

Sources:
- https://play.google.com/store/apps/details?id=app.tariq
- https://apps.apple.com/ma/app/tariq-route-ferry-bled/id6773486682

### Tanger Med Passenger Journey

Tanger Med Port Authority's official passenger application is available on Google Play and the App Store. The official port description documents:
- journey planning;
- departures/arrivals and real-time updates;
- boarding-card scanning;
- trip tracking;
- port navigation/guidance;
- nearby services;
- towing assistance;
- port traffic forecasts.

RME therefore must NOT claim generic port navigation, ferry status or port assistance as unique.

Sources:
- https://www.tangermed.ma/en/new-version-of-the-passenger-mobile-solution-tanger-med-passenger-journey/
- https://play.google.com/store/apps/details?id=com.tangermed.passengers

### Trekna

A current public website, trekna.com, positions itself as a Europe–Morocco MRE travel companion and publicly advertises:
- flight/car/train/ferry comparison;
- AI travel assistant;
- live Strait/port information;
- family budget calculation;
- community alerts;
- documents/customs guidance;
- safety information;
- multi-mode travel;
- an agentic logistics concierge concept.

This is a competitor signal requiring continued verification of actual production/store availability. Its marketing claims are not treated as proof of implementation.

Source:
- https://www.trekna.com/

## RME differentiation that remains defensible

RME should not compete by saying "we have more features."

The product proposition to build is:

> **RME understands the person's journey, not just the route.**

The differentiating product system is the combination of:
1. explicit user facts and constraints;
2. context-aware journey state;
3. one visible master action on a Dynamic Canvas;
4. transparent uncertainty/provenance;
5. multimodal Europe↔Morocco planning;
6. human-language interaction through Hadak;
7. safety/privacy/offline behavior;
8. contextual commercial offers that never alter the recommendation;
9. a reusable journey state that survives the transition from planning → travel → port → crossing → arrival.

This is a product/system hypothesis, not a patentability claim.

## Product consequence

RME should prioritize:
- a calm, human "companion" surface rather than an AI chatbot surface;
- fewer, stronger actions;
- a single next-best action with an explicit reason;
- family reassurance and recovery from uncertainty;
- flight + car + ferry + multimodal support;
- provenance and freshness visible where it matters;
- contextual monetization only after the user has understood the recommendation.

RME should deprioritize:
- generic chatbot features;
- generic MRE content already available elsewhere;
- claims of unique ferry/queue/convoy/offline functionality;
- fintech/payment ambitions;
- unofficial customs document generation.

## Competitive monitoring

Re-check Tariq, Trekna, Tanger Med Passenger Journey and new MRE travel products before every major positioning or store-listing change.

Last checked: 2026-10-03.


## 2026-10-05 evidence update — user friction, generalists, Marhaba

This section deliberately does **not** repeat the direct-competitor inventory above. It adds observed user complaints, current generalist lessons, and official 2026 Marhaba evidence.

### 1. User complaints are a warning against false precision

**ViaMichelin:** current public reviews repeatedly mention incorrect or stale fuel/toll estimates, confusing route presentation, map/display regressions and excessive friction after interface changes. At the same time, positive App Store reviews confirm that users value route variants, explicit toll costs, fuel-station prices and a clear route overview.

**Rome2Rio:** current public reviews show the same structural failure mode at larger scale: users value breadth and complex-journey planning, but complain when connections, prices, schedules or directness are inaccurate, stale, or difficult to configure. This reinforces RME's provenance rule: an estimate must be labelled as an estimate, a live value needs a timestamp/source, and an unavailable value should be UNKNOWN rather than filled with a plausible number.

### 2. Tariq: feature signal, not market proof

Tariq's public stores currently show **1+ Google Play downloads** and the App Store says there are not enough ratings/reviews for an overview. Its public feature claims include official fuel prices, community ferry queues, MRE-friendly hotels, offline help and convoy coordination.

Conclusion: these are useful competitive signals, but there is not enough public traction evidence to treat Tariq as validated market demand. RME should copy the *problem selection* only where it can produce stronger evidence and provenance.

### 3. Trekna: marketing claims must not be treated as evidence

Trekna currently advertises live Strait information, transport comparison and budget figures. Its page also displays user-style testimonials. These are **claims published by the product itself**, not independent evidence of accuracy, adoption, conversion or partner revenue. RME should therefore not reproduce any Trekna number as a benchmark unless independently sourced.

### 4. Marhaba 2026 changes the priority calculation

Official Moroccan sources report **4,137,594 MRE welcomed during Marhaba 2026**, with peaks near **80,000 arrivals/day** and **more than 87,000 departures/day**. The 2026 system used 26 reception sites, including Tanger Med, Tanger Ville, Nador, Sète, Marseille, Motril, Almería and Algeciras. During the peak phase, Tanger Med reported an average exit time of no more than 15 minutes on 2 August despite high traffic.

Important product implication: "port waiting time" is valuable but **seasonal and operationally sensitive**. Marhaba 2026 ended on 15 September 2026. RME must not present a Marhaba-derived value as a current live queue in October. A future port-status module should expose source + observed_at + freshness + coverage; outside the verified operating window it should say UNKNOWN/season ended rather than inventing a live state.

### 5. Revised opportunity ranking

| Opportunity | User value | Evidence quality today | Monetization | Decision |
|---|---:|---:|---:|---|
| Port status with timestamp/source | High seasonal | Medium/fragmented | Indirect | **LAB / source hunt** |
| Mid-route family hotel | Medium-high | High if official/affiliate data | Direct affiliate | **After production** |
| Official toll computation | High | High only if corridor/source coverage is verified | Indirect | **After production** |
| Station-level fuel price | High | Potentially high | Indirect | **LAB, no duplication without source/license check** |
| Crowd safety alerts | High | Low | Indirect | **REJECT for now** |
| Fixed travel-price claims | High | Often low/stale | Direct | **REJECT unless live verified quote** |

### 6. New strategic rule

Do not ask "does a competitor have this feature?" Ask:

> **Can RME deliver the same user outcome with stronger provenance, clearer uncertainty, lower interaction cost, and a measurable commercial next action?**

If not, do not build it merely to close a feature gap.

Last checked: 2026-10-05.
