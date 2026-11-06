# AIRTAXI_NOISE1 results (run 2026-10-26; registration planned/AIRTAXI_NOISE1_PREREG.md)

Scenario model: point-source spreading from two manufacturer-reported levels, flat ground, no buildings, wind or air absorption, no population data. Not a noise assessment.

## Predictions

| # | Result | Detail |
|---|---|---|
| N1 | pass | highest off-site DNL over all 30 base runs: 54.1 dB (predicted < 60; FAA threshold 65) |
| N2 | pass | largest reach of any N55 >= 1 point: 2.42 km (predicted <= 3 km) |
| N3 | **FAIL** | N55 in 12 h 1 km out: DFW Corporate Aviation toward Alliance 45 (predicted 20-80); IAH toward Hobby 77 (predicted 10-60) |
| N4 | pass | area with N55 >= 10 at r 1.5: DFW 9.16 km² (predicted 2-12), Houston 4.64 km² (predicted 1-8) |
| N5 | pass | area growth r 1.5 -> 6: DFW 1.21x, HOU 1.42x (predicted 1.0-1.6) |
| N6 | pass | +5 dB: reach DFW r1.5 4.39 km, DFW r6 4.39 km, HOU r1.5 4.39 km, HOU r6 4.39 km; off-site DNL at r 1.5: DFW 52.7, HOU 51.5 |

5 of 6 passed.

## By metro and demand (12 h, 06:00-18:00; median over 5 seeds, min-max)

| Metro | Trips an hour | Flights | Area N55 >= 10 (km²) | Area N65 >= 1 (km²) | Reach of N55 (km) | Highest off-site DNL (dB) | Highest DNL anywhere (dB) | N55 1 km out on busiest route |
|---|---|---|---|---|---|---|---|---|
| DFW | 12 | 223 (201–235) | 9.16 (9.16–9.16) | 0.96 (0.88–0.96) | 2.40 (2.40–2.40) | 47.9 (47.3–49.0) | 52.8 (51.7–53.5) | 45 (42–55) |
| DFW | 24 | 421 (389–431) | 9.16 (9.16–11.12) | 0.96 (0.96–0.96) | 2.40 (2.40–2.40) | 50.6 (50.2–51.0) | 55.2 (54.5–55.4) | 92 (77–101) |
| DFW | 48 | 805 (792–839) | 11.12 (9.16–11.12) | 0.96 (0.88–0.96) | 2.40 (2.40–2.40) | 53.3 (52.7–54.1) | 57.8 (57.1–58.6) | 181 (162–200) |
| HOU | 6 | 103 (91–115) | 4.64 (4.64–6.60) | 0.56 (0.56–0.56) | 2.42 (2.42–2.42) | 48.0 (46.5–48.6) | 49.6 (48.2–52.3) | 77 (65–85) |
| HOU | 12 | 200 (180–207) | 4.64 (4.64–6.60) | 0.56 (0.56–0.56) | 2.42 (2.42–2.42) | 50.5 (49.9–50.8) | 52.0 (51.3–54.3) | 159 (144–174) |
| HOU | 24 | 383 (369–385) | 6.60 (6.60–6.60) | 0.56 (0.56–0.56) | 2.42 (2.42–2.42) | 53.2 (53.0–53.4) | 55.7 (55.5–56.1) | 295 (287–306) |

## Sensitivity: both source levels −5 / 0 / +5 dB (seed 1)

| Metro | Trips an hour | Area N55 >= 10 (km²) | Reach (km) | Highest off-site DNL (dB) |
|---|---|---|---|---|
| DFW | 12 | 2.68 / 9.16 / 29.68 | 1.28 / 2.40 / 4.39 | 42.6 / 47.7 / 52.7 |
| DFW | 48 | 3.20 / 11.12 / 35.92 | 1.28 / 2.40 / 4.39 | 47.8 / 52.8 / 57.9 |
| HOU | 6 | 1.28 / 4.64 / 14.76 | 1.23 / 2.42 / 4.39 | 41.5 / 46.5 / 51.5 |
| HOU | 24 | 1.84 / 6.60 / 21.12 | 1.23 / 2.42 / 4.39 | 48.1 / 53.2 / 58.2 |

## Notes written after the run
- **Plain reading.** With these manufacturer-reported levels, the networks are heard loudly (55 dBA or more, a busy street) only within about 2.4 km of a site, along the departure and approach lines. Cruise at 2,000 ft is about 43.5 dBA directly below, under everyday daytime background in a city. No point more than 300 m from a site centre comes near the FAA's DNL 65 threshold: the highest is 54 dB at the busiest demand tested.
- **Where it adds up is frequency, not loudness.** At the point 1 km out from DFW Airport toward Alliance, 45 flights a day are at 55 dBA or more at 12 trips an hour on the network, and 181 a day (about 15 an hour) at 48 trips an hour. At IAH, both routes leave in nearly the same direction, so the point 1 km out hears both: 77 a day at 6 trips an hour, 295 at 24. Communities object to the count of events (the "N-above" measures argued for in the FAA's noise policy review) more than to the DNL average, so the corridor under the first 2-3 km of each route is where any real network would meet resistance.
- **The footprint is set by geometry, not traffic.** The area hearing 55 dBA 10 times a day grows only 1.2-1.4 times when traffic quadruples. Where the departure and approach paths point matters more than how many flights there are. Here they point straight at the next site because real paths are not public; FAA-approved paths would move the corridors.
- **Source level is the big unknown.** ±5 dB on both sources changes the 10-events-a-day area about 3.3 times either way and the reach from 1.3 km to 4.4 km. "Below 65 dBA at 100 m" is Joby's upper bound; Archer and Wisk have not published comparable take-off figures.
- Not modelled: rotors turning on the pad beyond the 6 s vertical phase, buildings, terrain, wind, air absorption, tonal character, and where people live (no population data was used).
