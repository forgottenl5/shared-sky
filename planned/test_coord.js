'use strict';
// K1 checks for planned/coord.js (COORD1_PREREG.md). Usage: node planned/test_coord.js
const C = require('./coord.js'); let fails = 0; const ok = (n, c, i) => { console.log((c ? 'ok  ' : 'FAIL') + ' ' + n + (i !== undefined ? ' ' + JSON.stringify(i) : '')); if (!c) fails++; };
const cfg = { half: 20000, zone: 20000, warm: 0, meas: 7200 };
// a straight cruise flight: climb 10 s at the start point, cruise 4 km in 160 s at height z, descend 10 s
const fly = (id, op, t0, a, b, z) => { const n = 160; return { id, op, t0, sg: [[t0, 10, a[0], a[1], 0, a[0], a[1], z], [t0 + 10, n, a[0], a[1], z, b[0], b[1], z], [t0 + 10 + n, 10, b[0], b[1], z, b[0], b[1], 0]].map(s => s.concat(['cruise', 'out'])), end: t0 + 180 }; };
const V = C.VOL.V2;
// (a) crossing at the same moment: A west->east along y=0, B south->north along x=0, both reach the crossing 90 s after take-off
const A = fly(0, 'wing', 1000, [-2000, 0], [2000, 0], 60), B = fly(1, 'amazon', 1001, [0, -2000], [0, 2000], 60);
{ const r = C.check(cfg, [A, B], V, { all: true }), d = r.delays.get(1);
  // expected: the smallest 30 s step clearing every pair of overlapping blocks; computed by brute force on the block windows
  const ba = C.blocks(A, V), bb = C.blocks(B, V); let want = null;
  for (let k = 0; k < C.TRIES && want === null; k++) { const D = k * C.STEP; let bad = false;
    for (const x of ba) for (const y of bb) { const tw = !(A.t0 + x.w0 > B.t0 + D + y.w1 || B.t0 + D + y.w0 > A.t0 + x.w1), zz = !(x.zlo >= y.zhi || y.zlo >= x.zhi);
      if (tw && zz && C.segDist(x.px, x.py, x.qx, x.qy, y.px, y.py, y.qx, y.qy) < 2 * V.w) bad = true; }
    if (!bad) want = D; }
  ok('K1a crossing pair: later-filed flight delayed by the smallest clearing 30 s step', r.delays.get(0) === 0 && d === want && d > 0, { got: d, want }); }
// (b) 200 m apart sideways: B runs along x = 200... make both parallel west->east, 200 m apart
{ const P = fly(1, 'amazon', 1001, [-2000, 200], [2000, 200], 60), r = C.check(cfg, [A, P], V, { all: true }); ok('K1b parallel 200 m apart: no delay', r.delays.get(1) === 0); }
// (c) height separation above vA + vB (20 m): 21 m apart
{ const H = fly(1, 'amazon', 1001, [0, -2000], [0, 2000], 81), r = C.check(cfg, [A, H], V, { all: true }); ok('K1c 21 m apart in height (bands 2 x 10 m): no delay', r.delays.get(1) === 0); }
// (d) same company crossing: no delay
{ const S = fly(1, 'wing', 1001, [0, -2000], [0, 2000], 60), r = C.check(cfg, [A, S], V, { all: true }); ok('K1d same-company crossing: no delay', r.delays.get(1) === 0); }
// (e) conformance: flown as planned conforms; flown 30 % slower leaves V1 windows
{ const V1 = C.VOL.V1, bl = C.blocks(A, V1), same = C.conformance(A, bl, 0, A);
  const slow = { id: 0, op: 'wing', t0: A.t0, sg: [[A.t0, 10, ...A.sg[0].slice(2)], [A.t0 + 10, 208, ...A.sg[1].slice(2)], [A.t0 + 218, 10, ...A.sg[2].slice(2)]] };
  const s = C.conformance(A, bl, 0, slow);
  ok('K1e flown as planned conforms; 30 % slower cruise leaves its V1 windows', !same.any && same.frac === 0 && s.any && s.frac > 0, { same, slow: s }); }
// segment distance sanity
ok('segDist: crossing 0, parallel 200', C.segDist(-1, 0, 1, 0, 0, -1, 0, 1) === 0 && Math.abs(C.segDist(0, 0, 10, 0, 0, 200, 10, 200) - 200) < 1e-9);
console.log(fails ? fails + ' FAILED' : 'ALL PASS'); process.exit(fails ? 1 : 0);
