# CUMNOISE1 results (2026-11-26)

Pre-registration: planned/CUMNOISE1_PREREG.md (fingerprinted; checks K1-K4 passed before the study runs). Runner planned/cumnoise1_run.js, analysis planned/cumnoise1_analyze.py, full table planned/cumnoise1_results_table.md, raw rows planned/raw/out_cumnoise1.tar.xz. 12 of 12 runs. No deviations. One post-hoc check, labelled below.

**4 of 6 predictions passed. N4 and N6 failed.**

## Plain summary
We added up the en route flights of Wing, Zipline and Amazon over Houston and DFW at full build-out on real store and Amazon sites. Two volumes: each company's filed volumes, and every hub at the national cap of 1,150 deliveries a day.

- **The FAA's statement holds under direct routing.** The national review says 2,300 overflights a day over one spot is "highly unlikely". No spot more than 200 m from a site got 2,300 in any run, and none got 1,150 at filed volumes. The busiest spots (about 650-1,000 passes a day) are all next to a single company's site, where airport avoidance funnels its flights through one gap.
- **Noise levels stay far below the FAA's line.** The loudest en route day-night level at any spot was about 51 dB (Houston) and 47 dB (DFW) with the filings' own noise figures, and 59-60 dB if every drone were as loud as the loudest the FAA assessed (78.4 dB). The significance line is 65 dB.
- **But the FAA's combined-operations trigger has two readings, and they give opposite answers.** If it means overflights over one spot, nowhere is above it. If it means the deliveries of all hubs whose ranges cover a place, then 99.6-100 % of the 6 million people in each zone live above it. The median square kilometre is covered by hubs that together file 7,600 deliveries a day (Houston) and 4,500 (DFW), against the cap of 1,150.
- **Several companies over the same street is the normal case, not the exception.** About half of all overflown spots (54 % in Houston, 44 % in DFW) are overflown by two or more companies every day. Those spots hold about 4.9 million people in Houston and 3.2 million in DFW (coarse block-group count). Adding the companies together is what lifts about a fifth of Houston's spots above 100 passes a day.

## Predictions

| | Houston | DFW |
|---|---|---|
| N1 no spot >= 2,300 a day, filed volumes | PASS (max 650-1,016) | PASS (max 897-1,012) |
| N2 no spot >= 1,150 a day, filed volumes | PASS | PASS |
| N3 no spot >= 2,300 a day, at the cap | PASS (max 858-1,177) | PASS (max 1,132-2,152) |
| N4 max en route DNL < 50 dB (filed noise) and < 65 dB (all at 78.4 dB), median of seeds | **FAIL** 51.0 dB / 60.4 dB | PASS 47.5 dB / 58.7 dB |
| N5 >= 90 % of people where covering hubs file > 1,150 a day | PASS 99.8-100 % | PASS 99.6-100 % |
| N6 spots overflown by 2+ companies >= half of overflown spots | PASS 52-55 % | **FAIL** 42-46 % |

- **N4** failed in Houston only, by 1 dB, at the airport funnel next to a random Zipline site (below).
- **N6** failed in DFW: two or more companies overfly 42-46 % of overflown spots, not half.

## Key numbers (filed volumes, mean over 3 seeds)

| | Houston | DFW |
|---|---|---|
| Flights a day (Wing / Zipline / Amazon) | 30,083 / 61,651 / 5,015 | 29,949 / 28,738 / 6,061 |
| Overflights a day at the busiest spot | 856 | 948 |
| 99th percentile / median overflown spot | 95 / 15 | 52 / 10 |
| Spots >= 100 a day (sum of seeds); of which only because companies are added | 63,633; 12,610 | 6,401; 1,261 |
| Loudest en route DNL (filed noise / all at 78.4 dB) | 50.7 / 60.1 dB | 47.4 / 58.8 dB |
| People at en route DNL >= 45 dB (coarse) | about 1,600 | 0 |
| Median deliveries a day filed by hubs covering a 1 km square | 7,600 | 4,500 |

At the cap (every hub at 1,150), DFW had 27 spots (sum of 3 seeds) at or above 1,150 overflights a day, all next to single Zipline sites. None reached 2,300.

## Why the busiest spots are where they are
Every busiest spot is 220-380 m from one company's site, and nearly all of its traffic is that one company's:
- **Houston:** about 1,000 Zipline passes a day, 330 m from a randomly placed Zipline site about 3 km from Ellington Field.
- **DFW:** about 1,000 Amazon passes a day, 250 m from DFW7 (Haslet), about 2.5 km from Alliance Airport.

The model treats an airport's zero-ceiling squares as no-fly and detours around them, so roughly half of these sites' flights leave through the same gap. Real operators can fly there with air-traffic authorisation, so these maxima depend on a routing assumption.

**Post-hoc check (26 Nov, after the results; not pre-registered; planned/cumnoise1_posthoc_noair.js):** the same 12 runs with airport detours off.

| | Houston filed | Houston cap | DFW filed | DFW cap |
|---|---|---|---|---|
| Busiest spot, overflights a day (3 seeds) | 395-519 | 676-847 | 327-334 | 511-899 |
| Loudest en route DNL, filed noise | 47.4-48.5 dB | 47.8-48.5 dB | 44.5-45.4 dB | 48.0-49.4 dB |
| Spots >= 1,150 | 0 | 0 | 0 | 0 |

Without detours, Houston's N4 would pass (below 50 dB). The pass/fail record above stands as registered.

## Richardson (context, not validation)
At Amazon's filed 1,000 flights a day from STX8, spots 1-3 km from the site get a median of 8 Amazon overflights a day, 18-20 at the 90th percentile and 70-76 at the busiest. The Richardson resident logged 52 in one day. Amazon's actual Richardson volume is not published and is below 1,000. If it is well below, 52 at one home points to routes more concentrated than direct flights to each customer, for example fixed lanes. Amazon's own Texas EA assumes up to half a site's deliveries could pass over one place (1,000 overflights). Direct routing gives at most 948 (the DFW7 funnel) and 263 at Houston's Amazon sites.

## What it means
- **Measured as the FAA measures it, combined en route noise is not near a significance line.** Day-night levels stay 14 dB or more below 65 dB even with all three companies at full build-out, and 4-6 dB below it if every drone were the loudest the FAA assessed. The residents' complaint, as reported, is about how often drones pass overhead, not the day-night average. The FAA's significance test does not measure frequency.
- **The open question is what the FAA's trigger means.** The national review asks that shared airspace above "1,150 AAD deliveries (2,300 overflights)" be identified. Read per spot, it is never reached under direct routing. Read per area of overlapping hubs, almost every resident of both metros is above it at the filed volumes. This study cannot say which reading the FAA intends; it shows the choice decides whether the condition ever applies.
- **Routing decides the peaks.** Direct routes spread flights out. Airport detours or fixed lanes concentrate them, and the busiest spot can double. No operator publishes its routes.

## Limits
- Direct routes to each customer (with airport detours); real routes are not public.
- Each company's single filed en route noise figure at its typical height; hubs and delivery points not included (the filings' own tables cover them).
- One 15-hour day at filed or cap volume, which is above today's volumes.
- Houston Zipline sites (except one) and Wing nests beyond the real stores are random, and one random Houston Zipline site set the Houston maximum.
- People counted at block-group centres (about 1,700 people each), so people counts are coarse.
- **Neutral reporting:** the FAA's national review is the subject of a pending petition for review in the US Court of Appeals for the Second Circuit, filed 28 Sep 2026 by 15 states and Harris County, Texas (no stay sought; no ruling as of 27 Nov 2026). These are numbers against the FAA's own thresholds, both metros, with no recommendation and no view on the case.
- The pre-registration's status line refers to two internal planning notes (a backlog and a landscape note) that are not published.
