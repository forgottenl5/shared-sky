'use strict';
// Runner for HOUREAL_PREREG.md. node planned/houreal_run.js checks | <shard> <n>
const fs = require('fs'), L = require('../lab/lab_engine.js'), HR = require('./houreal.js');
const cfg = { half: 34000 + 17000, zone: 34000, warm: 3600, meas: 7200 };
const H = { A0: { wing: [46, 91], aOut: 61, zip: 101, aIn: 105 }, T: { wing: [46, 91], aOut: [55, 115], zip: 101, aIn: [55, 115] }, R: { wing: [46, 91], aOut: 69, zip: 101, aIn: 122 }, A2: { wing: [46, 71], aOut: 81, zip: 101, aIn: 115 } };
function one(arm, seed) { const S = HR.sites(cfg, seed), fl = L.flights(cfg, S, seed, H[arm]), c = L.count(cfg, fl, { sub: 4 }), pairs = {};
  for (const k in c) { const m = k.match(/^wide\|pair\|(.+)$/); if (m && m[1].split('-')[0] !== m[1].split('-')[1]) pairs[m[1]] = c[k]; }
  return { arm, seed, cross_wide: c['wide|cross'] || 0, cross_close: c['close|cross'] || 0, pairs, flights: fl.length }; }
if (process.argv[2] === 'checks') { const S = HR.sites(cfg, 1), am = S.filter(s => s.op === 'amazon'), n = op => S.filter(s => s.op === op).length;
  const inZ = am.every(s => Math.abs(s.c[0]) <= cfg.zone && Math.abs(s.c[1]) <= cfg.zone), fl = L.flights(cfg, S, 1, H.A0).filter(f => f.op === 'amazon');
  const ok = fl.every(f => am.some(s => Math.hypot(f.sg[0][2] - s.c[0], f.sg[0][3] - s.c[1]) <= 30));
  console.log('K1 amazon', am.length, 'in zone', inZ, 'wing', n('wing'), 'zipline', n('zipline'), 'amazon flights', fl.length, 'start at sites', ok, am.length === 5 && inZ && n('wing') === 75 && n('zipline') === 65 && ok ? 'PASS' : 'FAIL'); }
else { const k = +process.argv[2], m = +process.argv[3], J = []; for (const arm of ['A0', 'T', 'R', 'A2']) for (const seed of [1, 2, 3]) J.push([arm, seed]);
  fs.mkdirSync('out/houreal', { recursive: true }); for (const [arm, seed] of J.filter((_, i) => i % m === k)) { const t = Date.now(), r = one(arm, seed); r.wall_s = (Date.now() - t) / 1000; fs.appendFileSync(`out/houreal/runs_${k}.jsonl`, JSON.stringify(r) + '\n'); console.log(JSON.stringify(r)); } }
