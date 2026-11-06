# LAYER2 — layer order plus thinner reserved blocks (registered 27 Oct 2026, before any run)

## Why
LAYER1 (planned/LAYER1_RESULTS_2026-10-27.md): putting Zipline on top (arm WAZ: Wing 46-71 m, Amazon out 83 / in 95, Zipline 107, even 12 m gaps) cut flown conflicts by about 40 % but not coordination delay, because under the V2 plan check each reserved block is 10 m thick on each side, so cruising flights in layers 12 m apart still block each other on paper. Hypothesis: with blocks 5 m thick (the vertical extent already tried in DENS1 D2 follow-up, 5 m) cruise-versus-cruise blocks disappear at 12 m gaps, leaving only climbs and descents through other layers, which the WAZ order removes for Amazon-Zipline. The combination, not either alone, should cut delay without losing the conflict cut.
Whether a 5 m vertical block is safe is not known (it is smaller than COORD1's design value); this study measures what happens in flown conflicts, it does not establish safety.

## Design
Everything as COORD1/LAYER1: real sites (planned/houreal.js, planned/dfwreal.js), today's filed rates, p90-wind hours (planned/wind.js bandHours(0.85, 0.95, 6): hours for seeds 1-3 are the same as COORD1/LAYER1), plans on the previous hour's wind, flights flown in the actual hour. Seeds 1-6 (LAYER1 used 1-3; DFW counts were too small). Warm-up 1 h, measured 2 h, counts at 4 checks a second, wide threshold 30 m / 10 m.
- Heights: A2 (Wing 46-71, Amazon 81 out / 115 in, Zipline 101) and WAZ (Wing 46-71, Amazon 83 / 95, Zipline 107).
- Plan check: NONE (no coordination), V2 (C.VOL.V2: w 30 m, v 10 m, h = 10 s + 5 %), V2v5 (same but v = 5 m).
- 2 heights x 3 checks x 2 metros x 6 seeds = 72 runs.
- Measures: flown wide cross-company conflicts per run (summed over the 6 seeds); share of checked flights delayed and cancelled in the measured window (all and per company); mean delay.

## Predictions (both metros)
- **Q1:** WAZ + V2v5 delayed share <= 0.7 x A2 + V2v5 delayed share.
- **Q2:** A2 + V2v5 delayed share <= 0.6 x A2 + V2 delayed share (replicates the DENS1 follow-up on 6 seeds in this design).
- **Q3:** WAZ + V2v5 Amazon delayed share <= 0.5 x A2 + V2 Amazon delayed share.
- **Q4:** flown wide conflicts under WAZ + V2v5 <= flown wide conflicts under A2 + V2 (the combination is no worse than today's check).
- **Q5:** flown wide conflicts under WAZ + V2v5 <= 0.15 x WAZ + NONE (it still removes at least 85 % of what an uncoordinated WAZ sky has).
- **Q6:** WAZ + V2v5 cancelled share <= 0.5 %.
Pass requires the condition in both metros.

## Checks before the run
- **K1:** A2 + NONE seed 1: flown wide count equals the saved COORD1 value (Houston 29, DFW 7); A2 + V2 seed 1: the count of delayed flights in the measured window equals COORD1's for seed 1.
- **K2:** every WAZ layer at or below 120 m with gaps >= 12 m (as LAYER1 K2).

## Files
planned/layer2_run.js, planned/layer2_analyze.py, out/layer2/. At most 2 fix attempts per problem, logged below.

## Deviation log
(none yet)
