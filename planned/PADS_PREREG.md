# Fixed pads with occupancy at one site (written 2026-10-24 before any study run)
Status: behaviour model of planned operations at one isolated site; same-company meetings only. Not a safety assessment.

## Why
The independent review (REVIEW_2026-10-24.md, finding 3) noted that SITECAP and ARRIVE re-draw a random pad for every flight inside a 30 m square, with no occupancy, so ordinary pad activity counts as meetings and the pad-spacing result is partly built in. This study gives each site fixed pads, one drone per pad at a time.

## Model (planned/pads_run.js)
One site, filed profiles, A0 heights, counting bounded to the 2 h window. Pads on a square grid at a fixed spacing (10, 30 or 60 m), compared with the old random-pad model (30 m square). Pad counts: Wing 18 (sample nest, PLANNED_OPS_INPUTS), Zipline 20 docks (DFW EA maximum per site), Amazon 20 (not published; assumed). Each flight, in request order, takes the pad that frees up first; a pad is busy from take-off until its drone lands plus 60 s turnaround; if none is free the flight waits. Sites: Amazon, Wing, Zipline at its Houston rate (~950 a day) and at its DFW rate (400 a day). Traffic 1× and 2×. Seeds 1–3. 4 × 2 × 4 × 3 = 96 runs. Measures: same-company wide meetings with both drones within 300 m; of those, "pad-level" with both below 20 m; mean and maximum pad wait.

## Predictions (pooled over seeds)
- **F1:** fixed pads 30 m apart give at most half the near-site meetings of the random-pad model at 1×, for each site. PREDICTION: holds.
- **F2:** near-site meetings fall as pad spacing grows (10 m > 30 m > 60 m) at 1×, for each site. PREDICTION: holds.
- **F3:** at 1×, mean pad wait is 30 s or less for Wing, Zipline (Houston) and Zipline (DFW). PREDICTION: holds. (Amazon reported only: its pad count is assumed.)
- **F4:** in the random-pad model at 1×, at least half of near-site meetings are pad-level (both below 20 m), for each site. PREDICTION: holds.

## Rules
No changes after the data is in; code committed before runs; deviations logged below.
- **K1:** every flight starts and ends on a grid pad; no pad is double-booked.

## Deviation log
(none yet)
- (Appended after fingerprint; it covers the text above.) K1 PASS (all flights on grid pads; no pad double-booked). The code check was run while writing the runner, before this text.
