# WX1: how much of the operating day does weather take away, and were our windy test hours flyable? (registration, 29 Oct 2026)

Status: descriptive study of real 2025 weather. Registered before the runner, analysis or any result was computed.

## Why
Every delivery study flies in clear air (calm, or the wind alone in WIND/COORD). No page says how often real weather would stop flights at all. No company publishes a numeric rain, gust or storm limit that I could find (Amazon says only that its MK30 can operate in "light rain", no number; aboutamazon.com MK30 page, read 29 Oct 2026). So this study does **not** assume a company's rule. It counts how many daytime hours exceed each of several thresholds, as a sweep, and checks whether the windy hours used as the realistic plan-sharing test (COORD1, SEEDS2) were dry.

## Data
- data/openmeteo_houston_2025_weather.json (29.7715, -95.3310) and data/openmeteo_dfw_2025_weather.json (32.794, -96.822): Open-Meteo archive, hourly 2025, GMT, precipitation (mm), WMO weather_code, wind_gusts_10m (km/h), cloud_cover_low (%). 8,760 rows each. Wind at height comes from the existing data/openmeteo_*_2025.json (same hours).
- Gust is at 10 m; drones fly at 60-120 m, so gust at height is probably higher. The sweep reports 10 m gusts as they are.
- Open-Meteo values are modelled reanalysis for a grid cell, not airport station observations.

## Definitions
- Daytime hours: as the existing wind studies (planned/wind.js): 13:00-03:00 UTC, about 7 a.m.-9 p.m. local; 15 hours x 365 = 5,475 hours.
- Wet: precipitation >= 0.1 mm in the hour. Rain >= 1 mm and heavy >= 2.5 mm likewise.
- Thunderstorm: WMO weather_code 95, 96 or 99.
- Gusty: gust >= 40 km/h (about 11 m/s); strong: >= 55 km/h (about 15 m/s). These are sweep points, not any company's limit.
- Hard-stop weather (a label for this study only): thunderstorm, or gust >= 55 km/h, or precipitation >= 2.5 mm in the hour.
- Windy test hours: the hours COORD1 and SEEDS2 used, `bandHours(0.85, 0.95, 10)` from planned/wind.js (first three are COORD1's).

## Disclosure about blindness
Before registering I looked at two DFW whole-year figures while checking the file: 938 hours with precipitation > 0 (all 8,760 hours) and a peak gust of 96.5 km/h. I had not looked at anything else, nor at any Houston statistic. Predictions touching those two figures are not blind (W1 for DFW is partly informed).

## Predictions (daytime hours, 2025)
- **W1:** share of daytime hours that are wet: Houston 8-16 %, DFW 6-12 %.
- **W2:** thunderstorm share: 0.3-2.5 % in both metros.
- **W3:** gusty (>= 40 km/h) share: 4-14 % in both metros.
- **W4:** hard-stop weather share: 1.5-7 % in both metros.
- **W5:** of the 10 windy test hours per metro, at most 3 are wet and none is a thunderstorm hour, in both metros.
- **W6:** the windy test hours (85th-95th percentile of 120 m wind) are gustier than the average daytime hour: their median 10 m gust is at least 1.5 times the daytime median, in both metros.

## Checks before the study runs (K)
- K1: both weather files have 8,760 rows, the same timestamps as the wind files, and no missing values in the four variables.
- K2: the daytime filter selects exactly 5,475 hours in each file.

## Deviation log
(none yet)
