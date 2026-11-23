'use strict';
// CURVE1 runner (planned/CURVE1_PREREG.md). HEADLINE2's layouts, flights and heights, one count with a grid of separation rules.
//   node planned/curve1_run.js <shard> <n>   -> out/curve1/runs_<shard>.jsonl
const fs = require('fs'), path = require('path'), L = require('../lab/lab_engine.js');
const src = fs.readFileSync(path.join(__dirname, 'headline2_run.js'), 'utf8'), cut = src.indexOf('const cross =');
const M = {}; new Function('require', '__dirname', 'module', src.slice(0, cut) + '\nmodule.exports = { MET, H };')(require, __dirname, M);
const { MET, H } = M.exports, HZ = [20, 30, 40, 50], VT = [5, 7.5, 10, 12.5, 15, 20];
const TH = []; for (const h of HZ) for (const v of VT) TH.push([`h${h}v${v}`, h, v]);
function one(m, arm, seed) { const cfg = MET[m].cfg, S = MET[m].R.sites(cfg, seed), fl = L.flights(cfg, S, seed, H[arm]);
  const c = L.count(cfg, fl, { sub: 4, tEnd: cfg.warm + cfg.meas, th: TH, cell: 50 }), out = {}, pairs = {};
  for (const [nm] of TH) out[nm] = c[nm + '|cross'] || 0;
  for (const k in c) { const q = k.match(/^(h\d+v[\d.]+)\|pair\|(.+)$/); if (q && q[2].split('-')[0] !== q[2].split('-')[1]) (pairs[q[1]] = pairs[q[1]] || {})[q[2]] = c[k]; }
  return { metro: m, arm, seed, counts: out, pairs, flights: fl.length }; }
const J = []; for (const m of ['houston', 'dfw']) for (const arm of ['S1', 'A2']) for (let seed = 1; seed <= 10; seed++) J.push([m, arm, seed]);
const k = +process.argv[2], n = +process.argv[3]; if (!(k >= 0 && n > 0)) { console.error('usage: <shard> <n>'); process.exit(2); }
fs.mkdirSync('out/curve1', { recursive: true });
const done = new Set(); for (const f of fs.readdirSync('out/curve1')) for (const l of fs.readFileSync('out/curve1/' + f, 'utf8').split('\n')) if (l.trim()) { const r = JSON.parse(l); done.add([r.metro, r.arm, r.seed].join('|')); }
for (const j of J.filter((_, i) => i % n === k)) { if (done.has(j.join('|'))) continue; const t = Date.now(), r = one(...j); r.wall_s = (Date.now() - t) / 1000; fs.appendFileSync(`out/curve1/runs_${k}.jsonl`, JSON.stringify(r) + '\n'); console.log(j.join(' '), r.wall_s); }
