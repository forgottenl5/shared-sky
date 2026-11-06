'use strict';
// Simple air-taxi noise model for AIRTAXI_NOISE1 (registration planned/AIRTAXI_NOISE1_PREREG.md).
// Point source, spherical spreading only: L = Lref + offset - 20 log10(max(d, 30 m) / dref). Two sources: take-off/landing (65 dBA at 100 m,
// Joby's "below 65 dBA at 100 m" from the NASA test) and cruise (45.2 dBA at 500 m, Joby's figure). Flights come from taxi/net2.js traces:
// [aircraft, from, to, take-off, eta, landing, pad clear, deadhead]. Units: metres, seconds. Clock: sim time 0 = 04:00.
const SRC = { tol: [65, 100], cr: [45.2, 500] }, FLOOR = 30, CUT = 35;   // energy and maxima below CUT dBA are ignored (window radius)
function level(src, d, off = 0) { const [L, r] = SRC[src]; return L + off - 20 * Math.log10(Math.max(d, FLOOR) / r); }
function radiusFor(src, off, z) { const [L, r] = SRC[src], R = r * Math.pow(10, (L + off - CUT) / 20); return R > z ? Math.sqrt(R * R - z * z) : 0; }
function prof(D, P) { let zc = P.cruiseZ, dc = (zc - P.padZ) * P.slope; if (2 * dc > D) { dc = D / 2; zc = P.padZ + dc / P.slope; }
  const tl = P.padZ / P.vLift, tr = Math.hypot(dc, zc - P.padZ) / P.vClimb, tc = Math.max(0, D - 2 * dc) / P.vCruise; return { dc, zc, tl, tr, tc }; }
// position and source at time t for a flight; null when not airborne
function posAt(f, t, S, P) {
  const a = S[f[1]], b = S[f[2]], dx = b[0] - a[0], dy = b[1] - a[1], D = Math.hypot(dx, dy), q = prof(D, P), ux = dx / D, uy = dy / D;
  const at = (s, z, src) => ({ x: a[0] + ux * s, y: a[1] + uy * s, z, src });
  if (t < f[3]) return null;
  if (t <= f[4]) { let e = t - f[3];
    if (e < q.tl) return at(0, P.padZ * e / q.tl, 'tol'); e -= q.tl;
    if (e < q.tr) { const k = e / q.tr; return at(q.dc * k, P.padZ + (q.zc - P.padZ) * k, 'tol'); } e -= q.tr;
    if (e < q.tc) return at(q.dc + P.vCruise * e, q.zc, 'cr'); e -= q.tc;
    if (e < q.tr) { const k = e / q.tr; return at(D - q.dc * (1 - k), q.zc - (q.zc - P.padZ) * k, 'tol'); }
    return at(D, P.padZ, 'tol'); }
  if (t < f[5]) return { x: b[0], y: b[1], z: 150, src: 'tol' };                       // holding: hover 150 m over the site
  const e = t - f[5]; if (e <= q.tl) return at(D, P.padZ * (1 - e / q.tl), 'tol');
  return null;
}
function flightEnd(f, P) { return f[5] + P.padZ / P.vLift; }
const penalty = t => { const h = 4 + t / 3600; return (h >= 22 || h < 7) ? 10 : 0; };   // DNL night penalty (22:00-07:00)
class Grid {
  constructor(x0, y0, nx, ny, step) { Object.assign(this, { x0, y0, nx, ny, step }); const n = nx * ny;
    this.E = new Float64Array(n); this.n55 = new Uint16Array(n); this.n65 = new Uint16Array(n); this.fmax = new Float32Array(n).fill(-1); this.touched = []; }
  // add one flight: energy for samples inside [W, Wend); event counts if the take-off is inside [W, Wend)
  addFlight(f, S, P, off, W, Wend, dt = 1) {
    const t1 = flightEnd(f, P), count = f[3] >= W && f[3] < Wend, st = this.step;
    const pf = this.posFn || posAt;
    for (let t = f[3]; t <= t1; t += dt) { const p = pf(f, t, S, P); if (!p) continue;
      const R = radiusFor(p.src, off, p.z); if (R <= 0) continue;
      const i0 = Math.max(0, Math.floor((p.x - R - this.x0) / st)), i1 = Math.min(this.nx - 1, Math.ceil((p.x + R - this.x0) / st));
      const j0 = Math.max(0, Math.floor((p.y - R - this.y0) / st)), j1 = Math.min(this.ny - 1, Math.ceil((p.y + R - this.y0) / st));
      const inWin = t >= W && t < Wend, pen = penalty(t);
      for (let j = j0; j <= j1; j++) { const gy = this.y0 + j * st - p.y; for (let i = i0; i <= i1; i++) { const gx = this.x0 + i * st - p.x;
        const L = level(p.src, Math.sqrt(gx * gx + gy * gy + p.z * p.z), off); if (L < CUT) continue; const k = j * this.nx + i;
        if (inWin) this.E[k] += Math.pow(10, (L + pen) / 10) * dt;
        if (this.fmax[k] < 0) this.touched.push(k); if (L > this.fmax[k]) this.fmax[k] = L; } } }
    for (const k of this.touched) { if (count) { if (this.fmax[k] >= 55) this.n55[k]++; if (this.fmax[k] >= 65) this.n65[k]++; } this.fmax[k] = -1; }
    this.touched.length = 0; }
  dnl(k) { return this.E[k] > 0 ? 10 * Math.log10(this.E[k] / 86400) : -Infinity; }
  xy(k) { return [this.x0 + (k % this.nx) * this.step, this.y0 + Math.floor(k / this.nx) * this.step]; }
}
module.exports = { SRC, FLOOR, CUT, level, radiusFor, prof, posAt, flightEnd, penalty, Grid };
