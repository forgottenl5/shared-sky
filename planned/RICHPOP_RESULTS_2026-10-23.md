# Richardson overflights with Census customers: results (2026-10-23)
Pre-registration: RICHPOP_PREREG.md, sha256 b30e1f23…, committed with code before the run. K1 passed. 100,000 customers, seed 1. Output: out/richpop.json.

## Share of all hub passes within w of each [street withheld] point (x = 285 / 378 / 472 / 565 / 659 m), population-weighted customers
| Zone radius R | sigma | Flights detoured | Customers north of hub | w = 100 m | w = 150 m |
|---|---|---|---|---|---|
| 0 | 400 m | 0 % | 45 % | 0.006–0.021 | 0.011–0.029 |
| 700 m | 400 m | 27 % | 45 % | 0.010–0.073 | 0.017–0.101 |
| 850 m | 400 m | 35 % | 45 % | 0.000–0.083 | 0.040–0.104 |
| 0 | 200 / 800 m | 0 % | 44–45 % | 0.004–0.020 / 0.009–0.019 | — |
| 850 m | 200 / 800 m | 35 % | 44–45 % | 0.000–0.081 / 0.000–0.083 | — |

Uniform customers (NFZ): 0.023–0.026 at R = 0, up to 0.097 at R = 850 (w = 100). Observed: **0.40–0.55**.

## Predictions
| Prediction | Result | Verdict |
|---|---|---|
| RP1 R = 0 stays below 0.08 | 0.021 | **PASS** |
| RP2 no arm reaches 0.40 | max 0.083 | **PASS** |
| RP3 population raises R = 0 to >= 1.2 × uniform | 0.80 × | **FAIL** |

I predicted more customers would lie north of the hub. Wrong: 45 % lie north (uniform 50 %); more people live to the south (towards Dallas) than north.

## What it shows
- **Where people live does not explain Richardson's overflights.** Census weighting slightly lowers traffic over [street withheld]. The jitter size makes no difference (200–800 m).
- With the no-fly zone, the best case stays about 0.08–0.10 of passes against an observed 0.40–0.55. The model remains 4–5× short.
- Candidates left, none testable with public data: registered per-address paths that share common segments; the rule that paths avoid major highways; the resident's counting distance; that day's volume. Recorded tracks (Remote ID) remain the clean test.
- Scorecard entry stays "FAIL, partly explained (about a fifth, no-fly zone)"; customer distribution is now ruled out as the rest.
