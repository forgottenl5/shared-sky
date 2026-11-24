# INTENT1: larger operational-intent volumes, flexible heights, each company's own fleet, and today's volume (written 2026-11-24 before any study run)
Status: follow-up to LAYOUT1 after a multi-perspective critique (24 Nov). Registered before any study run; the runner's pre-checks K1-K2 were run while writing it (they run no study job).

## Why
The critique raised three points that could change the conclusions:
1. **The check's volumes are my assumption** (V2: blocks +-30 m sideways, +-10 m in height). ASTM F3548 operational intents are 4D volumes sized by each operator and often much larger. If they are, holds rise and the ranking of height plans may change; LAYOUT1's M1 has gaps of 24-25 m, which a +-15 m or +-25 m block no longer clears.
2. **Flexible heights** (the coordination service moves a flight to another height inside its company's filed band before holding it) are the likely industry alternative to fixed company layers. Not tested so far.
3. **Within-company conflicts are never counted.** M1 puts all of Wing in a 6 m band and Amazon's two legs on one height, which could move the waiting from between companies to inside each company.
Plus a plausibility check against today's real operations (Flytrex and Wing report about 8,000 overlapping DFW flights in Jan-Feb 2026 with zero airspace conflicts; BUILDOUT found 0 conflicts at today's volume without any check).

## Design (COORD1 / SEEDS2 machinery; plans on the previous hour's wind, flown in the actual hour; windy hours of bandHours(0.85, 0.95, 10); seeds 1-5)
- **Check:** planned/coordx.js = planned/coord.js `check()` with two opt-in options (own-company checking; flexible heights). Without options it reproduces coord.check exactly (K1).
- **Volumes:** V2 (w 30 m, v 10 m, as before), VL1 (w 75 m, v 15 m), VL2 (w 150 m, v 25 m); time buffers as V2 (10 s + 5 %).
- **Height plans:** A0 (today, Omaha profile), A2 (shared out), M1 (LAYOUT1: Wing 46-52, Amazon 76 both ways, Zipline 101), FLEX (Amazon's best-sourced heights S1 as filed plans; the check may move a flight up or down in 5 m steps, smallest move first, keeping every point above 20 m inside the company's filed band: Wing 46-91, Amazon 55-115, Zipline 101 fixed).
- **Part P (volumes):** 4 height plans x 3 volumes, different companies checked only. 2 metros x 5 seeds = 120 runs.
- **Part O (own fleet):** A2, M1, FLEX with V2 and each company's flights also checked against each other. 30 runs. Compared with part P's V2 runs.
- **Part T (today):** A0 + V2 on REALSITES' smallest stage (Houston 'today': 13 Wing, 1 Zipline, 1 Amazon site, 20 % of filed volume; DFW has no 'today' stage, so 'early': 19 / 16 / 2 sites, 50 %). 10 runs.
- Measures: share of checked flights held (delayed or cancelled), by company; flights moved (FLEX); flown planned conflicts between companies and within each company (30 m / 10 m).

## Predictions (pooled over seeds 1-5)
- **I1:** for every height plan and metro, held share rises with volume size: V2 < VL1 < VL2.
- **I2:** at VL1, M1 holds fewer flights than A2 and A0, both metros.
- **I3:** M1's advantage shrinks with larger volumes: the A2 / M1 held-share ratio is lower at VL2 than at V2, both metros.
- **I4:** FLEX holds fewer flights than A0 at every volume, both metros.
- **I5:** at VL2, FLEX holds fewer flights than M1, both metros.
- **I6:** with own-fleet checking (part O), M1 holds at least as many flights as A2, both metros (M1's advantage disappears once each company's own conflicts count).
- **I7:** with own-fleet checking, Wing's held share under M1 is at least twice A2's, both metros.
- **I8:** part T: held share below 2 % and no flown planned conflicts between companies in every run, both metros.
- Reported, not predicted: all held shares by company; cancellations; flights moved by FLEX and mean move; flown within-company conflicts with and without own-fleet checking.

## Checks (K)
- **K1:** planned/test_coordx.js passes; coordx without options gives coord.check's delays exactly (Houston A2 V2 seed 1).
- **K2:** the runner's A2 V2 seed 1 Houston row reproduces COORD1's stored held count, checked count and flown conflicts.

## Rules
Runner and analysis committed before any study run; no changes after the data is in; deviations logged below.

## Deviation log
(none yet)
- (Appended after fingerprint 72ba8923….) K1 PASS (unit tests 5/5; 19,426 delays identical), K2 PASS (held 2,333 = 2,333; flown conflicts 0 = 0).
- **D1 (after the data; interpretation only, nothing changed):** part O (own fleets checked) is not informative: there is no exclusion around a company's own sites, so consecutive departures from one site always overlap and 99.7-100 % of flights are held under every plan. Real operators sequence their own departures at the pad. I6 and I7 are scored as failures but say nothing about M1's narrow Wing band; the question stays open. See planned/INTENT1_RESULTS_2026-11-24.md.
