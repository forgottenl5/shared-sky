'use strict';
// RICHPOP_PREREG.md: NFZ geometry (planned/nfz.js) with population-weighted customers.
const fs = require('fs'), path = require('path'), NZ = require('./nfz.js');
const LAT0 = 32.9886042, LON0 = -96.6617927, toXY = (la, lo) => [(lo - LON0) * 93370, (la - LAT0) * 111000], RD = 12070, MIN = 300;
const BG = fs.readFileSync(path.join(__dirname, '../data/CenPop2020_Mean_BG48.csv'), 'utf8').trim().split('\n').slice(1).map(l => l.split(','))
  .map(f => ({ pop: +f[4], c: toXY(+f[5], +f[6]) })).filter(b => b.pop > 0);
function rng(seed) { let s = (seed * 2654435761) >>> 0; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; }
function customers(R, sig, seed) { const near = BG.filter(b => Math.hypot(b.c[0], b.c[1]) <= RD + sig), cum = []; let tot = 0; for (const b of near) cum.push(tot += b.pop);
  const r = rng(seed), out = []; while (out.length < NZ.N) { const u = r() * tot; let lo = 0, hi = cum.length - 1; while (lo < hi) { const m = (lo + hi) >> 1; if (cum[m] < u) lo = m + 1; else hi = m; }
    const g = Math.sqrt(-2 * Math.log(1 - r())), t = 2 * Math.PI * r(), c = [near[lo].c[0] + sig * g * Math.cos(t), near[lo].c[1] + sig * g * Math.sin(t)], d = Math.hypot(c[0], c[1]);
    if (d < MIN || d > RD || (R > 0 && Math.hypot(c[0] - NZ.NFZ[0], c[1] - NZ.NFZ[1]) < R)) continue; out.push(c); }
  return { out, nBG: near.length, pop: tot }; }
function frac(cs, R) { const pts = NZ.BW_X.map(x => [x, NZ.BW_Y]), hits = NZ.WS.map(() => pts.map(() => 0)); let det = 0, north = 0;
  for (const c of cs) { const P = NZ.path([0, 0], c, R); if (P.length > 2) det++; if (c[1] > 0) north++; pts.forEach((p, j) => { const d = NZ.distPoly(p, P); NZ.WS.forEach((w, k) => { if (d < w) hits[k][j]++; }); }); }
  const o = { detoured: det / cs.length, northShare: north / cs.length }; NZ.WS.forEach((w, k) => o['w' + w] = hits[k].map(h => h / cs.length)); return o; }
if (require.main === module) { const res = [];
  if (process.argv[2] === 'checks') { const u = frac(NZ.customers(0, 1), 0), C = customers(850, 400, 1); const ok = C.out.every(c => { const d = Math.hypot(c[0], c[1]); return d >= MIN && d <= RD && Math.hypot(c[0] - NZ.NFZ[0], c[1] - NZ.NFZ[1]) >= 850; });
    console.log('K1 block groups', C.nBG, 'population', C.pop, '| customers valid', ok, '| uniform R0 w100', u.w100.map(v => v.toFixed(3)).join(' '), '| uniform north share', u.northShare.toFixed(3)); process.exit(0); }
  for (const [R, sig] of [[0, 400], [700, 400], [850, 400], [0, 200], [0, 800], [850, 200], [850, 800]]) { const C = customers(R, sig, 1), f = frac(C.out, R); res.push({ R, sig, ...f }); console.log('R', R, 'sigma', sig, 'detoured', (100 * f.detoured).toFixed(1) + '%', 'north', f.northShare.toFixed(3), '| w50', f.w50.map(v => v.toFixed(3)).join(' '), '| w100', f.w100.map(v => v.toFixed(3)).join(' '), '| w150', f.w150.map(v => v.toFixed(3)).join(' ')); }
  fs.writeFileSync(path.join(__dirname, '../out/richpop.json'), JSON.stringify(res));
  const m = (R, s) => Math.max(...res.find(x => x.R === R && x.sig === s).w100), all = Math.max(...res.map(x => Math.max(...x.w100)));
  console.log('| Prediction | Result | Verdict |\n|---|---|---|');
  console.log(`| RP1 R0 max w100 < 0.08 | ${m(0, 400).toFixed(3)} | ${m(0, 400) < 0.08 ? '**PASS**' : '**FAIL**'} |`);
  console.log(`| RP2 no arm reaches 0.40 | max ${all.toFixed(3)} | ${all < 0.40 ? '**PASS**' : '**FAIL**'} |`);
  console.log(`| RP3 R0 >= 1.2 x uniform 0.026 | ${(m(0, 400) / 0.026).toFixed(2)} x | ${m(0, 400) >= 1.2 * 0.026 ? '**PASS**' : '**FAIL**'} |`); }
