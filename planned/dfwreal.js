'use strict';
// Real-DFW layout (DFWREAL). Since 4 Nov 2026 the layout lives in cities/dfw.json and is loaded by lab/city.js;
// this wrapper keeps the old interface (lat0 and lon0 are functions here, as before). Original code: lab/reference/dfwreal_2026-10-23.js.
const c = require('../lab/city.js').load('dfw');
const ZIP_RATE = c.data.random.find(x => x.op === 'zipline').rate.perDay / c.data.random.find(x => x.op === 'zipline').rate.hours;
module.exports = { AMAZON: c.AMAZON, lat0: () => c.lat0, lon0: () => c.lon0, toXY: c.toXY, sites: c.sites, ZIP_RATE };
if (require.main === module) { const cfg = { zone: +process.argv[2] || 40000 }; console.log('centre', c.lat0.toFixed(5), c.lon0.toFixed(5));
  for (const a of c.AMAZON) { const p = c.toXY(a[1], a[2]); console.log(a[0], Math.round(p[0]), Math.round(p[1]), Math.abs(p[0]) <= cfg.zone && Math.abs(p[1]) <= cfg.zone ? 'in zone' : 'OUT'); } }
