'use strict';
// CORRIDOR_PREREG.md part A: Richardson geometry (NFZ positions, detour, counting) with registered-path corridors.
const NZ = require('./nfz.js'), { viaFn } = require('./corridor.js'), fs = require('fs'), path = require('path');
const AIM = Math.atan2(NZ.BW_Y, 472), Ks = [2, 3, 4, 6, 8], Ds = [1000, 2000, 3000], Rs = [0, 850], NRAND = 12, NCUST = 20000;
function frac(cs, R, via) { const pts = NZ.BW_X.map(x => [x, NZ.BW_Y]), hits = pts.map(() => 0), H = [0, 0];
  for (const c of cs) { const v = via ? via({ c: H }, c) : null; let P;
    if (v && Math.hypot(v[0], v[1]) > 1050 && Math.hypot(c[0] - v[0], c[1] - v[1]) > 1050) { const a = NZ.path(H, v, R), b = NZ.path(v, c, R); P = a.concat(b.slice(1)); } else P = NZ.path(H, c, R);
    pts.forEach((p, j) => { if (NZ.distPoly(p, P) < 100) hits[j]++; }); }
  return Math.max(...hits) / cs.length; }
if (require.main === module) { const out = []; const cache = {}; for (const R of Rs) cache[R] = NZ.customers(R, 1).slice(0, NCUST);
  for (const R of Rs) { out.push({ R, K: 0, D: 0, mode: 'straight', f: frac(cache[R], R, null) });
    for (const K of Ks) for (const D of Ds) { const aimed = frac(cache[R], R, viaFn(K, D, () => AIM)); let sum = 0, mx = 0;
      for (let i = 0; i < NRAND; i++) { const f = frac(cache[R], R, viaFn(K, D, () => AIM + 2 * Math.PI * (i + 0.5) / NRAND / K)); sum += f; mx = Math.max(mx, f); }
      out.push({ R, K, D, aimed, randMean: sum / NRAND, randMax: mx }); console.log('R', R, 'K', K, 'D', D, 'aimed', aimed.toFixed(3), 'random mean', (sum / NRAND).toFixed(3), 'max', mx.toFixed(3)); } }
  fs.mkdirSync(path.join(__dirname, '../out'), { recursive: true }); fs.writeFileSync(path.join(__dirname, '../out/richcorr.json'), JSON.stringify(out));
  const g = (R, K, D) => out.find(o => o.R === R && o.K === K && o.D === D);
  const rc1 = g(0, 4, 2000).aimed, rc2 = Math.max(...out.filter(o => o.K >= 3).map(o => o.aimed)), rc3 = g(0, 4, 2000).randMean;
  console.log('straight R0', out[0].f.toFixed(3), '| straight R850', out.find(o => o.R === 850 && o.K === 0).f.toFixed(3));
  console.log('| Prediction | Result | Verdict |\n|---|---|---|');
  console.log(`| RC1 aimed K4 D2km R0 >= 0.20 | ${rc1.toFixed(3)} | ${rc1 >= 0.20 ? '**PASS**' : '**FAIL**'} |`);
  console.log(`| RC2 no aimed K>=3 reaches 0.40 | max ${rc2.toFixed(3)} | ${rc2 < 0.40 ? '**PASS**' : '**FAIL**'} |`);
  console.log(`| RC3 random-orientation K4 D2km R0 mean <= 0.10 | ${rc3.toFixed(3)} | ${rc3 <= 0.10 ? '**PASS**' : '**FAIL**'} |`); }
module.exports = { frac };
