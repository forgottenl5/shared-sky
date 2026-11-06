# More seeds for the build-out and DFW results (written 2026-10-24 before any study run)
Status: precision check, as the independent review asked (findings 9–11: per-seed spread is large).

## Design
- **Houston build-out (BUILDOUT, corrected engine):** seeds 4–10 added for the mid and full stages, heights A0 / R / A2, variants still-air ±5 s and wind ±30 s (`STAGES=mid,full VARIANTS=still5,wind30 SEEDS=4..10 OUT=out/seeds_buildout node planned/buildout_run.js`; defaults unchanged). 84 runs. Pooled with the registered seeds 1–3.
- **DFW real layout (DFWREAL):** seeds 4–10 added, all four height arms, same code and counting as the registered run (`SEEDS=4..10 OUT=out/seeds_dfwreal`). 28 runs. Pooled with seeds 1–3.
- Reported: per-hour means with seed ranges; cuts with 90 % bootstrap intervals over seeds (planned/seeds_analyze.py).

## Predictions (10 seeds pooled): the original verdicts do not change
- **S-B1:** mid stage stays below 10 close calls an hour (B1's FAIL persists). PREDICTION: holds.
- **S-B2:** sharing out cuts >= 65 % at mid and full. PREDICTION: holds.
- **S-B3:** at full, the ±30 s wind check still removes < 80 % (B3's FAIL persists). PREDICTION: holds.
- **S-B4:** at full, the delayed share with sharing out is at most half that with A0. PREDICTION: holds.
- **S-F:** DFW: Amazon in >= 60 % of A0 meetings; cut vs A0 >= 45 %; vs R <= 50 %; vs T >= 40 %. PREDICTION: holds.

## Rules
No changes after the data is in; code committed before runs; deviations logged below.

## Deviation log
(none yet)
