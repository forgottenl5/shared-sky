# Richardson: can the hospital no-fly zone explain the overflight concentration? (study, written 2026-10-22 before any code or run)
Status: geometry check of one real hub with real positions; planned straight routes with a no-fly detour. Not a forecast, not a noise assessment. Inputs: RICHARDSON_INPUTS_2026-10-22.md.

## Positions (local metres, hub at origin; x east, y north; 1° lat = 111,000 m, 1° lon = 93,370 m at 33° N)
- **Hub:** 3051 Research Dr, OSM 32.9886042, -96.6617927 (from the founder, 22 Oct 2026).
- **[street withheld]:** OSM way [withheld], centre [withheld]; extent lon [withheld] (from the founder). Modelled as the segment y = 1,224 m, x = 285 to 659 m (centre 472, 1,224: 1.31 km at bearing 21°).
- **No-fly zone centre:** heliport XA40, 32°59'46"N 96°39'56"W = 32.99611, -96.66556 (iFlightPlanner): x = -352, y = 834 (0.905 km at bearing 337°). The zone's radius R is not published. The hub sits outside it, so R < 905 m.

## Model
- 100,000 customers uniform over a 12,070 m disc (7.5 mi), minimum 300 m from the hub; customers inside the zone removed.
- Each delivery: hub to customer and back on the same path (2 passes).
- Path is the straight line, unless it enters the zone (circle of radius R). Then it takes the shortest path around it: tangent, arc (10° steps), tangent.
- **Count:** the fraction of all passes that come within w of a point on [street withheld]. Points at x = 285, 378, 472, 565 and 659 m; w = 100 m main, 50 and 150 m reported.
- **Arms:** R = 0 (no zone, i.e. uniform), 300, 500, 700 and 850 m.

## Observed target (RICHARDSON_INPUTS)
- 122 passes over one [street withheld] home in 10 h (reported 2 Feb 2026). At roughly 110–150 deliveries in 10 h (220–300 passes), that is a fraction of **0.40–0.55** of all hub passes.
- 52 on 18 Sep 2026 (volume that day unknown; routes changed in Feb/Mar).

## Predictions (written before any calculation)
- **N1:** Uniform (R = 0) gives a fraction below 0.08 at every [street withheld] point (w = 100 m). PREDICTION: holds.
- **N2:** For at least one R in 500–850 m, some [street withheld] point's fraction is >= 3× its uniform value (w = 100 m). PREDICTION: holds.
- **N3:** No R in 300–850 m brings any [street withheld] point to the observed 0.40 (w = 100 m), i.e. the no-fly zone alone does not explain the count. PREDICTION: holds.
- **N4 (reported only):** fractions at w = 50 and 150 m; which bearings carry the most traffic per R; the share of flights that detour.

## Honest limits
- R is unknown, so N2 tests whether the mechanism can produce strong concentration at plausible sizes, not a measured size.
- The real customer distribution and service-area limits are unknown. Amazon's rule that paths cannot follow major highways is not modelled.
- The resident's counting distance and tracker are unknown.
- This is a geometry check, not validation by independent data.

No criterion or parameter changes after the data is in; at most two fix attempts on a failing feature check; deviations logged below.

## Feature checks (before the study)
- **K1:** R = 0 reproduces richardson_check.js's analytic shape: the fraction within 150 m at a point 1.5 km from the hub agrees with that table's value (9 passes at 150 flights = 0.03) within ±20 %.
- **K2:** For R > 0, no path sample lies inside the circle (tolerance 1 m), and every path starts at the hub and ends at its customer.
- **K3:** A path that does not enter the circle is unchanged (straight).

## Deviation log
(none yet)
- (Appended after fingerprint c1948fb5…; pre-study checks only.)
  - **K2 FAIL on first run** (samples up to a few metres inside the circle): arc end chords started exactly on the circle.
  - **Fix attempt 1:** tangents and arc on a circle 5 m outside the zone; plus a clamp for customers within 5 m of the zone edge (acos argument <= 1; about 0.005 % of customers).
  - K1–K3 then PASS: uniform fraction 0.0315 vs 0.03; 0 samples inside the circle at all four R; non-entering paths unchanged.
