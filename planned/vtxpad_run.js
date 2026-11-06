'use strict';
// Runner for VTXPAD_PREREG.md. node planned/vtxpad_run.js checks | run
const fs = require('fs'), L = require('../lab/lab_engine.js'), B = require('./dfwbuild.js'), DR = require('./dfwreal.js');
const cfg = { half: 40000 + 17000, zone: 40000, warm: 3600, meas: 7200 }, T0 = cfg.warm, T1 = cfg.warm + cfg.meas;
const A0 = { wing: [46, 91], aOut: 61, zip: 101, aIn: 105 };
const PTS = { TOY: DR.toXY(33.0826, -96.8366), AFW: DR.toXY(32.99028, -97.31944), DFW: DR.toXY(32.8998, -97.0403) };
const RS = [300, 1000];
// pts: [[name, x, y]]; returns per point: passes per R (by op), occupancy-seconds at 1 km
function measure(fl, pts) { const out = {}; for (const [n] of pts) out[n] = { pass: { 300: {}, 1000: {} }, occ: 0 };
  for (const f of fl) { if (f.end < T0 || f.t0 > T1) continue; const hit = pts.map(() => ({ 300: false, 1000: false }));
    for (const s of f.sg) { const a = Math.max(s[0], T0), b = Math.min(s[0] + s[1] - 1, T1 - 1); if (a > b) continue;
      // quick reject: segment bounding box farther than 1 km from every point
      const x0 = Math.min(s[2], s[5]) - 1000, x1 = Math.max(s[2], s[5]) + 1000, y0 = Math.min(s[3], s[6]) - 1000, y1 = Math.max(s[3], s[6]) + 1000;
      const near = pts.map(([, px, py]) => px >= x0 && px <= x1 && py >= y0 && py <= y1); if (!near.some(Boolean)) continue;
      for (let t = a; t <= b; t++) { const p = L.posAt(s, t); if (p[2] <= 1) continue;
        pts.forEach(([n, px, py], i) => { if (!near[i]) return; const d = Math.hypot(p[0] - px, p[1] - py); if (d <= 1000) { hit[i][1000] = true; out[n].occ++; if (d <= 300) hit[i][300] = true; } }); } }
    pts.forEach(([n], i) => { for (const R of RS) if (hit[i][R]) out[n].pass[R][f.op] = (out[n].pass[R][f.op] || 0) + 1; }); }
  for (const [n] of pts) { for (const R of RS) for (const o in out[n].pass[R]) out[n].pass[R][o] /= cfg.meas / 3600; out[n].occ /= cfg.meas; } return out; }
const seg = (t0, n, a, b, z) => [t0, n, a[0], a[1], z, b[0], b[1], z, 'cruise', 'out'];
if (process.argv[2] === 'checks') { const P = [['P', 0, 0]], mk = (sg) => [{ id: 1, op: 'wing', t0: sg[0][0], end: sg[sg.length - 1][0] + sg[sg.length - 1][1], sg }];
  const m1 = measure(mk([seg(5000, 100, [-2000, 200], [2000, 200], 50)]), P).P, m2 = measure(mk([seg(5000, 100, [-2000, 1200], [2000, 1200], 50)]), P).P;
  const k1 = m1.pass[300].wing === 0.5 && m1.pass[1000].wing === 0.5 && !m2.pass[300].wing && !m2.pass[1000].wing;   // 1 flight in a 2 h window = 0.5 an hour
  const m3 = measure(mk([seg(5000, 100, [-50, 0], [50, 0], 0)]), P).P, m4 = measure(mk([seg(1000, 100, [-2000, 0], [2000, 0], 50)]), P).P;
  const k2 = !m3.pass[1000].wing && !m4.pass[1000].wing;
  console.log('K1', k1 ? 'PASS' : 'FAIL', JSON.stringify(m1.pass), JSON.stringify(m2.pass)); console.log('K2', k2 ? 'PASS' : 'FAIL'); }
else { fs.mkdirSync('out/vtxpad', { recursive: true }); const f = 'out/vtxpad/runs.jsonl'; if (fs.existsSync(f)) fs.unlinkSync(f);
  const ring = []; for (let k = 0; k < 8; k++) ring.push(['TOY_' + k, PTS.TOY[0] + 500 * Math.cos(k * Math.PI / 4), PTS.TOY[1] + 500 * Math.sin(k * Math.PI / 4)]);
  for (const stage of ['early', 'mid', 'full']) for (let seed = 1; seed <= 10; seed++) { const t = Date.now(), S = B.sites(cfg, seed, stage), fl = L.flights(cfg, S, seed, A0);
    const pts = Object.entries(PTS).map(([n, p]) => [n, p[0], p[1]]).concat(stage === 'full' ? ring : []);
    fs.appendFileSync(f, JSON.stringify({ stage, seed, flights: fl.length, res: measure(fl, pts), wall_s: (Date.now() - t) / 1000 }) + '\n'); console.log(stage, seed, ((Date.now() - t) / 1000).toFixed(1) + ' s'); } }
