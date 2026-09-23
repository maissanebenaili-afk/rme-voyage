# OMEGA-VERITAS v12.4 — double provenance + first real schema

- Three hash levels: raw bytes (`sourceContentHash`), canonical source JSON
  (`h_source_semantic`), canonical normalized payload (`h_normalized_semantic`).
- `opportunityId` = stable entity (`sourceName`, `externalId`);
  `versionId` = precise version (entity + both semantic hashes).
- Domain-separated hashes; strict JSON parser (duplicate keys, unsafe integers rejected).
  See [CANONICALIZATION.md](CANONICALIZATION.md).
- `validateChain` checks seals and links (internal consistency, not external immutability).
- Gate 1: `DATA_EUROPA_HUB` is written against **real** responses of
  `data.europa.eu/api/hub/search/datasets/{id}`, captured byte-for-byte in
  `fixtures/real/data-europa/` with a capture record (URL, time, HTTP status, SHA-256).
  A real fixture is not a certified network integration.
- The seven original adapters remain `[SCHEMA_SYNTHETIQUE_TEST]`; `SOURCE_SCHEMA_STATUS`
  states each adapter's status in code. Production code makes no network calls.
- Measurements: [RED_TEAM_MEASUREMENT.txt](RED_TEAM_MEASUREMENT.txt).

## Commands

```bash
npm ci                 # installs pinned devDependencies (package-lock.json)
npm test               # Jest, 96 tests
npm run typecheck      # tsc --noEmit over src + tests
npm run proof          # dependency-free: tsc build + node:test, 17 checks
```

Without `node_modules`, the proof runner works with any global `tsc`:

```bash
tsc -p tsconfig.proof.json && node --test proof/crypto-proof.test.cjs
```

Real fixtures (network, run manually, never in CI):

```bash
node scripts/capture-data-europa.mjs fts 5fe3432f3a715b283f886b8b   # (re)capture
node scripts/capture-data-europa.mjs --check                        # report drift, writes nothing
```
