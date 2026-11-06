# RECOUNT1 results (2026-10-29): Houston area-outage ratio at 4 checks per second
Registration planned/RECOUNT1_PREREG.md; runner planned/recount1_run.js; analysis planned/recount1_analyze.py.

**3 of 3 predictions passed.** K1 passed. Old figure (1 check per second, seeds 22-24): 7.0x (95 % 4.1-12.9).

| Check | Result | Verdict |
|---|---|---|
| K1 | sub 1, seeds 22-24: OUT-A0 106 cross wide over 2208 held, OUT-A2 15 over 2187 (OUTAGE: 106 over 2208, 15) | PASS |
| R1 | sub 4, seeds 22-24: ratio 5.3 (95 % 3.5-8.3); 145 vs 27 | PASS |
| R2 | sub 4, seeds 22-31: ratio 6.5 (95 % 4.9-8.8); 358 over 6716 held vs 55 over 6701 | PASS |
| R3 | per 100 held, sub 1 -> sub 4 (seeds 22-24): OUT-A0 4.80 -> 6.57, OUT-A2 0.69 -> 1.23 | PASS |
