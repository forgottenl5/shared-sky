'use strict';
// COORD2 runner (planned/COORD2_PREREG.md). node planned/coord2_run.js checks | <shard> <n>  -> out/coord2/runs_<shard>.jsonl
const fs = require('fs'), path = require('path'), L = require('../lab/lab_engine.js'), W = require('./wind.js'), C = require('./coord.js');
const MET = { houston: { R: require('./houreal.js'), cfg: { half: 51000, zone: 34000, warm: 3600, meas: 7200 }, wind: 'data/openmeteo_houston_2025.json' },
  dfw: { R: require('./dfwreal.js'), cfg: { half: 57000, zone: 40000, warm: 3600, meas: 7200 }, wind: 'data/openmeteo_dfw_2025.json' } };
const G20 = { wing: [40, 60], aOut: 80, zip: 100, aIn: 120 }, TH = [['wide', 30, 10], ['close', 15, 5]], ARMS = ['NONE', 'V2'];
const hours = m => { W.useFile(path.join(__dirname, '..', MET[m].wind)); return W.bandHours(0.85, 0.95, 3); };
function one(m, seed, arm, still) {
  const cfg = MET[m].cfg, fl = L.flights(cfg, MET[m].R.sites(cfg, seed), seed, G20);
  const ha = hours(m)[seed - 1], wa = W.hourWind(ha), wp = W.hourWind(ha - 1);
  const rt = (f, w) => still ? f : W.retime(f, w), planned = fl.map(f => rt(f, wp)), pById = new Map(planned.map(f => [f.id, f]));
  let delays = null, blocks = null, cancelled = 0, checked = 0;
  if (arm === 'V2') { const r = C.check(cfg, planned, C.VOL.V2); delays = r.delays; blocks = r.blocks; cancelled = r.cancelled; checked = r.checked; }
  const flown = [], conf = { flights: 0, any: 0, frac: 0 };
  for (const f of fl) { const D = delays && delays.has(f.id) ? delays.get(f.id) : 0; if (D === null) continue;
    const g = rt(C.shift(f, D), wa); flown.push(g);
    if (blocks && blocks.has(f.id) && f.t0 >= cfg.warm && f.t0 < cfg.warm + cfg.meas) { const c = C.conformance(pById.get(f.id), blocks.get(f.id), D, g); conf.flights++; if (c.any) conf.any++; conf.frac += c.frac; } }
  const c = L.count(cfg, flown, { sub: 4, tEnd: cfg.warm + cfg.meas, th: TH }), cost = { all: { n: 0, delayed: 0, cancelled: 0 } };
  if (delays) for (const f of fl) { if (!delays.has(f.id) || f.t0 < cfg.warm || f.t0 >= cfg.warm + cfg.meas) continue; const D = delays.get(f.id);
    for (const k of ['all', f.op]) { const b = cost[k] || (cost[k] = { n: 0, delayed: 0, cancelled: 0 }); b.n++; if (D === null) b.cancelled++; else if (D > 0) b.delayed++; } }
  return { metro: m, heights: 'G20', seed, arm, windHour: wa.time, flights: fl.length, checked, cancelled, wide: c['wide|cross'] || 0, close: c['close|cross'] || 0, cost,
    conformance: conf.flights ? { flights: conf.flights, anyShare: conf.any / conf.flights, timeShare: conf.frac / conf.flights } : null }; }
const J = []; for (const m of ['houston', 'dfw']) for (let s = 1; s <= 3; s++) for (const a of ARMS) J.push([m, s, a]);
if (process.argv[2] === 'checks') {   // K2: still-air count through the runner's own path vs a direct count on the same flights
  let bad = 0; for (const m of ['houston', 'dfw']) { const cfg = MET[m].cfg, fl = L.flights(cfg, MET[m].R.sites(cfg, 1), 1, G20), want = L.count(cfg, fl, { sub: 4, tEnd: cfg.warm + cfg.meas, th: TH })['wide|cross'] || 0, got = one(m, 1, 'NONE', true).wide, okk = got === want;
    console.log((okk ? 'ok  ' : 'FAIL') + ' K2 ' + m + ' G20 still-air NONE via runner ' + got + ' vs direct L.count ' + want); if (!okk) bad++; }
  console.log(bad ? bad + ' FAILED' : 'ALL PASS'); process.exit(bad ? 1 : 0); }
const k = +process.argv[2], n = +process.argv[3]; if (!(k >= 0 && n > 0)) { console.error('usage'); process.exit(2); }
fs.mkdirSync('out/coord2', { recursive: true });
const done = new Set(); for (const f of fs.readdirSync('out/coord2')) for (const l of fs.readFileSync('out/coord2/' + f, 'utf8').split('\n')) if (l.trim()) { const r = JSON.parse(l); done.add([r.metro, r.seed, r.arm].join('|')); }
for (const j of J.filter((_, i) => i % n === k)) { if (done.has(j.join('|'))) continue; const t = Date.now(), r = one(...j); r.wall_s = (Date.now() - t) / 1000; fs.appendFileSync(`out/coord2/runs_${k}.jsonl`, JSON.stringify(r) + '\n'); console.log(j.join(' '), r.wall_s); }
