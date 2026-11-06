'use strict';
// The lab engine must reproduce the research engine exactly at the research configuration.
const L = require('./lab_engine.js'), H2 = require('../planned/houston2.js'), V = require('../planned/valloc.js'), VO = require('../planned/vol.js'), fs = require('fs');
const cfg = { half: 22000, zone: 6000, warm: 3600, meas: 7200 };
let pass = 0, fail = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); c ? pass++ : fail++; };
{ const a = L.sites(cfg, 4, 1), b = H2.sites(4, 1); ok(JSON.stringify(a) === JSON.stringify(b), `sites identical (${a.length})`);
  for (const arm of ['A0', 'A2']) { const fa = L.flights(cfg, a, 1, V.ARMS[arm]), fb = V.flights(b, 1, V.ARMS[arm]); ok(JSON.stringify(fa.map(f => f.sg)) === JSON.stringify(fb.map(f => f.sg)), `flights ${arm} identical (${fa.length})`);
    const c1 = L.count(cfg, fa, { sub: 1 }), r1 = H2.count(fb, { sub: 1 }); ok(c1['wide|cross'] === r1['wide|cross'] && c1['close|cross'] === r1['close|cross'] && c1['wide|same'] === r1['wide|same'], `count sub 1 ${arm}: ${c1['wide|cross']}/${c1['close|cross']} vs ${r1['wide|cross']}/${r1['close|cross']}`); } }
{ const r = L.run(cfg, { d: 4, seed: 1, heights: 'filed', check: false, contingency: 'none', sub: 4 }), o = JSON.parse(fs.readFileSync('out/countfix/valloc_A0_d4_1.json'));
  ok(r.cross_wide === o.cross_wide && r.cross_close === o.cross_close, `run filed d4 s1 sub 4: ${r.cross_wide}/${r.cross_close} vs COUNTFIX ${o.cross_wide}/${o.cross_close}`); }
{ const S = H2.sites(4, 1), fl = V.flights(S, 1, V.ARMS.A2), a = L.intentCheck(cfg, fl, 30, 5, 10), b = VO.intentCheck(V.flights(S, 1, V.ARMS.A2), 30, 5, 10); let dd = 0; for (const [id, D] of b.delays) if (a.delays.get(id) !== D) dd++; ok(dd === 0 && a.delays.size === b.delays.size, `plan check delays identical (${dd} differ of ${b.delays.size})`); }
for (const [cont, file] of [['hold', 'dev_HOLD-A2_d4_19.json'], ['rth-120', 'rth_RTH-120_d4_19.json']]) { const r = L.run(cfg, { d: 4, seed: 19, heights: 'allocation', check: true, cell: 30, tb: 5, vsep: 10, contingency: cont, frac: 0.2, sub: 4 }), o = JSON.parse(fs.readFileSync('out/countfix/' + file));
  ok(r.cross_wide === o.cross_wide && r.cross_close === o.cross_close && r.contingencyEvents === o.events, `${cont} d4 s19: ${r.cross_wide}/${r.cross_close} (${r.contingencyEvents} events) vs COUNTFIX ${o.cross_wide}/${o.cross_close} (${o.events})`); }
console.log(`${pass} passed, ${fail} failed`);
