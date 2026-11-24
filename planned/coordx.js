'use strict';
// INTENT1 (planned/INTENT1_PREREG.md): planned/coord.js check() with two opt-in options, everything else identical.
//   opt.own  = true : flights of the same company are checked against each other too (each company deconflicting its own fleet with the same volumes)
//   opt.flex = { wing: [lo, hi], amazon: [lo, hi], zipline: [lo, hi] } : at each delay step the flight's own heights are tried first, then the same
//              plan moved up or down in 5 m steps (smallest move first) while every point above 20 m stays inside the company's band.
//   Returns as coord.check plus moves: Map(id -> metres moved) for accepted flights that were moved.
// With neither option it reproduces coord.check exactly (checked by K1).
const L = require('../lab/lab_engine.js'), C = require('./coord.js');
const BUCKET = 60, STEP = 30, TRIES = 40, CELL = 1000, LOW = 20, FSTEP = 5;
const key = (cx, cy, b) => ((cx + 500) * 1000 + (cy + 500)) * 100000 + b;
function cellsOf(B, pad) { const x0 = Math.floor((Math.min(B.px, B.qx) - pad) / CELL), x1 = Math.floor((Math.max(B.px, B.qx) + pad) / CELL), y0 = Math.floor((Math.min(B.py, B.qy) - pad) / CELL), y1 = Math.floor((Math.max(B.py, B.qy) + pad) / CELL), o = [];
  for (let x = x0; x <= x1; x++) for (let y = y0; y <= y1; y++) o.push([x, y]); return o; }
function moved(f, dz) { return dz ? { id: f.id, op: f.op, t0: f.t0, end: f.end, sg: f.sg.map(s => { const t = s.slice(); if (t[4] > LOW) t[4] += dz; if (t[7] > LOW) t[7] += dz; return t; }) } : f; }
function moves(f, band) { if (!band) return [0]; let lo = Infinity, hi = -Infinity; for (const s of f.sg) for (const z of [s[4], s[7]]) if (z > LOW) { lo = Math.min(lo, z); hi = Math.max(hi, z); }
  if (lo === Infinity) return [0]; const out = [0]; for (let d = FSTEP; d <= band[1] - band[0]; d += FSTEP) for (const s of [d, -d]) if (lo + s >= band[0] - 1e-9 && hi + s <= band[1] + 1e-9) out.push(s); return out; }
function check(cfg, fl, vol, opt = {}) {
  const order = fl.filter(f => opt.all || L.reachesZone(cfg, f, 30)).sort((a, b) => a.t0 - b.t0 || a.id - b.id), idx = new Map(), delays = new Map(), bl = new Map(), mv = new Map();
  let cancelled = 0, lastPrune = -Infinity;
  const fits = (BL, T, op) => { for (const B of BL) { const w0 = T + B.w0, w1 = T + B.w1;
      for (const [cx, cy] of cellsOf(B, 2 * vol.w)) for (let bk = Math.floor(w0 / BUCKET); bk <= Math.floor(w1 / BUCKET); bk++) { const Ls = idx.get(key(cx, cy, bk)); if (!Ls) continue;
        for (const O of Ls) { if ((!opt.own && O.op === op) || O.w0 > w1 || O.w1 < w0 || O.zlo >= B.zhi || B.zlo >= O.zhi) continue;
          if (C.segDist(B.px, B.py, B.qx, B.qy, O.px, O.py, O.qx, O.qy) < 2 * vol.w) return false; } } } return true; };
  for (const f of order) {
    if (f.t0 - lastPrune > 600) { const minB = Math.floor((f.t0 - 120) / BUCKET) - 1; for (const k of idx.keys()) if (k % 100000 < minB) idx.delete(k); lastPrune = f.t0; }
    const cand = moves(f, opt.flex && opt.flex[f.op]).map(dz => ({ dz, BL: C.blocks(moved(f, dz), vol) }));
    let D = -1, pick = null;
    for (let tr = 0; tr < TRIES && D < 0; tr++) { const T = f.t0 + tr * STEP; for (const c of cand) if (fits(c.BL, T, f.op)) { D = tr * STEP; pick = c; break; } }
    if (D < 0) { cancelled++; delays.set(f.id, null); continue; }
    delays.set(f.id, D); bl.set(f.id, pick.BL); if (pick.dz) mv.set(f.id, pick.dz);
    const T = f.t0 + D;
    for (const B of pick.BL) { const O = { op: f.op, w0: T + B.w0, w1: T + B.w1, zlo: B.zlo, zhi: B.zhi, px: B.px, py: B.py, qx: B.qx, qy: B.qy };
      for (const [cx, cy] of cellsOf(B, vol.w)) for (let bk = Math.floor(O.w0 / BUCKET); bk <= Math.floor(O.w1 / BUCKET); bk++) { const k = key(cx, cy, bk); let Ls = idx.get(k); if (!Ls) idx.set(k, Ls = []); Ls.push(O); } } }
  return { delays, cancelled, checked: order.length, blocks: bl, moves: mv }; }
const VOL = { V2: C.VOL.V2, VL1: { w: 75, v: 15, h0: 10, g: 0.05 }, VL2: { w: 150, v: 25, h0: 10, g: 0.05 } };
module.exports = { check, moved, moves, VOL };
