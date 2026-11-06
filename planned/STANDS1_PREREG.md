# STANDS1 pre-registration: how many parking stands each air-taxi site needs (27 Oct 2026)

Written 27 Oct 2026 before any STANDS1 run. Scenario model, not a forecast.

## Why
VERTIPORT1 found that engine versions 1-3 never let a full stand block a landing, so NET1-NET3 assumed unlimited stands. Engine v4 (taxi/net4.js, tests pass) enforces them: an approaching aircraft needs a free stand at its destination, reserved when the approach is accepted, and holds in the air (using battery) until one frees. This study asks how many stands each site needs at NET3's fleets, and what the stand counts used as inputs since NET1 (6 per site, 5 at 49T, the real deck's count) cost.

## Settings (as AIRTAXI_NET3 unless stated)
- Engine **v4**. Networks, sites, routes, profile, turnaround 300 s, max wait 30 min, repositioning on, charging 3.2 km/min, demand r = 1.5, 3, 6, 12 per OD entry, 2 h warm-up, 12 h measured, seeds 1-10.
- Aircraft arm **U100** (100 km usable plus a 20-minute reserve; every route flies). Pads: 2 per site, occupancy 90 s.
- Fleet: NET3's required U100 fleet for the same metro, r and seed (out/airtaxi_net3_fleet_*.json; medians DFW 8 / 14 / 24 / 48, Houston 5 / 8 / 14 / 28).
- Fleet placement at the start: round robin over the sites, skipping a site whose stands are full. If the fleet exceeds the total stands, the run is not simulated and counts as failing ("cannot park").
- DFW still includes the 49T downtown vertiport, closed until about 2029, so this matches NET3; that is a comparability choice, not a claim that it is open.
- **Stand arms:** UNL (unlimited); REAL (6 per site, 5 at 49T); uniform S per site for S = 2, 3, 4, 5, 6, 8, 10, 12, 14, 16, 20, 24.

## Criterion ("meets")
served >= 95 % of requests and median wait <= 600 s (as NET3), and the 95th percentile of arrival holding (eta to landing, stand plus pad wait, landings in the measured window, all sites) <= 120 s, and landings below reserve <= 1 % of landings. S* = the smallest uniform S that meets, per metro, r and seed; reported as the median over seeds (">24" if none).

## Predictions (n = sites: DFW 4, Houston 3; F = the seed's fleet; "cell" = metro x r)
- **S1 (continuity):** UNL on v4 matches NET3 (v3, U100, pads 2 / 90 s) within 2 points of served share and 60 s of median wait, seed medians, in all 8 cells. (v4 also books the landing pad at approach instead of at take-off.) The NET3 side is recomputed by running taxi/net3.js on the identical configuration, because NET3's pad-grid output files are not kept in out/.
- **S2:** REAL meets in at least 6 of 10 seeds at r = 1.5 and r = 3, in both metros.
- **S3:** REAL meets in at most 4 of 10 seeds at r = 12 in both metros and at r = 6 in DFW.
- **S4:** S* (median) >= ceil(F/n) + 2 in all 8 cells (just enough stands to park the fleet is not enough).
- **S5:** S* (median) <= ceil(F/n) + 6 in all 8 cells.
- **S6:** with uniform S = ceil(F/n) (median F), the site with the largest 95th-percentile arrival hold is DFWc in DFW and IAH in Houston, in a majority of seeds, at r = 6 and r = 12.
Pass requires the condition in every cell named. Not edited after the fingerprint.

## Checks before the run
- **K1:** node taxi/test_net4.js passes.
- **K2:** in every limited-stand run the engine's standOverflow is 0 and the start placement puts no site above its stands.
- **K3:** all 80 U100 fleet cells (2 metros x 4 r x 10 seeds) are found in the NET3 fleet files.

## Not claimed
Real stand counts at airports or FBOs are not public; 6 and 5 are NET1's inputs (5 is 49T's real count). Every stand is assumed to have a charger. Night parking, maintenance, and stands shared with other aircraft are not modelled. Demand is assumed, as in NET1-NET3.

## Files
planned/stands1_run.js, planned/stands1_analyze.py, out/stands1_*.json. At most 2 fix attempts per problem, logged below.

## Deviation log
(none yet)

(Appended after fingerprint, 27 Oct 2026.) **Deviation 1 (fix attempt 1 of 2), K2.** The first full run reported standOverflow > 0 in 87 limited-stand runs. Diagnosis (instrumented copy of the engine, three failing runs): the stand ledger never exceeded the stand count; every overflow came from the engine's end-of-run bookkeeping, which logs a final stay for each aircraft at its current site from its previous arrival, including aircraft still airborne or holding at the end, so the logged stays overlap. Removing those final stays gave zero overflow in all three. Fix: engine v4 now also returns sites[].maxHeld (peak of the stand ledger; no other change: test_net4 passes and VERTIPORT1's output reproduces byte for byte), and K2 is judged on maxHeld <= stands. All runs repeated. No prediction, criterion or setting changed. Side note for NET1-NET3: their per-site stand peaks come from the same stays and may be overstated where aircraft are airborne at the end; to be checked (exploratory).
