'use strict';
// WX2 runner (registration planned/WX2_PREREG.md): traffic after weather stops.
//   node planned/wx2_run.js checks          pre-run checks K1-K2
//   node planned/wx2_run.js <shard> <n>     -> out/wx2/runs_<shard>.jsonl
// HEADLINE2 layouts, still air, seeds 1-6, both metros, arms S1 / A2, traffic multiplier M = 1, 1.5, 2 (every site's flight rate x M).
// Per run: planned cross-company conflicts (v10 etc., as HEADLINE2) and the V2 plan check's delayed and cancelled shares.
const fs = require('fs'), L = require('../lab/lab_engine.js'), CITY = require('../lab/city.js'), C = require('./coord.js');
const H = { S1: { wing: [46, 91], aOut: 69, zip: 101, aIn: [85, 115] }, A2: { wing: [46, 71], aOut: 81, zip: 101, aIn: 115 } };
const TH = [['v10', 30, 10], ['v15', 30, 15], ['v20', 30, 20], ['close', 15, 5]], MS = [1, 1.5, 2], SEEDS = 6;
function one(m, arm, M, seed, withCheck = true) { const c = CITY.load(m), cfg = c.cfg, S = c.sites(cfg, seed).map(s => Object.assign({}, s, { rate: (s.rate || L.OP[s.op].rate) * M }));
  const fl = L.flights(cfg, S, seed, H[arm]), r = L.count(cfg, fl, { sub: 4, tEnd: cfg.warm + cfg.meas, th: TH }), out = { metro: m, arm, M, seed, flights: fl.length };
  for (const t of TH) out[t[0]] = r[t[0] + '|cross'] || 0;
  if (withCheck) { const k = C.check(cfg, fl, C.VOL.V2); let n = 0, d = 0, x = 0, sd = 0;
    for (const f of fl) { if (!k.delays.has(f.id) || f.t0 < cfg.warm || f.t0 >= cfg.warm + cfg.meas) continue; const D = k.delays.get(f.id); n++; if (D === null) x++; else if (D > 0) { d++; sd += D; } }
    Object.assign(out, { checked: n, delayed: d, cancelled: x, meanD: d ? sd / d : 0 }); }
  return out; }
const J = []; for (let s = 1; s <= SEEDS; s++) for (const m of ['houston', 'dfw']) for (const arm of ['S1', 'A2']) for (const M of MS) J.push([m, arm, M, s]);
if (process.argv[2] === 'checks') { let bad = 0; const ok = (n, c, i) => { console.log((c ? 'ok  ' : 'FAIL') + ' ' + n + (i !== undefined ? ' ' + JSON.stringify(i) : '')); if (!c) bad++; };
  const HL = fs.readdirSync('out/headline2').flatMap(f => fs.readFileSync('out/headline2/' + f, 'utf8').split('\n').filter(Boolean).map(JSON.parse));
  for (const [m, arm] of [['houston', 'S1'], ['dfw', 'A2']]) { const r = one(m, arm, 1, 1, false), h = HL.find(x => x.metro === m && x.arm === arm && x.seed === 1);
    ok(`K1 ${m} ${arm} seed 1 at M = 1 reproduces HEADLINE2 (v10, v15, v20, close)`, h && ['v10', 'v15', 'v20', 'close'].every(k => r[k] === h[k]), [[r.v10, r.v15, r.v20, r.close], h && [h.v10, h.v15, h.v20, h.close]]); }
  { const c = CITY.load('houston'), a = L.flights(c.cfg, c.sites(c.cfg, 1), 1, H.A2).length, b = L.flights(c.cfg, c.sites(c.cfg, 1).map(s => Object.assign({}, s, { rate: (s.rate || L.OP[s.op].rate) * 2 })), 1, H.A2).length;
    ok('K2 doubling every site rate gives 1.9-2.1 times the flights (Houston A2 seed 1)', b / a > 1.9 && b / a < 2.1, [a, b, (b / a).toFixed(3)]); }
  console.log('jobs', J.length, bad ? bad + ' FAILED' : 'ALL PASS'); process.exit(bad ? 1 : 0); }
const k = +process.argv[2], n = +process.argv[3]; fs.mkdirSync('out/wx2', { recursive: true });
const done = new Set(); for (const f of fs.readdirSync('out/wx2')) for (const l of fs.readFileSync('out/wx2/' + f, 'utf8').split('\n')) if (l.trim()) { const r = JSON.parse(l); done.add([r.metro, r.arm, r.M, r.seed].join('|')); }
for (const j of J.filter((_, i) => i % n === k)) { if (done.has(j.join('|'))) continue; const t = Date.now(), r = one(...j); r.wall_s = (Date.now() - t) / 1000; fs.appendFileSync(`out/wx2/runs_${k}.jsonl`, JSON.stringify(r) + '\n'); console.log(j.join('|'), r.v10, r.wall_s); }
