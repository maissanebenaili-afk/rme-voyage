# RME AI Control Plane

RME AI Control Plane is the repository-native orchestration layer for autonomous engineering work.

## Principle
GitHub is the shared bus and source of truth. Agents are workers, not authorities. Their claims are evidence only when backed by repository changes, tests, CI results, or reproducible artifacts.

## State machine
QUEUED -> DISPATCHED -> RUNNING -> RESULT_READY -> VERIFY -> REVIEW -> APPROVAL -> MERGED
Terminal states: FAILED, BLOCKED, REJECTED.

## Agents
- Jules: primary autonomous implementation worker.
- OpenHands: independent implementation/review worker.
- Additional agents/models can be added through adapters without changing the mission contract.

## Safety defaults
- No direct writes to main by agents.
- Implementation occurs on branches and PRs.
- Secrets stay in GitHub Actions Secrets.
- Agent output is never treated as proof by itself.
- CI is the factual gate.
- Human approval remains required for irreversible, commercial, privacy, financial, or production-impacting actions until a stricter policy is explicitly validated.

## First version
The first control-plane workflow accepts a mission through workflow_dispatch, sends the same bounded mission to Jules and, when configured, OpenHands, and publishes the resulting session identifiers as workflow artifacts. This deliberately starts as a dispatch-and-observe layer; automatic merge is not enabled.

## Required secrets
- JULES_API_KEY for Jules.
- OPENHANDS_API_KEY for OpenHands.
- A missing OpenHands key does not block Jules execution.

Jules exposes a REST API and an official GitHub Action. OpenHands Cloud exposes a REST API for starting repository conversations. Both can therefore be controlled from GitHub Actions while GitHub remains the durable coordination layer.