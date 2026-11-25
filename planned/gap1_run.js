'use strict';
// GAP1 runner (planned/GAP1_PREREG.md). Cost and risk: INTENT2's one() / risk() unchanged; cut: LAYOUT1's u() unchanged. Adds layout G1 and plan sizes V*.
//   node planned/gap1_run.js checks | <shard> <n>   -> out/gap1/{c,r,u}_<shard>.jsonl
const fs = require('fs'), path = require('path'), X = require('./coordx.js');
function load(file, cutAt, exp) { let src = fs.readFileSync(path.join(__dirname, file), 'utf8'); src = src.slice(0, src.indexOf(cutAt));
  const M = {}; new Function('require', '__dirname', 'module', src + `\nmodule.exports = { ${exp} };`)(require, __dirname, M); return M.exports; }
const I2 = load('intent2_run.js', '\nconst J = [];', 'one, risk, H'), LY = load('layout1_run.js', '\nconst J = [];', 'u, HL');
// G1: the widest even spacing the filed bands allow with Zipline fixed at 101 m and Wing's floor at 46 m: Wing 46, Amazon 73.5 both ways (gaps 27.5 / 27.5).
const G1 = { wing: [46, 46], aOut: 73.5, zip: 101, aIn: 73.5 };
I2.H.G1 = G1; LY.HL.H.G1 = G1;
// Plan sizes: INTENT2's N2 (+-10 m sideways, +-14 m in height) and the same plan with a smaller height allowance; N1 = best-site GPS (+-5 / +-5).
Object.assign(X.VOL, { V14: { w: 10, v: 14, h0: 10, g: 0.05 }, V135: { w: 10, v: 13.5, h0: 10, g: 0.05 }, V125: { w: 10, v: 12.5, h0: 10, g: 0.05 }, V115: { w: 10, v: 11.5, h0: 10, g: 0.05 }, V10: { w: 10, v: 10, h0: 10, g: 0.05 } });
const SIZES = ['V14', 'V135', 'V125', 'V115', 'V10'], J = [];
for (const m of ['houston', 'dfw']) for (let s = 1; s <= 5; s++) {
  for (const v of SIZES) { J.push(['c', m, 'G1', s, v]); if (v !== 'V14') J.push(['c', m, 'M1', s, v]); }   // M1 at V14 = INTENT2's M1 N2 rows (checked by K2)
  J.push(['c', m, 'G1', s, 'N1']); for (const v of ['N1', 'N2', 'NONE']) J.push(['r', m, 'G1', v, s]); J.push(['u', m, 'G1', s]); }
const run = j => j[0] === 'u' ? LY.u(j[1], j[2], j[3]) : j[0] === 'c' ? Object.assign({ part: 'c' }, I2.one(j[1], j[2], j[3], j[4], 'cross', false)) : I2.risk(j[1], j[2], j[3], j[4]);
const keyOf = r => r.part === 'c' ? ['c', r.metro, r.heights, r.seed, r.vol] : r.part === 'r' ? ['r', r.metro, r.arm, r.check, r.seed] : ['u', r.metro, r.arm, r.seed];
if (process.argv[2] === 'checks') { let bad = 0; const ok = (n, c, i) => { console.log((c ? 'ok  ' : 'FAIL') + ' ' + n + (i !== undefined ? ' ' + JSON.stringify(i) : '')); if (!c) bad++; };
  const rd = d => fs.readdirSync(d).filter(f => f.endsWith('.jsonl')).flatMap(f => fs.readFileSync(path.join(d, f), 'utf8').split('\n').filter(Boolean).map(JSON.parse));
  const t = require('child_process').spawnSync('node', ['planned/test_coordx.js'], { encoding: 'utf8' }); ok('K1 planned/test_coordx.js passes', t.status === 0);
  const I = rd('out/intent2'), o = I.find(x => x.part === 'c' && x.metro === 'houston' && x.heights === 'M1' && x.seed === 1 && x.vol === 'N2'), r = I2.one('houston', 'M1', 1, 'V14', 'cross', false);
  ok('K2 V14 reproduces INTENT2 M1 N2 cost (Houston seed 1)', o && JSON.stringify(r.cost) === JSON.stringify(o.cost), [r.cost.all.delayed, o && o.cost.all.delayed]);
  const q = I.find(x => x.part === 'r' && x.metro === 'dfw' && x.arm === 'M1' && x.check === 'N2' && x.seed === 1), z = I2.risk('dfw', 'M1', 'N2', 1);
  ok('K3 risk runner reproduces INTENT2 M1 N2 (DFW seed 1)', q && z.n === q.n && JSON.stringify(z.enc) === JSON.stringify(q.enc), [z.n, q && q.n]);
  const C1 = rd('out/layout1'), ou = C1.find(x => x.part === 'u' && x.metro === 'dfw' && x.arm === 'M1' && x.seed === 1), u = LY.u('dfw', 'M1', 1);
  ok('K4 cut runner reproduces LAYOUT1 M1 (DFW seed 1, 30 m / 10 m)', ou && u.counts.h30v10 === ou.counts.h30v10, [u.counts.h30v10, ou && ou.counts.h30v10]);
  const L = require('../lab/lab_engine.js'), cfg = LY.HL.MET.houston.cfg, fl = L.flights(cfg, LY.HL.MET.houston.R.sites(cfg, 1), 1, G1), hs = new Set();
  for (const f of fl) for (const s of f.sg) if (s[8] === 'cruise') hs.add(f.op + ' ' + s[4]);
  ok('K5 G1 cruise heights are Wing 46, Amazon 73.5, Zipline 101 only', [...hs].sort().join(',') === 'amazon 73.5,wing 46,zipline 101', [...hs]);
  console.log('jobs', J.length, bad ? bad + ' FAILED' : 'ALL PASS'); process.exit(bad ? 1 : 0); }
const k = +process.argv[2], n = +process.argv[3]; if (!(k >= 0 && n > 0)) { console.error('usage: checks | <shard> <n>'); process.exit(2); }
fs.mkdirSync('out/gap1', { recursive: true });
const done = new Set(); for (const f of fs.readdirSync('out/gap1').filter(f => f.endsWith('.jsonl'))) for (const l of fs.readFileSync('out/gap1/' + f, 'utf8').split('\n')) if (l.trim()) done.add(keyOf(JSON.parse(l)).join('|'));
for (const j of J.filter((_, i) => i % n === k)) { if (done.has(j.join('|'))) continue; const t = Date.now(), r = run(j); r.wall_s = (Date.now() - t) / 1000; fs.appendFileSync(`out/gap1/${j[0]}_${k}.jsonl`, JSON.stringify(r) + '\n'); console.log(j.join(' '), r.wall_s); }
