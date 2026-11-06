# Houston today: results (2026-10-23)
Pre-registration: HOUTODAY_PREREG.md, sha256 a720b105…, committed with runner and analysis (77694e3) before any run. K1 passed. 240 runs (4 height arms × 2 volumes × 30 seeds), 2 measured hours each. No deviations.

## Result in one line
**With only the sites reported flying today (5 Wing stores, Amazon's Richmond site, one Zipline dock in Cypress), the filed plans almost never put two companies' drones close together:** 1–2 planned meetings in 60 simulated hours at the filed maximum volumes, none at 20 % of them. Under the full filed build-out (HOUREAL) the same model gives about 52 an hour.

## Counts (pooled over 30 seeds, 60 measured hours per row)
| Heights | Volume | Cross-company wide meetings [95 %] | Close | Per hour | Pairs |
|---|---|---|---|---|---|
| A0 Omaha profile | cap | 1 [0–6] | 0 | 0.02 | Wing–Zipline 1 |
| T Texas band | cap | 1 [0–6] | 0 | 0.02 | Wing–Zipline 1 |
| R reported | cap | 2 [0–7] | 0 | 0.03 | Wing–Zipline 1, Amazon–Wing 1 |
| A2 allocation | cap | 1 [0–6] | 0 | 0.02 | Amazon–Wing 1 |
| any | v20 (20 % of cap) | 0 [0–4] each | 0 | 0 | — |

## Predictions
| Prediction | Result | Verdict |
|---|---|---|
| D1 Amazon–Zipline meetings zero in all 240 runs | 0 | **PASS** |
| D2 Wing–Amazon >= 60 % of A0 meetings at cap | 0 % (A0 had one meeting, Wing–Zipline) | **FAIL** |
| D3 A2 cuts R by >= 50 % at cap | 50 % (2 → 1) | PASS on paper; **not meaningful**: 2 vs 1 is noise |
| D4 A2 cuts A0 by >= 50 % at cap | 0 % (1 → 1) | **FAIL**; also not meaningful |
| D5 A0 per hour <= 10 % of HOUREAL | 0.02 vs 52.5 (about 0.03 %) | **PASS** |
| D6 R at 20 % volume <= 10 % of cap | 0 vs 0.03 | PASS (both near zero) |

I predicted that allocation would still help noticeably today (D2–D4). That was wrong: there is too little overlap for any height plan to matter. The counts are too small to rank the height arms against each other.

## Why
- Amazon's Richmond site is 34 km from Cypress. Amazon's and Zipline's ranges together reach 28 km, so the two cannot meet. That pair caused most meetings in every earlier study.
- Wing's Crosby and Kemah stores overlap no other active operator.
- The remaining overlaps (Katy stores with Richmond's edge and with the Cypress dock) are thin slivers at the edge of each service area. Flights there are few, and the drones are usually at cruise, where Wing (46–91 m) and Zipline (101 m) are already 10 m or more apart.

## What this means
- The cross-company height question is about **build-out**, not today. It starts to matter when a second Amazon site or more Zipline docks open near Wing stores. HOUREAL (full filed caps) gives about 52 planned meetings an hour; today gives about 0.02.
- This gives the page an honest framing: "Today: practically no overlap. As filed: the overlap is concentrated in Amazon–Zipline, and height allocation decides how much of it there is."
- Limits: the Zipline dock position is unknown (sampled within 5 km of Cypress). Today's volumes are not published (20 % is illustrative). Wing nests may exist beyond the five stores in Wing's January post. Customers are uniform within each service area, so Census weighting is a later study.

## Sources
- [Wing: Greater Houston launch, five stores (15 Jan 2026)](https://wing.com/news/greater-houston-kicks-off-walmart-wing-expansion-year)
- [Hoodline: Amazon drone from the Richmond facility (Aug 2026)](https://hoodline.com/2026/08/amazon-drone-dunks-package-in-richmond-woman-s-backyard-pool/); [Hoodline: Richmond first Houston launch (May 2026)](https://hoodline.com/2026/05/amazon-drones-zero-in-on-richmond-for-first-houston-launch/)
- [Zipline newsroom: Houston early access (29 Apr 2026)](https://www.zipline.com/newsroom/zipline-launches-early-access-drone-delivery-program-in-houston); [Community Impact: first Houston flight in Cypress (22 May 2026)](https://communityimpact.com/cypress/transportation/zipline-drone-delivery-first-houston-flight-launches-in-cypress/)
- Store geocodes: [allstays #522](https://allstays.com/c/Walmart/TX-Crosby-Wal-Mart-522.htm), [allstays #1040](https://allstays.com/c/Walmart/TX-Houston-Wal-Mart-1040.htm), [Boost Mobile in Walmart Kemah](https://www.boostmobile.com/locations/bd/boost-mobile-inside-walmart-tx-kemah-255-fm-518-rd-77565); OSM Nominatim (#768, #4538, HOU6); [Wikipedia: Cypress, Texas](https://en.wikipedia.org/wiki/Cypress,_Texas)

## Superseded (24 Oct 2026)
The "today" layout used only the 5 stores in Wing's January post; Wing had 13 Houston stores by July 2026 (CultureMap, 8 Jul 2026). BUILDOUT's "today" stage replaces this study's layout.

(Note added 29 Oct 2026.) The July 2026 count of 13 Wing hubs in Houston is also reported by DroneLife (8 Jul 2026), whose article says Wing's network grew from 5 to 13 operating "Nests"; the public pages cite DroneLife. The count is of hubs, which the earlier text here called stores.
