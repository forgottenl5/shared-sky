'use strict';
// Collision risk from planned encounters (4 Nov 2026, for RISK1). Reich-type model (Reich 1964; as described in Blom & Bakker,
// "Conflict probability and incrossing probability in Air Traffic Management", NLR-TP-2002-444): two aircraft collide if their relative
// position falls inside a box whose size is the sum of the two aircraft's sizes; position errors are Gaussian.
// Here, for each planned cross-company encounter: find the closest point of approach (CPA) of the two planned paths, then
//   P(collision) = P(|d_perp + e_perp| < R) * P(|d_z + e_z| < Hz)
// with d_perp the signed horizontal miss distance across the relative track, d_z the vertical gap at that moment,
// e_perp ~ N(0, s_h^2), e_z ~ N(0, s_z^2) the RELATIVE errors of the two aircraft (per-axis), R = r_i + r_j (half-spans), Hz = h_i + h_j (half-heights).
// Approximations (stated in the registration): straight relative motion near the CPA; along-track error only moves the meeting time; timing error ignored.
const L = require('./lab_engine.js');
const erf = x => { const s = Math.sign(x), a = Math.abs(x), t = 1 / (1 + 0.3275911 * a);   // Abramowitz-Stegun 7.1.26, |error| < 1.5e-7
  return s * (1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-a * a)); };
const Phi = x => 0.5 * (1 + erf(x / Math.SQRT2));
// P(|d + e| < W), e ~ N(0, s^2); s = 0 -> indicator
const band = (d, W, s) => s > 0 ? Phi((W - d) / s) - Phi((-W - d) / s) : (Math.abs(d) < W ? 1 : 0);
// position as count() samples it with sub > 1 (the same formula, so CPA matches what was counted)
function posAt(f, t) { let k = 0; while (k < f.sg.length - 1 && t >= f.sg[k][0] + f.sg[k][1]) k++; const sg = f.sg[k]; if (t < sg[0] || t >= f.end) return null;
  const q = Math.min(1, Math.max(0, (t - sg[0] + 0.5) / sg[1])); return [sg[2] + (sg[5] - sg[2]) * q, sg[3] + (sg[6] - sg[3]) * q, sg[4] + (sg[7] - sg[4]) * q]; }
// CPA of two planned flights within [t - W, t + W]: dense search (dt), then the signed perpendicular miss using the relative velocity there
function cpa(fa, fb, t, W = 20, dt = 0.02) { let best = null;
  for (let s = t - W; s <= t + W; s += dt) { const a = posAt(fa, s), b = posAt(fb, s); if (!a || !b || a[2] < 1 || b[2] < 1) continue;
    const dh = Math.hypot(a[0] - b[0], a[1] - b[1]); if (!best || dh < best.dh) best = { t: s, dh, dz: a[2] - b[2], a, b }; }
  if (!best) return null;
  const a1 = posAt(fa, best.t + 0.5), b1 = posAt(fb, best.t + 0.5), a0 = posAt(fa, best.t - 0.5), b0 = posAt(fb, best.t - 0.5);
  let vx = 0, vy = 0; if (a1 && b1 && a0 && b0) { vx = (a1[0] - b1[0]) - (a0[0] - b0[0]); vy = (a1[1] - b1[1]) - (a0[1] - b0[1]); }
  const rx = best.a[0] - best.b[0], ry = best.a[1] - best.b[1], vr = Math.hypot(vx, vy);
  best.vrel = vr; best.dperp = vr > 1 ? (rx * vy - ry * vx) / vr : Math.hypot(rx, ry);   // slow relative motion: use the full horizontal gap
  return best; }
// candidate encounters from count() (first moment each cross-company pair comes within [Rc, Hc], measured window, counted zone)
function encounters(cfg, fl, Rc, Hc) { const byId = new Map(fl.map(f => [f.id, f])), out = [];
  L.count(cfg, fl, { sub: 4, tEnd: cfg.warm + cfg.meas, th: [['cand', Rc, Hc]], cell: Math.max(30, Rc), onMeet: (nm, A, B, t) => { if (A[1] === B[1]) return; out.push({ a: A[0], b: B[0], opA: A[1], opB: B[1], t }); } });
  for (const e of out) { const c = cpa(byId.get(e.a), byId.get(e.b), e.t); e.cpa = c ? { t: c.t, dh: c.dh, dperp: c.dperp, dz: c.dz, vrel: c.vrel, x: (c.a[0] + c.b[0]) / 2, y: (c.a[1] + c.b[1]) / 2 } : null; }
  return out; }
// expected collisions over an encounter list: size(op) -> {r, h} (half-span, half-height, m); sh, sz: per-flight error sigmas (per axis) of the PERSONAL part
function expected(enc, size, sh, sz) { const shr = Math.SQRT2 * sh, szr = Math.SQRT2 * sz; let p = 0;
  for (const e of enc) { if (!e.cpa) continue; const A = size(e.opA), B = size(e.opB); p += band(e.cpa.dperp, A.r + B.r, shr) * band(e.cpa.dz, A.h + B.h, szr); } return p; }
// airborne flight hours inside the measured window (all flights, whole metro)
function flightHours(cfg, fl) { const t0 = cfg.warm, t1 = cfg.warm + cfg.meas; let s = 0; for (const f of fl) s += Math.max(0, Math.min(f.end, t1) - Math.max(f.t0, t0)); return s / 3600; }
module.exports = { erf, Phi, band, posAt, cpa, encounters, expected, flightHours };
if (require.main === module && process.argv[2] === 'test') { let bad = 0; const ok = (n, c, v) => { console.log((c ? 'ok   ' : 'FAIL ') + n + (v !== undefined ? ' ' + v : '')); if (!c) bad++; };
  ok('Phi(1.96) = 0.975', Math.abs(Phi(1.96) - 0.9750021) < 1e-6, Phi(1.96).toFixed(7));
  ok('band(0, 1, 1) = 0.6827', Math.abs(band(0, 1, 1) - 0.6826895) < 1e-6);
  ok('band without error is an indicator', band(0.5, 1, 0) === 1 && band(1.5, 1, 0) === 0);
  // two straight crossing flights: A east along y = 0 at z 60, B north along x = 3 at z 62; both at 20 m/s, meet at t = 1000
  const seg = (t0, x0, y0, z0, x1, y1, z1, dur) => [t0, dur, x0, y0, z0, x1, y1, z1, 'cruise', 'x'];
  const A = { id: 1, op: 'wing', t0: 900, end: 1100, sg: [seg(900, -2000, 0, 60, 2000, 0, 60, 200)] }, B = { id: 2, op: 'zipline', t0: 900, end: 1100, sg: [seg(900, 3, -2000, 62, 3, 2000, 62, 200)] };
  const c = cpa(A, B, 1000);
  // by hand: A passes (3, 0) at t = 999.65, B at t = 999.5, so the miss is 20 m/s x 0.15 s / sqrt 2 = 2.121 m at t = 999.575
  ok('crossing: CPA miss 2.121 m at t = 999.575 (worked by hand)', c && Math.abs(c.dh - 2.1213) < 0.02 && Math.abs(Math.abs(c.dperp) - 2.1213) < 0.02 && Math.abs(c.t - 999.575) < 0.03, c && JSON.stringify({ t: c.t.toFixed(2), dh: c.dh.toFixed(3), dz: c.dz.toFixed(2), vrel: c.vrel.toFixed(1) }));
  ok('crossing: vertical gap -2 m, relative speed 28.3 m/s', c && Math.abs(c.dz + 2) < 1e-9 && Math.abs(c.vrel - 28.28) < 0.1);
  const enc = [{ opA: 'wing', opB: 'zipline', cpa: c }], size = () => ({ r: 1, h: 0.5 });
  ok('no error: 2 m vertical gap > 1 m box -> P = 0', expected(enc, size, 0, 0) === 0);
  const p = expected(enc, size, 2, 2), want = band(c.dperp, 2, 2 * Math.SQRT2) * band(-2, 1, 2 * Math.SQRT2);
  ok('with 2 m errors: P = product of the two bands', Math.abs(p - want) < 1e-12, p.toFixed(5));
  // parallel offset paths 10 m apart: miss 10 m
  const C2 = { id: 3, op: 'amazon', t0: 900, end: 1100, sg: [seg(900, -2000, 10, 60, 2000, 10, 60, 100)] };
  const c2 = cpa(A, C2, 950); ok('overtaking at different speeds: perpendicular miss 10 m', c2 && Math.abs(Math.abs(c2.dperp) - 10) < 0.01, c2 && c2.dperp.toFixed(3));
  console.log(bad ? bad + ' FAILED' : 'ALL PASS'); process.exit(bad ? 1 : 0); }
