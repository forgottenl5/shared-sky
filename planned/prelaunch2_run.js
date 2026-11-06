'use strict';
// Runner for PRELAUNCH2_PREREG.md. node planned/prelaunch2_run.js <shard> <nshards> | checks
const fs = require('fs'), L = require('../lab/lab_engine.js');
const cfg = { half: 22000, zone: 6000, warm: 3600, meas: 7200 };
const base = { wingFixed: null, fleet: 'filed', check: true, cell: 30, tb: 5, vsep: 10, frac: 0.2, outages: 6, sub: 4 };
const H = { A0: { wing: [46, 91], aOut: 61, zip: 101, aIn: 105 }, R: { wing: [46, 91], aOut: 69, zip: 101, aIn: 122 }, A2: { wing: [46, 71], aOut: 81, zip: 101, aIn: 115 } };
function jobs() { const J = []; for (const arm of ['A0', 'R', 'A2']) { for (const d of [3, 4]) for (const seed of [19, 20, 21]) J.push({ kind: 'hold', arm, d, seed }); for (const seed of [22, 23, 24]) J.push({ kind: 'outage', arm, d: 3, seed }); } return J; }
function one(j) { const t = Date.now(), r = L.run(cfg, Object.assign({}, base, { d: j.d, seed: j.seed, heights: H[j.arm], contingency: j.kind }));
  return { kind: j.kind, arm: j.arm, d: j.d, seed: j.seed, events: r.contingencyEvents, cross_wide: r.cross_wide, cross_close: r.cross_close, delays: { checked: r.delays.checked, delayed: r.delays.delayed, total_s: r.delays.total_s }, wall_s: (Date.now() - t) / 1000 }; }
if (require.main !== module) { } else if (process.argv[2] === 'checks') { for (const arm of ['A0', 'A2']) { const r = one({ kind: 'hold', arm, d: 4, seed: 19 }); console.log('K1', arm, r.cross_wide, r.events, (arm === 'A0' ? r.cross_wide === 20 : r.cross_wide === 3) && r.events === 845 ? 'PASS' : 'FAIL'); } }
else { const k = +process.argv[2], n = +process.argv[3]; fs.mkdirSync('out/prelaunch2', { recursive: true }); for (const j of jobs().filter((_, i) => i % n === k)) { const r = one(j); fs.appendFileSync(`out/prelaunch2/runs_${k}.jsonl`, JSON.stringify(r) + '\n'); console.log(j.kind, j.arm, j.d, j.seed, r.cross_wide, r.events, r.wall_s); } }
module.exports = { jobs };
