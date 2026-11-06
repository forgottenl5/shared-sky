'use strict';
const O = require('./outage.js'), DV = require('./deviate.js'), P = require('./proc.js');
let pass = 0, fail = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); c ? pass++ : fail++; };
{ const acc = O.accepted(22, false), e = O.events(22)[0], log = [], fin = O.applyOutages(acc, [e], log); let bad = 0, missed = 0;
  for (let i = 0; i < acc.length; i++) { const f = acc[i], g = fin[i], s = O.segAt(f, e.T), p = s && P.posAt(s, e.T), inside = p && p[2] > 0.5 && Math.hypot(p[0] - e.c[0], p[1] - e.c[1]) <= O.R_OUT;
    if (!inside) { if (g !== f) bad++; continue; } if (g === f) { missed++; continue; } const b = DV.expand(f), x = DV.expand(g), k = b.findIndex(q => q[0] === e.T);
    for (let q = 0; q < O.HOLD; q++) if (x[k + q][1] !== b[k][1] || x[k + q][3] !== b[k][3]) { bad++; break; } for (let q = k; q < b.length; q++) if (x[q + O.HOLD][0] !== b[q][0] + O.HOLD || Math.abs(x[q + O.HOLD][1] - b[q][1]) > 1e-9) { bad++; break; } }
  ok(bad === 0 && missed === 0 && log.length > 0, `K1 one outage: ${log.length} held, ${bad} bad, ${missed} missed`); }
{ const a = O.run('ISO-R', 22), c = O.run('ISO-C', 22), o = O.run('OUT-A2', 22); const nonCruise = c.log.filter(l => l.phase !== 'cruise').length;
  ok(a.r.holds === o.r.holds && c.r.holds === o.r.holds && nonCruise === 0, `K2 holds: OUT ${o.r.holds}, ISO-R ${a.r.holds}, ISO-C ${c.r.holds}; ISO-C non-cruise ${nonCruise}; ISO-R phases ${JSON.stringify(a.r.phases)}`); }
{ const r = O.run('OUT-A2', 22, 0).r; ok(r.cross_wide === 0, `K3 zero outages: cross wide ${r.cross_wide}`); }
console.log(`${pass} passed, ${fail} failed`);
