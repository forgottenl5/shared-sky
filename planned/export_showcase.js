'use strict';
// Export real engine tracks for the showcase page: HOUSTON2 build-out d = 3 km, seed 1, A0 (filed) and A2 (allocation), no plan check.
// Window: 8 x 8 km around an Amazon site in the zone, 30 min of the measurement period, 3 s samples. Meetings counted at 4 checks per second.
const fs = require('fs'), H2 = require('./houston2.js'), V = require('./valloc.js');
const D = 3, SEED = 1, HALFW = 4000, T0 = 3600 + 1800, T1 = T0 + 1800, DT = 3;
const S = H2.sites(D, SEED), am = S.filter(s => s.op === 'amazon' && Math.abs(s.c[0]) < 6000 && Math.abs(s.c[1]) < 6000);
const C = (am[0] || S.find(s => s.op === 'amazon')).c, inW = (x, y) => Math.abs(x - C[0]) <= HALFW && Math.abs(y - C[1]) <= HALFW;
const out = { meta: { d_km: D, seed: SEED, window_m: 2 * HALFW, t0: T0, t1: T1, dt: DT, centre: C }, sites: S.filter(s => inW(s.c[0], s.c[1])).map(s => [s.op[0], Math.round(s.c[0] - C[0]), Math.round(s.c[1] - C[1])]), arms: {} };
for (const arm of ['A0', 'A2']) { const fl = V.flights(S, SEED, V.ARMS[arm]), tracks = [], events = [];
  for (const f of fl) { if (f.end < T0 || f.t0 > T1) continue; const pts = []; let first = null;
    for (let t = Math.max(T0, f.t0); t < Math.min(T1, f.end); t += DT) { const sg = f.sg.find(s => t >= s[0] && t < s[0] + s[1]); if (!sg) continue; const p = H2.expand([sg]).find(q => q[0] === t); if (!p) continue;
      if (!inW(p[1], p[2])) { if (first !== null) pts.push(null); continue; } if (first === null) first = t; pts.push([Math.round(p[1] - C[0]), Math.round(p[2] - C[1]), Math.round(p[3])]); }
    while (pts.length && pts[pts.length - 1] === null) pts.pop(); if (pts.filter(Boolean).length < 3) continue; tracks.push({ o: f.op[0], s: first - T0, p: pts }); }
  const seen = new Set();
  H2.count(fl, { sub: 4, onMeet: (nm, A, B, t) => { if (A[1] === B[1] || t < T0 || t >= T1 || !inW(A[2], A[3])) return; const k = nm + A[0] + '_' + B[0]; if (seen.has(k)) return; seen.add(k);
    events.push({ k: nm === 'close' ? 'c' : 'w', t: +(t - T0).toFixed(2), x: Math.round(A[2] - C[0]), y: Math.round(A[3] - C[1]), z: Math.round((A[4] + B[4]) / 2), ops: [A[1][0], B[1][0]].sort().join('') }); } });
  out.arms[arm] = { tracks, events }; console.log(arm, 'tracks', tracks.length, 'events', events.length, 'wide', events.filter(e => e.k === 'w').length, 'close', events.filter(e => e.k === 'c').length); }
fs.writeFileSync((process.argv[2] || 'out/showcase_data.json'), JSON.stringify(out)); console.log('bytes', fs.statSync((process.argv[2] || 'out/showcase_data.json')).size, 'sites in window', out.sites.length);
