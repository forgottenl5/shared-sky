'use strict';
// PROC_PREREG.md (Phase 2b): procedures near sites on top of VALLOC arm A2.
// P0 = A2; P1 = foreign-site keep-out (300 m, detour waypoints at 350 m); P2 = intent check, first filed goes first; P3 = P1 + P2.
// usage: node planned/proc.js ARM D_KM SEED
const fs = require('fs'), path = require('path'), H2 = require('./houston2.js'), V = require('./valloc.js');
const A = V.ARMS.A2, VZ = 5, WARM = 3600, MEAS = 2 * 3600, MIN_R = 300, OP = H2.OP, ZONE = 6000;
const KEEP_R = 300, WP = 350, MAXDEPTH = 8, MARGIN = 1000, STEP = 30, TRIES = 40, TB = 5, CELL = 30, VSEP = 10;
function rng(seed) { let s = (seed * 2654435761) >>> 0; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; }
function Seg(t0) { this.t = t0; this.s = []; }
Seg.prototype.put = function (n, x0, y0, z0, x1, y1, z1, ph, leg) { this.s.push([this.t, n, x0, y0, z0, x1, y1, z1, ph, leg]); this.t += n; return this; };
Seg.prototype.vert = function (x, y, z0, z1, dur, leg) { dur = dur === undefined ? Math.abs(z1 - z0) / VZ : dur; return this.put(Math.max(1, Math.round(dur)), x, y, z0, x, y, z1, 'vertical', leg); };
Seg.prototype.hover = function (x, y, z, dur, leg) { return this.put(dur, x, y, z, x, y, z, 'hover', leg); };
Seg.prototype.cruise1 = function (a, b, z, v, leg) { const L = Math.hypot(b[0] - a[0], b[1] - a[1]); return this.put(Math.max(1, Math.round(L / v)), a[0], a[1], z, b[0], b[1], z, 'cruise', leg); };
Seg.prototype.ramp = function (a, b, z0, z1, dur, leg) { return this.put(Math.max(1, Math.round(dur)), a[0], a[1], z0, b[0], b[1], z1, 'vertical', leg); };
const toward = (a, b, d) => { const L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1; return [a[0] + (b[0] - a[0]) / L * d, a[1] + (b[1] - a[1]) / L * d]; };

// ---- P1 router: polyline from a to b avoiding foreign site circles (exempt: circles containing the leg's original ends)
function makeRouter(sites, stats) {
  return function route(a, b, op) {
    const foreign = sites.filter(s => s.op !== op), exempt = new Set(foreign.filter(s => Math.hypot(a[0] - s.c[0], a[1] - s.c[1]) < KEEP_R || Math.hypot(b[0] - s.c[0], b[1] - s.c[1]) < KEEP_R));
    const cand = foreign.filter(s => !exempt.has(s));
    function rec(p, q, depth) {
      const dx = q[0] - p[0], dy = q[1] - p[1], L = Math.hypot(dx, dy); if (L < 1e-6) return [p, q];
      const ux = dx / L, uy = dy / L; let best = null, bu = Infinity;
      for (const s of cand) { const cx = s.c[0] - p[0], cy = s.c[1] - p[1], u = cx * ux + cy * uy; if (u < -KEEP_R || u > L + KEEP_R) continue;
        const uc = Math.max(0, Math.min(L, u)), dd = Math.hypot(cx - uc * ux, cy - uc * uy); if (dd < KEEP_R && u < bu) { bu = u; best = s; } }
      if (!best) return [p, q];
      if (depth >= MAXDEPTH) { stats.depthHits++; return [p, q]; }
      const cx = best.c[0] - p[0], cy = best.c[1] - p[1], side = ux * cy - uy * cx, sg = side > 0 ? -1 : 1, nx = -uy * sg, ny = ux * sg;
      // K2 fix attempt 1 (PROC deviation log): push each waypoint outward along n until it is outside every foreign circle
      const clear = (x, y) => !foreign.some(s => Math.hypot(x - s.c[0], y - s.c[1]) < KEEP_R + 1), wp = (sgn) => { for (let e = WP; e <= WP + 2000; e += 50) { const x = best.c[0] + sgn * ux * WP + nx * e, y = best.c[1] + sgn * uy * WP + ny * e; if (clear(x, y)) return [x, y]; } stats.unclear++; return [best.c[0] + sgn * ux * WP + nx * WP, best.c[1] + sgn * uy * WP + ny * WP]; };
      const w1 = wp(-1), w2 = wp(1);
      if (++budget.n > 64) { stats.depthHits++; return [p, q]; }   // K2 fix attempt 2: the remainder of the leg keeps the same depth (depth = nesting); hard cap of 64 detours per leg
      const r1 = rec(p, w1, depth + 1), r2 = rec(w1, w2, depth + 1), r3 = rec(w2, q, depth);
      return r1.concat(r2.slice(1), r3.slice(1)); }
    const budget = { n: 0 }; return rec(a, b, 0); };
}
function cruise(T, a, b, z, v, leg, op, route) { const pts = route ? route(a, b, op) : [a, b]; for (let i = 0; i + 1 < pts.length; i++) T.cruise1(pts[i], pts[i + 1], z, v, leg); return T; }
function wingFlight(t0, pad, cust, h, R) { const T = new Seg(t0); T.vert(pad[0], pad[1], 0, 7, undefined, 'out').hover(pad[0], pad[1], 7, 30, 'out').vert(pad[0], pad[1], 7, h, undefined, 'out'); cruise(T, pad, cust, h, 26.4, 'out', 'wing', R);
  T.vert(cust[0], cust[1], h, 7, undefined, 'out').hover(cust[0], cust[1], 7, 30, 'out').vert(cust[0], cust[1], 7, h, undefined, 'in'); cruise(T, cust, pad, h, 26.4, 'in', 'wing', R); T.vert(pad[0], pad[1], h, 0, undefined, 'in'); return T.s; }
function amazonFlight(t0, pad, cust, ho, hi, R) { const T = new Seg(t0), Vv = 30, d1 = Vv * 40 / 2, d2 = Vv * 30 / 2, a1 = toward(pad, cust, d1), c0 = toward(cust, pad, d2), b1 = toward(cust, pad, d1), p0 = toward(pad, cust, d2);
  T.vert(pad[0], pad[1], 0, 35, 15, 'out').ramp(pad, a1, 35, ho, 40, 'out'); cruise(T, a1, c0, ho, Vv, 'out', 'amazon', R); T.ramp(c0, cust, ho, 43, 30, 'out').vert(cust[0], cust[1], 43, 4, 27, 'out').hover(cust[0], cust[1], 4, 4, 'out')
    .vert(cust[0], cust[1], 4, 60, 30, 'in').ramp(cust, b1, 60, hi, 40, 'in'); cruise(T, b1, p0, hi, Vv, 'in', 'amazon', R); T.ramp(p0, pad, hi, 60, 30, 'in').vert(pad[0], pad[1], 60, 0, 35, 'in'); return T.s; }
function ziplineFlight(t0, dock, box, cust, hz, R) { const T = new Seg(t0); T.vert(dock[0], dock[1], 0, hz, undefined, 'toBox'); cruise(T, dock, box, hz, 31.3, 'toBox', 'zipline', R); T.hover(box[0], box[1], hz, 120, 'toBox'); cruise(T, box, cust, hz, 31.3, 'out', 'zipline', R);
  T.hover(cust[0], cust[1], hz, 75, 'out'); cruise(T, cust, dock, hz, 31.3, 'in', 'zipline', R); T.vert(dock[0], dock[1], hz, 0, undefined, 'in'); return T.s; }
// same random draws, in the same order, as valloc.flights()
function flights(siteList, seed, R) { const r = rng(seed), r2 = rng(seed + 104729), END = WARM + MEAS, fl = [], pick = v => Array.isArray(v) ? v[0] + (v[1] - v[0]) * r2() : v;
  for (const S of siteList) { const o = OP[S.op], c = S.c, rate = S.rate || o.rate, boxes = [];
    if (S.op === 'zipline') for (let k = 0; k < 20; k++) { const rr = 5000 * Math.sqrt(r()), th = 2 * Math.PI * r(); boxes.push([c[0] + rr * Math.cos(th), c[1] + rr * Math.sin(th)]); }
    let t = -Math.log(1 - r()) * 3600 / rate;
    while (t < END) { let cust; for (;;) { const rr = o.radius * Math.sqrt(r()), th = 2 * Math.PI * r(); if (rr < MIN_R) continue; cust = [c[0] + rr * Math.cos(th), c[1] + rr * Math.sin(th)]; break; }
      const pad = [c[0] + (r() - 0.5) * 30, c[1] + (r() - 0.5) * 30], t0 = Math.round(t); let sg;
      if (S.op === 'wing') sg = wingFlight(t0, pad, cust, A.wing[0] + (A.wing[1] - A.wing[0]) * r(), R); else if (S.op === 'amazon') sg = amazonFlight(t0, pad, cust, pick(A.aOut), pick(A.aIn), R); else sg = ziplineFlight(t0, pad, boxes[Math.floor(r() * boxes.length)], cust, A.zip, R);
      fl.push({ id: fl.length, op: S.op, t0, sg, end: sg[sg.length - 1][0] + sg[sg.length - 1][1] }); t += -Math.log(1 - r()) * 3600 / rate; } }
  return fl; }
const posAt = (sg, t) => { const f = (t - sg[0] + 0.5) / sg[1]; return [sg[2] + (sg[5] - sg[2]) * f, sg[3] + (sg[6] - sg[3]) * f, sg[4] + (sg[7] - sg[4]) * f]; };
const reachesZone = (f, m) => { let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity; for (const s of f.sg) { x0 = Math.min(x0, s[2], s[5]); x1 = Math.max(x1, s[2], s[5]); y0 = Math.min(y0, s[3], s[6]); y1 = Math.max(y1, s[3], s[6]); } return x1 >= -ZONE - m && x0 <= ZONE + m && y1 >= -ZONE - m && y0 <= ZONE + m; };
// samples of a flight (relative time, x, y, z) inside zone + MARGIN
function samples(f) { const out = []; const lim = ZONE + MARGIN; for (const sg of f.sg) for (let q = 0; q < sg[1]; q++) { const t = sg[0] + q, p = posAt(sg, t); if (Math.abs(p[0]) <= lim && Math.abs(p[1]) <= lim) out.push(t - f.t0, p[0], p[1], p[2]); } return out; }
const OPI = { wing: 0, amazon: 1, zipline: 2 };
// ---- P2: first filed goes first, cross-operator only
function intentCheck(fl) {
  const order = fl.filter(f => reachesZone(f, 30)).sort((a, b) => a.t0 - b.t0 || a.id - b.id), book = new Map(), key = (ix, iy, b) => ((ix + 300) * 600 + (iy + 300)) * 4000 + b;
  const delays = new Map(); let cancelled = 0, lastPrune = -Infinity; const accepted = [];
  for (const f of order) {
    if (f.t0 - lastPrune > 600) { const minB = Math.floor((f.t0 - TB) / 10) - 1; for (const k of book.keys()) if (k % 4000 < minB) book.delete(k); lastPrune = f.t0; }
    const S = samples(f), me = OPI[f.op]; let D = -1;
    for (let k = 0; k < TRIES; k++) { const d = k * STEP; let bad = false;
      for (let i = 0; i < S.length && !bad; i += 4) { const t = f.t0 + d + S[i], x = S[i + 1], y = S[i + 2], z = S[i + 3], ix = Math.floor(x / CELL), iy = Math.floor(y / CELL);
        for (let b = Math.floor((t - TB) / 10); b <= Math.floor((t + TB) / 10) && !bad; b++) for (let ox = -1; ox <= 1 && !bad; ox++) for (let oy = -1; oy <= 1 && !bad; oy++) { const L = book.get(key(ix + ox, iy + oy, b)); if (!L) continue;
          for (let j = 0; j < L.length; j += 3) if (L[j + 2] !== me && Math.abs(L[j] - t) <= TB && Math.abs(L[j + 1] - z) < VSEP && !(L[j + 1] < 1 && z < 1)) { bad = true; break; } } }
      if (!bad) { D = d; break; } }
    if (D < 0) { cancelled++; delays.set(f.id, null); continue; }
    delays.set(f.id, D); accepted.push(f.id);
    for (let i = 0; i < S.length; i += 4) { const t = f.t0 + D + S[i], k = key(Math.floor(S[i + 1] / CELL), Math.floor(S[i + 2] / CELL), Math.floor(t / 10)); let L = book.get(k); if (!L) book.set(k, L = []); L.push(t, S[i + 3], me); } }
  const out = []; for (const f of fl) { if (!delays.has(f.id)) { out.push(f); continue; } const D = delays.get(f.id); if (D === null) continue;
    out.push(D ? { id: f.id, op: f.op, t0: f.t0 + D, sg: f.sg.map(s => [s[0] + D, ...s.slice(1)]), end: f.end + D, delay: D } : Object.assign(f, { delay: 0 })); }
  return { fl: out, delays, cancelled, checked: order.length };
}
// ---- ground exposure: distinct measured flights per day over 100 m cells > 300 m from every site centre
function exposure(fl, siteList) { const cells = new Map(), hrs = MEAS / 3600;
  for (const f of fl) { if (f.t0 < WARM || !reachesZone(f, 0)) continue; const seen = new Set(), w = OP[f.op].hours / hrs;
    for (const sg of f.sg) for (let q = 0; q < sg[1]; q++) { const p = posAt(sg, sg[0] + q); if (p[2] <= 0.5 || Math.abs(p[0]) > ZONE || Math.abs(p[1]) > ZONE) continue; seen.add(Math.floor(p[0] / 100) * 1000 + Math.floor(p[1] / 100)); }
    for (const k of seen) cells.set(k, (cells.get(k) || 0) + w); }
  const near = new Set(); for (const s of siteList) for (let ix = Math.floor((s.c[0] - 400) / 100); ix <= Math.floor((s.c[0] + 400) / 100); ix++) for (let iy = Math.floor((s.c[1] - 400) / 100); iy <= Math.floor((s.c[1] + 400) / 100); iy++)
    if (Math.hypot((ix + 0.5) * 100 - s.c[0], (iy + 0.5) * 100 - s.c[1]) <= KEEP_R) near.add(ix * 1000 + iy);
  const v = []; for (let ix = -60; ix < 60; ix++) for (let iy = -60; iy < 60; iy++) { const k = ix * 1000 + iy; if (!near.has(k)) v.push(cells.get(k) || 0); }
  v.sort((a, b) => a - b); const q = p => v[Math.min(v.length - 1, Math.floor(p * (v.length - 1)))]; return { cells: v.length, median: q(0.5), p99: q(0.99), max: v[v.length - 1] }; }
const cruiseLen = sg => sg.filter(s => s[8] === 'cruise').reduce((a, s) => a + Math.hypot(s[5] - s[2], s[6] - s[3]), 0);
function run(arm, d, seed) {
  const S = H2.sites(d, seed), stats = { depthHits: 0, unclear: 0 }, keepout = arm === 'P1' || arm === 'P3', R = keepout ? makeRouter(S, stats) : null;
  let fl = flights(S, seed, R); const res = { arm, d, seed, flights_total: fl.length };
  if (keepout) { const base = flights(S, seed, null), ext = {}; for (let i = 0; i < fl.length; i++) { if (fl[i].t0 < WARM || !reachesZone(fl[i], 30)) continue; const e = ext[fl[i].op] || (ext[fl[i].op] = [0, 0]); e[0] += cruiseLen(fl[i].sg); e[1] += cruiseLen(base[i].sg); }
    res.extra_cruise = Object.fromEntries(Object.entries(ext).map(([k, v]) => [k, v[0] / v[1] - 1])); res.extra_cruise_pooled = Object.values(ext).reduce((a, v) => a + v[0], 0) / Object.values(ext).reduce((a, v) => a + v[1], 0) - 1; res.depth_hits = stats.depthHits; res.unclear_waypoints = stats.unclear; }
  if (arm === 'P2' || arm === 'P3') { const ic = intentCheck(fl); fl = ic.fl; const meas = [...ic.delays.entries()].filter(([id]) => true), dl = meas.map(x => x[1]).filter(x => x !== null);
    const pos = dl.filter(x => x > 0).sort((a, b) => a - b); res.intent = { checked: ic.checked, cancelled: ic.cancelled, delayed: pos.length, delayed_share: pos.length / ic.checked, delay_mean_s: pos.length ? pos.reduce((a, b) => a + b, 0) / pos.length : 0, delay_p95_s: pos.length ? pos[Math.floor(0.95 * (pos.length - 1))] : 0 };
    const byOp = {}; for (const f of fl) if (f.delay !== undefined) { const b = byOp[f.op] || (byOp[f.op] = [0, 0]); b[0]++; if (f.delay > 0) b[1]++; } res.intent.delayed_share_by_op = Object.fromEntries(Object.entries(byOp).map(([k, v]) => [k, v[1] / v[0]])); }
  Object.assign(res, H2.count(fl)); res.exposure = exposure(fl, S); return { r: res, fl, S };
}
module.exports = { run, flights, makeRouter, intentCheck, samples, reachesZone, posAt, KEEP_R, ZONE, MARGIN, CELL, VSEP, TB };
if (require.main === module) { const [arm, d, seed] = process.argv.slice(2), t0 = Date.now(), { r } = run(arm, +d, +seed); r.wall_s = (Date.now() - t0) / 1000; const od = path.join(__dirname, '..', 'out', 'proc'); fs.mkdirSync(od, { recursive: true });
  fs.writeFileSync(path.join(od, `${arm}_d${d}_${seed}.json`), JSON.stringify(r)); console.log(arm, 'd', d, 'seed', seed, 'cross wide', r['wide|cross'] || 0, 'close', r['close|cross'] || 0, r.intent ? 'delayed ' + (100 * r.intent.delayed_share).toFixed(1) + '%' : '', r.extra_cruise_pooled !== undefined ? 'extra ' + (100 * r.extra_cruise_pooled).toFixed(1) + '%' : '', 'p99 exp', r.exposure.p99.toFixed(0), r.wall_s + 's'); }
