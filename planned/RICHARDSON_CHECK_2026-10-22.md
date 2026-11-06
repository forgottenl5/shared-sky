# Richardson overflight check (exploratory, NOT registered) — 22 Oct 2026

Status: exploratory plausibility check. It was run before a pre-registration was written, so it is not a test and has no pass or fail. Treat it as a lead.

## Question
Our model sends delivery flights in straight lines from the hub to customers spread evenly over a disc. Can that model produce the overflight counts Richardson residents report near Amazon's STX8 hub?

## Inputs (sources: DroneXL Richardson tracker and NYT summary, Sept 2026; secondary press)
- Amazon told the city council it flies about 150–250 flights a day. The FAA cap is 1,000 a day.
- Resident counts: 122 drones over one home in a 10-hour day (early 2026); 52 on a "slow day" (18 Sep 2026). The home is under the departure corridor, roughly 1–1.6 km from the hub. The exact address is unknown.
- Amazon rerouted some departures over commercial land, so departures are funnelled, not spread evenly.

## Method
- 400,000 customers spread evenly over a 12 km disc (minimum 300 m).
- One straight line per flight, flown out and back (2 passes).
- Count the expected passes per day within a lateral distance w of a home at distance r, averaged over 16 directions.
- Code: planned/richardson_check.js.

## Result: expected passes per day, at 150 / 250 flights a day

| Home distance from hub | within 50 m | within 150 m | within 300 m | within 500 m |
|---|---|---|---|---|
| 0.5 km | 10 / 16 | 29 / 48 | 61 / 102 | 169 / 281 |
| 1 km | 5 / 8 | 14 / 24 | 29 / 48 | 50 / 83 |
| 1.5 km | 3 / 5 | 9 / 16 | 19 / 32 | 32 / 54 |
| 2 km | 2 / 4 | 7 / 12 | 14 / 23 | 24 / 39 |

## Reading
- At 1–1.5 km, a home sees 3–24 passes a day within 150 m.
- Reaching 52–122 a day needs one of two things:
  - The resident counts everything within about 500 m.
  - Departures are concentrated about 3–5× into a corridor.
- Residents describe a "drone highway", and Amazon's rerouting confirms that corridors exist. So the gap most likely comes from our even-spread assumption, not from the volume figure.
- **Conclusion:** our model gives realistic network-wide totals but underestimates exposure for homes under a corridor. Exposure near a hub depends on how departures are routed, not just on volume.

## Consequences for the work
1. Any noise or exposure claim we publish must state that it assumes even spreading. Under a corridor, the real number is several times higher.
2. Departure and arrival corridors near sites belong in Phase 2b (climb and descent procedures). They reduce cross-operator meetings, but they concentrate noise on whoever lives under them. That is a real trade-off to show, not hide.

## Caveats
- The home location, the counting distance, and whether "flights" means round trips are all unknown.
- Resident logs are self-reported.
