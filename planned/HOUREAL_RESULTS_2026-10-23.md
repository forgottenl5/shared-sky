# Real-Houston layout at the filed caps: results (HOUREAL_PREREG.md, fingerprint b5a70f43…), 2026-10-23
K1 passed. 12 runs (about 100 s each); analysis script committed before the runs. All four predictions passed.

| Arm | runs | cross wide | cross close | wide per hour (per run) | per 1,000 km² per hour | pairs (wide) |
|---|---|---|---|---|---|---|
| A0 | 3 | 315 | 122 | 52.5 | 11.35 | {'amazon-zipline': 240, 'amazon-wing': 59, 'wing-zipline': 16} |
| T | 3 | 226 | 59 | 37.7 | 8.15 | {'amazon-zipline': 152, 'wing-zipline': 16, 'amazon-wing': 58} |
| R | 3 | 89 | 26 | 14.8 | 3.21 | {'amazon-wing': 53, 'amazon-zipline': 20, 'wing-zipline': 16} |
| A2 | 3 | 65 | 18 | 10.8 | 2.34 | {'amazon-wing': 10, 'wing-zipline': 26, 'amazon-zipline': 29} |
A2 cut vs A0: wide 79 %, close 85 %
A2 cut vs T: wide 71 %, close 69 %
A2 cut vs R: wide 27 %, close 31 %
| Prediction | Result | Verdict |
|---|---|---|
| G1 Amazon in >= 70 % of A0 wide | 95 % | **PASS** |
| G2 A2 cut vs A0 >= 65 % | 79 % | **PASS** |
| G3 A2 cut vs R <= 50 % | 27 % | **PASS** |
| G4 A2 cut vs T >= 55 % | 71 % | **PASS** |
Runs read: 12 (expected 12).

## What this means
1. **The pattern holds at Houston's real filed scale.** With Amazon's five geocoded Houston sites and the Wing and Zipline filing caps (75 nests, 65 Chargers) spread over 68 × 68 km, the allocation cuts planned meetings between operators by 79 % (Omaha profile), 71 % (Texas band) and 27 % (reported heights), close to the build-out results (81 / 75 / 23 %).
2. **Absolute rate at the caps:** about 52 planned meetings per hour across 4,624 km² with the Omaha profile (11 per 1,000 km² per hour), 15 per hour if Amazon flies as reported. These are filed maxima, not today's traffic, and Wing and Zipline positions are random.
3. **Amazon is in 95 % of the meetings** with the Omaha profile; Amazon–Zipline is the largest pair in every arm except R and A2.
4. Under A2, Wing–Zipline meetings rise (16 → 26), likely because Wing's band narrows to 46–71 m and its climbs to and from cruise spend longer near other traffic; not tested.
5. Limits: SAH1 excluded (5/6 of Amazon's Houston sites); STX5 position street-level; no sites outside the zone, so traffic thins at the edges.
