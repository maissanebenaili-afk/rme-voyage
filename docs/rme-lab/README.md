# RME Lab

The permanent R&D space for RME. It is invisible to users and never touches production without passing the gate below.

| File | Role |
|---|---|
| `IDEA_VAULT.md` | Every idea, with its status. An idea is never deleted: it changes status |
| `RADAR.md` | Global Innovation Radar: mechanisms, open-source building blocks and data sources observed worldwide, each checked against its source |

## Cycle

```
OBSERVE → FILTER → VERIFY → CLASSIFY → SMALLEST PROTOTYPE → MEASURE → INTEGRATE (or not)
```

## Absolute rules

- `UNKNOWN ≠ TRUE`, `UNKNOWN ≠ FALSE`. An unverified licence, price, free quota or metric stays **UNKNOWN**. An idea stays **IDEA**.
- Take inspiration from a mechanism, never copy code, a brand or content.
- A free component is never critical by that fact alone: check licence, maintenance, security, discontinuation risk.
- **Truth Layer ≠ Monetization Layer.** A partner or advertiser never changes an answer, its provenance or the order of the facts. Sponsored content is shown separately and labelled.
- No action with consequences without confirmation: UNDERSTAND → PROPOSE → CONFIRM → ACT.
- Priority stays `STORE → STABILIZE → MEASURE → LEARN → ITERATE`. The Lab never delays the release.

## Entry gate for production (the « final test »)

An idea goes from EXPERIMENT to production only if every answer is written down:

| Question | Expected answer |
|---|---|
| User | Real usefulness, in which situation? |
| Innovation | New, or a copy? |
| Differentiation | Why RME does it better? |
| Architecture | Fits INTENTION → CONTEXT → MOMENT → NEXT ACTION? |
| Data | Reliable source, with its provenance level? |
| AI | Is an LLM really needed (local first)? |
| Cost | Actual cost at 0 users, 1 000 users, 10 000 users (measured or UNKNOWN)? |
| Legality | Right to use data / content / brand? |
| Security | What can go wrong? |
| Measurement | Which signal says it works (see `docs/MONTH1_METRICS.md`)? |
| Business | Value created without degrading the experience? |

## Routing rules against feature creep

| Situation | Status |
|---|---|
| Great idea, useless now | `BACKLOG` |
| Threatens stability | `DO NOT TOUCH PRODUCTION` |
| Needs rights | `PARTNERSHIP / LICENSE REQUIRED` |
| Needs the owner's identity, money or signature | `ADMIN ACTION REQUIRED` (see `docs/ADMIN_CHECKLIST.md`) |
| Promising, not validated | `EXPERIMENT` |
| Only an idea | `IDEA` |
