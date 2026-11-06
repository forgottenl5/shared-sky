# Real Houston wind: does it break height sharing or the plan check? (written 2026-10-24 before any study run)
Status: behaviour model of planned operations. Not a weather-operations or safety assessment.

## Why
Every run so far is in still air. Wind does not move drones off their paths or heights (they correct), but it changes ground speed, so drones arrive at points earlier or later than planned. Two questions: (1) does the height-sharing result survive real wind? (2) a plan check that books airspace by time — does it still work if it is planned in still air and flown in wind?

## Data
Open-Meteo historical forecast, Houston (29.77, -95.35), 2025, hourly: wind at 10, 80, 120 and 180 m, direction at 80 and 120 m (data/openmeteo_houston_2025.json, founder download 24 Oct 2026; 8,760 hours; mean 4.7 m/s at 80 m, 5.6 at 120 m). Three study hours, chosen by rule (planned/wind.js `studyHours`): the daytime hours (13:00–03:00 UTC) closest to the 50th, 90th and 99th percentile of 120 m wind speed: p50 2025-01-15 15:00 UTC (5.52 m/s), p90 2025-01-19 01:00 UTC (9.36 m/s), p99 2025-03-05 02:00 UTC (12.94 m/s). Each run holds one hour's wind profile for its whole 3 hours.

## Wind model (planned/wind.js)
Paths and heights unchanged. Each segment with horizontal motion is re-timed by ground speed with the drone crabbing to hold its track: g = w_along + sqrt(V² − w_cross²), V = the segment's planned airspeed. Speed interpolated linearly in height between 10/80/120/180 m; direction from 80 m below 100 m, 120 m above. Vertical and hover segments keep their durations. Later segments shift with the earlier ones. Not modelled: companies re-planning with a wind forecast (they likely do), gusts, battery limits, wind-related cancellations.

## Layout and arms
Lab build-out (research cfg: 44 km square, 12 × 12 km counted zone, Houston mix, sites every d = 4 and 3 km), seeds 1–3. Heights A0 Omaha profile and A2 allocation. Wind W0 still, p50, p90, p99. For each run: (a) cross-company meetings flown with no plan check; (b) plan check run on the still-air plan (30 m cells, ±5 s, 10 m vertical, the PROC check), accepted plans then flown in the wind; meetings counted. 48 runs.

## Predictions (wide meetings, 30 m / 10 m, pooled over seeds)
- **W1:** With no plan check, A2's cut vs A0 under p90 wind is within 5 points of its still-air cut, at d = 4 and at d = 3. PREDICTION: holds (heights do not change).
- **W2:** A still-air plan check flown in p50 wind leaves >= 50 % of the no-check meetings (A0, at d = 4 and at d = 3). PREDICTION: holds (5 m/s shifts arrival times by tens of seconds against a ±5 s booking).
- **W3:** A0's after-check meetings (both d pooled) rise with wind: p50 < p90 < p99. PREDICTION: holds.
- Reported: all counts, close meetings, A2 cuts per wind level, after-check share.

## Rules
No changes after the data is in; code committed before runs; deviations logged below.
- **K1:** zero wind leaves every segment duration within 1 s; a 10 m/s tailwind on a 2,640 m leg flown at 26.4 m/s gives 73 s.

## Deviation log
(none yet)
- (Appended after fingerprint 53d76a14….) K1 PASS: calm durations within 1 s; 10 m/s tailwind leg 73 s as expected. Note: this unit check was run once while writing the code, before the pre-registration text; it touches no study outcome.
