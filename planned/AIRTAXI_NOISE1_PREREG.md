# Air-taxi noise over neighbourhoods, both metros (written 2026-10-26 before any study run)
Status: scenario model on the AIRTAXI_NET2 networks (engine taxi/net2.js). Simple point-source acoustics on flat ground from two manufacturer-reported levels; no terrain, buildings, wind or air absorption; no population data. Not a noise assessment, forecast or compliance finding.

## Question
Where, and how often, would people on the ground hear these simulated air-taxi networks above everyday sound levels, and does any place off the sites come near the FAA's DNL 65 dB threshold for significant aircraft noise?

## Noise inputs (sources checked 26 Oct 2026)
- **Cruise source:** 45.2 dBA at 500 m (1,640 ft) slant distance at 100 knots: Joby's figure from the 2021 NASA acoustic test, as reported by Vertical Mag and AVweb (Joby attributes it; NASA's paper, NTRS 20220006729, gives contours, not this number). Archer separately claims about 45 dBA at about 2,000 ft for Midnight in cruise (Archer 2022 release).
- **Take-off and landing source:** "below 65 dBA at 100 m (330 ft) from the flight path" for departure and approach profiles: Joby, reported by the same articles. Used as 65 dBA at 100 m (an upper bound by its own wording). NASA's abstract says approaches were consistently louder than departures and repeated runs mostly agreed within 1-2 dBA (Vertical Mag's report of the paper).
- **Propagation:** spherical spreading only, level = source level − 20 log10(distance / reference distance); distances under 30 m are taken as 30 m. Air absorption, ground effect and shielding ignored (all would lower levels away from the source, so this errs loud at distance).
- **Phase mapping (my assumption):** the take-off/landing source applies during the 6 s vertical lift or touchdown and the whole 8:1 climb or descent; the cruise source applies in cruise at 610 m. Time on the pad with rotors turning beyond the vertical phase is not modelled. Holding is modelled as hovering 150 m above the site centre with the take-off/landing source (worst case).
- **Flights:** exactly the AIRTAXI_NET2 runs at 2 pads, 90 s pad occupancy, base aircraft, demand r = 1.5, 3, 6 per OD entry with the NET2 median fleets (DFW 8, 14, 24; Houston 5, 8, 14), seeds 1-5, measured window 12 h (clock 06:00-18:00; the warm-up starts 04:00 and is excluded). Straight routes pad to pad, departure and arrival along the route bearing (real FAA approach/departure paths are not public for these sites).
- **Ground grid:** points every 200 m covering every site and route with a 4 km margin; levels sampled every 1 s of flight.

## Measures (per metro, demand, seed; then median over seeds with min-max)
- **N55 / N65:** at each ground point, the number of flights whose maximum level there is >= 55 dBA / >= 65 dBA in the 12 h. 55 dBA is about a busy suburban street by day; 65 dBA the level Joby quotes at 100 m.
- **Area** (km²) with N55 >= 10 in the 12 h, and with N65 >= 1.
- **Reach:** the largest distance from the nearest site centre of any point with N55 >= 1.
- **DNL** at each point from the 12 h of flights (24 h average, +10 dB for the 06:00-07:00 hour), and the highest DNL at points more than 300 m from every site centre ("off-site").
- **Under the busiest route:** N55 at the point 1 km from DFW Corporate Aviation along the line to Alliance, and 1 km from IAH toward Hobby.
- **Sensitivity:** both source levels −5 dB and +5 dB (base case r = 1.5 and r = 6, seed 1).

## Predictions (written from arithmetic before any run: 65 dBA at 100 m falls to 55 dBA at about 316 m; on the 8:1 climb an aircraft is about 140 m up 1 km out and about 330 m up 2.5 km out; cruise at 610 m directly below gives about 43.5 dBA; a take-off or landing event of about 30 s gives a sound exposure level near 80 dB at 100 m)
- **N1:** no off-site point reaches DNL 65 in either metro at any demand level; highest off-site DNL is below 60 in every run.
- **N2:** cruise is never heard at 55 dBA: every point with N55 >= 1 lies within 3 km of a site centre (reach <= 3 km).
- **N3:** at r = 1.5, the point 1 km from DFW Corporate Aviation toward Alliance has N55 of 20-80 in the 12 h; the point 1 km from IAH toward Hobby has 10-60.
- **N4:** at r = 1.5, area with N55 >= 10 is 2-12 km² in DFW and 1-8 km² in Houston.
- **N5:** going from r = 1.5 to r = 6, that area grows by a factor of 1.0-1.6 in both metros (the footprint is set by geometry, not traffic, once 10 events are reached).
- **N6:** with source levels +5 dB, reach grows to at most 5 km and the N1 result still holds at r = 1.5.

## Rules
No changes after the data is in; runner and analysis committed before runs; at most two fix attempts on a failing feature check; deviations logged below.
- **K1:** taxi/test_noise.js passes: (a) a cruise flight passing directly over a point at 610 m gives a maximum of 43.5 ± 0.1 dBA there; (b) a point 100 m from a hovering source gives 65.0 dBA; (c) a constant 60 dBA for 12 h daytime (07:00-19:00) gives DNL 57.0 ± 0.1 (60 + 10 log10(12/24)); (d) a point 1 km out along a departure line gets a maximum of 62.1 ± 0.3 dBA (closest approach about 139 m, aircraft about 140 m up).
- **K2:** the flights used are identical to AIRTAXI_NET2's seed runs (same counts of take-offs per site for seed 1, r = 1.5, 2 pads, 90 s).

## Deviation log
(none yet)
- (Appended after fingerprint bf38e6f1…; after the run.) K1 PASS (test_noise.js, 6 checks), K2 PASS (both metros). 38 runs, no fix attempts. Computational detail not stated above: levels below 35 dBA are ignored in maxima and DNL (search radius). 5 of 6 predictions pass. N3 FAIL as registered: the Houston point 1 km from IAH toward Hobby heard 77 events (predicted 10-60) because the IAH-Hobby and IAH-Ellington routes leave IAH only about 13° apart, so the point is about 230 m from the Ellington route too and hears both; the prediction counted one route.
