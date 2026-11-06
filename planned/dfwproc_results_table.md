## Part A: plan check cost (±5 s)
| Heights | d | flights checked | delayed | delayed share | mean wait (s) | cancelled | delayed share: Wing / Zipline / Amazon |
|---|---|---|---|---|---|---|---|
| A0 | 3 | 19243 | 1633 | 8.5 % | 55 | 0 | 3.1 / 7.3 / 50.5 % |
| A0 | 4 | 10806 | 308 | 2.9 % | 41 | 0 | 1.5 / 2.1 / 26.3 % |
| A0 | both | 30049 | 1941 | 6.5 % | 53 | 0 | 2.5 / 5.4 / 44.3 % |
| R | 3 | 19243 | 644 | 3.3 % | 39 | 0 | 2.8 / 1.3 / 25.2 % |
| R | 4 | 10806 | 126 | 1.2 % | 35 | 0 | 1.3 / 0.6 / 8.0 % |
| R | both | 30049 | 770 | 2.6 % | 38 | 0 | 2.2 / 1.1 / 20.8 % |
| A2 | 3 | 19243 | 383 | 2.0 % | 35 | 0 | 1.6 / 1.3 / 10.3 % |
| A2 | 4 | 10806 | 94 | 0.9 % | 34 | 0 | 1.0 / 0.6 / 3.1 % |
| A2 | both | 30049 | 477 | 1.6 % | 35 | 0 | 1.4 / 1.1 / 8.5 % |

## Part B: sharing-out cut by traffic level (no check)
| Site spacing | Omaha profile (A0) | Shared out (A2) | cut |
|---|---|---|---|
| 2 km | 2182 | 408 | 81 % |
| 3 km | 156 | 34 | 78 % |
| 4 km | 29 | 13 | 55 % |

| Prediction | Result | Verdict |
|---|---|---|
| C1 A2 delayed share 0.5–3 % at d 3 and 4 [Houston 1.5–2.3 %] | 2.0 / 0.9 % | **PASS** |
| C2 A0 delayed flights >= 2.5× A2 [4.4×] | 4.1× | **PASS** |
| C3 Amazon highest delayed share under A2 | amazon (wing 1.4 %, zipline 1.1 %, amazon 8.5 %) | **PASS** |
| C4 cut >= 65 % at d 2, 3, 4 [80–83 %] | 81 % / 78 % / 55 % | **FAIL** |
| C5 cut at d 2 within 10 points of d 4 | +26 points | **FAIL** |

Runs read: 36 (expected 36).
