# Planned real-world delivery operations: inputs for Phase 1 (2026-10-22)
Purpose: Phase 1 simulates operations as the companies themselves have filed them; Phase 2 compares our alternatives against that baseline (agreed with the founder 2026-10-22).
Tags: **[primary]** = read in the FAA document itself; **[secondary]** = from a news/tracker summary, to verify in the primary source; **[derived]** = our arithmetic; **[assumed]** = our choice, not published.

## Wing (Alphabet)
| Item | Value | Tag / source |
|---|---|---|
| DFW nests | 25 authorised (2023); up to **75** proposed and cleared | [primary] FAA Wing DFW Supplemental EA FONSI/ROD (draft EA Dec 2024) |
| Houston nests | up to **75**, FONSI signed 13 Aug 2026; 5 Walmart nests flying since 15 Jan 2026 | [primary] FAA Wing Houston FONSI/ROD; [secondary] DroneXL Houston tracker |
| Deliveries per nest | up to **400 per operating day**; overlapping service areas still capped at 400 per day | [primary] Wing DFW draft EA 2023 §2.2; DFW SEA |
| Aircraft per nest | up to **24** | [primary] DFW draft EA §2.2; Houston FONSI |
| Launch pads | 6-20 per existing nest (2023); sample nest: 18 chargepads in 3 groups of 6, ~1 m^2 each | [primary] DFW draft EA §1.1, §3.2; Wing 101 deck 2026 (city packet) |
| Remote pickup | "autoloaders": typically up to 3 per nest (some up to 10), 100-300 total in Houston | [primary] Houston FONSI §2.2 |
| Hours | deliveries 7 a.m.-10 p.m. (extended from 7 a.m.-7 p.m.); daily in-nest hover checks 6-7 a.m. | [primary] DFW SEA; Houston FONSI (internally inconsistent; use 7-22) |
| Radius | ~6 miles (9.7 km) per nest | [primary] DFW draft EA §1.1, §2.2 |
| Flight profile | vertical take-off from assigned pad to 23 ft, hover ~30 s (package loading), climb to en route 150-300 ft AGL (46-91 m), single set cruise airspeed ~59 mph (26.4 m/s), never above 400 ft; delivery: vertical descent to 23 ft, hover ~30 s lowering package by line; return at 150-300 ft; vertical landing on assigned pad | [primary] DFW draft EA §2.2.2 (en route band also given as 150-250 ft in §3.3.3.2) |
| Routing | predefined path set before take-off; Wing software "assigns, deconflicts and routes each flight"; paths varied to limit repeated overflights; schools, daycares (and churches) are fly-less areas | [primary] DFW draft EA §2.2, §2.2.2, §3.4 |
| Noise at nest | DNL 65 dB within 35-50 ft of nest perimeter; 60 dB within 65-75 ft | [primary] DFW SEA; draft EA Table 3.6-1 |
| Setbacks | nests >= 65 ft from noise-sensitive areas (120 ft inside Class B/C/D surface areas) | [primary] DFW SEA; Houston FONSI |
| Other operators | "coordinate with other UA operators" to limit concurrent operations; no joint analysis | [primary] Houston FONSI |

## Zipline (Platform 2)
| Item | Value | Tag / source |
|---|---|---|
| DFW sites | up to **75** sites, up to **500 docks** (max 20 per site) | [primary] FAA Zipline DFW EA FONSI/ROD (Dec 2025) |
| Deliveries per site | up to **400 per 24-h day**, 10-mile radius | [primary] same |
| Hours | 24/7 incl. holidays; ~95 % of flights 7 a.m.-10 p.m. | [primary] same |
| Noise / setbacks | DNL 65 dB within 70 ft of site; setbacks 150 ft (325 ft in Class B/D surface areas) | [primary] same |
| Texas metros (draft EA, Sep 2026) | 5 metros, 220 **Chargers** (hubs) + 4,400 **Dropboxes** (pickup kiosks), up to 220,000 deliveries and 660,000 transits per day. Houston: 9,932 sq mi, 65 Chargers, 1,300 Dropboxes, 65,000 deliveries/day | [primary] FAA Zipline Texas Metros draft EA, Table 2.2-1 |
| Charger | typical 36 docks in 3 towers of 12 (max 72); up to 1,000 deliveries/day per Charger; overlap areas capped at 1,000 deliveries/day (max 2,000 transits over any ground point) | [primary] same, §1, §2.2, §2.2.1 |
| Dropbox | up to 300 pickups per Dropbox per day; on commercial land | [primary] same, §3 (visual) |
| Delivery = 3 transits | Charger -> Dropbox (hover 330 ft, lower pod, ~120 s pickup) -> customer (hover 330 ft, lower pod by winch, ~75 s) -> any Charger; round trip <= 20 miles | [primary] same, §2.2, §2.2.4 |
| Flight | vertical ascent from dock to 330 ft (101 m) AGL; en route 330 ft at typical 70 mph (31.3 m/s); < 400 ft; UA 63 lb with 8 lb payload, 7.8 ft span | [primary] same, §2.2.3-2.2.4 |
| Hours | 24/7; ~95 % of flights 7 a.m.-10 p.m. | [primary] same |
| Deconfliction | pre-planned routes; own drones "automatically deconflict with each other using a combination of strategic and tactical avoidance", sharing position, velocity and intent drone-to-drone and modifying plans; other aircraft: onboard ADS-B DAA, FAA-approved UTM service, NOTAMs, coordination with local operators | [primary] same, §2.2.4 |
| Noise setback | Charger placed so daily exposure stays below DNL 59.7 dB (about 170 ft from noise-sensitive areas) | [primary] same, §3.6 |
| Earlier P2 description | 10-mile radius; hovers > 300 ft while a droid is lowered | [primary-ish] Zipline press release 2023-03-15 |

## Amazon Prime Air (MK30)
| Item | Value | Tag / source |
|---|---|---|
| Per delivery centre | up to **1,000 flights/day**, radius 7.5 mi | [primary] FAA Final EA + FONSI/ROD Kansas City, May 2026 (read 2026-10-21) |
| Flight profile | vertical ascent 0 -> 115 ft (15 s); transition and climb to outbound en route 180-279 ft (**baseline 200 ft**, 61 m) at 58.3 kt (30 m/s); delivery: descend 200 -> 140 ft (30 s), vertical 140 -> 13 ft (27 s), drop at 13 ft (4 s), climb 13 -> 197 ft (30 s); **inbound en route 279-377 ft (baseline 345 ft, 105 m)**; landing 377 -> 197 ft (30 s), vertical 197 -> 0 (35 s). Outbound and inbound use different heights | [primary] FAA Amazon Omaha EA Appendix E, Table 1, §2.1 |
| Delivery centre | launch area ~35 m x 45 m; 4 sets of pads: takeoff 4 x 4 m, landing 8 x 8 m | [primary] same, §2, §3.2 |
| Volume (KC) | up to 1,000 flights/day per centre, radius 7.5 mi, 6 a.m.-10:30 p.m. | [primary] Kansas City Final EA (read 2026-10-21) |
| Texas | 22 Texas hubs cleared (FONSI 5 Feb 2026); Houston: 6 hubs cleared, 1 flying (HOU6 Richmond) | [secondary] DroneXL Houston tracker |

## National framework
- FAA Final Programmatic EA for Part 135 package delivery (July 2026): unit capacity threshold **1,150 deliveries per hub per day** (2,300 overflights of any location); a hub at the cap sits **>= 600 ft** from noise-sensitive land uses (smaller hubs: shorter setbacks from a table); cruise assumed 150-375 ft under a 400 ft ceiling; covers Amazon MK30, Wing Hummingbird, Zipline P2, Flytrex, Matternet M2, DroneUp. Cumulative effects handled per hub; no limit on overlapping operators stated. [secondary] DroneXL 2026-07-31; primary PDF: https://www.faa.gov/uas/advanced_operations/nepa_and_drones/Part_135_Final_PEA_FONSI-ROD-NOA_Appendices_A-D_Final.pdf (not yet read). Challenged by 15 states and Harris County (2nd Circuit, Sept 2026) partly over cumulative local impacts.

## Deconfliction (all operators)
- ASTM F3548-21 operational intents: each flight declares 4D volumes; a conflict is two intents intersecting in space and time; shared between operators via USSs. Volume sizes and buffers are operator-chosen and not in public text. [primary as quoted in NASA/TM-20250009400; standard itself paywalled]
- Within one operator, sequencing at the nest is proprietary (Wing: "software assigns, deconflicts and routes each flight"). [primary] Wing DFW draft EA.

## Gemini research report (founder, 2026-10-22): verification status
Treated as leads only. Checked so far:
| Claim | Status |
|---|---|
| Amazon outbound 200 ft / inbound 345 ft baselines; 35 x 45 m PADDC with 4 x 4 m takeoff and 8 x 8 m landing pads, 4 sets | **confirmed** in FAA Amazon Omaha EA Appendix E |
| PEA: 1,150 deliveries per hub per day; 600 ft setback at the cap | consistent with DroneXL summary of the PEA; primary not yet read |
| Zipline P2 hovers ~300 ft, lowers droid on tether; 10-mile radius; up to 20 docks per site | partly confirmed: Texas draft EA says 330 ft hover; DFW EA 20 docks per site max; Texas Chargers up to 72 docks |
| Wing cruise 150-200 ft | **conflicts** with FAA Wing DFW draft EA (150-300 ft, also 150-250 ft); use the EA |
| Wing Central Florida up to 150 nests | not yet checked (FAA Wing Central Florida EA exists) |
| Wing and Flytrex: zero conflicts in multi-operator F3548 coordination (June 2026) | **partly confirmed** (wing.com, 28 May 2025, text supplied by the founder): daily operations of two operators in overlapping Texas airspace, exchanging flight intent under ASTM F3548-21 and adjusting paths automatically. No flight or conflict numbers and no 'zero conflicts' claim on that page; the June 2026 DroneLife article is not read |
| F3548 OiMinConformance 95 % | plausible; standard paywalled; not checked |
| Amazon "up to 60 flights/hour" per node | Gemini's own arithmetic (1,000 / 16.5 h), not a published figure |

## What this means for Phase 1 (our reading)
1. **Growth is by many capped sites**, not bigger sites: Wing 75 nests x 400/day per metro; Zipline 65-75 sites; Amazon ~1,000 flights per hub. [derived] Houston ceilings: Wing 30,000 + Amazon 6,000 + Zipline 65,000 (draft) deliveries per day.
2. **Networks are moving to hubs plus remote pickup points** (Wing autoloaders, Zipline Dropboxes), i.e. multi-leg flights: hub -> pickup -> customer -> hub [derived from 660,000 legs for 220,000 deliveries = 3 legs each].
3. **Operators already overlap** (Cypress, Houston: Wing FM 529 nest and Zipline Cypress base; Amazon sites nearby) and each FAA assessment analyses one operator alone. Cumulative airspace and noise effects of several operators are not assessed anywhere we have found. This is the most useful gap for Sky-Grid.
4. Height bands by operator [primary]: Wing en route 46-91 m; Amazon outbound ~61 m (55-85) and inbound ~105 m (85-115); Zipline 101 m en route AND for its 75-120 s hovers. Zipline's hovers at 101 m sit inside Amazon's inbound band, and Wing's band overlaps Amazon's outbound band: cross-operator encounters are a real, checkable question.
5. Multi-operator strategic coordination (F3548 intent exchange) is already in daily commercial use between Wing and Flytrex in Texas since May 2025 [primary, wing.com]. Zipline's own drones resolve conflicts drone-to-drone (tactical, shared intent); Wing describes software deconfliction before flight; all three use or must use an FAA UTM service for other operators.

## Gaps (not published; to be [assumed] and labelled)
- Wing pad spacing and nest geometry beyond "18 chargepads in 3 groups of 6".
- Peak-hour factor (deliveries per busiest hour vs daily average).
- Leg structure and timing with autoloaders/Dropboxes.
- Operator-internal sequencing at nests; F3548 volume sizes and buffers.
- Exact site locations (FAA documents give areas, not addresses; trackers list some live sites).

## To verify next
- Amazon Texas EA (Feb 2026) for Houston hub numbers.
- Gemini research brief (founder) for remaining gaps; every Gemini number to be verified in its primary source before use.

## Sources
- FAA Wing DFW Supplemental EA FONSI/ROD: https://www.faa.gov/uas/advanced_operations/nepa_and_drones/Wing-DFW-SEA-FONSI-RO_Signed.pdf
- FAA Draft EA for Wing at DFW (2023): https://www.faa.gov/uas/advanced_operations/media/Draft_EA_for_Wing_at_DFW.pdf
- FAA Wing Houston FONSI/ROD (2026): https://www.faa.gov/uas/advanced_operations/nepa_and_drones/20260813_Wing_Houston_FONSI-ROD_Signed.pdf
- Wing 101 deck 2026 (Northglenn city packet): https://webdocs.northglenn.org/file/121256/packet/Wing%20_101_Deck_2026.pdf
- FAA Zipline Texas Metros draft EA (Sep 2026; PDF supplied by the founder): https://www.faa.gov/uas/advanced_operations/nepa_and_drones/20260911_Zipline_Texas_Metros_Draft_EA_CLEAN_ADA_Signed.pdf
- FAA Amazon Omaha EA Appendix E: https://www.faa.gov/uas/advanced_operations/nepa_and_drones/AMZ-OMA-Appendix-E_ADA-508-Final.pdf
- DroneXL on the FAA Part 135 PEA (2026-07-31): https://dronexl.co/2026/07/31/faa-nationwide-drone-delivery-environmental-review/
- FAA Zipline DFW EA FONSI/ROD (Dec 2025): https://www.faa.gov/uas/advanced_operations/nepa_and_drones/20251223_Zipline_DFW_EA_FONSI-ROD_signed.pdf
- DroneXL, Zipline Texas draft EA (2026-09-15): https://dronexl.co/2026/09/15/zipline-faa-texas-draft-ea-220000-deliveries/
- DroneXL Houston tracker: https://dronexl.co/tracker/drone-delivery/towns/houston-tx/
- Circuit 2023: https://www.circuit.press/posts/wing-seeks-faa-approval-for-up-to-10-000-drone-deliveries-a-day
- Amazon MK30 Kansas City EA (see MISSIONS_INPUTS_2026-10-21.md)
