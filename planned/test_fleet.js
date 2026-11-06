'use strict';
const FL = require('./fleet.js'), H2 = require('./houston2.js'), VR = require('./vrate.js'), F = require('./fair.js');
let pass = 0, fail = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); c ? pass++ : fail++; };
{ let bad = 0; for (const d of [4, 3]) for (const s of [10, 11, 12]) if (JSON.stringify(FL.sites(d, s, 'B0')) !== JSON.stringify(H2.sites(d, s))) bad++;
  const S = H2.sites(4, 10), a = F.intentCheck(VR.flights(S, 10, 'V0'), 'fifo'), b = FL.run('B0', 4, 10).ic; let dd = 0; for (const [id, D] of a.delays) if (b.delays.get(id) !== D) dd++;
  ok(bad === 0 && dd === 0, `K1 B0 sites == houston2.sites (${bad} mismatches); delays == vrate V0 (${dd} differ)`); }
{ const { r, ic } = FL.run('B1', 3, 10), n = Object.values(r.byOp).map(v => v.n), mx = Math.max(...n), mn = Math.min(...n);
  ok(mx / mn <= 1.35 / 0.65, `K2 B1 d3 seed 10 zone flights per operator ${JSON.stringify(Object.fromEntries(Object.entries(r.byOp).map(([k, v]) => [k, v.n])))} (max/min ${(mx / mn).toFixed(2)})`);
  const S = FL.sites(3, 10, 'B1'), plain = F.intentCheck(VR.flights(S, 10, 'V0'), 'fifo'); let dd = 0; for (const [id, D] of plain.delays) if (ic.delays.get(id) !== D) dd++; ok(dd === 0, `K3 recorder leaves delays unchanged (${dd} differ)`); }
console.log(`${pass} passed, ${fail} failed`);
