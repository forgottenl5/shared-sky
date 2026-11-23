'use strict';
// RECHECK_B2 (planned/RECHECK_B2_PREREG.md): corrected version of recheck_rng_preload.js. Load before the unchanged ERRORS1 / ERRORS2 runners.
// RECHECK_B found (check K3) that lab/city.js sites() also calls L.rng, so replacing L.rng everywhere changed the site layouts as well as the
// error draws. Here the replacement applies only when L.rng is called from the ERRORS runners themselves (their errs() and field()), which is
// where the per-flight error draws and the shared error field are made. Every other caller (site layouts, anything in lab/ or other modules)
// gets the original LCG, so layouts, flights and the plan check are the same as in the original runs.
//   RECHECK_RNG=on   calls from errors1_run.js / errors2_run.js: L.hrng(s, 0x5eed); all other callers: unchanged
//   RECHECK_RNG=off  wrapper present, nothing changed
const L = require('../lab/lab_engine.js');
const mode = process.env.RECHECK_RNG;
if (mode !== 'on' && mode !== 'off') throw new Error('set RECHECK_RNG=on or off');
const rng0 = L.rng, hr = L.hrng, MINE = /[\\/]errors[12]_run\.js:/;
const caller = () => { const s = new Error().stack.split('\n'); return s[3] || ''; };   // [0] Error, [1] caller(), [2] L.rng wrapper, [3] who called L.rng
L.rng = s => mode === 'on' && MINE.test(caller()) ? hr(s, 0x5eed) : rng0(s);
L.rng.recheck = mode;
