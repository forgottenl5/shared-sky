'use strict';
// LAYOUT1 runner (planned/LAYOUT1_PREREG.md). Loads HEADLINE2's, COORD1's and RISK2's code unchanged and adds two height layouts.
//   node planned/layout1_run.js checks | <shard> <n>   -> out/layout1/{u,c,r}_<shard>.jsonl
const fs = require('fs'), path = require('path'), L = require('../lab/lab_engine.js');
const NEW = { M1: { wing: [46, 52], aOut: 76, zip: 101, aIn: 76 }, M2: { wing: [76, 80], aOut: 55, zip: 101, aIn: 55 } };
function load(file, cutAt, exp, patch) { let src = fs.readFileSync(path.join(__dirname, file), 'utf8'); src = src.slice(0, src.indexOf(cutAt)); if (patch) { const p = src.replace(patch[0], patch[1]); if (p === src) throw new Error('patch failed in ' + file); src = p; }
  const M = {}; new Function('require', '__dirname', 'module', src + `\nmodule.exports = { ${exp} };`)(require, __dirname, M); return M.exports; }
const HL = load('headline2_run.js', 'const cross =', 'MET, H'), CO = load('coord1_run.js', 'const J = [];', 'one, W, MET, H', ['return W.bandHours(0.85, 0.95, 3);', 'return W.bandHours(0.85, 0.95, 10);']), RK = load('risk2_run.js', 'const J = [];', 'one, H');
Object.assign(HL.H, NEW); Object.assign(CO.H, NEW); Object.assign(RK.H, NEW);
const VT = [5, 7.5, 10, 12.5, 15, 20], TH = VT.map(v => [`h30v${v}`, 30, v]);
function u(m, arm, seed) { const cfg = HL.MET[m].cfg, S = HL.MET[m].R.sites(cfg, seed), fl = L.flights(cfg, S, seed, HL.H[arm]), c = L.count(cfg, fl, { sub: 4, tEnd: cfg.warm + cfg.meas, th: TH }), counts = {}, pairs = {};
  for (const [nm] of TH) counts[nm] = c[nm + '|cross'] || 0;
  for (const k in c) { const q = k.match(/^(h30v[\d.]+)\|pair\|(.+)$/); if (q && q[2].split('-')[0] !== q[2].split('-')[1]) (pairs[q[1]] = pairs[q[1]] || {})[q[2]] = c[k]; }
  return { part: 'u', metro: m, arm, seed, counts, pairs, flights: fl.length }; }
const J = [];
for (const m of ['houston', 'dfw']) for (const arm of ['M1', 'M2']) for (let s = 1; s <= 10; s++) { J.push(['u', m, arm, s]); for (const a of ['NONE', 'V2']) { J.push(['c', m, arm, s, a]); J.push(['r', m, arm, a, s]); } }
function run(j) { const [p, ...a] = j; if (p === 'u') return u(...a); if (p === 'c') return Object.assign({ part: 'c' }, CO.one(...a)); return Object.assign({ part: 'r' }, RK.one(...a)); }
const keyOf = r => r.part === 'u' ? ['u', r.metro, r.arm, r.seed] : r.part === 'c' ? ['c', r.metro, r.heights, r.seed, r.arm] : ['r', r.metro, r.arm, r.check, r.seed];
if (process.argv[2] === 'checks') { let bad = 0; const ok = (n, c, i) => { console.log((c ? 'ok  ' : 'FAIL') + ' ' + n + (i !== undefined ? ' ' + JSON.stringify(i) : '')); if (!c) bad++; };
  const rd = d => fs.readdirSync(d).flatMap(f => fs.readFileSync(path.join(d, f), 'utf8').split('\n').filter(Boolean).map(JSON.parse));
  const C1 = rd('out/curve1'); for (const m of ['houston', 'dfw']) { const r = u(m, 'A2', 1), o = C1.find(x => x.metro === m && x.arm === 'A2' && x.seed === 1); ok(`K1 ${m} A2 seed 1 = CURVE1 (6 rules)`, o && VT.every(v => r.counts[`h30v${v}`] === o.counts[`h30v${v}`]), VT.map(v => [r.counts[`h30v${v}`], o && o.counts[`h30v${v}`]])); }
  const SD = rd('out/coord1').concat(rd('out/seeds2')), c = CO.one('houston', 'A2', 1, 'V2'), o = SD.find(x => x.metro === 'houston' && x.heights === 'A2' && x.seed === 1 && x.arm === 'V2');
  ok('K2 houston A2 V2 seed 1 held count = stored', o && c.cost.all.delayed === o.cost.all.delayed && c.cost.all.n === o.cost.all.n, [c.cost.all.delayed, o && o.cost.all.delayed]);
  const t = require('child_process').spawnSync('node', ['lab/risk.js', 'test'], { encoding: 'utf8' }); const R1 = rd('out/risk1'), r = RK.one('dfw', 'A2', 'NONE', 1), q = R1.find(x => x.metro === 'dfw' && x.arm === 'A2' && x.seed === 1);
  ok('K3 risk unit tests and RISK1 reproduction (DFW A2 seed 1)', t.status === 0 && q && r.n === q.n && JSON.stringify(r.enc) === JSON.stringify(q.enc), [t.status, r.n, q && q.n]);
  console.log('jobs', J.length, bad ? bad + ' FAILED' : 'ALL PASS'); process.exit(bad ? 1 : 0); }
const k = +process.argv[2], n = +process.argv[3]; if (!(k >= 0 && n > 0)) { console.error('usage: checks | <shard> <n>'); process.exit(2); }
fs.mkdirSync('out/layout1', { recursive: true });
const done = new Set(); for (const f of fs.readdirSync('out/layout1')) for (const l of fs.readFileSync('out/layout1/' + f, 'utf8').split('\n')) if (l.trim()) done.add(keyOf(JSON.parse(l)).join('|'));
for (const j of J.filter((_, i) => i % n === k)) { if (done.has(j.join('|'))) continue; const t = Date.now(), r = run(j); r.wall_s = (Date.now() - t) / 1000; fs.appendFileSync(`out/layout1/${j[0]}_${k}.jsonl`, JSON.stringify(r) + '\n'); console.log(j.join(' '), r.wall_s); }
