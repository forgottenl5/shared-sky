# Site capacity: results (2026-10-24, corrected v2)

> **Note added 28 Oct 2026.** "Independent review" and reviewer roles in this file mean AI reviewers (fresh sessions of the AI assistant used to build the project), not people. See VERIFY.md.
**Superseded in part by PADS (24 Oct):** with fixed pads 30 m apart, near-site meetings fall 86–99 % (the PADS table; an earlier headline here said 92–99 %), so this study's absolute numbers and its pad-spreading result are artefacts of the random-pad model. The departure-spacing capacity result (3,600 / spacing per hour) stands.
**Corrected after an independent review (REVIEW_2026-10-24.md):** v1 counted meetings past the 2 h window, which inflated the spaced (queued) arms. All 216 runs repeated with counting bounded to the window (v2; v1 kept in out/sitecap_v1). All four verdicts unchanged. Changes: S4's best cuts are 44 / 32 / 52 % (v1 19 / 32 / 25 %); spaced arms past capacity now show fewer meetings because flights wait outside the window (lost throughput, not safety). Also from the review: pads are re-drawn per flight inside the 30 m meeting radius, so ordinary pad operations count as meetings (S2 is partly built in); "4× wider" spread is 16× the pad area; "arrivals are not spaced" was tested afterwards in ARRIVE.

## v2 predictions
| Prediction | Result | Verdict |
|---|---|---|
| S1 slope 1.5–2.5 | Amazon 2.03, Wing 2.07, Zipline 1.84 | **PASS** |
| S2 120 m pads cut >= 50 % at 4× | 75 / 83 / 77 % | **PASS** |
| S3 Amazon 4×: 20 s waits > 600 s; 10 s <= 60 s | 2,151 s / 10 s | **PASS** |
| S4 departure spacing alone < 80 % at 2× | best 44 / 32 / 52 % | **PASS** |

## v1 (original, superseded) below
Pre-registration: SITECAP_PREREG.md, sha256 ab7ab04d…, committed with code (9c4a883) before any run. K1 passed (code check run while writing, logged). 216 runs. No deviations.

## Result in one line
**The paper capacity model holds.** One site's own drones meet near it with the square of its traffic (slopes 1.85–2.06). Spreading pads from a 30 m to a 120 m square removes 75–83 % of those meetings. Spacing departures caps a site at 3,600 / spacing per hour, and past that cap waits run to hours. Spacing departures alone removes at most 19–32 %, because arrivals are not spaced.

## Near-site same-company meetings (within 300 m; 3 seeds × 2 h), departures spaced 0 / 10 / 20 / 40 s
| Site | traffic | 30 m pads | 120 m pads | mean wait at 10 / 20 / 40 s spacing |
|---|---|---|---|---|
| Amazon | 1× (61/h) | 303 / 274 / 269 / 266 | 75 / 62 / 59 / 73 | 1 / 5 / 40 s |
| Amazon | 2× | 1,225 / 1,103 / 1,074 / 996 | 302 / 244 / 228 / 253 | 3 / 20 / 2,153 s |
| Amazon | 4× | 5,076 / 4,595 / 3,935 / 2,319 | 1,283 / 1,043 / 868 / 550 | 10 / 2,151 / 11,531 s |
| Wing | 1× (27/h) | 99 / 98 / 94 / 70 | 10 / 9 / 9 / 10 | 0 / 1 / 6 s |
| Wing | 2× | 398 / 390 / 375 / 271 | 77 / 74 / 74 / 53 | 1 / 4 / 23 s |
| Wing | 4× | 1,728 / 1,693 / 1,567 / 1,006 | 301 / 298 / 312 / 177 | 2 / 15 / 1,236 s |
| Zipline | 1× (63/h) | 377 / 363 / 340 / 319 | 86 / 76 / 69 / 70 | 1 / 5 / 37 s |
| Zipline | 2× | 1,310 / 1,247 / 1,256 / 982 | 348 / 315 / 306 / 234 | 3 / 20 / 2,884 s |
| Zipline | 4× | 4,908 / 4,654 / 3,875 / 2,226 | 1,143 / 1,040 / 897 / 529 | 10 / 2,827 / 12,804 s |

## Predictions
| Prediction | Result | Verdict |
|---|---|---|
| S1 meetings grow with rate, slope 1.5–2.5 | Amazon 2.03, Wing 2.06, Zipline 1.85 | **PASS** |
| S2 120 m pads cut >= 50 % at 4× | 75 / 83 / 77 % | **PASS** |
| S3 Amazon 4×: 20 s spacing waits > 600 s; 10 s spacing <= 60 s | 2,151 s / 10 s | **PASS** |
| S4 departure spacing alone cannot reach an 80 % cut at 2× | best 19 / 32 / 25 % | **PASS** |

## What it means
- A site's own-drone encounter load is set mainly by pad spacing and traffic, not by departure spacing. Doubling traffic quadruples it; a 4× wider pad area cuts it about 4×.
- Departure spacing has a hard capacity cliff at 3,600 / spacing per hour: Amazon's filed 61 an hour is comfortable at 20 s spacing (cap 180) but 2× traffic with 40 s spacing (cap 90) is past the cliff.
- To get near zero, arrivals need their own procedure (slots or separate approach paths); departure spacing is not enough.
- Limits: counts are planned encounters companies handle with their own (non-public) procedures, not collisions; one isolated site; pads uniform in a square.
