'use strict';
// SEEDS2 runner (registration planned/SEEDS2_PREREG.md). Loads COORD1's one() unchanged from planned/coord1_run.js.
//   node planned/seeds2_run.js checks | <shard> <n>   -> out/seeds2/runs_<shard>.jsonl
const fs = require('fs'), path = require('path');
const src = fs.readFileSync(path.join(__dirname, 'coord1_run.js'), 'utf8'), cut = src.indexOf('const J = [];'), M = {};
new Function('require', '__dirname', 'module', src.slice(0, cut) + '\nmodule.exports = { one, W, MET };')(require, __dirname, M);
const { one, W, MET } = M.exports, N = 10;
// COORD1's hours(m) returns bandHours(0.85, 0.95, 3); for seeds 4-10 use the same list extended to 10
function hours10(m) { W.useFile(path.join(__dirname, '..', MET[m].wind)); return W.bandHours(0.85, 0.95, N); }
if (process.argv[2] === 'checks') { let bad = 0; const ok = (n, c, i) => { console.log((c ? 'ok  ' : 'FAIL') + ' ' + n + (i !== undefined ? ' ' + JSON.stringify(i) : '')); if (!c) bad++; };
  const C1 = fs.readdirSync('out/coord1').flatMap(f => fs.readFileSync('out/coord1/' + f, 'utf8').split('\n').filter(Boolean).map(JSON.parse));
  for (const m of ['houston', 'dfw']) { W.useFile(path.join(__dirname, '..', MET[m].wind)); const a = W.bandHours(0.85, 0.95, 3), b = hours10(m); ok(`K2 ${m} first three hours = COORD1`, JSON.stringify(b.slice(0, 3)) === JSON.stringify(a), [a, b.slice(0, 3)]); }
  const r = one('houston', 'A2', 1, 'V2'), c = C1.find(x => x.metro === 'houston' && x.heights === 'A2' && x.seed === 1 && x.arm === 'V2');
  ok('K1 houston A2 V2 seed 1 = COORD1', r.cost.all.delayed === c.cost.all.delayed && r.cancelled === c.cancelled && r.wide === c.wide, [r.cost.all.delayed, c.cost.all.delayed, r.wide, c.wide]);
  console.log(bad ? bad + ' FAILED' : 'ALL PASS'); process.exit(bad ? 1 : 0); }
// one() calls hours(m)[seed - 1]; patch hours for seeds > 3 by evaluating with the extended list
const src2 = src.slice(0, cut).replace('return W.bandHours(0.85, 0.95, 3);', 'return W.bandHours(0.85, 0.95, 10);'), M2 = {};
if (src2 === src.slice(0, cut)) throw new Error('could not extend the hour list');
new Function('require', '__dirname', 'module', src2 + '\nmodule.exports = { one };')(require, __dirname, M2);
const k = +process.argv[2], n = +process.argv[3]; fs.mkdirSync('out/seeds2', { recursive: true });
const J = []; for (const m of ['houston', 'dfw']) for (const hk of ['A0', 'A2']) for (let s = 4; s <= N; s++) for (const a of ['NONE', 'V2']) J.push([m, hk, s, a]);
for (const j of J.filter((_, i) => i % n === k)) { const t = Date.now(), r = M2.exports.one(...j); r.wall_s = (Date.now() - t) / 1000; fs.appendFileSync(`out/seeds2/runs_${k}.jsonl`, JSON.stringify(r) + '\n'); console.log(j.join(' '), r.wall_s); }
