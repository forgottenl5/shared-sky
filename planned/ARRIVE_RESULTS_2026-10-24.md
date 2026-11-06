# Arrival procedures at one site: results (2026-10-24)
**Superseded in part by PADS (24 Oct):** the near-site counts here use the random-pad model, which PADS shows overstates them by 10–100×. The finding that time slots barely help stands as a statement about that model; with fixed pads there is little left for slots to remove.
Pre-registration: ARRIVE_PREREG.md, sha256 edfa39df…, committed with code before any run. K1 passed (code check run while writing, logged). 216 runs; counting bounded to the 2 h window; throughput reported. No deviations.

## Result in one line
**Slots in time barely help; spreading pads does.** Holding returning drones and spacing departures and arrivals (separately or as one shared slot) cut a site's own near-site meetings by -1 % to 53 % at filed traffic, against 75–83 % from spreading pads over a 120 m square. My paper model (one shared slot removes most) was wrong: 3 of 4 predictions failed.

## Near-site same-company meetings (within 300 m; 3 seeds × 2 h), mean departure wait / arrival hold in brackets
| Site | traffic | pads | none | departures 20 s | arrivals 20 s | both 20 s | shared slot 20 s | shared slot 10 s |
|---|---|---|---|---|---|---|---|---|
| Amazon | 1× | 30 m | 301 | 267 (5 / 0 s) | 252 (0 / 6) | 231 (5 / 6) | 304 (17 / 19) | 233 (2 / 3) |
| Amazon | 1× | 120 m | 73 | 58 | 61 | 45 | 60 | 48 |
| Amazon | 2× | 30 m | 1,210 | 1,052 | 1,039 | 907 | 757 (1,291 / 1,370 s; 68 % landed) | 973 (10 / 10) |
| Amazon | 2× | 120 m | 297 | 224 | 254 | 211 | 150 | 220 |
| Wing | 1× | 30 m | 98 | 93 | 101 | 96 | 85 | 99 |
| Wing | 1× | 120 m | 9 | 8 | 10 | 9 | 9 | 9 |
| Wing | 2× | 30 m | 396 | 374 | 381 | 357 | 307 | 378 |
| Wing | 2× | 120 m | 77 | 74 | 71 | 67 | 57 | 67 |
| Zipline | 1× | 30 m | 377 | 336 | 342 | 307 | 179 (28 / 26) | 279 |
| Zipline | 1× | 120 m | 86 | 69 | 77 | 58 | 41 | 51 |
| Zipline | 2× | 30 m | 1,291 | 1,231 | 1,215 | 1,134 | 272 (1,727 / 1,893 s) | 889 |
| Zipline | 2× | 120 m | 340 | 290 | 287 | 256 | 56 | 196 |

## Predictions
| Prediction | Result | Verdict |
|---|---|---|
| P1 shared 20 s slot cuts >= 80 % at 1×, 30 m pads | Amazon -1 %, Wing 13 %, Zipline 53 % | **FAIL** |
| P2 separate slots cut less than one shared slot | Amazon 23 vs -1 %, Wing 2 vs 13 %, Zipline 19 vs 53 % | **FAIL** (mixed) |
| P3 Amazon 2×, shared 20 s slot past capacity: wait > 600 s | 1,370 s mean hold; 68 % landed by 30 min after the window | **PASS** |
| P4 120 m pads + shared 10 s slot at 2×: >= 90 % cut, waits <= 60 s | 82 / 83 / 85 %, waits 2–10 s | **FAIL** (narrowly) |

## Reading
- In this model, near-site meetings are mostly geometric: drones on neighbouring pads, climbing and descending within 30 m of each other for 30–60 s at a time. Separating movements by 10–20 s does not separate drones that each spend longer than that in the column. Pad spacing removes the geometry, so it works.
- The large cuts at 2× with a shared 20 s slot (Zipline 79 %, Amazon 37 %) come with hold times of 20–30 minutes and lost throughput: fewer drones near the site, not a better procedure.
- Best combination tested: 120 m pads plus a shared 10 s slot, 82–85 % fewer meetings at 2× traffic with waits of 2–10 s.
- Limits (from the review): pads are re-drawn per flight with no occupancy, which inflates pad-level meetings; real sites assign fixed pads and their own sequencing; one isolated site; holding drones wait at cruise height 500 m out (meetings there fall outside the 300 m count; the 1 km count is in the raw data).
