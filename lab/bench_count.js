'use strict';
// Benchmark and equality check for count(): old engine file vs current, same job.  node lab/bench_count.js <old_engine.js> [city] [seed]
// Counts must be identical; prints both wall times.
const path = require('path'), NEW = require('./lab_engine.js'), OLD = require(path.resolve(process.argv[2])), E = require('./errors.js'), c = require('./city.js').load(process.argv[3] || 'houston');
const seed = +process.argv[4] || 1, H = { wing: [46, 91], aOut: 61, zip: 101, aIn: 105 }, TH = [['v10', 30, 10], ['v15', 30, 15], ['v20', 30, 20], ['close', 15, 5]];
let bad = 0;
for (const spec of [{ level: 'L0' }, { level: 'L2' }]) { const X = E.build(spec, seed), res = [];
  for (const [nm, Lx] of [['old', OLD], ['new', NEW]]) { const fl = Lx.flights(c.cfg, c.sites(c.cfg, seed), seed, H), t = Date.now();
    const r = Lx.count(c.cfg, fl, { sub: 4, tEnd: c.cfg.warm + c.cfg.meas, th: TH, zerr: X.zerr, herr: X.herr }); res.push([nm, (Date.now() - t) / 1000, JSON.stringify(Object.keys(r).sort().map(k => [k, r[k]]))]); }
  const same = res[0][2] === res[1][2]; if (!same) bad++;
  console.log(`${c.name} seed ${seed} ${spec.level}: old ${res[0][1]} s, new ${res[1][1]} s, x${(res[0][1] / res[1][1]).toFixed(2)}, counts ${same ? 'identical' : 'DIFFERENT'}`); }
process.exit(bad ? 1 : 0);
