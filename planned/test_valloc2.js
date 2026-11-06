'use strict';
// L1-L2 of VALLOC2_PREREG.md (plus K1 rerun: A0-A2 unchanged)
const V = require('./valloc.js'), H2 = require('./houston2.js'), fs = require('fs'), path = require('path');
let pass = 0, fail = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); c ? pass++ : fail++; };
{ let same = true; for (const arm of ['A0', 'A1', 'A2']) for (const s of [1, 2]) { const o = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'out', 'valloc', `${arm}_d4_${s}.json`))), { r } = V.run(arm, 4, s); for (const k of ['wide|cross', 'close|cross', 'wide|same']) if ((o[k] || 0) !== (r[k] || 0)) same = false; }
  ok(same, 'K1-rerun A0-A2 results unchanged by the A3 code change (d = 4, seeds 1-2)'); }
{ let same = true; for (const s of [1, 2, 3]) { const S = H2.sites(3, s), a = V.flights(S, s, V.ARMS.A0), b = V.flights(S, s, V.ARMS.A3); if (a.length !== b.length) { same = false; continue; }
    for (let k = 0; k < a.length; k++) { if (a[k].t0 !== b[k].t0 || a[k].op !== b[k].op || a[k].sg[0][2] !== b[k].sg[0][2]) { same = false; break; } if (a[k].op === 'wing' && a[k].sg[3][4] !== b[k].sg[3][4]) { same = false; break; } } }
  ok(same, 'L1 A3 launches identical flights to A0 (count, time, operator, site, Wing height)'); }
{ const S = H2.sites(4, 1), fl = V.flights(S, 1, V.ARMS.A3).filter(f => f.op === 'amazon'), outs = [], ins = []; let bad = 0;
  for (const f of fl) for (const sg of f.sg) if (sg[8] === 'cruise') { const z = sg[4]; if (sg[9] === 'out') { outs.push(z); if (z < 55 - 1e-9 || z > 85 + 1e-9) bad++; } else { ins.push(z); if (z < 85 - 1e-9 || z > 115 + 1e-9) bad++; } }
  const sd = a => { const m = a.reduce((x, y) => x + y, 0) / a.length; return Math.sqrt(a.reduce((x, y) => x + (y - m) ** 2, 0) / (a.length - 1)); };
  ok(bad === 0 && sd(outs) > 5 && sd(ins) > 5, `L2 Amazon heights in band: ${bad} violations; spread sd out ${sd(outs).toFixed(1)} m, in ${sd(ins).toFixed(1)} m (${fl.length} flights)`); }
console.log(`\n${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
