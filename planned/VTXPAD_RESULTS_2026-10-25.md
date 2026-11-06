# Drones over air-taxi landing spots in DFW: results (VTXPAD_PREREG.md, sha256 6ae21d6d…), 2026-10-25
K1, K2 passed first time. 30 runs (3 stages × seeds 1–10), DFWBUILD sites, Omaha profile, 2 h measured. All four predictions passed.

## Result in one line
**At full DFW build-out, about 19 delivery drones an hour pass within 1 km of Toyota's Plano HQ (range 7–51 over random layouts) and about 6 within 300 m; on average 0.4 drones are inside that 1 km circle at any moment.** All are Wing or Zipline: Amazon's nearest site is out of range. At a quarter of the filed sites the rate is about a seventh of that.

## Drone flights passing per hour (median over 10 seeds; range)
| Point | Stage | within 1 km | within 300 m | drones inside 1 km at a random moment | Wing / Zipline / Amazon share at 1 km |
|---|---|---|---|---|---|
| TOY | early | 2.8 (0.0–18.0) | 0.5 (0.0–6.0) | 0.07 | 17 / 83 / 0 % |
| TOY | mid | 7.5 (1.0–25.0) | 1.8 (0.0–7.5) | 0.18 | 27 / 73 / 0 % |
| TOY | full | 18.8 (7.0–50.5) | 6.2 (2.0–22.0) | 0.42 | 14 / 86 / 0 % |
| AFW | early | 1.2 (0.0–6.0) | 0.8 (0.0–2.0) | 0.04 | 87 / 13 / 0 % |
| AFW | mid | 4.8 (1.0–20.5) | 1.5 (0.0–6.0) | 0.13 | 38 / 62 / 0 % |
| AFW | full | 27.8 (19.0–44.0) | 7.0 (6.5–13.5) | 0.72 | 20 / 29 / 51 % |
| DFW | early | 1.8 (0.0–5.0) | 0.5 (0.0–1.5) | 0.05 | 17 / 83 / 0 % |
| DFW | mid | 4.8 (0.5–14.5) | 0.8 (0.5–3.5) | 0.11 | 20 / 80 / 0 % |
| DFW | full | 20.0 (3.5–33.0) | 6.2 (2.0–14.0) | 0.46 | 26 / 74 / 0 % |

TOY position sensitivity (full, 1 km, medians at 8 points 500 m away): 16.2–22.0 (centre 18.8)

| Prediction | Result | Verdict |
|---|---|---|
| V1 TOY full 1 km median 5–40 an hour | 18.8 | **PASS** |
| V2 TOY full 300 m median 1–12 | 6.2 | **PASS** |
| V3 Amazon passes at TOY 0 everywhere | max 0 | **PASS** |
| V4 early <= 25 % of full (TOY 1 km) | 15 % | **PASS** |
Runs read: 30 (expected 30).

## Reading
- **The rate is set mostly by where Wing and Zipline put their sites, which is not public.** Across random layouts the Toyota count ranges 7–51 an hour; moving the point 500 m changes the median only 16–22. Real Wing and Zipline DFW positions would narrow this.
- **Alliance Airport (AFW) is the exception for Amazon:** Amazon’s DFW7 site is 2.7 km away (FTW4 3.1 km); both open only at full build-out, so half of AFW's passes at full build-out are Amazon. AFW and DFW counts are upper bounds: the model does not keep drones out of airport areas where FAA facility maps set low or zero ceilings.
- **What this means for air taxis:** a vertiport on a suburban campus like Toyota's would see a delivery drone within 1 km every few minutes at full build-out, and one within 300 m about every 10 minutes. Any eVTOL approach or departure through 0–122 m there would need the drone operators' plans shared, the same plan sharing (ASTM F3548) the delivery companies already use with each other.

## Limits
- Air taxis are not simulated; no published altitude, approach path or schedule exists for Joby's Texas flights (Joby, 10 Sept 2026).
- Toyota and DFW Airport coordinates are approximate (not sourced); the 500 m sensitivity shows this matters little at 1 km.
- Arlington is not studied: no landing spot is published.
- Straight-line routes; no corridors (CORRIDOR showed corridors can concentrate passes strongly near sites).

Sources: Joby, "Joby Launches eIPP Flights in Texas" (10 Sept 2026); Wikipedia, Perot Field Fort Worth Alliance Airport (coordinates) and Toyota Motor North America (address).
