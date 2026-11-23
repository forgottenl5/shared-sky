'use strict';
// REALCOORD runner (planned/REALCOORD_PREREG.md). COORD1's one() loaded unchanged, with REALSITES full-stage sites and zones and 10 windy hours.
//   node planned/realcoord_run.js checks | <shard> <n>   -> out/realcoord/runs_<shard>.jsonl
const fs = require('fs'), path = require('path'), L = require('../lab/lab_engine.js'), RS = require('./realsites.js');
const src = fs.readFileSync(path.join(__dirname, 'coord1_run.js'), 'utf8'), cut = src.indexOf('const J = [];');
const body = src.slice(0, cut).replace('return W.bandHours(0.85, 0.95, 3);', 'return W.bandHours(0.85, 0.95, 10);');
if (body === src.slice(0, cut)) throw new Error('could not extend the hour list');
const M = {}; new Function('require', '__dirname', 'module', body + '\nmodule.exports = { one, W, MET, H };')(require, __dirname, M);
const { one, W, MET, H } = M.exports, KEY = { houston: 'hou', dfw: 'dfw' };
for (const m of ['houston', 'dfw']) { const z = RS.M[KEY[m]].zone; MET[m].cfg = { half: z + 17000, zone: z, warm: 3600, meas: 7200 }; MET[m].R = { sites: (cfg, seed) => RS.sites(cfg, seed, 'full', KEY[m]) }; }
const J = []; for (const m of ['houston', 'dfw']) for (const hk of ['A0', 'A2']) for (let s = 1; s <= 10; s++) for (const a of ['NONE', 'V2']) J.push([m, hk, s, a]);
if (process.argv[2] === 'checks') { let bad = 0; const ok = (n, c, i) => { console.log((c ? 'ok  ' : 'FAIL') + ' ' + n + (i !== undefined ? ' ' + JSON.stringify(i) : '')); if (!c) bad++; };
  const stored = fs.readdirSync('out/realsites').flatMap(f => fs.readFileSync('out/realsites/' + f, 'utf8').split('\n').filter(Boolean).map(JSON.parse));
  for (const m of ['houston', 'dfw']) { const cfg = MET[m].cfg, a = MET[m].R.sites(cfg, 1), b = RS.sites(cfg, 1, 'full', KEY[m]);
    ok(`K1 ${m} sites = REALSITES full seed 1`, JSON.stringify(a.map(s => [s.op, s.c])) === JSON.stringify(b.map(s => [s.op, s.c])), a.length);
    const fl = L.flights(cfg, a, 1, H.A0), c = L.count(cfg, fl, { sub: 4, tEnd: cfg.warm + cfg.meas }), v = c['wide|cross'] || 0, r = stored.find(x => x.metro === KEY[m] && x.stage === 'full' && x.arm === 'A0' && x.seed === 1);
    ok(`K2 ${m} still-air A0 seed 1 = REALSITES`, r && r.w === v, [v, r && r.w]);
    W.useFile(path.join(__dirname, '..', MET[m].wind)); ok(`K3 ${m} first three hours = COORD1`, JSON.stringify(W.bandHours(0.85, 0.95, 10).slice(0, 3)) === JSON.stringify(W.bandHours(0.85, 0.95, 3))); }
  console.log('jobs', J.length, bad ? bad + ' FAILED' : 'ALL PASS'); process.exit(bad ? 1 : 0); }
const k = +process.argv[2], n = +process.argv[3]; if (!(k >= 0 && n > 0)) { console.error('usage: checks | <shard> <n>'); process.exit(2); }
fs.mkdirSync('out/realcoord', { recursive: true });
const done = new Set(); for (const f of fs.readdirSync('out/realcoord')) for (const l of fs.readFileSync('out/realcoord/' + f, 'utf8').split('\n')) if (l.trim()) { const r = JSON.parse(l); done.add([r.metro, r.heights, r.seed, r.arm].join('|')); }
for (const j of J.filter((_, i) => i % n === k)) { if (done.has(j.join('|'))) continue; const t = Date.now(), r = one(...j); r.wall_s = (Date.now() - t) / 1000; fs.appendFileSync(`out/realcoord/runs_${k}.jsonl`, JSON.stringify(r) + '\n'); console.log(j.join(' '), r.wall_s); }
