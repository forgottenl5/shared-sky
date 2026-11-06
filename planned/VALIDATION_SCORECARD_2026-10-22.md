# Sky-Grid validation scorecard (22 October 2026; updated 23 October after PRELAUNCH)
What each kind of result has been checked against, and what is still open. Updated as checks are added.

## Legend
- **Matched by construction:** copied from a source, so agreement proves nothing.
- **Cross-engine:** reproduced by an independent engine (BlueSky 1.1.1). Not checked against reality.
- **Real-world check:** compared with a public observed number.
- **Unverified:** model-only.

## Inputs
| Item | Source | Status |
|---|---|---|
| Wing heights (46–91 m), speed 26.4 m/s, 30 s hovers at 7 m, 400 deliveries/day per nest | FAA Wing DFW and Houston EAs | Matched by construction |
| Zipline 101 m cruise and hovers (120 s, 75 s), 31.3 m/s, up to 1,000/day per site | FAA Zipline Texas draft EA, DFW EA | Matched by construction |
| Amazon heights (out 61 m, in 105 m), 30 m/s, transition durations, 1,000 flights/day per hub | FAA Amazon Omaha EA App. E Table 1 (re-read 22 Oct 2026); Kansas City EA | Matched by construction. Table 1 is a representative noise profile, not a flight specification |
| Site locations | Cypress approximate (±2–3 km); build-out random | Partly sourced |
| Customer locations | Uniform over each service disc; Census 2020 block-group variant (CENSUS, RICHPOP) | **Assumption; tested against Census population** |
| Routes | Straight lines | **Assumption; real departures funnel into corridors** |

## Outputs
| Result | Status | Evidence |
|---|---|---|
| Meetings grow with density squared (slope ~2) | Cross-engine | Slopes 2.29 / 1.95 / 2.30 across engines; HOUSTON2 slope 1.98 |
| Absolute near-miss and crash counts | Not dependable | Differ between engines (BSVIENNA) |
| Capacity is set by the booking layer | Internal | Booking-only model reproduces full engine's served share and wait |
| Amazon inbound / Zipline 4 m clash causes most cross-operator meetings in the filed plans; allocation inside filed bands cuts meetings 81 % against filed heights | Derived from filings; unverified as an operational outcome | VALLOC, ROBUST, COUNTFIX |
| Against a 69 / 122 m Amazon profile, allocation adds only 23 % (close 46 %) | **Corrected 24 Oct: no source found for the 122 m return** (it is the 400 ft ceiling, above every filed band). At the best-sourced heights (69 m out, filed 85–115 m back) the cut is 71 % (AMZSRC) | PRELAUNCH S1, AMZSRC |
| Bad-day and delay benefits of allocation: holds 9.4×, delay 4.4× against filed; **1.4× [0.8–2.4] and 1.3× against reported** | Model only | COUNTFIX, PRELAUNCH2 |
| Allocation robust to height-keeping error (72 % at 3 m, 63 % at 5 m), 30 random layouts (83 % at 4 km, worst tenth 72 %), 6 km spacing (81 %), drop-box layout (±2 points) | Model only; all against filed heights | PRELAUNCH S2–S3 |
| Outage results from the browser (lab) engine | **Not verified:** lab outages held 596 drones vs 2,208 in OUTAGE with the same seeds | PRELAUNCH2 note 3 |
| Plan check removes planned meetings at 1.5–2.3 % delayed (4.8 % at 2 km) | Unverified (no public delay data); zero is by construction | PROC |
| Smallest fleet carries the most delay per flight | **Tested (FLEET, registered):** equal fleets cut Amazon's per-flight delay ratio from 7.5–8.1 to 2.2–2.6, so fleet size explains about 70 %; a residual Amazon–Wing 2:1 split remains (cause untested) | VRATE diagnosis, FLEET_RESULTS |
| Overflights per home near a hub | **Real-world check: FAIL, partly explained.** Uniform model gives about 2.5 % of hub passes over a [street withheld] home; the resident's count implies 40–55 %. The hospital no-fly zone (sourced position, unknown radius) raises the model to at most about 10 %: roughly a fifth of the gap. **Census-weighted customers do not close it** (0.8× uniform; RICHPOP, 23 Oct). **About two shared departure paths, one over the street, reproduce it (0.50; CORRIDOR, 24 Oct)**: a fitted explanation, not yet confirmed by tracks | RICHARDSON_CHECK, NFZ_RESULTS, RICHPOP_RESULTS |

| Counting method | **Corrected (COUNTFIX, 23 Oct):** 4 checks per second (1 s missed about 40 % of close meetings); incidents counted in-zone; exact Poisson 95 % intervals. Headline cut 81 % [78–84] wide, 92 % [89–95] close | COUNTFIX_RESULTS |

| Allocation result vs Wing's altitude practice | **Robust (WINGFIX, 23 Oct):** cut 81–84 % wide, 90–93 % close whether Wing flies 46, 61, 76 m or random | WINGFIX_RESULTS |

## Open checks
1. **Corridors near hubs:** the no-fly zone explains about a fifth of Richardson's concentration (NFZ_RESULTS). The rest needs real tracks (Remote ID) or Amazon's registered paths.
2. **Wing–Flytrex overlap:** figure verified (about 8,000 operations in overlapping airspace, Jan–Feb 2026, Little Elm and Wylie; zero planned conflicts; no delay data). It is consistent with our 0 planned meetings after a plan check, but a site-level comparison needs Flytrex's site positions, which are not public (GEMINI_RESEARCH_CHECK).
3. **Remote ID recordings:** real drone tracks and heights near a hub; now the most important check, because the headline depends on Amazon's actual heights. Options: DroneAware community network (research agreement needed), or own receiver after a legal check (founder).
5. **Amazon's actual heights:** only local secondary reports so far.
4. **Outside reviewer:** none yet.

## What can be claimed now
- Comparisons between designs on the same traffic (allocation, plan check), with limits stated, always against both the filed and the reported Amazon heights.
- That the filed plans contain a 4 m Amazon–Zipline overlap, and that keeping every company's return and cruise heights at least 10 m apart does most of the work.
- Not yet: absolute exposure, delay or safety numbers for real places.
