'use strict';
// Runner for PRELAUNCH_PREREG.md. Usage: node planned/prelaunch_run.js <shard> <nshards>   (writes out/prelaunch/runs_<shard>.jsonl)
// Also: node planned/prelaunch_run.js checks   (feature checks K1–K3)
const fs = require('fs'), L = require('../lab/lab_engine.js');
const cfg = { half: 22000, zone: 6000, warm: 3600, meas: 7200 };
const base = { wingFixed: null, fleet: 'filed', check: false, cell: 30, tb: 5, vsep: 10, contingency: 'none', frac: 0.2, sub: 4 };
const B = (o, i) => ({ wing: [46, 91], aOut: o, zip: 101, aIn: i }), A2 = { wing: [46, 71], aOut: 81, zip: 101, aIn: 115 };
function jobs() { const J = [];
  for (const d of [3, 4]) for (const seed of [1, 2, 3]) { J.push({ study: 'S1', arm: 'A2', d, seed, heights: A2 });
    for (const o of [61, 69]) for (const i of [105, 111, 115, 122]) J.push({ study: 'S1', arm: `B${o}_${i}`, d, seed, heights: B(o, i) }); }
  for (const d of [3, 4]) for (const seed of [1, 2, 3]) for (const zsig of [3, 5]) { J.push({ study: 'S2', arm: 'A0', d, seed, zsig, heights: B(61, 105) }); J.push({ study: 'S2', arm: 'A2', d, seed, zsig, heights: A2 }); }
  for (const d of [4, 6]) for (let seed = 1; seed <= 30; seed++) for (const [arm, h] of [['A0', B(61, 105)], ['A2', A2]]) J.push({ study: 'S3a', arm, d, seed, heights: h });
  for (let seed = 4; seed <= 15; seed++) for (const [arm, h] of [['A0', B(61, 105)], ['A2', A2]]) J.push({ study: 'S3a', arm, d: 3, seed, heights: h });
  for (const n of [5, 40]) for (const r of [2000, 5000]) for (const seed of [1, 2, 3]) for (const [arm, h] of [['A0', B(61, 105)], ['A2', A2]]) J.push({ study: 'S3b', arm, d: 3, seed, boxes: { n, r }, heights: h });
  return J; }
function one(j) { const t = Date.now(), r = L.run(cfg, Object.assign({}, base, { d: j.d, seed: j.seed, heights: j.heights, zsig: j.zsig || 0, boxes: j.boxes }));
  return { study: j.study, arm: j.arm, d: j.d, seed: j.seed, zsig: j.zsig || 0, boxes: j.boxes || null, cross_wide: r.cross_wide, cross_close: r.cross_close, same_wide: r.same_wide, pairs: r.pairs, wall_s: (Date.now() - t) / 1000 }; }
if (require.main !== module) { /* imported for jobs() */ } else if (process.argv[2] === 'checks') {
  const run = (h, extra) => L.run(cfg, Object.assign({}, base, { d: 4, seed: 1, heights: h }, extra || {}));
  const a0 = run(B(61, 105)), a2 = run(A2); console.log('K1', a0.cross_wide, a0.cross_close, a2.cross_wide, a2.cross_close, (a0.cross_wide === 85 && a0.cross_close === 39 && a2.cross_wide === 17 && a2.cross_close === 4) ? 'PASS' : 'FAIL');
  const z0 = run(B(61, 105), { zsig: 0 }); console.log('K2a', z0.cross_wide, z0.cross_close, (z0.cross_wide === 85 && z0.cross_close === 39) ? 'PASS' : 'FAIL');
  const S = L.sites(cfg, 4, 1), fl = L.flights(cfg, S, 1, B(61, 105)), g = id => { const q = L.rng(1 * 7919 + id * 31 + 17), u = Math.max(1e-12, q()), v = q(); return 3 * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
  const zs = fl.map(f => g(f.id)), m = zs.reduce((a, b) => a + b, 0) / zs.length, sd = Math.sqrt(zs.reduce((a, b) => a + (b - m) ** 2, 0) / zs.length);
  console.log('K2b mean', m.toFixed(3), 'sd', sd.toFixed(3), (Math.abs(m) <= 0.1 && Math.abs(sd - 3) / 3 <= 0.05) ? 'PASS' : 'FAIL');
  const b20 = run(B(61, 105), { boxes: { n: 20, r: 5000 } }); console.log('K3a', b20.cross_wide, b20.cross_close, (b20.cross_wide === 85 && b20.cross_close === 39) ? 'PASS' : 'FAIL');
  const fb = L.flights(cfg, S, 1, B(61, 105), { boxes: { n: 5, r: 2000 } }), byDock = new Map(); let far = 0;
  for (const f of fb) if (f.op === 'zipline') { const d0 = [f.sg[0][2], f.sg[0][3]], bx = [f.sg[1][5], f.sg[1][6]]; if (Math.hypot(bx[0] - d0[0], bx[1] - d0[1]) > 2000 + 30) far++; const k = S.findIndex(s => s.op === 'zipline' && Math.hypot(s.c[0] - d0[0], s.c[1] - d0[1]) < 40); if (!byDock.has(k)) byDock.set(k, new Set()); byDock.get(k).add(Math.round(bx[0]) + ',' + Math.round(bx[1])); }
  const maxBoxes = Math.max(...[...byDock.values()].map(s => s.size)); console.log('K3b boxes beyond 2 km:', far, 'max distinct boxes per dock:', maxBoxes, (far === 0 && maxBoxes <= 5) ? 'PASS' : 'FAIL');
} else { const k = +process.argv[2], n = +process.argv[3], J = jobs().filter((_, i) => i % n === k); fs.mkdirSync('out/prelaunch', { recursive: true });
  const outF = `out/prelaunch/runs_${k}.jsonl`, done = new Set(fs.existsSync(outF) ? fs.readFileSync(outF, 'utf8').trim().split('\n').filter(Boolean).map(l => { const o = JSON.parse(l); return [o.study, o.arm, o.d, o.seed, o.zsig, JSON.stringify(o.boxes)].join('|'); }) : []);
  console.log('shard', k, 'jobs', J.length, 'already done', done.size);
  for (const j of J) { const key = [j.study, j.arm, j.d, j.seed, j.zsig || 0, JSON.stringify(j.boxes || null)].join('|'); if (done.has(key)) continue; const r = one(j); fs.appendFileSync(outF, JSON.stringify(r) + '\n'); console.log(key, r.cross_wide, r.cross_close, r.wall_s + 's'); } }
module.exports = { jobs };
