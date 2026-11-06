# Amazon at today's reported volume: results (2026-10-25)

> **Note added 28 Oct 2026.** "Independent review" and reviewer roles in this file mean AI reviewers (fresh sessions of the AI assistant used to build the project), not people. See VERIFY.md.
Pre-registration: TODAYVOL_PREREG.md, sha256 da410b67…, committed with runner and analysis (d53782c) before any run. K1 passed; K2 informational (see log). 216 runs (2 metros x 3 stages x 3 heights x 2 Amazon volumes x 6 seeds), 12 measured hours per cell. Deviation: interval code overflow fixed (no data change).

## Result in one line
**With Amazon at about 200 flights a day (20 % of its cap) the number of cross-company meetings falls by about two thirds, not four fifths, and Amazon still accounts for most of what is left; sharing out heights still helps (79 % DFW, 62 % Houston at full build-out).** 7 of 10 predictions passed (corrected 27 Oct 2026: earlier misstated as 8 of 10; the failures are T4 in both metros and Houston T2).

| Metro, full build-out, Omaha profile | Amazon at cap | Amazon at 20 % | Sharing-out cut at 20 % (A2 vs A0) |
|---|---|---|---|
| DFW | 25.3 an hour (304) | 7.9 an hour (95) | 79 % (95 to 20) |
| Houston | 32.8 an hour (393) | 9.2 an hour (110) | 62 % (110 to 42) |

## What the failures say
- **T4 failed in both metros:** Amazon pairs are still 79 of 95 (DFW) and 79 of 110 (Houston) of the Omaha-profile meetings at 20 % volume. I predicted under half. Amazon's drones are the ones that cross the other two companies' bands (its return leg sits near Zipline's 101 m), so cutting Amazon's flights five-fold still leaves it the main party. The finding that "it is mostly Amazon and Zipline" does not depend on Amazon flying at its cap.
- **T2 failed in Houston** (Wing-Zipline 17 at cap vs 31 at 20 %). The Wing and Zipline flights are not held fixed between the two volume settings (K2), so this compares two independent samples; counts of 17 and 31 differ by more than chance usually does (about 4 %), but 17 vs 16 in DFW agree, and the effect cannot be due to Amazon. Read as sampling noise plus an unexplained residual, not as a finding.
- **Houston's sharing-out cut falls to 62 %** at 20 % (DFW stays 79 %). With fewer Amazon meetings to remove, the Wing-Zipline meetings, which the Amazon-focused height plan does not touch, are a bigger share. The early-stage cells have 0 to 8 meetings and say nothing.

## Caveats
- Wing and Zipline stay at their stage volumes; no current figure for them is public. Houston's Amazon volume is unpublished: 20 % is borrowed from Richardson.
- 12 hours per cell; most cells below mid-stage are too small to compare.

## Correction (25 Oct, after an independent review)
The intervals in the tables below are Poisson intervals on counts pooled over seeds. They ignore seed-to-seed spread, which is large here (Houston full, Omaha profile: 38 to 93 per seed; variance about 6 times the mean), so they are too narrow by roughly 2.5 times, and the word "exact" overstated them. The point estimates and verdicts are unchanged. HEADLINE2 uses seed bootstrap intervals instead.

## Tables

## DFW: wide meetings per hour between companies (count and exact 95 % interval in brackets, 12 measured hours per cell)
| Stage | Heights | Amazon at cap | Amazon at 20 % (v20) | v20 / cap |
|---|---|---|---|---|
| early | A0 | 0.67 (8; 3-16) | 0.08 (1; 0-6) | 12 % |
| early | R | 0.08 (1; 0-6) | 0.00 (0; 0-4) | 0 % |
| early | A2 | 0.00 (0; 0-4) | 0.00 (0; 0-4) | - |
| mid | A0 | 3.50 (42; 30-57) | 0.75 (9; 4-17) | 21 % |
| mid | R | 1.50 (18; 11-28) | 0.42 (5; 2-12) | 28 % |
| mid | A2 | 1.08 (13; 7-22) | 0.25 (3; 1-9) | 23 % |
| full | A0 | 25.33 (304; 271-340) | 7.92 (95; 77-116) | 31 % |
| full | R | 8.83 (106; 87-128) | 3.92 (47; 35-63) | 44 % |
| full | A2 | 4.67 (56; 42-73) | 1.67 (20; 12-31) | 36 % |

Sharing out (A2 vs A0), cut in wide meetings:
- early cap: 8 -> 0 (100 % cut)
- early v20: 1 -> 0 (100 % cut)
- mid cap: 42 -> 13 (69 % cut)
- mid v20: 9 -> 3 (67 % cut)
- full cap: 304 -> 56 (82 % cut)
- full v20: 95 -> 20 (79 % cut)

Pairs at full, Omaha profile (A0), wide meetings:
- cap: amazon-zipline 214, amazon-wing 73, wing-zipline 17
- v20: amazon-zipline 60, amazon-wing 19, wing-zipline 16

## HOUSTON: wide meetings per hour between companies (count and exact 95 % interval in brackets, 12 measured hours per cell)
| Stage | Heights | Amazon at cap | Amazon at 20 % (v20) | v20 / cap |
|---|---|---|---|---|
| early | A0 | 0.33 (4; 1-10) | 0.25 (3; 1-9) | 75 % |
| early | R | 0.08 (1; 0-6) | 0.00 (0; 0-4) | 0 % |
| early | A2 | 0.08 (1; 0-6) | 0.25 (3; 1-9) | 300 % |
| mid | A0 | 6.67 (80; 63-100) | 2.17 (26; 17-38) | 32 % |
| mid | R | 1.92 (23; 15-35) | 0.42 (5; 2-12) | 22 % |
| mid | A2 | 1.17 (14; 8-23) | 0.58 (7; 3-14) | 50 % |
| full | A0 | 32.75 (393; 355-434) | 9.17 (110; 90-133) | 28 % |
| full | R | 7.92 (95; 77-116) | 3.75 (45; 33-60) | 47 % |
| full | A2 | 5.50 (66; 51-84) | 3.50 (42; 30-57) | 64 % |

Sharing out (A2 vs A0), cut in wide meetings:
- early cap: 4 -> 1 (75 % cut)
- early v20: 3 -> 3 (0 % cut)
- mid cap: 80 -> 14 (82 % cut)
- mid v20: 26 -> 7 (73 % cut)
- full cap: 393 -> 66 (83 % cut)
- full v20: 110 -> 42 (62 % cut)

Pairs at full, Omaha profile (A0), wide meetings:
- cap: amazon-zipline 330, amazon-wing 46, wing-zipline 17
- v20: amazon-zipline 70, wing-zipline 31, amazon-wing 9

| Prediction | Result | Verdict |
|---|---|---|
| T1 dfw: A0 full v20 <= 50 % of cap | 95 vs 304 | **PASS** |
| T2 dfw: Wing-Zipline same within 15 % | cap 17, v20 16 | **PASS** |
| T3 dfw: A2 cuts A0 >= 50 % at v20 | 95 -> 20 | **PASS** |
| T4 dfw: Amazon pairs < 50 % of A0 at v20 | 79 of 95 | **FAIL** |
| T5 dfw: mid A0 v20 <= 1.5/h | 0.75/h | **PASS** |
| T1 houston: A0 full v20 <= 50 % of cap | 110 vs 393 | **PASS** |
| T2 houston: Wing-Zipline same within 15 % | cap 17, v20 31 | **FAIL** |
| T3 houston: A2 cuts A0 >= 50 % at v20 | 110 -> 42 | **PASS** |
| T4 houston: Amazon pairs < 50 % of A0 at v20 | 79 of 110 | **FAIL** |
| T5 houston: mid A0 v20 <= 3.0/h | 2.17/h | **PASS** |

Runs read: 216 (expected 216).
