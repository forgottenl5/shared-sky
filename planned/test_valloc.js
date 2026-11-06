'use strict';
// K1-K3 of VALLOC_PREREG.md
const V = require('./valloc.js'), H2 = require('./houston2.js'), fs = require('fs'), path = require('path');
let pass = 0, fail = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); c ? pass++ : fail++; };
// K1 A0 reproduces HOUSTON2
{ let same = true, msg = []; for (const d of [4, 3]) for (const s of [1, 2, 3]) { const h = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'out', 'houston2', `d${d}_${s}.json`))), { r } = V.run('A0', d, s);
    for (const k of ['wide|cross', 'close|cross', 'wide|same', 'close|same']) if ((h[k] || 0) !== (r[k] || 0)) { same = false; msg.push(`d${d} s${s} ${k} ${h[k]} vs ${r[k]}`); } }
  ok(same, `K1 A0 equals HOUSTON2 at d = 4 and 3 km, seeds 1-3 ${msg.join('; ')}`); }
// K2 heights per arm
{ let bad = []; for (const arm of ['A0', 'A1', 'A2']) { const A = V.ARMS[arm], S = H2.sites(4, 1), fl = V.flights(S, 1, A);
    for (const f of fl.slice(0, 3000)) for (const sg of f.sg) { if (sg[8] === 'vertical') continue; const z = sg[4];
      if (f.op === 'wing' && sg[8] === 'cruise' && (z < A.wing[0] - 0.01 || z > A.wing[1] + 0.01)) bad.push(`${arm} wing ${z}`);
      if (f.op === 'zipline' && Math.abs(z - A.zip) > 0.01) bad.push(`${arm} zipline ${z}`);
      if (f.op === 'amazon' && sg[8] === 'cruise' && Math.abs(z - (sg[9] === 'out' ? A.aOut : A.aIn)) > 0.01) bad.push(`${arm} amazon ${sg[9]} ${z}`); } }
  ok(bad.length === 0, `K2 heights per arm: ${bad.length} violations ${bad.slice(0, 3).join('; ')}`); }
// K3 pairing
{ let same = true; for (const s of [1, 2, 3]) { const S = H2.sites(3, s), a = V.flights(S, s, V.ARMS.A0), b = V.flights(S, s, V.ARMS.A1), c = V.flights(S, s, V.ARMS.A2);
    if (a.length !== b.length || a.length !== c.length) same = false; else for (let k = 0; k < a.length; k++) if (a[k].t0 !== b[k].t0 || a[k].t0 !== c[k].t0 || a[k].op !== c[k].op || a[k].sg[0][2] !== c[k].sg[0][2]) { same = false; break; } }
  ok(same, `K3 arms launch identical flights (count, time, operator, site) for each seed`); }
console.log(`\n${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
