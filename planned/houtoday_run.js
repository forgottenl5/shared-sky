'use strict';
// Runner for HOUTODAY_PREREG.md. node planned/houtoday_run.js checks | <shard> <n>
const fs = require('fs'), L = require('../lab/lab_engine.js'), HT = require('./houtoday.js');
const cfg = { half: 52000 + 17000, zone: 52000, warm: 3600, meas: 7200 };
const H = { A0: { wing: [46, 91], aOut: 61, zip: 101, aIn: 105 }, T: { wing: [46, 91], aOut: [55, 115], zip: 101, aIn: [55, 115] }, R: { wing: [46, 91], aOut: 69, zip: 101, aIn: 122 }, A2: { wing: [46, 71], aOut: 81, zip: 101, aIn: 115 } };
const VOL = { cap: 1, v20: 0.2 };
function one(arm, vol, seed) { const S = HT.sites(cfg, seed, VOL[vol]), fl = L.flights(cfg, S, seed, H[arm]), c = L.count(cfg, fl, { sub: 4 }), pairs = {};
  for (const k in c) { const m = k.match(/^wide\|pair\|(.+)$/); if (m && m[1].split('-')[0] !== m[1].split('-')[1]) pairs[m[1]] = c[k]; }
  return { arm, vol, seed, cross_wide: c['wide|cross'] || 0, cross_close: c['close|cross'] || 0, pairs, flights: fl.length }; }
if (process.argv[2] === 'checks') { let ok = true; const cz = HT.toXY(...HT.CYPRESS);
  for (let seed = 1; seed <= 30; seed++) { const S = HT.sites(cfg, seed), n = op => S.filter(s => s.op === op).length, z = S.find(s => s.op === 'zipline');
    if (n('wing') !== 5 || n('amazon') !== 1 || n('zipline') !== 1 || Math.hypot(z.c[0] - cz[0], z.c[1] - cz[1]) > 5000) ok = false; }
  const a = HT.sites(cfg, 1, 1), b = HT.sites(cfg, 1, 0.2), rok = a.every((s, i) => Math.abs(b[i].rate - 0.2 * s.rate) < 1e-9);
  const S = HT.sites(cfg, 1), fl = L.flights(cfg, S, 1, H.A0), sok = fl.every(f => S.some(s => Math.hypot(f.sg[0][2] - s.c[0], f.sg[0][3] - s.c[1]) <= 30));
  console.log('K1 sites/dock', ok, 'v20 rates', rok, 'flights', fl.length, 'start at sites', sok, ok && rok && sok ? 'PASS' : 'FAIL'); }
else { const k = +process.argv[2], m = +process.argv[3], J = []; for (const arm of ['A0', 'T', 'R', 'A2']) for (const vol of ['cap', 'v20']) for (let seed = 1; seed <= 30; seed++) J.push([arm, vol, seed]);
  fs.mkdirSync('out/houtoday', { recursive: true }); for (const [arm, vol, seed] of J.filter((_, i) => i % m === k)) { const t = Date.now(), r = one(arm, vol, seed); r.wall_s = (Date.now() - t) / 1000; fs.appendFileSync(`out/houtoday/runs_${k}.jsonl`, JSON.stringify(r) + '\n'); } console.log('shard', k, 'done'); }
