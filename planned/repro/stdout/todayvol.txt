
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
