'use strict';
// Runner for PADS_PREREG.md. One isolated site with fixed pads and occupancy. node planned/pads_run.js checks | <shard> <n>
const fs = require('fs'), L = require('../lab/lab_engine.js');
const cfg = { half: 20000, zone: 20000, warm: 3600, meas: 7200 }, END = cfg.warm + cfg.meas, TURN = 60;
const H = { wing: [46, 91], aOut: 61, zip: 101, aIn: 105 };
const PADS = { amazon: 20, wing: 18, zipline: 20 };   // Wing: sample nest 18 chargepads (PLANNED_OPS_INPUTS); Zipline: max 20 docks per site (DFW EA); Amazon: not published, 20 assumed
const SITES = { amazon: ['amazon', 1], wing: ['wing', 1], zipHOU: ['zipline', 1], zipDFW: ['zipline', 400 / 950] };   // Zipline DFW filing: 400 a day per site vs ~950 in Houston
function grid(n, pitch) { const k = Math.ceil(Math.sqrt(n)), out = []; for (let i = 0; i < n; i++) { const a = i % k, b = Math.floor(i / k); out.push([(a - (k - 1) / 2) * pitch, (b - (k - 1) / 2) * pitch]); } return out; }
// Reassign each flight to a fixed pad: earliest-requesting first; a pad is busy from take-off until its drone lands + TURN s; if none is free the flight waits.
function assign(fl, op, pitch) { const P = grid(PADS[op], pitch), free = P.map(() => -Infinity), out = [], waits = [];
  for (const f of fl.slice().sort((a, b) => a.t0 - b.t0 || a.id - b.id)) { let k = 0; for (let j = 1; j < P.length; j++) if (free[j] < free[k]) k = j;
    const w = Math.max(0, Math.ceil(free[k] - f.t0)), old = [f.sg[0][2], f.sg[0][3]], np = P[k], sw = (x, y) => (x === old[0] && y === old[1]) ? np : [x, y];
    const sg = f.sg.map(g => { const a = sw(g[2], g[3]), b = sw(g[5], g[6]); return [g[0] + w, g[1], a[0], a[1], g[4], b[0], b[1], g[7], g[8], g[9]]; });
    free[k] = f.end + w + TURN; if (f.t0 >= cfg.warm && f.t0 < END) waits.push(w); out.push({ id: f.id, op: f.op, t0: f.t0 + w, sg, end: f.end + w }); }
  return { fl: out, meanWait: waits.length ? Math.round(waits.reduce((a, b) => a + b, 0) / waits.length) : 0, maxWait: waits.length ? Math.max(...waits) : 0 }; }
function one(site, mult, layout, seed) { const [op, f] = SITES[site], S = [{ op, c: [0, 0], rate: L.OP[op].rate * f * mult }], raw = L.flights(cfg, S, seed, H);
  const q = layout === 'random30' ? { fl: raw, meanWait: 0, maxWait: 0 } : assign(raw, op, +layout.slice(1)); let near = 0, low = 0;
  L.count(cfg, q.fl, { sub: 4, tEnd: END, onMeet: (nm, A, B) => { if (nm !== 'wide') return; if (Math.hypot(A[2], A[3]) <= 300 && Math.hypot(B[2], B[3]) <= 300) { near++; if (A[4] < 20 && B[4] < 20) low++; } } });
  return { site, mult, layout, seed, flights: raw.length, near300: near, padLevel: low, meanWait: q.meanWait, maxWait: q.maxWait }; }
const LAY = ['random30', 'p10', 'p30', 'p60'], J = []; for (const site of Object.keys(SITES)) for (const mult of [1, 2]) for (const layout of LAY) for (const seed of [1, 2, 3]) J.push([site, mult, layout, seed]);
if (process.argv[2] === 'checks') { const raw = L.flights(cfg, [{ op: 'wing', c: [0, 0] }], 1, H), q = assign(raw, 'wing', 30), P = grid(18, 30);
  const onPads = q.fl.every(f => P.some(p => p[0] === f.sg[0][2] && p[1] === f.sg[0][3]) && P.some(p => { const g = f.sg[f.sg.length - 1]; return p[0] === g[5] && p[1] === g[6]; }));
  const busy = new Map(); let overlap = false; for (const f of q.fl.slice().sort((a, b) => a.t0 - b.t0)) { const k = f.sg[0][2] + ',' + f.sg[0][3]; if (busy.has(k) && busy.get(k) > f.t0) overlap = true; busy.set(k, f.end + TURN); }
  console.log('K1 every flight starts and ends on a grid pad', onPads, '| no pad double-booked', !overlap, '| Wing 1x mean pad wait', q.meanWait, 's | jobs', J.length, onPads && !overlap ? 'PASS' : 'FAIL'); }
else { const k = +process.argv[2], n = +process.argv[3]; fs.mkdirSync('out/pads', { recursive: true }); for (const j of J.filter((_, i) => i % n === k)) fs.appendFileSync(`out/pads/runs_${k}.jsonl`, JSON.stringify(one(...j)) + '\n'); }
