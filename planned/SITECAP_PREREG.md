# Site capacity: how busy can one site get before its own drones meet? (written 2026-10-24 before any study run)
Status: behaviour model of planned operations at one isolated site; same-company meetings only. Not a safety assessment: companies space their own drones in ways not public.

## Why
The direction note (DIRECTION_2026-10-22.md) makes sites the flagship question: every flight starts and ends in one small volume, so a site is a bottleneck. Which layout and procedure gives the most movements an hour while leaving almost no encounters? This first study uses a paper capacity model and checks it in the planned-ops engine.

## Paper model (written before any run)
- Near-site encounters are pairs of the same site's drones in its column at once. With departures at rate λ, the number of pairs present at once grows as λ², so meetings per hour grow with the **square** of the site's rate.
- Spreading pads over a larger area lowers the chance two drones share a 30 m cell in the column, so meetings fall as pad area grows until pads are farther apart than the 30 m meeting distance.
- A single departure slot with spacing Δ seconds caps departures at **3,600 / Δ per hour**. Demand above that cap makes the queue grow without limit; below it, waits stay short.
- Spacing departures does not control arrivals, which come back at times set by each delivery, so departure spacing alone cannot remove encounters between arrivals and departures.

## Model
One site at the origin, alone; filed profiles and A0 heights (same-company meetings do not depend on other companies). Rates: each operator's filed cap (Amazon 1,000 / 16.5 h, Wing 400 / 15 h, Zipline 950 / 15 h) × 1, 2, 4. Pads: uniform in a 30 m square (engine default) or 120 m square (engine opt.padSpread, default unchanged, test_lab_engine 9/9). Departure spacing Δ = 0 (none), 10, 20, 40 s: departures leave in order of request, no closer than Δ apart; waits recorded for flights requested in the measured window. Meetings: same-company pairs within 30 m / 10 m (close: 15 m / 5 m), both within 300 m of the site, 4 checks per second, 1 h warm-up, 2 h measured. Seeds 1–3. 3 operators × 3 rates × 2 pad spreads × 4 spacings × 3 seeds = 216 runs.

## Predictions (pooled over seeds)
- **S1:** with Δ = 0 and 30 m pads, near-site meetings grow with rate with a log–log slope of 1.5–2.5, for each operator. PREDICTION: holds.
- **S2:** at 4× and Δ = 0, 120 m pads cut near-site meetings by >= 50 % against 30 m pads, for each operator. PREDICTION: holds.
- **S3:** Amazon at 4× (about 242 departures an hour): Δ = 20 s (cap 180 an hour) gives a mean wait above 600 s; Δ = 10 s (cap 360) gives a mean wait of 60 s or less. PREDICTION: holds.
- **S4:** at 2× with 30 m pads, no operator reaches an 80 % cut in near-site meetings by departure spacing alone (best of Δ = 10, 20, 40 s). PREDICTION: holds (arrivals are not spaced).

## Rules
No changes after the data is in; code committed before runs; deviations logged below.
- **K1:** default pad spread reproduces the engine's flights exactly; 120 m spread keeps pads within 60 m of the centre; sequenced departures are at least Δ apart.

## Deviation log
(none yet)
- (Appended after fingerprint.) K1 PASS (default spread identical; 120 m spread max offset 59.9 m; departures >= 20 s apart). This code check was run once while writing the runner, before the pre-registration text; it touches no study outcome.
- **Deviation (24 Oct 2026, from the independent review, planned/REVIEW_2026-10-24.md):** `count` had no upper time bound, so queued (spaced) arms were counted over longer windows (Amazon 4×, 40 s spacing, seed 1: 517 of 753 meetings after the 3 h mark; last landing at 7.9 h). The registration says "2 h measured", so all 216 runs are repeated with `tEnd = warm + meas` (engine opt, default unchanged, 9/9); the original runs are kept as out/sitecap_v1; both reported, criteria unchanged. Also noted: pads are re-drawn per flight inside the meeting radius, so pad operations count as meetings; "4× wider" pad spread is 16× the pad area; "arrivals are not spaced" was a hypothesis, tested in ARRIVE.
