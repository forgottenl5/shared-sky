'use strict';
const Z = require('./nfz.js'); let pass = 0, fail = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); c ? pass++ : fail++; };
// K1: uniform, point 1.5 km from hub, w 150, averaged over 16 directions; richardson_check table: 9 passes at 150 flights -> 0.03
{ const cs = Z.customers(0, 3); let h = 0; for (let k = 0; k < 16; k++) { const a = 2 * Math.PI * k / 16, p = [1500 * Math.cos(a), 1500 * Math.sin(a)]; for (const c of cs) if (Z.distPoly(p, [[0, 0], c]) < 150) h++; } const f = h / (16 * cs.length);
  ok(Math.abs(f / 0.03 - 1) <= 0.2, `K1 uniform fraction at 1.5 km within 150 m = ${f.toFixed(4)} (table 0.03)`); }
// K2, K3
for (const R of [300, 500, 700, 850]) { const cs = Z.customers(R, 5).slice(0, 20000); let inside = 0, ends = 0, straightBad = 0;
  for (const c of cs) { const P = Z.path([0, 0], c, R); if (P[0][0] !== 0 || P[0][1] !== 0 || P[P.length - 1] !== c) ends++;
    if (!Z.segHitsCircle([0, 0], c, Z.NFZ, R) && P.length !== 2) straightBad++;
    for (let i = 0; i + 1 < P.length; i++) for (let k = 0; k <= 50; k++) { const x = P[i][0] + (P[i + 1][0] - P[i][0]) * k / 50, y = P[i][1] + (P[i + 1][1] - P[i][1]) * k / 50; if (Math.hypot(x - Z.NFZ[0], y - Z.NFZ[1]) < R - 1) { inside++; break; } } }
  ok(inside === 0 && ends === 0, `K2 R=${R}: samples inside circle ${inside}, bad ends ${ends}`); ok(straightBad === 0, `K3 R=${R}: non-entering paths changed ${straightBad}`); }
console.log(`${pass} passed, ${fail} failed`);
