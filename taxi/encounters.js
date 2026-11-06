'use strict';
// Close approaches between air taxis for the 3D page (display), same geometry and thresholds as the AIRTAXI_ENC1 runner (planned/airtaxi_enc1_run.js, arm A):
// E1 = within 1.5 NM (2,778 m) horizontally and under 500 ft (152.4 m) vertically; E2 = under 500 ft in 3D; episodes split by 30 s gaps; sampled every 0.5 s.
// Returns one event per E1 episode: [t, x, y, z, nearMiss (E2 at any moment of the episode), terminal (phase at the first moment)].
const H1 = 2778, V1 = 152.4, D2 = 152.4, GAP = 30, DT = 0.5;
function prof(Dm, P) { let zc = P.cruiseZ, dc = (zc - P.padZ) * P.slope; if (2 * dc > Dm) { dc = Dm / 2; zc = P.padZ + dc / P.slope; }
  return { dc, zc, tl: P.padZ / P.vLift, tr: Math.hypot(dc, zc - P.padZ) / P.vClimb, tc: Math.max(0, Dm - 2 * dc) / P.vCruise }; }
function mk(f, SX, P) { const a = SX[f[1]], b = SX[f[2]], dx = b[0] - a[0], dy = b[1] - a[1], Dm = Math.hypot(dx, dy); return { f, a, Dm, ux: dx / Dm, uy: dy / Dm, q: prof(Dm, P) }; }
function pos(F, tt, P) { const { f, a, q, ux, uy, Dm } = F, at = (s, z) => [a[0] + ux * s, a[1] + uy * s, z];
  if (tt < f[3]) return null;
  if (tt <= f[4]) { let e = tt - f[3]; if (e < q.tl) return at(0, P.padZ * e / q.tl); e -= q.tl; if (e < q.tr) { const u = e / q.tr; return at(q.dc * u, P.padZ + (q.zc - P.padZ) * u); } e -= q.tr;
    if (e < q.tc) return at(q.dc + P.vCruise * e, q.zc); e -= q.tc; if (e < q.tr) { const u = e / q.tr; return at(Dm - q.dc * (1 - u), q.zc - (q.zc - P.padZ) * u); } return at(Dm, P.padZ); }
  if (tt < f[5]) return 'hold';
  if (tt < f[5] + q.tl) return at(Dm, P.padZ * (1 - (tt - f[5]) / q.tl)); return null; }
function events(trace, SX, P, t0, t1) { const FL = trace.map(f => mk(f, SX, P)).sort((x, y) => x.f[3] - y.f[3]), sx = Object.values(SX), last = new Map(), lastE2 = new Map(), ev = [], open = new Map();
  let act = [], ix = 0; const term = p => sx.some(s => Math.hypot(p[0] - s[0], p[1] - s[1]) < H1); let nE2 = 0;
  for (let tt = t0; tt < t1; tt += DT) { while (ix < FL.length && FL[ix].f[3] <= tt) act.push(FL[ix++]); act = act.filter(F => tt < F.f[5] + F.q.tl + 1);
    const air = []; for (const F of act) { const p = pos(F, tt, P); if (p && p !== 'hold') air.push([F, p]); }
    for (let i = 0; i < air.length; i++) for (let j = i + 1; j < air.length; j++) { const p = air[i][1], o = air[j][1], h = Math.hypot(p[0] - o[0], p[1] - o[1]), v = Math.abs(p[2] - o[2]);
      const c1 = h < H1 && v < V1, c2 = Math.hypot(h, v) < D2; if (!c1 && !c2) continue; const key = air[i][0].f[0] + '|' + air[j][0].f[0] + '|' + Math.min(air[i][0].f[3], air[j][0].f[3]);
      if (c1) { const L = last.get(key); if (L === undefined || tt - L > GAP) { const e = [tt, (p[0] + o[0]) / 2, (p[1] + o[1]) / 2, (p[2] + o[2]) / 2, 0, term(p) || term(o) ? 1 : 0]; ev.push(e); open.set(key, e); } last.set(key, tt); }
      if (c2) { const L = lastE2.get(key); if (L === undefined || tt - L > GAP) nE2++; lastE2.set(key, tt); const e = open.get(key); if (e && c1) e[4] = 1; } } }
  return { ev, nE2 }; }
module.exports = { events };
