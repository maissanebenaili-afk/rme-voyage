# RME Decision Capsule

Minimal replayable contract for important decisions.

Required fields:
- capsule_id
- created_at
- input_fingerprint
- engine_versions
- configuration_version
- evidence_refs[]
- risk_assessment
- decision
- explanation_reason_code
- commercial_state

Rules:
- no raw personal data in the capsule;
- evidence references are immutable identifiers, not copied provider payloads;
- commercial state is isolated from risk state;
- replay must use the same engine/config versions;
- a replay mismatch is an explicit diagnostic, never silently reconciled.
