'use strict';
// BUILDOUT: staged Houston build-out from today's real sites to the filed caps.
// Real positions: Wing's 13 operating stores (Wing Jan 2026 post: 5; CultureMap 8 Jul 2026: 8 more), Amazon's geocoded sites (houreal.js) opened in a fixed order
// (HOU6 first, flying since Aug 2026; then the Texas EA list order SAHx, STX5, HOU2, STX4), Zipline's Cypress dock (sampled within 5 km). Extra sites to reach each stage's
// count: uniform at random in the counted square, nested so every stage contains the previous one (stream seed + 51,413).
const L = require('../lab/lab_engine.js'), HR = require('./houreal.js'), HT = require('./houtoday.js');
const WING13 = HT.SITES.filter(s => s[0] === 'wing').map(s => [s[1], s[2], s[3], s[4]]).concat([
  // 8 stores added by Jul 2026 (CultureMap, 8 Jul 2026): [code, lat, lon, geocode source]
  ['WM Tomball Pkwy', 29.9131063, -95.4867774, 'OSM Nominatim store match (founder paste)'],
  ['WM FM 1960 W', 29.9199865, -95.6021046, 'Boost Mobile in-store page geo meta (Nominatim matched a hotel)'],
  ['WM Riley Fuzzel', 30.1144607, -95.3870083, 'OSM Nominatim store match (founder paste)'],
  ['WM New Caney', 30.1514677, -95.2216108, 'Boost Mobile in-store page geo meta'],
  ['WM Sawdust Rd', 30.1233014, -95.4577744, 'OSM Nominatim store match (founder paste)'],
  ['WM NW Fwy', 29.8539111, -95.5091123, 'OSM Nominatim store match (founder paste)'],
  ['WM East Fwy', 29.7680256, -95.1770808, 'OSM Nominatim store match (founder paste)'],
  ['WM Hwy 6 S', 29.7212687, -95.6474083, 'OSM Nominatim store match (founder paste)'] ]);
const AMZ_ORDER = ['HOU6', 'SAHx', 'STX5', 'HOU2', 'STX4'];
const STAGES = { today: { wing: 13, zipline: 1, amazon: 1, vol: 0.2 }, early: { wing: 19, zipline: 16, amazon: 2, vol: 0.5 }, mid: { wing: 38, zipline: 33, amazon: 3, vol: 0.75 }, full: { wing: 75, zipline: 65, amazon: 5, vol: 1 } };
const toXY = HR.toXY, RATE = { wing: 400 / 15, amazon: 1000 / 16.5, zipline: 1000 * 0.95 / 15 };
function sites(cfg, seed, stage) { const st = STAGES[stage], r = L.rng(seed + 51413), out = [];
  WING13.slice(0, Math.min(13, st.wing)).forEach(w => out.push({ op: 'wing', code: w[0], c: toXY(w[1], w[2]) }));
  for (const code of AMZ_ORDER.slice(0, st.amazon)) { const a = HR.AMAZON.find(x => x[0] === code); out.push({ op: 'amazon', code, c: toXY(a[1], a[2]) }); }
  const cz = toXY(HT.CYPRESS[0], HT.CYPRESS[1]), rr = 5000 * Math.sqrt(r()), th = 2 * Math.PI * r(); out.push({ op: 'zipline', code: 'Cypress', c: [cz[0] + rr * Math.cos(th), cz[1] + rr * Math.sin(th)] });
  // extra random sites, drawn in a fixed order up to the full-stage counts so stages nest
  const extra = { wing: [], zipline: [] }; for (let k = 0; k < 62; k++) extra.wing.push([(r() - 0.5) * 2 * cfg.zone, (r() - 0.5) * 2 * cfg.zone]); for (let k = 0; k < 64; k++) extra.zipline.push([(r() - 0.5) * 2 * cfg.zone, (r() - 0.5) * 2 * cfg.zone]);
  extra.wing.slice(0, st.wing - 13).forEach((c, k) => out.push({ op: 'wing', code: 'W+' + k, c })); extra.zipline.slice(0, st.zipline - 1).forEach((c, k) => out.push({ op: 'zipline', code: 'Z+' + k, c }));
  for (const s of out) s.rate = RATE[s.op] * st.vol; return out; }
module.exports = { WING13, AMZ_ORDER, STAGES, sites, toXY };
