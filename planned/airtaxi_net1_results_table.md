## Break-even access time E* (minutes of getting to and from the pad at which air = driving midpoint)

Base case (usable range 100 km, charging 3.2 km/min, r = 1.5), fleet 24 so queueing is negligible. Median over 10 seeds; T_air = request to landing-pad-clear.

| Route | T_air (min) | E* peak (08:00, 17:30) | E* noon | Air beats driving at peak with E = 20 / 40 / 60? |
|---|---|---|---|---|
| AFW-DFW | 11.1 | 32.1 (31.4 to 32.1) | 19.4 | yes / no / no |
| AFW-TOY | 15.5 | 44.5 (44.0 to 44.5) | 27.0 | yes / yes / no |
| DFW-TOY | 10.8 | 20.0 (19.6 to 20.0) | 12.7 | yes / no / no |
| DFW-49T | 11.0 | 27.6 (25.0 to 27.6) | 19.0 | yes / no / no |
| IAH-HOU | 14.1 | 30.3 (30.3 to 30.3) | 24.7 | yes / no / no |
| IAH-EFD | 15.9 | 31.0 (31.0 to 31.0) | 25.4 | yes / no / no |

## Aircraft needed (smallest fleet with >= 95 % served and median wait <= 10 min; median over 10 seeds, min-max; 99 = not reached at 24)

| Metro | Usable range (km) | Charging (km/min) | r = 0.5 | r = 1.5 | r = 3 |
|---|---|---|---|---|---|
| DFW | 60 | 1.5 | 8.0 (5-12) | 16.0 (16-99) | 99.0 (24-99) |
| DFW | 60 | 3.2 | 5.0 (4-6) | 10.0 (8-12) | 99.0 (20-99) |
| DFW | 100 | 1.5 | 5.0 (5-6) | 12.0 (10-16) | 99.0 (20-99) |
| DFW | 100 | 3.2 | 4.0 (4-5) | 8.0 (8-10) | 99.0 (16-99) |
| DFW | 150 | 1.5 | 5.0 (4-5) | 10.0 (10-16) | 61.5 (20-99) |
| DFW | 150 | 3.2 | 4.0 (3-5) | 8.0 (8-10) | 99.0 (16-99) |
| HOU | 60 | 1.5 | 9.0 (4-24) | 11.0 (10-20) | 99.0 (20-99) |
| HOU | 60 | 3.2 | 4.0 (2-24) | 6.0 (6-12) | 12.0 (10-99) |
| HOU | 100 | 1.5 | 4.0 (3-24) | 8.0 (8-12) | 16.0 (12-24) |
| HOU | 100 | 3.2 | 3.0 (2-4) | 6.0 (5-8) | 10.0 (8-20) |
| HOU | 150 | 1.5 | 3.0 (3-4) | 7.0 (6-8) | 12.0 (12-20) |
| HOU | 150 | 3.2 | 3.0 (2-4) | 5.0 (4-6) | 10.0 (8-20) |

## Sensitivity: cruise speed (peak E*, minutes)

| Route | 55 m/s (123 mph) | 67 m/s (150 mph, base) | 89 m/s (200 mph) |
|---|---|---|---|
| AFW-DFW | 31.0 | 32.1 | 33.2 |
| AFW-TOY | 42.5 | 44.5 | 46.6 |
| DFW-TOY | 19.0 | 20.0 | 21.0 |
| DFW-49T | 26.6 | 27.6 | 28.6 |
| IAH-HOU | 28.7 | 30.3 | 32.1 |
| IAH-EFD | 29.0 | 31.0 | 33.3 |
