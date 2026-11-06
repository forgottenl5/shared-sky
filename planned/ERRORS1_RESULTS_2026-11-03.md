# ERRORS1 results (3 Nov 2026; registration planned/ERRORS1_PREREG.md, fingerprint 38ec6df9…; runner/analysis commit 2e20370 and later)
Full tables: planned/errors1_results_table.md. 276 runs (Study A 168, Study B 108); checks K1-K4 passed before the runs. Two background shards were stopped by the 2-hour limit and resumed; finished jobs are skipped, so no result was changed. No deviations.

**10 of 13 predictions passed. The three misses (E2, E3, E4) are all the same direction: the height-sharing cut held up better than I predicted at the middle and large error levels.**

## Predictions
- **E1 PASS** cut at L1 (about best-site GPS): Houston 76 %, DFW 79 %.
- **E2 FAIL** cut at L2 (GPS standard average): Houston 63 %, DFW 59 %; I predicted 30-60 %. Houston is above the band, DFW inside it, so it fails as registered.
- **E3 FAIL** cut at L3 (committed worst site): Houston 30 %, DFW 26 %; I predicted below 25 %.
- **E4 FAIL** cut at L4 (Remote ID rule size): Houston 20 %, DFW 23 %; I predicted below 15 %.
- **E5 PASS** the cut never rises step to step: Houston 80, 76, 63, 30, 20; DFW 81, 79, 59, 26, 23.
- **E6a PASS** height error alone (Z4) removes most of the loss: the cut falls by 58 points (Houston) and 54 (DFW) from L0.
- **E6b PASS** sideways error alone (H4) changes the cut by -1 and -2 points.
- **E6c PASS** late start alone (T4) changes it by 3 points.
- **E7 PASS** plan check removes 99.2 % (Houston) and 98.3 % (DFW) of flown conflicts at L0.
- **E8 PASS** at L2 it removes 82.8 % and 77.3 %.
- **E9 PASS** at L4 it removes 18.1 % and 22.1 %: the minimal reservation (30 m wide, +-10 m) does little when errors reach 30-46 m.
- **E10 PASS** the larger V3 reservation (+-46 m high) leaves 0-1 flown conflicts at L2 and L4 (V2: 61 and 721 in Houston, 35 and 271 in DFW).
- **E11 PASS** V3 delays 2.0 (Houston) and 2.75 (DFW) times as many flights as V2 at L0 (37 % and 47 % against 18 % and 17 %).

## Reading
- Published GPS-level errors (L1, L2) leave most of the cut: about 76-79 % at best-site GPS and 59-63 % at the standard's average. At the worst committed site and at the Remote ID rule size the cut falls to 20-30 %, so the result depends on drones keeping height within about 13 m 95 % of the time.
- The loss is almost entirely height error. Sideways error and late starts alone change the cut by 3 points or less.
- The plan check's value depends on the size of the reserved block: the minimal one (V2) protects well at L0-L2 and little at L4; a block taller than the height error (V3) holds at the price of about twice the waiting flights (37-47 % in windy hours).
- Intervals over 6 seeds are wide (Study A cut, 95 % bootstrap: for example DFW L4 12-32 %).

## Limits (as registered, plus what the results show)
- Errors are independent between flights and constant within a flight. Real errors are partly shared by nearby drones, so L2-L4 likely overstate the damage; the three failures (the cut held better than predicted) fit that only in part, and I did not test it.
- Late-start sigma is an assumption. No published figure for fused GPS plus barometer altitude on delivery drones; L1-L4 are not measurements of any company's aircraft.
- No avoidance manoeuvres are modelled; absolute conflict counts are counts of plan overlaps, not collision risk.
- In Study B the delayed shares do not change with error level, because the check sees only nominal plans; that is by design.

## Correction (4 Nov 2026)
The registration's "Why" quotes the 72 % / 73 % headline, but Study A, as registered, compares A2 with A0 (the filed current heights), which gives 80 % / 81 % without errors. The headline compares A2 with S1 (Amazon at its best-sourced heights) and was not rerun with errors. The results above are correct for A0 vs A2; how the 72 % / 73 % case behaves under errors is untested. The findings page first linked the two and was corrected the same day.

## Deviation log
(none)
