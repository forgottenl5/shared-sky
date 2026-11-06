# AIRTAXI_NOISEWIND1 results (29 Oct 2026). Registration planned/AIRTAXI_NOISEWIND1_PREREG.md; runner and analysis committed before any run. K checks passed (K1 reproduced the page's noise layer cell for cell). 60 runs. One deviation (D1, an output-file naming slip; no effect on any number).
Table: planned/airtaxi_noisewind1_results_table.md. Raw rows: planned/raw/airtaxi_noisewind1_*.json.

## Result in one line
**Taking off and landing into the real wind spreads the loud-flight footprint over about 2.5 to 3.8 times as many 200 m squares and lowers the single loudest spot by 0.3 to 3 dB, but the number of people who would hear 10 or more loud flights a day goes up in five of six setups (for example DFW at 48 trips an hour, 7,600 to 15,600); nobody lives where the day-night level reaches 55 dB, and no off-site square gets near 65.** 4 of 5 predictions passed.

## Predictions
- **P1 PASS** no off-site cell reaches DNL 65 in any of the 60 runs (highest 54.2 dB).
- **P2 FAIL** I predicted the peak off-site DNL would move by less than 1.5 dB everywhere. Houston's peak fell 2.4-3.0 dB (all three levels); DFW's fell 0.3-0.9 dB. Spreading the climb-outs and approaches over several wind directions lowers the worst spot more than I expected at Houston's small three-site network.
- **P3 PASS** people with at least 10 loud flights changed by more than 20% in all 6 setups (rising in 5 of 6) (DFW 3,366 to 6,524, 7,623 to 9,557 and to 15,622; Houston 2,060 to 4,422 and to 5,692; Houston's lowest level fell to 1,369). Note a pass here means "the answer depends on the wind assumption", not a direction.
- **P4 PASS** nobody lives at DNL >= 55 in any wind run.
- **P5 PASS** the number of off-site squares with at least one loud flight rose in all six setups (DFW 268 to 657-673; Houston 144 to 489-542).

## Reading
- The straight-line departure assumption in NOISE1 and NOISE2 puts all loud climb-outs and approaches on a few lines, which makes a narrow, intense footprint. Real flights into a changing wind would share the burden over many more neighbourhoods at a lower level each.
- So the earlier "a few thousand people hear 10 or more loud flights a day" is not robust to this assumption: with wind-aligned paths it is roughly 1,400 to 15,600 depending on the setup. The statement that nobody reaches DNL 55 off-site holds either way.

## Limits (read before quoting)
- One real weekday per seed (5 per metro), so five wind situations, not a year. The same wind direction is used at every site in the metro for a given hour, and calm hours use the recorded direction with no cut-off.
- The cruise leg is still the straight line between sites; the join between cruise and the wind-aligned climb-out or approach is not flown (the noise source just changes position), so the geometry near the join is not physical.
- Same noise model as NOISE1 and NOISE2 (point source, spherical spreading, Joby's reported levels, hover over the site while holding). The page's noise layer still shows the straight-line version.
- Counts are lumpy: Census 2020 puts a whole block's people at one point and one block of about 4,300 people decides much of the DFW counts.
