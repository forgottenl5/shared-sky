'use strict';
// H1-H3 of HOUSTON1_PREREG.md
const H = require('./houston1.js');
let pass = 0, fail = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); c ? pass++ : fail++; };
// H1 profile replay
{ const pad = [0, 0], cust = [5000, 0];
  const w = H.wingFlight(0, pad, cust, 70), a = H.amazonFlight(0, pad, cust), z = H.ziplineFlight(0, pad, [2000, 0], cust);
  const hov = (tr, zz) => tr.filter(p => p[4] === 'hover' && Math.abs(p[3] - zz) < 0.5).length, cr = (tr) => tr.filter(p => p[4] === 'cruise');
  const spd = tr => { const c = cr(tr); let m = 0; for (let k = 1; k < c.length; k++) if (c[k][0] === c[k - 1][0] + 1 && c[k][5] === c[k - 1][5]) m = Math.max(m, Math.hypot(c[k][1] - c[k - 1][1], c[k][2] - c[k - 1][2])); return m; };
  const hs = tr => [...new Set(cr(tr).map(p => +p[3].toFixed(1)))].sort((x, y) => x - y);
  const wOK = hov(w, 7) === 60 && hs(w).join() === '70' && Math.abs(spd(w) - 26.4) / 26.4 < 0.01;
  const aOK = hs(a).join() === '61,105' && hov(a, 4) === 4 && Math.abs(spd(a) - 30) / 30 < 0.01 && Math.max(...a.map(p => p[3])) <= 105.0001;
  const zOK = hov(z, 101) === 195 && hs(z).join() === '101' && Math.abs(spd(z) - 31.3) / 31.3 < 0.01;
  ok(wOK && aOK && zOK, `H1 profiles: Wing hover s at 7 m ${hov(w, 7)} (60), cruise heights ${hs(w)}, speed ${spd(w).toFixed(2)}; Amazon cruise heights ${hs(a)} (61,105), drop hover ${hov(a, 4)} s, speed ${spd(a).toFixed(2)}, max height ${Math.max(...a.map(p => p[3])).toFixed(1)}; Zipline hover s at 101 m ${hov(z, 101)} (195), heights ${hs(z)}, speed ${spd(z).toFixed(2)}`); }
// H2 counting: two crossing flights of different operators at the same height; then 12 m apart vertically
{ const mk = (op, a, b, z) => { const tr = []; for (let t = 0; t < 400; t++) { const f = t / 400; tr.push([H.WARM + t, a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, z, 'cruise', 'out']); } return { id: op === 'wing' ? 0 : 1, op, site: 'X', t0: H.WARM, tr }; };
  const r1 = H.count([mk('wing', [-4000, 0], [4000, 0], 80), mk('zipline', [0, -4000], [0, 4000], 80)], [[99999, 99999]]);
  const r2 = H.count([mk('wing', [-4000, 0], [4000, 0], 80), mk('zipline', [0, -4000], [0, 4000], 92)], [[99999, 99999]]);
  ok((r1['wide|cross'] || 0) === 1 && (r1['close|cross'] || 0) === 1 && !(r2['wide|cross']) && !(r2['close|cross']), `H2 counting: same height wide ${r1['wide|cross'] || 0}, close ${r1['close|cross'] || 0}; 12 m apart wide ${r2['wide|cross'] || 0}, close ${r2['close|cross'] || 0}`); }
// H3 demand
{ let n = 0, out = 0; const c = H.en(H.SITES.W1[1], H.SITES.W1[2]);
  for (let s = 1; s <= 5; s++) { const fl = H.generate('S0', s, 1).filter(f => f.site === 'W1' && f.t0 >= H.WARM); n += fl.length; out += fl.filter(f => Math.hypot(f.cust[0] - c[0], f.cust[1] - c[1]) > H.OP.wing.radius + 1e-6 || Math.hypot(f.cust[0] - c[0], f.cust[1] - c[1]) < 300).length; }
  const mean = n / 5; ok(Math.abs(mean - 106.7) / 106.7 <= 0.15 && out === 0, `H3 demand: W1 mean ${mean.toFixed(1)} orders in 4 h (106.7 expected), ${out} customers outside the disc or under 300 m`); }
console.log(`\n${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
