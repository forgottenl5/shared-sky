'use strict';
// RECHECK_B (planned/RECHECK_B_PREREG.md): load before the unchanged ERRORS1 / ERRORS2 runners.
//   RECHECK_RNG=on   L.rng(s) returns L.hrng(s, 0x5eed): an independent sfc32 stream per integer seed, instead of the LCG whose
//                    streams for neighbouring seeds are correlated (|r| up to 0.76 between neighbouring flight ids, lab/test_fixes.js)
//   RECHECK_RNG=off  wrapper present, nothing changed (check K1)
// In these runners L.rng is used only for the per-flight error draws and the shared error field; the engine's own layout and
// traffic draws use its internal generator and are not touched, so layouts and flights are the same as in the original runs.
// The runners' seed formula (seed * 7919 + id * 31 + k) has no repeats for the seeds these studies use (1-6: a repeat needs a
// seed gap that is a multiple of 31), so hashing the combined integer is enough here.
const L = require('../lab/lab_engine.js');
const mode = process.env.RECHECK_RNG;
if (mode !== 'on' && mode !== 'off') throw new Error('set RECHECK_RNG=on or off');
if (mode === 'on') { const hr = L.hrng; L.rng = s => hr(s, 0x5eed); }
