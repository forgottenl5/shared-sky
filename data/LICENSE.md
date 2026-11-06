# Data in this folder

| File | Source | Licence |
|---|---|---|
| `*_osm.json` (buildings, Walmart stores, downtown extracts) | © OpenStreetMap contributors, via the Overpass API | Open Database License (ODbL) 1.0: https://opendatacommons.org/licenses/odbl/ . These extracts remain under the ODbL; any database derived from them must be shared under the same licence. |
| `openmeteo_*_2025.json` | Open-Meteo historical weather API, https://open-meteo.com/ | CC BY 4.0 (attribution: Open-Meteo.com) |
| `CenPop2020_Mean_BG48.csv` | US Census Bureau, 2020 centers of population by block group | US government work, public domain |
| `uasfm_houston.geojson` | FAA UAS Facility Maps data service | US government work, public domain |

`vienna_inner_osm.json` is used only by the legacy engine tests (`tests/`), not by any Houston or DFW result.
The OSM extracts contain all tags returned by Overpass, including business contact details that OSM contributors entered; only geometry and height tags are used here.
