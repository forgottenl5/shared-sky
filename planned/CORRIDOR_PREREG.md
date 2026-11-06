# Registered-path corridors near sites (written 2026-10-24 before any run)
Status: behaviour model of planned operations. Part A is a geometry check at one real hub; part B a cross-company count. Not a noise or safety assessment.

## Why
Our one real-world check fails: straight routes put about 2.5 % of Richardson hub passes over a [street withheld] home; the resident's count implies 0.40–0.55. The hospital no-fly zone explains about a fifth (NFZ); where customers live explains none (RICHPOP). Amazon says each address has its own registered path that avoids restricted areas and major highways, and local reports describe a "drone highway". The remaining candidate is that paths share common segments near the hub. Two questions: (A) what corridor structure would be needed to reproduce the count; (B) does such routing change the cross-company headline?

## Model (planned/corridor.js; engine opt.via hook, default unchanged, test_lab_engine 9/9 after the change)
Each Amazon site has K departure corridors at bearings th0 + 360°·k/K. A customer uses the corridor nearest its bearing; the flight goes site → via point at distance D along that corridor → customer, and back the same way (Texas EA: "follows its predefined route back"). If the site–via or via–customer distance is 1,050 m or less, the flight flies straight. This is a stylised stand-in for registered paths, not Amazon's actual paths, which are not public.

## Part A — Richardson (planned/richcorr.js)
NFZ geometry exactly (hub, [street withheld] points, w = 100 m, max over the five points; zone radius R = 0 and 850 m, each leg detoured as NFZ), 20,000 uniform customers (seed 1). K = 2, 3, 4, 6, 8; D = 1, 2, 3 km.
- **aimed:** one corridor points straight over [street withheld] (bearing of its centre point, 21° from north) — the most favourable case for reproducing the count.
- **random:** 12 evenly spaced orientations; mean and max reported.
Predictions:
- **RC1:** aimed, K = 4, D = 2 km, R = 0: fraction >= 0.20. PREDICTION: holds (about a quarter of traffic uses each corridor).
- **RC2:** no aimed configuration with K >= 3 reaches 0.40. PREDICTION: holds (reaching the observed count needs about two corridors, one over the street).
- **RC3:** random orientation, K = 4, D = 2 km, R = 0: mean fraction <= 0.10. PREDICTION: holds.

## Part B — Houston real layout (planned/corridor_run.js)
HOUREAL exactly (5 geocoded Amazon sites, 75 Wing, 65 Zipline random, 68 × 68 km, filed caps, seeds 1–3), except Amazon flies corridors with K = 4, D = 2 km, orientation drawn per site and seed (stream seed + 4,242). Wing and Zipline straight, as before. Arms A0, R, A2 (heights as HOUREAL). Straight reference = the 12 HOUREAL runs (A0 315, R 89, A2 65 wide).
Predictions:
- **RB1:** A2 cuts A0's wide meetings by >= 65 %. PREDICTION: holds.
- **RB2:** A0 wide meetings with corridors are 0.7–1.3 × straight. PREDICTION: holds.
- **RB3:** A2 cuts R's wide meetings by <= 50 %. PREDICTION: holds.

## Rules
No changes after the data is in; code committed before runs; deviations logged below.
- **K1 (part B):** more than 80 % of Amazon flights (seed 1, A0) use a via point; Wing and Zipline flights identical to the straight run.

## Deviation log
(none yet)
- (After fingerprint 70a60cca…, before any study run.) K1 harness error: the check counted 15 segments for a via flight; the engine builds 13 (straight 11). Fix attempt 1: count 13. No engine or analysis change.
- K1 PASS after fix: 885 of 911 Amazon flights (seed 1, A0) use a via point; Wing and Zipline flights identical to the straight run.
