# OMEGA-VERITAS v12.3-final-proof-2 — double provenance harness

- Three hash levels: raw bytes (`sourceContentHash`), canonical source JSON
  (`h_source_semantic`), canonical normalized payload (`h_normalized_semantic`).
- `opportunityId` = stable entity (`sourceName`, `externalId`);
  `versionId` = precise version (entity + both semantic hashes).
- Domain-separated hashes; strict JSON parser (duplicate keys, unsafe integers rejected).
  See [CANONICALIZATION.md](CANONICALIZATION.md).
- `validateChain` checks seals and links (internal consistency, not external immutability).
- All seven source adapters remain `[SCHEMA_SYNTHETIQUE_TEST]`; no network calls are made.
- Measurements: [RED_TEAM_MEASUREMENT.txt](RED_TEAM_MEASUREMENT.txt).

## Commands

```bash
npm ci                 # installs pinned devDependencies (package-lock.json)
npm test               # Jest, 78 tests
npm run typecheck      # tsc --noEmit over src + tests
npm run proof          # dependency-free: tsc build + node:test, 14 invariants
```

Without `node_modules`, the proof runner works with any global `tsc`:

```bash
tsc -p tsconfig.proof.json && node --test proof/crypto-proof.test.cjs
```
