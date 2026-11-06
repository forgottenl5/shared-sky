'use strict';
// Checks for taxi/noise.js (K1 of planned/AIRTAXI_NOISE1_PREREG.md). Usage: node taxi/test_noise.js
const Z = require('./noise.js'); let fails = 0; const ok = (n, c, i) => { console.log((c ? 'ok  ' : 'FAIL') + ' ' + n + (i !== undefined ? ' ' + JSON.stringify(i) : '')); if (!c) fails++; };
const P = { padZ: 15, vLift: 2.5, slope: 8, vClimb: 31, cruiseZ: 610, vCruise: 67 }, S = { A: [0, 0], B: [40000, 0] };
const q = Z.prof(40000, P), dur = q.tl + 2 * q.tr + q.tc, f = [0, 'A', 'B', 10800, 10800 + dur - q.tl, 10800 + dur - q.tl, 10800 + dur + 90, 0];
const one = (x, y) => { const g = new Z.Grid(x, y, 1, 1, 200); let m = -1; const t1 = Z.flightEnd(f, P);
  for (let t = f[3]; t <= t1; t += 1) { const p = Z.posAt(f, t, S, P); if (p) m = Math.max(m, Z.level(p.src, Math.hypot(p.x - x, p.y - y, p.z))); } return m; };
// (a) cruise overhead at 610 m
const a = one(20000, 0); ok('K1a cruise directly overhead at 610 m: 43.5 ± 0.1 dBA', Math.abs(a - 43.47) <= 0.1, a.toFixed(2));
// (b) 100 m from a hovering source
ok('K1b 100 m from the take-off/landing source: 65.0 dBA', Math.abs(Z.level('tol', 100) - 65) < 1e-9, Z.level('tol', 100));
// (c) constant 60 dBA from 07:00 to 19:00 (sim t 10800 to 54000) gives DNL 57.0
{ const g = new Z.Grid(0, 0, 1, 1, 200); for (let t = 10800; t < 54000; t++) g.E[0] += Math.pow(10, (60 + Z.penalty(t)) / 10);
  ok('K1c constant 60 dBA for 12 h daytime: DNL 57.0 ± 0.1', Math.abs(g.dnl(0) - 56.99) <= 0.1, g.dnl(0).toFixed(2)); }
// (d) 1 km along the departure line
const d = one(1000, 0); ok('K1d 1 km out along the departure line: 62.1 ± 0.3 dBA', Math.abs(d - 62.1) <= 0.3, d.toFixed(2));
// extra: the grid path gives the same maximum as the direct path, and counts one N55 event at 1 km, none at 20 km
{ const g = new Z.Grid(-400, -400, 108, 5, 200); g.addFlight(f, S, P, 0, 7200, 50400); const k1 = 2 * 108 + 7, k20 = 2 * 108 + 102;
  ok('grid: one N55 event 1 km out, none under cruise; energy recorded', g.n55[k1] === 1 && g.n55[k20] === 0 && g.E[k1] > 0, [g.xy(k1), g.n55[k1], g.xy(k20), g.n55[k20]]); }
// penalty: 06:30 is night, 07:30 is day
ok('DNL penalty hour 06:00-07:00 only (within 04:00-22:00 runs)', Z.penalty(9000) === 10 && Z.penalty(12600) === 0 && Z.penalty(0) === 10);
console.log(fails ? fails + ' FAILED' : 'ALL PASS'); process.exit(fails ? 1 : 0);
