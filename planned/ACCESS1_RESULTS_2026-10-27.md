# ACCESS1 results (27 Oct 2026): who could save time flying between Archer's announced Texas sites
Registration: planned/ACCESS1_PREREG.md (fingerprint verified; one clarification and one runner fix logged, no method change). Runner and analysis were committed before the run (commit 88e6c1b). Data: Census 2020 blocks (668,757; population total matches the official 29,145,505), LODES8 Texas 2022 OD and WAC, ten of Archer's twelve sites (Frisco Station and the Thompson Hotel helipad have no verified coordinates yet).

**Headline: under the registered assumptions, 2.6 % of DFW jobs and 1.2 % of Houston jobs have a commute that flying between two sites would shorten by 10 minutes or more at peak (87,263 and 34,062 jobs). Those people commute about 67 km (DFW) and 77 km (Houston) in a straight line, three to four times the typical 20 km. Off peak the shares fall to 0.30 % and 0.40 %. 5 of 8 predictions passed; three failed.**

## Predictions (primary: peak, 20 min processing, 10 min saving)
| Prediction | Result | Verdict |
|---|---|---|
| P1 share between 0.1 % and 3 % | DFW 2.57 %, Houston 1.25 % | PASS (DFW close to the upper edge) |
| P2 off-peak less than half of peak | 0.30 vs 2.57 %; 0.40 vs 1.25 % | PASS |
| P3 processing 10 min more than doubles the share | 5.52 vs 2.57 %; 3.24 vs 1.25 % | PASS |
| P4 DFW larger than Houston | 2.57 vs 1.25 % | PASS |
| P5 beneficiaries' median commute >= 2x all | 66.9 vs 20.3 km; 76.5 vs 20.1 km | PASS |
| P6 beneficiaries earn more (SE03 share >= +10 points) | 58.9 vs 59.9 %; 52.1 vs 57.2 % | **FAIL**: no income skew, Houston slightly lower |
| P7 residents within 30 min of a site: DFW 35-75 %, Houston 25-65 % | 74.4 %; 73.1 % | **FAIL** (Houston above range) |
| P8 top three pairs hold >= half of beneficiaries | DFW 56 %, Houston 37 % | **FAIL** (Houston spread over many pairs) |

Checks K1-K4 passed (population total, 100 % of OD jobs matched, hand-computed pair, calibration c = 1.27, v_peak 61 km/h, v_off 79 km/h).

## What this says, and does not say
- It counts **existing commuters whose door-to-door time falls**, at zero fare, with no queues, weather or aircraft limits. It is an upper bound on people with a time saving, not riders. Nobody has been asked whether they would pay.
- Most of the gain is long cross-metro commutes. DFW: Fort Worth Meacham to Addison and back is the largest pair (35,300 jobs), then Meacham-Love Field and Arlington-Addison. Houston: Intercontinental to Sugar Land is largest but only 9,000 jobs; Galveston pairs matter because the drive is long.
- The pool is large compared with what the network studies carried (at most about 1,150 trips a day at r = 12), so if this holds, price and capacity limit the use, not a shortage of people with a time saving. That inference needs the fare and capacity work (A13, A6) before anyone quotes it.
- Saving threshold and processing time are interchangeable in this model (processing +10 min = threshold +10 min; the table shows identical rows). The sweep therefore holds one real lever.

## Fragility: read before quoting (exploratory, not registered)
The headline depends strongly on how fast people reach the site. The registered road speed (61 km/h at peak) comes from the six long airport corridors in the hand-typed Google table, so it is a highway speed applied to the local access legs too. Rerunning with access legs only at a fraction of that speed (direct drive unchanged), peak, 20 min, 10 min:
| access speed | DFW | Houston |
|---|---|---|
| registered (61 km/h) | 2.57 % | 1.25 % |
| 80 % (49 km/h) | 0.93 % | 0.55 % |
| 60 % (37 km/h) | 0.18 % | 0.29 % |
At 60 % Houston overtakes DFW, so P4's ordering is not robust. The 30-minute catchment (P7) used the same speed and is likely too generous; treat the fractions within 15 minutes (DFW 37.6 % of residents, Houston 23.8 %) as less stretched. A fair range for "share of commuters with a 10-minute saving" is roughly 0.2 % to 2.6 % (DFW) and 0.3 % to 1.2 % (Houston).

## Other limits
- Ten of twelve sites; Galveston uses Scholes airport as an assumption; coordinates are OurAirports copies of FAA points, not checked against FAA NASR. Adding Frisco Station would likely raise DFW (north Dallas suburbs); the Thompson helipad (downtown) would likely raise Houston. Both go in as ACCESS1b once coordinates are hand-typed.
- Constant-speed, straight-line road model, calibrated on six corridors; the direct drive and the access legs share one speed. No transit, no parking cost.
- LODES counts primary jobs by 2022 home and work block, not daily trips. The SE03 band ($3,333 a month and up) covers about 57-60 % of these jobs, so it separates income poorly; P6's failure says little about fares.
- Deviation log: one runner fix (a KeyError before any number existed) and one clarification; no method change. The exploratory access-speed runs were added after seeing the results and are labelled exploratory.

Files: planned/access1_flight.js, access1_run.py, access1_analyze.py, planned/access1_results_table.md, out/access1.json, out/access1_diag_access0.6.json and 0.8.json (exploratory).
