# PADRULE1 pre-registration: which landing rule keeps an air-taxi network safe and fast when stands are limited (27 Oct 2026)

Written 27 Oct 2026 before any PADRULE1 run. Scenario model, not a forecast.

## Why
STANDS1 (planned/STANDS1_RESULTS_2026-10-27.md) found that under engine v4's rule, arrivals queue for a landing pad behind departures that already hold slots, so even with unlimited stands some arrivals hold and then land slightly below the 20-minute reserve; the registered "at most 1 % below reserve" test therefore failed from moderate demand upward whatever the stand count. Engine v5 (taxi/net5.js, tests in taxi/test_net5.js pass) adds three landing rules:
- **arrive** (v4): the landing pad is booked when the aircraft arrives, first come first served; an arrival with no free stand holds in the air.
- **slot**: the landing pad slot is booked at take-off (as v3), so an arrival ranks ahead of departures booked later; the stand is checked on arrival; with no free stand the slot is released and the aircraft holds.
- **confirm**: no take-off until a stand at the destination is reserved (the aircraft waits on the ground at the origin, charging) and a landing slot is booked at take-off; two aircraft each waiting for a stand at the other's site swap stands and both go.
This study asks which rule meets the service and safety criterion with the fewest stands, and whether more pads or more stands fix what the registered STANDS1 run could not separate.

## Settings (as STANDS1 unless stated)
Engine **v5**. Metros, sites (DFW includes the closed 49T, as NET3), routes, profile, turnaround 300 s, max wait 30 min, repositioning on, charging 3.2 km/min, r = 1.5, 3, 6, 12 per OD entry, 2 h warm-up, 12 h measured, seeds 1-10, aircraft arm U100, pad occupancy 90 s, fleet = NET3's required U100 fleet for that metro, r and seed, round-robin placement skipping full sites; a fleet larger than the total stands is not simulated and counts as "cannot park".
- **Rules:** arrive, slot, confirm. **Pads per site:** 2 and 4. **Uniform stands per site S:** 3, 4, 5, 6, 8, 10, 12, 16, and unlimited (rule slot only, as a reference).
- 2 metros x 4 r x 10 seeds x (3 rules x 8 S + 1 reference) x 2 pad counts = 4,000 runs.
- Under confirm, a request whose aircraft is waiting on the ground for a stand is not dropped at the 30-minute limit; it counts as served when the aircraft takes off, and a request still waiting at the end counts as not served. Its wait is take-off time minus request time.

## Criterion ("meets", unchanged from STANDS1)
served >= 95 %, median wait <= 600 s (for confirm this includes time waiting on the ground for a stand), 95th percentile of airborne arrival hold (eta to landing, measured window) <= 120 s, landings below reserve <= 1 %. S* = the smallest S meeting it, median over seeds (">16" if none).

## Predictions
- **R1:** slot with unlimited stands and 2 pads meets in at least 8 of 10 seeds in DFW at r = 1.5 and 3, and in Houston at r = 1.5, 3 and 6. (STANDS1: arrive failed this in 9 of 10 DFW r = 3 seeds because of reserve dips.)
- **R2:** with 2 pads and S = ceil(fleet / sites) + 3 (fleet = the median fleet of the cell), confirm meets in at least 8 of 10 seeds at r = 1.5 and 3 in both metros.
- **R3:** at S = ceil(fleet / sites) + 2, 2 pads, the median wait is higher under confirm than under slot in at least 6 of the 8 cells (2 metros x 4 r) in which both rules can park the fleet.
- **R4:** at S = ceil(fleet / sites) and r = 3, 2 pads, confirm records at least one stand swap in at least 30 % of seeds in both metros.
- **R5:** slot with S = 10 and 4 pads meets in at least 8 of 10 seeds at r = 6 in both metros.
- **R6:** in every confirm run with 2 pads, r <= 3 and S >= ceil(fleet / sites) + 2, no aircraft is still waiting to take off at the end of the run.
Pass requires the condition in every cell named. Not edited after the fingerprint.

## Checks before the run
- **K1:** node taxi/test_net4.js and node taxi/test_net5.js pass.
- **K2:** in every limited-stand run the stand ledger peak (sites[].maxHeld) is at most the stand count.
- **K3:** all 80 NET3 U100 fleet cells found.
- **K4:** rule arrive with 2 pads reproduces the STANDS1 outputs (served share, median wait, hold p95, below-reserve share) exactly for ten configurations drawn from STANDS1's saved files (out/stands1_*.json).

## Not claimed
Neither rule is a certified procedure. Real arrival priority, go-arounds, weather and diversions are not modelled; stands and chargers are assumed equal at every site; demand is assumed (as NET1-NET3). The 'slot' and 'confirm' rules are two simple policies out of many.

## Files
taxi/net5.js, taxi/test_net5.js, planned/padrule1_run.js, planned/padrule1_analyze.py, out/padrule1_*.json. At most 2 fix attempts per problem, logged below.

## Deviation log
(none yet)

(Appended after fingerprint, before any run, 27 Oct 2026.) Clarification 1, not a deviation: where a prediction names S = ceil(fleet / sites) + k, the analysis uses the smallest grid value of S (3, 4, 5, 6, 8, 10, 12, 16) that is at least that number. R3 needs at least 6 cells in which both rules can park the fleet and confirm's median wait is higher; fewer parkable cells fail it. K4 compares at least 10 configurations.
