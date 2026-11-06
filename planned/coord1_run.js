'use strict';
// COORD1 runner (registration planned/COORD1_PREREG.md). Usage:
//   node planned/coord1_run.js checks          K2 (NONE in still air vs HEADLINE2, seed 1, A2, both metros; K1 is node planned/test_coord.js)
//   node planned/coord1_run.js <shard> <n>     -> out/coord1/runs_<shard>.jsonl
const fs = require('fs'), path = require('path'), L = require('../lab/lab_engine.js'), W = require('./wind.js'), C = require('./coord.js');
const MET = { houston: { R: require('./houreal.js'), cfg: { half: 34000 + 17000, zone: 34000, warm: 3600, meas: 7200 }, wind: 'data/openmeteo_houston_2025.json' },
  dfw: { R: require('./dfwreal.js'), cfg: { half: 40000 + 17000, zone: 40000, warm: 3600, meas: 7200 }, wind: 'data/openmeteo_dfw_2025.json' } };
const H = { A0: { wing: [46, 91], aOut: 61, zip: 101, aIn: 105 }, A2: { wing: [46, 71], aOut: 81, zip: 101, aIn: 115 } };   // as HEADLINE2
const TH = [['wide', 30, 10], ['close', 15, 5]], ARMS = ['NONE', 'MIN', 'V1', 'V2', 'V3'];
function hours(m) { W.useFile(path.join(__dirname, '..', MET[m].wind)); return W.bandHours(0.85, 0.95, 3); }
function one(m, hk, seed, arm) {
  const cfg = MET[m].cfg, S = MET[m].R.sites(cfg, seed), fl = L.flights(cfg, S, seed, H[hk]);
  const ha = hours(m)[seed - 1], hp = ha - 1, wa = W.hourWind(ha), wp = W.hourWind(hp);
  const planned = fl.map(f => W.retime(f, wp)), pById = new Map(planned.map(f => [f.id, f]));
  let delays = null, blocks = null, cancelled = 0, checked = 0;
  if (arm === 'MIN') { const r = L.intentCheck(cfg, planned, 30, 5, 10); delays = r.delays; cancelled = r.cancelled; checked = r.checked; }
  else if (arm !== 'NONE') { const r = C.check(cfg, planned, C.VOL[arm]); delays = r.delays; blocks = r.blocks; cancelled = r.cancelled; checked = r.checked; }
  const flown = [], conf = { flights: 0, any: 0, frac: 0 };
  for (const f of fl) { const D = delays && delays.has(f.id) ? delays.get(f.id) : 0; if (D === null) continue;
    const g = W.retime(C.shift(f, D), wa); flown.push(g);
    if (blocks && blocks.has(f.id) && f.t0 >= cfg.warm && f.t0 < cfg.warm + cfg.meas) { const c = C.conformance(pById.get(f.id), blocks.get(f.id), D, g); conf.flights++; if (c.any) conf.any++; conf.frac += c.frac; } }
  const c = L.count(cfg, flown, { sub: 4, tEnd: cfg.warm + cfg.meas, th: TH });
  const cost = { all: { n: 0, delayed: 0, cancelled: 0, sumD: 0, ds: [] } };
  if (delays) for (const f of fl) { if (!delays.has(f.id) || f.t0 < cfg.warm || f.t0 >= cfg.warm + cfg.meas) continue; const D = delays.get(f.id);
    for (const k of ['all', f.op]) { const b = cost[k] || (cost[k] = { n: 0, delayed: 0, cancelled: 0, sumD: 0, ds: [] }); b.n++; if (D === null) b.cancelled++; else if (D > 0) { b.delayed++; b.sumD += D; b.ds.push(D); } } }
  for (const k in cost) { const b = cost[k], ds = b.ds.sort((x, y) => x - y); b.meanD = ds.length ? b.sumD / ds.length : 0; b.p95D = ds.length ? ds[Math.min(ds.length - 1, Math.floor(0.95 * ds.length))] : 0; delete b.ds; delete b.sumD; }
  return { metro: m, heights: hk, seed, arm, windHour: W.hourWind(ha).time, planHour: wp.time, wind120: [wp.s[2][1], wa.s[2][1]], flights: fl.length, checked, cancelled,
    wide: c['wide|cross'] || 0, close: c['close|cross'] || 0, cost, conformance: conf.flights ? { flights: conf.flights, anyShare: conf.any / conf.flights, timeShare: conf.frac / conf.flights } : null }; }
const J = []; for (const m of ['houston', 'dfw']) for (const hk of ['A0', 'A2']) for (let s = 1; s <= 3; s++) for (const a of ARMS) J.push([m, hk, s, a]);
if (process.argv[2] === 'checks') {   // K2
  const ref = {}; for (const f of fs.readdirSync('out/headline2')) for (const l of fs.readFileSync('out/headline2/' + f, 'utf8').split('\n')) if (l.trim()) { const r = JSON.parse(l); if (r.seed === 1 && r.arm === 'A2') ref[r.metro] = r.v10; }
  let bad = 0; for (const m of ['houston', 'dfw']) { const cfg = MET[m].cfg, fl = L.flights(cfg, MET[m].R.sites(cfg, 1), 1, H.A2), c = L.count(cfg, fl, { sub: 4, tEnd: cfg.warm + cfg.meas, th: TH }), v = c['wide|cross'] || 0, okk = ref[m] !== undefined && Math.abs(v - ref[m]) <= 0.01 * ref[m];
    console.log((okk ? 'ok  ' : 'FAIL') + ' K2 ' + m + ' still-air NONE A2 seed 1: ' + v + ' vs HEADLINE2 ' + ref[m]); if (!okk) bad++; }
  console.log('wind hours', JSON.stringify({ houston: hours('houston').map(i => W.hourWind(i).time), dfw: hours('dfw').map(i => W.hourWind(i).time) }), 'jobs', J.length);
  console.log(bad ? bad + ' FAILED' : 'ALL PASS'); process.exit(bad ? 1 : 0); }
const k = +process.argv[2], n = +process.argv[3]; if (!(k >= 0 && n > 0)) { console.error('usage: node planned/coord1_run.js checks | <shard> <n>'); process.exit(2); }
fs.mkdirSync('out/coord1', { recursive: true });
const done = new Set(); for (const f of fs.readdirSync('out/coord1')) for (const l of fs.readFileSync('out/coord1/' + f, 'utf8').split('\n')) if (l.trim()) { const r = JSON.parse(l); done.add([r.metro, r.heights, r.seed, r.arm].join('|')); }
for (const j of J.filter((_, i) => i % n === k)) { if (done.has(j.join('|'))) continue; const t = Date.now(), r = one(...j); r.wall_s = (Date.now() - t) / 1000; fs.appendFileSync(`out/coord1/runs_${k}.jsonl`, JSON.stringify(r) + '\n'); console.log(j.join(' '), r.wall_s); }
