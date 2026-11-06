'use strict';
// Exploratory follow-up to LAYER1 (planned/LAYER1_RESULTS_2026-10-27.md): who blocks whom in the V2 plan check under each LAYER1 arm. Seeds 1-3, plan check only.
const fs = require('fs'), path = require('path'), L = require('../lab/lab_engine.js'), W = require('./wind.js'), C = require('./coord.js');
const MET = { houston: { R: require('./houreal.js'), cfg: { half: 51000, zone: 34000, warm: 3600, meas: 7200 }, wind: 'data/openmeteo_houston_2025.json' }, dfw: { R: require('./dfwreal.js'), cfg: { half: 57000, zone: 40000, warm: 3600, meas: 7200 }, wind: 'data/openmeteo_dfw_2025.json' } };
const H = { A2: { wing: [46, 71], aOut: 81, zip: 101, aIn: 115 }, WAZ: { wing: [46, 71], aOut: 83, aIn: 95, zip: 107 }, AWZ: { wing: [70, 95], aOut: 46, aIn: 58, zip: 107 } };
const out = [];
for (const m of ['houston', 'dfw']) for (const arm of Object.keys(H)) { const agg = {};
  for (let s = 1; s <= 3; s++) { W.useFile(path.join(__dirname, '..', MET[m].wind)); const cfg = MET[m].cfg, wp = W.hourWind(W.bandHours(0.85, 0.95, 3)[s - 1] - 1), fl = L.flights(cfg, MET[m].R.sites(cfg, s), s, H[arm]);
    const r = C.check(cfg, fl.map(f => W.retime(f, wp)), C.VOL.V2, { blame: true });
    for (const f of fl) { if (!r.delays.has(f.id) || f.t0 < cfg.warm || f.t0 >= cfg.warm + cfg.meas || r.delays.get(f.id) === 0 || !r.blame.has(f.id)) continue; const q = r.blame.get(f.id), k = f.op + (q.bVert ? ':vert' : ':level') + ' <- ' + q.op + (q.oVert ? ':vert' : ':level'); agg[k] = (agg[k] || 0) + 1; } }
  const o = { metro: m, arm, blame: agg }; out.push(o); console.log(m, arm, JSON.stringify(Object.entries(agg).sort((a, b) => b[1] - a[1]).slice(0, 6))); }
fs.writeFileSync('out/diag_layer1_blame.jsonl', out.map(o => JSON.stringify(o)).join('\n') + '\n');
