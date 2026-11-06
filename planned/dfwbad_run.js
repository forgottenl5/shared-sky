'use strict';
// Runner for DFWBAD_PREREG.md. node planned/dfwbad_run.js checks | <shard> <n>
const fs = require('fs'), L = require('../lab/lab_engine.js');
const cfg = { half: 22000, zone: 6000, warm: 3600, meas: 7200 };
const MIX = { ratio: { wing: 1, zipline: 1, amazon: 6 / 75 }, rateMul: { zipline: 400 / 950 } };
const base = { wingFixed: null, fleet: 'filed', check: true, cell: 30, tb: 5, vsep: 10, frac: 0.2, outages: 6, sub: 4 };
const H = { A0: { wing: [46, 91], aOut: 61, zip: 101, aIn: 105 }, R: { wing: [46, 91], aOut: 69, zip: 101, aIn: 122 }, A2: { wing: [46, 71], aOut: 81, zip: 101, aIn: 115 } };
function jobs() { const J = [];
  for (const arm of ['A0', 'R', 'A2']) { for (const d of [3, 4]) for (const seed of [19, 20, 21]) J.push({ kind: 'hold', arm, d, seed }); for (const seed of [22, 23, 24]) J.push({ kind: 'outage', arm, d: 3, seed }); }
  for (const arm of ['A2', 'R']) for (const kind of ['rth-120', 'rth-own']) for (const d of [3, 4]) for (const seed of [19, 20, 21]) J.push({ kind, arm, d, seed }); return J; }
function one(j, mix) { const t = Date.now(), r = L.run(cfg, Object.assign({}, base, mix === false ? {} : MIX, { d: j.d, seed: j.seed, heights: H[j.arm], contingency: j.kind }));
  return { kind: j.kind, arm: j.arm, d: j.d, seed: j.seed, events: r.contingencyEvents, cross_wide: r.cross_wide, cross_close: r.cross_close, flights: r.flightsMeasured, wall_s: (Date.now() - t) / 1000 }; }
if (process.argv[2] === 'checks') { const a = one({ kind: 'hold', arm: 'A0', d: 3, seed: 19 }), f = a.flights, rel = Math.abs(f.wing - f.zipline) / Math.max(f.wing, f.zipline);
  console.log('K1', JSON.stringify(f), (100 * rel).toFixed(0) + ' %', rel <= 0.2 ? 'PASS' : 'FAIL');
  const b = one({ kind: 'hold', arm: 'A0', d: 4, seed: 19 }, false); console.log('K2', b.cross_wide, b.events, b.cross_wide === 20 && b.events === 845 ? 'PASS' : 'FAIL'); }
else { const k = +process.argv[2], n = +process.argv[3]; fs.mkdirSync('out/dfwbad', { recursive: true });
  for (const j of jobs().filter((_, i) => i % n === k)) { const r = one(j); fs.appendFileSync(`out/dfwbad/runs_${k}.jsonl`, JSON.stringify(r) + '\n'); console.log(j.kind, j.arm, j.d, j.seed, r.cross_wide, r.events, r.wall_s); } }
module.exports = { jobs };
