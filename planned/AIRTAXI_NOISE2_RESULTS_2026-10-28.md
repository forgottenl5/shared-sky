# AIRTAXI_NOISE2 results (28 Oct 2026). Registration planned/AIRTAXI_NOISE2_PREREG.md; runner and analysis committed before any run. K1 (noise layer reproduced cell for cell), K2 and K3 passed. 90 runs. No deviations.
Table: planned/airtaxi_noise2_results_table.md.

## Result in one line
**Nobody off-site reaches the FAA's 65 dB day-night threshold in any run, even with flights until midnight (highest 56.8 dB), and nobody lives where it reaches 55 dB: the loudest off-site squares are airport land. About 7,600 people near the DFW network and about 2,100 near Houston's would hear at least 10 loud (55 dBA) flights a day at the middle demand level.** 2 of 5 predictions passed.

## Predictions
- **P1 PASS** no off-site cell reaches DNL 65 in any of 90 runs; the maximum is 56.8 dB (DFW, 48 trips an hour, flights to midnight).
- **P2 FAIL (narrowly)** flying until 22:00 raised the peak off-site DNL by 0.30-0.93 dB, not 0.5-1.0 in every case: two DFW levels rose only about 0.3 dB. The peak cell is set by take-offs and landings near the pads, and the extra evening flights do not all add to the same cell.
- **P3 FAIL (narrowly)** flying until midnight raised it by 2.4-3.3 dB, against 2.8-3.8 predicted (DFW at 12 trips an hour: 2.37).
- **P4 PASS** people with at least 10 loud flights over 06:00-18:00: DFW 24 trips/h 7,623; Houston 12 trips/h 2,060 (medians over 5 seeds).
- **P5 FAIL** nobody lives at DNL >= 55 in any run, even at the highest level flying until midnight. Off-site cells that loud are next to the airport sites, where the Census counts no residents.

## Reading
- The loud-flight footprint (N55) is small and mostly over airport land; the people inside it are a few thousand per metro, not tens of thousands. The page's earlier wording ("loud noise stays within about 2.4 km") stands.
- Longer operating days add little to the day-night level (under 1 dB to 22:00, about 2.5-3.3 dB to midnight) because the 06:00-07:00 hour already counts as night.

## Limits (read before quoting the people counts)
- **Counts are lumpy.** Census 2020 places each block's whole population at one point, and blocks near these sites can be large: across seeds and windows the DFW count takes only two values (3,366 or 7,623) because one block of about 4,300 people falls just above or just below 10 loud flights. Treat the counts as "a few thousand", not as exact.
- A longer day is a separate random run, so its first 12 hours are not the same flights as the 12-hour run; the two are compared as medians over seeds.
- Same noise model as NOISE1 (point source, spherical spreading, Joby's reported levels, straight departure lines toward the next site, holding as a hover over the site). Wind-aligned departures not modelled.
