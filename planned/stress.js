'use strict';
// STRESS_PREREG.md: S0, TFR (pop-up cylinder r = 1 km at zone centre, t 5,400-7,200 s), SURGE (3x demand in the window), BOTH. Plan check 30 m / ±5 s / 10 m.
// usage: node planned/stress.js ARM D_KM SEED
const fs = require('fs'), path = require('path'), H2 = require('./houston2.js'), P = require('./proc.js'), VO = require('./vol.js');
const W0 = 5400, W1 = 7200, A1 = 9000, C = [0, 0], RAD = 1000, OP = H2.OP;
const sub = (a, b) => [a[0] - b[0], a[1] - b[1]], hyp = v => Math.hypot(v[0], v[1]);
function segHits(a, b, c, R) { const d = sub(b, a), L2 = d[0] * d[0] + d[1] * d[1] || 1, u = Math.max(0, Math.min(1, ((c[0] - a[0]) * d[0] + (c[1] - a[1]) * d[1]) / L2)); return Math.hypot(a[0] + u * d[0] - c[0], a[1] + u * d[1] - c[1]) < R; }
function tangents(p, c, R) { const v = sub(p, c), d = hyp(v), a = Math.atan2(v[1], v[0]), b = Math.acos(Math.min(1, R / d)); return [a + b, a - b]; }
function detour(h, q) {   // as nfz.js: tangents and arc on a circle 5 m outside, arc vertices on the circumscribed 10-degree polygon
  if (!segHits(h, q, C, RAD)) return [h, q];
  const RT = RAD + 5, RO = RT / Math.cos(5 * Math.PI / 180); let best = null, bl = Infinity;
  for (const th of tangents(h, C, RT)) for (const tq of tangents(q, C, RT)) for (const dir of [1, -1]) {
    let delta = (tq - th) * dir; delta = ((delta % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    const P1 = [C[0] + RT * Math.cos(th), C[1] + RT * Math.sin(th)], P2 = [C[0] + RT * Math.cos(tq), C[1] + RT * Math.sin(tq)], L = hyp(sub(P1, h)) + RT * delta + hyp(sub(q, P2)); if (L >= bl) continue;
    const pts = [h, P1], steps = Math.ceil(delta / (10 * Math.PI / 180)); for (let k = 1; k < steps; k++) { const a = th + dir * delta * k / steps; pts.push([C[0] + RO * Math.cos(a), C[1] + RO * Math.sin(a)]); }
    pts.push(P2, q); bl = L; best = pts; }
  return best; }
const R_TFR = (a, b) => detour(a, b);
const inside = (x, y) => Math.hypot(x - C[0], y - C[1]) < RAD;
const touchesInside = f => f.sg.some(s => s[8] !== 'cruise' && (inside(s[2], s[3]) || inside(s[5], s[6])));   // pad, customer, Dropbox hover or Amazon ramp inside (deviation log: clarification of "pad or customer")
const shift = (f, D) => ({ id: f.id, op: f.op, t0: f.t0 + D, sg: f.sg.map(s => [s[0] + D, ...s.slice(1)]), end: f.end + D });
const cruiseLen = f => f.sg.filter(s => s[8] === 'cruise').reduce((a, s) => a + Math.hypot(s[5] - s[2], s[6] - s[3]), 0);
function build(arm, d, seed) {
  const S = H2.sites(d, seed), tfr = arm === 'TFR' || arm === 'BOTH', surge = arm === 'SURGE' || arm === 'BOTH', tag = new Map(), info = { rerouted: 0, held: 0, extra_m: 0, base_m: 0 };
  function apply(base, routed, offset) { const out = []; for (let i = 0; i < base.length; i++) { let f = base[i]; const id = f.id + offset;
      if (tfr && f.t0 >= W0 && f.t0 < W1) { if (touchesInside(f)) { f = shift(f, W1 - f.t0); tag.set(id, 'held'); info.held++; }
        else if (routed[i].sg.length !== f.sg.length) { info.extra_m += cruiseLen(routed[i]) - cruiseLen(f); info.base_m += cruiseLen(f); f = routed[i]; tag.set(id, 'rerouted'); info.rerouted++; } }
      out.push(Object.assign({}, f, { id, t0orig: base[i].t0 })); } return out; }
  const b0 = P.flights(S, seed, null); let fl = apply(b0, tfr ? P.flights(S, seed, R_TFR) : b0, 0);
  if (surge) { const S2 = S.map(s => Object.assign({}, s, { rate: 2 * OP[s.op].rate })), e0 = P.flights(S2, seed + 50000, null), keep = e0.map((f, i) => i).filter(i => e0[i].t0 >= W0 && e0[i].t0 < W1);
    const eR = tfr ? P.flights(S2, seed + 50000, R_TFR) : e0, eb = keep.map(i => e0[i]), er = keep.map(i => eR[i]), off = 1e7; const ex = apply(eb, er, off); ex.forEach(f => { if (!tag.has(f.id)) tag.set(f.id, 'surge'); else tag.set(f.id, tag.get(f.id) + '+surge'); }); fl = fl.concat(ex); info.surge_added = ex.length; }
  return { S, fl, tag, info };
}
function run(arm, d, seed) { const { fl, tag, info } = build(arm, d, seed), ic = VO.intentCheck(fl, 30, 5, 10), byId = new Map(fl.map(f => [f.id, f])), bins = {};
  const binOf = t => t >= W0 && t < W1 ? 'window' : t >= W1 && t < A1 ? 'after' : t >= 3600 && t < W0 ? 'before' : null;
  for (const [id, D] of ic.delays) { const f = byId.get(id), b = binOf(f.t0orig); if (!b) continue; const keys = [b, b + '|' + ((tag.get(id) || 'other').includes('rerouted') ? 'rerouted' : 'other')];
    for (const k of keys) { const x = bins[k] || (bins[k] = { n: 0, delayed: 0, total_s: 0, cancelled: 0 }); x.n++; if (D === null) { x.cancelled++; continue; } if (D > 0) x.delayed++; x.total_s += D; } }
  return { r: Object.assign({ arm, d, seed, bins }, info), ic, fl, tag }; }
module.exports = { run, build, detour, inside, W0, W1, A1, C, RAD };
if (require.main === module) { const [arm, d, seed] = process.argv.slice(2), t0 = Date.now(), { r } = run(arm, +d, +seed); r.wall_s = (Date.now() - t0) / 1000; const od = path.join(__dirname, '..', 'out', 'stress'); fs.mkdirSync(od, { recursive: true });
  fs.writeFileSync(path.join(od, `${arm}_d${d}_${seed}.json`), JSON.stringify(r));
  const w = r.bins.window || {}, a = r.bins.after || {}; console.log(arm, 'd', d, 'seed', seed, 'window delayed', w.delayed + '/' + w.n, 'after', a.delayed + '/' + a.n, 'rerouted', r.rerouted, 'held', r.held, 'surge', r.surge_added || 0, r.wall_s + 's'); }
