'use strict';
// Runner for DFWPROC_PREREG.md. node planned/dfwproc_run.js checks | <shard> <n>
const fs = require('fs'), L = require('../lab/lab_engine.js');
const cfg = { half: 22000, zone: 6000, warm: 3600, meas: 7200 };
const MIX = { ratio: { wing: 1, zipline: 1, amazon: 6 / 75 }, rateMul: { zipline: 400 / 950 } };
const base = Object.assign({ wingFixed: null, fleet: 'filed', cell: 30, tb: 5, vsep: 10, frac: 0.2, sub: 4, contingency: 'none' }, MIX);
const H = { A0: L.HEIGHTS.filed, R: L.HEIGHTS.reported, A2: L.HEIGHTS.allocation };
function jobs() { const J = [];
  for (const arm of ['A0', 'R', 'A2']) for (const d of [3, 4]) for (const seed of [19, 20, 21]) J.push({ part: 'A', arm, d, seed });
  for (const arm of ['A0', 'A2']) for (const d of [2, 3, 4]) for (const seed of [1, 2, 3]) J.push({ part: 'B', arm, d, seed }); return J; }
function one(j) { const t = Date.now(), r = L.run(cfg, Object.assign({}, base, { d: j.d, seed: j.seed, heights: H[j.arm], check: j.part === 'A' }));
  return { part: j.part, arm: j.arm, d: j.d, seed: j.seed, cross_wide: r.cross_wide, cross_close: r.cross_close, delays: r.delays, flights: r.flightsMeasured, wall_s: (Date.now() - t) / 1000 }; }
if (process.argv[2] === 'checks') { const a = one({ part: 'A', arm: 'A2', d: 4, seed: 19 }), b = one({ part: 'A', arm: 'A2', d: 4, seed: 19 }), D = a.delays;
  console.log('K1', JSON.stringify(D.byOp), JSON.stringify(a.delays) === JSON.stringify(b.delays) && D.checked === Object.values(D.byOp).reduce((s, x) => s + x.n, 0) ? 'PASS' : 'FAIL');
  const c = one({ part: 'B', arm: 'A0', d: 3, seed: 1 }); console.log('K2 (expected 77, corrected from 72 in the PREREG deviation log before the runs; constant updated 25 Oct for reproducers)', c.cross_wide, c.cross_wide === 77 ? 'PASS' : 'FAIL'); }
else { const k = +process.argv[2], n = +process.argv[3]; fs.mkdirSync('out/dfwproc', { recursive: true });
  for (const j of jobs().filter((_, i) => i % n === k)) { const r = one(j); fs.appendFileSync(`out/dfwproc/runs_${k}.jsonl`, JSON.stringify(r) + '\n'); console.log(j.part, j.arm, j.d, j.seed, r.cross_wide, r.wall_s); } }
