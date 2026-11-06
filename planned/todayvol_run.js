'use strict';
// Runner for TODAYVOL_PREREG.md. node planned/todayvol_run.js checks | <shard> <n>   (METRO=dfw|houston via env, or both by default)
const fs = require('fs'), L = require('../lab/lab_engine.js');
const MET = {
  houston: { B: require('./buildout.js'), cfg: { half: 42000 + 17000, zone: 42000, warm: 3600, meas: 7200 } },
  dfw: { B: require('./dfwbuild.js'), cfg: { half: 40000 + 17000, zone: 40000, warm: 3600, meas: 7200 } } };
const H = { A0: { wing: [46, 91], aOut: 61, zip: 101, aIn: 105 }, R: { wing: [46, 91], aOut: 69, zip: 101, aIn: 122 }, A2: { wing: [46, 71], aOut: 81, zip: 101, aIn: 115 } };
function sites(m, seed, stage, vol) { const S = MET[m].B.sites(MET[m].cfg, seed, stage); if (vol === 'v20') for (const s of S) if (s.op === 'amazon') s.rate *= 0.2; return S; }
function cnt(cfg, fl) { const c = L.count(cfg, fl, { sub: 4, tEnd: cfg.warm + cfg.meas }), pairs = {}; for (const k in c) { const q = k.match(/^wide\|pair\|(.+)$/); if (q && q[1].split('-')[0] !== q[1].split('-')[1]) pairs[q[1]] = c[k]; } return { w: c['wide|cross'] || 0, c: c['close|cross'] || 0, pairs }; }
function one(m, stage, arm, vol, seed) { const cfg = MET[m].cfg, S = sites(m, seed, stage, vol), fl = L.flights(cfg, S, seed, H[arm]);
  return { metro: m, stage, arm, vol, seed, sites: { wing: S.filter(s => s.op === 'wing').length, zipline: S.filter(s => s.op === 'zipline').length, amazon: S.filter(s => s.op === 'amazon').length }, flights: fl.length, ...cnt(cfg, fl) }; }
const J = []; for (const m of (process.env.METRO ? [process.env.METRO] : ['dfw', 'houston'])) for (const stage of ['early', 'mid', 'full']) for (const arm of ['A0', 'R', 'A2']) for (const vol of ['cap', 'v20']) for (const seed of [1, 2, 3, 4, 5, 6]) J.push([m, stage, arm, vol, seed]);
if (process.argv[2] === 'checks') { let ok = true;
  for (const m of Object.keys(MET)) { const want = MET[m].B.STAGES;
    for (const st of ['early', 'mid', 'full']) { const a = sites(m, 1, st, 'cap'), b = sites(m, 1, st, 'v20'), n = (S, o) => S.filter(s => s.op === o).length;
      const cntOk = ['wing', 'zipline', 'amazon'].every(o => n(a, o) === want[st][o]);
      const rateOk = a.every((s, i) => s.op === 'amazon' ? Math.abs(b[i].rate - 0.2 * s.rate) < 1e-9 : b[i].rate === s.rate);
      console.log('K1', m, st, 'counts', cntOk ? 'ok' : 'BAD', 'rates', rateOk ? 'ok' : 'BAD'); ok = ok && cntOk && rateOk; }
    const cfg = MET[m].cfg, fa = L.flights(cfg, sites(m, 1, 'mid', 'cap'), 1, H.A0), fb = L.flights(cfg, sites(m, 1, 'mid', 'v20'), 1, H.A0), key = x => JSON.stringify(x.filter(f => f.op !== 'amazon').map(f => [f.id, f.t0, f.end]));
    console.log('K2', m, 'wing/zipline flights identical cap vs v20 (info):', key(fa) === key(fb) ? 'yes' : 'NO (ids may be renumbered; see log)'); }
  console.log('jobs', J.length, ok ? 'K1 PASS' : 'K1 FAIL'); }
else { const k = +process.argv[2], n = +process.argv[3]; fs.mkdirSync('out/todayvol', { recursive: true });
  for (const j of J.filter((_, i) => i % n === k)) { const t = Date.now(), r = one(...j); r.wall_s = (Date.now() - t) / 1000; fs.appendFileSync(`out/todayvol/runs_${k}.jsonl`, JSON.stringify(r) + '\n'); } }
