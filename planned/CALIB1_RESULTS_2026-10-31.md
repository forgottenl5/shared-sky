# CALIB1 results (31 Oct 2026): how well did my registered predictions hold up?

**Of the 353 predictions scored before this study, 274 held (77.6 %, 95 % interval 73-82 %); every one was written as "holds". Only 1 of the 5 predictions about my own forecasting passed (C2).** Run on `planned/calib1_coded.csv` by `planned/calib1_analyze.py`; full output in `planned/calib1_results_table.md`.

- **C1 FAIL** numeric predictions (bands and one-sided limits) passed 77.7 % (251 of 323) against 76.7 % (23 of 30) for comparisons and claims: no 5-point gap, in either direction.
- **C2 PASS** of the 56 failed numeric predictions whose miss could be placed, 37 (66 %) came out worse for the system than I predicted and 19 better; 16 could not be placed. My numeric forecasts leaned optimistic.
- **C3 FAIL** the late half held 77.3 % against 78.0 % early: no sign that I got better over the project.
- **C4 FAIL** air-taxi studies held 80.8 % (101 of 125), delivery-drone studies 74.7 % (162 of 217): the newer domain did better, not worse (intervals overlap).
- **C5 FAIL** only 8 of the 79 failures were called narrow in words by their own results files, not at least a quarter: the misses were mostly clear misses.

## Reading
- The forecast confidence was about 100 % and the hit rate about 78 %. I was overconfident by about 22 points on the project's own questions, with no learning visible over the project's ten days and no kind of prediction that I did better on.
- Treat the intervals as too narrow: predictions in one study share data and a model.
- 4 not-scored predictions counted as fails give 76.8 % (274 of 357).

## Checks and caveats
- Coding: three independent coders (agents) produced 353 rows whose counts match the scorecard in every study. A blind re-coding of a random 36 rows (10 %) agreed on outcome 36 of 36, on kind 35 of 36, on domain 35 of 36, and on miss side and narrow in every failed row sampled (9 of 9 and 10 of 10). Disagreements: AIRTAXI_ROUTE1 P6 (band or bound), SEEDS2 S3 (method or drone). Neither changes a verdict by more than one row.
- "Worse/better" and "narrow" carry judgement. Sixteen failed numeric rows are unplaced.
- The scorecard (275 of 358 with these five) counts these five predictions too.
- Not a random sample of questions; I chose what to ask.

## Deviation log
(none)
