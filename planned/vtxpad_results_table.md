## Drone flights passing per hour (median over 10 seeds; range)
| Point | Stage | within 1 km | within 300 m | drones inside 1 km at a random moment | Wing / Zipline / Amazon share at 1 km |
|---|---|---|---|---|---|
| TOY | early | 2.8 (0.0–18.0) | 0.5 (0.0–6.0) | 0.07 | 17 / 83 / 0 % |
| TOY | mid | 7.5 (1.0–25.0) | 1.8 (0.0–7.5) | 0.18 | 27 / 73 / 0 % |
| TOY | full | 18.8 (7.0–50.5) | 6.2 (2.0–22.0) | 0.42 | 14 / 86 / 0 % |
| AFW | early | 1.2 (0.0–6.0) | 0.8 (0.0–2.0) | 0.04 | 87 / 13 / 0 % |
| AFW | mid | 4.8 (1.0–20.5) | 1.5 (0.0–6.0) | 0.13 | 38 / 62 / 0 % |
| AFW | full | 27.8 (19.0–44.0) | 7.0 (6.5–13.5) | 0.72 | 20 / 29 / 51 % |
| DFW | early | 1.8 (0.0–5.0) | 0.5 (0.0–1.5) | 0.05 | 17 / 83 / 0 % |
| DFW | mid | 4.8 (0.5–14.5) | 0.8 (0.5–3.5) | 0.11 | 20 / 80 / 0 % |
| DFW | full | 20.0 (3.5–33.0) | 6.2 (2.0–14.0) | 0.46 | 26 / 74 / 0 % |

TOY position sensitivity (full, 1 km, medians at 8 points 500 m away): 16.2–22.0 (centre 18.8)

| Prediction | Result | Verdict |
|---|---|---|
| V1 TOY full 1 km median 5–40 an hour | 18.8 | **PASS** |
| V2 TOY full 300 m median 1–12 | 6.2 | **PASS** |
| V3 Amazon passes at TOY 0 everywhere | max 0 | **PASS** |
| V4 early <= 25 % of full (TOY 1 km) | 15 % | **PASS** |
Runs read: 30 (expected 30).
