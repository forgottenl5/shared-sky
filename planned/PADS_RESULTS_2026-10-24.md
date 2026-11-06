# Fixed pads with occupancy: results (2026-10-24)

> **Note added 28 Oct 2026.** "Independent review" and reviewer roles in this file mean AI reviewers (fresh sessions of the AI assistant used to build the project), not people. See VERIFY.md.
> **Correction 28 Oct 2026.** At filed traffic the cut is 86–99 %, not 92–99 %: the DFW Zipline row (8 of 56) was left out of the headline.
Pre-registration: PADS_PREREG.md, sha256 758fa19d…, committed with code before any run. K1 passed (code check run while writing, logged). 96 runs, counting bounded to the 2 h window. No deviations.

## Result in one line
**With fixed pads 30 m or more apart, a site's own drones almost never meet near it: 86–99 % fewer near-site meetings (headline corrected 29 Oct from 92–99 %; see the note at the top) than the random-pad model at filed traffic.** The random-pad model behind SITECAP and ARRIVE overstated site congestion badly, as the independent review suspected. The real constraint is pad count: with 20 docks, Zipline's Houston rate (about 950 a day per site) makes drones wait about 4 minutes for a free dock.

## Near-site same-company meetings (within 300 m; 3 seeds × 2 h; "low" = both drones below 20 m)
| Site | traffic | random pads, 30 m square | fixed, 10 m apart | fixed, 30 m | fixed, 60 m | mean pad wait |
|---|---|---|---|---|---|---|
| Amazon (20 pads, assumed) | 1× | 301 (111 low) | 214 | 23 | 13 | 3 s |
| Amazon | 2× | 1,210 | 564 | 79 | 39 | 1,757 s |
| Wing (18 pads) | 1× | 98 (76 low) | 67 | 1 | 0 | 0 s |
| Wing | 2× | 396 | 265 | 11 | 7 | 0 s |
| Zipline, Houston rate (20 docks) | 1× | 377 (73 low) | 185 | 25 | 15 | **235 s** |
| Zipline, Houston rate | 2× | 1,291 | 220 | 22 | 13 | 6,300 s |
| Zipline, DFW rate (20 docks) | 1× | 56 (9 low) | 42 | 8 | 3 | 0 s |
| Zipline, DFW rate | 2× | 248 | 173 | 20 | 13 | 24 s |
Waits are for the 30 m layout; with fewer pads free, fewer drones are in the air, so high-wait rows also have lower throughput.

## Predictions
| Prediction | Result | Verdict |
|---|---|---|
| F1 fixed 30 m pads <= half the random-pad meetings at 1× | 8 / 1 / 7 / 14 % | **PASS** |
| F2 meetings fall with spacing 10 > 30 > 60 m at 1× | Amazon 214/23/13, Wing 67/1/0, Zipline Houston 185/25/15, Zipline DFW 42/8/3 | **PASS** |
| F3 mean pad wait <= 30 s at 1× (Wing, Zipline Houston, Zipline DFW) | 0 / **235** / 0 s | **FAIL** |
| F4 random-pad meetings mostly pad-level (below 20 m) | 37 / 78 / 19 / 16 % | **FAIL** |

## Reading
1. **Site congestion was mostly a modelling artefact.** In the random-pad model, drones took off and landed from overlapping spots and their climb columns overlapped. Fixed pads 30 m apart keep the columns apart. F4 shows the overlap was mostly above 20 m (climbing and descending), not on the ground, except at Wing's nests, where drones hover at 7 m over the pad.
2. **Pad count, not procedure, limits a busy site.** 20 docks are not enough for Zipline's Houston rate (235 s mean wait at filed traffic). The Texas draft EA allows Houston Chargers up to 72 docks, so the filing is consistent with this; the model's 20 came from the DFW EA. Amazon's pad count is not published; with 20 assumed it is fine at 1× and saturated at 2×.
3. **Consequences for earlier studies:** SITECAP's and ARRIVE's absolute near-site numbers and their "pad spreading cuts 75–83 %" are artefacts of the random-pad model and are superseded by this study. Their timing results (the departure-spacing cap of 3,600 / spacing per hour; slots barely help) do not depend on pads and stand. Cross-company results (all metro studies) never counted same-company meetings and are unaffected.

## Limits
Square pad grids; one drone per pad with 60 s turnaround; pad counts partly assumed (Amazon 20, Zipline 20 vs up to 72 in Texas); one isolated site.
