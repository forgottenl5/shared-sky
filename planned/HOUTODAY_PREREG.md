# Houston today: only the sites reported flying (written 2026-10-23 before any study run)
Status: behaviour model of planned operations; no plan check; counting at 4 checks per second. Not a forecast or safety assessment.

## Why
Every Houston result so far used the filing caps (Wing 75 nests, Zipline 65 Chargers, Amazon 6 sites), with Wing and Zipline placed at random. The assumptions audit (SKYGRID_MASTER_PLAN.md, items 6, 7 and 9) asked what the model says about the sites actually operating now, at real positions.

## Layout (planned/houtoday.js)
- **Wing, 5 Walmart stores** named in Wing's 15 Jan 2026 Houston launch post: #522 Crosby, #768 Katy (1313 N Fry Rd), #1040 Houston (15955 FM 529 Rd), #3298 Kemah (255 FM 518), #4538 Katy (6060 N Fry Rd). Geocodes: #768 and #4538 from OSM Nominatim store matches (founder paste); #522 and #1040 from the store's map link on allstays.com; #3298 from the geo meta tags of the in-store Boost Mobile page. All five are store-level, not street-level.
- **Amazon, 1 site:** HOU6, 10507 Harlem Rd, Richmond (OSM building match). Operating by Aug 2026 (Hoodline, Aug 2026). Amazon's other five Houston sites are not reported flying and are left out.
- **Zipline, 1 dock** in Cypress (first Houston flights April–May 2026; Zipline newsroom 29 Apr 2026; Community Impact 22 May 2026). The address is not published, so each seed places the dock uniformly within 5 km of the Wikipedia coordinate for Cypress (29.97083, -95.69722). 20 drop boxes within 5 km, as the engine default.
- Counted zone: 104 × 104 km square centred on the sites' bounding box (all service areas inside). Rates, radii and profiles as the engine.

## Arms
Heights: A0 Omaha profile (Amazon 61 / 105); T Texas band (each Amazon leg uniform 55–115); R reported (69 / 122); A2 allocation (Wing 46–71, Amazon 81 / 115). Wing 46–91 and Zipline 101 in A0, T, R.
Volume: **cap** (filed maxima, engine default) and **v20** (every site at 20 % of cap). 20 % is illustrative: the only public figure is about 200 Amazon flights a day at Richardson in early 2026 (secondary report), 20 % of Amazon's 1,000 cap. No Houston volume is published for any company.
Seeds 1–30 for each of the 8 combinations (240 runs). 1 h warm-up, 2 h measured.

## Geometry noted before the runs (from `node planned/houtoday.js`)
Amazon HOU6 and the Cypress area are 33.7 km apart; Amazon's and Zipline's service radii sum to 28.2 km. With the 5 km placement uncertainty the closest possible spacing is 28.7 km, so **Amazon and Zipline cannot meet in this layout.** That pair caused most meetings in every earlier study.
Overlapping pairs: Wing #768 with HOU6 (13.6 km apart, radii sum 21.7) and #4538 with HOU6 (21.5 km, barely); Wing #768, #1040, #4538 with the Zipline dock. Wing Crosby and Kemah overlap no other company.

## Predictions (pooled over seeds)
- **D1:** Amazon–Zipline wide meetings are zero in all 240 runs. PREDICTION: holds (geometry above).
- **D2:** Wing–Amazon is >= 60 % of A0 cross-company wide meetings at cap. PREDICTION: holds.
- **D3:** At cap, A2 cuts R's wide meetings by >= 50 % (full build-out gave 27 %). PREDICTION: holds, because today's Amazon meetings are with Wing, and 69 m sits inside Wing's band.
- **D4:** At cap, A2 cuts A0's wide meetings by >= 50 %. PREDICTION: holds.
- **D5:** At cap, A0 cross-company wide meetings per hour are <= 10 % of HOUREAL A0's (52.5 per hour). PREDICTION: holds.
- **D6:** In R, v20 wide meetings per hour are <= 10 % of cap's. PREDICTION: holds (pairwise meetings scale with the product of the two traffic levels, about 4 %).
- Reported: wide and close counts per arm and volume with exact Poisson 95 % intervals; pair shares; meetings per operating day (per-hour rate × 15 h, a rough scale-up).

## Rules
No changes after the data is in; runner and analysis committed before runs; deviations logged below.
- **K1:** 5 Wing, 1 Amazon, 1 Zipline site; every Zipline dock within 5 km of the Cypress point for seeds 1–30; v20 site rates are 20 % of cap; all flights start at a listed site.

## Deviation log
(none yet)
- (Appended after fingerprint a720b105…; pre-study check only.) K1 PASS: 5 Wing, 1 Amazon, 1 Zipline for seeds 1–30, docks within 5 km of the Cypress point; v20 rates 20 % of cap; all 794 flights (seed 1, A0, cap) start at a listed site.
