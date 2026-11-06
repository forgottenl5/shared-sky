'use strict';
// HELI1 runner (registration planned/HELI1_PREREG.md).
//   node planned/heli1_run.js checks     pre-run check K2
//   node planned/heli1_run.js            -> out/heli1/density_<metro>_<arm>.json (mean drones per 150 m x 150 m x 20 m cell, seeds 1-10, 10 s samples over the measure window)
const fs = require('fs'), L = require('../lab/lab_engine.js'), CITY = require('../lab/city.js'), K = require('../lab/risk.js');
const H = { S1: { wing: [46, 91], aOut: 69, zip: 101, aIn: [85, 115] }, A2: { wing: [46, 71], aOut: 81, zip: 101, aIn: 115 } };
const CH = 150, CZ = 20, DT = 10, SEEDS = 10;
if (process.argv[2] === 'checks') { const c = CITY.load('houston'), fl = L.flights(c.cfg, c.sites(c.cfg, 1), 1, H.S1);
  console.log((fl.length === 19426 ? 'ok  ' : 'FAIL') + ' K2 Houston S1 seed 1 regenerates 19,426 flights', fl.length); process.exit(fl.length === 19426 ? 0 : 1); }
fs.mkdirSync('out/heli1', { recursive: true });
for (const m of ['houston', 'dfw']) for (const arm of ['S1', 'A2']) {
  const c = CITY.load(m), cnt = new Map(); let samples = 0;
  for (let seed = 1; seed <= SEEDS; seed++) { const fl = L.flights(c.cfg, c.sites(c.cfg, seed), seed, H[arm]);
    for (let t = c.cfg.warm; t < c.cfg.warm + c.cfg.meas; t += DT) { samples++;
      for (const f of fl) { if (t < f.t0 || t >= f.end) continue; const p = K.posAt(f, t); if (!p || p[2] <= 0) continue;
        const k = Math.floor(p[0] / CH) + ',' + Math.floor(p[1] / CH) + ',' + Math.floor(p[2] / CZ); cnt.set(k, (cnt.get(k) || 0) + 1); } } }
  const o = {}; for (const [k, v] of cnt) o[k] = Math.round(v / samples * 1e6) / 1e6;
  fs.writeFileSync(`out/heli1/density_${m}_${arm}.json`, JSON.stringify({ metro: m, arm, cell: CH, layer: CZ, zone: c.cfg.zone, lat0: c.lat0, lon0: c.lon0, seeds: SEEDS, samples, cells: o }));
  console.log(m, arm, 'cells', cnt.size); }
