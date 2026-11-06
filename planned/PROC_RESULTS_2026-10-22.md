# Phase 2b: procedures near sites — results (PROC_PREREG.md, fingerprint b51e199e…), 2026-10-22
Status: behaviour model of filed operations (planned tracks only), paired with VALLOC arm A2 (same sites, orders and seeds). Not a forecast or safety assessment.

## Feature checks
- K1, K3 and K4 PASS.
- **K2 FAIL** after two fix attempts: the keep-out router leaves 0.003 % of cruise samples inside foreign circles at d = 4 and about 0.1 % at d = 2.
- So P1 and P3 are indicative only, and B1, B4 and B5 are not scored (deviation log, decided before any study run).


## Predictions

| Prediction | Result | Verdict |
|---|---|---|
| B1 P1 cuts >= 40 % at d 4 and 3 | 39 % / 20 % | NOT SCORED (K2 failed); indicative misses |
| B2 P2 cuts >= 90 % at every density | 100 % / 100 % / 100 % (d 4/3/2) | **PASS** |
| B3 P2 delayed <= 5 % at d 4 and <= 15 % at d 2 | 1.5 % / 4.8 % | **PASS** |
| B4 P1 extra cruise <= 5 % at d 3 | 0.6 % | NOT SCORED (K2 failed); indicative meets |
| B5 P1 raises p99 exposure >= 20 % at d 3 | +13 % | NOT SCORED (K2 failed); indicative misses |

## Cross-operator planned meetings (pooled over seeds 1-3, central 144 km^2, 2 h)

| d | Arm | wide | change vs P0 | close | change vs P0 | same-operator wide |
|---|---|---|---|---|---|---|
| 4 km | P0 | 31 |  | 6 |  | 6065 |
| 4 km | P1 (indicative) | 19 | -39 % | 4 | -33 % | 6123 |
| 4 km | P2 | 0 | -100 % | 0 | -100 % | 6056 |
| 4 km | P3 (indicative) | 0 | -100 % | 0 | -100 % | 6132 |
| 3 km | P0 | 91 |  | 12 |  | 14809 |
| 3 km | P1 (indicative) | 73 | -20 % | 11 | -8 % | 15255 |
| 3 km | P2 | 0 | -100 % | 0 | -100 % | 14873 |
| 3 km | P3 (indicative) | 0 | -100 % | 0 | -100 % | 15237 |
| 2 km | P0 | 463 |  | 74 |  | 56668 |
| 2 km | P1 (indicative) | 294 | -37 % | 67 | -9 % | 64812 |
| 2 km | P2 | 0 | -100 % | 0 | -100 % | 56863 |
| 2 km | P3 (indicative) | 0 | -100 % | 0 | -100 % | 64788 |

## Intent check costs (P2, P3)

| d | Arm | flights checked | delayed | share delayed | mean delay of delayed (s) | p95 (s) | cancelled | delayed share wing / amazon / zipline |
|---|---|---|---|---|---|---|---|---|
| 4 km | P2 | 16597 | 244 | 1.5 % | 37 | 90 (max over seeds) | 0 | 1.5 % / 8.8 % / 0.9 % |
| 4 km | P3 | 16612 | 125 | 0.8 % | 33 | 60 (max over seeds) | 0 | 0.3 % / 6.6 % / 0.4 % |
| 3 km | P2 | 29174 | 678 | 2.3 % | 39 | 90 (max over seeds) | 0 | 3.0 % / 13.9 % / 1.2 % |
| 3 km | P3 | 29231 | 440 | 1.5 % | 38 | 90 (max over seeds) | 0 | 1.0 % / 13.1 % / 0.7 % |
| 2 km | P2 | 65003 | 3143 | 4.8 % | 45 | 150 (max over seeds) | 0 | 5.6 % / 32.3 % / 3.0 % |
| 2 km | P3 | 65275 | 1813 | 2.8 % | 46 | 150 (max over seeds) | 0 | 1.9 % / 26.7 % / 1.6 % |

## Keep-out costs (P1, P3; indicative, K2 failed)

| d | Arm | extra cruise pooled | wing | amazon | zipline | depth-cap hits |
|---|---|---|---|---|---|---|
| 4 km | P1 | 0.2 % | 0.2 % | 1.4 % | 0.2 % | 191 |
| 4 km | P3 | 0.2 % | 0.2 % | 1.4 % | 0.2 % | 191 |
| 3 km | P1 | 0.6 % | 0.4 % | 1.1 % | 0.6 % | 1347 |
| 3 km | P3 | 0.6 % | 0.4 % | 1.1 % | 0.6 % | 1347 |
| 2 km | P1 | 2.9 % | 2.8 % | 11.1 % | 2.7 % | 26554 |
| 2 km | P3 | 2.9 % | 2.8 % | 11.1 % | 2.7 % | 26554 |

## Ground exposure: distinct flights per day over 100 m cells > 300 m from any site (mean over seeds)

| d | Arm | median | p99 | max |
|---|---|---|---|---|
| 4 km | P0 | 148 | 355 | 536 |
| 4 km | P1 | 149 | 382 | 694 |
| 4 km | P2 | 149 | 355 | 536 |
| 4 km | P3 | 149 | 382 | 694 |
| 3 km | P0 | 288 | 496 | 675 |
| 3 km | P1 | 292 | 561 | 871 |
| 3 km | P2 | 288 | 496 | 675 |
| 3 km | P3 | 292 | 561 | 871 |
| 2 km | P0 | 651 | 960 | 1216 |
| 2 km | P1 | 684 | 1335 | 2240 |
| 2 km | P2 | 651 | 960 | 1216 |
| 2 km | P3 | 685 | 1335 | 2240 |

## What it shows
1. **Checking each other's filed plans before take-off (P2) removes every planned meeting between operators, at a small average cost.**
   - Flights delayed: 1.5 % at d = 4, 2.3 % at d = 3, 4.8 % at d = 2.
   - Mean delay of a delayed flight: 37–45 s. Worst seed's 95th percentile: 150 s. No flight was cancelled.
   - The 100 % cut is close to built in: the booking rule (neighbouring 30 m cell, < 10 m vertical, ± 5 s) is stricter than the meeting count. B2 passing mainly confirms the check works as built. The informative part is the cost.
2. **The cost falls unevenly.** Under "first filed goes first", Amazon is delayed 6–10 times more often than the others: 8.8 % of its flights at d = 4, 32 % at d = 2, against 1–6 % for Wing and Zipline. Its long climbing and descending ramps cross both other operators' heights, so it is the flight that usually has to give way. Any shared rule decides who pays for deconfliction, not only whether it happens.
3. **The site keep-out (P1) is weaker than predicted, and it moves the cost onto people on the ground** (indicative; K2 failed).
   - It cut meetings between operators by 20–39 %, against the ≥ 40 % predicted. The remaining meetings are mostly at customers, which a site rule cannot touch.
   - Same-operator meetings rose (up to +14 % at d = 2), because detours bunch an operator's own traffic.
   - The busiest ground cells got busier: the 99th percentile rose 8–39 % and the maximum 29–84 %. This is the Richardson corridor effect, reproduced: rings of traffic just outside each site.
   - Extra distance is small at realistic densities (0.2–0.6 %), but 11 % for Amazon at d = 2.
4. **Combining both (P3) halves the delays relative to P2 alone** (0.8 % vs 1.5 % at d = 4; 2.8 % vs 4.8 % at d = 2), at the price of point 3's ground concentration.

## Prediction scorecard
- B2 PASS. B3 PASS.
- B1: indicative miss. B4: indicative meets. B5: indicative miss (+13 % vs ≥ 20 % at d = 3). B1, B4 and B5 are not scored.

## Limits
- Planned tracks only.
- Delays count only conflicts in and near the central zone, so they are a lower bound.
- One booking rule, one priority rule (first filed) and one retry step (30 s).
- Exposure counts flights per 100 m cell at any height, scaled to a full day. It is not a noise level.
- The keep-out router has a known small leak (K2).

## Next
- Phase 2b answers the question it asked. Height allocation plus a shared plan check removes planned meetings between operators. The open design question is who gets delayed.
- A fairness variant (for example, priority by who is already airborne, or by cruise height) would need its own registration.
