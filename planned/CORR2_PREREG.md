# CORR2: does the headline survive when every company flies departure corridors? (registration, 28 Oct 2026)

Status: behaviour model of planned operations. Registered before the runner, analysis or any run.

## Why
Straight routes are the model's biggest known weakness: they fail the one real-world check (Richardson overflights), which about two shared departure corridors reproduce (CORRIDOR, a fit). CORRIDOR Part B routed only Amazon on corridors, in Houston, with 3 seeds, and found the cut unchanged (80 % vs 79 %, Omaha profile). This study routes **all three companies** on corridors, in both metros, with the headline's 10 seeds.

## Settings
- HEADLINE2 exactly (planned/headline2_run.js: real Houston and DFW layouts at the filed site counts, Wing and Zipline sites random per seed, seeds 1-10, 1 h warm-up, 2 h measured, counting bounded to the window, 4 checks a second, 30 m / 10 m), arms **S1** (best-sourced Amazon) and **A2** (shared out).
- Corridors (engine opt.viaAll, added 28 Oct 2026; default unchanged, test_lab_engine 9/9 and flights byte-identical with the option off): every site of every company has K = 4 corridors at bearings th0 + 90° k, th0 drawn per site and seed from its own random stream (seed + 4,242, as CORRIDOR). A flight uses the corridor nearest the bearing of its destination and goes site -> via point 2 km along it -> destination, and the same way back. Amazon keeps its existing via rule (straight if either leg is too short for its ramps); Wing and Zipline go straight if either leg would be under 300 m. Zipline's corridor applies to dock -> drop box and customer -> dock legs.
- Reference: the HEADLINE2 straight-route runs (out/headline2), unchanged.

## Predictions (corridors move traffic onto shared paths near sites but do not change heights)
- **C1:** with corridors, sharing out heights cuts planned conflicts against best-sourced Amazon by 55-85 % in Houston and in DFW (10 m, bounded window, seed mean).
- **C2:** the cut with corridors is within 10 percentage points of the straight-route cut (72 % Houston, 73 % DFW) in both metros.
- **C3:** S1 planned conflicts an hour with corridors are 0.8-1.5 times the straight-route value in both metros.

## Checks before the study runs (K)
- K1: the runner with corridors off reproduces HEADLINE2 Houston S1 seed 1 and DFW A2 seed 1 exactly (v10 count and flight count).
- K2: with corridors on, at least 50 % of Wing and of Zipline flights in Houston seed 1 use a via point (their path has more cruise segments than the straight version).

## Deviation log
(none yet)
