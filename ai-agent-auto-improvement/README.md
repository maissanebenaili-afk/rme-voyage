# AI Agent Auto-Improvement

An agent that automatically **evaluates and improves another AI system using
live global data** — a self-improvement loop, not a chatbot.

This is a standalone project (unrelated to the RME Voyage travel app in the
rest of this repository). It lives in its own directory with its own
`package.json` so it can be extracted into its own repo later with no
changes.

## The idea

Most "AI improvement" is manual: someone notices a wrong or outdated answer,
edits a prompt or a doc, ships it. This project automates that loop:

```
            ┌─────────────────────────────────────────────────────┐
            │                  runImprovementCycle                │
            │                                                     │
 load ──▶ evaluate ──▶ pull global data ──▶ diagnose ──▶ patch ──▶ re-evaluate
 version   (baseline)   (live APIs, feeds,   (stale facts,  candidate  │
                          user feedback)       coverage gaps)          │
                                                                       ▼
                                                     accept (no regression)
                                                     or reject + log why
```

1. **Load** the current version of the target AI (a versioned JSON snapshot:
   system prompt + knowledge entries).
2. **Evaluate** it against a test suite (`Scorer`).
3. **Pull global data** from pluggable sources — a live public API, an RSS
   feed, a scrape, curated facts, or real user feedback/chat logs.
4. **Diagnose**: compare the AI's current knowledge against that data to find
   (a) facts that have drifted (a stale exchange rate, an old price) and (b)
   coverage gaps (test cases the AI still can't answer).
5. **Patch** a candidate version: rule-based fact corrections always; new
   knowledge entries via an LLM proposer when one is configured.
6. **Re-evaluate** the candidate and **accept it only if it doesn't regress**
   the eval score or pass rate. Every cycle — accepted or rejected — is
   appended to `data/history.json` with the evidence behind each patch.

Nothing here retrains model weights. It treats "the AI" as an auditable
document (prompt + knowledge base) and improves *that*, which is both safer
(every change has a diff and a reason) and cheaper than fine-tuning. Swap the
target for a real RAG/LLM agent and the loop, analyzer and version history
carry over unchanged.

## Quickstart

```bash
npm install
npm run improve   # run one self-improvement cycle
npm run report    # show cycle history
npm test          # unit + integration tests (no network required)
```

The first `improve` run seeds a demo "Morocco travel assistant" whose
currency and fuel-price knowledge is deliberately stale. It will:

- pull the live EUR→MAD rate from a free public API and fix the currency
  entry if it has drifted more than 2%,
- pull a diesel-price fact from `fixtures/facts.sample.json` (a stand-in for
  a real feed) and fix the fuel entry the same way,
- flag a coverage gap (a "do I need a visa" question with no matching
  knowledge entry) — and resolve it automatically if `ANTHROPIC_API_KEY` is
  set (see `.env.example`), otherwise just log it.

Run it again immediately and it's a no-op: facts are already fresh, so no
patches are generated.

## Project layout

```
src/
  types.ts                    Core data model (AgentVersion, Patch, GlobalDataFact, ...)
  target/agent.ts             The AI being improved (pluggable — swap for a real agent)
  eval/                       Scorer + evaluation runner
  data/
    globalData.ts             GlobalDataSource interface
    sources/
      liveCurrencyRate.ts     Real live data: EUR→MAD rate, no API key needed
      staticFacts.ts          Stand-in for any other feed (news, scrape, gov data)
  improve/
    analyzer.ts                Diagnoses stale facts + coverage gaps -> Patch[]
    proposer.ts                LLM-backed (or disabled) knowledge-entry drafting
    applier.ts                 Applies patches to produce a new candidate version
  store/versionStore.ts       File-based version history (data/versions, HEAD, history.json)
  orchestrator/loop.ts        Ties it all together: runImprovementCycle()
  seed/sample.ts               Demo target agent + test cases
  cli.ts                      `improve` / `report` commands
test/                          Vitest suite (fully offline)
fixtures/facts.sample.json     Sample "global data" fixture
```

## Extending it

- **New target AI**: implement anything with the same shape as
  `PromptKnowledgeAgent` (a `respond(query)` over an `AgentVersion`). The
  eval/analyze/patch/version machinery doesn't change.
- **New data source**: implement `GlobalDataSource.fetch(): Promise<GlobalDataFact[]>`
  — a government open-data export, an RSS digest, a scraper, a table of
  reviewed user-feedback facts. Add a line to `FACT_BINDINGS` in
  `analyzer.ts` mapping its `topic` to the knowledge entry it should keep
  fresh.
- **Real user-interaction data**: the "coverage gap" mechanism already
  generalizes to this — feed failing production queries in as `TestCase`s
  and the loop will draft (or flag) fixes for them.
- **Higher-fidelity scoring**: swap `HeuristicScorer` for an LLM-as-judge
  `Scorer` once a proposer/API key is available.
- **A real proposer**: `AnthropicProposer` calls the Anthropic Messages API
  directly (no SDK dependency). Point `ANTHROPIC_MODEL` at any chat model.

## Design choices worth knowing about

- **Regression-gated acceptance, not "always apply the LLM's idea."** A
  patch is only kept if the candidate's eval score and pass rate are no
  worse than the baseline's. Evidence-backed fact fixes are cheap to accept
  this way; speculative LLM-drafted entries have to actually clear the bar.
- **No fabrication without an explicit step.** When no LLM proposer is
  configured, coverage gaps are logged, never silently filled with made-up
  text.
- **File-based versioning on purpose.** `data/versions/*.json` +
  `data/history.json` are the audit trail. It's deliberately readable with
  `cat`/`jq`, not a database, so every change an "auto-improving" agent makes
  stays inspectable.
