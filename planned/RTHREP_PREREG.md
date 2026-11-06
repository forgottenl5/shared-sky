# Return-to-home height under Amazon's reported heights (written 2026-10-23 before any run)
Status: behaviour model; plan check on (30 m cells, ±5 s, 10 m vertical); 20 % of in-zone flights return home (COUNTFIX R-RTH settings, seeds 19–21, d = 3 and 4); counting at 4 checks per second.

## Why
COUNTFIX found a common 120 m return height 10.7× riskier than returning at own height, with heights shared out (A2, Amazon inbound 115 m). Under the heights Amazon is reported to fly (R: 69 m out, 122 m back), 120 m sits 2 m below Amazon's inbound cruise.

## Arms
R heights (Wing 46–91, Amazon 69 / 122, Zipline 101): **R-RTH120** (return at 120 m) and **R-RTHOWN** (return at own height). A2 values reused from COUNTFIX R-RTH (96 wide per 6,235 events at 120 m; 9 at own height).

## Predictions (pooled)
- **H1:** R-RTH120 has >= 5× R-RTHOWN's cross-operator wide meetings per 100 events. PREDICTION: holds.
- **H2:** R-RTH120's rate per 100 events is >= A2's RTH-120 rate (1.54). PREDICTION: holds (120 m is closer to Amazon's 122 m than to its allocated 115 m... both are within 10 m, so this tests the 2 m vs 5 m difference).
- Reported: close meetings; exact rate-ratio intervals.

## Rules
No changes after the data is in; runner and analysis committed before runs; deviations logged below. K1: with 0 % returns (frac 0), R-RTH120 equals R with plan check and no contingency (same cross counts).

## Deviation log
(none yet)
- (Appended after fingerprint afc7db4c…; pre-study check only.) K1 PASS: frac 0 with RTH-120 equals plan-checked R with no contingency (0 / 0 cross meetings both; the plan check removes all planned meetings, so this check confirms the frac-0 path changes nothing but is otherwise weak).
