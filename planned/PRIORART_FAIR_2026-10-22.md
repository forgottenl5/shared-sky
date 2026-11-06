# Prior art: fairness in strategic deconfliction (searched 22 October 2026)
Purpose: before registering a fairness study, check what is already published, so we only claim what is new.

## What exists
| Work | Setting | What drives unequal delay | Rules compared |
|---|---|---|---|
| Evans, Egorov & Munn (Airbus UTM), "Fairness in Decentralized Strategic Deconfliction in UTM", AIAA 2020, doi 10.2514/6.2020-2203 | Synthetic. Two package operators (separate warehouses); two air-taxi operators. Operators identical except file-ahead time. Climb and descent not modelled explicitly. | File-ahead time. Operator 2's delay exceeds 1 h 45 min at high demand. | First-requested-first-served; a freeze horizon (RTTA) is proposed, not simulated |
| Chin et al., "Efficiency and Fairness in Unmanned Air Traffic Flow Management", IEEE T-ITS 2021, doi 10.1109/TITS.2020.3048356 | Traffic-flow optimisation (page not readable; listed via Fair-CoPlan) | n/a | Optimisation with fairness terms |
| Yang et al. (CNA), "Agent-Based Modeling of UAS Flight Planning for Airspace Fairness", June 2023 | UCATS agent model; package delivery operators differing in file-ahead time and peak time; food delivery in sensitivity | Later departures and short notice are disadvantaged | First-filed-first-served |
| Carramiñana, Besada & Bernardos, "A Fair and Congestion-Aware Flight Authorization Framework for UTM", Aerospace 12(10):881, Sept 2025 | U-space, priority classes bought with flight tokens | Authorisation rate per operator | vs first-come-first-served (the European U-space rule) |
| Fronda et al., "Fair-CoPlan", arXiv 2508.14380, Aug 2025 | Synthetic UAM grid, 12 vertiports | Path-length ratio spread | Negotiated planning vs CoPlan and TFMP (no first-come baseline) |

## Standards
- ASTM F3548-21 (UTM USS interoperability) is paywalled. We did not read its priority clauses and must not state what it specifies.
- The NASA UTM Conflict Management Model (v2.0.1) says a prioritisation scheme is needed, gives public-safety flights priority, and describes negotiation. The excerpt we read does not settle ties between flights of equal priority.
- The FAA UTM ConOps v2 refers to "fair access" and to operator negotiation, without a fixed precedence rule in the text read.

## What appears not to be covered
We did not find published work where unequal delay comes from differences in the operators' filed flight profiles (cruise heights, climb and descent geometry) rather than from filing time, nor any fairness study using real operators' filed profiles (Wing, Zipline, Amazon). Allowed wording: "We did not find published work on … (searched 22 October 2026)".

## Consequence for our study
- Do not claim that first-filed fairness problems are new. Cite Airbus 2020 and CNA 2023.
- The possible new contribution is narrow: under first-filed rules with equal filing behaviour, an operator's own vertical profile decides its share of the delay. We can test whether changing the profile, rather than the priority rule, removes the asymmetry.

Sources (pages opened):
- [Airbus paper PDF](https://canadianaam.com/wp-content/uploads/2021/05/Fairness-in-Decentralized-Strategic-Airbus-UTM.pdf)
- [CNA 2023](https://www.cna.org/analyses/2023/06/drone-agent-based-modeling-airspace-fairness)
- [Carramiñana et al. 2025](https://www.mdpi.com/2226-4310/12/10/881)
- [Fair-CoPlan](https://arxiv.org/html/2508.14380)
- [NASA conflict management model](https://ntrs.nasa.gov/api/citations/20205002076/downloads/UAS%20Traffic%20Management%20Conflict%20Management%20Model_v2.0.1.docx.pdf)
- [FAA UTM ConOps v2](https://www.faa.gov/sites/faa.gov/files/2022-08/UTM_ConOps_v2.pdf)
