# AIRTAXI_NET3 results (registration planned/AIRTAXI_NET3_PREREG.md; engine taxi/net3.js). No deviations.
Tables: planned/airtaxi_net3_results_table.md. K1 (all four test files), K2 (8 and 5 aircraft) and K3 (1,440 of 1,440 runs) pass.

**The v3 fixes do not change NET2's main numbers; what changes is what the overloaded cases mean.** Required fleets on v3 equal NET2's in all 8 cells, and pads needed are about the same. But in the pad cases that fail the 2-minute criterion, aircraft that hold in the air now burn battery: in 138 of 720 runs (OLD aircraft) some landings would have happened with an empty battery. NET2's long holds (p95 up to 11 min) are therefore not "long waits"; they are cases the network cannot fly.

## Predictions: 5 of 5 passed
- **F1 PASS** OLD on v3 needs the same fleet as NET2 in 8 of 8 cells (DFW 8 / 14 / 24 / 48, Houston 5 / 8 / 14 / 28). The dispatch fixes (cross-site serving, no double repositioning, pad-aware estimates) did not change the required fleet at these demands.
- **F2 PASS** in all 347 OLD runs that meet the pad criterion, at most 2.1 % of landings dip below reserve.
- **F3 PASS** with only 60 km usable plus a 20-minute reserve, Houston needs more aircraft (r = 3: 12 vs 8; r = 12: 32 vs 28) because its 39-46 km airport links use 50-58 km of the 60; DFW (shorter routes) is unchanged.
- **F4 PASS** with 160 km usable the fleet is within one step everywhere.
- **F5 PASS** a 30-minute reserve with 100 km usable changes nothing at these demands.

## What it adds
- **Range and reserve:** with NET1/NET2's 130 km battery and the FAA's 20-minute reserve, AFW-Toyota and both Houston links could not be flown at all (arithmetic in the registration). With any usable range of 60 km or more after a 20-minute reserve, every route flies; at fast charging (3.2 km/min) the reserve rule barely changes fleet size. So the binding question for these routes is usable range after reserve, which no operator publishes.
- **Holding is a safety limit, not a delay:** below-reserve landings are rare (<= 2.1 %) wherever pads meet the 2-minute criterion, and common where they do not (for example Houston r = 12, 1 pad, 180 s: 44 % of landings below reserve). The pad sizing from NET2 stands; its long-hold cells should be read as infeasible.
- Unchanged caveats: demand is assumed, range and pad time unpublished, charging rate from Archer marketing, no weather or airspace limits.
