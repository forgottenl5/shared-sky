# AIRTAXI_POWER1 results (28 Oct 2026). Registration planned/AIRTAXI_POWER1_PREREG.md (fingerprint in AIRTAXI_POWER1_PREREG.md.sha256); runner and analysis committed before any run. One deviation (K1 definition, before any run, logged). K1 exact (0 km difference) in all 120 runs.
Table: planned/airtaxi_power1_results_table.md.

## Result in one line
**At 24 trips an hour the busiest site would draw about 0.6-1.1 MW at peak (DFW Airport in the 7-site network, Meacham/FTW in Archer's), rising to about 0.9-1.7 MW at 48 trips an hour (Archer's network 1.1-2.1 MW): above the NREL/FAA study's constrained case of 900 kW per site, far below its unconstrained 13.3 MW.** 5 of 5 predictions passed. The range is set by energy per km (0.45-0.85 kWh, from published estimates), not by the simulation.

## Predictions
- **P1 PASS** 7-site DFW, 24 trips/h, busiest site: 0.57 MW (e 0.45) to 1.07 MW (e 0.85).
- **P2 PASS** 7-site DFW, 48 trips/h: busiest site above 0.9 MW at e 0.85 in 10 of 10 seeds (1.63-1.96 MW).
- **P3 PASS** busiest site DFW Airport in 7 of 10 seeds (Alliance in 3); IAH in 10 of 10.
- **P4 PASS** Archer DFW, 48 trips/h: 2.12 MW at e 0.85 (Meacham, FTW, the end of most commute pairs).
- **P5 PASS** 7-site DFW, 24 trips/h, busiest site: 2.8 MWh over the 12 hours at e 0.65.

## What it adds
- The first power figure for these networks. Peak charging is set by how many aircraft charge at once at the busiest site: about 4-5 at the lowest demand, 6-8 at 24 trips an hour, 10-15 at 48.
- With the NREL constrained case (three chargers, 900 kW per site) the busiest sites would have to queue for chargers from about 24 trips an hour; the model here gives every stand a charger, so it does not show that queue.
- Whole-network energy over 12 daytime hours: about 9 MWh at 24 trips an hour in DFW (7-site, e 0.65), 13 MWh in Archer's DFW network.

## Limits
- Energy per km is not published for any operator; the sweep spans a cruise-only estimate (Sripad and Viswanathan, arXiv 2106.09513, about 0.4-0.5 kWh/km) and a pack-over-range estimate including hover and reserve (about 0.8 kWh/km). Constant charging power (no taper), one charger per stand, no grid or transformer model, no battery degradation.
- The NREL figures are as reported by Urban Air Mobility News; the NREL report itself (docs.nrel.gov fy24osti 86245) could not be opened from this session.
- Same network, demand and aircraft assumptions as the 3D page and AIRTAXI_NET4.
