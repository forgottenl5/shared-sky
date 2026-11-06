'use strict';
// G1-G3 of HOUSTON2_PREREG.md
const H1 = require('./houston1.js'), H2 = require('./houston2.js');
let pass = 0, fail = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); c ? pass++ : fail++; };
// G1 segments reproduce 1-s tracks
{ const pad = [100, -50], cust = [4300, 2700], box = [1500, 900]; let worst = 0, lenOK = true;
  for (const [a, b] of [[H1.wingFlight(10, pad, cust, 63.2), H2.expand(H2.wingFlight(10, pad, cust, 63.2))], [H1.amazonFlight(10, pad, cust), H2.expand(H2.amazonFlight(10, pad, cust))], [H1.ziplineFlight(10, pad, box, cust), H2.expand(H2.ziplineFlight(10, pad, box, cust))]]) {
    if (a.length !== b.length) lenOK = false; for (let k = 0; k < Math.min(a.length, b.length); k++) { if (a[k][0] !== b[k][0]) lenOK = false; worst = Math.max(worst, Math.hypot(a[k][1] - b[k][1], a[k][2] - b[k][2], a[k][3] - b[k][3])); } }
  ok(lenOK && worst <= 1, `G1 segment model vs 1-s tracks: same timing ${lenOK}, worst position difference ${worst.toExponential(2)} m`); }
// G2 identical counts on HOUSTON1 S1 sites and seeds
{ let same = true, msg = [];
  for (const seed of [1, 2, 3]) { const fl1 = H1.generate('S1', seed, 1), siteXY = H1.SCEN.S1.map(id => H1.en(H1.SITES[id][1], H1.SITES[id][2])), r1 = H1.count(fl1, siteXY, {});
    const S = H1.SCEN.S1.map(id => { const [op, la, lo] = H1.SITES[id]; return { op, c: H1.en(la, lo), rate: H1.OP[op].rate }; });
    const fl2 = H2.flights(S, seed, { warm: H1.WARM, meas: 4 * 3600 }), r2 = H2.count(fl2, { warm: H1.WARM, zone: 1e9, meas: 4 * 3600 });
    for (const k of ['wide|cross', 'close|cross', 'wide|same', 'close|same']) if ((r1[k] || 0) !== (r2[k] || 0)) { same = false; msg.push(`seed ${seed} ${k}: ${r1[k] || 0} vs ${r2[k] || 0}`); }
    msg.push(`seed ${seed}: flights ${fl1.length}/${fl2.length}, wide cross ${r1['wide|cross'] || 0}/${r2['wide|cross'] || 0}, wide same ${r1['wide|same'] || 0}/${r2['wide|same'] || 0}`); }
  ok(same, `G2 identical counts vs HOUSTON1 S1: ${msg.join('; ')}`); }
// G3 site counts
{ const exp = { wing: 44 * 44 / 16, zipline: 44 * 44 / 16 * 65 / 75, amazon: 44 * 44 / 16 * 6 / 75 }; let okc = true, m = [];
  for (const op of Object.keys(exp)) { const n = [1, 2, 3].map(s => H2.sites(4, s).filter(x => x.op === op).length), mean = n.reduce((a, b) => a + b, 0) / 3; if (Math.abs(mean - exp[op]) / exp[op] > 0.2) okc = false; m.push(`${op} ${mean.toFixed(1)} vs ${exp[op].toFixed(1)}`); }
  ok(okc, `G3 site counts at d = 4 km: ${m.join(', ')}`); }
console.log(`\n${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
