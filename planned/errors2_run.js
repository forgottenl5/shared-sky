'use strict';
// ERRORS2 runner (registration planned/ERRORS2_PREREG.md).
//   node planned/errors2_run.js checks          pre-run checks K1-K4
//   node planned/errors2_run.js <shard> <n>     -> out/errors2/runs_<shard>.jsonl   (resumes: finished jobs are skipped)
// Study D: the headline case (Amazon at best-sourced heights S1 vs shared-out heights A2) under the ERRORS1 error levels L0-L4.
//          Only S1 is run here; the A2 rows are ERRORS1's (same seeds, same error draws; check K2 confirms one is identical).
// Study C: errors split into a part shared by every aircraft at the same place and time (a smooth random field) and a personal part
//          per flight, for shares of the error variance rho = 0.5, 0.8, 0.95, at total sizes L2 and L4, arms S1 and A2.
// Study E: equivalence arms: personal part only (no shared field) at rho = 0.8, seeds 1-4, to test that a shared field does not matter at drone spacing.
const fs = require('fs'), L = require('../lab/lab_engine.js'), C = require('./coord.js');
const MET = { houston: { R: require('./houreal.js'), cfg: { half: 34000 + 17000, zone: 34000, warm: 3600, meas: 7200 } },
  dfw: { R: require('./dfwreal.js'), cfg: { half: 40000 + 17000, zone: 40000, warm: 3600, meas: 7200 } } };
const H = { S1: { wing: [46, 91], aOut: 69, zip: 101, aIn: [85, 115] }, A2: { wing: [46, 71], aOut: 81, zip: 101, aIn: 115 } };   // as HEADLINE2
const TH = [['v10', 30, 10], ['v15', 30, 15], ['v20', 30, 20], ['close', 15, 5]];
const K_RAD = Math.sqrt(-2 * Math.log(0.05)), K_VER = 1.96;
const LV = { L0: { h95: 0, v95: 0, slip: 0 }, L1: { h95: 3, v95: 4, slip: 5 }, L2: { h95: 8, v95: 13, slip: 15 }, L3: { h95: 15, v95: 33, slip: 30 }, L4: { h95: 30.48, v95: 45.72, slip: 60 } };   // as ERRORS1
const RHO = [0.5, 0.8, 0.95], LC = 20000, TC = 1800, NMODE = 24, GX = 500, GT = 150, XMAX = 41000, TMAX = 10800;   // shared field: correlation length 20 km, correlation time 30 min (assumptions; see registration)
function gauss(g) { const u = Math.max(1e-12, g()), v = g(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
// personal errors: identical draws to ERRORS1 (same seeds and streams), scaled by f = sqrt(1 - rho)
function errs(level, seed, f) { const e = LV[level], sh = f * e.h95 / K_RAD, sz = f * e.v95 / K_VER;
  return { zerr: sz ? (id => sz * gauss(L.rng(seed * 7919 + id * 31 + 101))) : null,
    herr: sh ? (id => { const g = L.rng(seed * 104729 + id * 37 + 7); return [sh * gauss(g), sh * gauss(g)]; }) : null,
    slip: e.slip ? (id => Math.round(Math.abs(e.slip * gauss(L.rng(seed * 15485863 + id * 41 + 3))))) : null }; }
// shared field: sum of NMODE random cosines per component; covariance sigma^2 exp(-r^2 / 2 LC^2) exp(-dt^2 / 2 TC^2)
function field(seed, sx, sz) { if (!sx && !sz) return null; const g = L.rng(seed * 2654435 + 977), M = [];
  for (let c = 0; c < 3; c++) { const m = []; for (let i = 0; i < NMODE; i++) m.push([gauss(g) / LC, gauss(g) / LC, gauss(g) / TC, 2 * Math.PI * g()]); M.push(m); }
  const A = [sx, sx, sz].map(s => s * Math.sqrt(2 / NMODE));
  const exact = (x, y, t) => M.map((m, c) => { if (!A[c]) return 0; let v = 0; for (const q of m) v += Math.cos(q[0] * x + q[1] * y + q[2] * t + q[3]); return A[c] * v; });
  // tabulated on a grid (GX m, GT s) over +-XMAX m and 0..TMAX s, interpolated (bilinear in space, linear in time); exact formula outside the grid
  const nx = 2 * XMAX / GX + 1, nt = TMAX / GT + 1, T = [0, 1, 2].map(() => new Float64Array(nx * nx * nt));
  for (let it = 0; it < nt; it++) for (let iy = 0; iy < nx; iy++) for (let ix = 0; ix < nx; ix++) { const v = exact(-XMAX + ix * GX, -XMAX + iy * GX, it * GT), o = (it * nx + iy) * nx + ix; for (let c = 0; c < 3; c++) T[c][o] = v[c]; }
  const f = (x, y, t) => { const fx = (x + XMAX) / GX, fy = (y + XMAX) / GX, ft = t / GT; if (fx < 0 || fy < 0 || ft < 0 || fx >= nx - 1 || fy >= nx - 1 || ft >= nt - 1) return exact(x, y, t);
    const ix = fx | 0, iy = fy | 0, it = ft | 0, ax = fx - ix, ay = fy - iy, at = ft - it, out = [0, 0, 0];
    for (let c = 0; c < 3; c++) { const D = T[c]; let v = 0; for (let dt = 0; dt < 2; dt++) { const o = ((it + dt) * nx + iy) * nx + ix, w = dt ? at : 1 - at;
      v += w * ((1 - ay) * ((1 - ax) * D[o] + ax * D[o + 1]) + ay * ((1 - ax) * D[o + nx] + ax * D[o + nx + 1])); } out[c] = v; } return out; };
  f.exact = exact; return f; }
function one(m, arm, level, rho, shared, seed) { const cfg = MET[m].cfg, S = MET[m].R.sites(cfg, seed), fl = L.flights(cfg, S, seed, H[arm]), e = LV[level];
  const E = errs(level, seed, Math.sqrt(1 - rho)), F = shared ? field(seed, Math.sqrt(rho) * e.h95 / K_RAD, Math.sqrt(rho) * e.v95 / K_VER) : null;
  const flown = E.slip ? fl.map(f => { const s = E.slip(f.id); return s ? C.shift(f, s) : f; }) : fl;
  const c = L.count(cfg, flown, { sub: 4, tEnd: cfg.warm + cfg.meas, th: TH, zerr: E.zerr, herr: E.herr, field: F });
  return { metro: m, arm, level, rho, shared: shared ? 1 : 0, seed, v10: c['v10|cross'] || 0, v15: c['v15|cross'] || 0, v20: c['v20|cross'] || 0, close: c['close|cross'] || 0, flights: fl.length }; }
const J = [];   // [study, metro, arm, level, rho, shared, seed]
for (let s = 1; s <= 6; s++) for (const m of ['houston', 'dfw']) {
  for (const lv of ['L0', 'L1', 'L2', 'L3', 'L4']) J.push(['D', m, 'S1', lv, 0, 0, s]);
  for (const lv of ['L2', 'L4']) for (const r of RHO) for (const arm of ['S1', 'A2']) J.push(['C', m, arm, lv, r, 1, s]);
  if (s <= 4) for (const lv of ['L2', 'L4']) for (const arm of ['S1', 'A2']) J.push(['E', m, arm, lv, 0.8, 0, s]); }
const key = j => j.join('|');
const run = j => Object.assign({ study: j[0] }, one(...j.slice(1)));
if (process.argv[2] === 'checks') { let bad = 0; const ok = (n, c, i) => { console.log((c ? 'ok  ' : 'FAIL') + ' ' + n + (i !== undefined ? ' ' + JSON.stringify(i) : '')); if (!c) bad++; };
  const rd = d => fs.readdirSync(d).flatMap(f => fs.readFileSync(d + '/' + f, 'utf8').split('\n').filter(Boolean).map(JSON.parse));
  const HL = rd('out/headline2'), E1 = rd('out/errors1');
  for (const m of ['houston', 'dfw']) { const r = one(m, 'S1', 'L0', 0, 0, 1), h = HL.find(x => x.metro === m && x.arm === 'S1' && x.seed === 1);
    ok(`K1 ${m} S1 seed 1, no errors = HEADLINE2`, h && r.v10 === h.v10 && r.v15 === h.v15 && r.v20 === h.v20 && r.close === h.close, [[r.v10, r.v15, r.v20, r.close], h && [h.v10, h.v15, h.v20, h.close]]); }
  { const r = one('houston', 'A2', 'L2', 0, 0, 1), e = E1.find(x => x.study === 'A' && x.metro === 'houston' && x.arm === 'A2' && x.level === 'L2' && x.seed === 1);
    ok('K2 houston A2 L2 seed 1 = ERRORS1 (same error draws)', e && r.v10 === e.v10 && r.v15 === e.v15 && r.close === e.close, [[r.v10, r.v15, r.close], e && [e.v10, e.v15, e.close]]); }
  { const cfg = MET.houston.cfg, S = MET.houston.R.sites(cfg, 1), fl = L.flights(cfg, S, 1, H.A2), o = { sub: 4, tEnd: cfg.warm + cfg.meas, th: [['v10', 30, 10]] };
    const a = L.count(cfg, fl, o), b = L.count(cfg, fl, Object.assign({}, o, { field: () => [0, 0, 0] }));
    ok('K3 a zero shared field changes nothing', a['v10|cross'] === b['v10|cross'], [a['v10|cross'], b['v10|cross']]); }
  { const F = field(3, 1, 1), g = L.rng(5), N = 4000; let s2 = 0; const pr = d => { let sxy = 0, sxx = 0, syy = 0; for (let i = 0; i < N; i++) { const x = (g() - 0.5) * 80000, y = (g() - 0.5) * 80000, t = g() * 10800, a = F(x, y, t)[2], b = F(x + d, y, t)[2]; sxy += a * b; sxx += a * a; syy += b * b; } return sxy / Math.sqrt(sxx * syy); };
    for (let i = 0; i < N; i++) { const v = F((g() - 0.5) * 80000, (g() - 0.5) * 80000, g() * 10800)[2]; s2 += v * v; }
    const sd = Math.sqrt(s2 / N), c30 = pr(30), c20k = pr(20000);
    ok('K4 shared field: sd within 25 % of 1 (one field, 24 modes), correlation at 30 m > 0.999, at 20 km between 0.3 and 0.9', Math.abs(sd - 1) < 0.25 && c30 > 0.999 && c20k > 0.3 && c20k < 0.9, [sd.toFixed(3), c30.toFixed(5), c20k.toFixed(3)]); }
  { const F = field(2, 1, 1), g = L.rng(9); let mx = 0; for (let i = 0; i < 5000; i++) { const x = (g() - 0.5) * 80000, y = (g() - 0.5) * 80000, t = g() * 10800, u = F(x, y, t), v = F.exact(x, y, t); for (let c = 0; c < 3; c++) mx = Math.max(mx, Math.abs(u[c] - v[c])); }
    ok('K5 tabulated field within 0.01 sigma of the exact formula', mx < 0.01, mx.toFixed(5)); }
  console.log('jobs', J.length, bad ? bad + ' FAILED' : 'ALL PASS'); process.exit(bad ? 1 : 0); }
else if (process.argv[2] === 'time') { for (const j of [['C', 'houston', 'S1', 'L4', 0.8, 1, 1]]) { const t = Date.now(); run(j); console.log(key(j), (Date.now() - t) / 1000 + 's (output not printed)'); } }
else { const k = +process.argv[2], n = +process.argv[3]; fs.mkdirSync('out/errors2', { recursive: true });
  const done = new Set(); for (const f of fs.readdirSync('out/errors2')) for (const l of fs.readFileSync('out/errors2/' + f, 'utf8').split('\n')) if (l.trim()) { const r = JSON.parse(l); done.add([r.study, r.metro, r.arm, r.level, r.rho, r.shared, r.seed].join('|')); }
  for (const j of J.filter((_, i) => i % n === k)) { if (done.has(key(j))) continue; const t = Date.now(), r = run(j); r.wall_s = (Date.now() - t) / 1000; fs.appendFileSync(`out/errors2/runs_${k}.jsonl`, JSON.stringify(r) + '\n'); console.log(key(j), r.wall_s); } }
