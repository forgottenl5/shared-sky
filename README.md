# Shared Sky

*Formerly Sky-Grid (renamed 5 Nov 2026: "SkyGrid" is the name of an unrelated airspace-management company). Dated records written before the rename, including the fingerprinted registrations, keep the old name, because editing them would break their fingerprints.*

A simulation of Wing, Zipline and Amazon delivery drones sharing the sky over Houston and Dallas–Fort Worth, built from the companies' FAA environmental filings. It flies their planned operations together **with no coordination between the companies**, counts **planned conflicts** (two companies' planned paths within 30 m sideways and less than 10 m in height at the same moment), and tests simple fixes: sharing out heights inside each company's filed band, a pre-flight plan check, landing pads.

Real operators already share flight plans before take-off (ASTM F3548; in DFW, Wing and Flytrex report thousands of coordinated flights with no plan conflicts). So the "no coordination" baseline is a reference point for how much each fix removes, not a picture of today's risk.

**Live pages:** `docs/` (GitHub Pages): `index.html`, `houston.html`, `dfw.html`, `lab.html` (run your own scenario in the browser).

## Main results
- **Sharing out heights cuts planned conflicts by 72 % in Houston (95 % interval 67–76 %) and 73 % in DFW (66–80 %)**, with Amazon at its best-sourced heights, on the real filed layouts (Amazon's geocoded sites; Wing and Zipline placed at random), 10 runs each (`planned/HEADLINE2_RESULTS_2026-10-25.md`).
- **Two things decide that number.**
  - *Amazon's return height* is not public. FAA filings give a typical return of 345 ft. One secondhand homeowners' association summary quotes Amazon staff saying "400 ft". If 400 ft is true, the cut is 29 % (Houston) or 35 % (DFW).
  - *How much room companies need.* The shared-out layers are 10–20 m apart. If 15 m between companies were required, the cut would be 55 % (Houston) or 45 % (DFW); at 20 m, 67 % and 60 % (stricter rules count more conflicts in every arm).
- **Today versus build-out.** With only the sites flying in Houston today, the plans almost never meet. Planned conflicts grow roughly with the square of traffic (a property of any model without avoidance): about 0.5 an hour early in the build-out, 6 mid, 36 at the full filed build-out (DFW: 0.5 / 3 / 25). Most involve Amazon and Zipline.
- **Amazon at its reported volume** (about 200 flights a day in Richardson, 20 % of its filed cap): full build-out conflicts fall about two thirds; Amazon is still about 80 % of what remains.
- **Plan check.** A deliberately minimal check (±5 s, no wind allowance) removes planned conflicts in still air but not in wind; booking ±30 s fixes most of it. Real coordination systems size their reservations to timing uncertainty, so this is a statement about the minimal check, not about real systems.
- **Stress tests** (far above any real failure rate): sending every drone home at its own company's height beats one common height by 6–11×; note that the common height tested (120 m) sits 5 m from Amazon's allocated return, and no operator proposes a common height.
- **Air taxis near drone routes:** no public routes. A narrow check puts about 19 drones an hour (7–51 over layouts) within 1 km of Toyota's Plano HQ at full DFW build-out.
- **Air-taxi networks (separate model, `taxi/`):** small networks on the DFW and Houston sites Joby, Archer and Wisk have flown or named. Flying beats Google's typical peak-hour drive if getting to and from the pads takes less than 20 min (DFW Airport–Toyota) to 44 min (Alliance–Toyota) in total. About 8 aircraft serve 12 trips an hour in DFW and 5 serve 6 an hour in Houston. Two pads per site cope up to about 30 take-offs and landings an hour. Demand, pads and range are assumptions (`planned/AIRTAXI_NET1_*`, `planned/AIRTAXI_NET2_*`). Noise (`planned/AIRTAXI_NOISE1_*`, from Joby's reported levels): heard at 55 dBA or more only within about 2.4 km of a site; no point more than 300 m from a site comes near FAA DNL 65 (highest 54 dB); about 15 loud flights an hour 1 km out from DFW Airport at 48 trips an hour. 3D page with a noise layer: `docs/airtaxi.html`.

## Glossary
- **Planned conflict:** planned paths of two different companies within 30 m horizontally and less than 10 m vertically at the same moment (checked 4 times a second). **Tight conflict:** within 15 m and 5 m. Not a collision or a near-miss: the model has no avoidance and no coordination.
- **Omaha profile:** Amazon at 61 m out and 105 m back, the profile in the FAA's Omaha noise analysis (typical 200 ft out / 345 ft back).
- **Best-sourced heights:** Amazon at 69 m out (225 ft, its stated Richardson average) and back anywhere in its filed 85–115 m band.
- **High-return case:** Amazon at 69 m out and 122 m (400 ft) back; source is a secondhand staff remark only.
- **Shared out:** Wing 46–71 m, Amazon 81 m out and 115 m back, Zipline 101 m, all inside each company's filed band.
- **Build-out:** sites opening from today's few to the full counts in the FAA filings (Houston: 75 Wing, 65 Zipline, 6 Amazon).
- **Cap:** the filed maximum flights per site per day. Filed caps on overlapping service areas are **not** applied, so busy overlap areas fly above them.

## How results are kept honest
Every study is written down and fingerprinted (sha256) **before** its code or runs (`planned/*_PREREG.md`), the runner and analysis are committed before the runs, failed predictions are reported as failures, and corrections are appended to each registration's deviation log. Check the fingerprints with `python3 planned/verify_prereg.py` (see `VERIFY.md` for the convention and its limits). `planned/SKYGRID_MASTER_PLAN.md` lists every study; `planned/REVIEW_*` and `planned/PAGEAUDIT_*` record outside and internal reviews.

## Reproducing
- Node.js 22 for the engine and runners (no npm packages); Python 3 with `requirements.txt` for analyses.
- Each runner has a fast check: `node planned/<study>_run.js checks`. Runs: `node planned/<study>_run.js <shard> <n>`; outputs go to `out/` (not committed); then `python3 planned/<study>_analyze.py`.
- Build the site: `node planned/export_city.js out/hou.json` and `METRO=dfw node planned/export_city.js out/dfw.json` (about 4 minutes each), then `city/build_site.sh out/hou.json out/dfw.json`. This reproduces `docs/` byte for byte.

## Layout
- `lab/lab_engine.js`: the planned-operations engine (flights, plan check, planned-conflict counter).
- `planned/`: study registrations, runners, analyses and results (from 22 Oct 2026).
- `taxi/`: the air-taxi network engine (`net2.js`; `net.js` is the frozen v1 used by AIRTAXI_NET1), its checks, drive-time data and the 3D network page (`airtaxi.template.html`, `export_airtaxi.js`, `build_airtaxi.js`).
- `city/`: the 3D city pages (`city.template.html`, `build_city.js`, `build_site.sh`).
- `data/`: public input data (see `data/LICENSE.md`).
- `tests/test_cities.js`: per-city regression test. This public copy leaves out an earlier engine and its studies (20–22 Oct 2026, not on the scorecard), working notes (plans, reviews, audits) and hand-read Google Maps drive times (see `taxi/data/DRIVE_TIMES_WITHHELD.md`). Three registrations have a private resident's street redacted (`planned/REDACTED.txt`).

## Known limits
Straight-line routes; customers uniform within service areas (Census weighting tested); demand spread evenly over the day (no peaks); no navigation error (height error of 3 m / 5 m tested); Wing autoloaders not modelled; Amazon's day is 16.5 h rather than the Texas EA's 15 h; Wing and Zipline site positions random; overlap caps not applied; Flytrex and other DFW operators not modelled.

## Data and credits
FAA environmental assessments (Wing, Zipline, Amazon); FAA UAS facility maps; US Census Bureau 2020 centres of population; [Open-Meteo](https://open-meteo.com/) historical weather (CC BY 4.0); © OpenStreetMap contributors (ODbL) for buildings and store locations; TU Delft BlueSky (cross-check).

## Not
Not affiliated with, endorsed by or reviewed by Wing, Zipline, Amazon or the FAA. Not flight data, a forecast or safety advice.

## Licence
Not yet chosen (until one is, all rights are reserved by default). Data in `data/` keeps its own licences.
