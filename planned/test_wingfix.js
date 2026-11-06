'use strict';
const W = require('./wingfix.js'), fs = require('fs');
let pass = 0, fail = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); c ? pass++ : fail++; };
for (const h of ['A0', 'A2']) { const r = W.run(h + '-U', 4, 1).r, o = JSON.parse(fs.readFileSync(`out/countfix/valloc_${h}_d4_1.json`)); ok(r.cross_wide === o.cross_wide && r.cross_close === o.cross_close, `K1 ${h}-U d4 s1: ${r.cross_wide}/${r.cross_close} vs COUNTFIX ${o.cross_wide}/${o.cross_close}`); }
{ let bad = 0, other = 0; for (const h of ['A0', 'A2']) { const u = W.run(h + '-U', 3, 1).fl; for (const L of [46, 61, 76]) { const fl = W.run(`${h}-${L}`, 3, 1).fl, lev = h === 'A2' ? Math.min(L, 71) : L;
    fl.forEach((f, i) => { if (f.op === 'wing') { if (f.sg.some(s => s[8] === 'cruise' && (s[4] !== lev || s[7] !== lev))) bad++; } else if (JSON.stringify(f.sg) !== JSON.stringify(u[i].sg)) other++; }); } }
  ok(bad === 0 && other === 0, `K2 fixed levels: ${bad} Wing flights off level; ${other} other-operator flights changed`); }
console.log(`${pass} passed, ${fail} failed`);
