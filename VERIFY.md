# Checking the study record

## Fingerprints
Each study in `planned/` has a registration (`*_PREREG.md`) and a sha256 fingerprint (`*_PREREG.md.sha256` or `*_PREREG.sha256`) taken when the registration was written, before its runner or any run.
Later notes (pre-study checks, deviations, corrections) are only ever **appended** to the registration's Deviation log, each labelled "(Appended after fingerprint …)". So a plain `sha256sum -c` fails on most files by design; the fingerprint covers the text above the appended log.

    python3 planned/verify_prereg.py

checks all of them that way (as of 29 Oct 2026: 70 of 70 pass). Any edit above the log would fail.

## What "independent review" means in this record
Wherever the record (22–27 Oct 2026) says "independent review", "independent reviewer" or names a reviewer role such as "industry engineer", it means an AI agent: a fresh session of the AI assistant used to build the project, given the files but no part in producing the work. No person outside the project has reviewed it yet. Registrations that use the old wording are fingerprinted and are not edited; this note applies to them.

## Order of work

> **Public release:** this copy was published without the private working repository's git history. The order-of-work statements below describe that private history and cannot be checked from this copy; the fingerprint checks (`python3 planned/verify_prereg.py`, `python3 tools/reproduce.py`) work here.
Git history shows each registration committed before its runner, and the runner and analysis before the results, with these exceptions:
- **VALLOC, VALLOC2 and ROBUST** (22 Oct) committed registration, code and results in one commit. Their order cannot be checked from git.
- **FLEET** (22 Oct): its analysis script was written after its runs (logged in its results file).
- Studies before 22 Oct 2026 (the earlier engine) are not in this public copy.
- Commit times are set by the author's machine. The record shows internal consistency, not independent timing. No external timestamp was used.

## Reproducing a result
1. Node.js 22 (no npm packages) for runners; Python 3 with `requirements.txt` for analyses.
2. Each runner has a fast pre-study check: e.g. `node planned/todayvol_run.js checks`.
3. Run shards: `node planned/<study>_run.js <shard> <n>` (e.g. `0 2` and `1 2` on two cores). Raw outputs go to `out/` (not committed). Run times: from seconds (lab studies) to about 2 minutes per run (metro layouts).
4. `python3 planned/<study>_analyze.py` prints the tables in the matching `*_RESULTS_*.md`.

## Reproduce everything in one command (added 30 Oct 2026)
`python3 tools/reproduce.py --rerun` builds a clean copy of the committed repo and checks, in order: every registration fingerprint; every one of the 67 analysis scripts re-run on the committed raw outputs (`planned/raw/out_snapshot.tar.xz`), with each results table byte-identical to the committed one; every scorecard entry in `lab/studies.json` against the pass/fail count read from its own results file (`tools/scorecard_map.json`, built by an independent record-by-record count); the totals on the built pages; two air-taxi studies (ROUTE1, VERTIPORT1) and one slice of RECOUNT1 re-run from scratch with byte-identical raw output, plus the shared-sky page data re-exported identically. Of the analyses, 44 write a results table that is compared with the committed one; the printed output of all 67 is compared with a snapshot the project took on 30 Oct 2026, which guards against later drift but does not prove the original runs. The 70 checked fingerprints are those in planned/; the older registrations at the repository root (20–22 Oct, earlier engine, not in the scorecard) are not checked. The last run's sheet is `planned/repro/REPORT.md`. It does not re-run every simulation (that takes many hours).
