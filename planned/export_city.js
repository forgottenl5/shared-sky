'use strict';
// Export for the "Sky-Grid Houston" city page (lab engine = research engine, test_lab_engine.js).
// HOUSTON2 build-out d = 3 km, seed 1, research config (44 km area, 12 km counted zone, 1 h warm-up, 2 h measured).
// Scenarios: filed heights; allocation; allocation + plan check; and holds (20 % of in-zone flights hover 120 s) with the plan check, filed vs allocation.
// Flights in or near the zone are exported as planned segments in compact form: [op, t0, x0, y0, z0, (dt, x1, y1, z1)...] keyframes, collinear points dropped (1 m).
// Cross-operator meetings counted at 4 checks per second.
const fs = require('fs'), L = require('../lab/lab_engine.js');
const cfg = { half: 22000, zone: 6000, warm: 3600, meas: 7200 }, Z = cfg.zone, MG = 600, OPS = { wing: 0, zipline: 1, amazon: 2 };
const METRO = process.env.METRO || 'hou', MIX = METRO === 'dfw' ? { ratio: { wing: 1, zipline: 1, amazon: 6 / 75 }, rateMul: { zipline: 400 / 950 } } : {};
const base0 = { d: 3, seed: 1, wingFixed: null, fleet: 'filed', check: false, cell: 30, tb: 5, vsep: 10, contingency: 'none', frac: 0.2, sub: 4 }, base = Object.assign({}, base0, MIX);
const REP = { wing: [46, 91], aOut: 69, zip: 101, aIn: 122 };   // high-return case: 122 m return unsourced (AMZSRC)
const SRC = { wing: [46, 91], aOut: 69, zip: 101, aIn: [85, 115] };   // best-sourced Amazon heights (AMZSRC S1)
// 28 Oct 2026: 'checked' is now the realistic reserved-block plan check (COORD1 volumes V2, planned/coord.js) in still air, and 'layered' adds
// LAYER2's fix (Zipline on top, 5 m blocks). The bad-day scenarios keep the minimal +-5 s check, as the BAD-day studies used.
const C = require('./coord.js'), WAZ = { wing: [46, 71], aOut: 83, aIn: 95, zip: 107 }, V2v5 = { w: 30, v: 5, h0: 10, g: 0.05 };   // as planned/layer2_run.js
const SC = { filed: { heights: 'filed' }, shared: { heights: 'allocation' }, checked: { heights: 'allocation', vcheck: (c, f) => C.check(c, f, C.VOL.V2) },
  layered: { heights: WAZ, vcheck: (c, f) => C.check(c, f, V2v5) },
  holdFiled: { heights: 'filed', check: true, contingency: 'hold' }, holdShared: { heights: 'allocation', check: true, contingency: 'hold' },
  reported: { heights: REP }, holdReported: { heights: REP, check: true, contingency: 'hold' }, sourced: { heights: SRC } };
const T0 = +(process.argv[3] || 3600), T1 = +(process.argv[4] || 10800), near = (x, y) => Math.abs(x) <= Z + MG && Math.abs(y) <= Z + MG;
const S = L.sites(cfg, base.d, base.seed, MIX.ratio), out = { meta: { metro: METRO, d_km: 3, seed: 1, zone_m: 2 * Z, t0: T0, t1: T1 }, sites: S.filter(s => near(s.c[0], s.c[1])).map(s => [OPS[s.op], Math.round(s.c[0]), Math.round(s.c[1])]), sc: {} };
let broken = 0;
for (const k in SC) { const r = L.run(cfg, Object.assign({}, base, SC[k])), F = [];
  for (const f of r.fin) { const sg = f.sg; if (f.end < T0 || f.t0 > T1 || !sg.some(s => near(s[2], s[3]) || near(s[5], s[6]))) continue;
    const K = f.dev ? sg.map(s => [s[0], s[2], s[3], s[4]]) : [[sg[0][0], sg[0][2], sg[0][3], sg[0][4]]].concat(sg.map(s => [s[0] + s[1], s[5], s[6], s[7]]));
    const Q = [K[0]]; for (let i = 1; i < K.length - 1; i++) { const A = Q[Q.length - 1], B = K[i + 1], w = (K[i][0] - A[0]) / Math.max(1e-9, B[0] - A[0]);
      if ([1, 2, 3].some(j => Math.abs(A[j] + (B[j] - A[j]) * w - K[i][j]) > 1)) Q.push(K[i]); else broken++; } Q.push(K[K.length - 1]);
    const a = [OPS[f.op], Q[0][0] - T0, Math.round(Q[0][1]), Math.round(Q[0][2]), Math.round(Q[0][3])];
    for (let i = 1; i < Q.length; i++) a.push(Q[i][0] - Q[i - 1][0], Math.round(Q[i][1]), Math.round(Q[i][2]), Math.round(Q[i][3]));
    F.push(a); }
  const ev = r.events.filter(e => e[1] >= T0 && e[1] < T1).map(e => [e[0], +(e[1] - T0).toFixed(1), e[2], e[3], e[4], e[5]]).sort((a, b) => a[1] - b[1]);
  out.sc[k] = { flights: F, events: ev, wide: ev.filter(e => !e[0]).length, close: ev.filter(e => e[0]).length, all_wide: r.cross_wide, all_close: r.cross_close, holds: r.contingencyEvents, delays: r.delays };
  console.log(k, 'flights', F.length, 'wide', out.sc[k].wide, 'close', out.sc[k].close, '(full', r.cross_wide, r.cross_close, ') holds', r.contingencyEvents, 'delayed', r.delays.delayed, '/', r.delays.checked); }
console.log('keyframes dropped as collinear', broken);
fs.writeFileSync(process.argv[2], JSON.stringify(out)); console.log('bytes', fs.statSync(process.argv[2]).size);
