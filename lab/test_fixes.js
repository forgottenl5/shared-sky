'use strict';
// Tests for the opt-in engine fixes of 22 Nov 2026 (review): FIX1 exact deviations, FIX2 hashed per-flight random streams, FIX3 bounded run().
// node lab/test_fixes.js   (a few minutes; uses a d = 3 km demo patch like the site)
const L = require('./lab_engine.js'), E = require('./errors.js');
let pass = 0, fail = 0; const ok = (c, m) => { if (c) { pass++; console.log('ok  ', m); } else { fail++; console.log('FAIL', m); } };
const TH = [['wide', 30, 10], ['close', 15, 5]];
const seg = (t0, n, a, b, ph = 'cruise') => [t0, n, a[0], a[1], a[2], b[0], b[1], b[2], ph, 'x'];
const cnt = (fl, o = {}) => L.count({ warm: 0, zone: 5000 }, fl, Object.assign({ sub: 4, th: TH }, o));

// --- 1. analytic: two straight crossings with known closest approach (counter itself)
{ const mk = off => [{ id: 1, op: 'a', t0: 0, end: 100, sg: [seg(0, 100, [-1500, 0, 60], [1500, 0, 60])] },
                     { id: 2, op: 'b', t0: 0, end: 100, sg: [seg(0, 100, [1500, off, 60], [-1500, off, 60])] }];   // head-on, 60 m/s closing
  ok((cnt(mk(25))['wide|cross'] || 0) === 1, 'head-on at 25 m offset counted once (30 m rule)');
  ok((cnt(mk(35))['wide|cross'] || 0) === 0, 'head-on at 35 m offset not counted');
  ok((cnt(mk(10))['close|cross'] || 0) === 1, 'head-on at 10 m offset counted once (15 m rule)'); }

// --- 2. FIX1: hold(f, T, 0, exact) is the flight itself; exact hold keeps geometry; default hold undercounts (documents bug 1)
{ const cfg = { half: 9000, zone: 6000, warm: 3600, meas: 7200 }, S = L.sites(cfg, 3, 1, L.RATIO), fl = L.flights(cfg, S, 1, L.HEIGHTS.filed);
  const base = cnt(fl, { tEnd: cfg.warm + cfg.meas }), T = f => f.t0 + Math.floor((f.end - f.t0) / 2);
  const ident = fl.map(f => L.hold(f, T(f), 0, { exact: true })), c1 = cnt(ident, { tEnd: cfg.warm + cfg.meas });
  // at 1 check per second the split is exact; at 4 per second the engine's +0.5 s / end-clamp timing leaves a <= 0.5 s pause at the split
  const b1 = cnt(fl, { tEnd: cfg.warm + cfg.meas, sub: 1 }), e1 = cnt(ident, { tEnd: cfg.warm + cfg.meas, sub: 1 });
  ok(['wide|cross', 'close|cross', 'wide|same', 'close|same'].every(k => (e1[k] || 0) === (b1[k] || 0)), `exact hold of 0 s, 1 check/s: every count identical (${b1['wide|cross']}/${b1['close|cross']}/${b1['wide|same']})`);
  const rel = k => Math.abs((c1[k] || 0) - (base[k] || 0)) / Math.max(1, base[k] || 0);
  ok(['wide|cross', 'close|cross', 'wide|same'].every(k => rel(k) <= 0.02), `exact hold of 0 s, 4 checks/s: within 2 % (${c1['wide|cross']}/${c1['close|cross']}/${c1['wide|same']} vs ${base['wide|cross']}/${base['close|cross']}/${base['wide|same']})`);
  const old = fl.map(f => L.hold(f, T(f), 0)), c0 = cnt(old, { tEnd: cfg.warm + cfg.meas });
  ok(c0['wide|cross'] < base['wide|cross'], `default (old) hold of 0 s undercounts: ${c0['wide|cross']} vs ${base['wide|cross']} (bug 1, kept for reproducibility)`);
  const f = fl.find(q => q.end - q.t0 > 600), h = L.hold(f, f.t0 + 300, 120, { exact: true });
  const pA = L.posAt(f.sg.find(s => f.t0 + 400 >= s[0] && f.t0 + 400 < s[0] + s[1]), f.t0 + 400), pB = L.posAt(h.sg.find(s => f.t0 + 520 >= s[0] && f.t0 + 520 < s[0] + s[1]), f.t0 + 520);
  ok(Math.hypot(pA[0] - pB[0], pA[1] - pB[1], pA[2] - pB[2]) < 1e-6 && h.end === f.end + 120, 'exact 120 s hold: same path 120 s later, end shifted by 120 s');
  const r = L.rth(f, 300, null, { exact: true }); ok(r.sg.every(s => s[1] >= 1) && Math.abs(r.sg[r.sg.length - 1][7]) < 1e-9 && r.sg[r.sg.length - 1][5] === f.sg[0][2], 'exact return-home ends on the pad at 0 m'); }

// --- 3. FIX2: hashed per-flight streams are independent across neighbouring ids and seeds
{ const N = 20000, corr = (a, b) => { const ma = a.reduce((s, x) => s + x, 0) / a.length, mb = b.reduce((s, x) => s + x, 0) / b.length; let c = 0, va = 0, vb = 0; for (let i = 0; i < a.length; i++) { c += (a[i] - ma) * (b[i] - mb); va += (a[i] - ma) ** 2; vb += (b[i] - mb) ** 2; } return c / Math.sqrt(va * vb); };
  for (const [name, P] of [['old', E.personal(E.LEVELS.L4, 1)], ['hashed', E.personal(E.LEVELS.L4, 1, 1, { hashRng: true })]]) {
    const z = [], hx = [], sl = []; for (let id = 0; id < N; id++) { z.push(P.zerr(id)); hx.push(P.herr(id)[0]); sl.push(P.slip(id)); }
    const r1 = Math.max(...[z, hx, sl].map(v => Math.abs(corr(v.slice(0, -1), v.slice(1)))));
    if (name === 'old') ok(r1 > 0.2, `old streams: neighbouring flights correlated (|r| up to ${r1.toFixed(2)}; bug 2, kept for reproducibility)`);
    else ok(r1 < 0.03, `hashed streams: neighbouring flights independent (|r| up to ${r1.toFixed(3)})`); }
  // identical streams (old scheme: rng(1*7919 + 8000*31) === rng(32*7919 + 81*31)); a single repeated 32-bit draw is expected by chance (~4.7 in 200,000)
  const same = (A, B) => A() === B() && A() === B() && A() === B();
  ok(same(L.rng(1 * 7919 + 8000 * 31 + 101), L.rng(32 * 7919 + 81 * 31 + 101)), 'old seeding: (seed 1, flight 8000) and (seed 32, flight 81) share one stream (bug 2)');
  const seen = new Map(); let dup = 0; for (let s = 1; s <= 40; s++) for (let id = 0; id < 5000; id++) { const g = L.hrng(s, id, 101), k = g() + ':' + g(); if (seen.has(k)) dup++; seen.set(k, 1); }
  ok(dup === 0, `hashed streams: no two of 200,000 (seed, flight) pairs share their first two draws (${dup})`);
  const g = L.hrng(7, 9, 3), m = Array.from({ length: 100000 }, g).reduce((s, x) => s + x, 0) / 100000; ok(Math.abs(m - 0.5) < 0.005, `hashed stream mean ${m.toFixed(4)} (uniform)`); }

// --- 4. FIX3: run() with fix.bounded equals count bounded at the window end; default unchanged
{ const cfg = { half: 9000, zone: 6000, warm: 3600, meas: 7200 };
  const a = L.run(cfg, { d: 3, seed: 2, heights: 'filed' }), b = L.run(cfg, { d: 3, seed: 2, heights: 'filed', fix: { bounded: true } });
  const S = L.sites(cfg, 3, 2, L.RATIO), fl = L.flights(cfg, S, 2, L.HEIGHTS.filed), c = cnt(fl, { tEnd: cfg.warm + cfg.meas, sub: 4 });
  ok(b.cross_wide === (L.count(cfg, fl, { sub: 4, tEnd: cfg.warm + cfg.meas })['wide|cross'] || 0), `bounded run matches a bounded count (${b.cross_wide})`);
  ok(a.cross_wide >= b.cross_wide, `default run still counts past the window (${a.cross_wide} >= ${b.cross_wide})`); }

console.log(`\n${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
