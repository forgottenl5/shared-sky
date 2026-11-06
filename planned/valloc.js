'use strict';
// VALLOC_PREREG.md: HOUSTON2 build-out with per-arm heights (inside each operator's filed band). Reuses houston2 sites/count; builders copied with height parameters.
// usage: node planned/valloc.js ARM D_KM SEED   ARM in A0 A1 A2 A3
const fs = require('fs'), path = require('path'), H2 = require('./houston2.js');
const ARMS = { A0: { wing: [46, 91], aOut: 61, zip: 101, aIn: 105 }, A1: { wing: [46, 91], aOut: 61, zip: 101, aIn: 115 }, A2: { wing: [46, 71], aOut: 81, zip: 101, aIn: 115 }, A3: { wing: [46, 91], aOut: [55, 85], zip: 101, aIn: [85, 115] } };   // A3: VALLOC2_PREREG.md
const VZ = 5, WARM = 3600, MEAS = 2 * 3600, MIN_R = 300, OP = H2.OP;
function rng(seed) { let s = (seed * 2654435761) >>> 0; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; }
function Seg(t0) { this.t = t0; this.s = []; }
Seg.prototype.put = function (n, x0, y0, z0, x1, y1, z1, ph, leg) { this.s.push([this.t, n, x0, y0, z0, x1, y1, z1, ph, leg]); this.t += n; return this; };
Seg.prototype.vert = function (x, y, z0, z1, dur, leg) { dur = dur === undefined ? Math.abs(z1 - z0) / VZ : dur; return this.put(Math.max(1, Math.round(dur)), x, y, z0, x, y, z1, 'vertical', leg); };
Seg.prototype.hover = function (x, y, z, dur, leg) { return this.put(dur, x, y, z, x, y, z, 'hover', leg); };
Seg.prototype.cruise = function (a, b, z, v, leg) { const L = Math.hypot(b[0] - a[0], b[1] - a[1]); return this.put(Math.max(1, Math.round(L / v)), a[0], a[1], z, b[0], b[1], z, 'cruise', leg); };
Seg.prototype.ramp = function (a, b, z0, z1, dur, leg) { return this.put(Math.max(1, Math.round(dur)), a[0], a[1], z0, b[0], b[1], z1, 'vertical', leg); };
const toward = (a, b, d) => { const L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1; return [a[0] + (b[0] - a[0]) / L * d, a[1] + (b[1] - a[1]) / L * d]; };
function wingFlight(t0, pad, cust, h) { const T = new Seg(t0); T.vert(pad[0], pad[1], 0, 7, undefined, 'out').hover(pad[0], pad[1], 7, 30, 'out').vert(pad[0], pad[1], 7, h, undefined, 'out').cruise(pad, cust, h, 26.4, 'out')
  .vert(cust[0], cust[1], h, 7, undefined, 'out').hover(cust[0], cust[1], 7, 30, 'out').vert(cust[0], cust[1], 7, h, undefined, 'in').cruise(cust, pad, h, 26.4, 'in').vert(pad[0], pad[1], h, 0, undefined, 'in'); return T.s; }
function amazonFlight(t0, pad, cust, ho, hi) { const T = new Seg(t0), V = 30, d1 = V * 40 / 2, d2 = V * 30 / 2, a1 = toward(pad, cust, d1), c0 = toward(cust, pad, d2), b1 = toward(cust, pad, d1), p0 = toward(pad, cust, d2);
  T.vert(pad[0], pad[1], 0, 35, 15, 'out').ramp(pad, a1, 35, ho, 40, 'out').cruise(a1, c0, ho, V, 'out').ramp(c0, cust, ho, 43, 30, 'out').vert(cust[0], cust[1], 43, 4, 27, 'out').hover(cust[0], cust[1], 4, 4, 'out')
    .vert(cust[0], cust[1], 4, 60, 30, 'in').ramp(cust, b1, 60, hi, 40, 'in').cruise(b1, p0, hi, V, 'in').ramp(p0, pad, hi, 60, 30, 'in').vert(pad[0], pad[1], 60, 0, 35, 'in'); return T.s; }
function ziplineFlight(t0, dock, box, cust, hz) { const T = new Seg(t0); T.vert(dock[0], dock[1], 0, hz, undefined, 'toBox').cruise(dock, box, hz, 31.3, 'toBox').hover(box[0], box[1], hz, 120, 'toBox').cruise(box, cust, hz, 31.3, 'out')
  .hover(cust[0], cust[1], hz, 75, 'out').cruise(cust, dock, hz, 31.3, 'in').vert(dock[0], dock[1], hz, 0, undefined, 'in'); return T.s; }
function flights(siteList, seed, A) { const r = rng(seed), r2 = rng(seed + 104729), END = WARM + MEAS, fl = [], pick = v => Array.isArray(v) ? v[0] + (v[1] - v[0]) * r2() : v;
  for (const S of siteList) { const o = OP[S.op], c = S.c, rate = S.rate || o.rate, boxes = [];
    if (S.op === 'zipline') for (let k = 0; k < 20; k++) { const rr = 5000 * Math.sqrt(r()), th = 2 * Math.PI * r(); boxes.push([c[0] + rr * Math.cos(th), c[1] + rr * Math.sin(th)]); }
    let t = -Math.log(1 - r()) * 3600 / rate;
    while (t < END) { let cust; for (;;) { const rr = o.radius * Math.sqrt(r()), th = 2 * Math.PI * r(); if (rr < MIN_R) continue; cust = [c[0] + rr * Math.cos(th), c[1] + rr * Math.sin(th)]; break; }
      const pad = [c[0] + (r() - 0.5) * 30, c[1] + (r() - 0.5) * 30], t0 = Math.round(t); let sg;
      if (S.op === 'wing') sg = wingFlight(t0, pad, cust, A.wing[0] + (A.wing[1] - A.wing[0]) * r()); else if (S.op === 'amazon') sg = amazonFlight(t0, pad, cust, pick(A.aOut), pick(A.aIn)); else sg = ziplineFlight(t0, pad, boxes[Math.floor(r() * boxes.length)], cust, A.zip);
      fl.push({ id: fl.length, op: S.op, t0, sg, end: sg[sg.length - 1][0] + sg[sg.length - 1][1] }); t += -Math.log(1 - r()) * 3600 / rate; } }
  return fl; }
function run(arm, d, seed) { const S = H2.sites(d, seed), fl = flights(S, seed, ARMS[arm]), r = H2.count(fl); Object.assign(r, { arm, d, seed, flights_total: fl.length });
  const am = fl.filter(f => f.op === 'amazon' && f.t0 >= WARM); r.amazon_mean_flight_s = am.length ? am.reduce((a, f) => a + (f.end - f.t0), 0) / am.length : null; return { r, fl }; }
module.exports = { run, flights, ARMS, wingFlight, amazonFlight, ziplineFlight };
if (require.main === module) { const [arm, d, seed] = process.argv.slice(2), t0 = Date.now(), { r } = run(arm, +d, +seed); r.wall_s = (Date.now() - t0) / 1000; const od = path.join(__dirname, '..', 'out', 'valloc'); fs.mkdirSync(od, { recursive: true });
  fs.writeFileSync(path.join(od, `${arm}_d${d}_${seed}.json`), JSON.stringify(r)); console.log(arm, 'd', d, 'seed', seed, 'cross wide', r['wide|cross'] || 0, 'same wide', r['wide|same'] || 0, r.wall_s + 's'); }
