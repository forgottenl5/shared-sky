# Licensing

- **Code** (all `.js`, `.py`, `.sh` and HTML templates written for this project): GNU Affero General Public License v3.0 or later, see `LICENSE`.
  If you run a modified version as a network service, the AGPL requires you to offer its source to the service's users.
- **Text, results, registrations, figures and the website's written content**: Creative Commons Attribution 4.0 International, see `LICENSE-TEXT`.
  Credit: "Shared Sky (github.com/forgottenl5/shared-sky)".
- **Third-party data and files keep their own licences**:
  - OpenStreetMap data (building footprints, site locations, `data/*_osm.json`, `city/osm_*.json`): © OpenStreetMap contributors, Open Database License (ODbL).
  - Open-Meteo historical weather (`data/openmeteo_*.json`): CC BY 4.0, open-meteo.com.
  - Helicopter tracks (`planned/raw/out_heli1.tar.xz`, `out/heli1/`): derived from the adsb.lol historical archive (github.com/adsblol), Open Database License (ODbL); aircraft identifiers replaced by running numbers.
  - US Census Bureau data (`data/CenPop2020_Mean_BG48.csv`, `data/census/`): public domain (US government work).
  - FAA UAS Facility Map data (`data/uasfm_houston.geojson`): US government work.
  - `vendor/`: three.js (MIT) and fonts (SIL Open Font License); their licence files are inside `vendor/`.
  - See `data/LICENSE.md` for the data notes kept with the project.
  - In this release, contact tags (email, phone, fax, contact:*) were removed from the raw OpenStreetMap downloads in `data/`; nothing in the project uses them.

Most of the code was written with an AI assistant. Whether and how far AI-assisted code is protected by copyright is unsettled
(US Copyright Office, Copyright and Artificial Intelligence, Part 2, January 2025); the licences above state how the project wants it used.

Release built from commit f77708c of the private working repository (history not included).
