# Fleet size vs profile: who waits under a shared plan check? (study, written 2026-10-22 before any code or run)
Status: behaviour model of filed operations (planned tracks only), on PROC's plan check (first filed goes first) with VALLOC A2 heights and filed profiles. Not a forecast or safety assessment.

## Background
- VRATE's exploratory diagnosis: inside each operator pair, first-filed splits the waiting about evenly (Amazon–Wing 76/87, Amazon–Zipline 50/47).
- Amazon's high per-flight delay may therefore be fleet-size arithmetic: the smallest fleet meets the two big ones.
- Two earlier theories (ramps, vertical speed) failed.

## Theory under test
Each cross-operator conflict delays one flight, split about evenly between the two operators. An operator's per-flight delay share is then set by how many other-operator flights it meets, so equalising fleet sizes should remove most of the asymmetry.

## Arms (filed profiles, A2 heights, P2 booking rule; NEW seeds 10–12; d = 4 and 3 km)
- **B0 — Filed mix.** Site ratios as HOUSTON2: Wing 1, Zipline 0.87, Amazon 0.08 per Wing nest.
- **B1 — Equal fleets.** Amazon sites × 5.4 (ratio 0.432) and Zipline sites × 0.32 (ratio 0.278). Wing unchanged. The factors come from VRATE V0's zone-touching flight counts at d = 3 (Wing 7,340; Amazon 1,350; Zipline 22,793), so each operator has about the same number of zone-touching flights. Per-site rates, radii and profiles are unchanged.
- Site positions use the same random stream as houston2.sites with the arm's ratios.

## Measures
- Per operator: zone-touching flights checked; delayed share; the asymmetry ratio (Amazon's delayed share / mean of Wing's and Zipline's).
- **Pair split:** with the diagnostic recorder (fair.intentCheck rec; first blocking operator of each delayed flight), the share of each pair's delays borne by each side.

## Predictions (pooled over seeds 10–12)
- **E1 (replication):** In B0, inside each cross-operator pair, each side bears 35–65 % of that pair's delays (d = 3 and 4). PREDICTION: holds.
- **E2 (main):** In B1, the asymmetry ratio is <= 2 at d = 3 and at d = 4. PREDICTION: holds.
- **E3:** B1's ratio is at most half of B0's at d = 3 and at d = 4. PREDICTION: holds.
- **E4 (reported only):** B1 pair splits; per-operator delayed shares; flights checked per operator (does equalisation work?).

No criterion or parameter changes after the data is in; at most two fix attempts on a failing feature check; deviations logged below.

## Feature checks (before the study)
- **K1:** B0's sites equal houston2.sites exactly (d = 4 and 3, seeds 10–12), and B0's delays equal vrate V0 on those sites.
- **K2:** In B1, zone-touching flights per operator are within ±35 % of each other at d = 3 (seed 10).
- **K3:** The recorder leaves delays unchanged (B1, d = 3, seed 10).

## Deviation log
(none yet)
- (Appended after fingerprint ac8e9d56…; pre-study checks only.) K1–K3 PASS on first run: B0 sites and delays identical to houston2/vrate; B1 zone flights 2,405 / 2,789 / 2,915 (max/min 1.21); recorder leaves delays unchanged.
- **Deviation:** fleet_analyze.py was written after the 12 runs, not before (all earlier studies committed it first). Scoring uses the registered criteria unchanged. Run logs are in the conversation; per-run JSON in out/fleet.
