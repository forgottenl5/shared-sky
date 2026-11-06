'use strict';
// "Houston today" layout (HOUTODAY): only the sites reported operating as of 23 Oct 2026.
// Sources: Wing 15 Jan 2026 launch post (five store addresses); Hoodline Aug 2026 (Amazon flying from HOU6 Richmond);
// Zipline 29 Apr 2026 newsroom + Community Impact 22 May 2026 (first Houston flights in Cypress, site address not published).
const L = require('../lab/lab_engine.js');
const SITES = [   // [op, code, lat, lon, geocode source]
  ['wing', 'WM522 Crosby',  29.8943561, -95.0656436, 'allstays store page map link'],
  ['wing', 'WM768 Katy',    29.7891168, -95.7222324, 'OSM Nominatim store match (founder paste)'],
  ['wing', 'WM1040 FM 529', 29.8769685, -95.6518749, 'allstays store page map link'],
  ['wing', 'WM3298 Kemah',  29.5351313, -95.0188362, 'Boost Mobile in-store page geo meta'],
  ['wing', 'WM4538 Katy',   29.8607429, -95.7165258, 'OSM Nominatim store match (founder paste)'],
  ['amazon', 'HOU6 Richmond', 29.6666527, -95.7128910, 'OSM building "Amazon HOU6"'],
];
const CYPRESS = [29.97083, -95.69722];   // Wikipedia coordinate for Cypress CDP; Zipline's dock is somewhere in Cypress (not published)
const ZIP_R = 5000;                       // Zipline dock drawn uniformly within 5 km of that point, per seed (assumption)
const all = SITES.map(s => [s[2], s[3]]).concat([CYPRESS]);
const lat0 = (Math.min(...all.map(p => p[0])) + Math.max(...all.map(p => p[0]))) / 2, lon0 = (Math.min(...all.map(p => p[1])) + Math.max(...all.map(p => p[1]))) / 2;
const toXY = (lat, lon) => [(lon - lon0) * 111320 * Math.cos(lat0 * Math.PI / 180), (lat - lat0) * 110540];
const RATE = { wing: 400 / 15, amazon: 1000 / 16.5, zipline: 1000 * 0.95 / 15 };   // engine defaults = filed caps
function sites(cfg, seed, vol) { const r = L.rng(seed + 31337), f = vol || 1, out = [];
  for (const s of SITES) out.push({ op: s[0], code: s[1], c: toXY(s[2], s[3]), rate: RATE[s[0]] * f });
  const cz = toXY(CYPRESS[0], CYPRESS[1]), rr = ZIP_R * Math.sqrt(r()), th = 2 * Math.PI * r();
  out.push({ op: 'zipline', code: 'Zipline Cypress', c: [cz[0] + rr * Math.cos(th), cz[1] + rr * Math.sin(th)], rate: RATE.zipline * f });
  return out; }
module.exports = { SITES, CYPRESS, lat0, lon0, toXY, sites };
if (require.main === module) { const S = sites({}, 1), R = { wing: 9656, amazon: 12070, zipline: 16093 };
  console.log('centre', lat0.toFixed(5), lon0.toFixed(5)); for (const s of S) console.log(s.code.padEnd(16), Math.round(s.c[0]), Math.round(s.c[1]));
  console.log('cross-company pairs whose service discs overlap (seed 1 Zipline position):');
  for (let i = 0; i < S.length; i++) for (let j = i + 1; j < S.length; j++) if (S[i].op !== S[j].op) { const d = Math.hypot(S[i].c[0] - S[j].c[0], S[i].c[1] - S[j].c[1]), sum = R[S[i].op] + R[S[j].op] + (S[i].op === 'zipline' || S[j].op === 'zipline' ? 0 : 0);
    if (d < sum) console.log(' ', S[i].code, '-', S[j].code, (d / 1000).toFixed(1), 'km apart, radii sum', (sum / 1000).toFixed(1)); } }
