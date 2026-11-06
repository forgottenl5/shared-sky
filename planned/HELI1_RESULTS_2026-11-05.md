# HELI1 results (5 Nov 2026; registration planned/HELI1_PREREG.md)
Full tables: planned/heli1_results_table.md. 14 days of 2025, 1,199 aircraft-days of rotorcraft (437 Houston, 762 DFW), 234 and 461 helicopter-hours in the counted squares during drone operating hours. Checks K1-K2 passed. No deviations.

**2 of 5 predictions passed. Real helicopters spend far more time low than I predicted: 30 % (Houston) and 46 % (DFW) of their time in the counted areas is below 150 m above ground, and 14-17 % is inside the drone height band (46-121 m). But the drones they would meet are few: on average 0.03 drones (Houston) and 0.009 (DFW) in a 450 x 450 x 60 m box around a low-flying helicopter.**

## Predictions
- **H1 FAIL** below 150 m above ground: Houston 29.9 %, DFW 45.9 % (predicted under 15 %).
- **H2 FAIL** inside the drone band 46-121 m: Houston 13.6 %, DFW 16.5 % (predicted under 8 %).
- **H3 FAIL** busiest 5 % of 1 km cells hold 46 % (Houston, 2,181 cells) and 66 % (DFW, 4,411 cells) of low helicopter seconds (predicted over 50 % in both). Low flying is spread out in Houston.
- **H4 PASS** mean drones in the box around low-flying helicopters: Houston 0.029 (S1) / 0.029 (A2); DFW 0.0089 / 0.0089 (predicted under 0.05).
- **H5 PASS** A2 vs S1 differ by 1 % in both metros (predicted under 30 %).

## Reading
- The prediction misses are about the helicopters, not the drones: I expected helicopters to stay well above the drone layers, and they do not. DFW also shows 20 % of helicopter time below 46 m; some of that is arrivals and departures at helipads and airports, which I did not separate.
- The result depends strongly on the assumed ground elevation (not scored): Houston shifted by -30 / +30 m gives 21 % / 40 % below 150 m; DFW shifted by -50 / +50 m gives 32 % / 60 %. Pressure altitude is also not geometric height. Treat the shares as roughly 20-60 %, not as exact.
- Exposure is low on average because drone traffic is concentrated around delivery sites, and in Houston 69-71 % of low helicopter seconds still have at least 0.01 drones expected in the box (37-38 % in DFW). Height sharing (A2 vs S1) does not change helicopter exposure.
- Nothing here counts encounters or collisions, and helicopters and drones are not matched in time of day.

## Limits
- Elevation assumed (not looked up); pressure altitude; volunteer receivers miss low flights, so true helicopter time below 150 m is probably higher; 14 days; flat drone demand; exposure is a box count; helicopters could be separated from drones by rules or avoidance not modelled.

## Deviation log
(none)
