'use strict';
// RISK2 runner (registration planned/RISK2_PREREG.md): RISK1 with the plan-sharing check switched on.
//   node planned/risk2_run.js checks          pre-run checks K1-K2
//   node planned/risk2_run.js <shard> <n>     -> out/risk2/enc_<shard>.jsonl
// Still air, HEADLINE2 layouts, seeds 1-10, both metros, arms S1 / A2 heights x checks V2 / V3 (COORD1 volumes, planned/coord.js).
// The check runs on the planned flights; delayed flights fly their plan later, cancelled flights do not fly. Encounters and CPAs as RISK1
// (lab/risk.js); the no-check arm is RISK1 itself (out/risk1). Probabilities: planned/risk2_analyze.py.
const fs = require('fs'), L = require('../lab/lab_engine.js'), CITY = require('../lab/city.js'), K = require('../lab/risk.js'), C = require('./coord.js');
const H = { S1: { wing: [46, 91], aOut: 69, zip: 101, aIn: [85, 115] }, A2: { wing: [46, 71], aOut: 81, zip: 101, aIn: 115 } };
const RC = 30, HC = 170, SEEDS = 10;
function one(m, arm, chk, seed) { const c = CITY.load(m), cfg = c.cfg, fl = L.flights(cfg, c.sites(cfg, seed), seed, H[arm]);
  let flown = fl, n = 0, delayed = 0, canc = 0, sumD = 0;
  if (chk !== 'NONE') { const r = C.check(cfg, fl, C.VOL[chk]); flown = [];
    for (const f of fl) { const D = r.delays.has(f.id) ? r.delays.get(f.id) : 0; if (D !== null) flown.push(C.shift(f, D));
      if (!r.delays.has(f.id) || f.t0 < cfg.warm || f.t0 >= cfg.warm + cfg.meas) continue; n++; if (D === null) canc++; else if (D > 0) { delayed++; sumD += D; } } }
  const enc = K.encounters(cfg, flown, RC, HC), rd = x => Math.round(x * 1000) / 1000;
  return { metro: m, arm, check: chk, seed, flights: flown.length, flightHours: K.flightHours(cfg, flown), checked: n, delayed, cancelled: canc, meanD: delayed ? sumD / delayed : 0,
    n: enc.length, noCPA: enc.filter(e => !e.cpa).length, enc: enc.filter(e => e.cpa).map(e => [e.opA, e.opB, rd(e.cpa.dperp), rd(e.cpa.dz), rd(e.cpa.dh), rd(e.cpa.vrel)]) }; }
const J = []; for (let s = 1; s <= SEEDS; s++) for (const m of ['houston', 'dfw']) for (const arm of ['S1', 'A2']) for (const chk of ['V2', 'V3']) J.push([m, arm, chk, s]);
if (process.argv[2] === 'checks') { let bad = 0; const ok = (n, c, i) => { console.log((c ? 'ok  ' : 'FAIL') + ' ' + n + (i !== undefined ? ' ' + JSON.stringify(i) : '')); if (!c) bad++; };
  const t = require('child_process').spawnSync('node', ['lab/risk.js', 'test'], { encoding: 'utf8' }); ok('K1 collision-risk unit tests', t.status === 0, t.stdout.trim().split('\n').pop());
  const R1 = fs.readdirSync('out/risk1').flatMap(f => fs.readFileSync('out/risk1/' + f, 'utf8').split('\n').filter(Boolean).map(JSON.parse));
  const r = one('dfw', 'A2', 'NONE', 1), o = R1.find(x => x.metro === 'dfw' && x.arm === 'A2' && x.seed === 1);
  ok('K2 the no-check path reproduces RISK1 (DFW A2 seed 1: encounters and every CPA)', o && r.n === o.n && JSON.stringify(r.enc) === JSON.stringify(o.enc), [r.n, o && o.n]);
  console.log('jobs', J.length, bad ? bad + ' FAILED' : 'ALL PASS'); process.exit(bad ? 1 : 0); }
const k = +process.argv[2], n = +process.argv[3]; fs.mkdirSync('out/risk2', { recursive: true });
const done = new Set(); for (const f of fs.readdirSync('out/risk2')) for (const l of fs.readFileSync('out/risk2/' + f, 'utf8').split('\n')) if (l.trim()) { const r = JSON.parse(l); done.add([r.metro, r.arm, r.check, r.seed].join('|')); }
for (const j of J.filter((_, i) => i % n === k)) { if (done.has(j.join('|'))) continue; const t = Date.now(), r = one(...j); r.wall_s = (Date.now() - t) / 1000; fs.appendFileSync(`out/risk2/enc_${k}.jsonl`, JSON.stringify(r) + '\n'); console.log(j.join('|'), r.n, r.delayed, r.wall_s); }
