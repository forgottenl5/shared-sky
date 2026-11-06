Raw run outputs for AIRTAXI_ROUTE1 and RECOUNT1 (the analysis scripts read these).
Copied from out/ (git-ignored) on 29 Oct 2026 so the numbers in the results files can be re-derived without re-running (RECOUNT1 takes about 12 minutes).
- airtaxi_noisewind1_0..3.json: AIRTAXI_NOISEWIND1 raw rows (60 runs).
- airtaxi_noise2_0..1.json: AIRTAXI_NOISE2 raw rows (90 runs), regenerated 29 Oct 2026 after an output-path slip; the analysis reproduces the committed results table exactly.
- out_snapshot.tar.xz: snapshot of the whole out/ folder (all studies' raw outputs) taken 30 Oct 2026; tools/reproduce.py unpacks it in a clean copy.
- out_errors1.tar.xz: raw output of ERRORS1 (276 runs, out/errors1/*.jsonl), taken 3 Nov 2026; tools/reproduce.py unpacks it with the snapshot above.
- out_risk1.tar.xz: raw output of RISK1 (40 encounter lists, out/risk1/*.jsonl), taken 4 Nov 2026.
- out_errors2.tar.xz: raw output of ERRORS2 (236 runs, out/errors2/*.jsonl), taken 4 Nov 2026.
- out_risk2.tar.xz: raw output of RISK2 (80 encounter lists with plan check, out/risk2/*.jsonl), taken 5 Nov 2026.
- out_errors3.tar.xz: raw output of ERRORS3 (80 encounter lists, out/errors3/*.jsonl), taken 5 Nov 2026.
- out_wx2.tar.xz: raw output of WX2 (72 runs, out/wx2/*.jsonl; also read by DEMAND1), taken 5 Nov 2026.
- out_heli1.tar.xz: 14 days of helicopter tracks (adsb.lol, ODbL) filtered to rotorcraft in the Houston and DFW boxes, aircraft identifiers replaced by running numbers (out/heli1/tracks), taken 5 Nov 2026.
