# AIRTAXI_ENC1 results (29 Oct 2026). Registration planned/AIRTAXI_ENC1_PREREG.md; runner and analysis committed before any run. K1-K3 passed. 60 simulations (2 metros x 3 levels x 10 seeds), two arms each. No deviations.
Table: planned/airtaxi_enc1_results_table.md. Exploratory diagnosis of X5: planned/diag_enc1_x5.js (labelled exploratory; not scored).

## Result in one line
**With everyone at one cruise height and no steering, the page's networks produce frequent close approaches: at the middle demand level about 27 an hour in DFW and 13 in Houston that air traffic control would have to separate (within 1.5 NM and 500 ft), and most of the en-route ones are literally on top of each other (under 500 ft in 3D). One height per direction removes about two thirds of the en-route ones, not the 80 % predicted, because aircraft still climb and descend through the other height outside the terminal zone, and it does nothing near the sites.** 5 of 6 predictions passed.

## Predictions
- **X1 PASS** every shown setup (seed 1) has en-route near-midair proximities: DFW 28 / 146 / 554 and Houston 23 / 87 / 354 over 12 hours at the three levels.
- **X2 PASS** en-route separation encounters at the middle level: DFW 13.2 an hour, Houston 8.8.
- **X3 PASS** top-to-bottom level ratio 15.0x (DFW) and 14.8x (Houston) for 4x the requests: encounters grow about with the square of traffic.
- **X4 PASS** terminal encounters at the middle level are 1.06x (DFW, 14.0 an hour) and 0.52x (Houston, 4.6) the en-route count.
- **X5 FAIL** one height per direction cut en-route encounters by 61-64 % (DFW) and 70-73 % (Houston), short of 80 %, and left en-route near-midair proximities in every setup (2,662 over all runs).
- **X6 PASS** near sites the height rule does not help: terminal encounters rise by about 9 % in both metros.

## Why X5 failed (exploratory diagnosis, seed 1, middle level)
- Of 60 DFW and 23 Houston arm B en-route encounters, 58 and 20 involve an aircraft climbing or descending. At the engine's climb slope (8:1) reaching 610 m takes about 4.8 km, beyond the 2.78 km terminal zone, so a departure climbs through the other direction's 457 m height while still near the site.
- The rest are both-cruise pairs on two different routes converging on the same hub in the same direction (for example Ellington-to-IAH and Hobby-to-IAH at 457 m).
- So a height per direction is not enough on its own; climb and descent paths and arrivals into shared hubs would also need separating (in practice: ATC sequencing, published routes, or one-way corridors as in the FAA's UAM concept of operations).

## Reading
- The page's "aircraft passing through each other" is real in the model: nothing steers. In reality these are the encounters that pilots (see-and-avoid) and controllers would resolve, and each one costs workload, a turn, a climb or a delay that the model does not charge.
- Encounters grow roughly with the square of traffic, so the busiest level shown (about 48 trips an hour in DFW) implies about 118 an hour that need resolving.

## Limits
- The whole network is treated as if it were in Class B airspace with 1.5 NM / 500 ft separation; parts are outside Class B, where VFR pilots separate themselves.
- Straight lines between sites and one climb slope; real routes, approach paths and heights would differ.
- Holding has no position in the engine, so holding aircraft are not counted (2+ aircraft holding over the same site occurred for at most 0.33 minutes an hour).
- Arm B keeps the engine's flight times and redraws each climb within them (a few seconds' approximation).
