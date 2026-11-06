# Real Houston wind: results (2026-10-24)

> **Note added 28 Oct 2026.** "Independent review" and reviewer roles in this file mean AI reviewers (fresh sessions of the AI assistant used to build the project), not people. See VERIFY.md.
Pre-registration: WIND_PREREG.md, sha256 53d76a14…, committed with code (72a1d95) before any run. K1 passed. 48 runs. No deviations.

## Corrections after independent review (24 Oct 2026, REVIEW_2026-10-24.md)
- "Close calls" here means the page's definition: 30 m sideways and 10 m vertically (the "wide" count). For very close calls (15 m / 5 m), sharing out heights cuts 90–93 % (still air 102 → 9 and 263 → 19).
- The plan-check finding is narrower than first written: **a ±5 s time buffer with no wind term fails in wind.** Real operators' intents (ASTM F3548) include wind buffers and conformance monitoring, so this does not show that real plan checks fail. It rests on one wind hour per level and 3 seeds; re-timing alone moves no-check counts by up to 25 % (203 → 255), so the p90 vs p99 difference (850 vs 879) is noise and W3's ordering is weak support.

## Result in one line
**Wind does not touch height sharing, but it breaks a plan check that is planned in still air.** Sharing out heights still cuts close calls 80–84 % in every wind. A time-booked plan check (±5 s) planned without wind and flown in a typical Houston wind (5.5 m/s at 120 m) leaves about 80 % of the close calls it was meant to remove; in a 90th-percentile wind (9.4 m/s) it removes none.

## Cross-company wide meetings (close in brackets), 3 seeds × 2 h
| Sites every | Wind (120 m) | Filed, no check | Shared out, no check | Cut | Filed, still-air check flown in wind | Share left |
|---|---|---|---|---|---|---|
| 4 km | still | 203 (102) | 38 (9) | 81 % | 0 | 0 % |
| 4 km | p50 5.5 m/s | 255 (98) | 40 (10) | 84 % | 202 | 79 % |
| 4 km | p90 9.4 m/s | 226 (100) | 46 (11) | 80 % | 229 | 101 % |
| 4 km | p99 12.9 m/s | 222 (88) | 42 (9) | 81 % | 239 | 108 % |
| 3 km | still | 575 (263) | 108 (19) | 81 % | 0 | 0 % |
| 3 km | p50 | 604 (276) | 115 (22) | 81 % | 487 | 81 % |
| 3 km | p90 | 613 (261) | 121 (24) | 80 % | 621 | 101 % |
| 3 km | p99 | 646 (290) | 127 (27) | 80 % | 640 | 99 % |

## Predictions
| Prediction | Result | Verdict |
|---|---|---|
| W1 sharing-out cut under p90 within 5 points of still air | 80 vs 81 % at both spacings | **PASS** |
| W2 still-air check in p50 wind leaves >= 50 % | 79 % / 81 % | **PASS** |
| W3 after-check meetings rise p50 < p90 < p99 | 689 / 850 / 879 | **PASS** |

## What it means
- Height separation is robust to wind because wind changes when drones arrive, not how high they fly.
- Time-based deconfliction is fragile: a ±5 s booking is wiped out by arrival shifts of tens of seconds. Real operators plan with wind terms; this study shows only that a plan check without one would not work. The next study (BUILDOUT) tests a wider time buffer.
- Limits: one hour's wind profile per level, held for the whole run; no gusts, no forecast error model, no re-planning in flight.
