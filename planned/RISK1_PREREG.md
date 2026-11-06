
# RISK1: collision risk per flight hour, not just plan overlaps (registration, 4 Nov 2026)

Status: registered before any run of the experimental arms. The pre-run checks K1-K3 (below) passed first.

## Why
Every Sky-Grid result so far counts planned conflicts: two aircraft of different companies planned to come within 30 m sideways and 10 m vertically. Aviation safety is judged by collision risk per flight hour instead. A planned conflict at 25 m is very different from one at 1 m, and errors decide which near misses become collisions. This study converts the planned encounters of the headline case into expected collisions per 100,000 flight hours.

## Method
- **Collision model:** Reich-type, as adopted by ICAO and described in Blom & Bakker, "Conflict probability and incrossing probability in Air Traffic Management", NLR-TP-2002-444 (2002). Two aircraft collide if their relative position falls in a box whose size is the sum of their sizes; position errors are Gaussian. Here, for each planned cross-company encounter, the closest point of approach (CPA) of the two planned paths gives a signed horizontal miss across the relative track (d_perp) and a vertical gap (d_z). P(collision) = P(|d_perp + e_perp| < r_i + r_j) x P(|d_z + e_z| < h_i + h_j), with e the relative error of the two aircraft (per axis, sigma x sqrt 2 for independent equal errors). Expected collisions = sum over encounters. Code: lab/risk.js (unit tests, including one crossing worked by hand), planned/risk1_analyze.py.
- **Approximations:** straight relative motion near the CPA; along-track error only moves the meeting time; take-off timing error is not included (ERRORS1: late starts alone change the conflict cut by 3 points or less); errors constant within a flight; no avoidance. The model gives an upper bound in the sense that the incrossing probability bounds the collision probability (Blom & Bakker, Remark 3).
- **Encounters:** HEADLINE2 layouts, seeds 1-10, both metros, arms S1 (Amazon at best-sourced heights) and A2 (shared-out heights), planned flights without errors. An encounter is the first moment a cross-company pair comes within 30 m sideways and 170 m vertically, in the measured window and counted zone. 30 m sideways is the engine's neighbour search, so pairs planned to pass more than 30 m apart are not counted; at L4 (relative sideways sigma 17.6 m) this misses part of the risk and L4 is reported as a lower bound. At L0-L2 the missed part is negligible (L2 relative sigma 4.6 m: 30 m is over 6 sigma).
- **Aircraft sizes:** Wing half-length 0.65 m (Smithsonian National Air and Space Museum: length about 1.3 m, span about 1.0 m; the larger dimension is used). Zipline P2 and Amazon MK30: dimensions not published (FAA weights 63 lb and 83 lb); half-span assumed 1.0, 1.5 (base) and 2.0 m. Half-heights assumed: Wing 0.25 m, the others 0.3 m.
- **Error cases:** ERRORS1 levels L0, L1, L2, L4, independent between flights; L2 with 80 % and 95 % of the error variance shared by nearby aircraft (ERRORS2 model: only the personal part, variance 1 - rho, enters the relative error).
- **Rate:** expected collisions per 100,000 airborne flight hours in the measured window (all flights, whole metro), pooled over seeds. Collision-risk cut = 1 - rate(A2) / rate(S1); 95 % bootstrap over seeds.

## Predictions (each applies to both metros; it passes only if it holds in all the cases named)
- **R1:** at L1 with base sizes, height sharing cuts collision risk by between 40 % and 90 %.
- **R2:** for each arm, risk at L2 is at least the risk at L0.
- **R3:** for each arm, risk at L2 with 95 % shared error is lower than with independent errors.
- **R4:** raising the Zipline/Amazon half-span from 1.0 m to 2.0 m raises the L2 risk by a factor between 1.4 and 2.5, for each arm.
- **R5:** at L2 (independent), the shared-out heights have lower collision risk than the best-sourced heights.

(My predictions held 77 % of the time over the scorecard; I expect to miss some.)

## Checks (K), run before the experimental arms
- K1: the collision-risk unit tests pass (node lab/risk.js test).
- K2: the current, faster engine reproduces HEADLINE2 Houston S1 seed 1 exactly (v10).
- K3: a CPA is found for at least 99 % of encounters (Houston S1 seed 1).

## Limits stated in advance
- Collision risk here is a model quantity. Aircraft sizes for Zipline and Amazon are assumed; the error levels are those of ERRORS1, not measurements of any company's aircraft.
- No avoidance, no timing error, constant errors; same-company encounters are excluded (each company separates its own fleet).
- The numbers are not comparable to a certified target level of safety without a full safety case; no such comparison is made.

## Deviation log
(none yet)
