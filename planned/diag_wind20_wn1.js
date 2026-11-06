'use strict';
// Exploratory diagnosis of WIND20 Wn1 (planned/DIAGNOSES_2026-10-27.md): same setup as planned/wind20_run.js (no plan check), arms A0 and A2,
// bands still and p99, 20 hours/seeds; each wide cross-company meeting is labelled by the two segments' phase labels (sg[8]) and operator pair.
// Usage: node planned/diag_wind20_wn1.js <hou|dfw> -> out/diag_wn1_<metro>.jsonl
const fs = require('fs'), path = require('path'), L = require('../lab/lab_engine.js'), WD = require('./wind.js');
const metro = process.argv[2]; WD.useFile(path.join(__dirname, { hou: '../data/openmeteo_houston_2025.json', dfw: '../data/openmeteo_dfw_2025.json' }[metro]));
const cfg = { half: 22000, zone: 6000, warm: 3600, meas: 7200 }, d = 4, H = { A0: { wing: [46, 91], aOut: 61, zip: 101, aIn: 105 }, A2: { wing: [46, 71], aOut: 81, zip: 101, aIn: 115 } };
const P99 = WD.bandHours(0.97, 1.0, 20), out = `out/diag_wn1_${metro}.jsonl`; fs.writeFileSync(out, '');
for (const arm of ['A0', 'A2']) for (const band of ['still', 'p99']) for (let k = 0; k < 20; k++) { const seed = k + 1, fl = L.flights(cfg, L.sites(cfg, d, seed), seed, H[arm]), h = band === 'still' ? null : WD.hourWind(P99[k]);
  const fly = h ? fl.map(f => WD.retime(f, h)) : fl, tag = {};
  L.count(cfg, fly, { sub: 4, tEnd: cfg.warm + cfg.meas, onMeet: (nm, A, B) => { if (nm !== 'wide' || A[1] === B[1]) return; const ph = [A[5], B[5]].map(p => p).sort().join('+'), op = [A[1], B[1]].sort().join('-'), key = op + '|' + ph; tag[key] = (tag[key] || 0) + 1; } });
  fs.appendFileSync(out, JSON.stringify({ metro, arm, band, k, tag }) + '\n'); }
console.log('done', metro);
