'use strict';
// PHYS1 (planned/PHYS1_PREREG.md): realistic flight profiles and operations. Produces flights in the engine's segment format
// [t0, dur, x0, y0, z0, x1, y1, z1, phase, leg] so every existing counter, check and risk model reads them unchanged.
// Sources for every number: planned/PHYS1_SOURCES_NOTES_2026-11-25.md (FAA noise reports and EAs, read 25 Nov 2026).
//
// Factors (each can be switched off for the leave-one-out runs):
//   prof  measured climb / descent rates, gradual acceleration and deceleration, 30-degree-bank turns at detour points (Wing, Zipline;
//         Amazon's builder already used its filed phase times and is kept, with turns added)
//   zdfw  DFW Zipline as filed for DFW: 41 kt, dock -> customer -> dock (no dropbox). Houston Zipline: 70 mph via a dropbox (2026 Texas filing)
//   pop   customers drawn from Census 2020 block-group population (planned/census.js loadBG)
//   air   routes that would cross an FAA UAS Facility Map cell with a 0 ft ceiling detour around it (or the customer is redrawn)
//   peak  the 3 simulated hours are the lunch peak: 11:00-14:00 local, demand shaped with two daily peaks, busiest hour = P x the daily mean
//   amz15 Amazon flies its 1,000 daily flights over 15 hours (7 am - 10 pm, Texas EA), not 16.5
const fs = require('fs'), path = require('path'), CEN = require('./census.js');
const G = 9.80665, BANK = 30, MIN_R = 300;
const ALL = { prof: true, zdfw: true, pop: true, air: true, peak: true, amz15: true };

// ---------- measured profiles (m, s, m/s) ----------
const FT = 0.3048, KT = 0.514444;
const P = {
  wing: { v: 50.5 * KT, popUp: [33 * FT, 22 * FT, 9], load: 30, up: 143 * FT / 14, acc: 13, dec: 15, dnDel: 143 * FT / 20, hDel: 23 * FT, drop: 30,
          upDel: 143 * FT / 15, acc2: 14, dec2: 14, dnLand: 145 * FT / 15, lowZ: 20 * FT, lowT: 13 },
  zipH: { v: 70 * 0.44704, up: 75, acc: 10, dec: 20, pick: 120, drop: 75, dn: 75 },        // Houston (2026 Texas Metros text: 70 mph, dropbox model)
  zipD: { v: 41 * KT, up: 75, acc: 10, dec: 20, drop: 75, dn: 75 },                        // DFW (signed DFW EA + its noise report)
  amazon: { v: 30 }
};
const turnR = v => v * v / (G * Math.tan(BANK * Math.PI / 180));

function Seg(t0) { this.t = t0; this.s = []; }
Seg.prototype.put = function (n, x0, y0, z0, x1, y1, z1, ph, leg) { n = Math.max(1, Math.round(n)); this.s.push([this.t, n, x0, y0, z0, x1, y1, z1, ph, leg]); this.t += n; return this; };
Seg.prototype.vert = function (x, y, z0, z1, dur, leg) { return this.put(dur, x, y, z0, x, y, z1, 'vertical', leg); };
Seg.prototype.hover = function (x, y, z, dur, leg) { return this.put(dur, x, y, z, x, y, z, 'hover', leg); };
Seg.prototype.line = function (a, b, z, dur, leg) { return this.put(dur, a[0], a[1], z, b[0], b[1], z, 'cruise', leg); };
Seg.prototype.ramp = function (a, b, z0, z1, dur, leg) { return this.put(dur, a[0], a[1], z0, b[0], b[1], z1, 'vertical', leg); };
const dist = (a, b) => Math.hypot(b[0] - a[0], b[1] - a[1]);
const lerp = (a, b, f) => [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];

// A horizontal path at height z through waypoints, flown at speed v, starting from rest over ta s and ending at rest over td s (either may be 0),
// with corners rounded by a 30-degree-bank arc (3 chords). Acceleration and deceleration are each two sub-segments (mean speed v/4 then 3v/4).
function flyPath(T, pts, z, v, ta, td, leg) {
  const R = turnR(v), poly = [pts[0]];
  for (let i = 1; i < pts.length - 1; i++) { const a = pts[i - 1], b = pts[i], c = pts[i + 1], u1 = [(b[0] - a[0]) / dist(a, b), (b[1] - a[1]) / dist(a, b)], u2 = [(c[0] - b[0]) / dist(b, c), (c[1] - b[1]) / dist(b, c)];
    const th = Math.acos(Math.max(-1, Math.min(1, u1[0] * u2[0] + u1[1] * u2[1]))), cut = Math.min(R * Math.tan(th / 2), 0.45 * dist(a, b), 0.45 * dist(b, c));
    if (th < 0.02 || !(cut > 1)) { poly.push(b); continue; }
    const p = [b[0] - u1[0] * cut, b[1] - u1[1] * cut], q = [b[0] + u2[0] * cut, b[1] + u2[1] * cut];
    poly.push(p, lerp(lerp(p, b, 2 / 3), lerp(b, q, 1 / 3), 0.5), q); }   // p -> point on the arc's chord near b -> q (3 chords)
  poly.push(pts[pts.length - 1]);
  const L = []; let tot = 0; for (let i = 1; i < poly.length; i++) { L.push(dist(poly[i - 1], poly[i])); tot += L[L.length - 1]; }
  let da = v * ta / 2, dd = v * td / 2; if (da + dd > tot) { const k = tot / (da + dd); da *= k; dd *= k; ta *= Math.sqrt(k); td *= Math.sqrt(k); }
  // speed profile as (distance, duration) pieces along the polyline
  const pieces = []; if (ta > 0) pieces.push([da / 4, ta / 2], [3 * da / 4, ta / 2]); pieces.push([tot - da - dd, (tot - da - dd) / v]); if (td > 0) pieces.push([3 * dd / 4, td / 2], [dd / 4, td / 2]);
  let segI = 0, segPos = 0;
  const walk = d => { const out = [[...pointAt(segI, segPos)]]; let rem = d;
    while (rem > 1e-6 && segI < L.length) { const left = L[segI] - segPos; if (rem < left) { segPos += rem; rem = 0; } else { rem -= left; segI++; segPos = 0; } out.push([...pointAt(segI, segPos)]); } return out; };
  const pointAt = (i, s) => i >= L.length ? poly[poly.length - 1] : lerp(poly[i], poly[i + 1], L[i] ? s / L[i] : 0);
  for (const [d, dur] of pieces) { if (d <= 1e-6) continue; const pp = walk(d); let len = 0; for (let i = 1; i < pp.length; i++) len += dist(pp[i - 1], pp[i]);
    for (let i = 1; i < pp.length; i++) { const l = dist(pp[i - 1], pp[i]); if (l < 1e-6) continue; T.line(pp[i - 1], pp[i], z, dur * l / len, leg); } }
  return T; }

function wingFlight(t0, pad, cust, h, via, prof) {
  const w = P.wing, T = new Seg(t0), out = via ? [pad, via, cust] : [pad, cust], back = via ? [cust, via, pad] : [cust, pad];
  if (!prof) return null;
  T.vert(pad[0], pad[1], 0, w.popUp[1], w.popUp[2], 'out').hover(pad[0], pad[1], w.popUp[1], w.load, 'out').vert(pad[0], pad[1], w.popUp[1], h, (h - w.popUp[1]) / w.up, 'out');
  flyPath(T, out, h, w.v, w.acc, w.dec, 'out');
  T.vert(cust[0], cust[1], h, w.hDel, (h - w.hDel) / w.dnDel, 'out').hover(cust[0], cust[1], w.hDel, w.drop, 'out').vert(cust[0], cust[1], w.hDel, h, (h - w.hDel) / w.upDel, 'in');
  flyPath(T, back, h, w.v, w.acc2, w.dec2, 'in');
  T.vert(pad[0], pad[1], h, w.lowZ, (h - w.lowZ) / w.dnLand, 'in').vert(pad[0], pad[1], w.lowZ, 0, w.lowT, 'in'); return T.s; }

function ziplineFlight(t0, dock, box, cust, hz, via, dfw, prof) {
  const z = dfw ? P.zipD : P.zipH, T = new Seg(t0);
  T.vert(dock[0], dock[1], 0, hz, z.up, 'toBox');
  if (!dfw) { flyPath(T, via ? [dock, via, box] : [dock, box], hz, z.v, z.acc, z.dec, 'toBox'); T.hover(box[0], box[1], hz, z.pick, 'toBox'); flyPath(T, [box, cust], hz, z.v, z.acc, z.dec, 'out'); }
  else flyPath(T, via ? [dock, via, cust] : [dock, cust], hz, z.v, z.acc, z.dec, 'out');
  T.hover(cust[0], cust[1], hz, z.drop, 'out'); flyPath(T, via ? [cust, via, dock] : [cust, dock], hz, z.v, z.acc, z.dec, 'in');
  T.vert(dock[0], dock[1], hz, 0, z.dn, 'in'); return T.s; }

function amazonFlight(t0, pad, cust, ho, hi, via) {   // the engine's MK30 profile (filed phase times), with an optional detour point and turns there
  const V = P.amazon.v, T = new Seg(t0), d1 = V * 40 / 2, d2 = V * 30 / 2, out = via ? [pad, via, cust] : [pad, cust], back = via ? [cust, via, pad] : [cust, pad];
  const a1 = toward(out[0], out[1], d1), c0 = toward(out[out.length - 1], out[out.length - 2], d2), b1 = toward(back[0], back[1], d1), p0 = toward(back[back.length - 1], back[back.length - 2], d2);
  T.vert(pad[0], pad[1], 0, 35, 15, 'out').ramp(pad, a1, 35, ho, 40, 'out'); flyPath(T, [a1, ...out.slice(1, -1), c0], ho, V, 0, 0, 'out');
  T.ramp(c0, cust, ho, 43, 30, 'out').vert(cust[0], cust[1], 43, 4, 27, 'out').hover(cust[0], cust[1], 4, 4, 'out').vert(cust[0], cust[1], 4, 60, 30, 'in').ramp(cust, b1, 60, hi, 40, 'in');
  flyPath(T, [b1, ...back.slice(1, -1), p0], hi, V, 0, 0, 'in'); T.ramp(p0, pad, hi, 60, 30, 'in').vert(pad[0], pad[1], 60, 0, 35, 'in'); return T.s; }
const toward = (a, b, d) => { const L = dist(a, b) || 1; return [a[0] + (b[0] - a[0]) / L * d, a[1] + (b[1] - a[1]) / L * d]; };

// ---------- demand shape: two daily peaks (12:30, 18:30, sigma 1 h) over 07:00-22:00, mean 1, busiest clock hour = Pk ----------
function profile(Pk) { const g = h => Math.exp(-((h - 12.5) ** 2) / 2) + Math.exp(-((h - 18.5) ** 2) / 2), hourMean = (a, f) => { let s = 0; for (let k = 0; k < 60; k++) s += f(a + (k + 0.5) / 60); return s / 60; };
  const gm = [], N = 15; for (let h = 7; h < 22; h++) gm.push(hourMean(h, g)); const mg = gm.reduce((a, b) => a + b) / N, gmax = Math.max(...gm);
  if (Pk <= 1) return { f: () => 1, fmax: 1 };   // flat
  const a = (Pk - 1) / (gmax - mg), b = 1 - a * mg; return { f: h => Math.max(0, b + a * g(h)), fmax: b + a * Math.max(...Array.from({ length: 1500 }, (_, i) => g(7 + i / 100))), a, b }; }

// ---------- airport cells (0 ft ceiling) ----------
function zeroCells(metro, lat0, lon0) {
  const file = path.join(__dirname, '../data/uasfm_' + (metro === 'dfw' ? 'dfw' : 'houston') + '.geojson'), Gj = JSON.parse(fs.readFileSync(file, 'utf8')), z = new Set();
  for (const f of Gj.features) if (f.properties.CEILING === 0) { const c = f.geometry.coordinates[0]; z.add(Math.round(Math.min(...c.map(p => p[0])) * 120) + ',' + Math.round(Math.min(...c.map(p => p[1])) * 120)); }
  const cosl = Math.cos(lat0 * Math.PI / 180), toLL = (x, y) => [lat0 + y / 110540, lon0 + x / (111320 * cosl)];
  return { n: z.size, zeroAt: (x, y) => { const [la, lo] = toLL(x, y); return z.has(Math.floor(lo * 120 + 1e-9) + ',' + Math.floor(la * 120 + 1e-9)); } }; }
function clear(Z, a, b, home) { const d = dist(a, b), n = Math.max(1, Math.ceil(d / 100));
  for (let i = 0; i <= n; i++) { const p = lerp(a, b, i / n); if (dist(p, home) < 1000) continue; if (Z.zeroAt(p[0], p[1])) return false; } return true; }
// detour: smallest perpendicular offset of the midpoint (1-12 km, either side) that clears both legs; null if none
function detour(Z, a, b) { const m = lerp(a, b, 0.5), L = dist(a, b) || 1, n = [-(b[1] - a[1]) / L, (b[0] - a[0]) / L];
  for (const k of [1000, 2000, 3000, 5000, 8000, 12000]) for (const s of [1, -1]) { const v = [m[0] + n[0] * k * s, m[1] + n[1] * k * s]; if (clear(Z, a, v, a) && clear(Z, v, b, a)) return v; } return null; }

// ---------- flights ----------
// Opt-in departure / arrival gates (used by a later study, ROUTE1; off by default, so PHYS1 is unaffected): each site sends flights through gate points 1 km out over its least-populated side (Census block-group centres 300-1,500 m
// away, 8 wedges of 45 degrees); 'one' = that single gate, 'four' = it plus 90 / 180 / 270 degrees. Customers within 1.5 km fly direct. Deterministic.
const GATECACHE = new Map(), GATEBG = {};
function gatesOf(S, o) { const key = o.metro + '|' + S.c.join(',') + '|' + o.gates; if (GATECACHE.has(key)) return GATECACHE.get(key);
  const BG = GATEBG[o.metro] || (GATEBG[o.metro] = CEN.loadBG(o.toXY)), w = new Array(8).fill(0);
  for (const b of BG) { const dx = b.c[0] - S.c[0], dy = b.c[1] - S.c[1], d = Math.hypot(dx, dy); if (d < 300 || d > 1500) continue; let a = Math.atan2(dy, dx); if (a < 0) a += 2 * Math.PI; w[Math.round(a / (Math.PI / 4)) % 8] += b.pop; }
  let k0 = 0; for (let k = 1; k < 8; k++) if (w[k] < w[k0]) k0 = k;
  const ks = o.gates === 'four' ? [0, 2, 4, 6].map(j => (k0 + j) % 8) : [k0], G = ks.map(k => { const a = k * Math.PI / 4; return { a, p: [S.c[0] + GATE_R * Math.cos(a), S.c[1] + GATE_R * Math.sin(a)] }; });
  const res = { G, wedgePop: w, k0 }; GATECACHE.set(key, res); return res; }
const GATE_R = 1000;
function gateFor(S, cust, o) { if (dist(S.c, cust) <= 1500) return null; const { G } = gatesOf(S, o); let a = Math.atan2(cust[1] - S.c[1], cust[0] - S.c[0]); if (a < 0) a += 2 * Math.PI;
  let best = G[0], bd = Infinity; for (const g of G) { let d = Math.abs(a - g.a); if (d > Math.PI) d = 2 * Math.PI - d; if (d < bd) { bd = d; best = g; } } return best.p; }
const RAD = { wing: 9656, amazon: 12070, zipline: 16093 };
function flights(cfg, siteList, seed, A, o) {
  o = Object.assign({ metro: 'houston', Pk: 2, toXY: null, lat0: 0, lon0: 0 }, o); const F = Object.assign({}, ALL, o.factors || {}), stats = { detour: 0, redrawAir: 0, gaveUpAir: 0, popFallback: 0, n: 0 };
  const L = require('../lab/lab_engine.js'), r = L.rng(seed), r2 = L.rng(seed + 104729), END = cfg.warm + cfg.meas;
  const pick0 = v => Array.isArray(v) ? v[0] + (v[1] - v[0]) * r2() : v, prof = profile(F.peak ? o.Pk : 1), hourAt = t => 11 + t / 3600;
  const BG = F.pop ? CEN.loadBG(o.toXY) : null, Z = F.air ? zeroCells(o.metro, o.lat0, o.lon0) : null, tab = new Map(), out = [];
  if (BG) for (const S of siteList) { const rad = RAD[S.op], list = [], cum = []; let tot = 0; for (const b of BG) if (dist(b.c, S.c) <= rad + CEN.SIG) { tot += b.pop; list.push(b); cum.push(tot); } tab.set(S, { list, cum, tot }); }
  const uni = (S, rr) => { for (;;) { const d = RAD[S.op] * Math.sqrt(rr()), th = 2 * Math.PI * rr(); if (d >= MIN_R) return [S.c[0] + d * Math.cos(th), S.c[1] + d * Math.sin(th)]; } };
  const popPick = (S, rr) => { const T = tab.get(S); if (!T || !T.tot) { stats.popFallback++; return uni(S, rr); }
    for (let k = 0; k < 50; k++) { const u = rr() * T.tot; let lo = 0, hi = T.cum.length - 1; while (lo < hi) { const m = (lo + hi) >> 1; if (T.cum[m] < u) lo = m + 1; else hi = m; }
      const b = T.list[lo], g1 = Math.sqrt(-2 * Math.log(1 - rr())), g2 = 2 * Math.PI * rr(), p = [b.c[0] + CEN.SIG * g1 * Math.cos(g2), b.c[1] + CEN.SIG * g1 * Math.sin(g2)], d = dist(p, S.c);
      if (d >= MIN_R && d <= RAD[S.op]) return p; } stats.popFallback++; return uni(S, rr); };
  for (const S of siteList) {
    const op = S.op, base = S.rate || (op === 'wing' ? 400 / 15 : op === 'amazon' ? (F.amz15 ? 1000 / 15 : 1000 / 16.5) : 1000 * 0.95 / 15), rmax = base * prof.fmax, boxes = [];
    const dfwZip = op === 'zipline' && o.metro === 'dfw' && F.zdfw;
    if (op === 'zipline' && !dfwZip) for (let k = 0; k < 20; k++) { const rr = 5000 * Math.sqrt(r()), th = 2 * Math.PI * r(); boxes.push([S.c[0] + rr * Math.cos(th), S.c[1] + rr * Math.sin(th)]); }
    let t = -Math.log(1 - r()) * 3600 / rmax;
    while (t < END) {
      if (prof.fmax > 1 && r() * prof.fmax > prof.f(hourAt(t))) { t += -Math.log(1 - r()) * 3600 / rmax; continue; }   // thinning to the hourly demand shape
      let cust = null, via = null;
      for (let k = 0; k < 20; k++) { const c = BG ? popPick(S, r) : uni(S, r); if (!Z || clear(Z, S.c, c, S.c)) { cust = c; break; } const v = detour(Z, S.c, c); if (v) { cust = c; via = v; stats.detour++; break; } stats.redrawAir++; }
      if (!cust) { stats.gaveUpAir++; cust = BG ? popPick(S, r) : uni(S, r); }
      if (o.gates && !via) { const g = gateFor(S, cust, o); if (g) { via = g; stats.gate = (stats.gate || 0) + 1; } }   // opt-in departure / arrival gates (off by default; uses no random numbers)
      const pad = [S.c[0] + (r() - 0.5) * 30, S.c[1] + (r() - 0.5) * 30], t0 = Math.round(t); let sg;
      if (op === 'wing') { const h = A.wing[0] + (A.wing[1] - A.wing[0]) * r(); sg = F.prof ? wingFlight(t0, pad, cust, h, via, true) : null; if (!sg) sg = engineFlight(L, 'wing', t0, pad, cust, h, via); }
      else if (op === 'amazon') sg = amazonFlight(t0, pad, cust, pick0(A.aOut), pick0(A.aIn), via);
      else { const bx = boxes.length ? boxes[Math.floor(r() * boxes.length)] : null, hz = pick0(A.zip);
        sg = F.prof || dfwZip ? ziplineFlight(t0, pad, bx, cust, hz, via, dfwZip, F.prof) : engineFlight(L, 'zipline', t0, pad, cust, hz, via, bx); }
      out.push({ id: out.length, op, t0, sg, end: sg[sg.length - 1][0] + sg[sg.length - 1][1], via: !!via }); stats.n++;
      t += -Math.log(1 - r()) * 3600 / rmax; } }
  out.stats = stats; return out; }

// prof off: the engine's own Wing / Zipline builders (5 m/s climbs, instant speed changes), reached through a one-site L.flights call is not possible,
// so they are re-implemented here exactly as lab/lab_engine.js lines 28-45 (checked by test K3)
function engineFlight(L, op, t0, pad, cust, h, via, box) {
  const T = new Seg(t0), VZ = 5, vz = (z0, z1) => Math.abs(z1 - z0) / VZ;
  if (op === 'wing') { const V = 26.4, leg = (a, b, lg) => { if (via && dist(a, via) > 300 && dist(b, via) > 300) { T.line(a, via, h, dist(a, via) / V, lg).line(via, b, h, dist(via, b) / V, lg); } else T.line(a, b, h, dist(a, b) / V, lg); };
    T.vert(pad[0], pad[1], 0, 7, vz(0, 7), 'out').hover(pad[0], pad[1], 7, 30, 'out').vert(pad[0], pad[1], 7, h, vz(7, h), 'out'); leg(pad, cust, 'out');
    T.vert(cust[0], cust[1], h, 7, vz(h, 7), 'out').hover(cust[0], cust[1], 7, 30, 'out').vert(cust[0], cust[1], 7, h, vz(7, h), 'in'); leg(cust, pad, 'in'); T.vert(pad[0], pad[1], h, 0, vz(h, 0), 'in'); return T.s; }
  const V = 31.3, leg = (a, b, lg) => { if (via && dist(a, via) > 300 && dist(b, via) > 300) { T.line(a, via, h, dist(a, via) / V, lg).line(via, b, h, dist(via, b) / V, lg); } else T.line(a, b, h, dist(a, b) / V, lg); };
  T.vert(pad[0], pad[1], 0, h, vz(0, h), 'toBox'); leg(pad, box, 'toBox'); T.hover(box[0], box[1], h, 120, 'toBox'); T.line(box, cust, h, dist(box, cust) / V, 'out').hover(cust[0], cust[1], h, 75, 'out');
  leg(cust, pad, 'in'); T.vert(pad[0], pad[1], h, 0, vz(h, 0), 'in'); return T.s; }

module.exports = { gatesOf, gateFor, flights, profile, turnR, flyPath, Seg, P, ALL, zeroCells, detour, clear, wingFlight, ziplineFlight, amazonFlight, engineFlight };
