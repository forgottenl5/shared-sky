'use strict';
// Test for recheck_rng_preload2.js: run with RECHECK_RNG=on via node -r ./planned/recheck_rng_preload2.js planned/test_recheck_rng_preload2.js
const L = require('../lab/lab_engine.js'), city = require('../lab/city.js').load('houston');
let bad = 0; const ok = (n, c) => { console.log((c ? 'ok  ' : 'FAIL') + ' ' + n); if (!c) bad++; };
const lcg = seed => { let s = (seed * 2654435761) >>> 0; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; };
const a = L.rng(12345)(), b = lcg(12345)();
ok('a call from this file (not an ERRORS runner) gets the original LCG', a === b);
const cfg = { half: 51000, zone: 34000, warm: 3600, meas: 7200 };
const S1 = city.sites(cfg, 1), S2 = city.sites(cfg, 1);
ok('site layout is deterministic under the wrapper', JSON.stringify(S1) === JSON.stringify(S2));
process.exit(bad ? 1 : 0);
