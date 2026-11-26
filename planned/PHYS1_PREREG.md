# PHYS1: realistic flights and operations (written 2026-11-25 before any study run)
Status: new study. Prompted by the Madrid dataset's author ("Be sure you follow some realistic physics model", 25 Nov 2026) and a review of what else the model leaves out. Every input is in planned/PHYS1_SOURCES_NOTES_2026-11-25.md (FAA noise reports, EAs, airspace map; Gemini Deep Research cross-check). Registered before any study run; pre-checks run after this file is fingerprinted.

## What changes (planned/realops.js; tests planned/test_realops.js; with every factor off it reproduces the engine's flights exactly)
- **prof, flight profiles:** Wing and Zipline climb, descend, speed up and slow down as their FAA noise reports' phase times give (Wing: climb about 3.1 m/s, 13-15 s to cruise speed; Zipline: 75 s vertical climb and descent at the dock, 10 s up to speed, 20 s down). Amazon keeps the engine's builder, which already used its filed phase times. Corners at detour points are flown as 30-degree-bank turns (about 120 m radius at Wing's speed; patent and NASA-concept assumption, not a certified limit).
- **zdfw, DFW Zipline as filed for DFW:** 41 kt (21 m/s), dock to customer and back, no dropbox (signed DFW EA and its noise report). Houston Zipline: 70 mph via a dropbox with a 120 s pick-up hover (2026 Texas Metros text) - unchanged speed.
- **pop, customers where people live:** Census 2020 block-group population (as the CENSUS study).
- **air, airports:** a route crossing an FAA UAS Facility Map cell with a 0 ft ceiling detours around it (smallest sideways offset of 1-12 km that clears both legs); if none works the customer is redrawn (up to 20 times), and after that the flight goes straight (counted and reported). Houston and DFW maps (DFW queried 25 Nov 2026).
- **peak, demand at the lunch peak:** the 3 simulated hours are 11:00-14:00 local (1 h warm-up, 12:00-14:00 measured) under a two-peak daily shape (12:30 and 18:30, 1 h wide) with the busiest hour at 2 times the daily mean; same daily totals. No hourly demand data exist publicly (none in any filing read; DEMAND1); the shape is an assumption.
- **amz15, Amazon's operating day:** 1,000 flights over 15 hours (7 am - 10 pm, Texas EA), not 16.5.
"REAL" = all six on.

## Parts
- **U (uncoordinated meetings, OWN2's counter):** REAL, heights A0, S1, A2, G1, both metros, seeds 1-5 (40 runs). Between companies (the headline measure) and within companies (more than 50 m from the company's own site).
- **L (leave one out):** REAL with one factor off, S1 and A2, seeds 1-3 (Houston has no zdfw): 66 runs.
- **C (plan-sharing cost, INTENT2's runner):** REAL, A0 and A2 at N2, G1 at +-13.5 m and N2, both metros, seeds 1-5 (40 runs).
146 runs. Old-engine references: HEADLINE2 (S1, A2, A0), GAP1 (G1 cut), OWN2 (A2, G1 between and within), INTENT2 / GAP1 (held shares), same seeds.

## Predictions (30 m / 10 m; pooled seeds; each in both metros)
- **P1:** the headline cut (S1 to A2) stays at least 50 % [old 72 / 73 %].
- **P2:** GAP1's spacing (G1) cuts meetings against S1 by at least 70 % [old 82 / 84 %].
- **P3:** with plans shared at average GPS (N2), the shared-out heights (A2) hold less than 0.7 times the share today's heights (A0) hold [old 17-18 % vs 47-51 %].
- **P4:** GAP1's spacing at +-13.5 m holds under 10 % of flights [old 2.3-2.7 %].
- **P5:** between-company meetings under A2 are at least twice the old engine's (OWN2, same seeds) [peak demand alone was estimated at +40-48 % per day in DEMAND1; inside the peak more].
- **P6:** in the leave-one-out runs, switching off the peak changes A2's between-company count more than switching off any other factor.
- **P7:** meetings within companies stay at least 20 times those between companies under A2 [old about 100-190 times].
- Reported, not predicted: every factor's effect on each measure, flight times, detours, held shares by company.

## Checks (K)
- **K1:** planned/test_realops.js passes (including: with all factors off, flights equal the engine's exactly in both metros).
- **K2:** with all factors off the counter reproduces OWN2's stored row (DFW A2 seed 1, between and within).
- **K3:** with all factors off the cost runner reproduces INTENT2's stored row (Houston A2 N2 seed 1).
- **K4:** in REAL, fewer than 3 % of flights cross a 0 ft airport cell.

## Limits stated in advance
Turn limits, Houston Zipline's climb profile and hourly demand are assumptions (no public data); weather days, other aircraft, buildings and in-flight avoidance are not included. Plans still cover position error only. 3-5 seeds.

## Rules
Runner and analysis committed before any study run; no changes after the data is in; deviations logged below.

## Deviation log
(none yet)
