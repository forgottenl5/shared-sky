'use strict';
// COORD1 volume-based strategic coordination (registration planned/COORD1_PREREG.md).
// F3548-style operational intents: each planned segment is cut into blocks of at most 1,000 m along track; a block reserves a capsule of
// half-width w around its path, a height band [lowest - v, highest + v] and a time window [entry - h, exit + h], h = h0 + g x time since take-off.
// Different-company blocks conflict if windows overlap, bands overlap and paths come within 2w. First filed keeps its plan; later flights are
// delayed in 30 s steps up to 20 min, else cancelled. Same-company flights are not checked against each other. Ground-only segments reserve nothing.
const L = require('../lab/lab_engine.js');
const BLOCK = 1000, CELL = 1000, BUCKET = 60, STEP = 30, TRIES = 40;
function blocks(f, vol) { const out = [];
  f.sg.forEach((s, si) => { const [t0, n, x0, y0, z0, x1, y1, z1, ph] = s; if (z0 < 1 && z1 < 1) return;
    const Lh = Math.hypot(x1 - x0, y1 - y0), nb = Lh < 1 ? 1 : Math.max(1, Math.ceil(Lh / BLOCK));
    for (let k = 0; k < nb; k++) { const a = k / nb, b = (k + 1) / nb, za = z0 + (z1 - z0) * a, zb = z0 + (z1 - z0) * b;
      const en = t0 + a * n - f.t0, ex = t0 + b * n - f.t0, hi = vol.h0 + vol.g * en, ho = vol.h0 + vol.g * ex;
      out.push({ si, a, b, px: x0 + (x1 - x0) * a, py: y0 + (y1 - y0) * a, qx: x0 + (x1 - x0) * b, qy: y0 + (y1 - y0) * b,
        zlo: Math.min(za, zb) - vol.v, zhi: Math.max(za, zb) + vol.v, w0: en - hi, w1: ex + ho }); } });
  return out; }
function segDist(ax, ay, bx, by, cx, cy, dx, dy) {   // shortest distance between 2D segments AB and CD
  const pt = (px, py, sx, sy, ex, ey) => { const vx = ex - sx, vy = ey - sy, L2 = vx * vx + vy * vy; let u = L2 ? ((px - sx) * vx + (py - sy) * vy) / L2 : 0; u = Math.max(0, Math.min(1, u)); return Math.hypot(px - sx - u * vx, py - sy - u * vy); };
  const o = (px, py, qx, qy, rx, ry) => Math.sign((qx - px) * (ry - py) - (qy - py) * (rx - px));
  if (o(ax, ay, bx, by, cx, cy) * o(ax, ay, bx, by, dx, dy) < 0 && o(cx, cy, dx, dy, ax, ay) * o(cx, cy, dx, dy, bx, by) < 0) return 0;
  return Math.min(pt(ax, ay, cx, cy, dx, dy), pt(bx, by, cx, cy, dx, dy), pt(cx, cy, ax, ay, bx, by), pt(dx, dy, ax, ay, bx, by)); }
const key = (cx, cy, b) => ((cx + 500) * 1000 + (cy + 500)) * 100000 + b;
function cellsOf(B, pad) { const x0 = Math.floor((Math.min(B.px, B.qx) - pad) / CELL), x1 = Math.floor((Math.max(B.px, B.qx) + pad) / CELL), y0 = Math.floor((Math.min(B.py, B.qy) - pad) / CELL), y1 = Math.floor((Math.max(B.py, B.qy) + pad) / CELL), o = [];
  for (let x = x0; x <= x1; x++) for (let y = y0; y <= y1; y++) o.push([x, y]); return o; }
// cfg as lab engine; fl: planned flights (any timing); vol {w, v, h0, g}; opt.all: check every flight (default: only those reaching the zone, as intentCheck)
// opt.blame (added 27 Oct 2026 for diagnoses; default off, no effect on results): for each flight delayed or cancelled, the first conflict found at its planned time:
// { op: blocking company, oVert: blocking block is a climb/descent, bVert: own block is a climb/descent }
function check(cfg, fl, vol, opt = {}) {
  const order = fl.filter(f => opt.all || L.reachesZone(cfg, f, 30)).sort((a, b) => a.t0 - b.t0 || a.id - b.id), idx = new Map(), delays = new Map(), bl = new Map();
  let cancelled = 0, lastPrune = -Infinity; const blame = opt.blame ? new Map() : null;
  for (const f of order) {
    if (f.t0 - lastPrune > 600) { const minB = Math.floor((f.t0 - 120) / BUCKET) - 1; for (const k of idx.keys()) if (k % 100000 < minB) idx.delete(k); lastPrune = f.t0; }
    const BL = blocks(f, vol); let D = -1;
    for (let tr = 0; tr < TRIES && D < 0; tr++) { const d = tr * STEP, T = f.t0 + d; let bad = false;
      for (const B of BL) { if (bad) break; const w0 = T + B.w0, w1 = T + B.w1;
        for (const [cx, cy] of cellsOf(B, 2 * vol.w)) { if (bad) break;
          for (let bk = Math.floor(w0 / BUCKET); bk <= Math.floor(w1 / BUCKET) && !bad; bk++) { const Ls = idx.get(key(cx, cy, bk)); if (!Ls) continue;
            for (const O of Ls) { if (O.op === f.op || O.w0 > w1 || O.w1 < w0 || O.zlo >= B.zhi || B.zlo >= O.zhi) continue;
              if (segDist(B.px, B.py, B.qx, B.qy, O.px, O.py, O.qx, O.qy) < 2 * vol.w) { bad = true; if (blame && tr === 0) blame.set(f.id, { op: O.op, oVert: O.zhi - O.zlo > 2 * vol.v + 1, bVert: B.zhi - B.zlo > 2 * vol.v + 1 }); break; } } } } }
      if (!bad) D = d; }
    if (D < 0) { cancelled++; delays.set(f.id, null); continue; }
    delays.set(f.id, D); bl.set(f.id, BL);
    const T = f.t0 + D;
    for (const B of BL) { const O = { op: f.op, w0: T + B.w0, w1: T + B.w1, zlo: B.zlo, zhi: B.zhi, px: B.px, py: B.py, qx: B.qx, qy: B.qy };
      for (const [cx, cy] of cellsOf(B, vol.w)) for (let bk = Math.floor(O.w0 / BUCKET); bk <= Math.floor(O.w1 / BUCKET); bk++) { const k = key(cx, cy, bk); let Ls = idx.get(k); if (!Ls) idx.set(k, Ls = []); Ls.push(O); } } }
  return { delays, cancelled, checked: order.length, blocks: bl, blame }; }
// conformance: planned flight f (its blocks BL, accepted with delay D) against the flown flight g (same segments, re-timed)
function conformance(f, BL, D, g) { let out = 0, tot = 0, any = false;
  for (const B of BL) { const s = g.sg[B.si], en = s[0] + B.a * s[1], ex = s[0] + B.b * s[1], w0 = f.t0 + D + B.w0, w1 = f.t0 + D + B.w1;
    const o = Math.max(0, w0 - en) + Math.max(0, ex - w1); tot += Math.max(1e-9, ex - en); out += Math.min(o, Math.max(1e-9, ex - en)); if (o > 0) any = true; }
  return { any, frac: tot ? out / tot : 0 }; }
const shift = (f, D) => D ? { id: f.id, op: f.op, t0: f.t0 + D, sg: f.sg.map(s => [s[0] + D, ...s.slice(1)]), end: f.end + D } : f;
const VOL = { V1: { w: 10, v: 5, h0: 5, g: 0.02 }, V2: { w: 30, v: 10, h0: 10, g: 0.05 }, V3: { w: 30, v: 46, h0: 30, g: 0.10 } };
module.exports = { blocks, segDist, check, conformance, shift, VOL, BLOCK, STEP, TRIES };
