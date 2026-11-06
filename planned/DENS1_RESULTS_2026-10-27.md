# DENS1 results (registration planned/DENS1_PREREG.md; two deviations logged there, incl. a DFW rate bug fixed and all DFW runs redone)
Tables: planned/dens1_results_table.md. K2 passes in both metros after the fix; k=1 identity check passes for all six G20 cells.

## Predictions: 3 of 6 passed, 3 failed
- **D1 FAIL (near miss)** no-coordination conflicts grow roughly with demand squared, but the fitted exponents are 1.65 / 1.68 (Houston A2 / G20) and 2.41 / 2.34 (DFW), outside the registered 1.7-2.3 band. DFW's low-demand counts are tiny (0.2 per hour), so its slope is poorly determined. Qualitatively the gas-model baseline holds (about x30 more conflicts from k = 0.25 to 2 in Houston, x90 in DFW, against x64 for an exact square).
- **D2 FAIL** with A2 heights the delayed share almost stops rising above today's demand: Houston 19.2 % -> 20.5 %, DFW 16.7 % -> 19.3 % at double demand. The cost moves into cancellations (Houston 0.8 % -> 2.3 %) and longer waits instead. Not diagnosed; one untested reading is that under A2 most of the cost is the structural overlap of the 10-14 m layer gaps (COORD1/2), which is already near its maximum at k = 1.
- **D3 PASS** gap-sized layers (G20) cost less at every demand level in both metros (e.g., Houston at double demand 12.0 % vs 20.5 % delayed, 0.45 % vs 2.27 % cancelled).
- **D4 FAIL** Houston A2 cancellations at double demand are 2.27 %, below the predicted 3 %.
- **D5 PASS** the mean wait of delayed flights rises at every step in all four cells (Houston A2 217 -> 400 s; DFW G20 164 -> 254 s). Shape matches the Riga study's direction (delay rises with demand); our delays are minutes, not hours, because flights can fly at different heights and wait in 30 s steps with a 20-minute cap.
- **D6 PASS** flown conflicts under V2 stay at or below 0.67 per hour at double demand.

## What it adds
- A reproducible delay-versus-demand curve from the companies' filed Texas layouts, by height plan. With gap-sized layers, the share of flights delayed grows steadily with demand (about 3 % -> 12 % in Houston from a quarter to twice the filings); with the current shared-out layers it is already near 20 % at the filed level and stays there while cancellations grow.
- Remaining caveats unchanged: volume sizes are assumptions, three seeds per cell, behaviour model, F3548 itself not read.
