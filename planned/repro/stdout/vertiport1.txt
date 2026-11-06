
## Fig. 14 (75 s pad): TLOF pad utilization, engine vs Vascik & Hansman
| stands | engine | Vascik | difference | engine ops / 15 min |
|---|---|---|---|---|
| 1 | 33 % | 33 % | +0 | 4 |
| 2 | 50 % | 58 % | -8 | 6 |
| 3 | 75 % | 83 % | -8 | 9 |
| 4 | 92 % | 90 % | +2 | 11 |
| 5 | 100 % | 98 % | +2 | 12 |
| 6 | 100 % | 98 % | +2 | 12 |
| 7 | 100 % | 98 % | +2 | 12 |
| 8 | 100 % | 98 % | +2 | 12 |

## Fig. 15 (45 s pad): TLOF pad utilization, engine vs Vascik & Hansman
| stands | engine | Vascik | difference | engine ops / 15 min |
|---|---|---|---|---|
| 1 | 25 % | 23 % | +2 | 5 |
| 2 | 43 % | 48 % | -5 | 8 |
| 3 | 53 % | 63 % | -10 | 10 |
| 4 | 63 % | 78 % | -15 | 12 |
| 5 | 75 % | 83 % | -8 | 15 |
| 6 | 90 % | 88 % | +2 | 18 |
| 7 | 97 % | 93 % | +4 | 19 |
| 8 | 100 % | 100 % | +0 | 20 |

## Fig. 17 sweep (45 s pad): engine ops vs digitised values
| stands | 30 s | 60 s | 90 s | 120 s | 180 s | 240 s | 300 s | 450 s | 600 s |
|---|---|---|---|---|---|---|---|---|---|
| 1 | 15 (15) | 12 (12) | 10 (10) | 9 (9) | 7 (7) | 5 (5) | 5 (5) | 3 (3) | 3 (3) |
| 2 | 20 (20) | 18 (20) | 16 (19) | 14 (16) | 11 (13) | 10 (10) | 8 (10) | 6 (6) | 6 (6) |
| 4 | 20 (20) | 20 (20) | 20 (20) | 20 (20) | 18 (19) | 15 (18) | 12 (16) | 12 (12) | 9 (10) |
| 6 | 20 (20) | 20 (20) | 20 (20) | 20 (20) | 20 (20) | 19 (20) | 18 (18) | 15 (15) | 11 (12) |
| 8 | 20 (20) | 20 (20) | 20 (20) | 20 (20) | 20 (20) | 20 (20) | 20 (20) | 17 (17) | 13 (14) |
(engine (Vascik))

PASS V1: fig14 within 10 points in >= 7 of 8 -- 8 of 8; differences +0, -8, -8, +2, +2, +2, +2, +2
PASS V2: fig15 within 10 points in >= 7 of 8 -- 7 of 8; differences +2, -5, -10, -15, -8, +2, +4, +0
PASS V3: first stand count with >= 95 %% use is 5+-1 (fig14) and 8+-1 (fig15) -- fig14 5, fig15 7
PASS V4: Fig. 17 within 2 ops in >= 80 % of 45 points -- 42 of 45
PASS V5: engine never above Vascik by more than 5 points -- largest excess +4

5 of 5 predictions passed
