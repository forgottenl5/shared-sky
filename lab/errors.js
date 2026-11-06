'use strict';
// Navigation-error models (4 Nov 2026), shared by lab/study.js. Identical draws to planned/errors1_run.js and planned/errors2_run.js
// (those registered runners are left unchanged; lab/study.js check confirms the same rows).
const L = require('./lab_engine.js');
const K_RAD = Math.sqrt(-2 * Math.log(0.05)), K_VER = 1.96;   // 95 % radial (2-D) = 2.4477 sigma; 95 % vertical (1-D) = 1.96 sigma
// ERRORS1 levels: 95 % sideways (m), 95 % height (m), late-start sigma (s)
const LEVELS = { L0: { h95: 0, v95: 0, slip: 0 }, L1: { h95: 3, v95: 4, slip: 5 }, L2: { h95: 8, v95: 13, slip: 15 }, L3: { h95: 15, v95: 33, slip: 30 }, L4: { h95: 30.48, v95: 45.72, slip: 60 },
  H4: { h95: 30.48, v95: 0, slip: 0 }, Z4: { h95: 0, v95: 45.72, slip: 0 }, T4: { h95: 0, v95: 0, slip: 60 } };
function gauss(g) { const u = Math.max(1e-12, g()), v = g(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
// personal (per-flight, constant) errors; f scales the sizes (ERRORS2: sqrt(1 - rho))
function personal(e, seed, f = 1) { const sh = f * e.h95 / K_RAD, sz = f * e.v95 / K_VER;
  return { zerr: sz ? (id => sz * gauss(L.rng(seed * 7919 + id * 31 + 101))) : null,
    herr: sh ? (id => { const g = L.rng(seed * 104729 + id * 37 + 7); return [sh * gauss(g), sh * gauss(g)]; }) : null,
    slip: e.slip ? (id => Math.round(Math.abs(e.slip * gauss(L.rng(seed * 15485863 + id * 41 + 3))))) : null }; }
// shared field (ERRORS2): sum of random cosines, Gaussian correlation (length LC m, time TC s), tabulated on a GX m x GT s grid
function field(seed, sx, sz, o = {}) { const LC = o.LC || 20000, TC = o.TC || 1800, N = o.modes || 24, GX = o.GX || 500, GT = o.GT || 150, XMAX = o.XMAX || 41000, TMAX = o.TMAX || 10800;
  if (!sx && !sz) return null; const g = L.rng(seed * 2654435 + 977), M = [];
  for (let c = 0; c < 3; c++) { const m = []; for (let i = 0; i < N; i++) m.push([gauss(g) / LC, gauss(g) / LC, gauss(g) / TC, 2 * Math.PI * g()]); M.push(m); }
  const A = [sx, sx, sz].map(s => s * Math.sqrt(2 / N));
  const exact = (x, y, t) => M.map((m, c) => { if (!A[c]) return 0; let v = 0; for (const q of m) v += Math.cos(q[0] * x + q[1] * y + q[2] * t + q[3]); return A[c] * v; });
  const nx = 2 * XMAX / GX + 1, nt = TMAX / GT + 1, T = [0, 1, 2].map(() => new Float64Array(nx * nx * nt));
  for (let it = 0; it < nt; it++) for (let iy = 0; iy < nx; iy++) for (let ix = 0; ix < nx; ix++) { const v = exact(-XMAX + ix * GX, -XMAX + iy * GX, it * GT), q = (it * nx + iy) * nx + ix; for (let c = 0; c < 3; c++) T[c][q] = v[c]; }
  const f = (x, y, t) => { const fx = (x + XMAX) / GX, fy = (y + XMAX) / GX, ft = t / GT; if (fx < 0 || fy < 0 || ft < 0 || fx >= nx - 1 || fy >= nx - 1 || ft >= nt - 1) return exact(x, y, t);
    const ix = fx | 0, iy = fy | 0, it = ft | 0, ax = fx - ix, ay = fy - iy, at = ft - it, out = [0, 0, 0];
    for (let c = 0; c < 3; c++) { const D = T[c]; let v = 0; for (let dt = 0; dt < 2; dt++) { const q = ((it + dt) * nx + iy) * nx + ix, w = dt ? at : 1 - at;
      v += w * ((1 - ay) * ((1 - ax) * D[q] + ax * D[q + 1]) + ay * ((1 - ax) * D[q + nx] + ax * D[q + nx + 1])); } out[c] = v; } return out; };
  f.exact = exact; return f; }
// one error spec -> {zerr, herr, slip, field}; spec: {level, rho (shared share of variance, default 0), shared (field on/off, default rho > 0)}
function build(spec, seed) { const e = typeof spec.level === 'string' ? LEVELS[spec.level] : spec.level, rho = spec.rho || 0, sh = spec.shared === undefined ? rho > 0 : !!spec.shared;
  const P = personal(e, seed, Math.sqrt(1 - rho)); P.field = sh ? field(seed, Math.sqrt(rho) * e.h95 / K_RAD, Math.sqrt(rho) * e.v95 / K_VER, spec.fieldOpts) : null; return P; }
module.exports = { K_RAD, K_VER, LEVELS, gauss, personal, field, build };
