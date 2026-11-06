'use strict';
const RT = require('./rth.js'), DV = require('./deviate.js');
let pass = 0, fail = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); c ? pass++ : fail++; };
for (const arm of ['RTH-OWN', 'RTH-120']) { const { acc, fin, dev } = RT.run(arm, 3, 19), A = new Map(acc.map(f => [f.id, f])); let bad = 0, n = 0; const H = arm === 'RTH-120' ? 120 : null;
  for (const g of fin) { if (!dev.has(g.id) || g.sg[0][9] !== 'dev') continue; n++; const f = A.get(g.id), base = DV.expand(f), s = DV.expand(g), td = f.t0 + dev.get(g.id), k = base.findIndex(p => p[0] === td), p = base[k], pad = [f.sg[0][2], f.sg[0][3]];
    for (let i = 0; i < k; i++) if (s[i][0] !== base[i][0] || Math.abs(s[i][1] - base[i][1]) > 1e-9 || Math.abs(s[i][3] - base[i][3]) > 1e-9) { bad++; break; }
    let i = k, z = p[3]; const tgt = H === null ? z : H;
    while (i < s.length && s[i][4] === 'vertical' && s[i][1] === p[1] && s[i][2] === p[2] && Math.abs(s[i][3] - tgt) > 1e-9) { if (Math.abs(s[i][3] - z) > 1e-9) { bad++; break; } z = Math.abs(tgt - z) <= RT.VZ ? tgt : z + Math.sign(tgt - z) * RT.VZ; i++; }
    let j = i; while (j < s.length && s[j][4] === 'cruise') { if (Math.abs(s[j][3] - tgt) > 1e-9) { bad++; break; } j++; }
    const L = Math.hypot(pad[0] - p[1], pad[1] - p[2]), steps = j - i - 1; if (Math.abs(steps - Math.max(1, Math.round(L / RT.SPD[g.op]))) > 1) bad++;
    if (Math.hypot(s[j - 1][1] - pad[0], s[j - 1][2] - pad[1]) > 1e-6) bad++;
    for (let q = j; q < s.length; q++) { if (s[q][1] !== pad[0] || s[q][2] !== pad[1]) { bad++; break; } if (q > j && s[q][3] > s[q - 1][3] + 1e-9) { bad++; break; } } if (s[s.length - 1][3] !== 0) bad++; }
  ok(bad === 0 && n > 0, `K1 ${arm}: ${n} RTH tracks, ${bad} bad`); }
for (const arm of ['OUT-A2', 'OUT-A0']) { const { acc, fin } = RT.run(arm, 3, 19); let bad = 0, held = 0;
  for (let i = 0; i < acc.length; i++) { const f = acc[i], g = fin[i]; if (!g.held) { if (g !== f) bad++; continue; } held++; const b = DV.expand(f), s = DV.expand(g), k = b.findIndex(p => p[0] === RT.T_OUT), p = b[k];
    if (p[3] <= 0.5 || Math.hypot(p[1], p[2]) > RT.R_OUT) bad++;
    for (let q = 0; q < RT.HOLD; q++) { const x = s[k + q]; if (x[1] !== p[1] || x[2] !== p[2] || x[3] !== p[3]) { bad++; break; } }
    for (let q = k; q < b.length; q++) { const x = s[q + RT.HOLD]; if (!x || x[0] !== b[q][0] + RT.HOLD || Math.abs(x[1] - b[q][1]) > 1e-9 || Math.abs(x[3] - b[q][3]) > 1e-9) { bad++; break; } } }
  // flights airborne in the circle that were NOT held
  let missed = 0; for (let i = 0; i < acc.length; i++) { if (fin[i].held) continue; const b = DV.expand(acc[i]), p = b.find(x => x[0] === RT.T_OUT); if (p && p[3] > 0.5 && Math.hypot(p[1], p[2]) <= RT.R_OUT) missed++; }
  ok(bad === 0 && missed === 0 && held > 0, `K2 ${arm}: ${held} held, ${bad} bad, ${missed} missed`); }
console.log(`${pass} passed, ${fail} failed`);
