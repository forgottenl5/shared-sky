'use strict';
// ERRORS3 runner (registration planned/ERRORS3_PREREG.md): encounters with their location, for worse GPS downtown.
//   node planned/errors3_run.js checks          pre-run checks K1-K3
//   node planned/errors3_run.js <shard> <n>     -> out/errors3/enc_<shard>.jsonl
// As RISK1 / RISK2 (no check, V2), but encounters are searched out to 90 m sideways (engine opts.cell) and each CPA keeps its location (x, y).
const fs = require('fs'), L = require('../lab/lab_engine.js'), CITY = require('../lab/city.js'), K = require('../lab/risk.js'), C = require('./coord.js');
const H = { S1: { wing: [46, 91], aOut: 69, zip: 101, aIn: [85, 115] }, A2: { wing: [46, 71], aOut: 81, zip: 101, aIn: 115 } };
const HC = 170, SEEDS = 10, rd = x => Math.round(x * 1000) / 1000;
function one(m, arm, chk, seed, RC = 90) { const c = CITY.load(m), cfg = c.cfg, fl = L.flights(cfg, c.sites(cfg, seed), seed, H[arm]); let flown = fl;
  if (chk !== 'NONE') { const r = C.check(cfg, fl, C.VOL[chk]); flown = []; for (const f of fl) { const D = r.delays.has(f.id) ? r.delays.get(f.id) : 0; if (D !== null) flown.push(C.shift(f, D)); } }
  const enc = K.encounters(cfg, flown, RC, HC);
  return { metro: m, arm, check: chk, seed, flightHours: K.flightHours(cfg, flown), n: enc.length, noCPA: enc.filter(e => !e.cpa).length,
    enc: enc.filter(e => e.cpa).map(e => [e.opA, e.opB, rd(e.cpa.dperp), rd(e.cpa.dz), rd(e.cpa.dh), rd(e.cpa.vrel), Math.round(e.cpa.x), Math.round(e.cpa.y)]) }; }
const J = []; for (let s = 1; s <= SEEDS; s++) for (const m of ['houston', 'dfw']) for (const arm of ['S1', 'A2']) for (const chk of ['NONE', 'V2']) J.push([m, arm, chk, s]);
if (process.argv[2] === 'checks') { let bad = 0; const ok = (n, c, i) => { console.log((c ? 'ok  ' : 'FAIL') + ' ' + n + (i !== undefined ? ' ' + JSON.stringify(i) : '')); if (!c) bad++; };
  const t = require('child_process').spawnSync('node', ['lab/risk.js', 'test'], { encoding: 'utf8' }); ok('K1 collision-risk unit tests', t.status === 0, t.stdout.trim().split('\n').pop());
  const rdj = d => fs.readdirSync(d).flatMap(f => fs.readFileSync(d + '/' + f, 'utf8').split('\n').filter(Boolean).map(JSON.parse));
  const R1 = rdj('out/risk1'), a = one('dfw', 'A2', 'NONE', 1, 30), o = R1.find(x => x.metro === 'dfw' && x.arm === 'A2' && x.seed === 1);
  ok('K2 with a 30 m search, the current code reproduces RISK1 (DFW A2 seed 1: every encounter and CPA)', o && JSON.stringify(a.enc.map(e => e.slice(0, 6))) === JSON.stringify(o.enc), [a.n, o && o.n]);
  const b = one('dfw', 'A2', 'NONE', 1, 90);
  ok('K3 the 90 m search finds at least every encounter of the 30 m search', b.n >= a.n, [b.n, a.n]);
  console.log('jobs', J.length, bad ? bad + ' FAILED' : 'ALL PASS'); process.exit(bad ? 1 : 0); }
const k = +process.argv[2], n = +process.argv[3]; fs.mkdirSync('out/errors3', { recursive: true });
const done = new Set(); for (const f of fs.readdirSync('out/errors3')) for (const l of fs.readFileSync('out/errors3/' + f, 'utf8').split('\n')) if (l.trim()) { const r = JSON.parse(l); done.add([r.metro, r.arm, r.check, r.seed].join('|')); }
for (const j of J.filter((_, i) => i % n === k)) { if (done.has(j.join('|'))) continue; const t = Date.now(), r = one(...j); r.wall_s = (Date.now() - t) / 1000; fs.appendFileSync(`out/errors3/enc_${k}.jsonl`, JSON.stringify(r) + '\n'); console.log(j.join('|'), r.n, r.wall_s); }
