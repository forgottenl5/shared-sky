# Real-Houston layout at the filed caps (written 2026-10-23 before any study run)
Status: behaviour model of planned operations; no plan check; counting at 4 checks per second. Not a forecast or safety assessment; filed caps are maxima, not today's traffic.

## Why
Every result so far used random site layouts at 2–9 km spacing in a 12 km zone. Houston's filings give each operator's maximum: Amazon 6 sites (addresses in its final Texas EA), Wing up to 75 nests, Zipline up to 65 Chargers (TEXAS_FILINGS_2026-10-23.md). This study asks what the filed plans imply at that real metro scale.

## Layout (planned/houreal.js)
- Amazon: 5 of its 6 Houston sites at geocoded positions (SAHx from the EA's coordinates; HOU2, HOU6 from OSM building matches; STX4 from an OSM address point; STX5 street-level only, up to ~1 km off). SAH1 (1202 E FM 1960 Rd) could not be geocoded and is excluded, so Amazon traffic is at 5/6 of its Houston cap.
- Wing 75 nests and Zipline 65 Chargers: uniform at random in the counted square (their locations are not published); seed stream seed + 31,337.
- Counted zone: 68 × 68 km square (4,624 km²) centred on the Amazon sites' bounding box; all five inside. No sites outside the zone, so traffic thins toward its edges (stated as a limit).
- Rates and ranges as the engine (Wing 400/day, 6 mi; Zipline 950 in 15 h, 10 mi; Amazon 1,000/day, 7.5 mi). 1 h warm-up, 2 h measured.

## Arms (seeds 1–3)
A0 Omaha profile (Amazon 61 / 105); T Texas band (Amazon each leg uniform 55–115); R reported (69 / 122); A2 allocation (Wing 46–71, Amazon 81 / 115). Wing 46–91 and Zipline 101 in A0, T, R.

## Predictions (pooled over seeds)
- **G1:** Amazon takes part in >= 70 % of A0's cross-operator wide meetings. PREDICTION: holds.
- **G2:** A2 cuts A0's wide meetings by >= 65 %. PREDICTION: holds.
- **G3:** A2 cuts R's wide meetings by <= 50 %. PREDICTION: holds.
- **G4:** A2 cuts T's wide meetings by >= 55 %. PREDICTION: holds.
- Reported: wide and close meetings per hour, per 1,000 km² per hour (to compare with HOUSTON2), and per Amazon site; pair shares.

## Rules
No changes after the data is in; runner and analysis committed before runs; deviations logged below.
- **K1:** 5 Amazon sites at the listed positions, all within the zone; 75 Wing and 65 Zipline sites; every Amazon flight starts within 30 m of one of the five positions.

## Deviation log
(none yet)
- (Appended after fingerprint b5a70f43…; pre-study check only.) K1 PASS: 5 Amazon sites, all in zone; 75 Wing, 65 Zipline; all 911 Amazon flights (seed 1, A0) start at one of the five positions.
