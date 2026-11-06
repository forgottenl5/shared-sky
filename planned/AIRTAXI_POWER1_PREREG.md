# AIRTAXI_POWER1: electrical power each air-taxi site would draw (registration, 28 Oct 2026)

Status: scenario model of planned operations. Registered before the runner, analysis or any run. Closes GAP_PLAN A6 ("no site power or chargers").

## Question
How much power would each site draw at peak, and how much energy a day, in the networks the project models, compared with the NREL/FAA vertiport electrical study (constrained case 900 kW per site with 3 chargers; unconstrained 13.3 MW per site, as reported by Urban Air Mobility News on the NREL report, docs.nrel.gov fy24osti 86245; the report PDF itself was not readable from this session)?

## Method
- Runs on engine taxi/net5.js with the settings of the 3D page export (taxi/export_airtaxi.js: slot rule, U100 aircraft, pads and stands per level, fleet NET3 found per seed) for the 7-site networks, seeds 1-10, levels 1.5 / 3 / 6 requests an hour per route direction (DFW 12 / 24 / 48 trips an hour, Houston 6 / 12 / 24); and Archer's networks with the AIRTAXI_NET4 Part B setups and the fleet NET4 found per seed (U100), seeds 1-10.
- Charging rebuilt from the flight trace exactly as the engine charges: each aircraft starts full; at take-off its charge drops by the flight's energy (straight km x 1.15 + 5) plus holding energy (hold time x cruise km per minute); from pad-clear it charges at 3.2 km of range per minute until full or the next take-off. An aircraft is "charging" in a minute when its charge is below full and it is on the ground at a site in that minute. No charger limit (one charger per stand), no taper.
- Power per charging aircraft = 3.2 km/min x 60 x e, with e (kWh per km of the model's energy measure) swept over 0.45 / 0.65 / 0.85. Sources for the range: about 156 Wh per passenger-mile for a full five-seat Joby-type tilt-rotor in cruise (Sripad and Viswanathan, arXiv 2106.09513), about 0.4-0.5 kWh per aircraft-km; and a 200 kWh pack for about 150 miles including hover and a 30-minute reserve in the same paper, about 0.8 kWh per km. So 86 / 125 / 163 kW per charging aircraft.
- Measures per run and site: peak minute power (MW), energy over the 12 measured hours (MWh), peak number of aircraft charging at once.

## Predictions (from arithmetic before any run: about 1.25 flights per passenger trip with repositioning, 30-60 km of energy per flight, busiest site about a third of the charging)
- **P1:** 7-site DFW at 24 trips an hour, busiest site, median over seeds: peak at least 0.3 MW at e = 0.45 and at most 1.2 MW at e = 0.85.
- **P2:** 7-site DFW at 48 trips an hour (4 pads): the busiest site exceeds 0.9 MW at e = 0.85 in at least 8 of 10 seeds.
- **P3:** the busiest site by peak power is DFW Airport (DFWc) in the 7-site DFW network and IAH in the Houston network at the middle level, in at least 7 of 10 seeds each.
- **P4:** Archer DFW network at 48 trips an hour: busiest site peak at least 1.5 MW at e = 0.85 (median over seeds).
- **P5:** 7-site DFW at 24 trips an hour: the busiest site uses 1.5-6 MWh over the 12 measured hours at e = 0.65 (median over seeds).

## Checks before the study runs (K)
- K1: for every aircraft in every run, the rebuilt charge just after its last flight equals the engine's final charge (aircraft soc) within 0.5 km.
- K2: energy conservation per run: charged energy = flown and held energy minus the fleet's net charge drop, within 1 %.

## Deviation log
(none yet)

- **Deviation 1 (appended after fingerprint, 28 Oct 2026, before any study run; fix attempt 1 of 2 for K1).** K1 as written compared the rebuilt charge just after each aircraft's last flight with the engine's final charge. The engine updates an idle aircraft's charge lazily whenever it considers it for dispatch (taxi/net5.js `charge`), so its final value includes charging after the last flight, up to `readyAt`. K1 now compares the rebuilt charge at the engine's last update time (max of pad-clear and `readyAt`). The study measures (minute-by-minute charging) are unchanged. Note: K2 is computed from the rebuild's own bookkeeping, so it only checks the arithmetic, not the engine; K1 is the engine check.
