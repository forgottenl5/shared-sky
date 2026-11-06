'use strict';
// Exploratory diagnosis of ROBUST R4 vs DFWPROC (planned/DIAGNOSES_2026-10-27.md): DFWPROC Part B setup on the current engine (4 checks/s),
// d = 3 km, no plan check, arms A0/A2, Amazon site share 4/75 (ROBUST's DFW mix) vs 6/75 (DFWPROC), seeds 1-10.  Usage: node planned/diag_robust_r4.js <shard> <n>
const fs = require('fs'), L = require('../lab/lab_engine.js');
const cfg = { half: 22000, zone: 6000, warm: 3600, meas: 7200 }, H = { A0: L.HEIGHTS.filed, A2: L.HEIGHTS.allocation };
const base = { wingFixed: null, fleet: 'filed', cell: 30, tb: 5, vsep: 10, frac: 0.2, sub: 4, contingency: 'none', rateMul: { zipline: 400 / 950 }, check: false, d: 3 };
const J = []; for (const am of [4, 6]) for (const arm of ['A0', 'A2']) for (let s = 1; s <= 10; s++) J.push([am, arm, s]);
const [k, n] = [+process.argv[2], +process.argv[3]];
for (const [am, arm, s] of J.filter((_, i) => i % n === k)) { const r = L.run(cfg, Object.assign({}, base, { ratio: { wing: 1, zipline: 1, amazon: am / 75 }, seed: s, heights: H[arm] }));
  fs.appendFileSync(`out/diag_r4_${k}.jsonl`, JSON.stringify({ amazonPer75: am, arm, seed: s, cross_wide: r.cross_wide }) + '\n'); }
