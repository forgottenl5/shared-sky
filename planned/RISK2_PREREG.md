
# RISK2: collision risk with the plan-sharing check switched on (registration, 5 Nov 2026)

Status: registered before any run of the experimental arms. Pre-run checks K1-K2 passed first.

## Why
RISK1 and AVOID1 measured plans as filed, with no coordination, so their rates (about 1 modelled collision per 10,000 flight hours) describe a world nobody flies in. Operators share plans and deconflict them before take-off. This study applies the project's plan check (COORD1 volumes) and recomputes the collision risk of what is flown.

## Method
- RISK1 machinery and base sizes (lab/risk.js; Wing half-length 0.65 m, Zipline and Amazon half-span 1.5 m assumed), HEADLINE2 layouts, seeds 1-10, both metros, arms S1 (Amazon at best-sourced heights) and A2 (shared-out heights).
- Checks (planned/coord.js, as COORD1): V2 reserves blocks 30 m wide and +-5 m high around each plan (bands overlap when planned heights are within 10 m); V3 is 30 m wide and +-46 m high with a larger time margin. First filed keeps its plan; later flights are delayed in 30 s steps up to 20 min, else cancelled. Still air (COORD1 and ERRORS1 Study B used windy hours).
- The check sees the planned flights; errors (ERRORS1 levels; L2 also with 95 % shared, ERRORS2 model) act only on what is flown, through the collision formula. No-check rates are RISK1's (out/risk1); check K2 confirms the code path reproduces them.
- Removal = 1 - rate(check) / rate(no check), pooled over seeds.

## What I already knew when writing the predictions
RISK1's totals and the AVOID1 diagnosis: at L2 only 24-49 % of the no-check risk comes from encounters planned within 10 m vertically, which is roughly what V2's height band can see. Q2 is written from that.

## Predictions (each applies to both metros and both arms; it passes only if all hold)
- **Q1:** at L0, V2 removes at least 95 % of the collision risk (arms with no L0 risk without the check are skipped).
- **Q2:** at L2, V2 removes between 20 % and 60 % of the collision risk.
- **Q3:** at L2, V3 removes at least 90 %.
- **Q4:** at L2 with V2, shared-out heights have lower collision risk than best-sourced heights.
- **Q5:** V3 delays at least 1.5 times as many flights as V2.

## Checks (K)
- K1: collision-risk unit tests pass. K2: the no-check code path reproduces RISK1 exactly (DFW A2 seed 1, every encounter and CPA).

## Limits stated in advance
- Still air; no avoidance; block sizes are assumptions inspired by ASTM F3548 (not read; paywalled). Sizes and error levels as RISK1. Model quantity, not a safety assessment. L4 is a lower bound (30 m encounter search).

## Deviation log
(none yet)
- 5 Nov 2026, before any experimental run: the Method misstates V2. In planned/coord.js, V2 is { w: 30, v: 10, h0: 10, g: 0.05 }: blocks of 30 m half-width (paths within 60 m conflict) and +-10 m height (bands overlap when planned heights are within 20 m), not +-5 m / within 10 m. V3 is { w: 30, v: 46, h0: 30, g: 0.10 } as stated. The code is unchanged and runs as COORD1. Q2 was reasoned from the wrong band (that V2 sees roughly the encounters planned within 10 m vertically); the predictions stand as registered and are scored as written.
