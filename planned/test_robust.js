'use strict';
// C1-C3 of ROBUST_PREREG.md
const R = require('./robust.js'), H2 = require('./houston2.js'), V = require('./valloc.js'), fs = require('fs'), path = require('path');
let pass = 0, fail = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); c ? pass++ : fail++; };
{ let same = true, m = []; for (const arm of ['A0', 'A1', 'A2']) for (const s of [1, 2, 3]) { const o = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'out', 'valloc', `${arm}_d4_${s}.json`))), { r } = V.run(arm, 4, s);
    for (const k of ['wide|cross', 'close|cross', 'wide|same', 'close|same']) if ((o[k] || 0) !== (r[k] || 0)) { same = false; m.push(`${arm} s${s} ${k}`); } }
  ok(same, `C1 default counting identical to VALLOC at d = 4, seeds 1-3 ${m.join(' ')}`); }
{ let same = true, m = []; for (const arm of ['A0', 'A2']) { const { r: single } = V.run(arm, 4, 2), multi = R.run('HOU', arm, 4, 2, 1);
    if ((single['wide|cross'] || 0) !== (multi['h30v10|cross'] || 0) || (single['close|cross'] || 0) !== (multi['h15v5|cross'] || 0) || (single['wide|same'] || 0) !== (multi['h30v10|same'] || 0)) same = false;
    m.push(`${arm}: wide ${single['wide|cross']}/${multi['h30v10|cross']}, close ${single['close|cross']}/${multi['h15v5|cross']}`); }
  ok(same, `C2 multi-threshold counts equal single-threshold counts: ${m.join('; ')}`); }
{ const exp = { wing: 44 * 44 / 16, zipline: 44 * 44 / 16, amazon: 44 * 44 / 16 * 4 / 75 }; let good = true, m = [];
  for (const op of Object.keys(exp)) { const n = [1, 2, 3].map(s => R.sites('DFW', 4, s, 1).filter(x => x.op === op).length), mean = n.reduce((a, b) => a + b, 0) / 3; if (Math.abs(mean - exp[op]) / exp[op] > 0.2) good = false; m.push(`${op} ${mean.toFixed(1)}/${exp[op].toFixed(1)}`); }
  const zr = R.sites('DFW', 4, 1, 1).find(x => x.op === 'zipline').rate; if (Math.abs(zr - 400 * 0.95 / 15) > 1e-9) good = false;
  ok(good, `C3 DFW site counts ${m.join(', ')}; Zipline rate ${zr.toFixed(2)}/h (400/day)`); }
console.log(`\n${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
