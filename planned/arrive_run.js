'use strict';
// Runner for ARRIVE_PREREG.md. One isolated site; arrival procedures. node planned/arrive_run.js checks | <shard> <n>
const fs = require('fs'), L = require('../lab/lab_engine.js');
const cfg = { half: 20000, zone: 20000, warm: 3600, meas: 7200 }, END = cfg.warm + cfg.meas, HOLD_D = 500;
const H = { wing: [46, 91], aOut: 61, zip: 101, aIn: 105 };
// Hold point: on the last inbound cruise segment, HOLD_D metres before its end (or its start if shorter). Returns { idx, frac, tReq } or null.
function holdPoint(f) { let i = -1; f.sg.forEach((s, k) => { if (s[9] === 'in' && s[8] === 'cruise') i = k; }); if (i < 0) return null;
  const s = f.sg[i], Lh = Math.hypot(s[5] - s[2], s[6] - s[3]), frac = Lh > HOLD_D ? (Lh - HOLD_D) / Lh : 0; return { idx: i, frac, tReq: s[0] + Math.round(frac * s[1]) }; }
function withHold(f, hp, w) { if (!w) return f; const s = f.sg[hp.idx], n1 = Math.round(hp.frac * s[1]), px = s[2] + (s[5] - s[2]) * hp.frac, py = s[3] + (s[6] - s[3]) * hp.frac, out = [];
  f.sg.forEach((g, k) => { if (k < hp.idx) out.push(g); else if (k === hp.idx) { if (n1 > 0) out.push([g[0], n1, g[2], g[3], g[4], px, py, g[7], 'cruise', 'in']);
      out.push([g[0] + n1, w, px, py, g[7], px, py, g[7], 'hover', 'in']); out.push([g[0] + n1 + w, g[1] - n1, px, py, g[4], g[5], g[6], g[7], 'cruise', 'in']); } else out.push([g[0] + w, ...g.slice(1)]); });
  return { id: f.id, op: f.op, t0: f.t0, sg: out, end: f.end + w }; }
const shift = (f, D) => D ? { id: f.id, op: f.op, t0: f.t0 + D, sg: f.sg.map(g => [g[0] + D, ...g.slice(1)]), end: f.end + D } : f;
// proc: { dep: s, arr: s, shared: s } ; shared = one movement slot for departures and arrivals together
function schedule(fl, proc) { const ev = fl.map(f => ({ t: f.t0, kind: 'dep', f })), done = [], dW = [], aW = []; let lastD = -1e9, lastA = -1e9, lastM = -1e9;
  const pq = ev.sort((a, b) => a.t - b.t || a.f.id - b.f.id);
  while (pq.length) { let m = 0; for (let k = 1; k < pq.length; k++) if (pq[k].t < pq[m].t) m = k; const e = pq.splice(m, 1)[0];
    if (e.kind === 'dep') { let T = e.t; if (proc.dep) T = Math.max(T, lastD + proc.dep); if (proc.shared) T = Math.max(T, lastM + proc.shared); if (proc.dep) lastD = T; if (proc.shared) lastM = T;
      const g = shift(e.f, T - e.t); if (e.f.t0 >= cfg.warm && e.f.t0 < END) dW.push(T - e.t); const hp = holdPoint(g);
      if ((proc.arr || proc.shared) && hp) pq.push({ t: hp.tReq, kind: 'arr', f: g, hp, orig: e.f }); else done.push(g); }
    else { let T = e.t; if (proc.arr) T = Math.max(T, lastA + proc.arr); if (proc.shared) T = Math.max(T, lastM + proc.shared); if (proc.arr) lastA = T; if (proc.shared) lastM = T;
      if (e.orig.t0 >= cfg.warm && e.orig.t0 < END) aW.push(T - e.t); done.push(withHold(e.f, e.hp, T - e.t)); } }
  const mean = a => a.length ? Math.round(a.reduce((x, y) => x + y, 0) / a.length) : 0; return { fl: done, depWait: mean(dW), arrHold: mean(aW) }; }
const PROCS = { none: {}, D20: { dep: 20 }, A20: { arr: 20 }, D20A20: { dep: 20, arr: 20 }, M20: { shared: 20 }, M10: { shared: 10 } };
function one(op, mult, spread, proc, seed) { const S = [{ op, c: [0, 0], rate: L.OP[op].rate * mult }], raw = L.flights(cfg, S, seed, H, { padSpread: spread }), q = schedule(raw, PROCS[proc]); let n300 = 0, n1k = 0;
  L.count(cfg, q.fl, { sub: 4, tEnd: END, onMeet: (nm, A, B) => { if (nm !== 'wide') return; const a = Math.hypot(A[2], A[3]), b = Math.hypot(B[2], B[3]); if (a <= 300 && b <= 300) n300++; if (a <= 1000 && b <= 1000) n1k++; } });
  const req = raw.filter(f => f.t0 >= cfg.warm && f.t0 < END).map(f => f.id), byId = new Map(q.fl.map(f => [f.id, f])), landed = req.filter(id => byId.get(id).end <= END + 1800).length;
  return { op, mult, spread, proc, seed, flights: raw.length, near300: n300, near1k: n1k, depWait: q.depWait, arrHold: q.arrHold, requested: req.length, landedBy30minAfter: landed }; }
const J = []; for (const op of ['amazon', 'wing', 'zipline']) for (const mult of [1, 2]) for (const spread of [30, 120]) for (const proc of Object.keys(PROCS)) for (const seed of [1, 2, 3]) J.push([op, mult, spread, proc, seed]);
if (process.argv[2] === 'checks') { const raw = L.flights(cfg, [{ op: 'amazon', c: [0, 0] }], 1, H), none = schedule(raw, {}).fl, same = JSON.stringify(none.slice().sort((a, b) => a.id - b.id)) === JSON.stringify(raw.slice().sort((a, b) => a.id - b.id));
  const f = raw[5], hp = holdPoint(f), g = withHold(f, hp, 37), cont = g.sg.every((s, k) => k === 0 || s[0] === g.sg[k - 1][0] + g.sg[k - 1][1]), dist = Math.hypot(g.sg[hp.idx + 1][2], g.sg[hp.idx + 1][3]);
  const m = schedule(raw, { shared: 20 }), times = [];
  console.log('K1 no procedure leaves flights identical', same, '| hold inserted, segments continuous', cont, 'end +37 s', g.end === f.end + 37, '| hold point distance from site', Math.round(dist), 'm', '| jobs', J.length, same && cont && g.end === f.end + 37 && dist > 350 ? 'PASS' : 'FAIL'); }
else { const k = +process.argv[2], n = +process.argv[3]; fs.mkdirSync('out/arrive', { recursive: true }); for (const j of J.filter((_, i) => i % n === k)) fs.appendFileSync(`out/arrive/runs_${k}.jsonl`, JSON.stringify(one(...j)) + '\n'); }
