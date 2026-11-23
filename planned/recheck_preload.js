'use strict';
// RECHECK_A1 (planned/RECHECK_A1_PREREG.md): load before an unchanged study runner to switch the engine fixes of 22 Nov 2026 on.
//   RECHECK_FIX=on  node -r ./planned/recheck_preload.js planned/<study>_run.js ...   every L.run gets fix {exact, bounded, hashRng}
//   RECHECK_FIX=off node -r ./planned/recheck_preload.js planned/<study>_run.js ...   wrapper present but adds nothing (check K1)
// The runners require ../lab/lab_engine.js; Node caches modules by real path, so this patches the same engine object they get.
const L = require('../lab/lab_engine.js');
const mode = process.env.RECHECK_FIX;
if (mode !== 'on' && mode !== 'off') throw new Error('set RECHECK_FIX=on or off');
const FIX = { exact: true, bounded: true, hashRng: true };
const run0 = L.run;
L.run = (cfg, p) => run0(cfg, mode === 'on' ? Object.assign({}, p, { fix: FIX }) : p);
L.run.recheck = mode;
