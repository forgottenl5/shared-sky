# Adding a city

A city is a data file, `cities/<name>.json`, loaded by `lab/city.js`. Studies are short JSON specs run by `lab/study.js`. Houston and Dallas–Fort Worth are the two cities so far; their files reproduce the original layouts exactly (`node lab/city.js check`, `node tests/test_cities.js`).

## 1. Gather the data (by hand, with sources)

| What | Where it came from for Houston and DFW | Notes |
|---|---|---|
| Fixed sites (code, latitude, longitude, how located) | Amazon's final Texas environmental assessment (EA) addresses, geocoded with OpenStreetMap Nominatim | Write down sites that could not be located (`fixed.excluded`). |
| Sites placed at random, and how many | Wing nest and Zipline site caps from each company's FAA EA for that metro | Used when the real locations are not published. |
| Flight rates | The EAs (flights per site per day, operating hours); the engine defaults are in `lab/lab_engine.js` (`OP`) | A city-specific rate goes in `random[].rate` as `{perDay, hours}`. |
| Heights and speeds | Each company's filed heights (`H` in the runners; HEADLINE2 layouts) | Heights are per study, not per city. |
| Counted square | Chosen so every fixed site is inside with a margin | `cfg.zone` (half-size, m); `cfg.half` = zone + 17 km for flights that start outside. |
| Hourly wind for one year | Open-Meteo historical archive, 2025, one grid cell (`data/openmeteo_<city>_2025.json`) | Needs `wind_speed_*` and `wind_direction_*` fields at 10/80/120/180 m, 8,760 rows. |
| Weather (rain, gusts) | Open-Meteo, same cell (`data/openmeteo_<city>_2025_weather.json`) | Used by WX1, WX2. |
| Buildings for the 3D page (optional) | OpenStreetMap extract of downtown (`city/osm_buildings.js`) | ODbL; attribution kept in the file. |

Verify every number against its primary source and record the source in the file's `source` field.

## 2. Write the city file

Copy `cities/houston.json` and edit it. Fields: `name`, `label`, `source`, `cfg {half, zone, warm, meas}`, `wind`, `fixed {op, sites, excluded}`, `random [{op, n, rate?}]`, `rngOffset`.

## 3. Check it

```
node tests/test_cities.js        # loads, sites inside the square, deterministic, wind file, a short count
```

## 4. Run a study

Add the city to a spec's `cities` list (see `lab/studies/errors1.json`) and run `node lab/study.js <spec.json> 0 1`. For a new study, pre-register it first (see `VERIFY.md`): write `planned/<NAME>_PREREG.md`, fingerprint it with `sha256sum`, commit the runner and analysis, then run.

## What is still specific to Houston and DFW

- **The city web pages.** `city/build_city.js` builds a page from a data export, a text-swap file and building data, but the export (`planned/export_city.js`) and the build script (`city/build_site.sh`) name Houston and DFW. A third city page needs a text file like `city/dfw_text.json` and an edit to both scripts.
- **The registered study runners in `planned/`** call the two cities directly through `planned/houreal.js` and `planned/dfwreal.js` (thin wrappers over the city files). They are left as registered. New studies should use `lab/study.js`.
- **Speed.** One 3-hour run takes 1-2 minutes on one CPU core (engine core: `lab/lab_engine.js`, `count()`); a study is usually tens to hundreds of runs. Runners shard across cores (`<shard> <n>`).
