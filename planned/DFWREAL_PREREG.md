# Real Dallas–Fort Worth layout at the filed caps (written 2026-10-23 before any study run)
Status: behaviour model of planned operations; no plan check; counting at 4 checks per second. Not a forecast or safety assessment; filed caps are maxima, not today's traffic.

## Why
HOUREAL put Houston's filed plans on a real layout. DFW is the second metro with all three companies filed, a different company mix (Zipline at 400 a day per site rather than about 950) and Amazon's Richardson site, where our real-world overflight check is. This asks whether the Houston pattern holds in a second real metro.

## Layout (planned/dfwreal.js)
- **Amazon: 6 of its 7 DFW sites** at OSM positions from the founder's Nominatim pastes: STX8 Richardson, STX2 Carrollton, STX3 Dallas (4445 Rock Quarry Rd; OSM labels the building "Amazon VTX3"), DAL3 Dallas, DFW7 Haslet, FTW4 Fort Worth. **IAH1** (9155 Southlink Dr) could not be geocoded and is excluded, so Amazon runs at 6/7 of its DFW cap. STX3 and DAL3 are 1.4 km apart.
- **Wing 75 nests** (DFW supplemental EA cap, 400 a day each) and **Zipline 75 sites** (DFW EA cap; **400 a day per site**, rate 400 / 15 h) uniform at random in the counted square (positions not published); seed stream seed + 31,337.
- Counted zone: 80 × 80 km square centred on the Amazon sites' bounding box; all six inside. Radii and profiles as the engine. 1 h warm-up, 2 h measured.

## Arms (seeds 1–3)
A0 Omaha profile (Amazon 61 / 105); T Texas band (each leg uniform 55–115); R reported (69 / 122); A2 allocation (Wing 46–71, Amazon 81 / 115). Wing 46–91 and Zipline 101 in A0, T, R.

## Predictions (pooled over seeds; Houston HOUREAL for comparison: Amazon in 95 % of A0 meetings; A2 cuts 79 / 71 / 27 %; random-layout DFW mix (ROBUST): 50–54 % vs A0)
- **F1:** Amazon takes part in >= 60 % of A0's cross-company wide meetings. PREDICTION: holds.
- **F2:** A2 cuts A0's wide meetings by >= 45 %. PREDICTION: holds.
- **F3:** A2 cuts R's wide meetings by <= 50 %. PREDICTION: holds.
- **F4:** A2 cuts T's wide meetings by >= 40 %. PREDICTION: holds.
- Reported: wide and close counts, per hour, per 1,000 km² per hour, pair shares.

## Rules
No changes after the data is in; runner and analysis committed before runs; deviations logged below.
- **K1:** 6 Amazon sites at the listed positions, all within the zone; 75 Wing and 75 Zipline sites; every Zipline site at 400 a day; every Amazon flight starts within 30 m of a listed position.

## Deviation log
(none yet)
- (Appended after fingerprint 55f9bb81…; pre-study check only.) K1 PASS: 6 Amazon sites, all in zone; 75 Wing, 75 Zipline, all Zipline at 400 a day; all 1,092 Amazon flights (seed 1, A0) start at a listed position.
