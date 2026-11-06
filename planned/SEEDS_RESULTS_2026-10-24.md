# More seeds: results (2026-10-24)
Pre-registration: SEEDS_PREREG.md, sha256 ea7b9aef…, committed with code before any run. The queue was stopped once by the 2 h job limit; the remaining runs were resumed with the runner's RESUME option (no job run twice; 192 and 40 runs read, as expected). No other deviations.

## Houston build-out, 10 seeds (mid and full)
| Stage | Close calls an hour, Omaha profile: mean (seed range) | Sharing-out cut [90 % interval] | Cut vs high-return case | ±30 s check in typical wind removes | Delayed share, Omaha / shared out |
|---|---|---|---|---|---|
| Mid | 6.3 (2.5–9.5) | 83 % [77–89] | 42 % | 51 % | 3.1 % / 0.7 % |
| Full | 33.9 (19.0–50.0) | 81 % [77–84] | 32 % | 58 % | 6.2 % / 1.6 % |

## DFW real layout, 10 seeds
| Sharing-out cut vs Omaha [90 %] | vs Texas band | vs high-return case | Amazon share of Omaha-profile close calls |
|---|---|---|---|
| 80 % [75–84] | 73 % | **33 %** | 96 % |

| Prediction | Result | Verdict |
|---|---|---|
| S-B1 mid below 10 an hour | 6.3 | **PASS** |
| S-B2 sharing out >= 65 % at mid and full | 83 / 81 % | **PASS** |
| S-B3 full ±30 s wind check removes < 80 % | 58 % | **PASS** |
| S-B4 delayed share with sharing out <= half | 1.6 vs 6.2 % | **PASS** |
| S-F DFW thresholds | 96 / 80 / 33 / 73 % | **PASS** |

## What changes
- The headline cuts are stable: 81–83 % in Houston's build-out and 80 % in DFW, with 90 % intervals of about ±4–6 points.
- **Correction:** DFWREAL's "3 % against the high-return case" (3 seeds: 33 → 32 close calls) was noise; with 10 seeds it is 33 %. Per-hour counts vary about 2.5× between layouts, so per-hour numbers are rough; cuts are much steadier.
