'use strict';
// Exploratory diagnosis of COORD1 C5 (planned/DIAGNOSES_2026-10-27.md): why do 14-15 % of V2 flights leave their reserved windows?
// Variants on COORD1's A2 + V2 runs (seeds 1-3, both metros): PERFECT = plans timed with the actual hour's wind (no forecast error);
// P50 = a typical-wind hour (45th-55th percentile of 120 m wind) with the same persistence forecast. Conformance only (no conflict count).
// Usage: node planned/diag_coord1_c5.js -> out/diag_c5.jsonl
const fs = require('fs'), path = require('path'), L = require('../lab/lab_engine.js'), W = require('./wind.js'), C = require('./coord.js');
const MET = { houston: { R: require('./houreal.js'), cfg: { half: 51000, zone: 34000, warm: 3600, meas: 7200 }, wind: 'data/openmeteo_houston_2025.json' },
  dfw: { R: require('./dfwreal.js'), cfg: { half: 57000, zone: 40000, warm: 3600, meas: 7200 }, wind: 'data/openmeteo_dfw_2025.json' } };
const A2 = { wing: [46, 71], aOut: 81, zip: 101, aIn: 115 };
for (const m of ['houston', 'dfw']) for (const v of ['COORD1', 'PERFECT', 'P50']) for (let s = 1; s <= 3; s++) {
  W.useFile(path.join(__dirname, '..', MET[m].wind)); const hrs = v === 'P50' ? W.bandHours(0.45, 0.55, 3) : W.bandHours(0.85, 0.95, 3);
  const cfg = MET[m].cfg, fl = L.flights(cfg, MET[m].R.sites(cfg, s), s, A2), ha = hrs[s - 1], wa = W.hourWind(ha), wp = v === 'PERFECT' ? wa : W.hourWind(ha - 1);
  const planned = fl.map(f => W.retime(f, wp)), r = C.check(cfg, planned, C.VOL.V2); let n = 0, any = 0, frac = 0, early = 0, late = 0;
  const pById = new Map(planned.map(f => [f.id, f]));
  for (const f of fl) { const D = r.delays.get(f.id); if (D === undefined || D === null || f.t0 < cfg.warm || f.t0 >= cfg.warm + cfg.meas) continue;
    const g = W.retime(C.shift(f, D), wa), BL = r.blocks.get(f.id), c = C.conformance(pById.get(f.id), BL, D, g); n++; if (c.any) any++; frac += c.frac;
    // direction: compare flown vs planned end time
    const pe = pById.get(f.id).end + D, ge = g.end; if (c.any) { if (ge > pe) late++; else early++; } }
  const out = { metro: m, variant: v, seed: s, hour: wa.time, wind120: [wp.s[2][1], wa.s[2][1]], flights: n, leaveShare: any / n, timeShare: frac / n, lateShare: late / Math.max(1, any) };
  fs.appendFileSync('out/diag_c5.jsonl', JSON.stringify(out) + '\n'); console.log(JSON.stringify(out)); }
