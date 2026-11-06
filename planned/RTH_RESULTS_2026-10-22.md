# Return-to-home and area outage: results (RTH_PREREG.md, fingerprint c44eda24…), 2026-10-22
K1–K2 passed. d = 3 and 4 pooled, seeds 19–21, paired with DEVIATE. Analysis script committed before the runs.

| Prediction | Result | Verdict |
|---|---|---|
| G1 RTH-120 >= 5x RTH-OWN per deviation and >= 10 total | 20 vs 1; ratio 20.0 | **PASS** |
| G2 RTH-OWN <= 1 per 100 deviations | 0.04 | **PASS** |
| G3 OUT-A0 >= 5x OUT-A2 and >= 10 total | 7 vs 2 | **FAIL** |

| Arm | events (deviations or held flights) | cross wide | cross close | per 100 events (wide) | d 4 / d 3 cross wide |
|---|---|---|---|---|---|
| RTH-OWN | 2419 | 1 | 1 | 0.04 | 0 / 1 |
| RTH-120 | 2419 | 20 | 4 | 0.83 | 9 / 11 |
| OUT-A2 | 134 | 2 | 1 | 1.49 | 0 / 2 |
| OUT-A0 | 140 | 7 | 0 | 5.00 | 0 / 7 |

## What it shows
1. **Return-to-home at a fixed 120 m is about 20× riskier than returning at the drone's own height** (G1, G2 PASS). The same 2,419 contingencies caused 20 cross-operator wide meetings (4 close) when the drones returned at 120 m, against 1 when they returned at their own cruise height. 120 m sits 5 m above Amazon's inbound 115 m, and the climb or descent to it crosses other operators' heights.
2. **The area-outage comparison was too small to decide** (G3 FAIL: 7 vs 2, against >= 10 and >= 5× required). Each outage caught only 21–26 drones (flagged before the runs).
3. **Exploratory observation (not registered):**
   - Under the allocation, drones held together in an outage met other operators 1.5 times per 100 held drones, against 0.08 per 100 for isolated holds in DEVIATE: about 18× more per drone.
   - A shared outage catches drones mid-climb inside other operators' heights, and stops many at once.
   - Counts are small (2 meetings); this needs its own study with more events.

## Correction (OUTAGE_RESULTS, 22 Oct 2026)
The exploratory "about 18× riskier per drone" observation was mostly an artefact: DEVIATE's isolated holds were diluted about 3× because most occurred outside the counted zone, and the outage count here was 2. A controlled study (OUTAGE) found no simultaneity effect. The RTH-120 vs RTH-OWN ratio (paired) is unaffected; absolute rates are understated about 3×.

## Superseded numbers (COUNTFIX, 23 Oct 2026)
Re-measured: RTH at 120 m is 10.7× [5.4–24] as risky as RTH at own height (96 vs 9 meetings in 6,235 events each), not 20×.

## Consequences
- **Contingency heights matter as much as cruise heights.** A common return-to-home height that ignores the operators' allocation brings back the cross-operator meetings the allocation removed. A rule of "return at your own allocated height" keeps them rare.
- Area-wide events (GPS outages) are a candidate risk the per-drone analysis misses.

## Limits
- Return-to-home heights and outage behaviour are assumed; operators' real contingency procedures are not public.
- 5 % contingency rate; one outage per run.
- Planned tracks only.
