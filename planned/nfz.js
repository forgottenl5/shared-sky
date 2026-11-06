'use strict';
// NFZ_PREREG.md: Richardson hub, straight paths with a shortest-path detour around a circular no-fly zone; share of passes over [street withheld].
const R_DISC = 12070, MIN = 300, N = 100000, NFZ = [-352, 834], BW_Y = 1224, BW_X = [285, 378, 472, 565, 659], RS = [0, 300, 500, 700, 850], WS = [50, 100, 150];
function rng(seed) { let s = (seed * 2654435761) >>> 0; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; }
const sub = (a, b) => [a[0] - b[0], a[1] - b[1]], hyp = v => Math.hypot(v[0], v[1]);
function segHitsCircle(a, b, c, R) { const d = sub(b, a), L2 = d[0] * d[0] + d[1] * d[1], u = Math.max(0, Math.min(1, ((c[0] - a[0]) * d[0] + (c[1] - a[1]) * d[1]) / L2)); return Math.hypot(a[0] + u * d[0] - c[0], a[1] + u * d[1] - c[1]) < R; }
function tangents(p, c, R) { const v = sub(p, c), d = hyp(v), a = Math.atan2(v[1], v[0]), b = Math.acos(Math.min(1, R / d)); return [a + b, a - b]; }
function path(h, q, R) {   // polyline from h to q avoiding circle (NFZ, R)
  if (R <= 0 || !segHitsCircle(h, q, NFZ, R)) return [h, q];
  let best = null, bl = Infinity; const RT = R + 5, RO = RT / Math.cos(5 * Math.PI / 180);   // NFZ K2 fix attempt 1: tangents and arc on a circle 5 m outside the zone   // arc vertices on the circumscribed 10-degree polygon so chords stay outside
  for (const th of tangents(h, NFZ, RT)) for (const tq of tangents(q, NFZ, RT)) for (const dir of [1, -1]) {
    let delta = (tq - th) * dir; delta = ((delta % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    const P1 = [NFZ[0] + RT * Math.cos(th), NFZ[1] + RT * Math.sin(th)], P2 = [NFZ[0] + RT * Math.cos(tq), NFZ[1] + RT * Math.sin(tq)];
    const L = hyp(sub(P1, h)) + RT * delta + hyp(sub(q, P2)); if (L >= bl) continue;
    const pts = [h, P1], steps = Math.ceil(delta / (10 * Math.PI / 180));
    for (let k = 1; k < steps; k++) { const a = th + dir * delta * k / steps, r = RO; pts.push([NFZ[0] + r * Math.cos(a), NFZ[1] + r * Math.sin(a)]); }
    pts.push(P2, q); bl = L; best = pts; }
  return best; }
function distPoly(p, pts) { let m = Infinity; for (let i = 0; i + 1 < pts.length; i++) { const a = pts[i], d = sub(pts[i + 1], a), L2 = d[0] * d[0] + d[1] * d[1] || 1, u = Math.max(0, Math.min(1, ((p[0] - a[0]) * d[0] + (p[1] - a[1]) * d[1]) / L2)); m = Math.min(m, Math.hypot(a[0] + u * d[0] - p[0], a[1] + u * d[1] - p[1])); } return m; }
function customers(R, seed) { const r = rng(seed), out = []; while (out.length < N) { const rr = R_DISC * Math.sqrt(r()), th = 2 * Math.PI * r(); if (rr < MIN) continue; const c = [rr * Math.cos(th), rr * Math.sin(th)]; if (R > 0 && hyp(sub(c, NFZ)) < R) continue; out.push(c); } return out; }
function run(R, seed = 1) { const cs = customers(R, seed), H = [0, 0], res = { R, frac: {}, detoured: 0 }, pts = BW_X.map(x => [x, BW_Y]);
  const hits = WS.map(() => pts.map(() => 0)); const bearing = new Array(36).fill(0);
  for (const c of cs) { const P = path(H, c, R); if (P.length > 2) res.detoured++;
    // bearing of the path 1.3 km from the hub (where [street withheld] is)
    for (let i = 0; i + 1 < P.length; i++) { const a = hyp(P[i]), b = hyp(P[i + 1]); if ((a - 1310) * (b - 1310) <= 0) { const f = (1310 - a) / ((b - a) || 1), x = P[i][0] + f * (P[i + 1][0] - P[i][0]), y = P[i][1] + f * (P[i + 1][1] - P[i][1]); bearing[Math.floor((((Math.atan2(x, y) * 180 / Math.PI) + 360) % 360) / 10)]++; break; } }
    pts.forEach((p, j) => { const dd = distPoly(p, P); WS.forEach((w, k) => { if (dd < w) hits[k][j]++; }); }); }
  WS.forEach((w, k) => { res.frac['w' + w] = hits[k].map(h => h / cs.length); }); res.detoured /= cs.length; res.bearing_at_1310m = bearing.map(b => b / cs.length); return res; }
module.exports = { run, path, customers, distPoly, segHitsCircle, NFZ, RS, WS, BW_X, BW_Y, N };
if (require.main === module) { const fs = require('fs'), out = RS.map(R => run(R)); fs.mkdirSync(__dirname + '/../out', { recursive: true }); fs.writeFileSync(__dirname + '/../out/nfz.json', JSON.stringify(out));
  for (const r of out) console.log('R', r.R, 'detoured', (100 * r.detoured).toFixed(1) + '%', 'w100 fractions', r.frac.w100.map(v => v.toFixed(3)).join(' '), '| w50', r.frac.w50.map(v => v.toFixed(3)).join(' '), '| w150', r.frac.w150.map(v => v.toFixed(3)).join(' ')); }
