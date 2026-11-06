'use strict';
// Real-DFW layout (DFWREAL): Amazon's seven DFW sites from its final Texas EA (TEXAS_FILINGS_2026-10-23.md), geocoded with
// OpenStreetMap Nominatim (results pasted by the founder); Wing's 75 nests and Zipline's 75 sites (DFW filing caps) placed uniformly
// at random in the counted square, because their locations are not published. Zipline DFW rate: 400 per site per day (DFW EA).
const L = require('../lab_engine.js');
const AMAZON = [   // [code, lat, lon, geocode source]  -- filled from the founder's Nominatim pastes before fingerprinting
  ['STX8', 32.9886042, -96.6617927, 'OSM, 3051 Research Dr, Richardson (founder, 22 Oct 2026)'],
  ['STX2', 32.9434771, -96.9098160, 'OSM way "Amazon STX2", 1625 Hutton Dr, Carrollton'],
  ['STX3', 32.7529780, -96.8895253, 'OSM way "Amazon VTX3" at 4445 Rock Quarry Rd (the EA address; OSM names it VTX3)'],
  ['DAL3', 32.7557845, -96.9042345, 'OSM way "Amazon DAL3", 1301 Chalk Hill Rd'],
  ['DFW7', 32.9705254, -97.3357107, 'OSM way "Amazon Fulfillment Center DFW7", 700 Westport Pkwy, Haslet'],
  ['FTW4', 33.0091417, -97.2952151, 'OSM way "Amazon Fulfilment Center", 15201 Heritage Pkwy, Fort Worth'],
  // IAH1 (9155 Southlink Dr, Dallas 75241): Nominatim returned nothing for two queries (23 Oct 2026); excluded
];
const lat0 = () => (Math.min(...AMAZON.map(s => s[1])) + Math.max(...AMAZON.map(s => s[1]))) / 2, lon0 = () => (Math.min(...AMAZON.map(s => s[2])) + Math.max(...AMAZON.map(s => s[2]))) / 2;
const toXY = (lat, lon) => [(lon - lon0()) * 111320 * Math.cos(lat0() * Math.PI / 180), (lat - lat0()) * 110540];
const ZIP_RATE = 400 / 15;
function sites(cfg, seed) { const r = L.rng(seed + 31337), out = [];
  for (const a of AMAZON) out.push({ op: 'amazon', c: toXY(a[1], a[2]), code: a[0] });
  for (const [op, n] of [['wing', 75], ['zipline', 75]]) for (let k = 0; k < n; k++) out.push({ op, c: [(r() - 0.5) * 2 * cfg.zone, (r() - 0.5) * 2 * cfg.zone], rate: op === 'zipline' ? ZIP_RATE : undefined });
  return out; }
module.exports = { AMAZON, lat0, lon0, toXY, sites, ZIP_RATE };
if (require.main === module) { const cfg = { zone: +process.argv[2] || 40000 }; console.log('centre', lat0().toFixed(5), lon0().toFixed(5));
  for (const a of AMAZON) { const p = toXY(a[1], a[2]); console.log(a[0], Math.round(p[0]), Math.round(p[1]), Math.abs(p[0]) <= cfg.zone && Math.abs(p[1]) <= cfg.zone ? 'in zone' : 'OUT'); } }
