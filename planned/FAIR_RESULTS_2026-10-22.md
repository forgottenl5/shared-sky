# Fairness: flight shape vs priority rule — results (FAIR_PREREG.md, fingerprint 6a8251a4…), 2026-10-22
Status: behaviour model of filed operations (planned tracks only), seeds 4–6 (new). Feature checks K1–K4 passed. Not a forecast or safety assessment.

## Predictions

| Prediction | Result | Verdict |
|---|---|---|
| G1 F0 ratio >= 3 at d 4 and 3 | 6.7 / 7.6 | **PASS** |
| G2 F1 cuts Amazon's delayed share >= 50 % and ratio <= 2 at d 4 and 3 | cut 27 % / 40 %; ratio 5.7 / 5.1 | **FAIL** |
| G3 F2 total delay within +-25 % of F0 at d 3 | +1 % | **PASS** |
| G4 F3 ratio stays >= 3 at d 3 | 7.9 | **PASS** |

## Delay by operator (pooled, seeds 4-6)

| d | Arm | delayed: wing / amazon / zipline | mean delay per flight (s): wing / amazon / zipline | asymmetry ratio | delayed flights | total delay (h) | cancelled | cross meetings after check |
|---|---|---|---|---|---|---|---|---|
| 4 km | F0 first filed | 2.1 % / 11.5 % / 1.3 % | 1.0 / 4.2 / 0.4 | 6.7 | 408 | 4.2 | 0 | 0 |
| 4 km | F1 Amazon in place | 2.0 % / 8.4 % / 1.0 % | 1.0 / 2.9 / 0.3 | 5.7 | 317 | 3.4 | 0 | 0 |
| 4 km | F2 Amazon first | 2.4 % / 9.2 % / 1.5 % | 1.1 / 3.2 / 0.5 | 4.7 | 411 | 4.2 | 0 | 0 |
| 4 km | F3 rotating | 2.1 % / 11.2 % / 1.4 % | 1.0 / 4.2 / 0.4 | 6.4 | 408 | 4.2 | 0 | 0 |
| 3 km | F0 first filed | 2.5 % / 15.5 % / 1.6 % | 1.2 / 5.8 / 0.5 | 7.6 | 741 | 7.8 | 0 | 0 |
| 3 km | F1 Amazon in place | 2.4 % / 9.3 % / 1.2 % | 1.1 / 3.5 / 0.4 | 5.1 | 579 | 6.2 | 0 | 0 |
| 3 km | F2 Amazon first | 2.8 % / 11.5 % / 1.7 % | 1.4 / 4.2 / 0.6 | 5.1 | 749 | 7.9 | 0 | 0 |
| 3 km | F3 rotating | 2.5 % / 16.1 % / 1.6 % | 1.3 / 6.2 / 0.5 | 7.9 | 749 | 8.1 | 0 | 0 |
| 2 km | F0 first filed | 5.1 % / 27.5 % / 2.6 % | 2.5 / 13.7 / 0.9 | 7.2 | 2656 | 31.2 | 0 | 0 |
| 2 km | F1 Amazon in place | 4.6 % / 19.8 % / 2.2 % | 2.3 / 8.7 / 0.8 | 5.9 | 2218 | 25.6 | 0 | 0 |
| 2 km | F2 Amazon first | 5.5 % / 20.4 % / 2.9 % | 2.6 / 9.1 / 1.0 | 4.9 | 2703 | 30.2 | 0 | 0 |
| 2 km | F3 rotating | 5.2 % / 27.7 % / 2.5 % | 2.6 / 14.2 / 0.8 | 7.2 | 2642 | 31.7 | 0 | 0 |

## F1 without any plan check (Amazon in place vs filed profile under A2 only)

| d | cross wide (F1, no check) | Amazon extra flight time (s) |
|---|---|---|
| 4 km | 50 | 70 |
| 3 km | 83 | 70 |
| 2 km | 341 | 70 |

## What it shows
1. **The asymmetry replicates (G1 PASS).** Under first filed goes first, with every operator filing the same way, Amazon is delayed 6.7–7.6× as often as Wing and Zipline (11–28 % of its flights vs 1–5 %). Unlike the prior work (Airbus 2020, CNA 2023), filing time plays no part here: the cause sits in the flight profiles.
2. **The main prediction failed (G2 FAIL).** Flying Amazon's height changes in place instead of on ramps cut its delayed share by only 27–40 % (≥ 50 % predicted), and the ratio stayed at 5–6 (≤ 2 predicted). The ramps' lateral extent is not the main cause. F1 also costs Amazon about 70 s per flight.
3. **Priority rules move delay, but do not remove it.** Amazon-first (F2) left total delay unchanged (+1 % at d = 3, G3 PASS) and lowered the ratio only to 4.7–5.1. Even with first pick inside each 5-minute window, Amazon mostly meets flights from earlier windows already in the air. Rotation (F3) changed nothing (ratio 7.9, G4 PASS).

## Exploratory diagnosis (after the results; NOT registered)
planned/fair_diag.js, d = 3, seed 4: seconds per flight spent changing height inside another operator's cruise band (±10 m).

| Operator | Flight time | Changing height | of which in others' bands |
|---|---|---|---|
| Wing | 593 s | 44 s | 0 s |
| Zipline | 1,039 s | 40 s | 22 s |
| Amazon (filed or in place) | 716–786 s | 247 s | 152 s |

- Amazon spends about 7× longer than Zipline inside other operators' heights, matching the delay ratio. Its filed height changes are slow (about 1–2 m/s, against 5 m/s for Wing and Zipline), and it crosses both other bands, out and back.
- Flying the changes in place keeps their duration, which explains why F1 helped little.
- **Hypothesis for a next registered test:** the share of delay an operator bears under a shared plan check follows the time its profile spends crossing other operators' heights. Amazon's slow transitions, not its ramps or the priority rule, would then be the lever.

## Limits
- Planned tracks only.
- Delays count only zone conflicts (lower bound).
- 5-min windows with equal filing.
- Amazon's in-place profile is a design alternative, not filed.
- The diagnosis is correlational, on one seed and one density.
