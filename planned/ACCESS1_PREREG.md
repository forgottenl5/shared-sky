# ACCESS1 pre-registration: who could save time by flying between Archer's announced Texas sites (27 Oct 2026)

Written 27 Oct 2026 before any ACCESS1 number was computed. Scenario analysis of public data, not a demand forecast.

## Question
Take Archer's Texas site list of 23 Oct 2026. For people who already commute between two places in the same metro, how many would cut their door-to-door time by flying between two of the sites, and who are they? Counting only existing commuters with time saved, ignoring fare, willingness to pay, weather, waiting and aircraft capacity, so it is an upper bound on time-saving trips, not a count of riders.

## Sources (inputs, all supplied or checked this session)
- Site list: Archer investor release, 23 Oct 2026 (https://www.investors.archer.com/news/news-details/2026/Archer-Unveils-Texas-Air-Taxi-Networks-Across-Houston-Dallas-and-Austin/default.aspx), read 27 Oct 2026. DFW: DFW, Love Field, Addison, Arlington Municipal, Fort Worth Meacham, Fort Worth Alliance, Frisco Station. Houston: IAH, Hobby, Sugar Land Regional, Thompson Hotel Helipad (downtown), Galveston (no site named). The release gives no street addresses, launch date or fares.
- Coordinates of the ten airports: airport reference points from OurAirports (github.com/davidmegginson/ourairports-data, airports.csv, read 27 Oct 2026), a secondary copy of FAA data, not checked against FAA NASR. KDFW 32.896801,-97.038002; KDAL 32.844776,-96.847653; KADS 32.9686012268,-96.8364028931; KGKY 32.66389846801758,-97.09429931640625; KFTW 32.819919,-97.360818; KAFW 32.99044,-97.31947; KIAH 29.9844,-95.3414; KHOU 29.645336,-95.276812; KSGR 29.622299194336,-95.65650177002; Galveston = Scholes International KGLS 29.265301,-94.860397 (**an assumption**: Archer names no Galveston site).
- **Frisco Station and the Thompson Hotel helipad have no verified coordinates and are left out of the primary analysis.** When the founder hand-types them, the same analysis is rerun as a labelled addendum (ACCESS1b, descriptive only, no predictions).
- Census 2020 PL 94-171 Texas (tx2020_pl.zip, 99,593,751 bytes, sha256 prefix 6fee8ca5759eb494): block internal point and POP100 from the geographic header (summary level 750). Saved as data/census/tx_blocks_2020.csv, sha256 4f6eee558325ff4a1a356255c4c58404c86530fa0233d2ad67598938e81989b1 (668,757 blocks).
- LEHD LODES8 Texas 2022: OD main JT00 (sha256 40184e968297aa6c8904ee615739ebef60c4ce9d18b218f3f95c5fad3bf58172) and WAC S000 JT00 (sha256 870509e9cfecd6ef7678e5cfd94b6fbf8497efff8e39bdc2be54836db24c0d19). LODES jobs are home block to work block for primary jobs, both ends in Texas. LODES blocks are 2020 blocks, matching the PL file.
- Road times: taxi/data/drive_times_raw.tsv (Google "typical traffic" ranges, hand-read by the founder 26 Oct 2026 for the six earlier site pairs).
- Flight time: engine v2 flightTime (taxi/net2.js) with the profile padZ 15 m, lift 2.5 m/s, slope 8, climb 31 m/s, cruise altitude 610 m, cruise 67 m/s (as AIRTAXI_NET2).

## Metros (county FIPS, names checked in the PL header)
- DFW (11 counties): 085, 113, 121, 139, 231, 251, 257, 367, 397, 439, 497.
- Houston (9 counties): 015, 039, 071, 157, 167, 201, 291, 339, 473.
A commuter is in a metro when both the home block and the work block are in its counties.

## Model
- Straight-line distance: equirectangular, as the engine (reference latitude 33.0 DFW, 29.75 Houston).
- Road distance = c x straight line. Road speed v. Both come from the hand-typed Google table: c = median over the 12 directed rows of (road km / straight km between the earlier site coordinates, AFW, DFWc, TOY, 49T, IAH, HOU, EFD as in taxi/export_airtaxi.js); the road km is the table's miles x 1.609344. v_peak = median over the 08:00 and 17:30 rows of road km / midpoint of (min_lo, min_hi); v_off = same for the 12:00 rows. Same c and v for access legs and for the direct drive, so neither side is favoured.
- Direct drive time (home h to work w) = c x d(h,w) / v.
- Access time of block b to site s = c x d(b,s) / v.
- Air door-to-door time via sites A (near home) and B (near work), A different from B: acc(h,A) + acc(w,B) + P + F(A,B), F = engine flight time for the straight-line distance A to B. P is the combined processing time at both ends (parking or drop-off, check-in, boarding, deplaning, walking); **P is an assumption, not a published figure**: 20 min primary, 10 and 30 in the sweep.
- Saving s = direct drive minus the best (smallest) air time over all A, B pairs. A commuter benefits when s >= T. T = 10 min primary; 0 and 20 in the sweep.
- Weights: LODES S000 (jobs). Peak scenario uses v_peak, off-peak uses v_off.
- Equity: LODES SE03 (jobs paying more than $3,333 a month) as the share of jobs.
- Catchment: residents (POP100 of blocks) and jobs (WAC C000) whose block is within 15 and 30 minutes of access time (peak speed) of at least one site, and per site.

## Predictions (primary: peak, P = 20, T = 10; "share" = benefiting jobs / all LODES jobs with both ends in the metro)
- **P1:** the share is between 0.1 % and 3 % in both metros.
- **P2:** the off-peak share (same P and T) is less than half the peak share in both metros.
- **P3:** with P = 10 the share is more than twice the share with P = 20, in both metros (peak, T = 10).
- **P4:** the DFW share is larger than the Houston share.
- **P5:** the median straight-line commute of benefiting jobs is at least twice the median of all jobs, in both metros.
- **P6:** the SE03 share of benefiting jobs is at least 10 percentage points above the SE03 share of all jobs, in both metros.
- **P7:** residents within 30 min of a site: DFW between 35 % and 75 % of the metro's population; Houston between 25 % and 65 %.
- **P8:** the three site pairs with most benefiting jobs hold at least half of the benefiting jobs, in both metros.
Pass requires the condition in every metro named. Predictions are not edited after the fingerprint.

## Checks before the run
- **K1:** block populations sum to the official Texas 2020 count 29,145,505.
- **K2:** at least 99.9 % of LODES OD rows (by jobs) inside the two metros have both blocks in the block file.
- **K3:** the code's air time for one hand-computed block pair (inputs fixed in the runner) matches the hand value to 0.01 min.
- **K4:** calibration c is within 1.1 to 1.5 and v_peak, v_off within 30 to 90 km/h, and v_off > v_peak.

## Not claimed
Fares, queues, weather, charging, aircraft range, noise and whether anyone would pay are outside this study. Two of Archer's twelve sites are missing until coordinates are supplied. The straight-line and constant-speed road model ignores the road network; it is calibrated on six long airport pairs and may be poor for short trips. LODES counts primary jobs by 2022 home and work location, not trips on a given day.

## Files
planned/access1_flight.js, planned/access1_run.py, planned/access1_analyze.py, out/access1.json. At most 2 fix attempts per problem, logged below.

## Deviation log
(none yet)

(Appended after fingerprint, before any run, 27 Oct 2026.) Clarification 1, not a deviation: "the 12 directed rows" for the road-circuity median means all 36 rows of the drive-time table (12 directed pairs x 3 departure times); v_peak uses the 24 rows at 08:00 and 17:30 and v_off the 12 rows at 12:00. The runner does this.

(Appended after fingerprint.) Fix 1 of 2, runner bug, no number had been computed: the drive-time table names the DFW Corporate Aviation FBO "DFW" while the runner's coordinate table only had "DFWc" (KeyError). Added "DFW" with the same coordinates as DFWc (taxi/export_airtaxi.js). No method change.

(Appended after fingerprint, 27 Oct 2026.) ACCESS1b addendum run as registered (descriptive, no predictions): Frisco Station 33.11296089149642, -96.8277353946615 (a point in the development; the pad location is not public) and Thompson Hotel helipad 29.760414824829493, -95.38212908531595, both hand-read from Google Maps by the founder. The Thompson point is within about 30 m of OurAirports' Allen Condo/Tower Heliport (17TT, 29.760111, -95.382389), an independent check. Runner change: site file chosen by env A1_SITES (default unchanged; the primary site file reproduces byte for byte).
