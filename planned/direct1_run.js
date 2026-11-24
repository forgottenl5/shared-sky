'use strict';
// DIRECT1 runner (planned/DIRECT1_PREREG.md). Cost: INTENT1's one() (patched only to relayer flights); risk: INTENT2's risk(); cut: LAYOUT1's u() - all with planned/direct.js.
//   node planned/direct1_run.js checks | <shard> <n>   -> out/direct1/{c,r,u}_<shard>.jsonl
const fs = require('fs'), path = require('path'), L = require('../lab/lab_engine.js'), D = require('./direct.js');
function load(file, cutAt, exp, patches) { let src = fs.readFileSync(path.join(__dirname, file), 'utf8'); src = src.slice(0, src.indexOf(cutAt));
  for (const [a, b] of patches || []) { const p = src.replace(a, b); if (p === src) throw new Error('patch failed in ' + file + ': ' + a.slice(0, 40)); src = p; }
  const M = {}; new Function('require', '__dirname', 'module', src + `\nmodule.exports = { ${exp} };`)(require, __dirname, M); return M.exports; }
const RL = { lay: null, split: {} };   // the layout in force for the next call (set by run())
global.__DIRECT1 = (fl, hk, m) => D.LAYOUTS[hk] ? fl.map(f => D.relayer(f, D.LAYOUTS[hk], RL.split[m])) : fl;
const base = hk => D.LAYOUTS[hk] ? 'A2' : hk;
const I1 = load('intent1_run.js', '\nconst J = [];', 'one, H', [["fl = L.flights(cfg, S, seed, H[hk === 'FLEX' ? 'S1' : hk]);", "fl = global.__DIRECT1(L.flights(cfg, S, seed, H[hk === 'FLEX' ? 'S1' : (global.__DIRECT1_BASE ? global.__DIRECT1_BASE(hk) : hk)]), hk, m);"]]);
global.__DIRECT1_BASE = base;
const I2 = load('intent2_run.js', '\nconst J = [];', 'risk', [["fl = L.flights(cfg, c.sites(cfg, seed), seed, H[hk === 'FLEX' ? 'S1' : hk]);", "fl = global.__DIRECT1(L.flights(cfg, c.sites(cfg, seed), seed, H[hk === 'FLEX' ? 'S1' : global.__DIRECT1_BASE(hk)]), hk, m);"]]);
const LY = load('layout1_run.js', '\nconst J = [];', 'u, HL', [["fl = L.flights(cfg, S, seed, HL.H[arm]),", "fl = global.__DIRECT1(L.flights(cfg, S, seed, HL.H[global.__DIRECT1_BASE(arm)]), arm, m),"]]);
// median Wing / Amazon cruise leg per metro (seed 1, shared-out base heights), fixed before any run
for (const m of ['houston', 'dfw']) { const cfg = LY.HL.MET[m].cfg; RL.split[m] = D.medianLeg(L.flights(cfg, LY.HL.MET[m].R.sites(cfg, 1), 1, LY.HL.H.A2)); }
const NEW = ['D2', 'D4', 'DD'], J = [];
for (const m of ['houston', 'dfw']) for (let s = 1; s <= 5; s++) for (const hk of NEW) { J.push(['u', m, hk, s]); for (const v of ['N1', 'N2']) { J.push(['c', m, hk, s, v]); J.push(['r', m, hk, v, s]); } J.push(['r', m, hk, 'NONE', s]); }
function run(j) { const [p, m, hk] = j; let r;
  if (p === 'u') r = LY.u(m, hk, j[3]); else if (p === 'c') r = Object.assign({ part: 'c' }, I1.one(m, hk, j[3], j[4], 'cross', false)); else r = I2.risk(m, hk, j[3], j[4]);
  r.split = RL.split[m]; return r; }
const keyOf = r => r.part === 'u' ? ['u', r.metro, r.arm, r.seed] : r.part === 'c' ? ['c', r.metro, r.heights, r.seed, r.vol] : ['r', r.metro, r.arm, r.check, r.seed];
if (process.argv[2] === 'checks') { let bad = 0; const ok = (n, c, i) => { console.log((c ? 'ok  ' : 'FAIL') + ' ' + n + (i !== undefined ? ' ' + JSON.stringify(i) : '')); if (!c) bad++; };
  const rd = d => fs.readdirSync(d).flatMap(f => fs.readFileSync(path.join(d, f), 'utf8').split('\n').filter(Boolean).map(JSON.parse));
  ok('K1 planned/test_direct.js', require('child_process').spawnSync('node', ['planned/test_direct.js']).status === 0);
  const I2s = rd('out/intent2'), oc = I2s.find(x => x.part === 'c' && x.metro === 'houston' && x.heights === 'A2' && x.seed === 1 && x.vol === 'N2'), c = I1.one('houston', 'A2', 1, 'N2', 'cross', false);
  ok('K2a patched cost runner reproduces INTENT2 A2 N2 seed 1 Houston', oc && c.cost.all.delayed === oc.cost.all.delayed && c.checked === oc.checked, [c.cost.all.delayed, oc && oc.cost.all.delayed]);
  const orr = I2s.find(x => x.part === 'r' && x.metro === 'dfw' && x.arm === 'A2' && x.check === 'N2' && x.seed === 1), r = I2.risk('dfw', 'A2', 'N2', 1);
  ok('K2b patched risk runner reproduces INTENT2 A2 N2 seed 1 DFW (encounters)', orr && r.n === orr.n && JSON.stringify(r.enc) === JSON.stringify(orr.enc), [r.n, orr && orr.n]);
  const C1 = rd('out/curve1'), ou = C1.find(x => x.metro === 'dfw' && x.arm === 'A2' && x.seed === 1), u = LY.u('dfw', 'A2', 1);
  ok('K2c patched cut runner reproduces CURVE1 A2 seed 1 DFW (30 m / 10 m)', ou && u.counts.h30v10 === ou.counts.h30v10, [u.counts.h30v10, ou && ou.counts.h30v10]);
  console.log('median legs (m)', JSON.stringify(RL.split), 'jobs', J.length, bad ? bad + ' FAILED' : 'ALL PASS'); process.exit(bad ? 1 : 0); }
const k = +process.argv[2], n = +process.argv[3]; if (!(k >= 0 && n > 0)) { console.error('usage: checks | <shard> <n>'); process.exit(2); }
fs.mkdirSync('out/direct1', { recursive: true });
const done = new Set(); for (const f of fs.readdirSync('out/direct1')) for (const l of fs.readFileSync('out/direct1/' + f, 'utf8').split('\n')) if (l.trim()) done.add(keyOf(JSON.parse(l)).join('|'));
for (const j of J.filter((_, i) => i % n === k)) { if (done.has(j.join('|'))) continue; const t = Date.now(), r = run(j); r.wall_s = (Date.now() - t) / 1000; fs.appendFileSync(`out/direct1/${j[0]}_${k}.jsonl`, JSON.stringify(r) + '\n'); console.log(j.join(' '), r.wall_s); }
