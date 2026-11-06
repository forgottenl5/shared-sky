'use strict';
// Runner for REALSITES_PREREG.md. node planned/realsites_run.js checks | <shard> <n>
const fs = require('fs'), L = require('../lab/lab_engine.js'), RS = require('./realsites.js');
const H = { A0: { wing: [46, 91], aOut: 61, zip: 101, aIn: 105 }, S1: { wing: [46, 91], aOut: 69, zip: 101, aIn: [85, 115] }, A2: { wing: [46, 71], aOut: 81, zip: 101, aIn: 115 } };
function one(metro, stage, arm, seed) { const z = RS.M[metro].zone, cfg = { half: z + 17000, zone: z, warm: 3600, meas: 7200 }, S = RS.sites(cfg, seed, stage, metro), fl = L.flights(cfg, S, seed, H[arm]), c = L.count(cfg, fl, { sub: 4, tEnd: cfg.warm + cfg.meas }), pairs = {};
  for (const k in c) { const m = k.match(/^wide\|pair\|(.+)$/); if (m && m[1].split('-')[0] !== m[1].split('-')[1]) pairs[m[1]] = c[k]; }
  return { metro, stage, arm, seed, sites: { wing: S.filter(s => s.op === 'wing').length, zipline: S.filter(s => s.op === 'zipline').length, amazon: S.filter(s => s.op === 'amazon').length, real: S.filter(s => s.real !== 'random').length }, w: c['wide|cross'] || 0, c: c['close|cross'] || 0, pairs, flights: fl.length }; }
const J = []; for (const [metro, sts] of [['hou', ['today', 'early', 'mid', 'full']], ['dfw', ['early', 'mid', 'full']]]) for (const stage of sts) for (const arm of ['A0', 'S1', 'A2']) for (const seed of [1, 2, 3]) J.push([metro, stage, arm, seed]);
if (process.argv[2] === 'checks') { let ok = true; for (const metro of ['hou', 'dfw']) { const z = RS.M[metro].zone, cfg = { zone: z }; for (const st of Object.keys(RS.M[metro].stages)) { const S = RS.sites(cfg, 1, st, metro), want = RS.M[metro].stages[st];
    const good = ['wing', 'zipline', 'amazon'].every(op => S.filter(s => s.op === op).length === want[op]) && S.every(s => Math.abs(s.c[0]) <= z && Math.abs(s.c[1]) <= z); if (!good) ok = false; }
  const a = RS.sites(cfg, 1, 'early', metro), b = RS.sites(cfg, 1, 'full', metro); if (!a.every(s => b.some(t => t.op === s.op && Math.hypot(t.c[0] - s.c[0], t.c[1] - s.c[1]) < 1e-6))) ok = false; }
  console.log('K1 counts per stage, all in zone, stages nest (both metros):', ok, '| jobs', J.length, ok ? 'PASS' : 'FAIL'); }
else { const k = +process.argv[2], n = +process.argv[3]; fs.mkdirSync('out/realsites', { recursive: true }); for (const j of J.filter((_, i) => i % n === k)) fs.appendFileSync(`out/realsites/runs_${k}.jsonl`, JSON.stringify(one(...j)) + '\n'); }
