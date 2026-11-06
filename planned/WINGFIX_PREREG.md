# Does the height-allocation result survive if Wing flies fixed heights? (study, written 2026-10-23 before any code or run)
Status: behaviour model of filed operations (planned tracks only, no plan check); counting at 4 checks per second (COUNTFIX). Not a forecast or safety assessment.

## Background
- Every study so far has drawn Wing's cruise height uniformly per flight: 46–91 m filed (A0), 46–71 m allocated (A2).
- Wing's real practice is not public. A fixed level, or a few levels, is more likely (RED_TEAM_REVIEW, researcher's point).
- Wing–Amazon overlap, and the allocation's benefit, may depend on this.

## Arms (d = 4 and 3 km; seeds 1–3, as COUNTFIX R-VALLOC)
Wing level L ∈ {46 m (150 ft), 61 m (200 ft), 76 m (250 ft), uniform}, all inside Wing's filed band.
- **A0-L:** filed heights for Amazon (out 61, in 105) and Zipline (101); Wing at L (uniform 46–91).
- **A2-L:** allocation for Amazon (out 81, in 115) and Zipline (101); Wing at min(L, 71) (uniform 46–71).

Flights from valloc.flights with these arm objects (same random draws; a fixed level uses the band [L, L]).

## Measures
- Cross-operator wide (30 / 10 m) and close (15 / 5 m) meetings per arm, with exact Poisson 95 % intervals.
- The allocation's cut, 1 − A2-L / A0-L.
- Meetings by operator pair; same-operator meetings.

## Predictions (d = 3 and 4 pooled)
- **W1:** For every Wing level, the allocation cuts cross-operator meetings by >= 65 % (wide) and >= 80 % (close). PREDICTION: holds.
- **W2:** Under the filed heights, Wing–Amazon meetings are highest with Wing at 61 m (the same height as Amazon's outbound) among the three fixed levels. PREDICTION: holds.
- **W3 (reported only):** same-operator Wing–Wing meetings by level; pair shares.

No criterion or parameter changes after the data is in; at most two fix attempts on a failing feature check; deviations logged below. The analysis script is committed before any study run.

## Feature checks (before the study)
- **K1:** The uniform arms reproduce COUNTFIX R-VALLOC's cross wide and close counts exactly (d = 4, seed 1).
- **K2:** In every fixed-level arm, every Wing cruise sample is at exactly L (or min(L, 71) for A2), and the other operators' flights are identical to the uniform arm's.

## Deviation log
(none yet)
- (Appended after fingerprint 15277214…; pre-study checks only.) K1 PASS (uniform arms = COUNTFIX R-VALLOC exactly: A0 85/39, A2 17/4 at d = 4, seed 1); K2 PASS (all Wing cruise samples at level; other operators unchanged).
