'use strict';
// Runner for AMZBAND_PREREG.md. node planned/amzband_run.js checks | run
const fs = require('fs'), L = require('../lab/lab_engine.js');
const cfg = { half: 22000, zone: 6000, warm: 3600, meas: 7200 }, T = { wing: [46, 91], aOut: [55, 115], zip: 101, aIn: [55, 115] };
const base = { wingFixed: null, fleet: 'filed', check: false, cell: 30, tb: 5, vsep: 10, contingency: 'none', frac: 0.2, sub: 4 };
if (process.argv[2] === 'checks') { const S = L.sites(cfg, 4, 1), fl = L.flights(cfg, S, 1, T).filter(f => f.op === 'amazon'); let bad = 0, same = 0, n = 0;
  for (const f of fl) { const cr = f.sg.filter(s => s[4] > 20 && s[4] === s[7]).map(s => s[4]); if (!cr.length) continue; n++; if (cr.some(z => z < 55 - 1e-6 || z > 115 + 1e-6)) bad++; if (Math.max(...cr) - Math.min(...cr) < 1e-6) same++; }
  console.log('K1 amazon flights', n, 'out of band', bad, 'with equal legs', same, bad === 0 && same < n ? 'PASS' : 'FAIL'); }
else { fs.mkdirSync('out/amzband', { recursive: true }); for (const d of [3, 4]) for (const seed of [1, 2, 3]) { const r = L.run(cfg, Object.assign({}, base, { d, seed, heights: T }));
  const o = { arm: 'T', d, seed, cross_wide: r.cross_wide, cross_close: r.cross_close, pairs: r.pairs }; fs.appendFileSync('out/amzband/runs.jsonl', JSON.stringify(o) + '\n'); console.log(JSON.stringify(o)); } }
