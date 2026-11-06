# Real Dallas–Fort Worth layout at the filed caps: results (2026-10-23)
**Update 24 Oct (SEEDS, 10 seeds):** cuts 80 % [75–84] vs Omaha, 73 % vs Texas band, **33 %** vs the high-return case (the 3 % below, from 3 seeds, was noise). The "reported" case is now labelled the unsourced high-return case (AMZSRC).
Pre-registration: DFWREAL_PREREG.md, sha256 55f9bb81…, committed with runner and analysis (b0ff1e1) before any run. K1 passed. 12 runs (4 arms × 3 seeds), 2 measured hours each. No deviations.

## Result in one line
**The Houston pattern repeats in a second real metro.** Sharing out heights cuts close calls between companies by 76 % against the Omaha profile and 67 % against the Texas band, but **by almost nothing (3 %) against Amazon's reported heights**: if Amazon already flies as Richardson residents report, DFW's remaining close calls are not a height-layout problem.

## Cross-company meetings (80 × 80 km counted zone; 3 seeds × 2 h)
| Arm | Wide (30 m / 10 m) | Close (15 m / 5 m) | Wide per hour | Pairs (wide) |
|---|---|---|---|---|
| A0 Omaha profile | 133 | 61 | 22.2 | Amazon–Zipline 106, Amazon–Wing 24, Wing–Zipline 3 |
| T Texas band | 98 | 23 | 16.3 | Amazon–Zipline 63, Amazon–Wing 32, Wing–Zipline 3 |
| R reported | 33 | 8 | 5.5 | Amazon–Wing 19, Amazon–Zipline 11, Wing–Zipline 3 |
| A2 allocation | 32 | 3 | 5.3 | Amazon–Zipline 15, Wing–Zipline 11, Amazon–Wing 6 |

A2 cuts: vs A0 76 % wide / 95 % close; vs T 67 % / 87 %; vs R 3 % / 62 % (close counts 8 → 3 are small).

## Predictions
| Prediction | Result | Verdict |
|---|---|---|
| F1 Amazon in >= 60 % of A0 meetings | 98 % | **PASS** |
| F2 A2 cuts A0 >= 45 % | 76 % | **PASS** |
| F3 A2 cuts R <= 50 % | 3 % | **PASS** |
| F4 A2 cuts T >= 40 % | 67 % | **PASS** |

## Compared with Houston (HOUREAL, same method)
| | Houston | DFW |
|---|---|---|
| A0 wide per hour | 52.5 | 22.2 |
| Amazon in A0 meetings | 95 % | 98 % |
| A2 cut vs A0 / T / R | 79 / 71 / 27 % | 76 / 67 / 3 % |
DFW has fewer meetings mainly because Zipline's DFW filing is 400 flights a day per site against about 950 in Houston. The cut against the Omaha profile is nearly the same in both metros; the cut against reported heights is smaller in DFW. My random-layout DFW test (ROBUST, 50–54 %) underestimated the real-layout cut; F2's threshold was set from it.

## Limits
Wing and Zipline positions random; IAH1 missing (Amazon at 6/7 cap); STX3 and DAL3 1.4 km apart (same company, so no cross-company effect between them); 3 seeds; uniform customers (CENSUS showed this barely matters in Houston).
