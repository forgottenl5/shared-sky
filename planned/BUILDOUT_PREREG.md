# Houston build-out, stage by stage: what happens and which fix is needed (written 2026-10-24 before any study run)
Status: behaviour model of planned operations. Stages are not dated: no company publishes a rollout timeline. Not a forecast or safety assessment.

## Why
Every earlier study looked at one snapshot: today's real sites (almost no overlap) or the full filed caps (about 50 close calls an hour). This study steps between them to find (1) the stage at which close calls between companies stop being negligible, (2) which company pair drives them, and (3) which fix each stage needs, and its cost in delay, including real wind.

## Sites by stage (planned/buildout.js)
| Stage | Wing | Zipline | Amazon | Volume (share of filed per-site cap) |
|---|---|---|---|---|
| today | 13 real stores | 1 (Cypress) | 1 (HOU6 Richmond) | 20 % |
| early | 13 real + 6 | 1 + 15 | 2 (+ SAHx) | 50 % |
| mid | 13 real + 25 | 1 + 32 | 3 (+ STX5) | 75 % |
| full | 13 real + 62 (75 cap) | 1 + 64 (65 cap) | 5 (+ HOU2, STX4) | 100 % |
- Wing's 13 operating stores at store-level positions: 5 from Wing's 15 Jan 2026 post (HOUTODAY geocodes) and 8 added by July 2026 (CultureMap, 8 Jul 2026), geocoded with OSM Nominatim (founder pastes; 6 store matches) and, for FM 1960 W and New Caney, the geo tags of the in-store Boost Mobile pages (as Kemah). New Caney sits 0.1 km inside the zone's north edge. HOUTODAY used only the first 5 and is superseded for "today".
- Amazon sites open in a fixed order: HOU6 (flying since Aug 2026) then the Texas EA list order of the geocoded sites (SAHx, STX5, HOU2, STX4); SAH1 not geocoded, so full = 5 of 6.
- Zipline's Cypress dock sampled within 5 km of the Cypress coordinate (as HOUTODAY). All other sites uniform at random in the counted square, drawn in one fixed order so each stage contains the previous one.
- Stage site counts are a third, a half and all of the filed caps; volumes rise with them (20 / 50 / 75 / 100 %). Both are assumptions, stated on every output.
- Counted zone 84 × 84 km on the HOUREAL centre; customers uniform (CENSUS showed this barely matters); straight routes (CORRIDOR showed corridors barely change the headline).

## Heights and fixes
Heights: A0 Omaha profile, R reported, A2 sharing out (as HOUREAL). Each run reports meetings with no check and after a plan check (30 m cells, 10 m vertical) planned in still air, in one of three variants: **still5** ±5 s booking flown in still air; **wind5** ±5 s flown in Houston's median wind (WIND p50 hour, 5.5 m/s at 120 m); **wind30** ±30 s booking flown in the same wind. Seeds 1–3. 4 stages × 3 heights × 3 variants × 3 seeds = 108 runs.

## Predictions (wide meetings, 30 m / 10 m, pooled over seeds)
- **B1 (tipping point):** with no coordination and A0 heights, fewer than 1 close call an hour today, and 10 or more an hour at mid. PREDICTION: holds.
- **B2:** sharing out cuts A0's close calls by >= 65 % at mid and at full. PREDICTION: holds.
- **B3:** at full, A0, median wind: the ±30 s check removes >= 80 % of close calls; the ±5 s check removes <= 30 %. PREDICTION: holds.
- **B4:** at full, median wind, ±30 s: the share of flights delayed by the check with sharing out (A2) is at most half that with A0. PREDICTION: holds (fewer conflicts to resolve).
- **B5:** Amazon–Zipline is >= 50 % of A0's close calls at mid and at full. PREDICTION: holds.
- Reported: per stage, close calls per hour for each height case, after-check counts, share of flights delayed, mean delay, pairs.

## Rules
No changes after the data is in; code committed before runs; deviations logged below.
- **K1:** each stage has the site counts in the table, all inside the counted zone; 13 Wing positions present. **K2:** stages nest (every early site is in full).

## Deviation log
(none yet)
- (Appended after fingerprint, pre-study check only.) K1 PASS: today 13/1/1, early 19/16/2, mid 38/33/3, full 75/65/5 (Wing/Zipline/Amazon), all in zone; K2 PASS: stages nest.
- **Deviation (after results, 24 Oct 2026): engine bug found and fixed (PCFIX).** The plan check's booking key `((ix+1000)*2000+(iy+1000))*4000+b` is only valid within about ±30 km of the centre. Beyond 30 km west or south the key goes negative and the pruning step (`k % 4000 < minB`) deletes those bookings; beyond 30 km east or north cells collide. BUILDOUT's counted zone is ±42 km. Instrumented diagnosis (scratch script, not registered): all 3 close calls left after a still-air ±5 s check (full stage, seed 1) were at x < -30 km; after the fix, 0 left in seeds 1–3. Fix attempt 1 of 2: offsets 5000 / 10000 (valid to ±150 km); test_lab_engine 9/9. Earlier plan-check studies used a 12 km counted zone (samples limited to ±7 km) and are unaffected. **Action:** all 108 runs repeated unchanged on the fixed engine (out/buildout, v2); the original runs kept as out/buildout_v1; both reported; predictions scored on both, criteria unchanged.
- **Deviation 2 (24 Oct 2026, from the independent review, planned/REVIEW_2026-10-24.md):** `count` had no upper time bound, so flights still in the air after the 2 h window were counted (mid/A0/seed 1: 1 of 15 meetings after the window). The registration says "1 h warm-up, 2 h measured", so the runner now passes `tEnd = warm + meas` (engine opt, default unchanged, 9/9). The v2 rerun uses both fixes. Also corrected in the text: stages are 25 % (early) and 50 % (mid) of the Wing and Zipline caps, not "a third" and "a half".
