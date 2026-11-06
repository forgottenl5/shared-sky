'use strict';
// Real-Houston layout (HOUREAL): Amazon's six Houston sites from its final Texas EA (TEXAS_FILINGS_2026-10-23.md), geocoded with
// OpenStreetMap Nominatim (results pasted by the founder, 2026-10-23); Wing's 75 nests and Zipline's 65 Chargers (Houston filing caps)
// placed uniformly at random in the counted square, because their locations are not published.
const L = require('../lab_engine.js');
const AMAZON = [   // [code, lat, lon, quality]
  ['SAHx', 29.632374704146194, -95.52780057909078, 'coordinates in the Texas EA'],
  ['STX5', 29.8327131, -95.5296800, 'street-level match only (Campbell Road, 77041), up to ~1 km off'],
  ['HOU2', 29.9341403, -95.4283824, 'OSM building "Amazon HOU2"'],
  ['HOU6', 29.6666527, -95.7128910, 'OSM building "Amazon HOU6"'],
  ['STX4', 29.6100929, -95.0789902, 'OSM address point'],
  // SAH1 (1202 E FM 1960 Road, Houston 77073): not found by three Nominatim queries (2026-10-23); excluded
];
// Centre: midpoint of the Amazon sites' bounding box, so one square zone holds all five with a margin
const lat0 = (Math.min(...AMAZON.map(s => s[1])) + Math.max(...AMAZON.map(s => s[1]))) / 2, lon0 = (Math.min(...AMAZON.map(s => s[2])) + Math.max(...AMAZON.map(s => s[2]))) / 2;
const toXY = (lat, lon) => [(lon - lon0) * 111320 * Math.cos(lat0 * Math.PI / 180), (lat - lat0) * 110540];
function sites(cfg, seed) { const r = L.rng(seed + 31337), out = [];
  for (const a of AMAZON) out.push({ op: 'amazon', c: toXY(a[1], a[2]), code: a[0] });
  for (const [op, n] of [['wing', 75], ['zipline', 65]]) for (let k = 0; k < n; k++) out.push({ op, c: [(r() - 0.5) * 2 * cfg.zone, (r() - 0.5) * 2 * cfg.zone] });
  return out; }
module.exports = { AMAZON, lat0, lon0, toXY, sites };
if (require.main === module) { const cfg = { zone: 34000 }; console.log('centre', lat0.toFixed(5), lon0.toFixed(5)); for (const a of AMAZON) { const p = toXY(a[1], a[2]); console.log(a[0], Math.round(p[0]), Math.round(p[1]), Math.abs(p[0]) <= cfg.zone && Math.abs(p[1]) <= cfg.zone ? 'in zone' : 'OUT'); } }
