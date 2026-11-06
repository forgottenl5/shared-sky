'use strict';
// RECOUNT1 runner (registration planned/RECOUNT1_PREREG.md): OUTAGE's area-outage arms recounted with houston2.js count(fin, { sub }).
//   node planned/recount1_run.js <sub> <seed0> <seed1>    writes out/recount1_sub<sub>_<seed0>-<seed1>.json
const fs = require('fs'), path = require('path'), O = require('./outage.js'), H2 = require('./houston2.js');
const [sub, s0, s1] = process.argv.slice(2).map(Number), rows = [];
for (let seed = s0; seed <= s1; seed++) for (const arm of ['OUT-A0', 'OUT-A2']) {
  const ev = O.events(seed), log = [], fin = O.applyOutages(O.accepted(seed, arm === 'OUT-A0'), ev, log), c = H2.count(fin, { sub });
  rows.push({ arm, seed, sub, holds: log.length, cross_wide: c['wide|cross'] || 0, cross_close: c['close|cross'] || 0 }); console.error(arm, seed, sub, log.length, c['wide|cross'] || 0); }
const od = path.join(__dirname, '..', 'out'); fs.mkdirSync(od, { recursive: true }); fs.writeFileSync(path.join(od, `recount1_sub${sub}_${s0}-${s1}.json`), JSON.stringify(rows));
