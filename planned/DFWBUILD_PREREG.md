# DFW build-out, stage by stage (written 2026-10-24 before any study run)
Status: behaviour model of planned operations. The DFW twin of BUILDOUT, so both metros get the same treatment. Not a forecast or safety assessment.

## Sites by stage (planned/dfwbuild.js; run with METRO=dfw through planned/buildout_run.js)
| Stage | Wing | Zipline | Amazon | Volume |
|---|---|---|---|---|
| early | 19 | 19 | 2 (STX8 Richardson, + STX2) | 50 % |
| mid | 38 | 38 | 3 (+ STX3) | 75 % |
| full | 75 (cap) | 75 (cap) | 6 of 7 (+ DAL3, DFW7, FTW4; IAH1 not geocoded) | 100 % |
- Amazon positions from DFWREAL (OSM, founder pastes). STX8 first because it is the DFW site known to be flying. Wing and Zipline positions are not public: all random in the counted square, nested across stages.
- **No "today" stage:** neither Wing nor Zipline publishes its operating DFW site list or count (DroneXL trackers, 20 and 22 Oct 2026).
- Filed per-site caps: Wing 400 a day; Zipline 400 a day (DFW EA, less than half its Houston figure); Amazon 1,000 a day. Counted zone 80 × 80 km (as DFWREAL).
- Heights A0 / R / A2 and plan-check variants exactly as BUILDOUT (still5, wind5, wind30), with the DFW median wind hour picked by the same rule from data/openmeteo_dfw_2025.json. Corrected engine (PCFIX) and counting bounded to the window. Seeds 1–3. 3 stages × 3 × 3 × 3 = 81 runs.

## Predictions (wide meetings, pooled over seeds)
- **D1:** at full, Omaha profile, no check: 15–30 close calls an hour (DFWREAL gave 22). PREDICTION: holds.
- **D2:** sharing out cuts >= 65 % at mid and at full. PREDICTION: holds.
- **D3:** Amazon–Zipline is >= 50 % of A0 close calls at full. PREDICTION: holds.
- **D4:** at full, A0, DFW median wind, the ±30 s check removes < 80 % (as in Houston). PREDICTION: holds.
- **D5:** at mid, Omaha profile: 3.2 close calls an hour or fewer (half of Houston's mid), because Zipline flies less than half as much per site. PREDICTION: holds.

## Rules
No changes after the data is in; code committed before runs; deviations logged below.
- **K1:** site counts per stage as the table, all in zone; **K2:** stages nest.

## Deviation log
(none yet)
- (Appended after fingerprint.) K1/K2 PASS: early 19/19/2, mid 38/38/3, full 75/75/6, all in zone; stages nest. Run while writing the code, before this text.
