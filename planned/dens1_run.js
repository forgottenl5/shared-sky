'use strict';
// DENS1 runner (planned/DENS1_PREREG.md). node planned/dens1_run.js checks | <shard> <n> -> out/dens1/runs_<shard>.jsonl
const fs = require('fs'), path = require('path'), L = require('../lab/lab_engine.js'), W = require('./wind.js'), C = require('./coord.js');
const MET = { houston: { R: require('./houreal.js'), cfg: { half: 51000, zone: 34000, warm: 3600, meas: 7200 }, wind: 'data/openmeteo_houston_2025.json' },
  dfw: { R: require('./dfwreal.js'), cfg: { half: 57000, zone: 40000, warm: 3600, meas: 7200 }, wind: 'data/openmeteo_dfw_2025.json' } };
const H = { A2: { wing: [46, 71], aOut: 81, zip: 101, aIn: 115 }, G20: { wing: [40, 60], aOut: 80, zip: 100, aIn: 120 } }, TH = [['wide', 30, 10], ['close', 15, 5]];
const hours = m => { W.useFile(path.join(__dirname, '..', MET[m].wind)); return W.bandHours(0.85, 0.95, 3); };
function one(m, hk, seed, arm, k) {
  const cfg = MET[m].cfg, S = MET[m].R.sites(cfg, seed).map(s => Object.assign({}, s, { rate: (s.rate || L.OP[s.op].rate) * k })), fl = L.flights(cfg, S, seed, H[hk]);
  const ha = hours(m)[seed - 1], wa = W.hourWind(ha), wp = W.hourWind(ha - 1), planned = fl.map(f => W.retime(f, wp));
  let delays = null, cancelled = 0, checked = 0;
  if (arm === 'V2') { const r = C.check(cfg, planned, C.VOL.V2); delays = r.delays; cancelled = r.cancelled; checked = r.checked; }
  const flown = []; for (const f of fl) { const D = delays && delays.has(f.id) ? delays.get(f.id) : 0; if (D === null) continue; flown.push(W.retime(C.shift(f, D), wa)); }
  const c = L.count(cfg, flown, { sub: 4, tEnd: cfg.warm + cfg.meas, th: TH }), cost = { all: { n: 0, delayed: 0, cancelled: 0, sumD: 0 } };
  if (delays) for (const f of fl) { if (!delays.has(f.id) || f.t0 < cfg.warm || f.t0 >= cfg.warm + cfg.meas) continue; const D = delays.get(f.id);
    for (const q of ['all', f.op]) { const b = cost[q] || (cost[q] = { n: 0, delayed: 0, cancelled: 0, sumD: 0 }); b.n++; if (D === null) b.cancelled++; else if (D > 0) { b.delayed++; b.sumD += D; } } }
  for (const q in cost) { const b = cost[q]; b.meanD = b.delayed ? b.sumD / b.delayed : 0; delete b.sumD; }
  return { metro: m, heights: hk, seed, arm, k, flights: fl.length, checked, cancelled, wide: c['wide|cross'] || 0, close: c['close|cross'] || 0, cost }; }
const J = []; for (const k of [2, 1.5, 0.5, 0.25]) for (const m of ['houston', 'dfw']) for (const hk of ['A2', 'G20']) for (let s = 1; s <= 3; s++) for (const a of ['NONE', 'V2']) J.push([m, hk, s, a, k]);
if (process.argv[2] === 'checks') {   // K2
  let bad = 0; for (const m of ['houston', 'dfw']) { let ref = null; for (const f of fs.readdirSync('out/coord1')) for (const l of fs.readFileSync('out/coord1/' + f, 'utf8').split('\n')) if (l.trim()) { const r = JSON.parse(l); if (r.metro === m && r.heights === 'A2' && r.seed === 1 && r.arm === 'V2') ref = r; }
    const g = one(m, 'A2', 1, 'V2', 1), okk = ref && g.cost.all.delayed === ref.cost.all.delayed && g.cost.all.cancelled === ref.cost.all.cancelled && g.wide === ref.wide;
    console.log((okk ? 'ok  ' : 'FAIL') + ' K2 ' + m + ' k=1 vs COORD1', JSON.stringify({ got: [g.cost.all.delayed, g.cost.all.cancelled, g.wide], ref: ref && [ref.cost.all.delayed, ref.cost.all.cancelled, ref.wide] })); if (!okk) bad++; }
  console.log(bad ? bad + ' FAILED' : 'ALL PASS'); process.exit(bad ? 1 : 0); }
if (process.argv[2] === 'k1') {   // deviation 1 (see DENS1_PREREG deviation log): G20 V2 at k=1 for mean delay, identity-checked against COORD2
  const ref = {}; for (const f of fs.readdirSync('out/coord2')) for (const l of fs.readFileSync('out/coord2/' + f, 'utf8').split('\n')) if (l.trim()) { const r = JSON.parse(l); if (r.arm === 'V2') ref[r.metro + r.seed] = r; }
  let bad = 0; for (const m of ['houston', 'dfw']) for (let s = 1; s <= 3; s++) { const g = one(m, 'G20', s, 'V2', 1), r = ref[m + s], okk = g.cost.all.delayed === r.cost.all.delayed && g.cost.all.cancelled === r.cost.all.cancelled && g.wide === r.wide;
    console.log((okk ? 'ok  ' : 'FAIL') + ' ' + m + ' seed ' + s, JSON.stringify([g.cost.all.delayed, g.cost.all.cancelled, g.wide]), JSON.stringify([r.cost.all.delayed, r.cost.all.cancelled, r.wide])); if (!okk) bad++; else fs.appendFileSync('out/dens1/k1_g20.jsonl', JSON.stringify(g) + '\n'); }
  process.exit(bad ? 1 : 0); }
const sh = +process.argv[2], n = +process.argv[3]; if (!(sh >= 0 && n > 0)) { console.error('usage'); process.exit(2); }
fs.mkdirSync('out/dens1', { recursive: true });
const done = new Set(); for (const f of fs.readdirSync('out/dens1')) for (const l of fs.readFileSync('out/dens1/' + f, 'utf8').split('\n')) if (l.trim()) { const r = JSON.parse(l); done.add([r.metro, r.heights, r.seed, r.arm, r.k].join('|')); }
for (const j of J.filter((_, i) => i % n === sh)) { if (done.has(j.join('|'))) continue; const t = Date.now(), r = one(...j); r.wall_s = (Date.now() - t) / 1000; fs.appendFileSync(`out/dens1/runs_${sh}.jsonl`, JSON.stringify(r) + '\n'); console.log(j.join(' '), r.wall_s); }
