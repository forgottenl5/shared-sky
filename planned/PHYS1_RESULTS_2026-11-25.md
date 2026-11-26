# PHYS1 results (2026-11-25)

Pre-registration: planned/PHYS1_PREREG.md (fingerprinted; checks K1-K4 passed before the study runs). Runner planned/phys1_run.js, analysis planned/phys1_analyze.py, full table planned/phys1_results_table.md, raw rows planned/raw/out_phys1.tar.xz. 146 of 146 runs. No deviations.

**6 of 7 predictions passed. P2 failed.**

## Plain summary
With realistic flights and operations in place, which means measured climb and speed-change profiles, 30-degree turns, DFW Zipline as filed, customers where people live, airport detours, the lunch peak and Amazon's 15-hour day, every ranking from the old engine still holds. Shared-out heights still beat today's and the best-sourced heights in both cities. GAP1's spacing is still the best layout. Plan sharing at average GPS still holds far fewer flights under A2 than under today's heights.

The size of the benefit shrinks:
- **Headline cut (S1 to A2):** 61 % in Houston (was 72 %) and 72 % in DFW (was 73-75 %).
- **GAP1 (G1):** 67 % in Houston and 75 % in DFW, below the 70 % predicted for Houston (P2 failed; was 82 / 84 %).
- **G1 over A2:** G1's extra gain over A2 is now small, at 6 points in Houston and 3 in DFW.

The absolute numbers rise a lot. Between-company meetings under A2 are 8 times the old engine's in Houston and 6 times in DFW, on about 1.6 times as many flights in the measured window.

## Results (sums over seeds 1-5; 30 m / 10 m)

| | Houston | DFW |
|---|---|---|
| Flights in window (A2) | 156,791 (old about 97,000) | 106,898 (old about 65,500) |
| Between companies, A0 / S1 / A2 / G1 | 2,316 / 1,858 / 729 / 622 | 1,146 / 883 / 251 / 223 |
| Cut S1 to A2 (P1, ≥ 50 %) | 61 % PASS | 72 % PASS |
| Cut S1 to G1 (P2, ≥ 70 %) | 67 % **FAIL** | 75 % PASS |
| Held under N2, A2 vs A0 (P3, < 0.7×) | 12.2 % vs 43.9 % PASS | 14.3 % vs 45.5 % PASS |
| G1 at ±13.5 m held (P4, < 10 %) | 4.0 % PASS (old 2.7 %) | 3.6 % PASS (old 2.3 %) |
| A2 between vs old engine (P5, ≥ 2×) | 729 vs 92 = 7.9× PASS | 251 vs 41 = 6.1× PASS |
| Within vs between under A2 (P7, ≥ 20×) | 102× PASS | 59× PASS |

## Which factor matters (P6, leave one out, A2 between companies, seeds 1-3)

| Effect of switching off | Houston (REAL 448) | DFW (REAL 138) |
|---|---|---|
| **peak** | −316 | −82 |
| prof (flight profiles) | −213 | +20 |
| pop | −93 | +47 |
| amz15 | −33 | +11 |
| air | +28 | +4 |
| zdfw | n/a | +7 |

The lunch peak is the largest factor in both cities (P6 PASS). In Houston, realistic climb and descent profiles come second and nearly double what is left under A2. Drones spend longer climbing through the other companies' layers, so height separation works less well. This is the main reason the headline cut fell from 72 % to 61 %. In DFW the profile effect is small and reverses sign, because DFW Zipline flies at 41 kt with no dropbox.

## Notes and limits
- **Absolute counts vs the cut.** Absolute counts are driven mainly by an assumed demand shape (peak hour at 2 times the mean). No public hourly data exist. The cut percentages are less sensitive to it: the cut is 63-65 % with peak off vs 62-73 % on.
- **Plan sharing held fewer flights than the old engine, unexplained.** Held shares under N2 are lower than the old engine's for most layouts. For example, A2 holds 12.2 % against 17.1 % in Houston, and Zipline holds 9.0 % against 16.5 %. Yet uncoordinated meetings rose. This is reported, not explained, and needs a diagnostic before any claim is built on it. Amazon is still held for about 97-99 % of flights under N2 in every layout except G1 at ±13.5 m.
- **Within-company meetings.** G1 raises within-company meetings again (Amazon-Amazon 81 to 581 in Houston and 302 to 1,765 in DFW), as in OWN2.
- **Airports.** 4.6 % of Houston flights and 8.5 % of DFW flights detour around 0 ft airport cells. 1.4-1.9 % fly straight through after 20 redraws (K4 limit 3 %).
- **Assumptions and gaps.** Turn limits, Houston Zipline's climb profile and hourly demand are assumptions. Weather, other aircraft, buildings and in-flight avoidance are not modelled.

## Post-hoc check (25 Nov, after the results; not pre-registered)
Why plan sharing holds fewer flights than the old engine. Houston, A2 / N2, seed 1, each factor switched on alone (held = delayed + cancelled, as the analysis):

| Factors on | Held | Zipline held |
|---|---|---|
| none (= old engine) | 17.3 % | 17.2 % |
| flight profiles only | 14.5 % | 13.1 % |
| population / airports / peak / Amazon 15 h only | 17.4-18.3 % | 16.7-17.9 % |
| profiles + peak / + airports / + population | 12.4 % / 12.9 % / 14.4 % | 9.8 % / 10.5 % / 12.6 % |
| all except profiles | 15.6 % | 13.6 % |
| all (REAL) | 11.0 % | 7.2 % |

The drop comes from the realistic flight profiles (mainly Zipline: 75 s vertical climb at the dock instead of 20 s, gradual speed changes), amplified when combined with the peak and airport detours. The mechanism inside the plan check was not established; two explanations (counting definition, the peak alone) were ruled out. No ranking depends on it. Script: not kept in the repo (one-off, scratch).

## Post-hoc check 2 (26 Nov, from the stored rows; not pre-registered): the lower held share is Amazon being cancelled
Held share split into delayed and cancelled, N2 plans, seeds 1-5 (old engine -> realistic):

| | Houston A0 | Houston A2 | DFW A0 | DFW A2 |
|---|---|---|---|---|
| Amazon cancelled | 13 % -> 51 % | 38 % -> 78 % | 4 % -> 39 % | 19 % -> 73 % |
| Zipline delayed | 51 % -> 38 % | 16 % -> 9 % | 50 % -> 39 % | 17 % -> 8 % |
| Wing cancelled | 15 % -> 30 % | 0.2 % -> 0.5 % | 5 % -> 20 % | 0.1 % -> 0.4 % |

With realistic flights most of Amazon's flights are cancelled, not delayed, and cancelled flights stop blocking the others, so Zipline waits about half as much. A follow-up study (CAPACITY1, to be published separately) finds the same effect across traffic levels. **The shared-out heights (A2) cut the overall held share but raise Amazon's cancellations (51 % -> 78 % Houston, 39 % -> 73 % DFW against today's heights).** The overall held share therefore overstates the benefit: A2 helps Wing and Zipline and makes Amazon worse. Only GAP1's spacing with +-13.5 m plans helps all three (Amazon held 41.5 % in Houston and 21.0 % in DFW; plan-sharing table above).

## What it means for the public headline
The public headline ("sharing out heights cuts planned conflicts by 72 % in Houston (95 % interval 67-76 %) and 73 % in DFW (66-80 %)") was measured on the simpler engine. Under realistic flights it is **61 % in Houston and 72 % in DFW**: Houston falls below its old 95 % interval, DFW does not. The ranking is unchanged, and GAP1's extra benefit over A2 is smaller than published. The headline wording should be updated when PHYS1 is released, and must report each company separately (post-hoc check 2).
