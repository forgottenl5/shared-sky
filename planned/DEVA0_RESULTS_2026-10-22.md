# Off-plan drones at the filed heights: results (DEVA0_PREREG.md, fingerprint 09b1c586…), 2026-10-22
K1 passed; K2 passed after fix attempt 1 (check corrected, code unchanged; logged). Seeds 19–21, d = 3 and 4 pooled, paired with DEVIATE. Analysis script committed before the runs.

| Prediction | Result | Verdict |
|---|---|---|
| D1 F-HOLD >= 10 cross wide and >= 5x A2 per deviation (d 3+4) | 46 meetings; 23.0x | **PASS** |
| D2 F-LAND <= 10 cross wide (d 3+4) | 2 | **PASS** |

| Heights | HOLD: cross wide / close (per 100 deviations) | LAND: cross wide / close (per 100) | deviations | plan-check delayed flights (no deviations) | total delay (h) |
|---|---|---|---|---|---|
| A2 allocation (DEVIATE) | 2 / 0 (0.08) | 1 / 0 (0.04) | 2419 | 923 | 9.9 |
| A0 filed heights | 46 / 14 (1.90) | 2 / 1 (0.08) | 2419 | 4031 | 66.7 |

## What it shows
1. **Height allocation also protects against contingencies (D1 PASS).** The same 2,419 two-minute holds caused 46 cross-operator wide meetings, 14 of them close, at the filed heights. With the A2 allocation they caused 2 wide and 0 close: **23× fewer per deviation.** At the filed heights, a drone holding at 105 m or 61 m sits inside another operator's cruise height.
2. **Emergency vertical landings stay rare either way (D2 PASS):** 2 vs 1 meetings. A descent crosses every band whatever the allocation, and only for seconds.
3. **The filed heights also cost far more delay under the plan check:** 4,031 vs 923 delayed flights and 66.7 vs 9.9 hours (4.4× and 6.7×). The plan check has to separate in time what the allocation separates in height.

## Correction (OUTAGE_RESULTS, 22 Oct 2026)
Absolute per-deviation rates are understated about 3× (most deviations fell outside the counted zone); the 23× ratio between filed heights and allocation (paired) is unaffected.

## Superseded numbers (COUNTFIX, 23 Oct 2026)
Re-measured at 4 checks per second with in-zone incidents and 95 % intervals: filed heights are 9.4× [6.3–14.7] as risky per hold as the allocation (245 vs 26 meetings in 6,241 / 6,235 holds), not 23×.

## Consequence
Height allocation inside filed bands is not only a planning convenience. It cuts plan-check delays by about 4–7× and cuts cross-operator meetings after a drone stops unexpectedly by about 20×. Both come from the same 4 m clash in the operators' own filings.

## Limits
- Deviation rate assumed (5 %).
- Only holds and vertical landings.
- Planned tracks only; one priority rule.
