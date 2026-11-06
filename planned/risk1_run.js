'use strict';
// RISK1 runner (registration planned/RISK1_PREREG.md).
//   node planned/risk1_run.js checks          pre-run checks K1-K3
//   node planned/risk1_run.js <shard> <n>     -> out/risk1/enc_<shard>.jsonl (one row per city, arm, seed: planned cross-company encounters with their CPA)
// Planned (error-free) flights, HEADLINE2 layouts and seeds, arms S1 (Amazon at best-sourced heights) and A2 (shared-out heights).
// Encounters: the first moment each cross-company pair comes within 30 m sideways and 170 m vertically (wide enough for the error levels in the
// analysis; 30 m sideways is the engine's neighbour search, so the largest error level is a lower bound, as registered). Probabilities: planned/risk1_analyze.py.
const fs = require('fs'), L = require('../lab/lab_engine.js'), CITY = require('../lab/city.js'), K = require('../lab/risk.js');
const H = { S1: { wing: [46, 91], aOut: 69, zip: 101, aIn: [85, 115] }, A2: { wing: [46, 71], aOut: 81, zip: 101, aIn: 115 } };
const RC = 30, HC = 170, SEEDS = 10;
function one(m, arm, seed) { const c = CITY.load(m), fl = L.flights(c.cfg, c.sites(c.cfg, seed), seed, H[arm]), enc = K.encounters(c.cfg, fl, RC, HC);
  const r = x => Math.round(x * 1000) / 1000;
  return { metro: m, arm, seed, flights: fl.length, flightHours: K.flightHours(c.cfg, fl), n: enc.length, noCPA: enc.filter(e => !e.cpa).length,
    enc: enc.filter(e => e.cpa).map(e => [e.opA, e.opB, r(e.cpa.dperp), r(e.cpa.dz), r(e.cpa.dh), r(e.cpa.vrel)]) }; }
const J = []; for (let s = 1; s <= SEEDS; s++) for (const m of ['houston', 'dfw']) for (const arm of ['S1', 'A2']) J.push([m, arm, s]);
if (process.argv[2] === 'checks') { let bad = 0; const ok = (n, c, i) => { console.log((c ? 'ok  ' : 'FAIL') + ' ' + n + (i !== undefined ? ' ' + JSON.stringify(i) : '')); if (!c) bad++; };
  const t = require('child_process').spawnSync('node', ['lab/risk.js', 'test'], { encoding: 'utf8' }); ok('K1 collision-risk unit tests (lab/risk.js test)', t.status === 0, (t.stdout.trim().split('\n').pop()));
  const HL = fs.readdirSync('out/headline2').flatMap(f => fs.readFileSync('out/headline2/' + f, 'utf8').split('\n').filter(Boolean).map(JSON.parse));
  const c = CITY.load('houston'), fl = L.flights(c.cfg, c.sites(c.cfg, 1), 1, H.S1), r = L.count(c.cfg, fl, { sub: 4, tEnd: c.cfg.warm + c.cfg.meas, th: [['v10', 30, 10]] }), h = HL.find(x => x.metro === 'houston' && x.arm === 'S1' && x.seed === 1);
  ok('K2 the current (faster) engine reproduces HEADLINE2 Houston S1 seed 1 v10', h && r['v10|cross'] === h.v10, [r['v10|cross'], h && h.v10]);
  const enc = K.encounters(c.cfg, fl, RC, HC);
  ok('K3 a CPA is found for at least 99 % of encounters (Houston S1 seed 1)', enc.length && enc.filter(e => e.cpa).length / enc.length >= 0.99, [enc.filter(e => e.cpa).length, enc.length]);
  console.log('jobs', J.length, bad ? bad + ' FAILED' : 'ALL PASS'); process.exit(bad ? 1 : 0); }
const k = +process.argv[2], n = +process.argv[3]; fs.mkdirSync('out/risk1', { recursive: true });
const done = new Set(); for (const f of fs.readdirSync('out/risk1')) for (const l of fs.readFileSync('out/risk1/' + f, 'utf8').split('\n')) if (l.trim()) { const r = JSON.parse(l); done.add([r.metro, r.arm, r.seed].join('|')); }
for (const j of J.filter((_, i) => i % n === k)) { if (done.has(j.join('|'))) continue; const t = Date.now(), r = one(...j); r.wall_s = (Date.now() - t) / 1000; fs.appendFileSync(`out/risk1/enc_${k}.jsonl`, JSON.stringify(r) + '\n'); console.log(j.join('|'), r.n, r.wall_s); }
