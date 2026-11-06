'use strict';
// Runner for planned/LAYER1_PREREG.md.  node planned/layer1_run.js checks | <shard> <n>   -> out/layer1/runs_<shard>.jsonl
const fs = require('fs'), path = require('path'), L = require('../lab/lab_engine.js'), W = require('./wind.js'), C = require('./coord.js');
const MET = { houston: { R: require('./houreal.js'), cfg: { half: 51000, zone: 34000, warm: 3600, meas: 7200 }, wind: 'data/openmeteo_houston_2025.json' },
  dfw: { R: require('./dfwreal.js'), cfg: { half: 57000, zone: 40000, warm: 3600, meas: 7200 }, wind: 'data/openmeteo_dfw_2025.json' } };
const H = { A2: { wing: [46, 71], aOut: 81, zip: 101, aIn: 115 }, A2u: { wing: [46, 71], aOut: 83, zip: 95, aIn: 107 }, WAZ: { wing: [46, 71], aOut: 83, aIn: 95, zip: 107 }, AWZ: { wing: [70, 95], aOut: 46, aIn: 58, zip: 107 } };
const TH = [['wide', 30, 10], ['close', 15, 5]], ARMS = Object.keys(H);
function one(m, seed, arm) { W.useFile(path.join(__dirname, '..', MET[m].wind)); const cfg = MET[m].cfg, ha = W.bandHours(0.85, 0.95, 3)[seed - 1], wa = W.hourWind(ha), wp = W.hourWind(ha - 1);
  const fl = L.flights(cfg, MET[m].R.sites(cfg, seed), seed, H[arm]), flown = fl.map(f => W.retime(f, wa)), pair = {}, phase = {};
  const c = L.count(cfg, flown, { sub: 4, tEnd: cfg.warm + cfg.meas, th: TH, onMeet: (nm, A, B) => { if (nm !== 'wide' || A[1] === B[1]) return; const p = [A[1], B[1]].sort().join('-'), ph = [A[5], B[5]].sort().join('+'); pair[p] = (pair[p] || 0) + 1; phase[ph] = (phase[ph] || 0) + 1; } });
  const r = C.check(cfg, fl.map(f => W.retime(f, wp)), C.VOL.V2), cost = { all: { n: 0, delayed: 0, cancelled: 0, sumD: 0 } };
  for (const f of fl) { if (!r.delays.has(f.id) || f.t0 < cfg.warm || f.t0 >= cfg.warm + cfg.meas) continue; const D = r.delays.get(f.id);
    for (const k of ['all', f.op]) { const b = cost[k] || (cost[k] = { n: 0, delayed: 0, cancelled: 0, sumD: 0 }); b.n++; if (D === null) b.cancelled++; else if (D > 0) { b.delayed++; b.sumD += D; } } }
  return { metro: m, seed, arm, hour: wa.time, wide: c['wide|cross'] || 0, close: c['close|cross'] || 0, pair, phase, cost }; }
const J = []; for (const m of ['houston', 'dfw']) for (let s = 1; s <= 3; s++) for (const a of ARMS) J.push([m, s, a]);
if (process.argv[2] === 'checks') { let bad = 0;
  const ref = {}; for (const f of fs.readdirSync('out/coord1')) for (const l of fs.readFileSync('out/coord1/' + f, 'utf8').split('\n')) if (l.trim()) { const q = JSON.parse(l); if (q.seed === 1 && q.heights === 'A2' && q.arm === 'NONE') ref[q.metro] = q.wide; }
  for (const m of ['houston', 'dfw']) { const g = one(m, 1, 'A2').wide, ok = g === ref[m]; console.log((ok ? 'ok  ' : 'FAIL') + ' K1 ' + m + ' A2 seed 1 wide ' + g + ' vs COORD1 ' + ref[m]); if (!ok) bad++; }
  for (const a of ARMS) { const h = H[a], lay = [h.wing[0], h.wing[1], h.aOut, h.aIn, h.zip].sort((x, y) => x - y), gaps = []; for (let i = 1; i < lay.length; i++) if (!(lay[i - 1] === h.wing[0] && lay[i] === h.wing[1])) gaps.push(lay[i] - lay[i - 1]);
    const ok = lay[lay.length - 1] <= 120 && gaps.every(g => g >= 12 || (a === 'A2' && g === 10) || (a === 'A2' && g >= 10)); console.log((ok ? 'ok  ' : 'FAIL') + ' K2 ' + a + ' top ' + lay[lay.length - 1] + ' gaps ' + gaps.join(',')); if (!ok) bad++; }
  console.log(bad ? bad + ' FAILED' : 'ALL PASS', 'jobs', J.length); process.exit(bad ? 1 : 0); }
const k = +process.argv[2], n = +process.argv[3]; fs.mkdirSync('out/layer1', { recursive: true });
const done = new Set(); for (const f of fs.readdirSync('out/layer1')) for (const l of fs.readFileSync('out/layer1/' + f, 'utf8').split('\n')) if (l.trim()) { const q = JSON.parse(l); done.add([q.metro, q.seed, q.arm].join('|')); }
for (const j of J.filter((_, i) => i % n === k)) { if (done.has(j.join('|'))) continue; const t = Date.now(), r = one(...j); r.wall_s = (Date.now() - t) / 1000; fs.appendFileSync(`out/layer1/runs_${k}.jsonl`, JSON.stringify(r) + '\n'); console.log(j.join(' '), r.wall_s); }
