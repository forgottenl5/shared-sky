# Richardson no-fly zone geometry check: results (NFZ_PREREG.md, fingerprint c1948fb5…), 2026-10-22
K2 failed once and passed after fix attempt 1 (logged); K1–K3 then passed. 100,000 customers, seed 1. Output in out/nfz.json.

## Share of all hub passes within w of each [street withheld] point (x = 285 / 378 / 472 / 565 / 659 m)
| Zone radius R | Flights detoured | w = 50 m | w = 100 m | w = 150 m |
|---|---|---|---|---|
| 0 (uniform) | 0 % | 0.012–0.013 | 0.023–0.026 | 0.034–0.039 |
| 300 m | 10.7 % | 0.012–0.013 | 0.023–0.026 | 0.034–0.039 |
| 500 m | 18.6 % | 0.012–0.013 | 0.023–0.035 | 0.034–0.060 |
| 700 m | 28.1 % | 0.015–0.065 | 0.030–0.083 | 0.046–0.122 |
| 850 m | 38.8 % | 0.000–0.051 | 0.000–0.097 | 0.046–0.131 |

Observed (RICHARDSON_INPUTS): **0.40–0.55** (122 passes in 10 h over one home, early 2026).

## Predictions
| Prediction | Result | Verdict |
|---|---|---|
| N1 uniform below 0.08 everywhere (w 100) | max 0.026 | **PASS** |
| N2 some R in 500–850 m gives >= 3× uniform at some point (w 100) | R 700: 3.2× at x = 285; R 850: 3.9× at x = 472 | **PASS** |
| N3 no R in 300–850 m reaches 0.40 (w 100) | max 0.097 | **PASS** |

## What it shows
1. **The no-fly zone is a real funnel.** At plausible sizes (700–850 m) it detours 28–39 % of all flights and raises traffic over parts of [street withheld] 3–4× above the uniform model. Its geometry matches the residents' account: the zone sits north-north-west of the hub, and [street withheld] lies just past its eastern edge, where the rerouted northbound traffic passes.
2. **It explains at most about a fifth of the observed concentration.** The best case is about 0.10 of all passes (0.13 at a 150 m counting distance), against the observed 0.40–0.55. Something else funnels traffic over this street 4–5× more.
3. **Candidates for the rest (untested):**
   - Customers are not spread evenly (the service area or demand may lean north).
   - Amazon's rule that paths cannot follow major highways.
   - Fixed registered paths per address sharing common segments.
   - The volume on the counted day.
   - The resident's counting distance.

   Each needs data we do not have. The cleanest would be recorded tracks (Remote ID) or Amazon's registered paths.

## Consequence
- The scorecard entry "overflights per home" moves from "FAIL, cause unknown" to "**partly explained (about 20 %) by a sourced constraint; remainder unexplained**".
- Exposure numbers for real neighbourhoods remain not publishable as absolute values.
