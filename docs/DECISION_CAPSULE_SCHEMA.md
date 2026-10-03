# RME Decision Capsule

Minimal replayable contract for material decisions.

Required fields:
- capsuleId
- createdAt
- inputFingerprint
- engineVersions
- configurationVersion
- evidenceRefs[]
- riskAssessment
- decision
- explanationReasonCode
- commercialState

Rules:
- no raw personal data in the capsule;
- evidence references are immutable identifiers, not copied provider payloads;
- commercial state is isolated from risk state;
- replay requires the same engine and configuration versions;
- version drift is an explicit diagnostic, never silently reconciled.
