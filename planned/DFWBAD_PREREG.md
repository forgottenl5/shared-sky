# Bad days in DFW: hover, area hold and return-home tests with the DFW company mix (study, written 2026-10-25 before any code or run)
Status: behaviour model of filed operations (planned tracks only), plan check on (±5 s, 30 m cells, 10 m). Not a forecast or safety assessment.

## Why
The DFW page's Bad days tab shows Houston-only results (PRELAUNCH2, RTHREP, COUNTFIX R-RTH); an independent page audit (PAGEAUDIT_2026-10-25) flagged this. This study reruns the same tests with DFW's mix of companies.

## Setup (identical to the Houston tests except the mix)
Lab layout: cfg half 22 km, zone 6 km, warm-up 3,600 s, 7,200 s measured; sites every d km; plan check on; sub 4. DFW mix exactly as the DFW page (export_city.js): site ratio Wing 1 : Zipline 1 : Amazon 6/75, Zipline rate × 400/950 (DFW EA: 400 flights a day per site). Heights A0 (Omaha profile), R (high return, unsourced), A2 (shared out).
- **Hover (hold):** 1 in 5 drones in the zone hovers 2 minutes. A0, R, A2 × d 3 and 4 × seeds 19–21 (18 runs).
- **Area hold (outage):** six 2 km-radius, 2-minute holds. A0, R, A2 × d 3 × seeds 22–24 (9 runs).
- **Return home:** common 120 m (rth-120) vs own height (rth-own), with A2 and with R, × d 3 and 4 × seeds 19–21 (24 runs).
Measure: cross-company close calls (wide) per 100 events; rate ratios with the exact conditional binomial 95 % interval (as PRELAUNCH2).

## Predictions (Houston value in brackets)
Fewer events and fewer close calls than Houston are expected (Zipline flies under half as much), so thresholds sit below the Houston values.
- **B1:** hover, A0 vs A2 per event >= 4× [9.4×].
- **B2:** hover, A0 vs R per event >= 3× [6.8×].
- **B3:** return home with A2, rth-120 vs rth-own >= 5× [10.7×].
- **B4:** return home with R, rth-120 vs rth-own >= 4× [8.6×].
- **B5:** area hold, A0 vs A2 per held drone >= 3× [7.0×].
- **B6:** hover, A0 close calls per 100 hovers below Houston's 3.93.

No criterion or parameter changes after the data is in; at most two fix attempts on a failing feature check; deviations logged below.

## Feature checks (before the study)
- **K1:** with the DFW mix, a hold run (A0, d 3, seed 19) measures Wing and Zipline flight counts within 20 % of each other (equal sites; Zipline at 400/950 of its Houston rate per site but the lab's Zipline per-site rate is 950/15 an hour vs Wing 400/15, so expected about equal).
- **K2:** without the mix arguments the runner reproduces a Houston PRELAUNCH2 run exactly (hold, A0, d 4, seed 19: 20 wide, 845 events).

## Deviation log
(none yet)
- (Appended after fingerprint 5d7b9a6d…; pre-study checks only, no study run yet.) **K1 specification error.** The check compared zone-touching flight counts, but Zipline's delivery radius (16.1 km) is larger than Wing's (9.7 km), so with equal sites and equal per-site rates more Zipline flights reach the zone (measured 1,764 Wing vs 2,302 Zipline, 23 %). I had seen these counts in a timing run before writing the check, and still specified it wrongly. Corrected check: the DFW mix gives equal Wing and Zipline site counts (215 / 215 at d 3, seed 19; Amazon 17) and equal per-site rates (26.67 an hour each). PASS. Code unchanged.
- **K2 specification error.** The check text copied PRELAUNCH2's original, uncorrected K1 values (845 holds); PRELAUNCH2's own deviation log records that the A0 run has 846 holds (845 is A2's), and its recorded run (out/prelaunch2) shows 20 wide / 846. Without the mix the runner gives 20 wide / 846: identical to the recorded Houston run. PASS. Every engine version since 22 Oct gives the same (checked).
