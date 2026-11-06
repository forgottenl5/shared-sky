'use strict';
// Exploratory diagnosis after FAIR (not registered): per flight, seconds spent changing height inside other operators' cruise bands (+-10 m), by operator and profile.
const F = require('./fair.js'), H2 = require('./houston2.js'), P = require('./proc.js');
const BAND = { wing: [36, 81], zipline: [91, 111], amazon: [[71, 91], [105, 125]] };
const inBand = (o, z) => o === 'amazon' ? BAND.amazon.some(b => z >= b[0] && z <= b[1]) : z >= BAND[o][0] && z <= BAND[o][1];
for (const inPlace of [false, true]) { const S = H2.sites(3, 4), fl = F.flights(S, 4, inPlace), acc = {};
  for (const f of fl) { const a = acc[f.op] || (acc[f.op] = { n: 0, vert: 0, foreign: 0, dur: 0 }); a.n++; a.dur += f.end - f.t0;
    for (const sg of f.sg) for (let q = 0; q < sg[1]; q++) { const p = P.posAt(sg, sg[0] + q); if (sg[4] === sg[7]) continue; a.vert++; if (['wing', 'zipline', 'amazon'].some(o => o !== f.op && inBand(o, p[2]))) a.foreign++; } }
  console.log(inPlace ? 'F1 Amazon in place' : 'F0 filed'); for (const [o, a] of Object.entries(acc)) console.log(`  ${o}: flight ${(a.dur / a.n).toFixed(0)} s, changing height ${(a.vert / a.n).toFixed(0)} s, of which inside other operators' bands ${(a.foreign / a.n).toFixed(0)} s`); }
