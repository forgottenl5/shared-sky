'use strict';
// Runner for RTHREP_PREREG.md. node planned/rthrep_run.js checks | <shard> <n>
const fs = require('fs'), L = require('../lab/lab_engine.js');
const cfg = { half: 22000, zone: 6000, warm: 3600, meas: 7200 }, R = { wing: [46, 91], aOut: 69, zip: 101, aIn: 122 };
const base = { wingFixed: null, fleet: 'filed', check: true, cell: 30, tb: 5, vsep: 10, frac: 0.2, sub: 4, heights: R };
if (process.argv[2] === 'checks') { const a = L.run(cfg, Object.assign({}, base, { d: 4, seed: 19, contingency: 'rth-120', frac: 0 })), b = L.run(cfg, Object.assign({}, base, { d: 4, seed: 19, contingency: 'none' }));
  console.log('K1', a.cross_wide, a.cross_close, a.contingencyEvents, 'vs', b.cross_wide, b.cross_close, a.cross_wide === b.cross_wide && a.cross_close === b.cross_close ? 'PASS' : 'FAIL'); }
else { const k = +process.argv[2], n = +process.argv[3], J = []; for (const c of ['rth-120', 'rth-own']) for (const d of [3, 4]) for (const seed of [19, 20, 21]) J.push({ c, d, seed });
  fs.mkdirSync('out/rthrep', { recursive: true }); for (const j of J.filter((_, i) => i % n === k)) { const r = L.run(cfg, Object.assign({}, base, { d: j.d, seed: j.seed, contingency: j.c }));
    const o = { arm: j.c, d: j.d, seed: j.seed, events: r.contingencyEvents, cross_wide: r.cross_wide, cross_close: r.cross_close }; fs.appendFileSync(`out/rthrep/runs_${k}.jsonl`, JSON.stringify(o) + '\n'); console.log(JSON.stringify(o)); } }
