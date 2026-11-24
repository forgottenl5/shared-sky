# LAYOUT1 results (24 Nov 2026): shared-out heights with wider gaps, inside the filed bands
Registration planned/LAYOUT1_PREREG.md (fingerprint in planned/LAYOUT1_PREREG.md.sha256; runner and analysis committed before any run). K1-K3 passed. 200 runs, all completed. Table: planned/layout1_results_table.md. No deviations.

## Result in one line
**Layout M1 (Wing 46-52 m, Amazon 76 m both ways, Zipline 101 m; all inside the filed bands) cuts the flights the plan check holds from about 18-19 % (today's shared-out heights A2) and 37-39 % (today's filed heights A0) to about 4 %, cuts Amazon's held share from 81-84 % to 18-26 %, removes the 15 m dip (the uncoordinated cut is 75-92 % at every rule), and leaves less residual collision risk than A2 in both metros.** 3 of 7 predictions passed; the four failures are listed below. The other layout, M2 (Amazon low), looks even better on conflicts and waiting but carries 3-8 times A2's residual risk: it is not a good design.

## Predictions
- **U1 FAIL (narrowly)** M1's cut at 5 m vertical is 74.9 % in Houston (just under the registered 75 %; 76 % DFW). At every other rule it is 78-92 %.
- **U2 FAIL** at 10 m, M2's cut (83 % / 90 %) is higher than M1's (80 % / 82 %). I expected Wing's many descents through Amazon's 55 m layer to cost M2 more.
- **C1 PASS** M1 + V2 holds 4.4 % (Houston) and 4.2 % (DFW) of flights (registered at most 10 %).
- **C2 PASS** Amazon's flights held under M1: 25.7 % / 18.0 % (registered at most 60 %; A2 84 % / 81 %).
- **C3 FAIL** V2 removes 98.6 % (Houston M1), 99.0 % (Houston M2), 96.6 % (DFW M1), 100 % (DFW M2) of flown planned conflicts; registered at least 99 %. In absolute terms what is left is the same order as A2's: 0.1 an hour under M1 against 0.05 under A2; the share is lower because M1 starts with fewer conflicts.
- **R1 PASS** with V2 at average GPS error, M1 leaves 0.67 (Houston) and 0.58 (DFW) expected collisions per 100,000 flight hours, against A2's 0.93 and 1.11.
- **R2 FAIL** M1 against Amazon's best-sourced heights S1: lower in Houston (0.67 vs 0.82), higher in DFW (0.58 vs 0.51).

## Figures
| | Held by V2 (10 windy hours) | Amazon held | Cut at 10 m / worst rule (no sharing) | Residual risk with V2, L2 |
|---|---|---|---|---|
| Houston A0 (today, Omaha profile) | 38.8 % | 80.7 % | reference for held | — |
| Houston A2 (shared out) | 18.9 % | 84.0 % | 72 % / 55 % (15 m) | 0.93 |
| **Houston M1** | **4.4 %** | **25.7 %** | **80 % / 75 % (5 m)** | **0.67** |
| Houston M2 | 4.3 % | 19.0 % | 83 % / 79 % (5 m) | 5.17 |
| DFW A0 | 36.5 % | 81.1 % | — | — |
| DFW A2 | 17.5 % | 81.4 % | 73 % / 45 % (15 m) | 1.11 |
| **DFW M1** | **4.2 %** | **18.0 %** | **82 % / 76 % (5 m)** | **0.58** |
| DFW M2 | 4.1 % | 13.1 % | 90 % / 87 % (5 m) | 3.03 |
Mean delay of held flights: 3.5-3.9 minutes under M1 / M2, against 6.2-6.6 under A0 / A2. S1's residual risk: 0.82 Houston, 0.51 DFW.

## Reading (diagnosis after the registered analysis, exploratory)
- **Residual risk is set by the closest pair of layers just outside the check's +-10 m blocks.** M2's residual is 91-96 % Wing (top 80 m) vs Zipline (101 m), 21-25 m apart: the check never flags them, and average GPS height error can close 21 m. M1's closest such pair is Amazon (76 m) vs Zipline (101 m), 25 m apart (84-90 % of its residual), so its risk is lower; A2's is Amazon out (81 m) vs Zipline, 20 m apart. Waiting and uncoordinated conflicts alone would have picked M2; the risk part shows why gaps need a margin above the check's band.
- **Amazon's waiting was a layout problem.** With one Amazon height between Wing and Zipline, Amazon's climbs cross only Wing's thin band, and its held share falls from about 82 % to 18-26 %. Wing and Zipline also wait less (3-4 %).
- **The 15 m dip disappears** because no two companies are less than 24 m apart in M1.

## Limits and costs of M1
- It is a design test. No operator has proposed it. Everything is inside the filed bands (Wing 46-91 m, Amazon 55-115 m for both legs, Zipline 101 m), but Wing gives up most of its band (46-52 m), and Amazon flies out and back at one height.
- **Within-company conflicts are not counted** anywhere in this project (each company is assumed to keep its own fleet apart). M1 makes that harder: Wing's flights share a 6 m band instead of 25-45 m, and Amazon's outbound and return flights share one height. That cost to each company is not measured here.
- Same check model (V2, assumed block sizes; ASTM F3548 not read), same windy-hour sample and still-air risk model as SEEDS2 / RISK2. M1's DFW residual risk is slightly above S1's, whose check delays 37 % of flights.
