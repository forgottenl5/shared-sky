'use strict';
// Convert an Overpass "out geom" building export into a compact list for the city page backdrop.
// Output: { attribution, centre, b: [[h, x0, z0, x1, z1, ...], ...] } in metres, x east, z south, footprint simplified (vertices < 3 m apart dropped).
// Height: OSM height tag, else building:levels x 3.5 m, else 12 m (stated on the page).
const fs = require('fs'), [,, src, out] = process.argv, d = JSON.parse(fs.readFileSync(src, 'utf8'));
const lat0 = +(process.env.LAT0 || 29.7575), lon0 = +(process.env.LON0 || -95.3675), kx = 111320 * Math.cos(lat0 * Math.PI / 180), ky = 110540;
let nH = 0, nL = 0, nD = 0; const B = [];
for (const e of d.elements) { if (e.type !== 'way' || !e.geometry || e.geometry.length < 4) continue; const t = e.tags || {};
  let h = parseFloat(String(t.height || '').replace(/[^0-9.]/g, '')); if (h > 0) nH++; else if (+t['building:levels'] > 0) { h = 3.5 * +t['building:levels']; nL++; } else { h = 12; nD++; }
  const pts = []; for (const g of e.geometry) { const x = Math.round((g.lon - lon0) * kx), z = Math.round(-(g.lat - lat0) * ky); const p = pts.length ? pts.slice(-2) : null; if (!p || Math.hypot(x - p[0], z - p[1]) >= 3) pts.push(x, z); }
  if (pts.length >= 6 && pts[0] === pts[pts.length - 2] && pts[1] === pts[pts.length - 1]) pts.splice(-2); if (pts.length < 6) continue; B.push([Math.round(Math.min(h, 400))].concat(pts)); }
B.sort((a, b) => a[0] - b[0]);
fs.writeFileSync(out, JSON.stringify({ attribution: '© OpenStreetMap contributors (ODbL)', centre: [lat0, lon0], counts: { height: nH, levels: nL, default12m: nD }, b: B }));
console.log('buildings', B.length, { height: nH, levels: nL, default12m: nD }, 'tallest', B.slice(-5).map(b => b[0]), 'bytes', fs.statSync(out).size);
