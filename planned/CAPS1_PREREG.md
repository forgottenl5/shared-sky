# CAPS1: the headline with the filed caps on overlapping service areas applied (registration, 28 Oct 2026)

Status: behaviour model of planned operations. Registered before the runner, analysis or any run.

## Why
Every delivery study so far lets overlapping service areas fly above the filed caps (HOUSTON2 onward: "upper bound"). The filings cap them: Wing "overlapping service areas still capped at 400 per day" (DFW draft EA 2023 §2.2); Zipline "overlap areas capped at 1,000 deliveries/day (max 2,000 transits over any ground point)" (Texas draft, §2.2.1) (planned/PLANNED_OPS_INPUTS_2026-10-22.md). So the absolute counts are too high where sites overlap. This study applies the caps and asks whether the headline cut survives.

## Rule
- A company's delivery to a customer location is kept with probability 1 / n, where n is the number of that company's sites whose service radius (Wing 9.66 km, Zipline 16.1 km, as the engine) covers the location (n >= 1 always, since the delivering site covers it). This keeps the delivery density at any location at about one site's worth, which is what the cap says; how the companies would actually choose which deliveries to drop is not public. Amazon is not thinned (no overlap rule found in its filings; 5-6 sites).
- Engine: lab/lab_engine.js opt.keep (added 28 Oct 2026; absent = unchanged, flights byte-identical). Dropped deliveries leave the arrival clock running, so each site's rate is unchanged but fewer flights are generated.
- Everything else HEADLINE2 exactly (real layouts at filed site counts, seeds 1-10, bounded 2 h window, 30 m / 10 m), arms S1 and A2; straight routes. Reference: HEADLINE2 runs.

## Predictions (arithmetic: average coverage in the real layouts about 4.8 Wing and 11 Zipline sites in Houston, 3.4 and 9.5 in DFW, less near edges)
- **Q1:** with caps, Wing flights are 15-40 % and Zipline flights 6-25 % of the uncapped counts in both metros (S1, seed mean).
- **Q2:** S1 planned conflicts an hour fall by 60-95 % in both metros.
- **Q3:** sharing out still cuts planned conflicts against best-sourced Amazon by 50-90 % in both metros.
- **Q4:** pairs involving Amazon are at least 60 % of S1 planned conflicts with caps in both metros.

## Checks before the study runs (K)
- K1: with caps off the runner reproduces HEADLINE2 Houston S1 seed 1 exactly (v10 and flight count).
- K2: with caps on, Amazon's flight count is unchanged and every Wing and Zipline site keeps at least one flight in Houston S1 seed 1.

## Deviation log
(none yet)

- **Deviation 1 (appended after fingerprint, 28 Oct 2026, before any study run; fix attempt 1 of 2).** The runner failed to load: a `//` comment on the last code line swallowed the rest of that line (SyntaxError). Changed it to a `/* */` comment. No change to the rule, checks, arms or measures.
