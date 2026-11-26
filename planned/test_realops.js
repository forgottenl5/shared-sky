'use strict';
// Tests for planned/realops.js. node planned/test_realops.js
const RO = require('./realops.js'), L = require('../lab/lab_engine.js'); let bad = 0;
const ok = (n, c, i) => { console.log((c ? 'ok  ' : 'FAIL') + ' ' + n + (i !== undefined ? ' ' + JSON.stringify(i) : '')); if (!c) bad++; };
const dist = (a, b) => Math.hypot(b[0] - a[0], b[1] - a[1]), near = (a, b, e) => Math.abs(a - b) <= e;
// T1 profile: mean 1 over 07-22, busiest clock hour = P
for (const Pk of [1.5, 2, 2.5]) { const p = RO.profile(Pk), hm = h => { let s = 0; for (let k = 0; k < 600; k++) s += p.f(h + (k + 0.5) / 600); return s / 600; }, hrs = []; for (let h = 7; h < 22; h++) hrs.push(hm(h));
  ok(`T1 profile P=${Pk}: mean 1, busiest hour ${Pk}`, near(hrs.reduce((a, b) => a + b) / 15, 1, 0.005) && near(Math.max(...hrs), Pk, 0.01), [+(hrs.reduce((a, b) => a + b) / 15).toFixed(4), +Math.max(...hrs).toFixed(3)]); }
// T2 flyPath: straight 5 km at 26 m/s with 13 s / 15 s ends: length kept, time = cruise + ta/2 + td/2 extra over pure cruise
{ const T = new RO.Seg(0); RO.flyPath(T, [[0, 0], [5000, 0]], 50, 26, 13, 15, 'out'); const len = T.s.reduce((a, s) => a + dist([s[2], s[3]], [s[5], s[6]]), 0), dur = T.t;
  ok('T2 straight path: length 5000 m, duration 5000/26 + 14 s (+-3 s rounding)', near(len, 5000, 1) && near(dur, 5000 / 26 + 14, 3), [Math.round(len), dur]); }
// T3 turn: 90-degree corner at 26 m/s, 30-degree bank -> radius about 119 m; path shorter than the two legs, start and end kept
{ const T = new RO.Seg(0); RO.flyPath(T, [[0, 0], [2000, 0], [2000, 2000]], 50, 26, 0, 0, 'x'); const len = T.s.reduce((a, s) => a + dist([s[2], s[3]], [s[5], s[6]]), 0), R = RO.turnR(26), first = T.s[0], last = T.s[T.s.length - 1];
  ok('T3 turn radius 30-degree bank at 26 m/s is 117-121 m; corner cut, ends kept', near(R, 119, 2) && len < 4000 && len > 4000 - 2 * R && near(first[2], 0, 1e-6) && near(last[5], 2000, 1e-6) && near(last[6], 2000, 1e-6), [+R.toFixed(1), Math.round(len), last[5], last[6]]); }
// T4 Wing measured profile: climb from 6.7 m to 50 m in about 14 s; delivery hover 30 s at 7 m; total vertical phases as the noise report
{ const sg = RO.wingFlight(0, [0, 0], [3000, 0], 6.7 + 143 * 0.3048, null, true), climb = sg[2];
  ok('T4 Wing climb 22 ft to 165 ft takes about 14 s', climb[8] === 'vertical' && near(climb[1], 14, 1), climb[1]);
  const hov = sg.filter(s => s[8] === 'hover').map(s => [Math.round(s[4] * 10) / 10, s[1]]); ok('T4b Wing hovers: 30 s at 6.7 m (load), 30 s at 7.0 m (drop)', JSON.stringify(hov) === '[[6.7,30],[7,30]]', hov); }
// T5 Zipline DFW: 75 s up, no dropbox, 41 kt; Houston: dropbox hover 120 s, 70 mph
{ const d = RO.ziplineFlight(0, [0, 0], null, [5000, 0], 101, null, true, true), h = RO.ziplineFlight(0, [0, 0], [2000, 0], [5000, 0], 101, null, false, true);
  ok('T5 Zipline DFW: climb 75 s, one 75 s hover, cruise 21.1 m/s', d[0][1] === 75 && d.filter(s => s[8] === 'hover').length === 1 && near(dist([d[3][2], d[3][3]], [d[3][5], d[3][6]]) / d[3][1], 21.1, 0.6), d.filter(s => s[8] === 'hover').map(s => s[1]));
  ok('T5b Zipline Houston: 120 s dropbox hover then 75 s delivery hover', JSON.stringify(h.filter(s => s[8] === 'hover').map(s => s[1])) === '[120,75]'); }
// T6 detour clears a blocked line
{ const Z = { zeroAt: (x, y) => Math.abs(x - 5000) < 400 && Math.abs(y) < 400 }, v = RO.detour(Z, [0, 0], [10000, 0]);
  ok('T6 detour around a blocked square', v && RO.clear(Z, [0, 0], v, [0, 0]) && RO.clear(Z, v, [10000, 0], [0, 0]) && !RO.clear(Z, [0, 0], [10000, 0], [0, 0]), v); }
// T7 all factors off reproduces lab_engine flights exactly (both metros, seed 1, A2)
for (const [m, R, cfg] of [['houston', require('./houreal.js'), { half: 51000, zone: 34000, warm: 3600, meas: 7200 }], ['dfw', require('./dfwreal.js'), { half: 57000, zone: 40000, warm: 3600, meas: 7200 }]]) {
  const A = { wing: [46, 71], aOut: 81, zip: 101, aIn: 115 }, S = R.sites(cfg, 1), a = L.flights(cfg, S, 1, A), off = { prof: false, zdfw: false, pop: false, air: false, peak: false, amz15: false };
  const b = RO.flights(cfg, S, 1, A, { metro: m, factors: off }), same = a.length === b.length && a.every((f, i) => f.op === b[i].op && f.t0 === b[i].t0 && JSON.stringify(f.sg) === JSON.stringify(b[i].sg));
  ok(`T7 ${m}: all factors off = lab_engine flights exactly`, same, [a.length, b.length]); }
process.exit(bad ? 1 : 0);
