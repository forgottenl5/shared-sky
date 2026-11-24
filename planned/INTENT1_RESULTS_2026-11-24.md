# INTENT1 results (24 Nov 2026): larger operational-intent volumes, flexible heights, own fleets, today's volume
Registration planned/INTENT1_PREREG.md (fingerprint in planned/INTENT1_PREREG.md.sha256; runner and analysis committed before any study run). K1-K2 passed. 160 runs, all completed. Table: planned/intent1_results_table.md.

## Result in one line
**Which height plan is best depends on how big the shared flight plans (operational-intent volumes) are, which this project does not know.** With small volumes (+-30 m sideways, +-10 m in height) LAYOUT1's fixed layout M1 holds about 4 % of flights. With +-75 m / +-15 m its advantage is gone (21-22 %, the same as the shared-out heights A2). With +-150 m / +-25 m, flexible heights (the coordination service moves a flight inside its company's band before holding it) are best at 25-28 %, against 38-39 % for M1 and 64-73 % for A0 / A2. Flexible heights are the only plan that stays near 20-28 % at every size. 4 of 8 predictions passed; the own-fleet part did not measure what it was meant to (below).

## Predictions
- **I1 PASS** held share rises with volume size for every plan and metro (e.g. Houston A0 41 -> 54 -> 67 %, M1 4.5 -> 21 -> 38 %, FLEX 19 -> 24 -> 25 %).
- **I2 FAIL** at VL1 (+-75 m / +-15 m), M1 holds 21.2 % (Houston) and 22.3 % (DFW), slightly more than A2 (20.0 %, 20.7 %); still far below A0 (52-54 %). M1's 24-25 m gaps no longer clear two +-15 m blocks, and Amazon is held 91-97 % again.
- **I3 PASS** the A2 / M1 ratio falls from 4.2 / 4.6 at V2 to 0.9 at VL1 and 1.7-1.8 at VL2.
- **I4 PASS** FLEX holds fewer flights than A0 at every size (Houston 19 / 24 / 25 % vs 41 / 54 / 67 %; DFW 18 / 23 / 28 % vs 37 / 52 / 73 %).
- **I5 PASS** at VL2, FLEX 24.9 % / 27.5 % against M1 37.5 % / 38.8 %.
- **I6 FAIL, I7 FAIL - not informative (design error, see D1).** With each company's own flights also checked, 99.7-100 % of flights are held under every plan.
- **I8 FAIL (split).** Houston at today's stage (13 Wing, 1 Zipline, 1 Amazon site, 20 % volume): 1.0 % held and no flown conflicts between companies in any run, consistent with the real Flytrex / Wing record. DFW has no "today" stage; the "early" stage I used instead (19 / 16 / 2 sites at 50 % volume) holds 15.7 % (registered: below 2 %), with no flown conflicts. Early is far above today's DFW traffic, so this tests my stage choice more than reality.

## Deviation (after the data; interpretation only, nothing changed)
- **D1 (design error in part O).** The counter and the check have no exclusion around a company's own sites, so a company's consecutive departures from one nest or charger always overlap at the site (within-company "conflicts" of 1,000-5,000 an hour, mostly at sites). Real operators separate their own departures by pad sequencing, not by airspace plans. Checking each company's own flights with the same volumes therefore holds nearly every flight and says nothing about M1's narrow Wing band. The within-company question stays open; a fair test needs an exclusion zone around each company's own sites (as the cross-company counts effectively have, since companies do not share sites). Not re-run here.

## Reading
- **LAYOUT1's "about 4 %" holds only if real intent volumes are as thin as +-10 m.** At +-15 m it is no better than the shared-out heights. The public pages must say this.
- **Flexible heights are the robust option:** they never hold more than about 28 % across the sizes tested, and by moving 8-34 % of flights a few metres they avoid the collapse fixed layers suffer when blocks outgrow the gaps. With small volumes they are no better than the shared-out heights (17.5-19 %).
- **Fixed layers are brittle:** A0 and A2 rise to 64-73 % held at +-150 m / +-25 m, with 16-21 % of flights cancelled.
- Amazon remains the most held company in almost every case (81-97 %), except under M1 with small volumes (15-26 %).
- At today's Houston volume the model agrees with reality: about 1 % held and no conflicts.

## Limits
5 seeds (windy hours 1-5). Volume sizes are a sweep, not measured values (ASTM F3548 not read; operators size their own intents). FLEX moves whole flights in 5 m steps inside filed bands; Zipline fixed at 101 m. Same check, wind and layout model as SEEDS2.
