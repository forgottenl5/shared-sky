'use strict';
// FAIR_PREREG.md: F0 first filed goes first (= PROC P2); F1 Amazon flies its height changes in place; F2 Amazon first within 5-min filing windows; F3 rotating first operator per window.
// usage: node planned/fair.js ARM D_KM SEED
const fs = require('fs'), path = require('path'), H2 = require('./houston2.js'), V = require('./valloc.js'), P = require('./proc.js');
const A = V.ARMS.A2, VZ = 5, WARM = 3600, MEAS = 2 * 3600, MIN_R = 300, OP = H2.OP, WIN = 300, ROT = ['wing', 'amazon', 'zipline'];
const STEP = 30, TRIES = 40, TB = P.TB, CELL = P.CELL, VSEP = P.VSEP;
function rng(seed) { let s = (seed * 2654435761) >>> 0; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; }
function Seg(t0) { this.t = t0; this.s = []; }
Seg.prototype.put = function (n, x0, y0, z0, x1, y1, z1, ph, leg) { this.s.push([this.t, n, x0, y0, z0, x1, y1, z1, ph, leg]); this.t += n; return this; };
Seg.prototype.vert = function (x, y, z0, z1, dur, leg) { dur = dur === undefined ? Math.abs(z1 - z0) / VZ : dur; return this.put(Math.max(1, Math.round(dur)), x, y, z0, x, y, z1, 'vertical', leg); };
Seg.prototype.hover = function (x, y, z, dur, leg) { return this.put(dur, x, y, z, x, y, z, 'hover', leg); };
Seg.prototype.cruise = function (a, b, z, v, leg) { const L = Math.hypot(b[0] - a[0], b[1] - a[1]); return this.put(Math.max(1, Math.round(L / v)), a[0], a[1], z, b[0], b[1], z, 'cruise', leg); };
// F1: the filed Amazon profile's height changes (same start/end heights and durations) flown in place; lateral distance flown in cruise
function amazonInPlace(t0, pad, cust, ho, hi) { const T = new Seg(t0), Vv = 30;
  T.vert(pad[0], pad[1], 0, 35, 15, 'out').vert(pad[0], pad[1], 35, ho, 40, 'out').cruise(pad, cust, ho, Vv, 'out').vert(cust[0], cust[1], ho, 43, 30, 'out').vert(cust[0], cust[1], 43, 4, 27, 'out').hover(cust[0], cust[1], 4, 4, 'out')
    .vert(cust[0], cust[1], 4, 60, 30, 'in').vert(cust[0], cust[1], 60, hi, 40, 'in').cruise(cust, pad, hi, Vv, 'in').vert(pad[0], pad[1], hi, 60, 30, 'in').vert(pad[0], pad[1], 60, 0, 35, 'in'); return T.s; }
// flights: same draws, in the same order, as valloc/proc
function flights(siteList, seed, inPlace) { const r = rng(seed), r2 = rng(seed + 104729), END = WARM + MEAS, fl = [], pick = v => Array.isArray(v) ? v[0] + (v[1] - v[0]) * r2() : v;
  for (const S of siteList) { const o = OP[S.op], c = S.c, rate = S.rate || o.rate, boxes = [];
    if (S.op === 'zipline') for (let k = 0; k < 20; k++) { const rr = 5000 * Math.sqrt(r()), th = 2 * Math.PI * r(); boxes.push([c[0] + rr * Math.cos(th), c[1] + rr * Math.sin(th)]); }
    let t = -Math.log(1 - r()) * 3600 / rate;
    while (t < END) { let cust; for (;;) { const rr = o.radius * Math.sqrt(r()), th = 2 * Math.PI * r(); if (rr < MIN_R) continue; cust = [c[0] + rr * Math.cos(th), c[1] + rr * Math.sin(th)]; break; }
      const pad = [c[0] + (r() - 0.5) * 30, c[1] + (r() - 0.5) * 30], t0 = Math.round(t); let sg;
      if (S.op === 'wing') sg = V.wingFlight(t0, pad, cust, A.wing[0] + (A.wing[1] - A.wing[0]) * r());
      else if (S.op === 'amazon') { const ho = pick(A.aOut), hi = pick(A.aIn); sg = inPlace ? amazonInPlace(t0, pad, cust, ho, hi) : V.amazonFlight(t0, pad, cust, ho, hi); }
      else sg = V.ziplineFlight(t0, pad, boxes[Math.floor(r() * boxes.length)], cust, A.zip);
      fl.push({ id: fl.length, op: S.op, t0, sg, end: sg[sg.length - 1][0] + sg[sg.length - 1][1] }); t += -Math.log(1 - r()) * 3600 / rate; } }
  return fl; }
const OPI = { wing: 0, amazon: 1, zipline: 2 };
function orderKey(mode) {
  if (mode === 'fifo') return (a, b) => a.t0 - b.t0 || a.id - b.id;
  const w = f => Math.floor(f.t0 / WIN), first = f => mode === 'amazon' ? (f.op === 'amazon' ? 0 : 1) : (f.op === ROT[((w(f) % 3) + 3) % 3] ? 0 : 1);
  return (a, b) => w(a) - w(b) || first(a) - first(b) || a.t0 - b.t0 || a.id - b.id; }
function intentCheck(fl, mode, rec) {   // rec (optional, diagnostics only): rec[flight id] = set of operators that blocked its first try
  const order = fl.filter(f => P.reachesZone(f, 30)).sort(orderKey(mode)), book = new Map(), key = (ix, iy, b) => ((ix + 300) * 600 + (iy + 300)) * 4000 + b;
  const delays = new Map(), log = []; let cancelled = 0, lastW = -Infinity;
  for (const f of order) {
    const wStart = mode === 'fifo' ? f.t0 : Math.floor(f.t0 / WIN) * WIN;   // no flight processed later starts before wStart
    if (wStart - lastW > 600) { const minB = Math.floor((wStart - TB) / 10) - 1; for (const k of book.keys()) if (k % 4000 < minB) book.delete(k); lastW = wStart; }
    log.push([f.id, f.op, f.t0]);
    const S = P.samples(f), me = OPI[f.op]; let D = -1;
    for (let k = 0; k < TRIES; k++) { const d = k * STEP; let bad = false;
      for (let i = 0; i < S.length && !bad; i += 4) { const t = f.t0 + d + S[i], x = S[i + 1], y = S[i + 2], z = S[i + 3], ix = Math.floor(x / CELL), iy = Math.floor(y / CELL);
        for (let b = Math.floor((t - TB) / 10); b <= Math.floor((t + TB) / 10) && !bad; b++) for (let ox = -1; ox <= 1 && !bad; ox++) for (let oy = -1; oy <= 1 && !bad; oy++) { const L = book.get(key(ix + ox, iy + oy, b)); if (!L) continue;
          for (let j = 0; j < L.length; j += 3) if (L[j + 2] !== me && Math.abs(L[j] - t) <= TB && Math.abs(L[j + 1] - z) < VSEP && !(L[j + 1] < 1 && z < 1)) { bad = true; if (rec && k === 0) { (rec[f.id] || (rec[f.id] = new Set())).add(L[j + 2]); } break; } } }
      if (!bad) { D = d; break; } }
    if (D < 0) { cancelled++; delays.set(f.id, null); continue; }
    delays.set(f.id, D);
    for (let i = 0; i < S.length; i += 4) { const t = f.t0 + D + S[i], k = key(Math.floor(S[i + 1] / CELL), Math.floor(S[i + 2] / CELL), Math.floor(t / 10)); let L = book.get(k); if (!L) book.set(k, L = []); L.push(t, S[i + 3], me); } }
  const out = []; for (const f of fl) { if (!delays.has(f.id)) { out.push(f); continue; } const D = delays.get(f.id); if (D === null) continue;
    out.push(D ? { id: f.id, op: f.op, t0: f.t0 + D, sg: f.sg.map(s => [s[0] + D, ...s.slice(1)]), end: f.end + D, delay: D } : Object.assign(f, { delay: 0 })); }
  return { fl: out, delays, cancelled, checked: order.length, log };
}
function stats(ic, fl0) { const byOp = {}, opOf = new Map(fl0.map(f => [f.id, f.op]));
  for (const [id, D] of ic.delays) { const o = opOf.get(id), b = byOp[o] || (byOp[o] = { n: 0, delayed: 0, total_s: 0, cancelled: 0 }); b.n++; if (D === null) { b.cancelled++; continue; } if (D > 0) b.delayed++; b.total_s += D; }
  for (const b of Object.values(byOp)) { b.delayed_share = b.delayed / b.n; b.mean_delay_s = b.total_s / b.n; }
  const tot = Object.values(byOp).reduce((a, b) => ({ n: a.n + b.n, delayed: a.delayed + b.delayed, total_s: a.total_s + b.total_s, cancelled: a.cancelled + b.cancelled }), { n: 0, delayed: 0, total_s: 0, cancelled: 0 });
  const others = ['wing', 'zipline'].map(o => (byOp[o] || {}).delayed_share || 0), m = (others[0] + others[1]) / 2;
  return { byOp, tot, ratio: m > 0 ? ((byOp.amazon || {}).delayed_share || 0) / m : null }; }
function run(arm, d, seed) { const S = H2.sites(d, seed), inPlace = arm === 'F1', mode = arm === 'F2' ? 'amazon' : arm === 'F3' ? 'rotate' : 'fifo';
  const fl0 = flights(S, seed, inPlace), res = { arm, d, seed, flights_total: fl0.length };
  if (inPlace) { const nc = H2.count(fl0); res.nocheck_cross_wide = nc['wide|cross'] || 0; res.nocheck_cross_close = nc['close|cross'] || 0;
    const base = flights(S, seed, false), am = fl0.map((f, i) => [f, base[i]]).filter(([f]) => f.op === 'amazon' && f.t0 >= WARM); res.amazon_extra_flight_s = am.length ? am.reduce((a, [f, b]) => a + (f.end - f.t0) - (b.end - b.t0), 0) / am.length : null; }
  const ic = intentCheck(fl0, mode); Object.assign(res, stats(ic, fl0)); const c = H2.count(ic.fl); res.cross_wide = c['wide|cross'] || 0; res.cross_close = c['close|cross'] || 0; res.same_wide = c['wide|same'] || 0;
  return { r: res, ic, fl0, S }; }
module.exports = { run, flights, intentCheck, stats, amazonInPlace, orderKey, WIN, ROT };
if (require.main === module) { const [arm, d, seed] = process.argv.slice(2), t0 = Date.now(), { r } = run(arm, +d, +seed); r.wall_s = (Date.now() - t0) / 1000; const od = path.join(__dirname, '..', 'out', 'fair'); fs.mkdirSync(od, { recursive: true });
  fs.writeFileSync(path.join(od, `${arm}_d${d}_${seed}.json`), JSON.stringify(r));
  console.log(arm, 'd', d, 'seed', seed, 'ratio', r.ratio && r.ratio.toFixed(2), 'amazon delayed', (100 * ((r.byOp.amazon || {}).delayed_share || 0)).toFixed(1) + '%', 'total delay', r.tot.total_s, 'cross', r.cross_wide, r.wall_s + 's'); }
