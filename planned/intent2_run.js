'use strict';
// INTENT2 runner (planned/INTENT2_PREREG.md). Cost part: INTENT1's one() with new volumes. Risk part: RISK2's method (still air) with planned/coordx.js.
//   node planned/intent2_run.js checks | <shard> <n>   -> out/intent2/{c,r}_<shard>.jsonl
const fs = require('fs'), path = require('path'), L = require('../lab/lab_engine.js'), CITY = require('../lab/city.js'), K = require('../lab/risk.js'), C = require('./coord.js'), X = require('./coordx.js');
const src = fs.readFileSync(path.join(__dirname, 'intent1_run.js'), 'utf8'), cut = src.indexOf('const J = [];');
const M0 = {}; new Function('require', '__dirname', 'module', src.slice(0, cut) + '\nmodule.exports = { one, H, BANDS };')(require, __dirname, M0);
const { one, H, BANDS } = M0.exports;
Object.assign(X.VOL, { N1: { w: 5, v: 5, h0: 10, g: 0.05 }, N2: { w: 10, v: 14, h0: 10, g: 0.05 }, N2B: { w: 40, v: 14, h0: 10, g: 0.05 } });
const RC = 30, HC = 170;
function risk(m, hk, vol, seed) { const c = CITY.load(m), cfg = c.cfg, fl = L.flights(cfg, c.sites(cfg, seed), seed, H[hk === 'FLEX' ? 'S1' : hk]);
  let flown = fl, n = 0, held = 0, moved = 0;
  if (vol !== 'NONE') { const r = X.check(cfg, fl, X.VOL[vol], { flex: hk === 'FLEX' ? BANDS : null }); flown = [];
    for (const f of fl) { const D = r.delays.has(f.id) ? r.delays.get(f.id) : 0; if (D !== null) flown.push(C.shift(X.moved(f, r.moves.get(f.id) || 0), D));
      if (!r.delays.has(f.id) || f.t0 < cfg.warm || f.t0 >= cfg.warm + cfg.meas) continue; n++; if (D === null || D > 0) held++; if (r.moves.get(f.id)) moved++; } }
  const enc = K.encounters(cfg, flown, RC, HC), rd = x => Math.round(x * 1000) / 1000;
  return { part: 'r', metro: m, arm: hk, check: vol, seed, flights: flown.length, flightHours: K.flightHours(cfg, flown), checked: n, held, moved, n: enc.length, enc: enc.filter(e => e.cpa).map(e => [e.opA, e.opB, rd(e.cpa.dperp), rd(e.cpa.dz), rd(e.cpa.dh), rd(e.cpa.vrel)]) }; }
const J = [];
for (const m of ['houston', 'dfw']) for (let s = 1; s <= 5; s++) for (const hk of ['A0', 'A2', 'M1', 'FLEX']) { for (const v of ['N1', 'N2', 'N2B']) { J.push(['c', m, hk, s, v]); J.push(['r', m, hk, v, s]); } J.push(['r', m, hk, 'NONE', s]); }
const run = j => j[0] === 'c' ? Object.assign({ part: 'c' }, one(j[1], j[2], j[3], j[4], 'cross', false)) : risk(j[1], j[2], j[3], j[4]);
const keyOf = r => r.part === 'c' ? ['c', r.metro, r.heights, r.seed, r.vol] : ['r', r.metro, r.arm, r.check, r.seed];
if (process.argv[2] === 'checks') { let bad = 0; const ok = (n, c, i) => { console.log((c ? 'ok  ' : 'FAIL') + ' ' + n + (i !== undefined ? ' ' + JSON.stringify(i) : '')); if (!c) bad++; };
  const rd = d => fs.readdirSync(d).flatMap(f => fs.readFileSync(path.join(d, f), 'utf8').split('\n').filter(Boolean).map(JSON.parse));
  const t1 = require('child_process').spawnSync('node', ['planned/test_coordx.js'], { encoding: 'utf8' }), I1 = rd('out/intent1'), o = I1.find(x => x.metro === 'houston' && x.heights === 'A2' && x.seed === 1 && x.vol === 'V2' && x.mode === 'cross' && x.sites === 'headline'), r = one('houston', 'A2', 1, 'V2', 'cross', false);
  ok('K1 coordx tests; cost runner reproduces INTENT1 A2 V2 seed 1 Houston', t1.status === 0 && o && r.cost.all.delayed === o.cost.all.delayed && r.cost.all.cancelled === o.cost.all.cancelled && r.checked === o.checked, [r.cost.all.delayed, o && o.cost.all.delayed]);
  const t2 = require('child_process').spawnSync('node', ['lab/risk.js', 'test'], { encoding: 'utf8' }), R1 = rd('out/risk1'), q = R1.find(x => x.metro === 'dfw' && x.arm === 'A2' && x.seed === 1), z = risk('dfw', 'A2', 'NONE', 1);
  ok('K2 risk tests; no-check path reproduces RISK1 (DFW A2 seed 1)', t2.status === 0 && q && z.n === q.n && JSON.stringify(z.enc) === JSON.stringify(q.enc), [z.n, q && q.n]);
  console.log('jobs', J.length, bad ? bad + ' FAILED' : 'ALL PASS'); process.exit(bad ? 1 : 0); }
const k = +process.argv[2], n = +process.argv[3]; if (!(k >= 0 && n > 0)) { console.error('usage: checks | <shard> <n>'); process.exit(2); }
fs.mkdirSync('out/intent2', { recursive: true });
const done = new Set(); for (const f of fs.readdirSync('out/intent2')) for (const l of fs.readFileSync('out/intent2/' + f, 'utf8').split('\n')) if (l.trim()) done.add(keyOf(JSON.parse(l)).join('|'));
for (const j of J.filter((_, i) => i % n === k)) { if (done.has(j.join('|'))) continue; const t = Date.now(), r = run(j); r.wall_s = (Date.now() - t) / 1000; fs.appendFileSync(`out/intent2/${j[0]}_${k}.jsonl`, JSON.stringify(r) + '\n'); console.log(j.join(' '), r.wall_s); }
