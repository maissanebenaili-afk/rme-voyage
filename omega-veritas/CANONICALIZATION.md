# OMEGA canonical JSON v1 — contract

Implemented by `canonicalJson` and `parseStrictJson` in `src/core/cryptoIngestion.ts`.

This contract **matches the RFC 8785 (JCS) test vectors exercised in
`tests/doubleProvenance.test.ts`** (number serialization, key ordering). It is
**not claimed to be a certified RFC 8785 implementation**: no full conformance
suite has been run.

## Input (source documents)

| Rule | Behaviour |
|---|---|
| Encoding | UTF-8, `TextDecoder("utf-8", { fatal: true })`. Invalid byte sequences → `INVALID_UTF8`. |
| BOM | A leading UTF-8 BOM is stripped by `TextDecoder`: same `h_source_semantic`, different `sourceContentHash`. |
| Duplicate keys | Rejected (`JSON_DUPLICATE_KEY`), at any depth. Keys are compared after escape decoding: `"a"` and `"a"` are duplicates. |
| Integral numbers ≥ 2^53 in magnitude | Rejected (`JSON_NUMBER_UNSAFE_INTEGER`), whatever their spelling (`9007199254740993`, `1e20`). External numeric identifiers that must be preserved exactly have to be transmitted as strings. |
| Number overflow | `1e400` → `JSON_NUMBER_OVERFLOW`. |
| Non-integral numbers | Accepted as IEEE-754 doubles (lossy by nature). |
| `__proto__` key | Kept as an ordinary own key: objects use a null prototype. |
| Syntax | Standard JSON only (no trailing commas, comments, NaN, single quotes, leading zeros). |

## Output (canonical form)

| Rule | Behaviour |
|---|---|
| Object keys | Sorted by UTF-16 code units, recursively. Serialized directly, so integer-like keys follow code-unit order (`"10"` before `"9"`), not JavaScript property-enumeration order. |
| Arrays | Order preserved, never sorted. |
| Numbers | ECMAScript Number→String: `1`, `1.0`, `1e0` → `1`; `-0` → `0`; `1e21` → `1e+21`. |
| Strings | `JSON.stringify` escaping. Lone surrogates → `CANON_LONE_SURROGATE`. |
| Unicode normalization | **None.** NFC `é` and NFD `e◌́` are different values. |
| Accepted types | `null`, booleans, finite numbers, strings, arrays, plain objects. `undefined`, `NaN`, `Infinity`, `Date`, class instances → error. |

## Hash levels

| Field | Formula |
|---|---|
| `sourceContentHash` | `SHA256(raw bytes)`. Deliberately **not** domain-prefixed, so any third party can check it with `sha256sum`. |
| `h_source_semantic` | `SHA256(canonicalJson({ domain: "omega-veritas/source-semantic/v1", payload: parsedSource }))` |
| `h_normalized_semantic` | `SHA256(canonicalJson({ domain: "omega-veritas/normalized-semantic/v1", payload: normalized }))` |
| `evidenceHash` | domain `omega-veritas/evidence/v1`, payload `{ sourceUrl, sourceContentHash }` |
| `identityHash` / `opportunityId` | domain `omega-veritas/opportunity-id/v1`, payload `{ sourceName, externalId }`; `opp_` + first 32 hex |
| `versionHash` / `versionId` | domain `omega-veritas/version-id/v1`, payload `{ sourceName, externalId, h_source_semantic, h_normalized_semantic }`; `ver_` + first 32 hex |
| `currentHash` | domain `omega-veritas/envelope-seal/v1`, payload = envelope without `currentHash` |
| `economicStateHash` (BOAMP) | domain `omega-veritas/economic-state/v1`, payload = buyer, nature, deadline, departments, market types, awardees, lot estimates, recurrence. Wording is excluded: a reworded notice keeps its economic state |

Neither `capturedAt`, `sourceUrl`, `Date.now()`, randomness nor insertion order
enters `opportunityId` or `versionId`.

## Chain

- The first envelope has `previousHash = GENESIS_PREVIOUS_HASH` (`"0" × 64`).
- `validateChain` recomputes each seal and checks each link.
- **It proves internal consistency only.** Whoever controls the whole chain can
  rewrite and reseal it; a test demonstrates this. Immutability needs a
  `headHash` stored outside the protected storage (not part of Gate 0).

## Transport encoding

BOAMP responses are gzip-encoded by the server. `fetch()` decodes them: fixtures and
`sourceContentHash` cover the decoded body; `contentEncoding` is recorded in the capture record.

## Nested JSON

BOAMP's `donnees` field is JSON inside a string. `h_source_semantic` treats it as a string
(so its inner whitespace matters); the evaluator re-parses it with `parseStrictJson`.
