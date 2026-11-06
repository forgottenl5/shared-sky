
# ERRORS1: does the height-sharing result survive published navigation errors? (registration, 3 Nov 2026)

Status: registered before any run of the experimental arms. The pre-run checks K1-K4 (below) passed first; two timing runs (Study A Houston A2 L3 seed 1, Study B Houston V3 L4 seed 1) were run to time the job, their outputs were not read, and the same jobs are recomputed in the full run.

## Why
The headline (height sharing cuts planned conflicts by about 72 % in Houston and 73 % in DFW) comes from runs where every drone flies its plan exactly. The only height-error test so far (PRELAUNCH S2) used a small test layout, 3 seeds and one metro, with height error of 3 and 5 m (typical size), where the cut fell from 81 % to 72 % and 63 %. There was no sideways error, no late-start error, and no test of the plan-sharing check under errors. This study adds all three on the real Houston and DFW layouts.

## Error levels and sources
Each flight gets one random sideways offset (2-D Gaussian), one random height offset (Gaussian) and one random late start (half-Gaussian, whole seconds), each fixed for the whole flight and independent between flights. A "95 %" value is the error size not exceeded 95 % of the time: radial 95 % = 2.4477 x sigma (sideways), vertical 95 % = 1.96 x sigma.

| Level | Sideways 95 % | Height 95 % | Late start sigma | Basis |
|---|---|---|---|---|
| L0 | 0 | 0 | 0 | no errors (the published headline) |
| L1 | 3 m | 4 m | 5 s | near the best monitored GPS sites (FAA SPS PAN report 125, Q1 2024: best sites 1.9 m sideways, 3.5 m height) |
| L2 | 8 m | 13 m | 15 s | GPS SPS Performance Standard (2020) committed global average, gps.gov/systems/gps/performance |
| L3 | 15 m | 33 m | 30 s | same standard, committed worst-site values |
| L4 | 30.48 m (100 ft) | 45.72 m (150 ft) | 60 s | FAA Remote ID rule, 14 CFR 89.320(h): accuracy within 100 ft (position) and 150 ft (geometric altitude), each 95 % |

The late-start sigmas are assumptions: I found no published figure. I also found no published figure for fused GPS-plus-barometer altitude on delivery drones, so none of these levels is a measurement of any company's aircraft. NASA's urban flight test (Logan et al., 2020) found autopilot GPS mostly within 5 m of a reference, which sits between L1 and L2 sideways; it reported no height error.

One-error-only arms at the L4 size: H4 (sideways only), Z4 (height only), T4 (late start only).

## Studies
- **Study A (no plan check, still air).** HEADLINE2 layouts and settings (planned/headline2_run.js), current heights A0 and shared-out heights A2, both metros. Levels L0-L4: seeds 1-6. Arms H4, Z4, T4: seeds 1-4. Count of planned conflicts within 30 m sideways and under 10 m vertically (v10), as the headline. The cut is 1 - (A2 conflicts / A0 conflicts), pooled over seeds.
- **Study B (plan check, windy hours).** COORD1 machinery (planned/coord1_run.js) on A2 heights, arms NONE (no check), V2 (reserved blocks 30 m wide, +-10 m height) and V3 (30 m wide, +-46 m height, larger time margin), levels L0, L2, L4, seeds 1-6 (the same windy hours as COORD1 and SEEDS2). The check sees the nominal plans; errors act only on what is flown. Removal = 1 - (flown conflicts with the check / flown conflicts with NONE at the same level), pooled over seeds.

## Predictions (each applies to both metros; it passes only if it holds in both)
- **E1:** at L1 the cut is at least 60 %.
- **E2:** at L2 the cut is between 30 % and 60 %.
- **E3:** at L3 the cut is below 25 %.
- **E4:** at L4 the cut is below 15 %.
- **E5:** the cut does not rise by more than 3 points at any step from L0 to L1 to L2 to L3 to L4.
- **E6a:** height error alone (Z4) lowers the cut by at least 40 points against L0 on the same seeds (1-4).
- **E6b:** sideways error alone (H4) changes the cut by at most 10 points against L0 on seeds 1-4.
- **E6c:** late start alone (T4) changes the cut by at most 10 points against L0 on seeds 1-4.
- **E7:** at L0 the V2 check removes at least 98 % of flown conflicts against NONE (replicating SEEDS2's 99-99.6 %).
- **E8:** at L2 the V2 check removes between 75 % and 97 % of flown conflicts.
- **E9:** at L4 the V2 check removes less than 90 %.
- **E10:** at L2 and at L4, V3 leaves fewer flown conflicts than V2 (pooled).
- **E11:** at L0, V3's delayed share is at least 1.5 times V2's.

(My earlier predictions held 78 % of the time; I expect to miss some of these.)

## Checks (K), run before the experimental arms
- K1: with no errors, Study A reproduces HEADLINE2 exactly (v10, v15, v20, close) for Houston A0 and DFW A2, seed 1.
- K2: with no errors, Study B reproduces COORD1 Houston A2 V2 seed 1 exactly (wide, close, delayed).
- K3: a zero sideways offset gives the same count as no offset (the engine change, `opts.herr` in lab/lab_engine.js, is inert by default).
- K4: the drawn errors at L4 have 95 % values within 4 % of 30.48 m (radial) and 45.72 m (height).

## Limits stated in advance
- Errors are independent between flights and constant within a flight. Real GPS and barometer errors wander over time and are partly shared by drones near each other (same satellites, same weather), which makes the error between two nearby drones smaller than independent errors imply. These runs therefore likely overstate the damage to separation at L2-L4; they are not a measurement of real flying.
- The check's own plan and the 10 m separation are unchanged from the headline; no avoidance manoeuvres are modelled.
- 6 seeds (4 for one-error-only arms): intervals are wide, and pooled counts share one model.

## Deviation log
(none yet)
