# Realistic strategic coordination (F3548-style volumes) on the filed build-outs, both metros (written 2026-10-26 before any study run)
Status: behaviour model of planned operations (lab/lab_engine.js) with a new volume-based plan check (planned/coord.js). ASTM F3548-21 itself is paywalled; the check follows the public description of it (operational intents as 4D volumes, conflicts not allowed at equal priority, first filed keeps its plan) and NASA's 1,000 m volume blocks. Not any operator's or USS's real implementation. Not a forecast or safety assessment.

## Why
The review of 25 Oct (planned/REVIEW_2026-10-25.md, industry finding 3) called the existing ±5 s plan check weaker than real coordination. Real operators share operational intents before take-off: Wing and Flytrex report about 8,000 overlapping flights in Little Elm and Wylie, Jan-Feb 2026, with 100 % of operational intents deconflicted (DroneLife and Flytrex/BusinessWire, 25 Jun 2026). "Zero conflicts" there means zero conflicts between accepted plans, which any working intent check guarantees; neither company publishes the cost (delays, cancellations) or how often flights leave their volumes. This study estimates those from the companies' own filed layouts.

## Question
At the full filed build-outs (Houston, DFW), with plans shared F3548-style: how many flights must wait or are cancelled, by company; how many real (flown) planned conflicts remain when plans made on a forecast are flown in real wind; how often do flights leave their own reserved time windows; and does sharing out heights still matter once plans are coordinated?

## Inputs
- **Layouts, rates, profiles, window:** exactly HEADLINE2 (planned/houreal.js, planned/dfwreal.js; 1 h warm-up, 2 h measured; counted zone as HEADLINE2). Seeds 1-3.
- **Heights:** A0 (Omaha profile: Wing 46-91 m, Amazon 61 out / 105 back, Zipline 101 m) and A2 (shared out: Wing 46-71, Amazon 81 / 115, Zipline 101).
- **Wind (planned/wind.js re-timing):** Open-Meteo 2025 hourly for each metro (data/openmeteo_houston_2025.json, data/openmeteo_dfw_2025.json). For seed s, the flown hour is the s-th of wind.bandHours(0.85, 0.95, 3) (daytime hours in the 85th-95th percentile of 120 m wind, about a p90 day). **Plans are timed with the previous hour's wind** (a persistence forecast: what an operator would know an hour ahead); **flights fly in the actual hour's wind**. Paths and heights unchanged.
- **Coordination arms (all companies equal priority; first filed = earlier planned take-off, ties by id, keeps its plan; a later flight that conflicts is delayed in 30 s steps up to 20 min, else cancelled; a company's own flights are not checked against each other):**
  - **NONE:** no check.
  - **MIN:** the existing point check (lab_engine intentCheck: 30 m cells, ±5 s, 10 m vertical).
  - **V1 / V2 / V3 volume checks (planned/coord.js):** each planned segment is cut into blocks of at most 1,000 m along track (vertical and hover segments one block each). A block reserves: a capsule of half-width w around its path, a height band [lowest − v, highest + v], and a time window [entry − h, exit + h] where h = h0 + g × (time since take-off). Two blocks of different companies conflict if their time windows overlap, their height bands overlap and their paths come within w_A + w_B. Blocks with both ends on the ground are not reserved.
    - **V1 tight:** w 10 m, v 5 m, h = 5 s + 2 % of elapsed time.
    - **V2 standard:** w 30 m (the Remote ID rule's 100 ft horizontal accuracy, 95 %), v 10 m, h = 10 s + 5 %.
    - **V3 regulatory altitude:** w 30 m, v 46 m (the Remote ID rule's 150 ft aircraft altitude accuracy, 95 %, 14 CFR 89.310), h = 30 s + 10 %.
- **Pilot disclosed (run before this registration, exploratory, not part of the study):** Houston seed 1, A2 heights, still air, existing point check at three settings: 30 m / ±5 s / 10 m delayed 0.5 % of 19,426 flights (mean 37 s), 0 cancelled; 30 m / ±30 s / 10 m delayed 1.8 % (mean 92 s); 60 m / ±60 s / 23 m delayed about 20 % (mean 303 s), 66 cancelled. Timing: 50-230 s per check.

## Measures (per metro, heights, arm, seed; then mean over seeds with min-max)
- **Flown cross-company planned conflicts** (30 m / 10 m) and tight conflicts (15 m / 5 m) per hour in the measured window, counted on the flown tracks (engine counter, sub 4).
- **Cost:** share of checked flights delayed; mean and 95th-percentile delay of delayed flights; share cancelled; each by company.
- **Conformance (V arms):** share of accepted flights that leave at least one of their own blocks' time windows when flown; share of all block-time outside.

## Predictions (p90 wind, persistence forecast)
- **C1:** V2 cuts flown cross-company planned conflicts by >= 90 % against NONE, with A2 heights, in both metros.
- **C2:** MIN leaves >= 25 % of NONE's flown planned conflicts in both metros (the WIND study found the ±5 s check fails in wind).
- **C3:** V2 with A2 delays <= 5 % of flights in both metros; with A0 the delayed share is >= 1.5 times A2's (shared-out heights lower the cost of coordination).
- **C4:** V3 with A2 delays >= 15 % of flights in Houston, and the A0 / A2 delayed-share ratio is <= 1.3 in both metros (46 m height bands swamp 10-20 m layer gaps, so height sharing stops helping).
- **C5:** V1: >= 20 % of accepted flights leave their own time windows in flight; V2: <= 10 %.
- **C6:** V2 flown tight conflicts (15 m / 5 m) <= 10 % of NONE's in both metros.

## Rules
No changes after the data is in; runner and analysis committed before runs; at most two fix attempts on a failing feature check; deviations logged below.
- **K1:** planned/test_coord.js passes: (a) two different-company flights crossing at the same moment: the later-filed one is delayed by the smallest 30 s step that clears the windows, (b) the same pair 200 m apart sideways (V2): no delay, (c) the same pair separated in height by more than v_A + v_B: no delay, (d) same-company pair: no delay, (e) a flight flown exactly as planned conforms, and one flown 30 % slower leaves its windows under V1.
- **K2:** NONE arm in still air reproduces HEADLINE2's planned-conflict count for the same seed and heights within 1 % (the plumbing is unchanged).

## Deviation log
(none yet)
