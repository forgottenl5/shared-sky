# DFW plan-check cost and traffic levels: results (DFWPROC_PREREG.md, sha256 6c70979e…), 2026-10-25
K1 passed; K2 passed after a logged check-specification correction (code unchanged). 36 runs; analysis script committed before the runs. C1–C3 passed, C4 and C5 failed.

## Result in one line
**The plan check costs about the same in DFW as in Houston:** with shared-out heights 1–2 % of flights wait about 35 s, 4.1× fewer than with the filed plans, and Amazon waits most (8.5 % of its flights). **The height-sharing cut holds at high traffic (81 % at 2 km, 78 % at 3 km) but could not be measured at 4 km spacing:** only 29 close calls with the filed plans, so the 55 % cut has a 95 % interval of 11–79 %.

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

95 % intervals on the cut (exact conditional binomial): 2 km 81 % [79–83], 3 km 78 % [68–85], 4 km 55 % [11–79].

## Reading
- **C4 and C5 failed, at 4 km only.** DFW's lab layout at 4 km spacing is sparse (Zipline flies under half as much as in Houston), and 29 against 13 close calls cannot pin the cut down. I predicted a cut of at least 65 % at every spacing; the 4 km result is consistent with that and with much less. The failures stand as registered.
- The real DFW layout at the filed caps (DFWREAL, SEEDS: 80 % over 10 runs) is denser near the centre than the 4 km lab layout, so the headline does not rest on the 4 km arm.
- **Amazon under the filed plans waits on 44 % of its flights** (DFW) against 9–14 % shared-out in Houston: its Omaha-profile return at 105 m sits 4 m from Zipline's 101 m cruise, and Amazon is the smallest fleet (FLEET). Shared out, it falls to 8.5 %.
