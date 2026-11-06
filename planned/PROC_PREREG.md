# Phase 2b: procedures near sites (study, written 2026-10-22 before any code or run)
Status: behaviour model of filed operations (planned tracks only), paired on HOUSTON2/VALLOC sites and demand (same seeds). Not a forecast or safety assessment.

## Background
- Diagnosis (planned/phase2b_diag.js, run before this file): under VALLOC arm A2, every remaining cross-operator meeting has one aircraft climbing or descending.
- At d = 3 km, about 60 % of them are another operator's aircraft cruising over a site while drones climb or descend there.
- Most of the rest are Amazon descending to or climbing from a customer through another operator's cruise height.
- RICHARDSON_CHECK (exploratory) showed that funnelling traffic concentrates overflights on the homes underneath, so every arm also reports ground exposure.

## Question
After height allocation (A2), which procedure near sites removes the remaining cross-operator meetings, and what does each cost (flight length, delays, concentrated overflights)?

## Arms (all use A2 heights; everything else is as VALLOC)
- **P0 — A2 only.** The baseline.
- **P1 — Site keep-out.** No operator cruises within 300 m of another operator's site centre. A cruise leg that would pass within 300 m of a foreign site is detoured around it via two waypoints 350 m from the centre (c - u*350 + n*350, then c + u*350 + n*350, on the side the leg already passes). This is applied recursively, at most 8 levels deep. A leg that starts or ends inside a foreign circle ignores that circle. Same-operator sites are not avoided. Climbs, descents, hovers and Amazon ramps are unchanged.
- **P2 — Intent check, first filed goes first** (in the spirit of ASTM F3548 operational intents; Wing and Flytrex already deconflict daily).
  - Flights are filed in order of their original start time.
  - Before take-off, a flight's planned 1-s samples are checked against the samples already accepted from other operators, inside the zone plus a 1 km margin.
  - A conflict means: the same or a neighbouring 30 m horizontal cell, vertical gap < 10 m, and time gap <= 5 s.
  - On a conflict, the whole flight moves 30 s later, up to 40 tries (20 min). If no slot is found, the flight is cancelled.
  - Accepted flights are booked. Same-operator conflicts are not checked.
  - Only flights that can reach the zone are checked. Delays therefore count only conflicts in and near the zone: a lower bound.
- **P3 — P1 plus P2.**

Densities d = 4, 3 and 2 km; seeds 1–3. Sites and orders are identical across arms.

## Measures
- Cross-operator planned meetings: wide (30 m / 10 m) and close (15 m / 5 m), in the central 144 km^2, by pair and phase.
- P1/P3: extra cruise distance per flight, by operator.
- P2/P3: share of flights delayed, mean and 95th-percentile delay of delayed flights, and cancellations.
- Ground exposure: distinct flights per day over each 100 m cell in the zone, at any height, for cells more than 300 m from every site centre. Reported as median, 99th percentile and maximum, scaled to a full operating day as in HOUSTON2.

## Predictions (pooled over seeds)
- **B1:** P1 cuts cross-operator wide meetings by >= 40 % vs P0 at d = 4 and at d = 3. PREDICTION: holds.
- **B2:** P2 cuts them by >= 90 % vs P0 at every density. PREDICTION: holds.
- **B3:** In P2, the share of zone-touching flights delayed is <= 5 % at d = 4 and <= 15 % at d = 2. PREDICTION: holds.
- **B4:** P1's mean extra cruise distance is <= 5 % at d = 3 (per operator, pooled). PREDICTION: holds.
- **B5:** P1 raises the 99th-percentile cell exposure by >= 20 % vs P0 at d = 3. PREDICTION: holds.
- **B6 (reported only):** P3 vs P2 delays (does a keep-out reduce delays?); close meetings; results at d = 2.

No criterion or parameter changes after the data is in; at most two fix attempts on a failing feature check; deviations logged below.

## Feature checks (before the study)
- **K1:** P0 through the new code equals VALLOC A2 exactly (d = 4 and 3, seeds 1–3, cross- and same-operator counts).
- **K2:** In P1, no cruise sample lies within 300 m of a foreign site centre, except on legs exempted because they start or end inside it. Depth-cap hits are reported.
- **K3:** In P2, an independent brute-force recheck of the accepted plan (d = 4, seed 1) finds 0 cross-operator conflicts under the booking rule.
- **K4:** In P2, each flight's track is identical to P0's, shifted by its delay, and delays are >= 0 and multiples of 30 s.

## Deviation log
(none yet)
- (Appended after the fingerprint b51e199e…, which covers the text above this log. Pre-study checks only; no study data had been produced.)
- K1 PASS (P0 equals VALLOC A2 exactly at d = 4 and 3, seeds 1–3). K3 PASS (0 cross-operator conflicts in the brute-force recheck at d = 4, seed 1; 5,754 flights, 0 cancelled). K4 PASS.
- **K2 FAIL** on first run: 293,880 cruise samples inside foreign circles at d = 4, and 93,589 depth-cap hits.
  - **Fix attempt 1:** waypoints that fall inside another foreign circle are pushed outward along n in 50 m steps, up to 2 km. This reduced it to 431 samples inside circles (0.003 %) and 58 depth-cap hits at d = 4; 12,149 samples (0.12 %) at d = 2.
  - **Fix attempt 2:** depth counts nesting only, with a hard cap of 64 detours per leg. No change at d = 4 (431 samples, 58 hits); 11,205 at d = 2. The theory was wrong.
  - Two attempts used: **K2 stands as FAIL.**
- **Consequence (decided before any study run):** P0 and P2 are scored normally. P1 and P3 are run with fix attempt 2's code and reported as indicative only. B1, B4 and B5 are NOT SCORED. B2 and B3 are scored on P2. A corrected keep-out router would need a new registration.
