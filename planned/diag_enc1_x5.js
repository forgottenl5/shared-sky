'use strict';
// EXPLORATORY diagnosis of the AIRTAXI_ENC1 X5 failure (not part of the registered study): where do arm B en-route encounters start?
// Loads the runner's functions (lines before its checks block) unchanged.
const fs = require('fs'), path = require('path'), vm = require('vm');
const src = fs.readFileSync(path.join(__dirname, 'airtaxi_enc1_run.js'), 'utf8').split('\n'); const cut = src.findIndex(l => l.startsWith("if (process.argv[2] === 'checks')"));
const ctx = { require, __dirname, console, Math, JSON, Map, Object }; vm.createContext(ctx); vm.runInContext(src.slice(0, cut).join('\n') + '\nthis.X = { setup, mkFlight, pos, P, WARM, HOURS, H1, V1, D2, GAP, DT, ZB };', ctx);
const { setup, mkFlight, pos, P, WARM, HOURS, H1, V1, DT } = ctx.X;
for (const m of ['DFW', 'HOU']) { const S = setup(m, 1, 1), FL = S.trace.map(f => mkFlight(f, S.SX, true)), sx = Object.values(S.SX), seen = new Map(), out = { bothCruise: 0, oneClimbDesc: 0, sameDir: 0, oppDir: 0, z: [] };
  const phase = (F, p) => Math.abs(p[2] - F.q.zc) < 1 ? 'cruise' : 'ramp';
  for (let tt = WARM; tt < WARM + HOURS * 3600; tt += DT) { const air = []; for (const F of FL) { if (tt < F.f[3] || tt > F.f[5] + 10) continue; const p = pos(F, tt); if (p && p !== 'hold') air.push([F, p]); }
    for (let i = 0; i < air.length; i++) for (let j = i + 1; j < air.length; j++) { const [A, p] = air[i], [B, o] = air[j], h = Math.hypot(p[0] - o[0], p[1] - o[1]), v = Math.abs(p[2] - o[2]);
      if (!(h < H1 && v < V1)) continue; const key = A.f[0] + '|' + B.f[0] + '|' + Math.min(A.f[3], B.f[3]), L = seen.get(key); seen.set(key, tt); if (L !== undefined && tt - L <= 30) continue;
      const term = q => sx.some(s => Math.hypot(q[0] - s[0], q[1] - s[1]) < H1); if (term(p) || term(o)) continue;
      const pa = phase(A, p), pb = phase(B, o); if (pa === 'cruise' && pb === 'cruise') out.bothCruise++; else out.oneClimbDesc++;
      if (A.ux * B.ux + A.uy * B.uy > 0) out.sameDir++; else out.oppDir++; if (out.z.length < 8) out.z.push([Math.round(p[2]), Math.round(o[2]), pa, pb, A.f[1] + '>' + A.f[2], B.f[1] + '>' + B.f[2]]); } }
  console.log(m, 'level 2 seed 1 arm B en-route E1 episodes:', JSON.stringify(out)); }
