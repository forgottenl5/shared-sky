'use strict';
// CORR2 runner (registration planned/CORR2_PREREG.md). node planned/corr2_run.js checks | <shard> <n>   -> out/corr2/runs_<shard>.jsonl
const fs = require('fs'), L = require('../lab/lab_engine.js');
const MET = { houston: { R: require('./houreal.js'), cfg: { half: 34000 + 17000, zone: 34000, warm: 3600, meas: 7200 } }, dfw: { R: require('./dfwreal.js'), cfg: { half: 40000 + 17000, zone: 40000, warm: 3600, meas: 7200 } } };
const H = { S1: { wing: [46, 91], aOut: 69, zip: 101, aIn: [85, 115] }, A2: { wing: [46, 71], aOut: 81, zip: 101, aIn: 115 } };   // identical to headline2_run.js
const K = 4, D = 2000;
function viaAll(seed) { const th = new Map(); let rr = null;
  return (S, dest) => { if (!th.has(S)) { rr = rr || L.rng(seed + 4242); th.set(S, 2 * Math.PI * rr()); } const t0 = th.get(S), step = 2 * Math.PI / K, b = Math.atan2(dest[1] - S.c[1], dest[0] - S.c[0]);
    const k = Math.round(((((b - t0) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)) / step) % K, a = t0 + k * step; return [S.c[0] + D * Math.cos(a), S.c[1] + D * Math.sin(a)]; }; }
function one(m, arm, seed, corr) { const cfg = MET[m].cfg, S = MET[m].R.sites(cfg, seed), fl = L.flights(cfg, S, seed, H[arm], corr ? { viaAll: viaAll(seed) } : undefined);
  const b = L.count(cfg, fl, { sub: 4, tEnd: cfg.warm + cfg.meas, th: [['v10', 30, 10]] }), pairs = {};
  for (const k in b) { const q = k.match(/^v10\|pair\|(.+)$/); if (q && q[1].split('-')[0] !== q[1].split('-')[1]) pairs[q[1]] = b[k]; }
  return { metro: m, arm, seed, corr, v10: b['v10|cross'] || 0, pairs, flights: fl.length, fl }; }
const nCruise = f => f.sg.filter(s => s[8] === 'cruise').length;
if (process.argv[2] === 'checks') { let bad = 0; const ok = (n, c, i) => { console.log((c ? 'ok  ' : 'FAIL') + ' ' + n + (i !== undefined ? ' ' + JSON.stringify(i) : '')); if (!c) bad++; };
  const H2 = fs.readdirSync('out/headline2').flatMap(f => fs.readFileSync('out/headline2/' + f, 'utf8').split('\n').filter(Boolean).map(JSON.parse));
  for (const [m, arm] of [['houston', 'S1'], ['dfw', 'A2']]) { const r = one(m, arm, 1, false), h = H2.find(x => x.metro === m && x.arm === arm && x.seed === 1);
    ok(`K1 ${m} ${arm} seed 1 straight = HEADLINE2`, r.v10 === h.v10 && r.flights === h.flights, [r.v10, h.v10, r.flights, h.flights]); }
  const s = one('houston', 'S1', 1, false), c = one('houston', 'S1', 1, true);
  for (const op of ['wing', 'zipline']) { const a = s.fl.filter(f => f.op === op), b = c.fl.filter(f => f.op === op), n = b.filter((f, i) => nCruise(f) > nCruise(a[i])).length;
    ok(`K2 ${op} flights using a via point >= 50 %`, a.length === b.length && n / b.length >= 0.5, [n, b.length]); }
  console.log(bad ? bad + ' FAILED' : 'ALL PASS'); process.exit(bad ? 1 : 0); }
const k = +process.argv[2], n = +process.argv[3]; fs.mkdirSync('out/corr2', { recursive: true });
const J = []; for (const m of ['houston', 'dfw']) for (const arm of ['S1', 'A2']) for (let s = 1; s <= 10; s++) J.push([m, arm, s]);
for (const j of J.filter((_, i) => i % n === k)) { const t = Date.now(), r = one(...j, true); delete r.fl; r.wall_s = (Date.now() - t) / 1000; fs.appendFileSync(`out/corr2/runs_${k}.jsonl`, JSON.stringify(r) + '\n'); console.log(JSON.stringify({ m: r.metro, arm: r.arm, s: r.seed, v10: r.v10, wall: r.wall_s })); }
