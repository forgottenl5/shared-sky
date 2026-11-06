# Richardson overflights with Census customers (written 2026-10-23 before any code run)
Status: geometry check of one real hub (Amazon STX8, Richardson) with real positions; planned straight routes with the no-fly detour of NFZ_PREREG.md. Not a noise assessment.

## Why
Our one real-world check fails: the uniform-customer model puts about 2.5 % of hub passes over a [street withheld] home (w = 100 m), against 40–55 % implied by the resident's count; the hospital no-fly zone lifts that to at most about 10 % (NFZ_RESULTS). One untested candidate was "customers are not spread evenly". The Census file (data/CenPop2020_Mean_BG48.csv) now lets us test it.

## Model
Exactly NFZ (planned/nfz.js: positions, detour, 2 passes per delivery, [street withheld] points x = 285–659 m at y = 1,224 m, w = 50 / 100 / 150 m, 100,000 customers, seed 1), except customers: pick a block group whose centre is within 12,070 + 400 m of the hub, with probability proportional to population, then a Gaussian offset (sigma 400 m); redraw if under 300 m or over 12,070 m from the hub, or inside the no-fly circle. Local metres as NFZ (1° lat = 111,000 m, 1° lon = 93,370 m), hub 32.9886042, -96.6617927.
Arms: zone radius R = 0, 700, 850 m with sigma 400 m; sensitivity sigma 200 and 800 m at R = 0 and 850 m.
Not modelled: Amazon's exclusion of multi-family addresses in Richardson, opt-outs, actual demand per household.

## Predictions (w = 100 m, max over the five [street withheld] points)
- **RP1:** with R = 0, the fraction stays below 0.08. PREDICTION: holds.
- **RP2:** no arm reaches 0.40. PREDICTION: holds.
- **RP3:** with R = 0, population weighting raises the fraction to >= 1.2 × the uniform value (0.026). PREDICTION: holds (more homes lie north than in the commercial land around the hub).

## Rules
No changes after the data is in; code committed before the run; deviations logged.
- **K1:** block groups used: count and total population printed; all 100,000 customers within 300–12,070 m and outside the zone; R = 0 with uniform customers reproduces NFZ's 0.023–0.026 (w = 100).

## Deviation log
(none yet)
- (Appended after fingerprint b30e1f23…; pre-run check only.) K1 PASS: 440 block groups, population 721,506 within reach; all 100,000 customers (R 850, sigma 400) valid; uniform R = 0 reproduces NFZ (w100 0.023–0.026).
