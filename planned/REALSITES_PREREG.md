# Build-out on real candidate sites (written 2026-10-24 before any study run)
Status: behaviour model of planned operations. Replaces most random Wing and Zipline positions with real Walmart stores, as the gap list asked. Not a forecast.

## Data
OpenStreetMap Walmart stores (Supercenters and Neighborhood Markets), founder downloads 24 Oct 2026: 69 in the Houston counted zone (84 × 84 km), 116 in DFW's (80 × 80 km); data/walmart_houston_osm.json, data/walmart_dfw_osm.json.

## Growth rule (planned/realsites.js)
Each company starts from its known sites and repeatedly claims the unclaimed Walmart nearest to its existing network. Wing and Zipline pick in turn. When stores run out, remaining sites are random (stated per stage).
- **Houston:** Wing starts from its 13 operating stores (each also removes its nearest OSM store from the pool, so a store is never used twice); Zipline's Houston partners are restaurants and a hospital system, not Walmart, so Zipline stays as BUILDOUT (Cypress dock plus random). Real sites by stage: Wing 13 / 19 / 38 / 69 of 13 / 19 / 38 / 75.
- **DFW:** Wing starts at Frisco and Little Elm (its first DFW nests); Zipline at Mesquite (its first DFW site). Real sites: Wing 19 / 38 / 59 of 19 / 38 / 75; Zipline 19 / 38 / 57 of 19 / 38 / 75.
- Amazon, stages, volumes and zones as BUILDOUT and DFWBUILD.

## Runs
Heights: A0 Omaha profile; S1 best-sourced (69 m out, back uniform 85–115 m; AMZSRC); A2 shared out. No plan check. Counting bounded to the 2 h window. Seeds 1–3. Houston 4 stages, DFW 3. 63 runs. Random-site references: BUILDOUT v2 and DFWBUILD A0 (same counting).

## Predictions (pooled over seeds)
- **R1:** Houston full, Omaha profile: 0.7–1.5× the random-site value. PREDICTION: holds.
- **R2:** sharing out cuts the Omaha-profile close calls by >= 65 % at mid and full, both metros. PREDICTION: holds.
- **R3:** sharing out cuts the best-sourced close calls by >= 55 % at full, both metros. PREDICTION: holds.
- **R4:** DFW full, Omaha profile: 0.7–1.5× the random-site value. PREDICTION: holds.
- **R5:** Houston mid, Omaha profile: real sites give at least as many close calls as random sites (Walmarts cluster in the suburbs where Amazon also flies). PREDICTION: holds.

## Rules
No changes after the data is in; code committed before runs; deviations logged below.
- **K1:** site counts per stage as above, all in zone, stages nest, both metros.

## Deviation log
(none yet)
- (Appended after fingerprint.) K1 PASS (both metros). Code check run while writing, before this text.
