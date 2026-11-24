# DIRECT1: heights by direction or trip length instead of by company (written 2026-11-24 before any study run)
Status: new design test, from the ideas backlog (IDEAS_BACKLOG.md, idea 1). Registered before any study run; the runner's pre-checks run after this file is fingerprinted.

## Why
Every height plan tested so far gives heights by company. Crewed aviation gives heights by direction of flight (eastbound and westbound at different levels), and chip routing gives each wiring layer a preferred direction, so traffic going different ways never shares a level. This study asks whether heights by direction, or by trip length, beat heights by company for three delivery companies sharing a city.

## Layouts (Wing and Amazon legs re-assigned; Zipline stays at its filed 101 m; all layers inside both Wing's 46-91 m and Amazon's 55-115 m filed bands)
- **D2, two directions:** eastbound legs (moving east at all) at 56 m, westbound at 76 m, for both companies.
- **D4, four directions:** legs heading east, north, west, south (sectors centred on the axes) at 56, 64, 72, 80 m.
- **DD, trip length:** legs shorter than the metro's median Wing / Amazon cruise leg (seed 1, computed before any run and recorded in every row) at 56 m, longer legs at 80 m.
Each leg (outbound, return) gets its own height; the climb and descent at its ends follow it (planned/direct.js, tests planned/test_direct.js). References, not re-run: A0, A2, M1 and FLEX from INTENT2 (same seeds 1-5, same plan sizes), S1 and A2 from CURVE1 for the cut.

## Parts (machinery loaded unchanged, patched only to re-assign heights)
- **C, flights held:** INTENT1 / INTENT2 cost runner, windy hours 1-5, plans sized by the 95 % rule at best-site GPS (N1, +-5 m) and average GPS (N2, +-10 m / +-14 m). 3 layouts x 2 sizes x 2 metros x 5 seeds = 60 runs.
- **R, residual collision risk:** INTENT2 risk runner (still air), N1 / N2 and no check, at the matching GPS level. 3 x 3 x 2 x 5 = 90 runs.
- **U, cut without plan sharing:** LAYOUT1 / CURVE1 counter (still air, 30 m sideways, vertical 5-20 m), against S1 from CURVE1. 3 x 2 x 5 = 30 runs.

## Predictions (pooled over seeds 1-5)
- **E1:** at N2, D2 holds more flights than A2 in both metros (separating companies beats separating directions, because Wing and Amazon now share layers).
- **E2:** at N2, D4 holds more flights than D2 in both metros (its layers are 8 m apart, inside two +-14 m plans).
- **E3:** at N2, DD holds more flights than A2 in both metros.
- **E4:** at N2, D2's residual risk is lower than FLEX's (INTENT2: 0.41 Houston, 0.18 DFW per 100,000 flight hours) in both metros.
- **E5:** without plan sharing, D2's cut against S1 at 30 m / 10 m is at least 50 % in both metros.
- Reported, not predicted: all held shares by company, residual risks and cuts at every vertical rule for D2, D4 and DD; the median leg lengths.

## Checks (K)
- **K1:** planned/test_direct.js passes.
- **K2:** with A2 heights the patched runners reproduce stored rows exactly: INTENT2 cost (Houston N2 seed 1, held and checked), INTENT2 risk (DFW N2 seed 1, encounters) and CURVE1 (DFW seed 1, 30 m / 10 m).

## Rules
Runner and analysis committed before any study run; no changes after the data is in; deviations logged below.

## Deviation log
(none yet)
- **D1 (2026-11-24, before any study run):** the committed runner cut each source runner at the first `const J = [];`, which in intent2_run.js and layout1_run.js first appears inside a string on an earlier line, so the pre-checks stopped with "patch failed". Fixed by cutting at the start of a line (`\nconst J = [];`). No study run had started; all checks K1-K2 then passed. Job count is 180 (60 + 90 + 30), as listed under Parts.
