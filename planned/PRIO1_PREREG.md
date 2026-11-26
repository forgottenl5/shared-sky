# PRIO1: when two companies' plans clash, who waits? (written 2026-11-25 before any study run)
Status: new study (IDEAS_BACKLOG.md item 3). Registered before any study run; pre-checks run after this file is fingerprinted.

## Why
In every plan-sharing study so far, the flight that files first keeps its plan and the later one waits (first come, first served, as in ASTM F3548 for ordinary flights of equal priority, as far as the NASA papers quoting it describe). That decides not only how much waiting there is but who does it: Amazon has 83-96 % of its flights held under most layouts. This study asks whether a different order changes the total, and how it shares the waiting between companies.

## Rules (planned/prio.js; tests planned/test_prio.js)
Plans are taken in 5-minute filing batches by planned take-off time; inside a batch, a rule sets the order; a flight checked earlier keeps its plan, later ones are delayed in 30 s steps (up to 20 minutes) or cancelled, as before.
- **FCFS:** first planned take-off first (today's rule; identical to the existing check).
- **ROT:** companies take turns going first; the company order rotates every batch.
- **SHORT:** shortest flight first inside the batch.
- **FAIR:** the company with the highest share of its flights held so far goes first in each batch.

## Design
INTENT2's cost runner (windy hours 1-5, plans on the previous hour's wind), cross-company checking. Two settings: **A2 at N2** (shared-out heights, plans sized by the 95 % rule at average GPS: +-10 m sideways, +-14 m in height) and **G1 at +-13.5 m** (GAP1's spacing just inside its edge). FCFS rows are INTENT2's and GAP1's (checked by K2-K3). 3 new rules x 2 settings x 2 metros x 5 seeds = 60 runs.

## Measures
Held share (delayed or cancelled) overall and by company; total waiting = sum of delays + 20 minutes for each cancelled flight; spread between companies = highest minus lowest company held share.

## Predictions (pooled seeds 1-5; each in both metros and both settings unless stated)
- **R1:** SHORT gives less total waiting than FCFS.
- **R2:** SHORT raises Amazon's held share (its flights are the longest).
- **R3:** ROT changes the overall held share by less than 10 % of FCFS's value (it changes who waits, not how many).
- **R4:** at A2 / N2, FAIR lowers Amazon's held share by at least 10 percentage points against FCFS (both metros).
- **R5:** FAIR narrows the spread between companies against FCFS.
- Reported, not predicted: every company's held share and mean wait under every rule; cancellations.

## Checks (K)
- **K1:** planned/test_prio.js passes (including: the batch path in take-off order equals FCFS).
- **K2-K3:** FCFS reproduces stored rows exactly: INTENT2 A2 N2 (Houston seed 1), GAP1 G1 +-13.5 m (DFW seed 1).
- **K4:** the batch path in take-off order equals FCFS on a real run (DFW G1 +-13.5 m seed 1).

## Limits stated in advance
Batching assumes plans are filed in 5-minute rounds; real services take plans continuously. No urgency classes (no public data on which deliveries are urgent). The check is this project's model, not any operator's or service's real system.

## Rules
Runner and analysis committed before any study run; no changes after the data is in; deviations logged below.

## Deviation log
(none yet)
