'use strict';
// Exploratory diagnosis of PADS F3 (planned/DIAGNOSES_2026-10-27.md): Zipline Houston at 1x and 2x with 20, 36 and 72 docks, pad pitch 30 m, seeds 1-3.
// Same site, flights and pad-assignment rule as planned/pads_run.js (copied, docks made a parameter). Also reports flight duration so Little's law can be checked.
const fs = require('fs'), L = require('../lab/lab_engine.js');
const cfg = { half: 20000, zone: 20000, warm: 3600, meas: 7200 }, END = cfg.warm + cfg.meas, TURN = 60, H = { wing: [46, 91], aOut: 61, zip: 101, aIn: 105 };
function grid(n, pitch) { const k = Math.ceil(Math.sqrt(n)), out = []; for (let i = 0; i < n; i++) { const a = i % k, b = Math.floor(i / k); out.push([(a - (k - 1) / 2) * pitch, (b - (k - 1) / 2) * pitch]); } return out; }
function waits(fl, nP) { const free = new Array(nP).fill(-Infinity), w = [];
  for (const f of fl.slice().sort((a, b) => a.t0 - b.t0 || a.id - b.id)) { let k = 0; for (let j = 1; j < nP; j++) if (free[j] < free[k]) k = j; const d = Math.max(0, Math.ceil(free[k] - f.t0)); free[k] = f.end + d + TURN; if (f.t0 >= cfg.warm && f.t0 < END) w.push(d); }
  return { mean: Math.round(w.reduce((a, b) => a + b, 0) / w.length), max: Math.max(...w), share: w.filter(x => x > 0).length / w.length }; }
const out = [];
for (const mult of [1, 2]) for (let s = 1; s <= 3; s++) { const fl = L.flights(cfg, [{ op: 'zipline', c: [0, 0], rate: L.OP.zipline.rate * mult }], s, H), m = fl.filter(f => f.t0 >= cfg.warm && f.t0 < END);
  const dur = m.reduce((a, f) => a + (f.end - f.t0), 0) / m.length, perH = m.length / 2;
  for (const n of [20, 36, 72]) { const r = { mult, seed: s, docks: n, flightsPerHour: perH, meanFlight_s: Math.round(dur), littleDocks: +(perH / 3600 * (dur + TURN)).toFixed(1), ...waits(fl, n) }; out.push(r); console.log(JSON.stringify(r)); } }
fs.writeFileSync('out/diag_pads_f3.jsonl', out.map(r => JSON.stringify(r)).join('\n') + '\n');
