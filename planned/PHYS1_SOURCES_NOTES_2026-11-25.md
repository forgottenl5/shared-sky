# PHYS1 source notes (25 Nov 2026; private working notes, not a registration)
Performance figures for a more realistic flight model, checked against FAA filings. "Engine" = lab/lab_engine.js today.

| | Engine today | Filing says | Source |
|---|---|---|---|
| Amazon MK30 cruise | 30 m/s | 58 kt / 67 mph cruise; 73 mph maximum | FAA Amazon Texas EA sec. 2.2.2 (checked earlier, SKYGRID_MASTER_PLAN row 18); DroneXL aircraft tracker (from FAA PEA Fig. 4) |
| Wing Hummingbird cruise | 26.4 m/s | 51 kt (26.2 m/s), "single set speed"; maximum cruise 68 kt (special-class airworthiness criteria) | Wing DFW Final SEA (Apr 2025) via tracker; Federal Register 2023-02598 |
| Zipline P2 cruise, Houston | 31.3 m/s | "typical cruise airspeed of 70 mph" (31.3 m/s), charger + dropbox model, 120 s pick-up hover, 75 s delivery hover, 330 ft AGL | Zipline Texas Metros draft EA (Sep 2026; covers Houston, 65 chargers) per DroneXL; same text in Zipline Arizona Metros draft EA (Nov 2026) sec. 2.2.4.3-2.2.4.7, 3.3.3 (read directly) |
| Zipline P2 cruise, DFW | 31.3 m/s | **47 mph (21.0 m/s)** airspeed outbound and inbound; "accelerating to full en route speed" after delivery | Zipline DFW draft EA sec. 2.2.2.4, 2.2.2.6 (read directly); FONSI/ROD signed 23 Dec 2025 |
| Climb / descent rates | Wing, Zipline 5 m/s; Amazon fixed ramp times | **not stated in any filing read** (Wing, Zipline DFW, Zipline Arizona, Wing airworthiness criteria); Zipline "ascends vertically", "decelerates and descends vertically" | as above |
| Acceleration, turns | none (instant) | not stated; Zipline "accelerates as it exits the delivery area" | as above |

## Consequences
- **DFW Zipline speed is probably wrong in the engine:** its own DFW filing gives 47 mph, the engine flies 70 mph (from the newer Texas Metros / Arizona text). Every DFW study so far uses 70 mph. Slower Zipline flights stay in the air about 1.5 times longer in cruise, so DFW Zipline traffic density and its share of meetings would rise. PHYS1 must test this (DFW at 47 mph) and report the effect on DFW results.
- Climb and descent rates are not public: PHYS1 must use a stated range (e.g. the Madrid dataset's median 3.85 m/s, 2-6 m/s) and show sensitivity, not a single guess.
- Not yet checked: the Texas Metros draft EA PDF itself (not reachable from this session; number taken from DroneXL and confirmed by identical Arizona text).

## Flight profiles found in the FAA noise reports (25 Nov 2026, second pass; all read directly)
Phase times measured or modelled for noise; vertical rates are my arithmetic from the stated heights and times.

### Amazon MK30 (Technical Noise Report, Omaha final EA Appendix E, Table 1, p. 5)
- Take-off vertical climb 0-115 ft in 15 s (2.3 m/s); transition and outbound climb 115 ft to cruise while accelerating 0 to 58.3 kt in 40 s (about 0.75 m/s2).
- Delivery: descent and transition from cruise to 140 ft, 58.3 kt to 0, in 30 s (about 1.0 m/s2); backyard descent 140-13 ft in 27 s (1.4 m/s); 4 s at 13 ft; backyard ascent 13-197 ft in 30 s (1.9 m/s); transition and inbound climb in 40 s.
- Landing: descent and transition from inbound cruise to 197 ft in 30 s; vertical descent 197-0 ft in 35 s (1.7 m/s).
- Engine today uses these phase times (Amazon ramps) - consistent.

### Wing Hummingbird 7000W-B / 8000-A (Wing DFW Final SEA, Attachment B Technical Noise Study Report, sec. 3.1-3.2.5, pp. 3-1 to 3-3; nominal cruise 50.5 kt, sec. 2.1.1-2.1.2)
- Take-off: to 33 ft then 22 ft (9-11 s), hover 20 s at 22 ft, climb 22-165 ft in about 14 s (3.1 m/s), accelerate to 50.5 kt in 13-15 s (about 1.7-2.0 m/s2).
- Delivery: decelerate 50.5 kt to 0 in 13-15 s; descend 165-22 ft in 20 s / 28 s (2.2 / 1.6 m/s); hover about 12 s; climb 22-165 ft in 15-16 s (2.7-2.9 m/s); accelerate in 14-18 s.
- Landing: decelerate about 14 s; descend 165-20 ft in 15 / 24 s (2.9 / 1.8 m/s), then to ground in 12-13 s.
- Engine today: vertical 5 m/s, instant acceleration - climbs too fast.

### Zipline P2 (Zipline DFW Final EA, Appendix D Technical Noise Study Report, ICF May 2025, sec. 2.1-2.2 and Table 2, pp. 2-1 to 2-5)
- Undocking: motor start about 25 s; "ascend vertically from dock until reaching approximately 330 feet AGL" in about 75 s (1.3 m/s); accelerate to 41 kt in about 10 s (about 2.1 m/s2).
- Cruise "approximately 41 knots" (21.1 m/s) at 330 ft; EA text 47 mph (21.0 m/s).
- Delivery: decelerate 41 kt to 0 in about 20 s (about 1.05 m/s2); hover about 75 s at 330 ft; accelerate in about 10 s.
- Docking: decelerate about 20 s, then "Descend to the dock and complete the docking maneuver" in about 75 s (about 1.3 m/s).
- Measured: depart dock 123-134 s per test, arrive 116-123 s, deceleration 17-30 s, acceleration 10-14 s.
- Engine today: vertical 5 m/s (about 20 s to 101 m instead of about 75 s), cruise 31.3 m/s, instant acceleration.
- The 2026 Texas Metros / Arizona filings (70 mph, charger + dropbox model) may have a different profile; their noise report section 3.3 was not in the text read.

### Not found anywhere yet
Turn radius or bank limits for any of the three.

## Cross-check against an AI-assisted literature search (Gemini Deep Research, 25 Nov 2026; not published: only the figures confirmed in the primary sources above are used)
- **Agrees** with every figure above read directly (Amazon Table 1 phase times; Wing noise-report phase times, also in the Wing Houston Final EA Attachment B; Zipline DFW Appendix D phase times and 41 kt). No conflict found.
- **Adds, verified here:** nothing new that could be opened; the Part 135 Final PEA (Jul 2026) aircraft table (Wing 51 kt, Zipline 41 kt) is cut off in the text read, but both speeds are already confirmed in the operators' own noise reports.
- **Adds, NOT verified (pages not reachable from this session):** Wing patent WO2018112404 simulation "cruise speed of 28 m/s and bank angle of 30 degrees" and climb rates 2.3-2.8 m/s; NASA NIAC 2022 report (NTRS 20250001538) generic 30-degree bank for 180-degree turns and 1.52 m/s minimum climb; Amazon MK30 maximum 64 kt (73 mph) [73 mph maximum already seen earlier in the Amazon Texas EA].
- **Its conclusion, consistent with ours:** climb/descent rates, bank and turn limits are in non-public flight manuals; phase times in the FAA noise reports are the best public data; turn radius is the one real gap (only a patent simulation's 30-degree bank, giving about 120 m radius at 26 m/s).
- **Zipline speed:** report treats 41 kt (FAA noise modelling, DFW) as the verified primary figure and 70 mph as vendor-stated; newer FAA drafts (Texas Metros, Arizona) say "typical cruise airspeed of 70 mph" (Arizona read directly), so the FAA text itself changed in 2026.

## Decisions for PHYS1 (proposed)
- Use the noise-report phase times per company (climb/descent, acceleration/deceleration, hovers).
- DFW Zipline: 41 kt per its signed DFW EA; Houston Zipline: 70 mph per the 2026 Texas Metros text, with its climb profile unknown -> test the DFW profile and a faster variant.
- Turns: 30-degree bank coordinated turns as the base case (patent / NASA concept assumption, NOT a certified limit), with 20 and 45 degrees as sensitivity.
