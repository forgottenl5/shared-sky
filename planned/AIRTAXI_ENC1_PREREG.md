# AIRTAXI_ENC1: how often do air taxis come close in the air, and what does one height rule do? (registration, 29 Oct 2026)

Status: behaviour model of the air-taxi page's scenario networks. Registered before the runner, analysis or any count was computed.

## Why
On the air-taxi page two aircraft can be seen passing through each other. That is what the engine does: every flight cruises at the same height (610 m, 2,000 ft) on the straight line between sites, and nothing in the model steers around anyone; the engine manages only pads, parking and charge. The FAA's near-term plan says "see-and-avoid will continue to be the primary means of aircraft separation" and that VFR aircraft in Class B airspace receive separation from air traffic control (FAA AAM Implementation Plan, Innovate28, §4.2, read 29 Oct 2026). This study counts the close approaches a pilot or controller would have to resolve, and tests one simple rule that removes most of them by design.

## Definitions (thresholds are FAA numbers, read 29 Oct 2026)
- **Separation encounter (E1):** two airborne aircraft within 1.5 nautical miles (2,778 m) horizontally **and** less than 500 ft (152.4 m) vertically at the same moment. Source: FAA JO 7110.65 §7-9-4 as amended by Notice JO 7110.803 (24 Apr 2026): VFR aircraft are separated from aircraft of 19,000 lb or less by target resolution or 500 ft vertical, and if two targets will laterally reduce below 1½ miles each must be on an assigned course or heading. The model has no radar, so 1.5 NM horizontal stands in for "target resolution"; this treats the whole network as if it were in Class B airspace (it is largely under the DFW and Houston Class B areas, but not entirely; not checked cell by cell).
- **Near-midair proximity (E2):** two airborne aircraft less than 500 ft (152.4 m) apart in 3D. Source: AIM 7-6-3.b, a near midair collision is "proximity of less than 500 feet to another aircraft". In this model, with no avoidance, an E2 is an outcome nobody would accept, not a prediction that one would happen in reality.
- **Episode:** a pair counts once from the first moment the condition holds until it has been false for 30 s; a later re-entry counts again.
- **Phase:** terminal if either aircraft is within 2,778 m horizontally of any site; otherwise en route. An episode takes the phase of its first moment.
- **Airborne:** take-off to the end of the vertical landing (lift, climb, cruise, descent, landing), positions exactly as the page draws them (`along()` in taxi/airtaxi.template.html) in metres, without the page's height exaggeration. **Holding** aircraft (engine time between planned arrival and landing) have no position in the engine (the page draws all holders on one circle over the site), so they are left out of E1 and E2 and reported separately as the count of moments with two or more aircraft holding over the same site.
- Sampled every 0.5 s over the 12 measured hours (after the 2-hour warm-up).

## Runs
- Base network as the page (taxi/export_airtaxi.js): DFW and Houston, the three shown demand levels (1.5, 3, 6 requests an hour per route direction) with their shown pads and stands, fleet NET3 found for each seed (arm U100), engine v5 slot rule, seeds 1-10 (60 simulations). Seed 1 is the run shown on the page.
- **Arm A (as the page):** everyone cruises at 610 m.
- **Arm B (direction heights):** flights heading east of north-south (dx > 0) cruise at 610 m (2,000 ft) and the others at 457 m (1,500 ft), 153 m apart, more than 500 ft. This is a project proposal for the model, like the drone layers; it is not a rule. (The FAA's direction-based cruising altitudes in 14 CFR 91.159 start above 3,000 ft AGL and do not apply here.) Arm B changes geometry only: the engine's flight times are kept, and each flight's climb and descent are redrawn to its height within the same take-off and arrival times (a few seconds' approximation). Archer's network is not part of this study.

## Predictions (seed mean, 12 measured hours)
- **X1:** in arm A every shown setup (both metros, all three levels, seed 1) has at least one en-route near-midair proximity (E2): opposite directions of a route share one line and one height.
- **X2:** arm A en-route separation encounters (E1) an hour at the middle level (3 requests an hour per direction): DFW 6-20, Houston 4-14.
- **X3:** arm A en-route E1 grows faster than demand: the ratio of the top level (6) to the bottom level (1.5) is between 8 and 24 in both metros (4 times the requests; meetings between opposite directions grow about with the square).
- **X4:** arm A terminal E1 an hour at the middle level is between 0.5 and 3 times the en-route E1, in both metros.
- **X5:** arm B cuts en-route E1 by at least 80 % against arm A and leaves no en-route E2 in any run, both metros, all levels.
- **X6:** arm B cuts terminal E1 by less than 50 % at the middle level in both metros (near sites both heights climb through each other).

## Checks before the study runs (K)
- K1: the runner's seed-1 simulations reproduce the page export's flights exactly (taxi/airtaxi_data.json, base network, all 6 setups).
- K2: synthetic geometry: two flights head-on on one 30 km route at the same take-off time give exactly one en-route E1 and one en-route E2 episode; two flights in the same direction 90 s apart give none; in arm B the head-on pair gives no en-route E1 and no E2.
- K3: every arm A and arm B position at a flight's arrival time is at the destination site at pad height (within 1 m).

## Deviation log
(none yet)
