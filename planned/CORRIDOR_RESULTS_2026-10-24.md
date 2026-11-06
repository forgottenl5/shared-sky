# Registered-path corridors near sites: results (2026-10-24)

> **Note added 28 Oct 2026.** "Independent review" and reviewer roles in this file mean AI reviewers (fresh sessions of the AI assistant used to build the project), not people. See VERIFY.md.
Pre-registration: CORRIDOR_PREREG.md, sha256 70a60cca…, committed with code (c14546f) before any run. K1 failed once on a harness miscount (15 vs 13 segments), fixed once and passed (logged). Part A: 30 configurations × 2 zone radii; part B: 9 runs plus the 12 HOUREAL straight runs as reference.

## Corrections after independent review (24 Oct 2026, REVIEW_2026-10-24.md)
- Part A's aimed fractions are about 1/K by construction (each corridor carries 1/K of traffic), so RC1 and RC2 could hardly fail. The result shows two shared paths are **sufficient** to produce the count, not that they are its cause; other explanations (counting distance, that day's volume, fixed per-address paths) remain open. Remote ID tracks would decide.
- The aimed corridor passes 628 m from the no-fly-zone centre, so with an 850 m zone it is itself detoured, and 2 of the 5 [street withheld] points lie inside that zone. The sentence "consistent with … avoids the no-fly zone" is withdrawn.
- Part B: 27 % → 15 % against reported heights rests on 74 vs 63 meetings (per-seed cuts 0 / 9 / 35 %): not distinguishable. Close meetings under the Omaha profile rose from 122 to 154 with corridors, unmentioned before.

## Result in one line
**Shared departure paths are enough to reproduce Richardson's count (a fit, not proof); they do not change the headline.** About two corridors out of the hub, one over [street withheld], put 50 % of passes over the street, matching the resident-implied 40–55 %. In Houston's real layout, routing Amazon on corridors leaves height sharing's cut at 80 % against the Omaha profile (straight 79 %) and 15 % against reported heights (straight 27 %).

## Part A — Richardson (share of hub passes within 100 m of a [street withheld] point, max over five points)
| Corridors K | aimed over [street withheld] (D 2–3 km) | random orientation, mean (max) | aimed, with 850 m no-fly zone |
|---|---|---|---|
| straight | 0.026 | — | 0.098 |
| 2 | **0.50** | 0.08 (0.50) | 0.50 |
| 3 | 0.33 | 0.06 (0.33) | 0.33 |
| 4 | 0.25 | 0.08 (0.25) | 0.25 |
| 6 | 0.16 | 0.07 (0.16) | 0.16 |
| 8 | 0.12 | 0.06 (0.12) | 0.12 |
Observed: **0.40–0.55**. D = 1 km arms never used a corridor (the 1,050 m straight-flight rule in the registration), so they equal straight routes and carry no information.

| Prediction | Result | Verdict |
|---|---|---|
| RC1 aimed K 4, D 2 km >= 0.20 | 0.245 | **PASS** |
| RC2 no aimed K >= 3 reaches 0.40 | max 0.331 | **PASS** |
| RC3 random K 4, D 2 km mean <= 0.10 | 0.082 | **PASS** |

Reading: the observation can be reproduced by **about two shared departure paths, one passing over the street**, which fits residents' "drone highway". It is a fit, not proof: the orientation was chosen to match.

## Part B — Houston real layout, Amazon on corridors (K 4, D 2 km)
| Arm | straight wide / close | corridors wide / close |
|---|---|---|
| A0 Omaha profile | 315 / 122 | 311 / 154 |
| R reported | 89 / 26 | 74 / 18 |
| A2 allocation | 65 / 18 | 63 / 14 |
A2 cut vs A0: 80 % wide, 91 % close (straight 79 / 85 %). Vs R: 15 % wide, 22 % close (straight 27 / 31 %).

| Prediction | Result | Verdict |
|---|---|---|
| RB1 A2 cuts A0 >= 65 % | 80 % | **PASS** |
| RB2 A0 corridors / straight 0.7–1.3 | 0.99 | **PASS** |
| RB3 A2 cuts R <= 50 % | 15 % | **PASS** |

## What changes
- The Richardson check moves from "fails, cause unknown" to "**reproduced by a corridor model fitted to it**": shared paths near the hub are the likely cause. Recorded tracks (Remote ID) would confirm or refute it.
- The headline is unchanged by routing; against reported heights the difference (15 % vs 27 %) is within seed noise.
- Limits: stylised corridors (equal sectors, one turn point), Amazon only; 3 seeds in part B.
