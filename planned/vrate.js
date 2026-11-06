'use strict';
// VRATE_PREREG.md: V0 Amazon as filed (= FAIR F0); V1 in place at filed durations (= FAIR F1); V2 in place at 5 m/s.
// usage: node planned/vrate.js ARM D_KM SEED
const fs = require('fs'), path = require('path'), H2 = require('./houston2.js'), V = require('./valloc.js'), P = require('./proc.js'), F = require('./fair.js');
const A = V.ARMS.A2, WARM = 3600, MEAS = 2 * 3600, MIN_R = 300, OP = H2.OP, VFAST = 5;
function rng(seed) { let s = (seed * 2654435761) >>> 0; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; }
function Seg(t0) { this.t = t0; this.s = []; }
Seg.prototype.put = function (n, x0, y0, z0, x1, y1, z1, ph, leg) { this.s.push([this.t, n, x0, y0, z0, x1, y1, z1, ph, leg]); this.t += n; return this; };
Seg.prototype.vf = function (x, y, z0, z1, leg) { return this.put(Math.max(1, Math.round(Math.abs(z1 - z0) / VFAST)), x, y, z0, x, y, z1, 'vertical', leg); };
Seg.prototype.hover = function (x, y, z, dur, leg) { return this.put(dur, x, y, z, x, y, z, 'hover', leg); };
Seg.prototype.cruise = function (a, b, z, v, leg) { const L = Math.hypot(b[0] - a[0], b[1] - a[1]); return this.put(Math.max(1, Math.round(L / v)), a[0], a[1], z, b[0], b[1], z, 'cruise', leg); };
function amazonFast(t0, pad, cust, ho, hi) { const T = new Seg(t0), Vv = 30;
  T.vf(pad[0], pad[1], 0, 35, 'out').vf(pad[0], pad[1], 35, ho, 'out').cruise(pad, cust, ho, Vv, 'out').vf(cust[0], cust[1], ho, 43, 'out').vf(cust[0], cust[1], 43, 4, 'out').hover(cust[0], cust[1], 4, 4, 'out')
    .vf(cust[0], cust[1], 4, 60, 'in').vf(cust[0], cust[1], 60, hi, 'in').cruise(cust, pad, hi, Vv, 'in').vf(pad[0], pad[1], hi, 60, 'in').vf(pad[0], pad[1], 60, 0, 'in'); return T.s; }
const BUILD = { V0: V.amazonFlight, V1: F.amazonInPlace, V2: amazonFast };
function flights(siteList, seed, arm) { const r = rng(seed), r2 = rng(seed + 104729), END = WARM + MEAS, fl = [], pick = v => Array.isArray(v) ? v[0] + (v[1] - v[0]) * r2() : v, AB = BUILD[arm];
  for (const S of siteList) { const o = OP[S.op], c = S.c, rate = S.rate || o.rate, boxes = [];
    if (S.op === 'zipline') for (let k = 0; k < 20; k++) { const rr = 5000 * Math.sqrt(r()), th = 2 * Math.PI * r(); boxes.push([c[0] + rr * Math.cos(th), c[1] + rr * Math.sin(th)]); }
    let t = -Math.log(1 - r()) * 3600 / rate;
    while (t < END) { let cust; for (;;) { const rr = o.radius * Math.sqrt(r()), th = 2 * Math.PI * r(); if (rr < MIN_R) continue; cust = [c[0] + rr * Math.cos(th), c[1] + rr * Math.sin(th)]; break; }
      const pad = [c[0] + (r() - 0.5) * 30, c[1] + (r() - 0.5) * 30], t0 = Math.round(t); let sg;
      if (S.op === 'wing') sg = V.wingFlight(t0, pad, cust, A.wing[0] + (A.wing[1] - A.wing[0]) * r());
      else if (S.op === 'amazon') { const ho = pick(A.aOut), hi = pick(A.aIn); sg = AB(t0, pad, cust, ho, hi); }
      else sg = V.ziplineFlight(t0, pad, boxes[Math.floor(r() * boxes.length)], cust, A.zip);
      fl.push({ id: fl.length, op: S.op, t0, sg, end: sg[sg.length - 1][0] + sg[sg.length - 1][1] }); t += -Math.log(1 - r()) * 3600 / rate; } }
  return fl; }
const BANDS = { wing: [[36, 81]], zipline: [[91, 111]], amazon: [[71, 91], [105, 125]] };
function crossing(fl) { const acc = {}; for (const f of fl) { const a = acc[f.op] || (acc[f.op] = { n: 0, s: 0 }); a.n++;
    for (const sg of f.sg) { if (sg[4] === sg[7]) continue; for (let q = 0; q < sg[1]; q++) { const z = P.posAt(sg, sg[0] + q)[2]; if (Object.keys(BANDS).some(o => o !== f.op && BANDS[o].some(b => z >= b[0] && z <= b[1]))) a.s++; } } }
  return Object.fromEntries(Object.entries(acc).map(([o, a]) => [o, a.s / a.n])); }
function run(arm, d, seed) { const S = H2.sites(d, seed), fl0 = flights(S, seed, arm), res = { arm, d, seed, flights_total: fl0.length };
  res.crossing_s = crossing(fl0); const nc = H2.count(fl0); res.nocheck_cross_wide = nc['wide|cross'] || 0;
  const am = fl0.filter(f => f.op === 'amazon' && f.t0 >= WARM); res.amazon_mean_flight_s = am.length ? am.reduce((a, f) => a + f.end - f.t0, 0) / am.length : null;
  const ic = F.intentCheck(fl0, 'fifo'); Object.assign(res, F.stats(ic, fl0)); const c = H2.count(ic.fl); res.cross_wide = c['wide|cross'] || 0; res.cross_close = c['close|cross'] || 0;
  return { r: res, ic, fl0 }; }
module.exports = { run, flights, amazonFast, crossing, VFAST };
if (require.main === module) { const [arm, d, seed] = process.argv.slice(2), t0 = Date.now(), { r } = run(arm, +d, +seed); r.wall_s = (Date.now() - t0) / 1000; const od = path.join(__dirname, '..', 'out', 'vrate'); fs.mkdirSync(od, { recursive: true });
  fs.writeFileSync(path.join(od, `${arm}_d${d}_${seed}.json`), JSON.stringify(r));
  console.log(arm, 'd', d, 'seed', seed, 'ratio', r.ratio && r.ratio.toFixed(2), 'amazon delayed', (100 * ((r.byOp.amazon || {}).delayed_share || 0)).toFixed(1) + '%', 'amazon crossing', r.crossing_s.amazon.toFixed(0) + 's', 'cross', r.cross_wide, r.wall_s + 's'); }
