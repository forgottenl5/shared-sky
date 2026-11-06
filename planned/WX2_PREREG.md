
# WX2: what weather stops do to traffic afterwards (registration, 5 Nov 2026)

Status: registered before any run of the experimental arms and before the weather schedule was computed. Pre-run checks K1-K2 passed first.

## Why
WX1 counted bad-weather hours (2025: hard-stop label in 3.9 % of daytime hours in Houston and 4.6 % in DFW; thunderstorms are invisible in the data), but every other study flies through them. If operators stop in bad weather and catch up afterwards, the hours after a storm carry more traffic than normal, and conflicts grow faster than traffic.

## What I knew before writing
WX1's published shares above, and that cross-company conflicts should scale roughly with the product of two companies' traffic. I had not computed the stop-hour run lengths or the catch-up schedule.

## Model
- **Stops:** daytime hours (WX1: UTC 13-03) with WX1's hard-stop label: gusts at 10 m of 55 km/h or more, or precipitation of 2.5 mm or more, or a thunderstorm code (none occur in these files). No flights in those hours.
- **Catch-up:** demand arrives at the normal rate every daytime hour; orders from stop hours queue and are flown afterwards at up to M_MAX times the normal rate (base 1.5, sensitivity 2) until the queue is empty; the queue carries over night. No company rule is public; M_MAX is an assumption.
- **Traffic runs:** HEADLINE2 layouts, still air, seeds 1-6, both metros, arms S1 and A2, every site's rate times M = 1, 1.5, 2: planned cross-company conflicts (as HEADLINE2) and the V2 plan check's delayed and cancelled shares.
- **Yearly effect:** conflicts per hour follow the power law fitted to M = 1, 1.5, 2 (through the M = 1 value); yearly planned conflicts = sum over 2025 daytime hours, against all hours at normal traffic.

## Predictions (each applies to both metros and both arms where named)
- **X1:** cross-company planned conflicts grow with traffic at an exponent between 1.7 and 2.3.
- **X2:** stops plus catch-up at up to 1.5x change yearly planned conflicts by +2 % to +10 % against no weather.
- **X3:** with catch-up at up to 1.5x, 5-12 % of daytime hours are flown above normal traffic.
- **X4:** the V2 check's delayed share at 2x traffic is at least 1.5 times the share at 1x.
- **X5:** the height-sharing cut at 2x traffic is within 5 points of the cut at 1x.

## Checks (K)
- K1: at M = 1 the runner reproduces HEADLINE2 exactly (Houston S1 and DFW A2, seed 1). K2: doubling every site's rate gives 1.9-2.1 times the flights.

## Limits stated in advance
- Stop rule and catch-up rate are assumptions; thunderstorms are not in the data, so stops are a lower bound; one year, one grid cell per metro; still air in the traffic runs (catch-up hours after storms may still be windy); the queue is a demand model, not any company's dispatch rule.

## Deviation log
(none yet)
