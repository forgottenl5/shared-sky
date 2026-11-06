'use strict';
// Real-Houston layout (HOUREAL). Since 4 Nov 2026 the layout lives in cities/houston.json and is loaded by lab/city.js;
// this wrapper keeps the old interface. The original code is frozen in lab/reference/houreal_2026-10-23.js (identical output: node lab/city.js check).
const c = require('../lab/city.js').load('houston');
module.exports = { AMAZON: c.AMAZON, lat0: c.lat0, lon0: c.lon0, toXY: c.toXY, sites: c.sites };
if (require.main === module) { const cfg = { zone: 34000 }; console.log('centre', c.lat0.toFixed(5), c.lon0.toFixed(5)); for (const a of c.AMAZON) { const p = c.toXY(a[1], a[2]); console.log(a[0], Math.round(p[0]), Math.round(p[1]), Math.abs(p[0]) <= cfg.zone && Math.abs(p[1]) <= cfg.zone ? 'in zone' : 'OUT'); } }
