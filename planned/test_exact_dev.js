'use strict';
// Tests for planned/exact_dev.js and its hooks (RECHECK_A2). node planned/test_exact_dev.js
const H2 = require('./houston2.js'), VR = require('./vrate.js'), DV = require('./deviate.js'), RT = require('./rth.js'), O = require('./outage.js'), EX = require('./exact_dev.js');
let pass = 0, fail = 0; const ok = (c, m) => { if (c) { pass++; console.log('ok  ', m); } else { fail++; console.log('FAIL', m); } };
const K = ['wide|cross', 'close|cross', 'wide|same', 'close|same'], eq = (a, b) => K.every(k => (a[k] || 0) === (b[k] || 0)), s4 = c => K.map(k => c[k] || 0).join('/');
const pos = (f, t) => { const s = f.sg.find(q => t >= q[0] && t < q[0] + q[1]) || f.sg[f.sg.length - 1], u = Math.min(1, Math.max(0, (t - s[0]) / s[1])); return [0, 1, 2].map(i => s[2 + i] + (s[5 + i] - s[2 + i]) * u); };
const jumps = f => { let m = 0; for (let i = 1; i < f.sg.length; i++) { const a = f.sg[i - 1], b = f.sg[i]; m = Math.max(m, Math.hypot(a[5] - b[2], a[6] - b[3], a[7] - b[4])); } return m; };
delete process.env.SKY_EXACT_DEV; delete process.env.SKY_BOUND;
const fl = VR.flights(H2.sites(3, 1), 1, 'V0'), mid = f => f.t0 + Math.floor((f.end - f.t0) / 2);

// 1. a 0 s exact hold of every flight changes nothing, counted once per second
{ const base = H2.count(fl), z = H2.count(fl.map(f => EX.hold(f, mid(f), 0))); ok(eq(base, z), `0 s exact hold of every flight, 1 check/s: identical (${s4(base)})`); }

// 2. hooks: default keeps the old 1 s steps; SKY_EXACT_DEV=1 gives split segments with one 120 s hover
{ const f = fl.find(q => q.end - q.t0 > 900), off = 400;
  const a = DV.deviated(f, off, 'HOLD'); ok(a.sg.every(s => s[1] === 1) && a.td === f.t0 + off, 'default deviated(): old 1 s steps (unchanged)');
  process.env.SKY_EXACT_DEV = '1'; const b = DV.deviated(f, off, 'HOLD'), c = DV.deviated(f, off, 'LAND'), r = RT.rth(f, off, 120), o = O.hold(f, f.t0 + off); delete process.env.SKY_EXACT_DEV;
  const hv = b.sg.filter(s => s[8] === 'hover' && s[9] === 'dev');
  ok(hv.length === 1 && hv[0][1] === 120 && b.end === f.end + 120 && b.dev === 'HOLD' && b.td === f.t0 + off, 'exact HOLD: one 120 s hover, end +120 s, dev/td kept');
  const p0 = pos(f, f.t0 + off + 300), p1 = pos(b, f.t0 + off + 420); ok(Math.hypot(p0[0] - p1[0], p0[1] - p1[1], p0[2] - p1[2]) < 1e-6, 'exact HOLD: same path 120 s later');
  ok(jumps(b) < 1e-6 && jumps(c) < 1e-6 && jumps(r) < 1e-6 && jumps(o) < 1e-6, 'exact HOLD / LAND / RTH / outage hold: no jumps between segments');
  const L = c.sg[c.sg.length - 1], R = r.sg[r.sg.length - 1]; ok(L[7] === 0 && R[7] === 0 && R[5] === f.sg[0][2] && R[6] === f.sg[0][3], 'exact LAND ends on the ground; exact RTH ends on the pad at 0 m');
  const climb = r.sg.find(s => s[8] === 'vertical' && s[9] === 'dev'); ok(!climb || Math.abs(climb[7] - climb[4]) / climb[1] <= RT.VZ + 1e-9, 'exact RTH climbs no faster than VZ'); }

// 3. SKY_BOUND=1 equals an explicit tEnd at the end of the measured window, and counts no more than the default
{ const dflt = H2.count(fl, { sub: 4 }); process.env.SKY_BOUND = '1'; const b = H2.count(fl, { sub: 4 }); delete process.env.SKY_BOUND; const t = H2.count(fl, { sub: 4, tEnd: 3600 + 7200 });
  ok(eq(b, t), `SKY_BOUND=1 equals tEnd = 10,800 s (${s4(b)})`); ok(K.every(k => (b[k] || 0) <= (dflt[k] || 0)), `bounded <= default (${s4(b)} vs ${s4(dflt)})`); }

console.log(`\n${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
