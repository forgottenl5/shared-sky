# GAP1: is the gap between company heights big enough for the plans? (written 2026-11-24 before any study run)
Status: new design test. Replaces the depot-sector idea (IDEAS_BACKLOG.md item 2) after a diagnostic, not a study, on one seed (Houston A2 and M1, DFW A2; INTENT2's check at N2): 90-92 % of Amazon's flights in the measured window were blocked at their first try, mostly in cruise (about 450-540 of 600-720 flights each way) and mostly by Zipline's cruise (543 / 635 flights), not by depot climbs and descents (50-140). Registered before any study run; pre-checks run after this file is fingerprinted.

## Why
The pre-flight check treats two plans as clashing in height when their height allowances overlap. With plans sized by the standard's 95 % rule at average GPS (INTENT2's N2: +-14 m in height), two company layers clash unless they are at least 28 m apart. Zipline flies at a fixed 101 m, and every layout tested so far puts Amazon 14-25 m below it. Inside the filed bands (Wing 46-91 m, Amazon 55-115 m, Zipline 101 m) the widest even spacing is Wing 46 m, Amazon 73.5 m, Zipline 101 m: gaps of 27.5 m, half a metre short of 28 m. This study asks how sharply waiting falls once plans are small enough to fit inside the gaps, and therefore how much better navigation must get.

## Layouts
- **G1 (new):** Wing 46 m, Amazon 73.5 m out and back, Zipline 101 m (gaps 27.5 / 27.5 m). Fits needs height allowances below +-13.75 m.
- **M1 (reference, LAYOUT1):** Wing 46-52 m, Amazon 76 m out and back, Zipline 101 m (gaps 24 / 25 m). Fits needs allowances below about +-12 m.

## Plan sizes (all +-10 m sideways, as INTENT2's N2; only the height allowance changes)
V14 = +-14 m (INTENT2's N2, average GPS); V135 = +-13.5 m; V125 = +-12.5 m; V115 = +-11.5 m; V10 = +-10 m. Plus N1 (best-site GPS, +-5 m / +-5 m). The smaller sizes stand for better height navigation than the project's average level; they are not tied to a measured GPS level.

## Parts (machinery unchanged: INTENT2's cost and risk runners, LAYOUT1's counter)
- **C, flights held** (windy hours 1-5): G1 at all six sizes, M1 at V135-V10 (M1 at V14 and N1 are INTENT2's rows). 2 metros x 5 seeds: 100 runs.
- **R, residual risk** (still air, RISK2 formula): G1 at N1 (best-site GPS), N2 (average GPS) and no check. 30 runs.
- **U, cut without plan sharing:** G1 against S1 (CURVE1, seeds 1-5), M1 from LAYOUT1 (seeds 1-5). 10 runs.
140 runs in all.

## Predictions (pooled over seeds 1-5, both metros each)
- **G1:** at V14, G1's Amazon held share is within 10 percentage points of M1's (gaps still under 28 m).
- **G2:** G1's Amazon held share at V135 is less than half its V14 value.
- **G3:** M1's Amazon held share at V135 is within 10 points of its V14 value, and at V115 is less than half its V14 value.
- **G4:** at V135, G1's held share of all flights is less than half of M1's.
- **G5:** at V135, G1's Amazon held share is still at least 20 % (Amazon still descends through Wing's and Zipline's heights at each customer).
- **G6:** at N2, G1's residual risk is lower than M1's (INTENT2: 0.0049 Houston, 0.0064 DFW per 100,000 flight hours).
- **G7:** without plan sharing, G1 cuts planned conflicts against S1 by at least 80 % at 30 m / 10 m.
- Reported, not predicted: held shares by company at every size, Wing's and Zipline's shares, risks and cuts at every vertical rule.

## Checks (K)
- **K1:** planned/test_coordx.js passes.
- **K2-K4:** the loaded runners reproduce stored rows exactly: INTENT2 M1 N2 cost (Houston seed 1) with V14; INTENT2 M1 N2 risk (DFW seed 1); LAYOUT1 M1 cut (DFW seed 1, 30 m / 10 m).
- **K5:** G1 flights cruise only at 46 m (Wing), 73.5 m (Amazon) and 101 m (Zipline).

## Limits stated in advance
Wing at a single height means many more Wing-Wing meetings, which this project does not count (no site exclusion; INTENT1 D1). Plans cover position error only. 5 seeds. The 27.5 m gap is at the edge of the filed bands; no operator has proposed it.

## Rules
Runner and analysis committed before any study run; no changes after the data is in; deviations logged below.

## Deviation log
(none yet)
- **D1 (2026-11-24, before any study run):** pre-check K4 looked up the first LAYOUT1 row for DFW M1 seed 1 without filtering to cut rows, picked a cost row and stopped with an error. Fixed by filtering to `part === 'u'`. The runs themselves are unchanged; K1-K5 then passed.
