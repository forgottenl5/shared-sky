'use strict';
// Runner for HEADLINE2_PREREG.md. node planned/headline2_run.js checks | <shard> <n>
const fs = require('fs'), L = require('../lab/lab_engine.js');
const MET = { houston: { R: require('./houreal.js'), cfg: { half: 34000 + 17000, zone: 34000, warm: 3600, meas: 7200 }, want: { amazon: 5, wing: 75, zipline: 65 } },
  dfw: { R: require('./dfwreal.js'), cfg: { half: 40000 + 17000, zone: 40000, warm: 3600, meas: 7200 }, want: { amazon: 6, wing: 75, zipline: 75 } } };
const H = { A0: { wing: [46, 91], aOut: 61, zip: 101, aIn: 105 }, S1: { wing: [46, 91], aOut: 69, zip: 101, aIn: [85, 115] }, R: { wing: [46, 91], aOut: 69, zip: 101, aIn: 122 }, A2: { wing: [46, 71], aOut: 81, zip: 101, aIn: 115 } };
const TH = [['v10', 30, 10], ['v15', 30, 15], ['v20', 30, 20], ['close', 15, 5]];
const cross = (c, nm) => c[nm + '|cross'] || 0;
function one(m, arm, seed) { const cfg = MET[m].cfg, S = MET[m].R.sites(cfg, seed), fl = L.flights(cfg, S, seed, H[arm]);
  const b = L.count(cfg, fl, { sub: 4, tEnd: cfg.warm + cfg.meas, th: TH }), u = L.count(cfg, fl, { sub: 4 }), pairs = {};
  for (const k in b) { const q = k.match(/^v10\|pair\|(.+)$/); if (q && q[1].split('-')[0] !== q[1].split('-')[1]) pairs[q[1]] = b[k]; }
  return { metro: m, arm, seed, v10: cross(b, 'v10'), v15: cross(b, 'v15'), v20: cross(b, 'v20'), close: cross(b, 'close'), v10_unbounded: cross(u, 'wide'), pairs, flights: fl.length,
    sites: { amazon: S.filter(s => s.op === 'amazon').length, wing: S.filter(s => s.op === 'wing').length, zipline: S.filter(s => s.op === 'zipline').length } }; }
const J = []; for (const m of ['houston', 'dfw']) for (const arm of ['A0', 'S1', 'R', 'A2']) for (let seed = 1; seed <= 10; seed++) J.push([m, arm, seed]);
if (process.argv[2] === 'checks') { let ok = true;
  for (const m of Object.keys(MET)) { const r = one(m, 'A0', 1), w = MET[m].want, good = r.sites.amazon === w.amazon && r.sites.wing === w.wing && r.sites.zipline === w.zipline && r.v10 <= r.v10_unbounded;
    console.log('K1', m, JSON.stringify(r.sites), 'bounded', r.v10, 'unbounded', r.v10_unbounded, good ? 'ok' : 'BAD'); ok = ok && good; }
  console.log('jobs', J.length, ok ? 'K1 PASS' : 'K1 FAIL'); }
else { const k = +process.argv[2], n = +process.argv[3]; fs.mkdirSync('out/headline2', { recursive: true });
  // RESUME=1 (added 25 Oct during the runs, job control only): skip jobs already in out/headline2 and share the rest across shards
  let JJ = J; if (process.env.RESUME) { const done = new Set(); for (const f of fs.readdirSync('out/headline2')) for (const l of fs.readFileSync('out/headline2/' + f, 'utf8').split('\n')) if (l.trim()) { const r = JSON.parse(l); done.add([r.metro, r.arm, r.seed].join('|')); } JJ = J.filter(j => !done.has(j.join('|'))); }
  for (const j of JJ.filter((_, i) => i % n === k)) { const t = Date.now(), r = one(...j); r.wall_s = (Date.now() - t) / 1000; fs.appendFileSync(`out/headline2/runs_${k}.jsonl`, JSON.stringify(r) + '\n'); } }
