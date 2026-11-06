'use strict';
// Runner for CENSUS_PREREG.md. node planned/census_run.js checks | <shard> <n>
const fs = require('fs'), L = require('../lab/lab_engine.js'), HR = require('./houreal.js'), CE = require('./census.js');
const cfg = { half: 34000 + 17000, zone: 34000, warm: 3600, meas: 7200 };
const H = { A0: { wing: [46, 91], aOut: 61, zip: 101, aIn: 105 }, T: { wing: [46, 91], aOut: [55, 115], zip: 101, aIn: [55, 115] }, R: { wing: [46, 91], aOut: 69, zip: 101, aIn: 122 }, A2: { wing: [46, 71], aOut: 81, zip: 101, aIn: 115 } };
function one(arm, mode, seed) { let S = HR.sites(cfg, seed); const M = mode === 'U' ? null : CE.make(S, HR.toXY, mode, HR.lat0, HR.lon0);
  const dropped = M ? S.filter(M.dropSite).map(s => s.op) : []; if (M) S = S.filter(s => !M.dropSite(s));
  const dist = {}, nd = {}, cust = M ? (s, r) => { const p = M.cust(s, r); dist[s.op] = (dist[s.op] || 0) + Math.hypot(p[0] - s.c[0], p[1] - s.c[1]); nd[s.op] = (nd[s.op] || 0) + 1; return p; } : null;
  const fl = L.flights(cfg, S, seed, H[arm], M ? { cust } : undefined), c = L.count(cfg, fl, { sub: 4 }), pairs = {};
  for (const k in c) { const m = k.match(/^wide\|pair\|(.+)$/); if (m && m[1].split('-')[0] !== m[1].split('-')[1]) pairs[m[1]] = c[k]; }
  const meanDist = {}; for (const op in dist) meanDist[op] = Math.round(dist[op] / nd[op]);
  return { arm, mode, seed, cross_wide: c['wide|cross'] || 0, cross_close: c['close|cross'] || 0, pairs, flights: fl.length, meanDist, dropped, stats: M ? M.stats : null }; }
if (process.argv[2] === 'checks') { const S = HR.sites(cfg, 1), am = S.filter(s => s.op === 'amazon');
  const u = one('A0', 'U', 1), a = u.cross_wide === 89 && u.cross_close === 30 && u.flights === 19426; console.log('K1a uniform reproduces HOUREAL A0 s1', u.cross_wide, u.cross_close, u.flights, a);
  const P = CE.make(S, HR.toXY, 'P', HR.lat0, HR.lon0), r = L.rng(99); let b = true; for (const s of am) for (let i = 0; i < 10000; i++) { const p = P.cust(s, r), d = Math.hypot(p[0] - s.c[0], p[1] - s.c[1]); if (d < 300 || d > 12070) b = false; }
  console.log('K1b P draws within radius', b, 'fallbacks', P.stats.fallback);
  const BG = CE.loadBG(HR.toXY); let c = true; for (const s of am) { const want = BG.filter(g => Math.hypot(g.c[0] - s.c[0], g.c[1] - s.c[1]) <= 12070 + CE.SIG).reduce((t, g) => t + g.pop, 0);
    const P2 = CE.make([s], HR.toXY, 'P', HR.lat0, HR.lon0); console.log('  ', s.code, 'population within radius+400 m', want); if (want <= 0) c = false; }
  console.log('K1c population sums positive and computed from CSV', c);
  const PA = CE.make(S, HR.toXY, 'PA', HR.lat0, HR.lon0), Z = CE.loadZero(HR.lat0, HR.lon0), r3 = L.rng(7); let d = true;
  for (const s of am) { if (PA.dropSite(s)) { console.log('  ', s.code, 'stands in a 0 ft square: dropped'); continue; } for (let i = 0; i < 2000; i++) { const p = PA.cust(s, r3); if (CE.crossesZero(Z.zeroAt, s.c, p)) { d = false; } } }
  console.log('K1d PA accepted routes avoid 0 ft squares', d, 'zero cells', Z.n, 'stats', JSON.stringify(PA.stats), 'fallbacks may cross');
  console.log(a && b && c && d ? 'K1 PASS' : 'K1 FAIL'); }
else { const k = +process.argv[2], m = +process.argv[3], J = []; for (const mode of ['P', 'PA']) for (const arm of ['A0', 'T', 'R', 'A2']) for (const seed of [1, 2, 3]) J.push([arm, mode, seed]);
  fs.mkdirSync('out/census', { recursive: true }); for (const [arm, mode, seed] of J.filter((_, i) => i % m === k)) { const t = Date.now(), r = one(arm, mode, seed); r.wall_s = (Date.now() - t) / 1000; fs.appendFileSync(`out/census/runs_${k}.jsonl`, JSON.stringify(r) + '\n'); console.log(arm, mode, seed, r.cross_wide, r.wall_s); } }
