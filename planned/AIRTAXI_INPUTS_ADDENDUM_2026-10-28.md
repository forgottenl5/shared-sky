# Air-taxi inputs addendum: reserve rule and aircraft performance read in primary sources (28 Oct 2026)

Closes GAP_PLAN Phase 0 item 2's open note ("verify against 14 CFR 194") and the unverified range/speed rows in AIRTAXI_INPUTS_2026-10-26.md. Reading only; no model change.

## Energy reserve (read in FAA Advisory Circular 194-1, https://www.faa.gov/documentLibrary/media/Advisory_Circular/AC_194-1.pdf; preamble of the final rule, Federal Register Vol. 89 No. 225, 21 Nov 2024)
- "Fuel" includes any form of energy, including batteries (AC 194-1 ¶3.3.9.2 note).
- Part 135 VFR (air-taxi operations, § 135.209): helicopter reserve "at least 20 minutes regardless of day or nighttime"; airplane reserve 30 minutes by day, 45 minutes at night. § 194.306(ss) "allows a powered-lift to use the VFR helicopter fuel minimums" (AC ¶5.7.1-5.7.2).
- Part 91 VFR (§ 91.151): airplane minimums by default; helicopter minimums only if the powered-lift can be assured of a safe landing in vertical-lift mode along the entire route (§ 194.302(l), AC ¶3.3.9.1).
- IFR: helicopter 30 min, airplane 45 min; powered-lift may use the helicopter figure with Copter Procedures and vertical-landing capability (§ 194.302(q), § 135.223(a)(3)).
- **Consequence for the model:** the 20-minute reserve used since NET3 is the correct Part 135 daytime VFR figure for an aircraft able to land vertically along the route. Without that capability it would be 30 min by day (NET3 F5: no change at these demands) or 45 min at night (not modelled; the model flies 06:00-18:00 only). The 14 CFR text itself was not reachable from this session (eCFR blocked); the AC quotes it.

## Aircraft performance (manufacturers' own pages)
| Aircraft | Source | Stated |
|---|---|---|
| Wisk Generation 6 | https://wisk.aero/newsroom/generation6 | cruise 120 knots (138 mph); "90 miles with reserves (~144 km)"; 4 seats |
| Joby | https://www.jobyaviation.com/news/joby-completes-flight-of-more-than-150-miles/ | "a range of 150 miles on a single charge", "speeds of up to 200 mph"; pilot and four passengers; 154.6 mi flown in 1 h 17 min (reserve not stated) |
| Archer Midnight | https://investors.archer.com/news/news-details/2025/Archer-Completes-55-Mile-FlightLongest-Yet-For-Piloted-Midnight-Aircraft/default.aspx | 55 miles in 31 min at over 126 mph; earlier test flights "nearly 150 mph"; no design range stated |

**Consequence for the model:** 150 mph cruise sits between Wisk's stated cruise and Joby's top speed and matches Archer's test speeds. 100 km usable after the reserve is below Wisk's 144 km with reserves, so it is a cautious choice; NET3 F4 shows 160 km usable moves the fleet by at most one step. The model aircraft is still a generic four-seater, not any one type.
