# RISK1 results (4 Nov 2026; registration planned/RISK1_PREREG.md, fingerprint 0c914ddf…)
Full tables: planned/risk1_results_table.md. 40 runs (2 metros x 2 arms x seeds 1-10), 36,150 planned cross-company encounters, a CPA found for every one. Checks K1-K3 passed before the runs. No deviations.

**5 of 5 predictions passed. Height sharing cuts modelled collision risk by about as much as it cuts planned conflicts: 79 % (Houston) and 82 % (DFW) at best-site GPS, 61 % and 58 % at the GPS standard's average, and 16-18 % at the Remote ID size (a lower bound).**

## Predictions
- **R1 PASS** cut at L1, base sizes: Houston 79 % [61-94], DFW 82 % [65-94].
- **R2 PASS** risk at L2 is at least the L0 risk for both arms (Houston S1 9.5 to 17.0, A2 0 to 6.7; DFW S1 10.2 to 13.6, A2 5.1 to 5.8 per 100,000 flight hours).
- **R3 PASS** 95 % shared error lowers L2 risk for both arms (Houston S1 17.0 to 9.9, A2 6.7 to 1.7; DFW S1 13.6 to 9.1, A2 5.8 to 1.7).
- **R4 PASS** doubling the assumed Zipline/Amazon half-span raises L2 risk 1.76-1.92 times.
- **R5 PASS** shared-out heights have lower L2 risk than best-sourced heights (Houston 6.7 vs 17.0, DFW 5.8 vs 13.6).

## Reading
- **No coordination is modelled here.** These are plans as filed, with no plan-sharing check and no avoidance, so about 1 modelled collision per 10,000 flight hours describes uncoordinated plans, not real operations. COORD1, SEEDS2 and ERRORS1 show the plan check removes 98-99 % of planned conflicts at average-or-better GPS; RISK1 does not yet apply it.
- **Without errors (L0) the rates are whole events:** 3 planned collisions in about 31,500 flight hours in Houston (S1) and 0 with shared-out heights; 2 and 1 in DFW. These are plans that pass through each other, mostly where one aircraft climbs or descends through another company's height. The DFW L0 cut (50 %, interval -201 to 100 %) is one event against two and means nothing.
- **Shared errors matter more for risk than for conflict counts:** with 80-95 % of the error shared by nearby aircraft, the L2 cut is 78-83 %, close to the L1 cut.
- **Size:** risk scales roughly with the assumed aircraft size (about 1.8-1.9 times for double the half-span); absolute rates depend on sizes that are not published.
- **L4 is a lower bound:** the 30 m sideways encounter search misses part of the risk at that error size.

## Limits
- Model quantity, not a safety assessment; not compared with any certified target level of safety.
- Zipline and Amazon sizes and all half-heights are assumed. Errors are the ERRORS1 levels, constant within a flight; take-off timing error excluded; same-company encounters excluded.

## Deviation log
(none)
