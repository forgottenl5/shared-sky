# Wind over many real hours (written 2026-10-24 before any study run)
Status: behaviour model of planned operations. Repeats WIND with 20 real hours per wind level instead of one, as the independent review asked (REVIEW_2026-10-24.md, finding 6).

## Design (planned/wind20_run.js, planned/wind.js `bandHours`)
Lab build-out, sites every 4 km, Houston mix; heights A0 (Omaha profile) and A2 (shared out). For each wind band, 20 daytime hours of 2025 (13:00–03:00 UTC) whose 120 m speed lies in the band of daytime hours: median band (40th–60th percentile), strong (85th–95th), very strong (97th–100th); hours chosen by a fixed hash order. Each hour is paired with its own layout seed (hour k uses seed k + 1); the still-air arm uses the same 20 seeds. For each run: cross-company meetings with no check, and after a ±5 s plan check planned in still air (no wind term), both flown in that hour's wind. Counting bounded to the 2 h window. Houston now (data/openmeteo_houston_2025.json); DFW with the same code when its wind file arrives. 160 runs per metro.

## Predictions (Houston and, separately, DFW; pooled over the 20 hours)
- **Wn1:** the sharing-out cut in each wind band is within 5 points of its still-air cut. PREDICTION: holds.
- **Wn2:** in the median band, the still-air check leaves >= 50 % of the no-check meetings. PREDICTION: holds.
- **Wn3:** in at least 18 of the 20 median-band hours, the check leaves >= 30 %. PREDICTION: holds (the result is not driven by a few hours).

## Rules
No changes after the data is in; code committed before runs; deviations logged below.
- **K1:** each band has 20 distinct hours.

## Deviation log
(none yet)
- (Appended after fingerprint.) K1 PASS for Houston: bands 5.1–6.0, 8.5–10.5, 11.4–14.8 m/s, 20 distinct hours each. Code check run while writing, before this text.
- K1 PASS for DFW (data/openmeteo_dfw_2025.json, founder download 24 Oct; 8,760 hours; 120 m mean 6.3 m/s): bands 5.3–6.7, 9.7–11.7, 12.5–17.1 m/s, 20 distinct hours each.
