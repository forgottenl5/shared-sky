# CALIB1: how well did my own registered predictions hold up? (written 2026-10-31 before any coding or tabulation by type)
Status: a look back at the project's own scorecard (67 studies, 353 scored predictions, 274 passed, 79 failed, as of 30 Oct 2026). It tests nothing about drones or air taxis; it tests the forecaster (me, with Claude), using the project's own rules.

## What I already know (so these are NOT scored as predictions)
- The overall pass rate, 274 of 353 = 77.6 %, and the per-study counts on the scorecard. Every registered prediction was written as "holds", i.e. at an implied confidence near 100 %, so the headline comparison (about 78 % against about 100 %) is already visible and is reported, not predicted.
- I have NOT tabulated passes by prediction kind, by miss side, by domain, or by time. The predictions below are made before that is done.

## Data and coding (fixed now)
One row per scored prediction, taken from each study's PREREG and RESULTS files in planned/ (the 67 scorecard studies mapped in tools/scorecard_map.json). Not scored predictions (4) are excluded. The count of rows and passes per study must equal the scorecard, or the discrepancy is reported before analysis. Coding is done from the text of those files, blind to my predictions below, by a coder (an independent agent) given only these rules; I spot-check 10 % of rows.
- kind (one only): `band` = the prediction named a numeric interval or a two-sided range (e.g. "60-80 %"); `bound` = a one-sided numeric limit ("at most 5 %", "at least 20 %"); `order` = a comparison, ranking or sign ("A is higher than B", "falls", "does not change"); `claim` = anything else (a qualitative statement or a check that something runs).
- outcome: pass or fail, exactly as the RESULTS file scored it.
- miss side, for failed `band` and `bound` rows only: `worse` = the measured value was less favourable to the system under test than I predicted (more conflicts, more delay, more noise, less benefit, less coverage); `better` = more favourable; `unclear` if neither fits. An `order`/`claim` row has no miss side.
- narrow: for failed rows, yes if the RESULTS file itself calls the miss narrow or marginal in words ("narrowly", "just", "close"), otherwise no.
- domain: `taxi` if the study is about air taxis (AIRTAXI_* and studies the RESULTS file says model air taxis), `drone` if about delivery-drone planning, `method` if about counting, tooling or sample-size checks.
- order in time: studies sorted by the date in their RESULTS file name, ties by study code. Early half = the earliest studies until the cumulative count first reaches 177 predictions (the study that crosses the line counts as early); late half = the rest.

## Predictions
- **C1:** `band` and `bound` predictions pass less often than `order` and `claim` predictions (pooled numeric pass rate below pooled non-numeric pass rate, by at least 5 percentage points).
- **C2:** among failed `band` and `bound` rows with a coded side (excluding `unclear`), more than half are `worse` (my numeric forecasts leaned optimistic about the system).
- **C3:** the pass rate in the late half is higher than in the early half by at least 5 percentage points (I learned).
- **C4:** the pass rate for `taxi` studies is lower than for `drone` studies (newer domain, less prior).
- **C5:** at least a quarter of failed rows (at least 20 of 79) are coded narrow.
- Reported without a prediction: pass rate with a 95 % Wilson interval for every group; the same split with the 4 not-scored rows counted as fails (sensitivity); a calibration line: observed pass rate against stated confidence (100 %), by kind.
- Outcomes are scored on the counts as coded; intervals are shown but a prediction passes or fails on its stated point comparison.

## Caveats written in advance
Predictions inside one study are not independent (same data, same model), so intervals are too narrow; this is a descriptive look, not a test. The coding of "worse/better" and "narrow" has judgement in it; spot-check disagreements are reported. The studies were not a random sample of questions: I chose which to ask.

## Rules
No changes after the coding is done; the analysis script is committed before it is run on the coded file; deviations logged below.

## Deviation log
(none yet)
