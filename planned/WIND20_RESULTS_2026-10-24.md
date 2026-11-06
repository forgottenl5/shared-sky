# Wind over many real hours: results (2026-10-24; Houston 3/3, DFW 2/3)
Pre-registration: WIND20_PREREG.md, sha256 eab427b5…, committed with code before any run. K1 passed. Houston: 160 runs (20 real hours per wind band × 2 heights, plus 20 still-air seeds). No deviations.

## Houston (sites every 4 km, 12 × 12 km counted zone; 20 hours pooled per band)
| Wind band at 120 m | Omaha profile, no check | Shared out, no check | Sharing-out cut (wide / very close) | Still-air ±5 s check flown in this wind: close calls left |
|---|---|---|---|---|
| Still air | 1,558 | 286 | 82 % / 90 % | 0 (0 %) |
| Median band (5.1–6.0 m/s) | 1,554 | 281 | 82 % / 88 % | 1,075 (69 %) |
| Strong (8.5–10.5 m/s) | 1,705 | 343 | 80 % / 87 % | 1,630 (96 %) |
| Very strong (11.4–14.8 m/s) | 1,837 | 379 | 79 % / 87 % | 1,775 (97 %) |

| Prediction | Result | Verdict |
|---|---|---|
| Wn1 sharing-out cut within 5 points of still air in every band | 82 / 82 / 80 / 79 % | **PASS** |
| Wn2 median band: still-air check leaves >= 50 % | 69 % | **PASS** |
| Wn3 >= 30 % left in at least 18 of 20 median-band hours | 20 of 20 | **PASS** |

## Reading
Across 60 real windy hours, the single-hour WIND result holds and is now robust: height sharing loses at most 3 points in strong wind, while a ±5 s time-booked check with no wind allowance keeps only about 30 % of its effect in a median wind and almost none in strong wind (in every one of the 20 median hours). Pooled over 20 hours, the median-band figure is 69 % left (the single WIND hour gave 79 %).

## DFW winds (data/openmeteo_dfw_2025.json; same lab layout and seeds, only the wind differs)
| Wind band at 120 m | Omaha profile, no check | Shared out, no check | Sharing-out cut (wide / very close) | Still-air ±5 s check flown in this wind: left |
|---|---|---|---|---|
| Still air | 1,558 | 286 | 82 % / 90 % | 0 (0 %) |
| Median band (5.3–6.7 m/s) | 1,585 | 272 | 83 % / 89 % | 1,195 (75 %) |
| Strong (9.7–11.7 m/s) | 1,648 | 333 | 80 % / 88 % | 1,554 (94 %) |
| Very strong (12.5–17.1 m/s) | 1,803 | 502 | **72 %** / 83 % | 1,977 (110 %) |

| Prediction | Result | Verdict |
|---|---|---|
| Wn1 sharing-out cut within 5 points of still air in every band | 82 / 83 / 80 / **72 %** | **FAIL** (very strong band) |
| Wn2 median band: still-air check leaves >= 50 % | 75 % | **PASS** |
| Wn3 >= 30 % left in at least 18 of 20 median-band hours | 20 of 20 | **PASS** |

## Reading (both metros)
- Height sharing holds in median and strong wind in both metros (80–83 %). In DFW's windiest 3 % of hours (12.5–17.1 m/s at 120 m, windier than any Houston band) it drops to 72 %: I predicted it would not. Not diagnosed. A likely contributor: at those speeds drones spend much longer on upwind legs and climbs, so more of their time sits in the transitions between height layers. Whether delivery drones fly at all in those winds is a separate question the model does not answer (operating wind limits are not in the filings read).
- A time-booked check without a wind allowance fails in both metros: 69–75 % of close calls left in a median wind, 94–110 % in strong wind (above 100 % means the check's delays moved flights into new conflicts).
