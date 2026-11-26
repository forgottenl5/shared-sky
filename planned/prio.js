'use strict';
// PRIO1 (planned/PRIO1_PREREG.md): planned/coordx.js check() with a choice of WHO IS CHECKED FIRST. Plans are taken in 5-minute filing batches
// (by planned take-off time); inside a batch, the rule orders them. A flight checked earlier keeps its plan; later ones are delayed in 30 s steps or
// cancelled, exactly as before. Rules:
//   FCFS  first planned take-off first (today's rule; identical to coordx.check, checked by tests)
//   ROT   companies take turns going first: the company order rotates every batch (wing, zipline, amazon -> zipline, amazon, wing -> ...)
//   SHORT shortest flight first inside the batch (a classic rule for least total waiting)
//   FAIR  the company with the highest share of its flights held so far goes first in each batch
//   BATCHT0  test only: the batch path in take-off order; must equal FCFS exactly
const L = require('../lab/lab_engine.js'), C = require('./coord.js'), X = require('./coordx.js');
const BUCKET = 60, STEP = 30, TRIES = 40, CELL = 1000, BATCH = 300, OPS = ['wing', 'zipline', 'amazon'];
const key = (cx, cy, b) => ((cx + 500) * 1000 + (cy + 500)) * 100000 + b;
function cellsOf(B, pad) { const x0 = Math.floor((Math.min(B.px, B.qx) - pad) / CELL), x1 = Math.floor((Math.max(B.px, B.qx) + pad) / CELL), y0 = Math.floor((Math.min(B.py, B.qy) - pad) / CELL), y1 = Math.floor((Math.max(B.py, B.qy) + pad) / CELL), o = [];
  for (let x = x0; x <= x1; x++) for (let y = y0; y <= y1; y++) o.push([x, y]); return o; }
function check(cfg, fl, vol, opt = {}) {
  const rule = opt.rule || 'FCFS'; if (rule === 'FCFS') return X.check(cfg, fl, vol, opt);
  const all = fl.filter(f => opt.all || L.reachesZone(cfg, f, 30)), idx = new Map(), delays = new Map(), bl = new Map(), mv = new Map(), stat = Object.fromEntries(OPS.map(o => [o, { n: 0, held: 0 }]));
  let cancelled = 0, lastPrune = -Infinity;
  const fits = (BL, T, op) => { for (const B of BL) { const w0 = T + B.w0, w1 = T + B.w1;
      for (const [cx, cy] of cellsOf(B, 2 * vol.w)) for (let bk = Math.floor(w0 / BUCKET); bk <= Math.floor(w1 / BUCKET); bk++) { const Ls = idx.get(key(cx, cy, bk)); if (!Ls) continue;
        for (const O of Ls) { if ((!opt.own && O.op === op) || O.w0 > w1 || O.w1 < w0 || O.zlo >= B.zhi || B.zlo >= O.zhi) continue;
          if (C.segDist(B.px, B.py, B.qx, B.qy, O.px, O.py, O.qx, O.qy) < 2 * vol.w) return false; } } } return true; };
  const batches = new Map(); for (const f of all) { const b = Math.floor(f.t0 / BATCH); if (!batches.has(b)) batches.set(b, []); batches.get(b).push(f); }
  for (const b of [...batches.keys()].sort((x, y) => x - y)) { const B = batches.get(b);
    let rank; if (rule === 'ROT') { const ord = OPS.map((_, i) => OPS[(i + b) % 3]); rank = f => ord.indexOf(f.op); }
    else if (rule === 'FAIR') { const sh = o => stat[o].n ? stat[o].held / stat[o].n : 0, ord = OPS.map((o, i) => [o, sh(o), (i - b % 3 + 3) % 3]).sort((p, q) => q[1] - p[1] || p[2] - q[2]).map(p => p[0]); rank = f => ord.indexOf(f.op); }
    else if (rule === 'SHORT') rank = f => f.end - f.t0; else if (rule === 'BATCHT0') rank = () => 0; else throw new Error('unknown rule ' + rule);
    B.sort((p, q) => rank(p) - rank(q) || p.t0 - q.t0 || p.id - q.id);
    for (const f of B) {
      if (f.t0 - lastPrune > 600) { const minB = Math.floor((b * BATCH - 120) / BUCKET) - 1; for (const k of idx.keys()) if (k % 100000 < minB) idx.delete(k); lastPrune = f.t0; }   // prune behind the batch start, so out-of-order members are safe
      const cand = X.moves(f, opt.flex && opt.flex[f.op]).map(dz => ({ dz, BL: C.blocks(X.moved(f, dz), vol) }));
      let D = -1, pick = null;
      for (let tr = 0; tr < TRIES && D < 0; tr++) { const T = f.t0 + tr * STEP; for (const c of cand) if (fits(c.BL, T, f.op)) { D = tr * STEP; pick = c; break; } }
      stat[f.op].n++; if (D !== 0) stat[f.op].held++;
      if (D < 0) { cancelled++; delays.set(f.id, null); continue; }
      delays.set(f.id, D); bl.set(f.id, pick.BL); if (pick.dz) mv.set(f.id, pick.dz);
      const T = f.t0 + D;
      for (const Bk of pick.BL) { const O = { op: f.op, w0: T + Bk.w0, w1: T + Bk.w1, zlo: Bk.zlo, zhi: Bk.zhi, px: Bk.px, py: Bk.py, qx: Bk.qx, qy: Bk.qy };
        for (const [cx, cy] of cellsOf(Bk, vol.w)) for (let bk = Math.floor(O.w0 / BUCKET); bk <= Math.floor(O.w1 / BUCKET); bk++) { const k = key(cx, cy, bk); let Ls = idx.get(k); if (!Ls) idx.set(k, Ls = []); Ls.push(O); } } } }
  return { delays, cancelled, checked: all.length, blocks: bl, moves: mv }; }
module.exports = { check, BATCH, OPS };
