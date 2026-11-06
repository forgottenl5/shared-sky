# Prior art: reserved-volume size, stress events, and contingencies (searched 23 October 2026)
Purpose (RED_TEAM_REVIEW item 4): before any novelty wording for VOL, STRESS, DEVIATE / DEVA0 / RTH / OUTAGE, check what is published. Pages opened are listed under Sources.

## What exists
| Work | What it does | Overlap with our studies |
|---|---|---|
| Pradeep, Munishkin, Kalyanam & Erzberger (NASA Ames), AIAA SciTech 2023 | Strategic deconfliction with operational volume blocks for two operators at a crossing; temporal separation from block length, width and crossing angle; LP minimising ground delay | **VOL:** finds average ground delay linear in block length. Our "delay roughly linear in horizontal reserve" is **not new** |
| Evans, Anand, Campbell (Airbus UTM), Anagnostou & Tiberia (EUROCONTROL), DASC ~2023, Riga | Synthetic hub-and-spoke delivery; strategic deconfliction by departure delay only; fixed buffers 40 m / 30 m / 10 s; 100–500 operations/h; airport, heliport and ground-risk restrictions routed around | **PROC/STRESS:** same method as our plan check; delay rises steeply with demand; restrictions routed around. Strategic deconfliction cut MAC per flight hour by ~99 %. Our surge and static-restriction results are **consistent, not new**. Single generic vehicle and altitude; no filed operator profiles |
| Liu, Munoz-Gamarra & Ramos (UAB), Drones 8:426, Aug 2024 | U-space strategic deconfliction in a corridor network (Castelldefels), four operators, 30 m separation; acceptance ratio vs time windows | First-come-first-served limits; no volume-size or height-allocation analysis |
| Kuo, Xue, Pradeep, de Alvear Cárdenas & Lee, NASA/TM-20240015613, Oct 2024 | Monte Carlo of contingent (non-conforming) aircraft against strategically deconflicted traffic; MAC probability with and without conformance monitoring (CMSA) updating intent volumes; 0.25–1 % contingent | **DEVIATE family:** shows off-plan aircraft create collision risk after strategic deconfliction (up to ~7×10⁻⁴ MAC per flight hour), cut to ~10⁻⁷ when contingencies are shared via CMSA. All aircraft at the same altitude (120 m); return flights and recovery manoeuvres explicitly excluded |

## What appears not to be covered
We did not find published work (searched 23 October 2026) that:
- tests how contingencies (holds, return-to-home) interact with **height allocation between operators**, or with operators' **filed profiles**: our 9.4× [6.3–14.7] (hold risk, filed heights vs allocation) and 10.7× [5.4–24] (RTH at a common 120 m vs own height);
- combines the vertical-separation requirement with operators' filed heights (VOL: a 20 m requirement breaks the allocation and multiplies delays ~5×).

## Consequences for wording
- **VOL:** state the horizontal-reserve result as consistent with Pradeep et al. 2023, not new. The vertical-requirement interaction with filed heights may be new.
- **STRESS:** consistent with Evans et al.; present as a check of our engine, not a contribution.
- **Contingencies:** cite Kuo et al. 2024 for off-plan risk after strategic deconfliction and for the value of sharing contingencies. Our possible contribution is narrower: altitude allocation and contingency heights between operators.
- **DEVIATE's "sharing barely helped"** is not comparable with Kuo et al.'s CMSA result: we shared only at the plan level for later launches, had too few events, and did not reroute airborne flights. Do not present it as contradicting them.

## Sources (pages opened)
- [Pradeep et al., SciTech 2023 presentation (NTRS)](https://ntrs.nasa.gov/api/citations/20220018221/downloads/20220018221_Pradeep_SciTech2023_Presentation.pdf)
- [Evans et al., Simulating Safety and Efficiency Impacts of Airspace Constraints in U-Space Airspace (EUROCONTROL)](https://www.eurocontrol.int/sites/default/files/2023-09/dasc_riga_2023_0.pdf)
- [Liu et al., Drones 2024, 8, 426](https://ddd.uab.cat/pub/artpub/2024/301779/drones-08-00426.pdf)
- [Kuo et al., NASA/TM-20240015613](https://ntrs.nasa.gov/api/citations/20240015613/downloads/NASA-TM-20240015613_corrected.pdf)
- Not readable: Confidence-Based Buffer for Strategic Deconfliction with Probabilistic Operational Intent (ResearchGate, blocked).

(Note added 29 Oct 2026.) NTRS record 20240015613 checked: "Safety Assessment of Conformance Monitoring for Situational Awareness in UTM Operations", Kuo, Xue, Pradeep, de Alvear Cárdenas, Lee, NASA/TM-20240015613, dated 1 Dec 2024 (the table above said Oct 2024). Melgosa et al. title and DOI 10.3390/drones10090656 confirmed in a search index the same day.
