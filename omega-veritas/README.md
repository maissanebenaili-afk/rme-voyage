# OMEGA-VERITAS v12.1 — Source Adapter Proof Harness

- Declarative extractor registry; no switch/case.
- Public boundary uses `unknown`; internal records use `Record<string, unknown>`; no `any`.
- `sourceEventTimestamp` is paired with an explicit `sourceEventType`.
- All seven schemas remain `[SCHEMA_SYNTHETIQUE_TEST]`; no network calls are made.
- Monetary fixtures are already expressed in integer cents; no currency conversion is performed.
- 17 distinct Jest tests are defined in `tests/sourceAdapter.test.ts`.

This package deliberately does not claim Jest execution when dependencies are unavailable.
