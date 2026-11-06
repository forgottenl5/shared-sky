# Houston build-out, stage by stage: results (2026-10-24, corrected v2)

> **Note added 28 Oct 2026.** "Independent review" and reviewer roles in this file mean AI reviewers (fresh sessions of the AI assistant used to build the project), not people. See VERIFY.md.
Pre-registration: BUILDOUT_PREREG.md, sha256 5201f127…, committed with code before any run. K1/K2 passed. 108 runs (4 stages × 3 heights × 3 check variants × 3 seeds; 6 measured hours per cell).
**Corrected after an independent review (REVIEW_2026-10-24.md):** the first run (v1, kept in out/buildout_v1) had a plan-check bug beyond ±30 km (PCFIX) and counted past the 2 h window. Both are fixed and logged as deviations; all 108 runs were repeated unchanged (v2, below). Verdicts are the same in v1 and v2.

## Result in one line
**Close calls between companies are absent today and grow roughly with the square of traffic: 0 an hour today, 0.5 early, 6.3 mid, 36 at full build-out (Omaha-profile heights, no coordination).** 76–87 % involve Amazon and Zipline. Sharing out heights removes 83–87 % (29–44 % if Amazon already flies as reported). A plan check removes them all in calm air but only 16 % in a typical wind unless it books wider margins; heights shared out plus a ±30 s check leaves 15 of 216 close calls (93 % fewer) with 1.5 % of flights delayed.

## What happens, stage by stage (close calls per hour, no plan check, calm air)
| Stage | Sites Wing / Zipline / Amazon | Share of filed sites | Volume | Omaha profile | Amazon as reported | Heights shared out | Sharing-out cut vs Omaha / reported |
|---|---|---|---|---|---|---|---|
| Today | 13 / 1 / 1 | — (real sites) | 20 % | 0 | 0 | 0 | — |
| Early | 19 / 16 / 2 | 25 % | 50 % | 0.5 | 0 | 0.17 | (3 → 1, too few) |
| Mid | 38 / 33 / 3 | 50 % | 75 % | 6.3 | 1.5 | 0.8 | 87 / 44 % |
| Full | 75 / 65 / 5 | 100 % | 100 % | 36.0 | 8.7 | 6.2 | 83 / 29 % |
Seed spread is large (for example full, Omaha profile, per seed: 85 / 38 / 93 close calls), so treat the per-hour numbers as rough.

## Which fix, and what it costs (full build-out)
| Heights | Plan check ±5 s, calm air | ±5 s, typical wind | ±30 s, typical wind |
|---|---|---|---|
| Omaha profile | 0 of 216 left, 2.1 % delayed | 176 of 210 left, 2.1 % | 80 of 210 left, 6.7 % delayed, mean 85 s |
| Amazon as reported | 0 of 52, 0.6 % | 36 of 47, 0.6 % | 22 of 47, 2.1 %, 77 s |
| Heights shared out | 0 of 37, 0.4 % | 24 of 37, 0.4 % | 15 of 37, 1.5 %, 80 s |
Typical wind = Houston's median 2025 hour (5.5 m/s at 120 m), one hour only. The plan check has no wind term; real operators' checks do.

## Predictions (v2; v1 verdicts identical)
| Prediction | Result | Verdict |
|---|---|---|
| B1 < 1 an hour today and >= 10 an hour at mid | 0 today; 6.3 at mid | **FAIL** (mid lower than predicted) |
| B2 sharing out cuts >= 65 % at mid and full | 87 % / 83 % | **PASS** |
| B3 full, typical wind: ±30 s removes >= 80 %, ±5 s <= 30 % | ±30 s 62 %; ±5 s 16 % | **FAIL** (±30 s weaker than predicted) |
| B4 sharing out at most halves the delayed share (±30 s, wind) | 1.5 % vs 6.7 % (4.5×) | **PASS** |
| B5 Amazon–Zipline >= 50 % at mid and full | 76 % / 87 % | **PASS** |
v1 values for reference: mid 6.7, full 38.3 an hour; ±30 s removed 56 %; delayed 1.7 % vs 7.5 %.

## Reading
1. **No sharp tipping point.** Close calls rise smoothly with traffic (about traffic squared); they become noticeable between a quarter and half of the filed sites. Sites and volume rise together here, so the study cannot say which drives it.
2. **Who.** Amazon–Zipline throughout, from the 4 m gap in the Omaha profile. If Amazon flies as reported, every stage has about a quarter of the close calls.
3. **Fixes.** Height sharing is the cheapest single fix and is unaffected by wind. A time-based check without a wind term needs much wider margins: ±30 s recovers 62 % and triples the delayed share (2.1 → 6.7 %). Shared heights plus a ±30 s check: 93 % fewer close calls at 1.5 % delayed.
4. **Withdrawn:** v1's "Reading 4" (plan check leaves 4–9 % at metro scale, put down to sampling). It was the PCFIX bug; with the fix, a calm-air check leaves none.

## Limits
Stages are site and volume fractions, not dates; extra Wing and Zipline sites random; uniform customers; straight routes; one typical-wind hour; 3 seeds (counts 5–216 per cell; early and today too small to rank fixes).

## Sources
[CultureMap Houston, 8 Jul 2026](https://houston.culturemap.com/news/innovation/walmart-wing-drove-delivery-expansion/) (8 more Wing stores); [Wing, 15 Jan 2026](https://wing.com/news/greater-houston-kicks-off-walmart-wing-expansion-year); filings in TEXAS_FILINGS_2026-10-23.md.
