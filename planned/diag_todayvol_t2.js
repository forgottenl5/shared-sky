'use strict';
// Exploratory diagnosis of TODAYVOL T2 (planned/DIAGNOSES_2026-10-27.md): full stage, A0, seeds 1-6, both metros.
// 'frozen' v20 = the cap flight list with each Amazon flight kept with probability 0.2 (separate random stream), so Wing and Zipline flights are identical to cap.
// Output: out/diag_t2.jsonl
const fs = require('fs'), L = require('../lab/lab_engine.js');
const MET = { houston: { B: require('./buildout.js'), cfg: { half: 59000, zone: 42000, warm: 3600, meas: 7200 } }, dfw: { B: require('./dfwbuild.js'), cfg: { half: 57000, zone: 40000, warm: 3600, meas: 7200 } } };
const A0 = { wing: [46, 91], aOut: 61, zip: 101, aIn: 105 };
function pairs(cfg, fl) { const c = L.count(cfg, fl, { sub: 4, tEnd: cfg.warm + cfg.meas }), p = {}; for (const k in c) { const q = k.match(/^wide\|pair\|(.+)$/); if (q && q[1].split('-')[0] !== q[1].split('-')[1]) p[q[1]] = c[k]; } return { w: c['wide|cross'] || 0, p }; }

for (const m of (process.env.METRO ? [process.env.METRO] : ['houston', 'dfw'])) for (let s = 1; s <= (+process.env.SEEDS || 6); s++) { const cfg = MET[m].cfg, fl = L.flights(cfg, MET[m].B.sites(cfg, s, 'full'), s, A0), r = L.rng(s + 555000);
  const fz = fl.filter(f => f.op !== 'amazon' || r() < 0.2), noA = fl.filter(f => f.op !== 'amazon');
  const o = { metro: m, seed: s, cap: pairs(cfg, fl), frozen: pairs(cfg, fz), noAmazon: pairs(cfg, noA) }; fs.appendFileSync('out/diag_t2.jsonl', JSON.stringify(o) + '\n'); console.log(m, s, JSON.stringify(o.cap.p), JSON.stringify(o.frozen.p), JSON.stringify(o.noAmazon.p)); }
