# Headline rerun with review fixes, both metros (written 2026-10-25 before any study run)
Status: behaviour model of planned operations; no plan check; planned paths of different companies within 30 m horizontally and less than 10 m vertically (the "close call" of the pages), still air. Not a forecast or safety assessment.

## Why
An independent review (25 Oct, three reviewers: research, industry engineer, public) found that the page headline (sharing out heights cuts close calls by 71 % in Houston and 66 % in DFW, against Amazon at its best-sourced heights) rests on (a) 3 seeds with no interval, (b) counting that runs past the 2 h measured window (HOUREAL, DFWREAL, AMZSRC, AMZSRC_DFW never passed tEnd), (c) Poisson intervals that ignore seed-to-seed spread, and (d) a 10 m vertical threshold that the shared-out layers sit exactly at (layer gaps 10, 20 and 14 m), so the cut is conditional on 10 m being acceptable separation. This study reruns the headline layouts with those fixed and reports the cut as a function of the required vertical separation.

## Design
- Layouts exactly as HOUREAL (Houston: Amazon's 5 geocoded sites, 75 Wing, 65 Zipline; zone 68 x 68 km) and DFWREAL (DFW: 6 Amazon sites, 75 Wing, 75 Zipline at 400 a day; zone 80 x 80 km). Wing and Zipline sites random per seed, as registered there.
- Height arms (as HOUREAL / AMZSRC): A0 Omaha profile (Amazon 61 out / 105 back); S1 best-sourced (Amazon 69 out, back uniform 85-115); R high-return case, staff remark only (69 / 122); A2 shared out (Wing 46-71, Amazon 81 / 115, Zipline 101). Wing 46-91 and Zipline 101 elsewhere.
- Seeds 1-10 per arm and metro: 2 x 4 x 10 = 80 runs, 1 h warm-up, 2 h measured.
- Counting at 4 checks per second, **bounded to the measured window** (tEnd = warm + meas), horizontal 30 m, vertical thresholds 10 m (headline), 15 m and 20 m; also 15 m / 5 m ("very close"). The same run also counts the old unbounded way (10 m) to measure the effect of the window fix.
- Interval: 95 % percentile bootstrap over seeds (10,000 resamples, paired: the same seeds resampled for both arms; cut = 1 - sum(A2) / sum(other)). No Poisson intervals.
- Runner planned/headline2_run.js, analysis planned/headline2_analyze.py.

## Predictions (cut = A2 against the named arm, 10 m vertical, bounded window)
- **H1:** Houston, against S1: point estimate 60-80 % and bootstrap interval narrower than 25 points. PREDICTION: holds.
- **H2:** DFW, against S1: point estimate 55-80 %. PREDICTION: holds.
- **H3:** at 15 m vertical, the cut against S1 is below 50 % in both metros. PREDICTION: holds (the shared-out layers are 10-14 m apart).
- **H4:** bounding the window changes A0 counts by less than 10 % in both metros. PREDICTION: holds.
- **H5:** against R, 10 m: 15-45 % in both metros. PREDICTION: holds.
- Reported: per-hour rates with seed bootstrap intervals and seed ranges for every arm, metro and threshold; cuts against A0, S1 and R at 10, 15 and 20 m.

## What would change the pages
The pages will show the H1/H2 point estimates with their intervals, say plainly that the cut assumes 10 m between companies is enough, and show the 15 m and 20 m values next to it, whatever the predictions' outcome.

## Rules
No changes after the data is in; runner and analysis committed before runs; deviations logged below.
- **K1:** site counts as HOUREAL / DFWREAL; the bounded count never exceeds the unbounded count for seed 1, A0, both metros.

## Deviation log
(none yet)
- (Appended after fingerprint 4d645ab7…; pre-study check only.) K1 PASS: Houston 5/75/65, bounded 88 vs unbounded 89 (seed 1, A0); DFW 6/75/75, bounded 41 vs unbounded 43.
- (Appended during the runs.) Runs take about 205 s each (80 runs, about 2.3 h on 2 cores), longer than one background job may last. Added a RESUME=1 option to the runner that skips jobs already written; job control only, no change to any run's settings or output.
