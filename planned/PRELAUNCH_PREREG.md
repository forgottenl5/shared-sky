# Pre-launch robustness studies: Amazon's real heights, height-keeping error, layout spread (written 2026-10-23 before any study run)
Status: behaviour model of planned operations (planned tracks only, no plan check, no avoidance); counting at 4 checks per second (COUNTFIX); research configuration (44 km area, 12 km counted zone, 1 h warm-up, 2 h measured). Not a forecast or safety assessment.

## Why
The pre-launch review (2026-10-23) found that the published 81 % cut rests mostly on one feature of the filings: Amazon's inbound baseline (105 m) sits 4 m above Zipline (101 m). Three things could remove or shrink that: (1) Amazon flying different heights in practice (local reports in Richardson describe about 225 ft / 69 m outbound and returns near 400 ft / 122 m); (2) height-keeping error, which a 4 m vs 14 m gap is sensitive to; (3) the random site layout (per-seed cuts already range 71–88 %, and no allocation run exists at 6 km spacing). These studies test each. Results are reported whatever they show, and the city page is updated to match.

## Engine switches (lab/lab_engine.js; defaults reproduce every earlier result, test_lab_engine.js 9/9)
- `p.heights` object: any Amazon outbound/inbound pair.
- `p.zsig`: each flight gets a constant height-keeping bias drawn from N(0, zsig) (hash of seed and flight id), applied to airborne samples (z >= 1 m) in counting only. Flight plans are unchanged.
- `p.boxes = { n, r }`: Zipline drop boxes per dock and their radius (default 20 within 5 km, an assumption, not filed).

Arms: **A2** = allocation (Wing 46–71, Amazon out 81, Zipline 101, Amazon in 115). Baselines **B(o, i)** = Wing 46–91, Zipline 101, Amazon outbound o and inbound i. B(61, 105) is the filed baseline A0.

## S1 Amazon heights (d = 3 and 4 km, seeds 1–3, as COUNTFIX R-VALLOC)
Baselines B(o, i) for o ∈ {61, 69} m and i ∈ {105, 111, 115, 122} m (8 baselines), against A2.
Measures: cross-operator wide (30 / 10 m) and close (15 / 5 m) meetings per arm, pooled over the six runs; A2's cut against each baseline; meetings by operator pair.
- **P1:** B(61, 111) has <= 45 % of B(61, 105)'s wide meetings (a 10 m gap no longer counts as close for cruise). PREDICTION: holds.
- **P2:** B(69, 122), the reported practice, has <= 30 % of B(61, 105)'s wide meetings. PREDICTION: holds.
- **P3:** Against B(69, 122), A2's wide cut is < 50 %. PREDICTION: holds (most of the problem is already gone if Amazon flies as reported).
- **P4:** Moving Amazon's outbound from 61 to 69 m changes Wing–Amazon wide meetings by less than 25 % (both inside Wing's band), at i = 105. PREDICTION: holds.
- **Consequence rule (decided now):** if A2's wide cut against B(69, 122) is below 50 %, the city page's headline must say that under the heights Amazon is reported to fly, the gain is that smaller number, and lead with it alongside the filed-heights result.

## S2 Height-keeping error (d = 3 and 4, seeds 1–3)
A0 and A2 at zsig ∈ {3, 5} m (zsig = 0 is COUNTFIX).
- **E1:** A2's pooled wide cut is >= 65 % at zsig = 3 m. PREDICTION: holds.
- **E2:** A2's pooled wide cut is >= 50 % at zsig = 5 m. PREDICTION: holds.
- Reported: close cut; A0 and A2 counts at each zsig.

## S3 Layout spread
- **S3a:** A0 and A2 at d = 4 and d = 6, seeds 1–30; at d = 3, seeds 4–15 added to seeds 1–3 (15 seeds).
- **S3b:** A0 and A2 at d = 3, seeds 1–3, Zipline boxes { n, r } ∈ {5, 40} × {2 km, 5 km}.
Measures: per-seed wide cut (seeds with A0 >= 10 wide meetings; others reported but not used for percentiles), pooled cut, 10th and 50th percentile of per-seed cuts.
- **L1:** d = 4: pooled wide cut >= 70 % and 10th-percentile per-seed cut >= 50 %. PREDICTION: holds.
- **L2:** d = 3 (15 seeds): pooled wide cut >= 70 %. PREDICTION: holds.
- **L3:** d = 6: pooled wide cut < 60 % (weaker where Amazon sites are sparse; HOUSTON2 found Amazon in 40 % of meetings at 6 km). PREDICTION: holds.
- **L4:** each box layout's pooled wide cut is within ±10 percentage points of the default (20 within 5 km, same seeds). PREDICTION: holds.

## Statistics
Exact Poisson 95 % intervals on pooled counts; rate ratios by conditional binomial (scipy), as COUNTFIX. Per-seed spreads reported as ranges and percentiles.

## Rules
No criterion or parameter changes after the data is in; at most two fix attempts on a failing feature check; deviations logged below. The analysis script (planned/prelaunch_analyze.py) and runner (planned/prelaunch_run.js) are committed before any study run.

## Feature checks (before the study)
- **K1:** B(61, 105) and A2 at d = 4, seed 1 reproduce COUNTFIX exactly (85 / 39 and 17 / 4).
- **K2:** zsig = 0 reproduces K1 exactly; with zsig = 3, the drawn biases over all flights of d = 4 seed 1 have mean within ±0.1 m of 0 and standard deviation within 5 % of 3 m.
- **K3:** boxes { 20, 5000 } reproduces K1 exactly; with { 5, 2000 } every Zipline box lies within 2 km of its dock and each dock has 5 boxes.

## Deviation log
(none yet)
- (Appended after fingerprint 4add6a00…; pre-study checks only.) K1 PASS (85/39 and 17/4); K2 PASS (zsig 0 identical; bias mean −0.000 m, sd 3.004 m); K3 PASS (default boxes identical; {5, 2 km}: no box beyond 2 km, at most 5 per dock).
