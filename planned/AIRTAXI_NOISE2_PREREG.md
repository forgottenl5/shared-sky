# AIRTAXI_NOISE2: how many people live under the air-taxi noise, and what evening and night flights add (registration, 28 Oct 2026)

Status: scenario model of planned operations. Registered before the runner, analysis or any run. Closes GAP_PLAN A7 (noise without people) and Phase 0 item 5 (day-night average from daytime hours only). Wind-aligned departure paths (the other half of A7) are not in this study.

## Method
- Flights: engine taxi/net5.js with the 3D page settings (taxi/export_airtaxi.js: 7-site networks, slot rule, U100, pads and stands per level, fleet NET3 found per seed), seeds 1-5, levels 1.5 / 3 / 6 requests an hour per route direction.
- Noise: taxi/noise.js unchanged (AIRTAXI_NOISE1 model: Joby's reported levels, spherical spreading, holding as a hover 150 m over the site, departure lines toward the next site), 200 m grid, base source levels.
- Operating windows (sim clock 04:00 + t; 2 h warm-up as before): **D12** 06:00-18:00 (as published; note the DNL night penalty already applies to 06:00-07:00), **D16** 06:00-22:00, **D18** 06:00-24:00 (adds two night hours with the 10 dB penalty). Demand rate per hour unchanged, so longer days mean more flights.
- People: Census 2020 block population (data/census/tx_blocks_2020.csv, POP100 at the block internal point), each block assigned to the grid cell containing its point. Counted only for cells more than 300 m from every site (as NOISE1's off-site rule).
- Measures per run: peak off-site DNL; population in cells with N55 >= 10 and N55 >= 50 flights over the window; population at DNL >= 55 and >= 65.

## Predictions (arithmetic before any run: energy scales with hours, night hours count 10 times)
- **P1:** no off-site cell reaches DNL 65 in any run (all windows), so nobody is counted at DNL >= 65.
- **P2:** D16 raises the peak off-site DNL over D12 by 0.5-1.0 dB (median over seeds, every metro and level); expected 10 log10(25/21) = 0.8.
- **P3:** D18 raises it over D12 by 2.8-3.8 dB; expected 10 log10(45/21) = 3.3.
- **P4:** people with at least 10 loud (55 dBA) flights over D12, DFW at 24 trips an hour: 3,000-40,000; Houston at 12 trips an hour: 1,000-25,000 (medians over seeds).
- **P5:** in D18 at the highest level, at least some people live at DNL >= 55 in each metro (population > 0).

## Checks before the study runs (K)
- K1: D12 seed 1 reproduces the 3D page's noise layer exactly (same N55 cells and counts as taxi/airtaxi_data.json) in all six metro-levels.
- K2: the Census population assigned to each grid equals the sum over blocks whose point lies inside the grid (no blocks lost), and is above 100,000 for each metro grid.
- K3: noise.penalty gives 10 dB at 22:30 and 06:30 and 0 at 12:00.

## Deviation log
(none yet)
