# RME Continuity Test Protocol V0

**Status:** LAB / experiment design. No product or commercial conclusion.

## Objective

Test the smallest falsifiable version of the hypothesis:

> Persistent journey state can reduce user effort and unnecessary reconstruction while preserving correctness and uncertainty honesty.

Compare the same 10 scenarios in three modes:

1. **General AI / short prompt** — only the current user message.
2. **RME stateless** — current message + current public/context data, without stored journey state.
3. **RME stateful** — current message + stored journey state + previously verified actions.

This is a comparison of observable behavior, not a ranking of assistants.

## Controlled protocol

For each participant:

1. Give the same scenario starting state.
2. Show only the scenario's new message/event.
3. Do not reveal which mode is being tested.
4. Run the three modes in randomized order.
5. Give each mode the same maximum interaction budget.
6. Record the first safe/useful next action, not the most verbose answer.
7. Score immediately before discussing the result with the participant.

Recommended V0 sample: **5 participants × 10 scenarios × 3 modes = 150 observations**.

If fewer observations are available, report the exact count. Never extrapolate.

## Primary measurements

For every observation record:

- context facts repeated by the participant;
- clarification questions before a safe/useful next action;
- distinct searches requested;
- actionability (0 answer / 1 suggested action / 2 actionable next step);
- state continuity (0 lost / 1 partial / 2 preserved);
- change detection (0 missed / 1 noticed / 2 correctly changes next action);
- uncertainty honesty (0 invented/overconfident / 1 caveated / 2 explicitly bounded);
- unnecessary interruption (0/1);
- user effort (low/medium/high);
- time-to-first-useful-action, if measured consistently.

## Primary outcome

Do not define a “moat” threshold in advance.

First calculate, by mode:

- median context reconstruction;
- median questions;
- median searches;
- median time-to-first-useful-action;
- distribution of actionability;
- distribution of continuity/change-detection scores;
- rate of uncertainty failures;
- rate of unnecessary interruptions.

Then inspect whether the stateful mode produces a **repeatable reduction in user effort without increasing correctness/uncertainty failures**.

## Failure gates

The hypothesis is weakened if statefulness:

- causes more invented facts;
- hides uncertainty;
- repeats stale state after a material change;
- creates notifications without a decision-relevant change;
- increases user effort;
- provides no measurable benefit over stateless behavior.

A single attractive demo is not evidence of a general advantage.

## Anti-cheating / red-team

- No scenario-specific answer may be hard-coded as if it were intelligence.
- No external fact may be presented as verified unless its source is actually available.
- No affiliate click, booking, payment or conversion may be simulated as real.
- No “best route” claim without uncertainty and assumptions.
- State must contain only facts actually established by the scenario.
- Completed actions must not be re-requested unless their validity could have changed.
- A silent user is not an invitation to generate content.
- Ambiguity must trigger the minimum question required to change the decision.

## Evidence levels

Use these labels in the result report:

- **[OBSERVED]** directly recorded human interaction.
- **[CALCULATED]** reproducible metric from recorded observations.
- **[SIMULATED]** synthetic or deterministic benchmark result.
- **[HYPOTHESIS]** interpretation not yet tested.
- **[UNKNOWN]** not measured.

Never upgrade [SIMULATED] to [OBSERVED].

## Exit criteria for V0

V0 is complete when:

1. the 10 scenarios have been run or explicitly marked untested;
2. every observation has a mode and scenario identifier;
3. no missing value is silently converted into zero;
4. failures are retained alongside successes;
5. a short result report identifies what survived and what was falsified.

The output of V0 is **a decision about the hypothesis**, not a marketing claim.
