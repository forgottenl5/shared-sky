# Return-to-home height under Amazon's reported heights: results (RTHREP_PREREG.md, fingerprint afc7db4c…), 2026-10-23
K1 passed (weak, see log). 12 runs; analysis script committed before the runs. H1 passed, H2 failed.

```
R-RTH120: runs 6, events 6236, wide 86 (1.38 per 100), close 17
R-RTHOWN: runs 6, events 6236, wide 10 (0.16 per 100), close 3
ratio 8.6 [4.5–18.6]
| Prediction | Result | Verdict |
|---|---|---|
| H1 R-RTH120 >= 5x R-RTHOWN per 100 | 8.6x | **PASS** |
| H2 R-RTH120 rate >= A2 RTH-120 rate 1.54 per 100 | 1.38 | **FAIL** |
```

## What this means
1. **The common-return-height finding does not depend on where Amazon flies.** Returning at a common 120 m is 8.6× [4.5–18.6] riskier than returning at each drone's own height under Amazon's reported heights, against 10.7× [5.4–24] with the allocation (COUNTFIX R-RTH). Of all our findings it is the least sensitive to the Amazon-height question.
2. **H2 failed.** I predicted the 120 m return would be at least as risky as under the allocation, because 120 m is 2 m from Amazon's reported 122 m return instead of 5 m from its allocated 115 m. The rate was slightly lower (1.38 against 1.54 per 100 returns). Both gaps are inside the 10 m threshold, so the exact gap matters little; most meetings come from returning drones climbing through other operators' layers.
3. Practical reading: an emergency return should keep each drone at its own operator's height, not send everyone to one common height.
