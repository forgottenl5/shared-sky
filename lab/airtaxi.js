'use strict';
// Shared Sky air-taxi module (26 Oct 2026). Separate from lab_engine.js so every earlier result stays reproducible unchanged.
// Air taxis fly vertiport to vertiport: vertical lift to a hover height, a straight climb along the departure path at a fixed
// slope (horizontal : vertical) to cruise, cruise, a straight descent along the approach path, vertical landing. Segments use the
// drone engine's format [t, dur, x0, y0, z0, x1, y1, z1, phase, leg] so the same position code applies.
// Encounters are counted between air taxis and delivery drones only, with their own (much larger) volumes than drone-drone conflicts.
// Two mitigations: a static drone exclusion circle around each vertiport, and a dynamic reservation (drones yield to scheduled
// air-taxi departure/approach volumes, like strategic deconfliction).
const L = require('./lab_engine.js');

const DEF = { padZ: 15, vLift: 2.5, slope: 8, vClimb: 40, cruiseZ: 457, vCruise: 67 };

function put(s, t, n, x0, y0, z0, x1, y1, z1, ph, leg) { n = Math.max(1, Math.round(n)); s.push([t, n, x0, y0, z0, x1, y1, z1, ph, leg]); return t + n; }

// One air-taxi flight from A to B ([x, y] in metres), profile P (DEF overridable).
function taxiFlight(id, t0, A, B, P) {
  P = Object.assign({}, DEF, P || {}); const s = [], dx = B[0] - A[0], dy = B[1] - A[1], D = Math.hypot(dx, dy), ux = dx / D, uy = dy / D;
  let zc = P.cruiseZ, dc = (zc - P.padZ) * P.slope; if (2 * dc > D) { dc = D / 2; zc = P.padZ + dc / P.slope; }
  const a1 = [A[0] + ux * dc, A[1] + uy * dc], b0 = [B[0] - ux * dc, B[1] - uy * dc], ramp = Math.hypot(dc, zc - P.padZ) / P.vClimb;
  let t = t0;
  t = put(s, t, P.padZ / P.vLift, A[0], A[1], 0, A[0], A[1], P.padZ, 'lift', 'dep');
  t = put(s, t, ramp, A[0], A[1], P.padZ, a1[0], a1[1], zc, 'depart', 'dep');
  if (D - 2 * dc > 1) t = put(s, t, (D - 2 * dc) / P.vCruise, a1[0], a1[1], zc, b0[0], b0[1], zc, 'cruise', 'cru');
  t = put(s, t, ramp, b0[0], b0[1], zc, B[0], B[1], P.padZ, 'approach', 'arr');
  t = put(s, t, P.padZ / P.vLift, B[0], B[1], P.padZ, B[0], B[1], 0, 'land', 'arr');
  return { id, op: 'taxi', t0, sg: s, end: t, from: A, to: B, cruiseZ: zc };
}

// Schedule: routes [{a: [x,y], b: [x,y], perHour, both}] -> Poisson departures over [0, END), each direction perHour.
function schedule(cfg, routes, seed, P) {
  const r = L.rng(seed + 424243), END = cfg.warm + cfg.meas, out = [];
  for (const R of routes) for (const [A, B] of R.both === false ? [[R.a, R.b]] : [[R.a, R.b], [R.b, R.a]]) {
    if (!(R.perHour > 0)) continue; let t = -Math.log(1 - r()) * 3600 / R.perHour;
    while (t < END) { out.push(taxiFlight(out.length, Math.round(t), A, B, P)); t += -Math.log(1 - r()) * 3600 / R.perHour; } }
  return out;
}

// Position of a flight at time t (null if not in its time span). Segment lookup by binary search.
function posOf(f, t) {
  if (t < f.t0 || t >= f.end) return null; const S = f.sg; let lo = 0, hi = S.length - 1;
  while (lo < hi) { const m = (lo + hi + 1) >> 1; if (S[m][0] <= t) lo = m; else hi = m - 1; }
  const g = S[lo], u = Math.min(1, Math.max(0, (t - g[0]) / g[1]));
  return [g[2] + (g[5] - g[2]) * u, g[3] + (g[6] - g[3]) * u, g[4] + (g[7] - g[4]) * u, g[8]];
}
function bbox(f) { let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity; for (const s of f.sg) { x0 = Math.min(x0, s[2], s[5]); x1 = Math.max(x1, s[2], s[5]); y0 = Math.min(y0, s[3], s[6]); y1 = Math.max(y1, s[3], s[6]); } return [x0, x1, y0, y1]; }

// Low samples of each taxi: every dt seconds where z < zCap, inside [tA, tB).
function lowSamples(taxis, zCap, tA, tB, dt) {
  const out = [];
  for (const f of taxis) for (let t = Math.max(f.t0, tA); t < Math.min(f.end, tB); t += dt) { const p = posOf(f, t); if (p && p[2] < zCap) out.push({ f, t, x: p[0], y: p[1], z: p[2], ph: p[3] }); }
  return out;
}

// Encounters between air taxis and drones in the measured window.
// opts.th: [[name, Rh, Rv], ...]; opts.dt (s); opts.pads: [[x,y], ...] for distance-from-pad reporting.
function encounters(cfg, drones, taxis, opts) {
  opts = opts || {}; const TH = opts.th || [['nmac', 152.4, 30.5], ['wellclear', 609.6, 76.2]], dt = opts.dt || 1, tA = cfg.warm, tB = cfg.warm + cfg.meas;
  const maxRh = Math.max(...TH.map(x => x[1])), maxRv = Math.max(...TH.map(x => x[2])), zCap = (opts.droneTop || 130) + maxRv;
  const BIN = 60, bins = new Map(), BB = drones.map(bbox);
  drones.forEach((f, i) => { for (let b = Math.floor(f.t0 / BIN); b <= Math.floor(f.end / BIN); b++) { const v = bins.get(b); if (v) v.push(i); else bins.set(b, [i]); } });
  const LS = lowSamples(taxis, zCap, tA, tB, dt), res = {}, seen = {};
  for (const [nm] of TH) { res[nm] = { n: 0, byOp: {}, byPhase: {}, movementsWithAny: 0, list: [] }; seen[nm] = new Set(); }
  const moves = new Set(), movesHit = Object.fromEntries(TH.map(x => [x[0], new Set()]));
  for (const s of LS) {
    const mv = s.f.id + (s.ph === 'lift' || s.ph === 'depart' ? 'd' : 'a'); moves.add(mv);
    const v = bins.get(Math.floor(s.t / BIN)); if (!v) continue;
    for (const i of v) { const b = BB[i]; if (s.x < b[0] - maxRh || s.x > b[1] + maxRh || s.y < b[2] - maxRh || s.y > b[3] + maxRh) continue;
      const p = posOf(drones[i], s.t); if (!p || p[2] < 1) continue; const dh = Math.hypot(p[0] - s.x, p[1] - s.y), dz = Math.abs(p[2] - s.z);
      for (const [nm, Rh, Rv] of TH) { if (!(dh < Rh && dz < Rv)) continue; const key = mv + '_' + drones[i].id; movesHit[nm].add(mv); if (seen[nm].has(key)) continue; seen[nm].add(key);
        const R = res[nm], op = drones[i].op; R.n++; R.byOp[op] = (R.byOp[op] || 0) + 1; R.byPhase[s.ph] = (R.byPhase[s.ph] || 0) + 1;
        const dPad = opts.pads ? Math.min(...opts.pads.map(q => Math.hypot(q[0] - s.x, q[1] - s.y))) : null;
        R.list.push({ taxi: s.f.id, drone: drones[i].id, op, t: s.t, ph: s.ph, taxiZ: Math.round(s.z), droneZ: Math.round(p[2]), dh: Math.round(dh), dPad: dPad === null ? null : Math.round(dPad) }); } } }
  for (const [nm] of TH) res[nm].movementsWithAny = movesHit[nm].size;
  return { movements: moves.size, th: res };
}

// ---- Mitigation 1: drones may not enter a circle of radius R around any vertiport.
// Flights whose site or customer is inside a circle are dropped (counted); other paths that cross a circle are detoured around it
// at the same speed and height profile; later segments are shifted by the added time.
const sub = (a, b) => [a[0] - b[0], a[1] - b[1]], hyp = v => Math.hypot(v[0], v[1]);
function segHits(a, b, c, R) { const d = sub(b, a), L2 = d[0] * d[0] + d[1] * d[1]; if (L2 < 1e-9) return hyp(sub(a, c)) < R; const u = Math.max(0, Math.min(1, ((c[0] - a[0]) * d[0] + (c[1] - a[1]) * d[1]) / L2)); return Math.hypot(a[0] + u * d[0] - c[0], a[1] + u * d[1] - c[1]) < R; }
function tangents(p, c, R) { const v = sub(p, c), d = hyp(v), a = Math.atan2(v[1], v[0]), b = Math.acos(Math.min(1, R / d)); return [a + b, a - b]; }
function detourPath(h, q, c, R) {   // shortest polyline h -> q around the circle (c, R): tangent, arc on a circumscribed polygon, tangent (as planned/nfz.js)
  if (!segHits(h, q, c, R)) return [h, q];
  let best = null, bl = Infinity; const RT = R + 5, RO = RT / Math.cos(5 * Math.PI / 180);
  for (const th of tangents(h, c, RT)) for (const tq of tangents(q, c, RT)) for (const dir of [1, -1]) {
    let delta = (tq - th) * dir; delta = ((delta % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    const P1 = [c[0] + RT * Math.cos(th), c[1] + RT * Math.sin(th)], P2 = [c[0] + RT * Math.cos(tq), c[1] + RT * Math.sin(tq)];
    const Ln = hyp(sub(P1, h)) + RT * delta + hyp(sub(q, P2)); if (Ln >= bl) continue;
    const pts = [h, P1], steps = Math.ceil(delta / (10 * Math.PI / 180));
    for (let k = 1; k < steps; k++) { const a = th + dir * delta * k / steps; pts.push([c[0] + RO * Math.cos(a), c[1] + RO * Math.sin(a)]); }
    pts.push(P2, q); bl = Ln; best = pts; }
  return best;
}
function exclude(drones, pads, R) {
  const out = []; let dropped = 0, detoured = 0, extra = 0; const inside = p => pads.some(c => hyp(sub(p, c)) < R);
  for (const f of drones) {
    let bad = false; for (const g of f.sg) if ((g[2] === g[5] && g[3] === g[6] && inside([g[2], g[3]]))) { bad = true; break; }   // a vertical/hover point (site, customer, box) inside: cannot fly
    if (bad) { dropped++; continue; }
    let shift = 0, changed = false; const ns = [];
    for (const g of f.sg) {
      const a = [g[2], g[3]], b = [g[5], g[6]], moving = hyp(sub(b, a)) > 0.5; let pts = [a, b];
      if (moving) for (const c of pads) { if (segHits(pts[0], pts[pts.length - 1], c, R) && pts.length === 2) pts = detourPath(a, b, c, R); }
      if (pts.length === 2) { ns.push([g[0] + shift, g[1], g[2], g[3], g[4], g[5], g[6], g[7], g[8], g[9]]); continue; }
      changed = true; const Lold = hyp(sub(b, a)), v = Lold / g[1]; let Lnew = 0; for (let k = 0; k + 1 < pts.length; k++) Lnew += hyp(sub(pts[k + 1], pts[k]));
      let t = g[0] + shift, acc = 0;
      for (let k = 0; k + 1 < pts.length; k++) { const l = hyp(sub(pts[k + 1], pts[k])), z0 = g[4] + (g[7] - g[4]) * acc / Lnew, z1 = g[4] + (g[7] - g[4]) * (acc + l) / Lnew, n = Math.max(1, Math.round(l / v));
        ns.push([t, n, pts[k][0], pts[k][1], z0, pts[k + 1][0], pts[k + 1][1], z1, g[8], g[9]]); t += n; acc += l; }
      shift = t - g[0] - g[1];   // new end minus the segment's original end
    }
    if (changed) { detoured++; const last = ns[ns.length - 1]; const nf = Object.assign({}, f, { sg: ns, end: last[0] + last[1] }); extra += nf.end - f.end; out.push(nf); } else out.push(f);
  }
  return { drones: out, dropped, detoured, extraSeconds: extra };
}

// ---- Mitigation 2: drones yield to air-taxi departure/approach volumes booked first (time margin TB, Rh, Rv); 30 s steps, up to 40 tries.
function shiftFlight(f, D) { return D ? Object.assign({}, f, { t0: f.t0 + D, end: f.end + D, sg: f.sg.map(s => [s[0] + D, ...s.slice(1)]) }) : f; }
function reserve(cfg, drones, taxis, o) {
  o = Object.assign({ Rh: 609.6, Rv: 76.2, TB: 30, step: 30, tries: 40, droneTop: 130 }, o || {}); const zCap = o.droneTop + o.Rv, CELL = o.Rh;
  const LS = lowSamples(taxis, zCap, 0, Infinity, 1), grid = new Map(), K = (ix, iy, b) => ix + ',' + iy + ',' + b;
  for (const s of LS) { const k = K(Math.floor(s.x / CELL), Math.floor(s.y / CELL), Math.floor(s.t / 10)); const v = grid.get(k); if (v) v.push(s); else grid.set(k, [s]); }
  let xs = [], ys = []; for (const s of LS) { xs.push(s.x); ys.push(s.y); }
  const box = LS.length ? [Math.min(...xs) - o.Rh, Math.max(...xs) + o.Rh, Math.min(...ys) - o.Rh, Math.max(...ys) + o.Rh] : null;
  const out = [], delays = new Map(); let checked = 0, delayed = 0, cancelled = 0, dsum = 0;
  for (const f of drones) {
    const b = bbox(f); if (!box || b[1] < box[0] || b[0] > box[1] || b[3] < box[2] || b[2] > box[3]) { out.push(f); continue; }
    const S = []; for (let t = f.t0; t < f.end; t += 1) { const p = posOf(f, t); if (p && p[2] >= 1 && p[0] >= box[0] && p[0] <= box[1] && p[1] >= box[2] && p[1] <= box[3]) S.push([t - f.t0, p[0], p[1], p[2]]); }
    if (!S.length) { out.push(f); continue; }
    checked++; let D = -1;
    for (let k = 0; k < o.tries; k++) { const d = k * o.step; let bad = false;
      for (const [dt0, x, y, z] of S) { const t = f.t0 + d + dt0, ix = Math.floor(x / CELL), iy = Math.floor(y / CELL);
        for (let tb = Math.floor((t - o.TB) / 10); tb <= Math.floor((t + o.TB) / 10) && !bad; tb++) for (let ox = -1; ox <= 1 && !bad; ox++) for (let oy = -1; oy <= 1 && !bad; oy++) {
          const v = grid.get(K(ix + ox, iy + oy, tb)); if (!v) continue;
          for (const s of v) if (Math.abs(s.t - t) <= o.TB && Math.abs(s.z - z) < o.Rv && Math.hypot(s.x - x, s.y - y) < o.Rh) { bad = true; break; } }
        if (bad) break; }
      if (!bad) { D = d; break; } }
    if (D < 0) { cancelled++; delays.set(f.id, null); continue; }
    if (D > 0) { delayed++; dsum += D; } delays.set(f.id, D); out.push(shiftFlight(f, D));
  }
  return { drones: out, checked, delayed, cancelled, meanDelay: delayed ? dsum / delayed : 0 };
}

module.exports = { DEF, taxiFlight, schedule, posOf, lowSamples, encounters, exclude, detourPath, reserve, shiftFlight };
