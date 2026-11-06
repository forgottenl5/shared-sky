# Amazon at its best-sourced heights (written 2026-10-24 before any study run)
Status: behaviour model of planned operations on the HOUREAL real-Houston layout. Not a safety assessment.

## Why
A source search (AMZHEIGHTS_SOURCES_2026-10-24.md, checked against the Florida final EA directly) found that the "reported" Amazon case used on the page (69 m out, **122 m back**) has no traceable source for its return height: 122 m (400 ft) is the regulatory ceiling, above every filed return band, and no measured or company figure for Amazon's return leg is public. The best-sourced heights are: outbound about 69 m (Amazon to Richardson council, Mar 2026: average 225 ft); return in the filed inbound band, 279–377 ft (85–115 m) in the final Florida, Detroit and Kansas City EAs, and 325–370 ft (99–113 m) in the Omaha final EA (via DroneXL, PDF not opened). Both return bands contain Zipline's 101 m.

## Design (planned/amzsrc_run.js)
HOUREAL exactly (5 geocoded Amazon sites, 75 Wing and 65 Zipline random, 68 × 68 km, filed caps, seeds 1–3, same counting as HOUREAL), two new Amazon height arms:
- **S1:** out 69 m; back uniform 85–115 m per flight (FL / DET / KC inbound band).
- **S2:** out 69 m; back uniform 99–113 m per flight (Omaha final inbound band).
Wing 46–91 m and Zipline 101 m. Sharing-out reference = HOUREAL's A2 runs (Wing 46–71, Amazon 81 / 115), the same layouts and seeds. 6 runs.

## Predictions
- **Q1:** sharing out cuts S1's wide meetings by >= 55 %. PREDICTION: holds.
- **Q2:** sharing out cuts S2's wide meetings by >= 65 %. PREDICTION: holds (S2's return band sits on Zipline).
- **Q3:** Amazon–Zipline is >= 50 % of S2's wide meetings. PREDICTION: holds.

## Rules
No changes after the data is in; code committed before runs; deviations logged below. If the predictions hold, the page's "Amazon as reported (69 / 122 m)" case is relabelled as an unsourced upper case and the best-sourced case becomes the lead.

## Deviation log
(none yet)
- (Appended after fingerprint 10f3febb….) K1 PASS (5 Amazon sites in zone, 75 Wing, 65 Zipline, all 911 Amazon flights start at sites).
