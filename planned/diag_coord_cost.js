'use strict';
// Exploratory diagnoses (planned/DIAGNOSES_2026-10-27.md), plan check only, plans on the previous hour's wind as COORD1:
//  part d2: DENS1 D2 (A2 delayed share stalls near 20 % from k = 1 to 2): A2 at k = 1 and 2 with V2 and with V2 but v = 5 m; reports delayed, cancelled, mean delay.
//  part blame: COORD2 G1-G3 (company costs under G20): who blocked each delayed flight at its planned time, and whether either block was a climb/descent.
// Usage: node planned/diag_coord_cost.js <d2|blame> <shard> <n> -> out/diag_cost_<part>_<shard>.jsonl
const fs = require('fs'), path = require('path'), L = require('../lab/lab_engine.js'), W = require('./wind.js'), C = require('./coord.js');
const MET = { houston: { R: require('./houreal.js'), cfg: { half: 51000, zone: 34000, warm: 3600, meas: 7200 }, wind: 'data/openmeteo_houston_2025.json' },
  dfw: { R: require('./dfwreal.js'), cfg: { half: 57000, zone: 40000, warm: 3600, meas: 7200 }, wind: 'data/openmeteo_dfw_2025.json' } };
const H = { A2: { wing: [46, 71], aOut: 81, zip: 101, aIn: 115 }, G20: { wing: [40, 60], aOut: 80, zip: 100, aIn: 120 } };
const VOLS = { V2: C.VOL.V2, V2v5: { w: 30, v: 5, h0: 10, g: 0.05 } };
const [part, sh, n] = [process.argv[2], +process.argv[3], +process.argv[4]];
const J = []; for (const m of ['houston', 'dfw']) for (let s = 1; s <= 3; s++) { if (part === 'd2') { for (const k of [1, 2]) for (const v of ['V2', 'V2v5']) J.push([m, s, 'A2', k, v]); } else J.push([m, s, 'G20', 1, 'V2']); }
for (const [m, s, hk, k, v] of J.filter((_, i) => i % n === sh)) {
  W.useFile(path.join(__dirname, '..', MET[m].wind)); const ha = W.bandHours(0.85, 0.95, 3)[s - 1], wp = W.hourWind(ha - 1), cfg = MET[m].cfg;
  const S = MET[m].R.sites(cfg, s).map(x => Object.assign({}, x, { rate: (x.rate || L.OP[x.op].rate) * k })), fl = L.flights(cfg, S, s, H[hk]);
  const t = Date.now(), r = C.check(cfg, fl.map(f => W.retime(f, wp)), VOLS[v], { blame: part === 'blame' }), out = { metro: m, seed: s, heights: hk, k, vol: v, by: {} };
  for (const f of fl) { if (!r.delays.has(f.id) || f.t0 < cfg.warm || f.t0 >= cfg.warm + cfg.meas) continue; const D = r.delays.get(f.id), b = out.by[f.op] || (out.by[f.op] = { n: 0, delayed: 0, cancelled: 0, sumD: 0, blame: {} }); b.n++;
    if (D === null) b.cancelled++; else if (D > 0) { b.delayed++; b.sumD += D; }
    if (part === 'blame' && D !== 0 && r.blame.has(f.id)) { const q = r.blame.get(f.id), key = q.op + (q.oVert ? ':vert' : ':level') + '/own' + (q.bVert ? ':vert' : ':level'); b.blame[key] = (b.blame[key] || 0) + 1; } }
  out.wall_s = (Date.now() - t) / 1000; fs.appendFileSync(`out/diag_cost_${part}_${sh}.jsonl`, JSON.stringify(out) + '\n'); console.log(m, s, hk, k, v, out.wall_s); }
