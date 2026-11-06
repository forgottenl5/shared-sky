# Prior-art check for the VALLOC finding (height allocation between delivery operators), 2026-10-22
Claim being checked: "In the operators' own FAA filings, Amazon's inbound baseline (345 ft) sits 4 m from Zipline's 330 ft cruise and hover height; in a simulated Houston build-out at filed caps this pairing dominates cross-operator planned meetings, and a reallocation inside each operator's filed band removes ~80 % of them (~90 % of close ones)."

## Found (related, not the same)
| Work | What it does | Relation |
|---|---|---|
| Amazon Prime Air airspace proposal (2015; e.g. CityAM, The Hill) | Proposed segregated drone airspace below 500 ft: high-speed transit 200-400 ft, low-speed local below 200 ft, no-fly buffer 400-500 ft | Vertical stratification by function, not allocation between operators; predates today's filed profiles |
| TU Delft layered airspace (Sunil, Hoekstra, Ellerbroek et al.; Metropolis 1/2) | Altitude layers assigned by heading to reduce conflicts in dense traffic | Layering by heading, single shared system; no operator-specific allocation of filed profiles |
| Wing-Flytrex daily coordination, Texas (Wing news 28 May 2025; UAVHQ 1 Jul 2026 on Flytrex's 25 Jun 2026 data) | ~8,000 overlapping operations Jan-Feb 2026 in Little Elm and Wylie; strategic deconfliction via ASTM F3548 intents; "100 % of operational intents" deconflicted; no vertical allocation between operators described | Shows the mechanism used today (intent exchange), not height allocation; the author notes strategic coordination is not tactical separation |
| 15 states + Harris County comment letter on the FAA draft PEA (23 Jan 2026) | Raises cumulative effects (noise, wildlife), congested airspace, need for site-specific review | Does not analyse altitude overlap between operators |
| FAA Part 135 PEA (Jul 2026) | Per-hub caps and setbacks; cruise assumed 150-375 ft | No limit or analysis for overlapping operators (per DroneXL summary) |
| Melgosa, Kuljanin, Lopez, de la Torre, Sanchez-Segura, Barrado (UPC), "Challenge for Urban Airspace Planners: Considering Horizontal and Vertical Dimensions for Scaled Delivery Operations", Drones 2026, 10(9):656 (published 26 Aug 2026) | Multi-operator last-mile traffic generated for a large European city; compares structured airspace (grid, layers) with free route; structured gives more conflicts (316 vs 54 per 3,500 daily operations); in free route all conflicts are solved by a simple strategic altitude reassignment; more vertical freedom beats layers | **Closest work found.** Shares: several operators, altitude reassignment as the fix. Differs: synthetic European traffic vs FAA-filed US profiles; per-conflict reassignment vs a standing allocation inside filed bands; does not identify the Amazon-inbound / Zipline 330 ft clash; states that only one operator uses each area (outdated for the US). Read: abstract, highlights, introduction, part of the literature review (text supplied by the founder was truncated); methods and results not read |
| Other: multi-altitude UAV scheduling (Drones 2026, 10(3):203); constrained urban airspace design (Aerospace 2021, 8(2):38); dynamic separation standards (Aerospace 2025, 12(12):1064) | Generic layered or multi-altitude planning | Not tied to filed operator profiles |

## Not found (searched 2026-10-22, web search, 6 queries)
- Any analysis that combines several operators' FAA-filed flight profiles (heights, hovers, transits) to quantify planned cross-operator meetings in a real metro.
- Any note that Amazon's filed inbound baseline and Zipline's filed cruise/hover height are 4 m apart.
- Any proposal to allocate heights between delivery operators inside their existing filed bands.

## Implication for our analysis (from Melgosa et al.)
Their result that vertical freedom beats rigid layers means our comparison should include a third reference: operators spreading heights freely within their filed bands (not just filed baselines vs fixed allocation). In our model Wing already spreads uniformly within its band; Amazon and Zipline fly the fixed baselines stated in their filings.

## Allowed wording (until an outside reviewer has checked)
"We did not find published work that combines the FAA-filed flight profiles of several delivery operators to quantify where their planned flights meet, or that proposes a height allocation inside their filed bands (searched 22 October 2026)."
Not allowed: "first", "novel", "unknown to the FAA/operators" (operators may already vary heights in practice; their internal and USS-level coordination is not public).

## Sources
- UAVHQ, Flytrex and Wing overlapping deliveries (2026-07-01): https://uavhq.com/blog/flytrex-wing-utm-shared-airspace-deconfliction-2026/
- Wing news, Flytrex and Wing strategic flight coordination (2025-05-28): https://wing.com/news/flytrex-wing-strategic-flight-coordination
- State AGs comment letter (2026-01-23): https://oag.ca.gov/system/files/attachments/press-docs/2026_01_23_FAADroneDeliveryCommentLetter.Revised.pdf
- Amazon 2015 airspace proposal (press): https://www.cityam.com/amazon-proposes-drone-designated-airspace-commercial-deliveries/
- Melgosa et al., Drones 2026, 10(9):656: https://doi.org/10.3390/drones10090656
- TU Delft urban airspace design: https://research.tudelft.nl/en/publications/urban-airspace-design-for-autonomous-drone-delivery/
