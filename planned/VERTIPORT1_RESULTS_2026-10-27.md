# VERTIPORT1 results (27 Oct 2026) — registration planned/VERTIPORT1_PREREG.md (fingerprint checked by planned/verify_prereg.py; deviation 1 logged before the run)

**The air-taxi engine (version 4) reproduces the published vertiport capacity results of Vascik & Hansman (MIT, AIAA SciTech 2019): 5 of 5 predictions passed.** For one landing pad with 1 to 8 stands, the engine's pad use is within 10 points of theirs in 15 of 16 cases, it saturates at the same stand counts their formula gives (5 stands with 60 s approaches, 7-8 with 30 s), and over their turnaround sweep it gives the same number of operations within 2 in 42 of 45 points.

| Prediction | Result | Verdict |
|---|---|---|
| V1 Fig. 14 within 10 points, >= 7 of 8 | 8 of 8 (differences 0, -8, -8, +2, +2, +2, +2, +2) | PASS |
| V2 Fig. 15 within 10 points, >= 7 of 8 | 7 of 8 (4 stands: -15) | PASS |
| V3 saturation at 5+-1 and 8+-1 stands | 5 and 7 | PASS |
| V4 Fig. 17 within 2 operations, >= 80 % of 45 | 42 of 45 | PASS |
| V5 never above theirs by more than 5 points | largest +4 | PASS |

Full tables: planned/vertiport1_results_table.md.

## How to read it
- **What was validated:** the pad and stand queueing of one vertiport (who lands when, how long a stand is held, when the pad saturates) against an independent, peer-reviewed model that finds the best possible schedule. This is the first outside number the air-taxi engine has been checked against.
- **Where the engine falls short:** at middle stand counts with short pad times (Fig. 15, 3-5 stands: -8 to -15 points) and in the Fig. 17 sweep for 2 and 4 stands at 120-300 s turnarounds (up to 4 operations fewer). The engine uses one fixed first-come rule (a departure books its pad slot when its aircraft lands), while their integer program picks the best order. The engine being at or below the optimum is what the physics requires; the small excesses (+2 to +4 points) come from counting partial pad slots at the window edge.
- **What it does not validate:** demand, dispatch, repositioning, energy, the network, or anything at more than one pad. Their model is deterministic over 15 minutes from an empty start; ours was run the same way for this check only.
- **Limits of the comparison:** Fig. 17's setting is not stated in the paper (read as 30 s approach/departure + 15 s taxi from its 20-operation ceiling) and its values were read by eye (+-1). Dependent taxi was represented by adding taxi time to the pad time.

## Engine change this needed (found while setting up the study)
Engine versions 1-3 never stopped a landing when every stand was taken; they only counted the overflow afterwards. So the air-taxi results NET1-NET3 assume parking never limits capacity. Version 4 (taxi/net4.js) makes a landing wait in the air for a free stand. Whether this changes the NET3 fleet and pad numbers is checked separately (planned/DIAGNOSES_2026-10-27.md).
