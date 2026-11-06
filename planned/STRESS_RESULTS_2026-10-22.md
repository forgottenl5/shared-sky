# Stress events: results (STRESS_PREREG.md, fingerprint 493b3bc5…), 2026-10-22
K1–K4 passed. Seeds 16–18, pooled; analysis script committed before the runs.

| Prediction | Result | Verdict |
|---|---|---|
| R1 SURGE window delayed share >= 2x S0 (d 4, 3) | 2.00 / 1.91 | **FAIL** |
| R2 SURGE after-window delayed share <= 1.5x S0 (d 4, 3) | 1.41 / 1.26 | **PASS** |
| R3 TFR d 3: rerouted delayed share >= 2x other window flights | 3.5 % (286 flights) vs 2.1 % | **FAIL** |

| d | Arm | before: delayed share | window: flights / delayed share / mean delay of delayed (s) / total delay (h) | after: flights / delayed share | cancelled | rerouted / held | extra cruise on rerouted |
|---|---|---|---|---|---|---|---|
| 4 km | S0 | 1.4 % | 2932 / 1.5 % / 38 / 0.5 | 2890 / 1.1 % | 0 | 0 / 0 | 0.0 % |
| 4 km | TFR | 1.4 % | 2932 / 1.5 % / 39 / 0.5 | 2890 / 1.1 % | 0 | 170 / 104 | 0.5 % |
| 4 km | SURGE | 1.4 % | 8753 / 3.0 % / 47 / 3.5 | 2890 / 1.6 % | 0 | 0 / 0 | 0.0 % |
| 4 km | BOTH | 1.4 % | 8753 / 2.7 % / 50 / 3.3 | 2890 / 1.6 % | 0 | 535 / 348 | 0.5 % |
| 3 km | S0 | 2.0 % | 4939 / 2.7 % / 39 / 1.4 | 4828 / 2.5 % | 0 | 0 / 0 | 0.0 % |
| 3 km | TFR | 2.0 % | 4939 / 2.2 % / 38 / 1.2 | 4828 / 2.5 % | 0 | 286 / 162 | 0.5 % |
| 3 km | SURGE | 2.0 % | 14542 / 5.1 % / 57 / 11.9 | 4828 / 3.1 % | 0 | 0 / 0 | 0.0 % |
| 3 km | BOTH | 2.0 % | 14542 / 4.7 % / 62 / 11.9 | 4828 / 3.5 % | 0 | 967 / 459 | 0.5 % |

## What it shows
1. **A 3× surge roughly doubles the share of flights delayed, and multiplies total delay 7–8×** (R1 FAIL, narrowly: 1.91–2.00× against >= 2×). Three times the flights, each delayed about twice as often and for longer (47–57 s against 38–39 s), gives 3.5 h instead of 0.5 h of delay at d = 4, and 11.9 h instead of 1.4 h at d = 3. No flight was cancelled.
2. **The system recovers fast** (R2 PASS). In the 30 minutes after the surge, the delayed share is 1.26–1.41× normal: there is no lasting backlog under a plan check that only shifts start times.
3. **A pop-up restriction costs little in delay, but it holds flights.** Detours add 0.5 % cruise distance. Rerouted flights were delayed 1.7× as often as others (R3 FAIL: >= 2× predicted). The main effect is 104–162 flights per 3 seeds held on the ground until the restriction lifts, because they needed to hover or climb inside it. Overall delay in the window even fell slightly, because held flights left the busiest area.
4. **Both together** behave like the surge alone, plus the held flights.

## Limits
- No in-flight rerouting: flights already airborne when the restriction starts fly through it as planned. This understates the restriction's effect.
- Held flights wait exactly until the restriction lifts; real operators might cancel instead.
- The surge is spread evenly over all sites.
- Planned tracks only; one priority rule.
