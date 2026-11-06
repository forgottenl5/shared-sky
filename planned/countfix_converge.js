'use strict';
// COUNTFIX K2: convergence of close cross-operator meetings vs checks per second (VALLOC A0, d = 3, seeds 1-3).
const V = require('./valloc.js'), H2 = require('./houston2.js'), fs = require('fs');
const out = {}; for (const sub of [1, 2, 4, 8, 16]) { let w = 0, c = 0, t0 = Date.now(); for (const s of [1, 2, 3]) { const fl = V.flights(H2.sites(3, s), s, V.ARMS.A0), r = H2.count(fl, { sub }); w += r['wide|cross'] || 0; c += r['close|cross'] || 0; }
  out[sub] = { wide: w, close: c, wall_s: (Date.now() - t0) / 1000 }; console.log('sub', sub, 'wide', w, 'close', c, out[sub].wall_s + 's'); }
let chosen = 16; for (const s of [2, 4, 8]) if (Math.abs(out[2 * s].close / out[s].close - 1) < 0.03) { chosen = s; break; }
out.chosen = chosen; console.log('chosen sub', chosen); fs.writeFileSync(__dirname + '/countfix_converge.json', JSON.stringify(out, null, 1));
