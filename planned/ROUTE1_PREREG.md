# ROUTE1: does routing through departure gates move the burden off homes, and what does it cost? (written 2026-11-26 before any study run)
Status: new study, recommended after CUMNOISE1 and CAPACITY1 (both found that routing decides where flights concentrate). Pre-registered before the runner's study jobs or any analysis are run.

## Question and real-world basis
No operator publishes its routes. The one documented practice: after Richardson residents objected, Amazon "sent some departures east over a commercial area before they reached a neighborhood" and raised outbound heights; it refused routes over major roads ("Routing over roads, I think it creates an additional safety issue", and far more energy) (DroneXL, 6 Oct and 15 Sep 2026). This study tests that practice applied to every hub of every company in Houston and DFW: does sending departures and arrivals through a gate over each hub's least-populated side move overflights away from homes, how much does it concentrate them (the FAA's per-spot lines from CUMNOISE1), how much farther do drones fly, and does it change the plan-sharing cost between companies?

## Arms (applied to every site of every company)
- **DIRECT:** as CUMNOISE1 and CAPACITY1 (straight to the customer, with airport detours).
- **GATE1:** one gate 1 km from the site, in the 45-degree wedge with the fewest people living 300-1,500 m away (Census 2020 block-group centres; 8 wedges). Every flight whose customer is more than 1.5 km away and that needs no airport detour flies site -> gate -> customer and customer -> gate -> site (Houston Zipline: the gate is the waypoint of its dock-to-box and customer-to-dock legs, as its airport detours are).
- **GATE4:** four gates 1 km out at 90-degree steps starting from GATE1's wedge; each flight uses the gate nearest its customer's direction.
Implementation: planned/realops.js option `gates` ('one' / 'four'), off by default. It draws no random numbers, so every arm has exactly the same customers, times and heights (paired comparison). Airport detours take precedence over gates.

## Parts
- **N (overflights and noise):** CUMNOISE1's model unchanged (REALSITES full build-out, filed volumes, one 15 h day, today's heights A0, 50 m receivers more than 200 m from every site, filed en route SELs), helpers imported from planned/cumnoise1_run.js. 2 metros x 3 arms x seeds 1-3 = 18 runs. Measures per run: busiest receiver (combined overflights a day); receivers at >= 500 / 1,150 / 2,300; highest en route DNL; **people living in receivers with >= 100 and >= 50 combined overflights a day** (block-group centres, coarse); mean horizontal distance flown per flight, by company; share of flights using a gate.
- **C (plan-sharing cost at filed volume):** CAPACITY1's model at k = 1 (PHYS1 REAL, PHYS1 site layout), A2 / N2 and G1 / V135, GATE1 and GATE4, seeds 1-3, both metros = 24 runs. DIRECT rows are CAPACITY1's stored k = 1 rows (identical by check K2). Measures: held share overall and by company; cancellations.

## Predictions (both metros; N pooled as stated)
- **R1:** GATE1's busiest receiver gets at least 1.5 times DIRECT's combined overflights (median over seeds). [All of a hub's non-detoured legs cross the gate cell: about 2,000 a day for Amazon and Houston Zipline, against DIRECT's 650-1,000.]
- **R2:** GATE1 has at least one receiver at >= 1,150 combined overflights in every seed.
- **R3:** no arm has any receiver at >= 2,300 in any seed (different companies' gates rarely coincide).
- **R4:** GATE4 has fewer receivers at >= 500 than GATE1 (sum over seeds).
- **R5:** GATE1 cuts the people living in receivers with >= 100 overflights a day by at least 20 % against DIRECT (sum over seeds).
- **R6:** GATE1 adds 10-40 % to the mean horizontal distance flown per flight (all companies pooled, seed 1-3 mean); GATE4 adds less than 10 %.
- **R7:** gates change the overall held share at filed volume by at most 2 points against DIRECT, for A2 / N2 and G1 / V135 and both gate arms (pooled seeds). [Between-company conflicts are mostly in cruise; gates move flights near each company's own site.]
- **R8:** Amazon is the most-held company under every arm for A2 / N2.
- Reported, not predicted: people >= 50 a day; highest DNL; distance by company; cancellations; gate wedge populations.

## Checks (run after this file is fingerprinted, before the study runs)
- **K1:** N part with gates off reproduces CUMNOISE1's stored row (Houston FILED seed 1: busiest receiver and receivers >= 100 / 500 identical).
- **K2:** C part with gates off reproduces CAPACITY1's stored k = 1 cost row (Houston A2 N2 seed 1) exactly.
- **K3:** GATE1 and DIRECT generate the same number of flights per company (seed 1, both metros); at least 50 % of flights use a gate; every gate is 1,000 m (+-1) from its site.
- **K4:** for one site per metro, GATE1's wedge has the lowest population of the 8.

## Limits stated in advance
- Gates are a stylised version of one documented practice; the 1 km distance, 8 wedges and four-gate spacing are assumptions. Real operators may route differently, and may already use gates.
- Least-populated is judged from block-group centres (coarse: a wedge may contain zero or one centre); land use (commercial vs residential) is not modelled.
- Same limits as CUMNOISE1 (filed volumes, en route noise only, direct legs otherwise, random sites beyond real stores) and as CAPACITY1 (assumed lunch peak, plans cover position error only, peak 2 hours).
- Own-company conflicts near gates are not counted (the plan check is between companies only).
- Neutral reporting (noise is part of a pending court case).

## Rules
Runner and analysis committed before any study run; no changes after the data is in; deviations logged below.

## Deviation log
(none yet)
