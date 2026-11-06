'use strict';
// DEVA0_PREREG.md: DEVIATE's deviations on traffic with the filed (A0) heights.
const fs = require('fs'), path = require('path'), H2 = require('./houston2.js'), V = require('./valloc.js'), VO = require('./vol.js'), DV = require('./deviate.js');
function run(arm, d, seed) { const S = H2.sites(d, seed), fl = V.flights(S, seed, V.ARMS.A0), dev = DV.draws(fl, seed), type = arm === 'F-BASE' ? null : arm.slice(2);
  const { delays, cancelled } = VO.intentCheck(fl, 30, 5, 10), fin = DV.finalTracks(fl, delays, dev, type), c = H2.count(fin), pos = [...delays.values()].filter(x => x > 0);
  return { r: { arm, d, seed, deviations: type ? dev.size : 0, cross_wide: c['wide|cross'] || 0, cross_close: c['close|cross'] || 0, same_wide: c['wide|same'] || 0, delayed: pos.length, total_delay_s: pos.reduce((a, b) => a + b, 0), cancelled, checked: delays.size }, fl, dev }; }
module.exports = { run };
if (require.main === module) { const [arm, d, seed] = process.argv.slice(2), { r } = run(arm, +d, +seed), od = path.join(__dirname, '..', 'out', 'deva0'); fs.mkdirSync(od, { recursive: true }); fs.writeFileSync(path.join(od, `${arm}_d${d}_${seed}.json`), JSON.stringify(r)); console.log(JSON.stringify(r)); }
