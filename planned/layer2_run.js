'use strict';
// Runner for planned/LAYER2_PREREG.md.  node planned/layer2_run.js checks | <shard> <n>   -> out/layer2/runs_<shard>.jsonl
const fs = require('fs'), path = require('path'), L = require('../lab/lab_engine.js'), W = require('./wind.js'), C = require('./coord.js');
const MET = { houston: { R: require('./houreal.js'), cfg: { half: 51000, zone: 34000, warm: 3600, meas: 7200 }, wind: 'data/openmeteo_houston_2025.json' },
  dfw: { R: require('./dfwreal.js'), cfg: { half: 57000, zone: 40000, warm: 3600, meas: 7200 }, wind: 'data/openmeteo_dfw_2025.json' } };
const H = { A2: { wing: [46, 71], aOut: 81, zip: 101, aIn: 115 }, WAZ: { wing: [46, 71], aOut: 83, aIn: 95, zip: 107 } };
const VOLS = { V2: C.VOL.V2, V2v5: { w: 30, v: 5, h0: 10, g: 0.05 } }, TH = [['wide', 30, 10], ['close', 15, 5]];
function one(m, seed, hk, chk) { W.useFile(path.join(__dirname, '..', MET[m].wind)); const cfg = MET[m].cfg, ha = W.bandHours(0.85, 0.95, 6)[seed - 1], wa = W.hourWind(ha), wp = W.hourWind(ha - 1);
  const fl = L.flights(cfg, MET[m].R.sites(cfg, seed), seed, H[hk]), planned = fl.map(f => W.retime(f, wp)); let delays = null;
  if (chk !== 'NONE') delays = C.check(cfg, planned, VOLS[chk]).delays;
  const flown = []; for (const f of fl) { const D = delays && delays.has(f.id) ? delays.get(f.id) : 0; if (D === null) continue; flown.push(W.retime(C.shift(f, D), wa)); }
  const c = L.count(cfg, flown, { sub: 4, tEnd: cfg.warm + cfg.meas, th: TH }), cost = { all: { n: 0, delayed: 0, cancelled: 0, sumD: 0 } };
  if (delays) for (const f of fl) { if (!delays.has(f.id) || f.t0 < cfg.warm || f.t0 >= cfg.warm + cfg.meas) continue; const D = delays.get(f.id);
    for (const k of ['all', f.op]) { const b = cost[k] || (cost[k] = { n: 0, delayed: 0, cancelled: 0, sumD: 0 }); b.n++; if (D === null) b.cancelled++; else if (D > 0) { b.delayed++; b.sumD += D; } } }
  return { metro: m, seed, heights: hk, check: chk, hour: wa.time, wide: c['wide|cross'] || 0, close: c['close|cross'] || 0, cost }; }
const J = []; for (const m of ['houston', 'dfw']) for (let s = 1; s <= 6; s++) for (const hk of ['A2', 'WAZ']) for (const chk of ['NONE', 'V2', 'V2v5']) J.push([m, s, hk, chk]);
if (process.argv[2] === 'checks') { let bad = 0, ref = {}, refD = {};
  for (const f of fs.readdirSync('out/coord1')) for (const l of fs.readFileSync('out/coord1/' + f, 'utf8').split('\n')) if (l.trim()) { const q = JSON.parse(l); if (q.seed === 1 && q.heights === 'A2') { if (q.arm === 'NONE') ref[q.metro] = q.wide; if (q.arm === 'V2') refD[q.metro] = q.cost.all.delayed; } }
  for (const m of ['houston', 'dfw']) { const a = one(m, 1, 'A2', 'NONE').wide, b = one(m, 1, 'A2', 'V2').cost.all.delayed, ok = a === ref[m] && b === refD[m];
    console.log((ok ? 'ok  ' : 'FAIL') + ' K1 ' + m + ' NONE wide ' + a + ' vs ' + ref[m] + '; V2 delayed ' + b + ' vs ' + refD[m]); if (!ok) bad++; }
  const h = H.WAZ, lay = [h.wing[1], h.aOut, h.aIn, h.zip].sort((x, y) => x - y), gaps = lay.slice(1).map((x, i) => x - lay[i]); const ok2 = lay[lay.length - 1] <= 120 && gaps.every(g => g >= 12); console.log((ok2 ? 'ok  ' : 'FAIL') + ' K2 WAZ top ' + lay[lay.length - 1] + ' gaps ' + gaps.join(',')); if (!ok2) bad++;
  console.log(bad ? bad + ' FAILED' : 'ALL PASS', 'jobs', J.length); process.exit(bad ? 1 : 0); }
const k = +process.argv[2], n = +process.argv[3]; fs.mkdirSync('out/layer2', { recursive: true });
const done = new Set(); for (const f of fs.readdirSync('out/layer2')) for (const l of fs.readFileSync('out/layer2/' + f, 'utf8').split('\n')) if (l.trim()) { const q = JSON.parse(l); done.add([q.metro, q.seed, q.heights, q.check].join('|')); }
for (const j of J.filter((_, i) => i % n === k)) { if (done.has(j.join('|'))) continue; const t = Date.now(), r = one(...j); r.wall_s = (Date.now() - t) / 1000; fs.appendFileSync(`out/layer2/runs_${k}.jsonl`, JSON.stringify(r) + '\n'); console.log(j.join(' '), r.wall_s); }
