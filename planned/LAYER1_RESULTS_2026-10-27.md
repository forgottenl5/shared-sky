# LAYER1 results (27 Oct 2026) — registration planned/LAYER1_PREREG.md (K1 and K2 passed before the run; no deviations)

**Putting Zipline on top removes most physical conflicts (40 % fewer overall; Amazon-Zipline 39 to 8 in Houston, 11 to 1 in DFW) but does nothing for coordination delay: 4 of 7 predictions passed.** The delay is set by something else: how thick the reserved block is compared with the gap between layers.

| Prediction | Result | Verdict |
|---|---|---|
| P1 WAZ wide conflicts <= 0.75 x A2 | Houston 0.60, DFW 0.54 | PASS |
| P2 even 12 m gaps in A2's order (A2u) within +-20 % of A2 | Houston 1.00, DFW 1.12 | PASS |
| P3 WAZ Amazon-Zipline <= 0.5 x A2 | 8 vs 39; 1 vs 11 | PASS |
| P4 WAZ Wing-Zipline within +-25 % of A2 | 25 vs 23; 6 vs 8 | PASS |
| P5 WAZ delayed share and Amazon delayed share <= 0.8 x A2 | Houston 19.3 vs 19.2 %, Amazon 85.8 vs 85.9 %; DFW 16.2 vs 16.7 %, 79.4 vs 79.4 % | **FAIL** |
| P6 AWZ (Amazon lowest) wide conflicts > WAZ | 32 vs 47; 11 vs 14 | **FAIL** |
| P7 fewest conflicts = lowest delayed share | fewest conflicts AWZ, lowest delay A2u (Houston) / WAZ (DFW) | **FAIL** |

Tables: planned/layer1_results_table.md. Pooled over 3 seeds and 2 measured hours each; DFW counts are small (11-29 conflicts per arm), so DFW per-pair numbers are indicative only.

## What the failures show (exploratory follow-up planned/diag_layer1_blame.js; who blocks whom in the plan check)
- **P5: delay did not move because the plan-check blocks are thicker than the layer gaps.** In A2 and WAZ the most common delay is a Zipline or Amazon cruise held by another company's cruise (Houston A2 3,822 of the blocks are Zipline level flight blocked by Amazon level flight; WAZ 3,852). Each V2 block reserves 10 m up and down, so two cruising flights in layers 12 m or 14 m apart still overlap on paper even though they never conflict in flight (cruise-vs-cruise conflicts are 0 in every arm). The earlier finding that Amazon's delays come from its own climbs and descents (COORD2 G1-G3) was measured with 20 m gaps, where cruise-vs-cruise blocks vanish; with gaps under about 20 m the cruise blocks swamp it. So the Amazon-climb explanation holds for the physical conflicts and for delays only at gaps of 20 m or more.
- **P6 was wrong about which company crosses most:** AWZ has the fewest conflicts of all (32 and 11) because Amazon's slow ramps now cross only Wing's long level cruise less often than I assumed and Zipline stays on top; I did not locate why Amazon-Wing falls from 16 to 1 in Houston, so I will not claim a mechanism. But AWZ has the worst delay (36.6 % and 31.5 %): it puts Wing (70-95 m) 12 m under Zipline (107 m), and Wing is the most numerous company, so the cruise-vs-cruise plan blocks (Zipline held by Wing: 10,219) explode.
- **P7 fails for the same reason:** conflicts in flight and delay in the plan check are different things when gaps are smaller than the block.
- **P2** passing says gap size of 10-14 m versus an even 12 m changes nothing in conflicts; it says nothing about delay (A2u cancels more flights, 2.5 % vs 0.8 % in Houston).

## What it adds
Together with COORD2 (gap-sized layers) the two things that matter are **order** (who is on top decides how many real conflicts remain) and **gap against block thickness** (decides how much delay coordination causes). Neither fixes the other. The design tested here (order alone, gaps near 12 m) is not enough; the untested combination is Zipline on top with gaps of 20 m or more, which would need a taller airspace than 120 m (Wing 46-71, Amazon 83/95, Zipline 107 plus a 20 m gap above each layer exceeds the ceiling) or thinner blocks.

## Limits
Three seeds and one wind hour per seed; one company mix per metro; Wing's band was widened to 70-95 m in AWZ, which may matter; related-work search was brief. Exploratory follow-up is not pre-registered.
