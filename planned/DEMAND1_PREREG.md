
# DEMAND1: deliveries bunched at lunch and dinner (registration, 5 Nov 2026)

Status: registered before any WX2 traffic result was read (WX2 runs were in progress; their output had not been opened) and before this analysis was run. Analysis-only: planned/demand1_analyze.py on WX2's traffic runs (out/wx2).

## Why
Every study flies a flat hourly rate at the filed caps. Real delivery demand bunches: food-delivery data show two daily peaks, and planned conflicts between companies grow faster than traffic, so peaks add conflicts even when the daily total is the same. Customers drawn in proportion to population were tested earlier (CENSUS, 23 Oct 2026: headline unchanged), so this study covers time of day only.

## Sources and assumptions
- Shape: a 2020 trajectory dataset of 267,529 instant-delivery orders in Beijing (arXiv 2507.11584) shows "pronounced peaks" at lunch (11:00-13:00) and dinner (17:00-19:00), with sharper peaks on weekdays. No hourly shares are published, and none exist for drone or grocery delivery that I found.
- Profile (assumed): 15 operating hours (07:00-21:59 local); multiplier = base + a x (Gaussian peaks at 12:30 and 18:30, sigma 1 h), mean 1 over the day, busiest hour P times the mean; P = 2 base, 1.5 and 2.5 sensitivity. Daily total unchanged.
- Conflicts per hour at multiplier f: c(1) x f^k, with c(1) and k fitted per metro and arm to WX2's M = 1, 1.5, 2 runs (planned cross-company conflicts, v10).

## Predictions (both metros, both arms)
- **Y1:** with P = 2, daily planned conflicts are 15-45 % above flat demand.
- **Y2:** the busiest hour has 3 to 5 times the planned conflicts of a flat-demand hour.
- **Y3:** the height-sharing cut over a two-peak day (P = 2) is within 3 points of the flat-demand cut.

## Limits stated in advance
- The shape comes from food delivery in Beijing; drone and grocery demand may differ. P is an assumption. Power-law fit on three traffic levels; P = 2.5 extrapolates. Daily total held at the filed caps. Still air.

## Deviation log
(none yet)
