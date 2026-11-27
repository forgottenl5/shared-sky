# CUMNOISE1: what one place hears from all approved drone operators together (written 2026-11-26 before any study run)
Status: new study, IDEAS_BACKLOG.md item 2 (CUMULATIVE NOISE), recommended by planned/LANDSCAPE_2026-11-26.md. Pre-registered before the runner's study jobs or any analysis are run.

## Question
Each FAA approval assesses one operator, and the national programmatic review (Final PEA, Jul 2026) assesses one hub. That review states that the "primary remaining potential for significant impact" is en route noise in "airspace that is shared by multiple hubs of different operators" (Appendix C p. 2-2). It caps a hub at 1,150 average-annual-day (AAD) deliveries, says the cap applies to an operator's drones "in combination with any other UA utilizing the same airspace" (FONSI/ROD p. F-13), asks that any shared airspace exceeding "1,150 AAD deliveries (2,300 overflights)" be identified (PEA pp. 34-35), and concludes that "it is highly unlikely that 1,150 AAD deliveries (2,300 overflights) would occur over any single noise sensitive receiver location" (Appendix C p. 4-3). This study adds up Wing, Zipline and Amazon over Houston and DFW at their filed volumes and tests those statements.

## Sources (all FAA documents on faa.gov/uas/advanced_operations/nepa_and_drones, read 26 Nov 2026)
- **National PEA (Final, Jul 2026), Appendix C noise assessment:** en route SEL for the 11 assessed drones 58.5-78.4 dB; the cap is built on 78.4 dB; DNL under the path 59.6 dB at 1,150 AAD overflights, 29.0 dB at 1 (so DNL = SEL + 10 log10(N) - 49.4, N = daily overflights, 86,400 s); night (22:00-07:00) counts 10 times; the PEA assumes the drone "passes directly over the receiver during all flight activity except vertical ascent and descent"; hub DNL extents Table 4-1; maximum en route SEL reached about 611 ft from a hub.
- **Wing Houston Final EA (Aug 2026):** up to 75 nests, 400 deliveries per nest per day, 07:00-22:00, cruise 150-300 ft; en route DNL 40.7 dBA for 800 daily overflights at one point (p. 3-30) -> SEL 61.0 dB.
- **Amazon Texas multi-metro EA:** up to 1,000 MK30 flights per day per site, 07:00-22:00, outbound 200 ft and inbound 345 ft typical; en route DNL 43 dB "in any location" for 1,000 daily overflights, 46 / 48 dB where two / three operating areas overlap (pp. 3-28 to 3-29) -> SEL 62.4 dB. Its own conservative assumption: no location is overflown by more than half the daily deliveries (500 deliveries, 1,000 overflights).
- **Zipline DFW Final EA (Dec 2025):** 75 sites, 400 deliveries per site per day, 95 % 07:00-22:00 and 5 % at night, cruise 330 ft; Appendix D en route SEL 69.1 dBA (loudest average, p. 2-11); en route DNL 50.3 dB for 800 daily overflights (p. 3-20). 69.0 dB with the 5 % night share reproduces 50.3 (69.0 + 10 log10(800 x 1.45) - 49.4).
- **Zipline Texas draft EA (Sep 2026, via DroneXL):** Houston 65 chargers, 65,000 deliveries and 195,000 transits per day (about 1,000 deliveries and 3 transits per charger per delivery), 24 h with about 5 % at night, cruise 330 ft. No noise figures reported; the DFW P2 figures are used.

## Model
- **Sites:** REALSITES full build-out (planned/realsites.js, stage 'full'): Houston Wing 75 (69 at real Walmart / operating stores), Zipline 65 (random around its Cypress area as in BUILDOUT), Amazon 5 real PADDCs; DFW Wing 75, Zipline 75 (57 at Walmart), Amazon 6 real PADDCs (including Richardson STX8). Random sites vary with the seed.
- **Tracks:** planned/realops.js unchanged, all PHYS1 factors on (measured profiles, turns, DFW Zipline as filed, customers by Census population, airport detours, Amazon 15 h) except the lunch peak, which is switched off (Pk = 1): only where flights go matters here, not when. Today's filed heights (A0). No plan sharing or avoidance (they move flights in time, not in place). One operating day of 15 hours (warm-up 0, measured 54,000 s).
- **Volumes (daily, per site):**
  - FILED: Wing 400, Amazon 1,000, DFW Zipline 400, Houston Zipline 1,000. Generated at daily / 15 per hour over 15 h (Zipline's generated day count is 95 % of its daily total: Houston 950, DFW 380; each Zipline flight is weighted by 1 / 0.95 in counts and 1.45 / 0.95 in DNL, the night share at 10 times).
  - CAP: every hub at the national cap, 1,150 per day (same Zipline weighting).
- **Overflights:** a 50 m grid. A leg (Wing and Amazon: out and back; Zipline: dock to box, box to customer, customer to dock) counts one overflight in every cell its horizontal path crosses (sampled every 5 m; once per leg per cell). Vertical climbs and descents and hovers do not count, as in the PEA. **Receivers** are cells inside the zone (REALSITES zone: Houston +-42 km, DFW +-40 km) and more than 200 m from every site of every company (the PEA's hub area is about 611 ft).
- **En route DNL per receiver:** 10 log10(sum over companies of N_op x w_op x 10^(SEL_op / 10) / 86,400) with filed SELs Wing 61.0, Amazon 62.4, Zipline 69.0 dB; and a bounding run with every drone at the PEA's 78.4 dB.
- **Shared-airspace reading 2 (service areas):** for each receiver, the sum of daily deliveries of every hub whose filed range covers it (Wing 6 mi = 9,656 m, Amazon 7.5 mi = 12,070 m, Zipline 10 mi = 16,093 m; the engine's radii).
- **People:** Census 2020 block-group population at its mean centre (data/CenPop2020_Mean_BG48.csv), counted in the receiver cell (or the 1 km square, for reading 2) that holds the centre. Block groups average about 1,700 people, so people counts are coarse.

## Runs
2 metros x 2 volumes x 3 seeds = 12 runs. Each run stores, per company and combined: the receiver count distribution (max, 99.9th, 99th, 50th percentile of overflown receivers), counts of receivers at >= 100 / 500 / 1,150 / 2,300 combined overflights and how many of those exceed the line only when companies are combined, max and percentiles of en route DNL (filed SELs and 78.4 dB), receivers overflown by 2 and 3 companies, reading-2 area and people above 1,150 combined deliveries, and the Richardson check below.

## Predictions (each in both metros; pooled = every seed must satisfy unless stated)
- **N1 (the PEA's statement holds under direct routing):** at FILED, no receiver gets 2,300 or more combined overflights a day in any seed.
- **N2:** at FILED, no receiver gets 1,150 or more combined overflights in any seed. [Arithmetic: a hub's flights spread over directions; at 200 m one 50 m cell is about 4 % of a circle, so even Houston Zipline's 3,000 legs give about 120 per cell before customer clustering.]
- **N3:** at CAP, no receiver gets 2,300 or more combined overflights in any seed.
- **N4:** at FILED the highest en route DNL at any receiver (filed SELs) is below 50 dB, and with every drone at 78.4 dB below 65 dB (median over seeds).
- **N5 (reading 2):** at FILED, at least 90 % of the people in each zone live in 1 km squares where the hubs whose ranges cover them together file more than 1,150 deliveries a day.
- **N6 (combining matters):** at FILED, receivers overflown (at least one weighted overflight a day) by two or more companies are at least half of all overflown receivers.
- **Reported, not predicted:** all distributions by company; CAP vs FILED; people at en route DNL >= 45 dB; **Richardson check:** Amazon overflights a day at receivers 1-3 km from STX8, as context for the resident who logged 52 in one day (Amazon's actual Richardson volume is not published and is below its filed 1,000, so this is not a validation).

## Checks (run after this file is fingerprinted, before the study runs)
- **K1:** one seed per metro at FILED: the generated daily flights per company are within 5 % of sites x filed volume (Zipline: x 0.95).
- **K2:** the DNL formula reproduces the filings: Wing 800 overflights 40.7 +- 0.1; Amazon 1,000 overflights 43.0 +- 0.1; Zipline 800 with 5 % night 50.3 +- 0.2; 78.4 dB at 1,150 gives 59.6 +- 0.1.
- **K3:** rasteriser: a straight 1,000 m leg along a grid row gives 20 or 21 cells, each counted once; an out-and-back flight counts 2 in each crossed cell.
- **K4:** Census population in each zone above 1,000,000; receivers exclude every cell within 200 m of a site.

## Limits stated in advance
- **Direct routing.** Tracks are straight to the customer (with airport detours). Operators may fly fixed lanes, which would concentrate overflights; no operator publishes its routes. The Amazon EA's own worst case (half of a site's deliveries over one place) is quoted for comparison, not modelled.
- Filed SELs are each filing's single en route value at its typical height; height changes are not modelled. Only en route noise is counted (hubs and delivery points are covered by the filings' own tables).
- One 15-hour day at filed or cap volume; real volumes today are lower. Wing nests and Houston Zipline sites beyond the real stores are random. Customers are drawn from block-group population.
- Coarse people counts (block-group centres).
- **Neutral reporting.** Noise from drone delivery is the subject of a pending court case (15 states and Harris County v. FAA, Second Circuit). Results are reported for both metros as numbers against the FAA's own thresholds, with no recommendation.

## Rules
Runner and analysis committed before any study run; no changes after the data is in; deviations logged below.

## Deviation log
(none yet)
