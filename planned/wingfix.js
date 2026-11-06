'use strict';
// WINGFIX_PREREG.md. usage: node planned/wingfix.js ARM D SEED   ARM = A0-46 | A0-61 | A0-76 | A0-U | A2-46 | A2-61 | A2-76 | A2-U
const fs = require('fs'), path = require('path'), H2 = require('./houston2.js'), V = require('./valloc.js');
function armObj(arm) { const [h, l] = arm.split('-'), base = V.ARMS[h], w = l === 'U' ? base.wing : (h === 'A2' ? [Math.min(+l, 71), Math.min(+l, 71)] : [+l, +l]); return Object.assign({}, base, { wing: w }); }
function run(arm, d, seed) { const fl = V.flights(H2.sites(d, seed), seed, armObj(arm)), c = H2.count(fl, { sub: 4 }), pairs = {};
  for (const k of Object.keys(c)) { const m = k.match(/^(wide|close)\|pair\|([a-z]+-[a-z]+)$/); if (m) pairs[m[1] + '|' + m[2]] = c[k]; }
  return { r: { arm, d, seed, cross_wide: c['wide|cross'] || 0, cross_close: c['close|cross'] || 0, same_wide: c['wide|same'] || 0, pairs }, fl }; }
module.exports = { run, armObj };
if (require.main === module) { const [arm, d, seed] = process.argv.slice(2), t0 = Date.now(), { r } = run(arm, +d, +seed); r.wall_s = (Date.now() - t0) / 1000; const od = path.join(__dirname, '..', 'out', 'wingfix'); fs.mkdirSync(od, { recursive: true }); fs.writeFileSync(path.join(od, `${arm}_d${d}_${seed}.json`), JSON.stringify(r)); console.log(JSON.stringify(r)); }
