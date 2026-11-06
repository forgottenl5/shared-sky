| Test | Arm | runs | events | close calls (wide) | per 100 events | very close |
|---|---|---|---|---|---|---|
| hold | A0 | 6 | 3841 | 122 | 3.18 | 51 |
| hold | R | 6 | 3841 | 22 | 0.57 | 9 |
| hold | A2 | 6 | 3839 | 16 | 0.42 | 2 |
| outage | A0 | 3 | 360 | 47 | 13.06 | 16 |
| outage | R | 3 | 361 | 3 | 0.83 | 1 |
| outage | A2 | 3 | 362 | 2 | 0.55 | 0 |
| rth-120 | A2 | 6 | 3839 | 65 | 1.69 | 15 |
| rth-120 | R | 6 | 3841 | 62 | 1.61 | 14 |
| rth-own | A2 | 6 | 3839 | 11 | 0.29 | 3 |
| rth-own | R | 6 | 3841 | 8 | 0.21 | 4 |

Hover R vs A2: 1.4× [0.7–2.8]

| Prediction | Result [95 %] | Verdict |
|---|---|---|
| B1 hover A0 vs A2 >= 4× [Houston 9.4×] | 7.6× [4.5–13.8] | **PASS** |
| B2 hover A0 vs R >= 3× [6.8×] | 5.5× [3.5–9.2] | **PASS** |
| B3 return home A2: 120 m vs own >= 5× [10.7×] | 5.9× [3.1–12.4] | **PASS** |
| B4 return home R: 120 m vs own >= 4× [8.6×] | 7.8× [3.7–18.7] | **PASS** |
| B5 area hold A0 vs A2 >= 3× [7.0×] | 23.6× [6.2–200.8] | **PASS** |
| B6 hover A0 per 100 below 3.93 | 3.18 | **PASS** |

Runs read: 51 (expected 51).
