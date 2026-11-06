'use strict';
// FLEET_PREREG.md: B0 filed site mix; B1 equal fleets (Amazon x5.4, Zipline x0.32). Filed profiles, A2 heights, first filed goes first.
const fs = require('fs'), path = require('path'), H2 = require('./houston2.js'), VR = require('./vrate.js'), F = require('./fair.js');
const HALF = 22000, RATIO = { B0: { wing: 1, zipline: 65 / 75, amazon: 6 / 75 }, B1: { wing: 1, zipline: 65 / 75 * 0.32, amazon: 6 / 75 * 5.4 } };
function rng(seed) { let s = (seed * 2654435761) >>> 0; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; }
function sites(d, seed, arm) { const r = rng(seed + 7919), L = 2 * HALF / 1000, out = [];
  for (const op of ['wing', 'zipline', 'amazon']) { const n = Math.round(L * L / (d * d) * RATIO[arm][op]); for (let k = 0; k < n; k++) out.push({ op, c: [(r() - 0.5) * 2 * HALF, (r() - 0.5) * 2 * HALF] }); } return out; }
const NAME = ['wing', 'amazon', 'zipline'];
function run(arm, d, seed) { const S = sites(d, seed, arm), fl = VR.flights(S, seed, 'V0'), rec = {}, ic = F.intentCheck(fl, 'fifo', rec), st = F.stats(ic, fl), opOf = new Map(fl.map(f => [f.id, f.op])), pairs = {};
  for (const [id, set] of Object.entries(rec)) { const o = opOf.get(+id); for (const b of set) { const key = [o, NAME[b]].sort().join('-'); (pairs[key] || (pairs[key] = {}))[o] = ((pairs[key] || {})[o] || 0) + 1; } }
  return { r: Object.assign({ arm, d, seed, sites: { wing: S.filter(s => s.op === 'wing').length, zipline: S.filter(s => s.op === 'zipline').length, amazon: S.filter(s => s.op === 'amazon').length }, pairs }, st), ic }; }
module.exports = { run, sites, RATIO };
if (require.main === module) { const [arm, d, seed] = process.argv.slice(2), t0 = Date.now(), { r } = run(arm, +d, +seed); r.wall_s = (Date.now() - t0) / 1000; const od = path.join(__dirname, '..', 'out', 'fleet'); fs.mkdirSync(od, { recursive: true });
  fs.writeFileSync(path.join(od, `${arm}_d${d}_${seed}.json`), JSON.stringify(r));
  console.log(arm, 'd', d, 'seed', seed, 'n', JSON.stringify(Object.fromEntries(Object.entries(r.byOp).map(([k, v]) => [k, v.n]))), 'ratio', r.ratio && r.ratio.toFixed(2), 'pairs', JSON.stringify(r.pairs), r.wall_s + 's'); }
