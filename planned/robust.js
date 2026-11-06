'use strict';
// ROBUST_PREREG.md: thresholds (R-a), peak x1.5 (R-b), Dallas-Fort Worth mix (R-c). Reuses valloc flights and houston2 count.
// usage: node planned/robust.js MIX ARM D_KM SEED PEAK    MIX in HOU DFW
const fs = require('fs'), path = require('path'), H2 = require('./houston2.js'), V = require('./valloc.js');
const TH = [['h15v5', 15, 5], ['h30v10', 30, 10], ['h50v10', 50, 10], ['h30v15', 30, 15], ['h30v20', 30, 20]];
const MIX = { HOU: { wing: 75, zipline: 65, amazon: 6, zipDay: 1000 }, DFW: { wing: 75, zipline: 75, amazon: 4, zipDay: 400 } };
function rng(seed) { let s = (seed * 2654435761) >>> 0; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; }
function sites(mix, d, seed, peak) {   // same draw pattern as houston2.sites; ratios per mix
  if (mix === 'HOU') return H2.sites(d, seed).map(s => Object.assign(s, { rate: H2.OP[s.op].rate * peak }));
  const M = MIX[mix], r = rng(seed + 7919), L = 44, out = [];
  for (const op of ['wing', 'zipline', 'amazon']) { const n = Math.round(L * L / (d * d) * M[op] / M.wing); for (let k = 0; k < n; k++) out.push({ op, c: [(r() - 0.5) * 44000, (r() - 0.5) * 44000] }); }
  return out.map(s => Object.assign(s, { rate: (s.op === 'zipline' ? M.zipDay * 0.95 / 15 : H2.OP[s.op].rate) * peak }));
}
function run(mix, arm, d, seed, peak) { const S = sites(mix, d, seed, peak), fl = V.flights(S, seed, V.ARMS[arm]), r = H2.count(fl, { th: TH });
  return Object.assign(r, { mix, arm, d, seed, peak, sites: { wing: S.filter(s => s.op === 'wing').length, zipline: S.filter(s => s.op === 'zipline').length, amazon: S.filter(s => s.op === 'amazon').length } }); }
module.exports = { run, sites, TH, MIX };
if (require.main === module) { const [mix, arm, d, seed, pk] = process.argv.slice(2), t0 = Date.now(), r = run(mix, arm, +d, +seed, +(pk || 1)); r.wall_s = (Date.now() - t0) / 1000;
  const od = path.join(__dirname, '..', 'out', 'robust'); fs.mkdirSync(od, { recursive: true }); fs.writeFileSync(path.join(od, `${mix}_${arm}_d${d}_${seed}_p${pk || 1}.json`), JSON.stringify(r));
  console.log(mix, arm, d, seed, pk || 1, 'cross h30v10', r['h30v10|cross'] || 0, r.wall_s + 's'); }
