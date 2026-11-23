# CURVE1 results (23 Nov 2026): the height-sharing cut over a grid of separation rules
Registration planned/CURVE1_PREREG.md (fingerprint in planned/CURVE1_PREREG.md.sha256; runner and analysis committed before any run; deviation D1, before any data: counter grid cell set to 50 m). K1 (every 30 m count equals HEADLINE2's) and K2 (counts never fall as a rule loosens) passed. 40 runs. Table: planned/curve1_results_table.md.

## Result in one line
**The 10 m rule does not flatter the headline: across horizontal rules of 20-50 m and vertical rules of 5-20 m the cut stays between 45 % and 84 %, and it is low only at 15 m vertical (55 % Houston, 45-48 % DFW), where Amazon's return height (115 m) and Zipline's (101 m), 14 m apart, start to count against each other.** 3 of 4 predictions passed; T1 (at least 80 % at 5 m) failed.

## Predictions
- **T1 FAIL** at 5 m vertical: Houston 62-69 %, DFW 65-74 % across horizontal rules (registered: at least 80 %). Even with a tight vertical rule, shared-out heights leave conflicts where drones climb and descend through other layers near sites; the best-sourced heights have few conflicts at 5 m to remove (17.5 an hour in Houston at 30 m).
- **T2 PASS** at every horizontal rule the cut at 15 m is lower than at 10 m and 20 m (Houston 69-74 / 55-56 / 67-68 %; DFW 72-73 / 45-48 / 60-61 %).
- **T3 PASS** at 10 m vertical the cut varies little with the horizontal rule: Houston 69-74 %, DFW 72-73 %.
- **T4 PASS** the lowest cut on the grid is 55 % (Houston) and 45 % (DFW).

## Reading (cut, shared out vs best-sourced Amazon; 30 m horizontal; 95 % intervals in the table)
| vertical rule | 5 m | 7.5 m | 10 m | 12.5 m | 15 m | 20 m |
|---|---|---|---|---|---|---|
| Houston | 66 % | 70 % | 72 % | 83 % | 55 % | 67 % |
| DFW | 70 % | 71 % | 73 % | 80 % | 45 % | 60 % |
- **The curve is not monotone, and the shape is set by the gaps between the shared-out heights** (Wing top 71 m, Amazon out 81 m: 10 m; Amazon back 115 m, Zipline 101 m: 14 m; Amazon out 81 m and Zipline 101 m: 20 m). Between 10 and 14 m the 10 m gap starts to count, but best-sourced Amazon (back anywhere in 85-115 m, through Zipline's 101 m) gains conflicts faster, so the cut peaks at 12.5 m (80-84 %). Just above 14 m the Amazon-back / Zipline pair counts against each other and the cut falls to 45-55 % (Amazon-Zipline is 715 of 924 shared-out conflicts at 15 m in Houston, against 74 of 192 at 10 m).
- **So the real question is not "is 10 m enough" but "what gap do the companies need, and is it at least 15 m between Amazon's return and Zipline's cruise".** If more than 14 m is needed, the shared-out plan should put Amazon's return further from Zipline (the filed bands leave little room above Zipline: Amazon's filed return band tops out near 115 m) or below it; this study did not test other layouts.
- The horizontal rule matters much less than the vertical one (T3).

## Limits
HEADLINE2's model (planned paths, no avoidance, no plan sharing, still air), layouts and seeds. Cuts are of planned conflicts between companies; absolute counts grow with every looser rule (K2).
