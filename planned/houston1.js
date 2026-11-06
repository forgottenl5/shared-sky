'use strict';
// HOUSTON1_PREREG.md: planned tracks of filed Wing / Amazon / Zipline operations around Cypress, TX, and planned encounters between them.
// Geometry and scheduling only: each operator flies its filed profile; no avoidance, no booking system.
// usage: node planned/houston1.js SCENARIO SEED [PEAK]   SCENARIO in S0 S1 S2
const fs = require('fs'), path = require('path');
const LAT0 = 29.90, LON0 = -95.65, R = 6371008.8, K = Math.PI / 180;
const en = (lat, lon) => [R * (lon - LON0) * K * Math.cos(LAT0 * K), R * (lat - LAT0) * K];
const SITES = { W1: ['wing', 29.8941, -95.6481], W2: ['wing', 29.857, -95.718], W3: ['wing', 29.792, -95.718], Z1: ['zipline', 29.9766, -95.6358], A1: ['amazon', 29.8602, -95.5817] };
const OP = {   // per-hour rates at filed daily caps (no peak factor); radius m
  wing: { rate: 400 / 15, radius: 9656 }, amazon: { rate: 1000 / 16.5, radius: 12070 }, zipline: { rate: 400 * 0.95 / 15, radius: 16093 } };
const SCEN = { S0: ['W1', 'W2', 'W3', 'Z1'], S1: ['W1', 'W2', 'W3', 'Z1', 'A1'], S2: ['W1', 'W2', 'W3', 'Z1', 'A1'] };
const VZ = 5, WARM = 3600, MEAS = 4 * 3600, MIN_R = 300;

function rng(seed) { let s = (seed * 2654435761) >>> 0; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; }

// ---- track builders: push [t, x, y, z, phase, leg] at 1 s; phase in cruise | hover | vertical
function Track(t0) { this.t = t0; this.p = []; }
Track.prototype.vert = function (x, y, z0, z1, dur, leg) { dur = dur === undefined ? Math.abs(z1 - z0) / VZ : dur; const n = Math.max(1, Math.round(dur)); for (let q = 0; q < n; q++) this.p.push([this.t + q, x, y, z0 + (z1 - z0) * (q + 0.5) / n, 'vertical', leg]); this.t += n; return this; };
Track.prototype.hover = function (x, y, z, dur, leg) { for (let q = 0; q < dur; q++) this.p.push([this.t + q, x, y, z, 'hover', leg]); this.t += dur; return this; };
Track.prototype.cruise = function (a, b, z, v, leg) { const L = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(1, Math.round(L / v)); for (let q = 0; q < n; q++) { const f = (q + 0.5) / n; this.p.push([this.t + q, a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, z, 'cruise', leg]); } this.t += n; return this; };
// ramp: move horizontally a -> b while speed ramps v0 -> v1 and height z0 -> z1 over dur s (Amazon transitions)
Track.prototype.ramp = function (a, b, z0, z1, dur, leg) { const n = Math.max(1, Math.round(dur)); for (let q = 0; q < n; q++) { const f = (q + 0.5) / n; this.p.push([this.t + q, a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, z0 + (z1 - z0) * f, 'vertical', leg]); } this.t += n; return this; };
const toward = (a, b, d) => { const L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1; return [a[0] + (b[0] - a[0]) / L * d, a[1] + (b[1] - a[1]) / L * d]; };

function wingFlight(t0, pad, cust, h) {   // DFW draft EA 2.2.2
  const T = new Track(t0); T.vert(pad[0], pad[1], 0, 7, undefined, 'out').hover(pad[0], pad[1], 7, 30, 'out').vert(pad[0], pad[1], 7, h, undefined, 'out').cruise(pad, cust, h, 26.4, 'out')
    .vert(cust[0], cust[1], h, 7, undefined, 'out').hover(cust[0], cust[1], 7, 30, 'out').vert(cust[0], cust[1], 7, h, undefined, 'in').cruise(cust, pad, h, 26.4, 'in').vert(pad[0], pad[1], h, 0, undefined, 'in'); return T.p; }
function amazonFlight(t0, pad, cust) {   // Omaha EA App. E Table 1 (ft -> m: 115->35, 200->61, 140->43, 13->4, 197->60, 345->105)
  const T = new Track(t0), V = 30, d1 = V * 40 / 2, d2 = V * 30 / 2;   // transition distances at average half speed
  const a1 = toward(pad, cust, d1), c0 = toward(cust, pad, d2), b1 = toward(cust, pad, d1), p0 = toward(pad, cust, d2);
  T.vert(pad[0], pad[1], 0, 35, 15, 'out').ramp(pad, a1, 35, 61, 40, 'out').cruise(a1, c0, 61, V, 'out').ramp(c0, cust, 61, 43, 30, 'out').vert(cust[0], cust[1], 43, 4, 27, 'out').hover(cust[0], cust[1], 4, 4, 'out')
    .vert(cust[0], cust[1], 4, 60, 30, 'in').ramp(cust, b1, 60, 105, 40, 'in').cruise(b1, p0, 105, V, 'in').ramp(p0, pad, 105, 60, 30, 'in').vert(pad[0], pad[1], 60, 0, 35, 'in'); return T.p; }
function ziplineFlight(t0, dock, box, cust) {   // Texas Metros draft EA 2.2.4: all at 330 ft (101 m)
  const T = new Track(t0); T.vert(dock[0], dock[1], 0, 101, undefined, 'toBox').cruise(dock, box, 101, 31.3, 'toBox').hover(box[0], box[1], 101, 120, 'toBox').cruise(box, cust, 101, 31.3, 'out')
    .hover(cust[0], cust[1], 101, 75, 'out').cruise(cust, dock, 101, 31.3, 'in').vert(dock[0], dock[1], 101, 0, undefined, 'in'); return T.p; }

function generate(scen, seed, peak) {
  const r = rng(seed), flights = [], END = WARM + MEAS;
  for (const id of SCEN[scen]) { const [op, lat, lon] = SITES[id], c = en(lat, lon), o = OP[op]; let rate = o.rate * peak; if (op === 'zipline' && scen === 'S2') rate = 1000 * 0.95 / 15 * peak;
    const boxes = []; if (op === 'zipline') for (let k = 0; k < 20; k++) { const rr = 5000 * Math.sqrt(r()), th = 2 * Math.PI * r(); boxes.push([c[0] + rr * Math.cos(th), c[1] + rr * Math.sin(th)]); }
    let t = -Math.log(1 - r()) * 3600 / rate;
    while (t < END) { let cust; for (;;) { const rr = o.radius * Math.sqrt(r()), th = 2 * Math.PI * r(); if (rr < MIN_R) continue; cust = [c[0] + rr * Math.cos(th), c[1] + rr * Math.sin(th)]; break; }
      const pad = [c[0] + (r() - 0.5) * 30, c[1] + (r() - 0.5) * 30], t0 = Math.round(t); let tr;
      if (op === 'wing') tr = wingFlight(t0, pad, cust, 46 + 45 * r()); else if (op === 'amazon') tr = amazonFlight(t0, pad, cust); else tr = ziplineFlight(t0, pad, boxes[Math.floor(r() * boxes.length)], cust);
      flights.push({ id: flights.length, op, site: id, t0, tr, cust }); t += -Math.log(1 - r()) * 3600 / rate; } }
  return flights;
}

function count(flights, siteXY, opts) {
  opts = opts || {}; const TH = [['wide', 30, 10], ['close', 15, 5]], byT = new Map();
  for (const f of flights) for (let k = 0; k < f.tr.length; k++) { const p = f.tr[k], t = p[0]; if (t < 0) continue; let L = byT.get(t); if (!L) byT.set(t, L = []); L.push([f.id, f.op, p[1], p[2], p[3], p[4], p[5]]); }
  const res = {}, prev = { wide: new Set(), close: new Set() }, add = (k) => { res[k] = (res[k] || 0) + 1; };
  const nearSite = (x, y) => siteXY.some(([sx, sy]) => Math.hypot(x - sx, y - sy) < 300);
  const tmax = Math.max(...byT.keys());
  for (let t = 0; t <= tmax; t++) { const L = byT.get(t) || [], g = new Map(), now = { wide: new Set(), close: new Set() };
    for (let a = 0; a < L.length; a++) { const kx = Math.floor(L[a][2] / 30) + ',' + Math.floor(L[a][3] / 30); const v = g.get(kx); if (v) v.push(a); else g.set(kx, [a]); }
    for (let a = 0; a < L.length; a++) { const gx = Math.floor(L[a][2] / 30), gy = Math.floor(L[a][3] / 30);
      for (let ox = -1; ox <= 1; ox++) for (let oy = -1; oy <= 1; oy++) { const v = g.get((gx + ox) + ',' + (gy + oy)); if (!v) continue;
        for (const b of v) { if (b <= a) continue; const P = L[a], Q = L[b]; if (P[0] === Q[0]) continue; const dh = Math.hypot(P[2] - Q[2], P[3] - Q[3]), dz = Math.abs(P[4] - Q[4]);
          if (P[4] < 1 && Q[4] < 1) continue;   // both on the ground
          for (const [nm, Rh, Rv] of TH) { if (!(dh < Rh && dz < Rv)) continue; const key = P[0] < Q[0] ? P[0] + '_' + Q[0] : Q[0] + '_' + P[0]; now[nm].add(key); if (prev[nm].has(key) || t < WARM) continue;
            const cross = P[1] !== Q[1], pair = [P[1], Q[1]].sort().join('-'), ph = (P[5] === 'vertical' || Q[5] === 'vertical') ? 'vertical' : (P[5] === 'hover' || Q[5] === 'hover') ? 'hover' : 'cruise', place = nearSite(P[2], P[3]) || nearSite(Q[2], Q[3]) ? 'site' : 'away';
            const zipAmzIn = (P[1] === 'zipline' && Q[1] === 'amazon' && Q[6] === 'in') || (Q[1] === 'zipline' && P[1] === 'amazon' && P[6] === 'in');
            add(`${nm}|${cross ? 'cross' : 'same'}`); add(`${nm}|pair|${pair}`); add(`${nm}|pair|${pair}|${ph}`); add(`${nm}|${cross ? 'cross' : 'same'}|${place}`); if (cross && zipAmzIn) add(`${nm}|cross|zipline-amazonIn`); } } } }
    prev.wide = now.wide; prev.close = now.close; }
  // overflights per km^2 per day: unique flights passing over each 1 km cell, weighted to a full operating day
  const perDay = {}; for (const id of Object.keys(SITES)) perDay[id] = 0; const launched = {}; for (const f of flights) if (f.t0 >= WARM) launched[f.site] = (launched[f.site] || 0) + 1;
  const dayFlights = { wing: 400, amazon: 1000, zipline: opts.zipDay || 400 }, cells = new Map();
  for (const f of flights) { if (f.t0 < WARM) continue; const w = dayFlights[f.op] / launched[f.site], seen = new Set(); for (const p of f.tr) if (p[3] > 0.5) seen.add(Math.floor(p[1] / 1000) + ',' + Math.floor(p[2] / 1000)); for (const c of seen) cells.set(c, (cells.get(c) || 0) + w); }
  const vals = [...cells.values()].sort((a, b) => a - b);
  res.overflight_cells = vals.length; res.overflight_max_per_km2_day = vals[vals.length - 1]; res.overflight_median_per_km2_day = vals[Math.floor(vals.length / 2)];
  const top = [...cells.entries()].sort((a, b) => b[1] - a[1])[0]; res.overflight_max_cell_km = top ? top[0] : null;
  res.flights_measured = flights.filter(f => f.t0 >= WARM).length; res.flights_by_op = {}; for (const f of flights) if (f.t0 >= WARM) res.flights_by_op[f.op] = (res.flights_by_op[f.op] || 0) + 1;
  return res;
}

function run(scen, seed, peak) { const fl = generate(scen, seed, peak), siteXY = SCEN[scen].map(id => en(SITES[id][1], SITES[id][2]));
  return Object.assign({ scen, seed, peak, hours: MEAS / 3600 }, count(fl, siteXY, { zipDay: scen === 'S2' ? 1000 : 400 })); }
module.exports = { run, generate, count, wingFlight, amazonFlight, ziplineFlight, en, SITES, OP, SCEN, WARM };
if (require.main === module) { const [s, seed, pk] = process.argv.slice(2), r = run(s, +seed, +(pk || 1)); const od = path.join(__dirname, '..', 'out', 'houston1'); fs.mkdirSync(od, { recursive: true });
  fs.writeFileSync(path.join(od, `${s}_${seed}_${pk || 1}.json`), JSON.stringify(r)); console.log(s, seed, pk || 1, 'flights', r.flights_measured, 'cross wide', r['wide|cross'] || 0, 'cross close', r['close|cross'] || 0); }
