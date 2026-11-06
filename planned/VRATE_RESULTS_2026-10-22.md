# Vertical speed and delay share: results (VRATE_PREREG.md, fingerprint b2dc2b81…), 2026-10-22
Status: behaviour model, planned tracks only, seeds 7–9. K1–K3 passed.

## Predictions

| Prediction | Result | Verdict |
|---|---|---|
| H1 V2 cuts Amazon's delayed share >= 50 % at d 4 and 3 | 44 % / 31 % | **FAIL** |
| H2 V2 ratio <= 3 at d 4 and 3 | 4.7 / 6.2 | **FAIL** |
| H3 at d 3, Amazon's share ratio V2/V0 within 0.7-1.3x its crossing-time ratio | share ratio 0.69, crossing ratio 0.29, quotient 2.39 | **FAIL** |

## Results (pooled, seeds 7-9)

| d | Arm | delayed: wing / amazon / zipline | asymmetry ratio | crossing time per flight (s): wing / amazon / zipline | total delay (h) | Amazon flight time (s) | cross meetings, no check | after check |
|---|---|---|---|---|---|---|---|---|
| 4 km | V0 filed | 1.8 % / 8.9 % / 0.7 % | 7.0 | 0 / 152 / 22 | 2.0 | 718 | 22 | 0 |
| 4 km | V1 in place, filed durations | 1.6 % / 6.4 % / 0.7 % | 5.8 | 0 / 152 / 22 | 1.8 | 788 | 19 | 0 |
| 4 km | V2 in place, 5 m/s | 1.5 % / 5.0 % / 0.6 % | 4.7 | 0 / 44 / 22 | 1.6 | 618 | 17 | 0 |
| 3 km | V0 filed | 3.8 % / 19.0 % / 1.5 % | 7.2 | 0 / 152 / 22 | 12.6 | 719 | 135 | 0 |
| 3 km | V1 in place, filed durations | 3.4 % / 13.6 % / 1.3 % | 5.8 | 0 / 152 / 22 | 12.1 | 788 | 153 | 0 |
| 3 km | V2 in place, 5 m/s | 3.0 % / 13.2 % / 1.2 % | 6.2 | 0 / 44 / 22 | 10.0 | 618 | 77 | 0 |
| 2 km | V0 filed | 6.1 % / 31.5 % / 3.5 % | 6.5 | 0 / 152 / 22 | 48.2 | 718 | 621 | 0 |
| 2 km | V1 in place, filed durations | 5.7 % / 22.2 % / 3.0 % | 5.1 | 0 / 152 / 22 | 39.4 | 787 | 626 | 0 |
| 2 km | V2 in place, 5 m/s | 5.2 % / 16.2 % / 2.6 % | 4.1 | 0 / 44 / 22 | 33.8 | 617 | 437 | 0 |

## What it shows
- **All three predictions failed.** At 5 m/s, Amazon's time crossing other operators' heights fell 71 % (152 to 44 s per flight), but its delayed share fell only 31–44 %, and the ratio stayed at 4–6.
- This is the second failed theory, after FAIR's ramps. Both are abandoned.

## Exploratory diagnosis (after the results; NOT registered): planned/vrate_diag.js
Instrumented which operator blocked each delayed flight's first try (V0, d = 3, seed 7). The recorder was checked and leaves the results unchanged.

| Pair | Delays on side 1 | Delays on side 2 |
|---|---|---|
| Amazon–Wing | Amazon 76 | Wing 87 |
| Amazon–Zipline | Amazon 50 | Zipline 47 |
| Wing–Zipline | Wing 44 | Zipline 60 |

Flights checked: Amazon 504, Wing 2,185, Zipline 7,649.

- **Inside every pair, first-filed splits the waiting roughly evenly.** The rule is not biased against Amazon.
- **The per-flight asymmetry is fleet-size arithmetic.** Each conflict delays one flight. Amazon is the smallest fleet and meets both big ones, so its few flights carry a large share per flight: about 0.52 conflicts per Amazon flight, 0.12 per Wing flight and 0.03 per Zipline flight.
- Absolute delays: Amazon flies 2–7 % of flights and bears 16–35 % of delays.
- **Consequence:** the claim "an operator's own profile decides its share of delay" is not supported. The "unfairness" in FAIR and PROC is mostly what any minority operator in a sky dominated by larger fleets would see under a rule that splits each conflict evenly. The "Shared Sky" note's wording ("the cost falls unevenly… on Amazon") must be corrected to say this.
