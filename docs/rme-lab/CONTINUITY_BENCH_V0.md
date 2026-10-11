# RME Continuity Bench V0 — 10 situations

**Status:** LAB / synthetic benchmark design. No field result is implied.

## Goal

Attack the hypothesis with the smallest useful comparison:

1. **General AI / short prompt:** receives only the user's current message.
2. **RME stateless:** receives the same message and current public data, but no prior journey state.
3. **RME stateful:** receives the current message plus the journey state and previous verified actions.

The question is not “which answer sounds better?”. The question is whether continuity produces a **materially different next action with less reconstruction/friction**.

## Scoring

For each scenario, record:

- **Context reconstruction:** number of facts the user must repeat.
- **Questions required:** clarification questions before a safe/useful next action.
- **Searches required:** distinct searches the user must perform.
- **Actionability:** 0 = answer only, 1 = suggested action, 2 = actionable next step.
- **State continuity:** 0 = lost, 1 = partial, 2 = preserved.
- **Change detection:** 0 = missed, 1 = noticed, 2 = correctly changes the next action.
- **Uncertainty honesty:** 0 = invented/overconfident, 1 = caveated, 2 = explicitly bounded.
- **Unnecessary interruption:** 0/1.
- **User effort:** qualitative low/medium/high.

No score is a product ranking. It is an experimental measurement sheet.

---

## S01 — Ferry tomorrow

**Initial state:** Paris → Tanger, car, 2 adults + 2 children, ferry tomorrow, documents not yet checked.

**New message:** “Je suis arrivé à Algésiras.”

**Expected continuity contribution:** location transition should change the relevant action from departure preparation to port/boarding context.

**Failure signal:** system asks the user to reconstruct the trip.

---

## S02 — Ferry cancelled

**Initial state:** Algésiras, ferry tomorrow, reservation confirmed.

**New message:** “La compagnie vient de m'envoyer une annulation.”

**Expected continuity contribution:** preserve route/family/vehicle context and switch from normal boarding actions to recovery options.

**Failure signal:** generic ferry advice with no awareness of the affected journey.

---

## S03 — Vehicle constraint appears

**Initial state:** France → Morocco, flexible date, family of four.

**New message:** “Finalement je prends la voiture.”

**Expected continuity contribution:** vehicle changes the feasible trajectory and relevant costs/actions.

**Failure signal:** continue recommending flight-only options or restart from zero.

---

## S04 — Document already verified

**Initial state:** Morocco trip, passport and vehicle documents.

**Previous action:** user marked documents verified.

**New message:** “Et pour demain ?”

**Expected continuity contribution:** do not ask to verify the same documents again; move to the next unresolved decision.

**Failure signal:** repeated checklist.

---

## S05 — Weather changes the decision

**Initial state:** route planned for a specific departure window.

**New message:** “Il y a une alerte météo sur mon trajet.”

**Expected continuity contribution:** connect the new information to the existing trajectory and identify whether the next action changes.

**Failure signal:** generic weather report disconnected from the journey.

---

## S06 — Arrival changes context

**Initial state:** Tanger → Taza, family + vehicle, arrival in Tanger.

**New message:** “Je viens de débarquer.”

**Expected continuity contribution:** switch from ferry/boarding state to inland continuation.

**Failure signal:** continue showing ferry preparation as the primary action.

---

## S07 — User goes silent

**Initial state:** ferry tomorrow, no unresolved high-risk item.

**Event:** no new user message.

**Expected continuity contribution:** silence should not create chatter. RME should only surface something if a verified change materially affects the next decision.

**Failure signal:** notifications/content generated merely because time passed.

---

## S08 — Ambiguous intent

**Initial state:** Paris → Morocco, several possible ports.

**New message:** “Je pars samedi.”

**Expected continuity contribution:** ask at most the minimum question needed to change the decision; do not invent destination, port, vehicle or passenger count.

**Failure signal:** false precision.

---

## S09 — Local problem during journey

**Initial state:** traveller in transit with vehicle.

**New message:** “J'ai un problème avec la voiture.”

**Expected continuity contribution:** preserve journey context while routing the user toward the appropriate local assistance category; do not pretend to diagnose the vehicle.

**Failure signal:** generic car advice that ignores location/journey state.

---

## S10 — Return journey

**Initial state:** Morocco stay complete; return France planned but date uncertain.

**New message:** “Je rentre finalement la semaine prochaine.”

**Expected continuity contribution:** reactivate the return trajectory without deleting the completed outbound history.

**Failure signal:** treat it as a brand-new trip or confuse outbound and return legs.

---

# Red-team rules

A system fails this benchmark if it:

1. invents a fact to avoid asking;
2. treats a simulated result as a verified external fact;
3. claims an affiliate action occurred when it did not;
4. gives a “best route” without exposing important uncertainty;
5. asks the user to repeat state that is already available;
6. generates an alert without a decision-relevant change;
7. turns every ambiguity into a long questionnaire.

# Success condition for V0

Do **not** set an arbitrary “application of the year” threshold.

First obtain paired observations from real or carefully controlled human testing. Then choose a pre-registered threshold based on observed baseline friction.

The first question is simply:

> **Does stateful continuity produce a repeatable reduction in user effort while preserving correctness and uncertainty honesty?**

If not, the hypothesis is weakened or abandoned.
