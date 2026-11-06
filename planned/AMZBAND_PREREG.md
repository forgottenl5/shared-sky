# Amazon spread across its Texas-filed band (written 2026-10-23 before any run)
Status: behaviour model of planned operations; no plan check; counting at 4 checks per second; research configuration (as PRELAUNCH S1).

## Why
Amazon's final Texas EA (TEXAS_FILINGS_2026-10-23.md) gives one en-route band for both legs, 180–377 ft (55–115 m), not the fixed Omaha profile (61 out / 105 back) used as "filed" so far. Zipline's 101 m sits inside it.

## Arms (d = 3 and 4 km, seeds 1–3)
- **T**: Wing 46–91 m (uniform per flight, as before), Zipline 101 m, Amazon outbound and inbound each drawn uniformly in 55–115 m per flight (independently).
- **A2**: allocation (Wing 46–71, Amazon 81 / 115, Zipline 101) — reused from PRELAUNCH S1 (identical settings).
- Comparison values reused from PRELAUNCH S1: B(61,105) = 778 wide, B(69,122) = 189 wide.

## Predictions (pooled over the six runs)
- **B1:** T has between 400 and 800 cross-operator wide meetings. PREDICTION: holds.
- **B2:** A2 cuts T's wide meetings by >= 65 %. PREDICTION: holds.
- **B3:** Amazon–Zipline is the largest pair in T. PREDICTION: holds.
- **Consequence rule:** the city page and write-up describe the Texas filing as a band and report the cut against T alongside the Omaha-profile and reported-height results; if B2 fails, the headline uses the cut against T.

## Rules
No changes after the data is in; deviations logged below. Runner and analysis committed before runs. Feature check K1: in T, every Amazon cruise sample lies in [55, 115] m and the outbound and inbound heights are not all equal.

## Deviation log
(none yet)
- (Appended after fingerprint 67c6b53f…; pre-study check only.) K1 PASS: 1,846 Amazon flights at d = 4 seed 1, none outside 55–115 m, none with equal legs.
