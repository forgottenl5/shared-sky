'use strict';
// PRIO1 runner (planned/PRIO1_PREREG.md). INTENT2's cost runner (INTENT1's one(), cross-company checking) with the check's order set by planned/prio.js.
//   node planned/prio1_run.js checks | <shard> <n>   -> out/prio1/c_<shard>.jsonl
const fs = require('fs'), path = require('path'), X = require('./coordx.js'), P = require('./prio.js');
const ORIG = X.check; let RULE = 'FCFS'; X.check = (cfg, fl, vol, opt = {}) => RULE === 'FCFS' ? ORIG(cfg, fl, vol, opt) : P.check(cfg, fl, vol, Object.assign({}, opt, { rule: RULE }));
function load(file, cutAt, exp) { let src = fs.readFileSync(path.join(__dirname, file), 'utf8'); src = src.slice(0, src.indexOf(cutAt));
  const M = {}; new Function('require', '__dirname', 'module', src + `\nmodule.exports = { ${exp} };`)(require, __dirname, M); return M.exports; }
const I2 = load('intent2_run.js', '\nconst J = [];', 'one, H');
I2.H.G1 = { wing: [46, 46], aOut: 73.5, zip: 101, aIn: 73.5 }; Object.assign(X.VOL, { V135: { w: 10, v: 13.5, h0: 10, g: 0.05 } });
const CONF = [['A2', 'N2'], ['G1', 'V135']], RULES = ['ROT', 'SHORT', 'FAIR'], J = [];
for (const m of ['houston', 'dfw']) for (let s = 1; s <= 5; s++) for (const [h, v] of CONF) for (const r of RULES) J.push([m, h, s, v, r]);
const run = j => { RULE = j[4]; try { return Object.assign({ part: 'c', rule: j[4] }, I2.one(j[0], j[1], j[2], j[3], 'cross', false)); } finally { RULE = 'FCFS'; } };
const keyOf = r => [r.metro, r.heights, r.seed, r.vol, r.rule];
if (process.argv[2] === 'checks') { let bad = 0; const ok = (n, c, i) => { console.log((c ? 'ok  ' : 'FAIL') + ' ' + n + (i !== undefined ? ' ' + JSON.stringify(i) : '')); if (!c) bad++; };
  const rd = d => fs.readdirSync(d).filter(f => f.endsWith('.jsonl')).flatMap(f => fs.readFileSync(path.join(d, f), 'utf8').split('\n').filter(Boolean).map(JSON.parse));
  const t = require('child_process').spawnSync('node', ['planned/test_prio.js'], { encoding: 'utf8' }); ok('K1 planned/test_prio.js passes', t.status === 0);
  const o = rd('out/intent2').find(x => x.part === 'c' && x.metro === 'houston' && x.heights === 'A2' && x.seed === 1 && x.vol === 'N2'), r = I2.one('houston', 'A2', 1, 'N2', 'cross', false);
  ok('K2 FCFS reproduces INTENT2 A2 N2 (Houston seed 1)', o && JSON.stringify(r.cost) === JSON.stringify(o.cost), [r.cost.all.delayed, o && o.cost.all.delayed]);
  const g = rd('out/gap1').find(x => x.part === 'c' && x.metro === 'dfw' && x.heights === 'G1' && x.seed === 1 && x.vol === 'V135'), rg = I2.one('dfw', 'G1', 1, 'V135', 'cross', false);
  ok('K3 FCFS reproduces GAP1 G1 V135 (DFW seed 1)', g && JSON.stringify(rg.cost) === JSON.stringify(g.cost), [rg.cost.all.delayed, g && g.cost.all.delayed]);
  RULE = 'BATCHT0'; const b = I2.one('dfw', 'G1', 1, 'V135', 'cross', false); RULE = 'FCFS';
  ok('K4 batch path in take-off order equals FCFS on a real run (DFW G1 V135 seed 1)', JSON.stringify(b.cost) === JSON.stringify(rg.cost), [b.cost.all.delayed, rg.cost.all.delayed]);
  console.log('jobs', J.length, bad ? bad + ' FAILED' : 'ALL PASS'); process.exit(bad ? 1 : 0); }
const k = +process.argv[2], n = +process.argv[3]; if (!(k >= 0 && n > 0)) { console.error('usage: checks | <shard> <n>'); process.exit(2); }
fs.mkdirSync('out/prio1', { recursive: true });
const done = new Set(); for (const f of fs.readdirSync('out/prio1').filter(f => f.endsWith('.jsonl'))) for (const l of fs.readFileSync('out/prio1/' + f, 'utf8').split('\n')) if (l.trim()) done.add(keyOf(JSON.parse(l)).join('|'));
for (const j of J.filter((_, i) => i % n === k)) { if (done.has(j.join('|'))) continue; const t = Date.now(), r = run(j); r.wall_s = (Date.now() - t) / 1000; fs.appendFileSync(`out/prio1/c_${k}.jsonl`, JSON.stringify(r) + '\n'); console.log(j.join(' '), r.wall_s); }
