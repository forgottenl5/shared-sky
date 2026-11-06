'use strict';
// Runner for SITECAP_PREREG.md. One isolated site per run; same-company meetings near the site. node planned/sitecap_run.js checks | <shard> <n>
const fs = require('fs'), L = require('../lab/lab_engine.js');
const cfg = { half: 20000, zone: 20000, warm: 3600, meas: 7200 }, END = cfg.warm + cfg.meas, NEAR = 300;
const H = { wing: [46, 91], aOut: 61, zip: 101, aIn: 105 };   // A0 heights; same-company meetings do not depend on other companies' heights
function sequence(fl, D) { if (!D) return { fl, waits: [] }; const s = fl.slice().sort((a, b) => a.t0 - b.t0 || a.id - b.id), out = [], waits = []; let next = -Infinity;
  for (const f of s) { const t = Math.max(f.t0, next), w = t - f.t0; next = t + D; if (f.t0 >= cfg.warm && f.t0 < END) waits.push(w);
    out.push(w ? { id: f.id, op: f.op, t0: f.t0 + w, sg: f.sg.map(g => [g[0] + w, ...g.slice(1)]), end: f.end + w } : f); }
  return { fl: out, waits }; }
function one(op, mult, spread, D, seed) { const rate = L.OP[op].rate * mult, S = [{ op, c: [0, 0], rate }];
  const raw = L.flights(cfg, S, seed, H, { padSpread: spread }), q = sequence(raw, D); let near = 0, nearClose = 0;
  L.count(cfg, q.fl, { sub: 4, tEnd: cfg.warm + cfg.meas, onMeet: (nm, A, B) => { if (Math.hypot(A[2], A[3]) <= NEAR && Math.hypot(B[2], B[3]) <= NEAR) { if (nm === 'wide') near++; else nearClose++; } } });
  const w = q.waits, meanWait = w.length ? w.reduce((a, b) => a + b, 0) / w.length : 0;
  return { op, mult, spread, D, seed, perHour: rate, flights: raw.length, near_wide: near, near_close: nearClose, meanWait: Math.round(meanWait) }; }
const J = []; for (const op of ['amazon', 'wing', 'zipline']) for (const mult of [1, 2, 4]) for (const spread of [30, 120]) for (const D of [0, 10, 20, 40]) for (const seed of [1, 2, 3]) J.push([op, mult, spread, D, seed]);
if (process.argv[2] === 'checks') { const a = L.flights(cfg, [{ op: 'amazon', c: [0, 0] }], 1, H), b = L.flights(cfg, [{ op: 'amazon', c: [0, 0] }], 1, H, { padSpread: 30 }), c = L.flights(cfg, [{ op: 'amazon', c: [0, 0] }], 1, H, { padSpread: 120 });
  const same = JSON.stringify(a) === JSON.stringify(b), maxPad = Math.max(...c.map(f => Math.max(Math.abs(f.sg[0][2]), Math.abs(f.sg[0][3])))), q = sequence(a, 20).fl.filter(f => f.t0 >= 0).sort((x, y) => x.t0 - y.t0);
  const gaps = q.slice(1).every((f, i) => f.t0 - q[i].t0 >= 20);
  console.log('K1 default spread unchanged', same, '| 120 m spread max offset', maxPad.toFixed(1), '(<= 60)', '| departures >= 20 s apart after sequencing', gaps, '| jobs', J.length, same && maxPad <= 60 && maxPad > 30 && gaps ? 'PASS' : 'FAIL'); }
else { const k = +process.argv[2], m = +process.argv[3]; fs.mkdirSync('out/sitecap', { recursive: true });
  for (const j of J.filter((_, i) => i % m === k)) fs.appendFileSync(`out/sitecap/runs_${k}.jsonl`, JSON.stringify(one(...j)) + '\n'); }
