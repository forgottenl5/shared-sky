
### Peak factor 1
| Scenario | Runs | Flights (4 h) | Cross-op wide / h | Cross-op close / h | Same-op wide / h | Wide: Wing-Zipline | Wide: Amazon-Wing | Wide: Amazon-Zipline | Zipline-Amazon inbound share | Cross wide near sites | Overflights / km2 / day: max (median) |
|---|---|---|---|---|---|---|---|---|---|---|---|
| S0 | 5 | 419 | 0.00 | 0.00 | 64.00 | 0.00 | 0.00 | 0.00 | nan % | 0.00 | 414 (14) |
| S1 | 5 | 677 | 0.35 | 0.10 | 127.15 | 0.00 | 0.30 | 0.05 | 14 % | 0.00 | 1010 (18) |
| S2 | 5 | 806 | 0.30 | 0.00 | 162.30 | 0.00 | 0.15 | 0.15 | 50 % | 0.00 | 1009 (23) |

Phase split of wide cross-operator encounters per hour (vertical = at least one climbing/descending; hover = at least one hovering, none vertical):
- S1 amazon-wing: cruise 0.25, hover 0.00, vertical 0.05
- S1 amazon-zipline: cruise 0.00, hover 0.00, vertical 0.05
- S2 amazon-wing: cruise 0.10, hover 0.00, vertical 0.05
- S2 amazon-zipline: cruise 0.15, hover 0.00, vertical 0.00

### Peak factor 1.5
| Scenario | Runs | Flights (4 h) | Cross-op wide / h | Cross-op close / h | Same-op wide / h | Wide: Wing-Zipline | Wide: Amazon-Wing | Wide: Amazon-Zipline | Zipline-Amazon inbound share | Cross wide near sites | Overflights / km2 / day: max (median) |
|---|---|---|---|---|---|---|---|---|---|---|---|
| S0 | 5 | 616 | 0.00 | 0.00 | 132.10 | 0.00 | 0.00 | 0.00 | nan % | 0.00 | 415 (13) |
| S1 | 5 | 990 | 0.30 | 0.05 | 269.00 | 0.00 | 0.15 | 0.15 | 50 % | 0.00 | 1008 (16) |
| S2 | 5 | 1217 | 0.35 | 0.15 | 368.85 | 0.00 | 0.25 | 0.10 | 29 % | 0.10 | 1012 (22) |

Phase split of wide cross-operator encounters per hour (vertical = at least one climbing/descending; hover = at least one hovering, none vertical):
- S1 amazon-wing: cruise 0.15, hover 0.00, vertical 0.00
- S1 amazon-zipline: cruise 0.15, hover 0.00, vertical 0.00
- S2 amazon-wing: cruise 0.15, hover 0.00, vertical 0.10
- S2 amazon-zipline: cruise 0.00, hover 0.10, vertical 0.00

| Prediction | Value | Verdict |
|---|---|---|
| P1 Zipline + Amazon inbound > 50 % of wide cross-operator encounters in S1 and S2 | 14 %, 50 % | FAIL |
| P2 | not evaluable (0 Wing-Zipline wide encounters in S0) | not evaluable |
| P3 S1 -> S2 growth of Wing-Zipline and Amazon-Zipline wide encounters within [2.0, 3.0] | wing-zipline: 0.00 -> 0.00 /h (xnan); amazon-zipline: 0.05 -> 0.15 /h (x3.00) | FAIL |
