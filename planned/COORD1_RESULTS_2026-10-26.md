# COORD1 results (registration planned/COORD1_PREREG.md, fingerprint b6584da5…; runner/analysis commit 5d83377)
Full tables: planned/coord1_results_table.md. 60 runs (2 metros x A0/A2 x 5 arms x seeds 1-3), p90-wind hours, plans on previous-hour wind, flown in actual-hour wind. K1 6/6, K2 exact (Houston 17=17, DFW 13=13). No deviations.

## Predictions: 4 of 6 passed, 2 failed
- **C1 PASS** V2 cuts flown planned conflicts 99% (Houston 13.0 -> 0.2/h) and 96% (DFW 4.3 -> 0.2/h), A2 heights.
- **C2 PASS** the old point check keeps 62% (Houston) / 50% (DFW) of conflicts in wind: it is not real coordination.
- **C3 FAIL** V2 with A2 delays 19.2% (Houston) / 16.7% (DFW) of flights, not <= 5%. The A0/A2 ratio part held (2.0x, 2.1x): shared-out heights roughly halve coordination delays.
- **C4 PASS** V3 delays 38-48% and cancels ~26%; height sharing stops helping (A0/A2 ratio 1.0).
- **C5 FAIL** V1: 48% / 40% of flights leave their windows (>= 20% held). V2: 14.9% / 13.8%, not <= 10%.
- **C6 PASS** V2 leaves 5% / 0% of tight conflicts.

## What it says (and doesn't)
- Zero-ish conflicts between accepted plans is reproduced by construction (any working intent check does this); that is not an independent validation of Wing/Flytrex's claim, only consistent with it.
- New content: the cost. With plausible volume sizes (V2), roughly 1 in 6 flights waits (mean ~6 min) in the filed build-outs, in the model; at regulatory-accuracy altitude bands (V3) a quarter are cancelled. Operators do not publish these.
- Residual flown conflicts under V2 are ~0.2/h because 14-15% of flights leave their own windows in p90 wind.
- **Unexplained, not investigated:** under V2 Amazon is delayed 79-86% of the time vs 5-20% for Wing/Zipline. Hypothesis (untested): Amazon's depot climb/descent crosses the other companies' reserved layers near shared depots, and first-filed ordering by take-off time does not favor it. This may be a model artifact (ordering rule, ground-adjacent hover blocks) and must be checked before anyone quotes company-level numbers.
- Behaviour model; F3548 itself is paywalled; volume sizes are my assumptions (V2's w from the Remote ID accuracy rule, others invented). Not a forecast.

## Post-run diagnosis of the Amazon delays (exploratory, after the data; Houston seed 1, A2, p-wind not used)
Not a registered test. Cause found in the geometry, not a bug:
- A2 puts Amazon outbound at 81 m, Wing at 46-71 m, Amazon inbound at 115 m, Zipline at 101 m. V2 reserves v = 10 m above and below each flight, so two layers need a gap of at least 20 m. The gaps are 10 m (Amazon 81 vs Wing 71) and 14 m (Amazon 115 vs Zipline 101): the reservations overlap, so these pairs are treated as sharing height wherever paths pass within 60 m.
- Amazon also climbs and descends through every layer in single long vertical blocks at its depots.
- Check: V2 with v = 5 m (everything else equal) cuts Amazon delays from 786 to 490 of 911 flights (86% -> 54%) and Zipline from 2,214 to 638 of 12,438 (18% -> 5%). So most of the Amazon and Zipline cost is the layer gap being smaller than the reservation; the rest (about half of Amazon) is its vertical transits.
- Consequence for the headline: "shared-out heights" with 10-14 m gaps only help coordination if the volumes are tighter than those gaps. The next height study should pick layer gaps to the reservation size (>= 2v), not only to conflict counts. Company-level delay shares above are real model outputs for these layers, not an ordering artifact.
