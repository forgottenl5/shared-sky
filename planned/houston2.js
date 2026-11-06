'use strict';
// HOUSTON2_PREREG.md: filed profiles at build-out site densities; planned cross-operator meetings in a central zone.
// Flights are piecewise-linear segments that reproduce houston1.js's 1-s samples exactly (fraction (q+0.5)/n inside each piece).
// usage: node planned/houston2.js D_KM SEED
const fs = require('fs'), path = require('path');
const VZ = 5, WARM = 3600, MEAS = 2 * 3600, HALF = 22000, ZONE = 6000, MIN_R = 300;
const OP = { wing: { rate: 400 / 15, radius: 9656, ratio: 75 / 75, hours: 15 }, amazon: { rate: 1000 / 16.5, radius: 12070, ratio: 6 / 75, hours: 16.5 }, zipline: { rate: 1000 * 0.95 / 15, radius: 16093, ratio: 65 / 75, hours: 1000 / (1000 * 0.95 / 15) } };
function rng(seed) { let s = (seed * 2654435761) >>> 0; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; }

// ---- segment builder mirroring houston1 Track
function Seg(t0) { this.t = t0; this.s = []; }
Seg.prototype.put = function (n, x0, y0, z0, x1, y1, z1, ph, leg) { this.s.push([this.t, n, x0, y0, z0, x1, y1, z1, ph, leg]); this.t += n; return this; };
Seg.prototype.vert = function (x, y, z0, z1, dur, leg) { dur = dur === undefined ? Math.abs(z1 - z0) / VZ : dur; return this.put(Math.max(1, Math.round(dur)), x, y, z0, x, y, z1, 'vertical', leg); };
Seg.prototype.hover = function (x, y, z, dur, leg) { return this.put(dur, x, y, z, x, y, z, 'hover', leg); };
Seg.prototype.cruise = function (a, b, z, v, leg) { const L = Math.hypot(b[0] - a[0], b[1] - a[1]); return this.put(Math.max(1, Math.round(L / v)), a[0], a[1], z, b[0], b[1], z, 'cruise', leg); };
Seg.prototype.ramp = function (a, b, z0, z1, dur, leg) { return this.put(Math.max(1, Math.round(dur)), a[0], a[1], z0, b[0], b[1], z1, 'vertical', leg); };
const toward = (a, b, d) => { const L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1; return [a[0] + (b[0] - a[0]) / L * d, a[1] + (b[1] - a[1]) / L * d]; };
function wingFlight(t0, pad, cust, h) { const T = new Seg(t0); T.vert(pad[0], pad[1], 0, 7, undefined, 'out').hover(pad[0], pad[1], 7, 30, 'out').vert(pad[0], pad[1], 7, h, undefined, 'out').cruise(pad, cust, h, 26.4, 'out')
  .vert(cust[0], cust[1], h, 7, undefined, 'out').hover(cust[0], cust[1], 7, 30, 'out').vert(cust[0], cust[1], 7, h, undefined, 'in').cruise(cust, pad, h, 26.4, 'in').vert(pad[0], pad[1], h, 0, undefined, 'in'); return T.s; }
function amazonFlight(t0, pad, cust) { const T = new Seg(t0), V = 30, d1 = V * 40 / 2, d2 = V * 30 / 2, a1 = toward(pad, cust, d1), c0 = toward(cust, pad, d2), b1 = toward(cust, pad, d1), p0 = toward(pad, cust, d2);
  T.vert(pad[0], pad[1], 0, 35, 15, 'out').ramp(pad, a1, 35, 61, 40, 'out').cruise(a1, c0, 61, V, 'out').ramp(c0, cust, 61, 43, 30, 'out').vert(cust[0], cust[1], 43, 4, 27, 'out').hover(cust[0], cust[1], 4, 4, 'out')
    .vert(cust[0], cust[1], 4, 60, 30, 'in').ramp(cust, b1, 60, 105, 40, 'in').cruise(b1, p0, 105, V, 'in').ramp(p0, pad, 105, 60, 30, 'in').vert(pad[0], pad[1], 60, 0, 35, 'in'); return T.s; }
function ziplineFlight(t0, dock, box, cust) { const T = new Seg(t0); T.vert(dock[0], dock[1], 0, 101, undefined, 'toBox').cruise(dock, box, 101, 31.3, 'toBox').hover(box[0], box[1], 101, 120, 'toBox').cruise(box, cust, 101, 31.3, 'out')
  .hover(cust[0], cust[1], 101, 75, 'out').cruise(cust, dock, 101, 31.3, 'in').vert(dock[0], dock[1], 101, 0, undefined, 'in'); return T.s; }
const posAt = (sg, t) => { const f = (t - sg[0] + 0.5) / sg[1]; return [sg[2] + (sg[5] - sg[2]) * f, sg[3] + (sg[6] - sg[3]) * f, sg[4] + (sg[7] - sg[4]) * f]; };
function expand(segs) { const out = []; for (const sg of segs) for (let q = 0; q < sg[1]; q++) { const p = posAt(sg, sg[0] + q); out.push([sg[0] + q, p[0], p[1], p[2], sg[8], sg[9]]); } return out; }

function sites(d, seed) { const r = rng(seed + 7919), L = 2 * HALF / 1000, out = [];
  for (const op of ['wing', 'zipline', 'amazon']) { const n = Math.round(L * L / (d * d) * OP[op].ratio); for (let k = 0; k < n; k++) out.push({ op, c: [(r() - 0.5) * 2 * HALF, (r() - 0.5) * 2 * HALF] }); } return out; }
function flights(siteList, seed, opts) {
  opts = opts || {}; const r = rng(seed), END = (opts.warm === undefined ? WARM : opts.warm) + (opts.meas || MEAS), fl = [];
  for (const S of siteList) { const o = OP[S.op], c = S.c, rate = S.rate || o.rate, boxes = [];
    if (S.op === 'zipline') for (let k = 0; k < 20; k++) { const rr = 5000 * Math.sqrt(r()), th = 2 * Math.PI * r(); boxes.push([c[0] + rr * Math.cos(th), c[1] + rr * Math.sin(th)]); }
    let t = -Math.log(1 - r()) * 3600 / rate;
    while (t < END) { let cust; for (;;) { const rr = o.radius * Math.sqrt(r()), th = 2 * Math.PI * r(); if (rr < MIN_R) continue; cust = [c[0] + rr * Math.cos(th), c[1] + rr * Math.sin(th)]; break; }
      const pad = [c[0] + (r() - 0.5) * 30, c[1] + (r() - 0.5) * 30], t0 = Math.round(t); let sg;
      if (S.op === 'wing') sg = wingFlight(t0, pad, cust, 46 + 45 * r()); else if (S.op === 'amazon') sg = amazonFlight(t0, pad, cust); else sg = ziplineFlight(t0, pad, boxes[Math.floor(r() * boxes.length)], cust);
      fl.push({ id: fl.length, op: S.op, t0, sg, end: sg[sg.length - 1][0] + sg[sg.length - 1][1] }); t += -Math.log(1 - r()) * 3600 / rate; } }
  return fl;
}
function count(fl, opts) {
  opts = opts || {}; const warm = opts.warm === undefined ? WARM : opts.warm, zone = opts.zone === undefined ? ZONE : opts.zone, inZ = (x, y) => Math.abs(x) <= zone && Math.abs(y) <= zone;
  // keep flights whose path can reach the zone (+30 m)
  const keep = fl.filter(f => { let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity; for (const s of f.sg) { x0 = Math.min(x0, s[2], s[5]); x1 = Math.max(x1, s[2], s[5]); y0 = Math.min(y0, s[3], s[6]); y1 = Math.max(y1, s[3], s[6]); } return x1 >= -zone - 30 && x0 <= zone + 30 && y1 >= -zone - 30 && y0 <= zone + 30; });
  keep.sort((a, b) => a.t0 - b.t0); const tmax = Math.max(...keep.map(f => f.end)), res = {}, add = k => { res[k] = (res[k] || 0) + 1; }, TH = opts.th || [['wide', 30, 10], ['close', 15, 5]];   // opts.th: ROBUST_PREREG.md
  let prev = Object.fromEntries(TH.map(x => [x[0], new Set()])), nx = 0; const act = [], over = new Map(), cellsBy = new Map(), measured = {};
  const SUB = opts.sub || 1, pAt = SUB === 1 ? posAt : (sg, t) => { const f = Math.min(1, Math.max(0, (t - sg[0] + 0.5) / sg[1])); return [sg[2] + (sg[5] - sg[2]) * f, sg[3] + (sg[6] - sg[3]) * f, sg[4] + (sg[7] - sg[4]) * f]; };   // COUNTFIX: opts.sub checks per second
  for (let it = 0; it <= tmax * SUB; it++) { const t = it / SUB; while (nx < keep.length && keep[nx].t0 <= t) { const f = keep[nx++]; f.k = 0; act.push(f); }
    const P = []; for (let a = act.length - 1; a >= 0; a--) { const f = act[a]; if (t >= f.end) { act.splice(a, 1); continue; } while (f.k < f.sg.length - 1 && t >= f.sg[f.k][0] + f.sg[f.k][1]) f.k++; const sg = f.sg[f.k]; if (t < sg[0]) continue; const p = pAt(sg, t);
      if (p[0] < -zone - 30 || p[0] > zone + 30 || p[1] < -zone - 30 || p[1] > zone + 30) continue; P.push([f.id, f.op, p[0], p[1], p[2], sg[8], sg[9]]);
      if (it % SUB === 0 && t >= warm && f.t0 >= warm && inZ(p[0], p[1]) && p[2] > 0.5) { let s = cellsBy.get(f.id); if (!s) cellsBy.set(f.id, s = { op: f.op, c: new Set() }); s.c.add(Math.floor(p[0] / 1000) + ',' + Math.floor(p[1] / 1000)); } }
    const g = new Map(); for (let a = 0; a < P.length; a++) { const k = Math.floor(P[a][2] / 30) + ',' + Math.floor(P[a][3] / 30), v = g.get(k); if (v) v.push(a); else g.set(k, [a]); }
    const now = Object.fromEntries(TH.map(x => [x[0], new Set()]));
    for (let a = 0; a < P.length; a++) { const gx = Math.floor(P[a][2] / 30), gy = Math.floor(P[a][3] / 30);
      for (let ox = -1; ox <= 1; ox++) for (let oy = -1; oy <= 1; oy++) { const v = g.get((gx + ox) + ',' + (gy + oy)); if (!v) continue;
        for (const b of v) { if (b <= a) continue; const A = P[a], B = P[b]; if (A[4] < 1 && B[4] < 1) continue; const dh = Math.hypot(A[2] - B[2], A[3] - B[3]), dz = Math.abs(A[4] - B[4]);
          for (const [nm, Rh, Rv] of TH) { if (!(dh < Rh && dz < Rv)) continue; const key = A[0] < B[0] ? A[0] + '_' + B[0] : B[0] + '_' + A[0]; now[nm].add(key);
            if (prev[nm].has(key) || t < warm || !(inZ(A[2], A[3]) || inZ(B[2], B[3]))) continue;
            const cross = A[1] !== B[1], pair = [A[1], B[1]].sort().join('-'), ph = (A[5] === 'vertical' || B[5] === 'vertical') ? 'vertical' : (A[5] === 'hover' || B[5] === 'hover') ? 'hover' : 'cruise';
            add(`${nm}|${cross ? 'cross' : 'same'}`); if (opts.onMeet) opts.onMeet(nm, A, B, t); add(`${nm}|pair|${pair}`); add(`${nm}|pair|${pair}|${ph}`); if (cross && (A[1] === 'amazon' || B[1] === 'amazon')) add(`${nm}|cross|withAmazon`); } } } }
    prev = now; }
  for (const f of keep) if (f.t0 >= warm) measured[f.op] = (measured[f.op] || 0) + 1;
  const hrs = (opts.meas || MEAS) / 3600; for (const { op, c } of cellsBy.values()) { const w = OP[op].hours / hrs; for (const k of c) over.set(k, (over.get(k) || 0) + w); }
  const vals = [...over.values()].sort((a, b) => a - b); res.over_cells = vals.length; res.over_median = vals[Math.floor(vals.length / 2)] || 0; res.over_max = vals[vals.length - 1] || 0;
  res.flights_touching_zone = measured; res.hours = hrs; return res;
}
function run(d, seed) { const S = sites(d, seed), fl = flights(S, seed); const r = count(fl); r.d = d; r.seed = seed; r.sites = { wing: S.filter(s => s.op === 'wing').length, zipline: S.filter(s => s.op === 'zipline').length, amazon: S.filter(s => s.op === 'amazon').length }; r.flights_total = fl.length; return r; }
module.exports = { run, sites, flights, count, expand, wingFlight, amazonFlight, ziplineFlight, OP };
if (require.main === module) { const [d, seed] = process.argv.slice(2), t0 = Date.now(), r = run(+d, +seed); r.wall_s = (Date.now() - t0) / 1000; const od = path.join(__dirname, '..', 'out', 'houston2'); fs.mkdirSync(od, { recursive: true });
  fs.writeFileSync(path.join(od, `d${d}_${seed}.json`), JSON.stringify(r)); console.log('d', d, 'seed', seed, 'sites', JSON.stringify(r.sites), 'cross wide', r['wide|cross'] || 0, 'same wide', r['wide|same'] || 0, r.wall_s + 's'); }
