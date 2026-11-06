'use strict';
// Exploratory plausibility check (not registered): passes over a home near Amazon's Richardson hub under our straight-line, uniform-customer model.
// Expected passes per day within lateral distance w of a point at distance r from the hub, for N flights/day (each flight: out and back on the same straight line).
function rng(seed) { let s = (seed * 2654435761) >>> 0; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; }
const R = 12070, MIN = 300, M = 400000, r_ = rng(7);
const custs = []; while (custs.length < M) { const rr = R * Math.sqrt(r_()), th = 2 * Math.PI * r_(); if (rr < MIN) continue; custs.push([rr * Math.cos(th), rr * Math.sin(th)]); }
const segDist = (px, py, bx, by) => { const L2 = bx * bx + by * by, u = Math.max(0, Math.min(1, (px * bx + py * by) / L2)); return Math.hypot(px - u * bx, py - u * by); };
const rs = [500, 1000, 1500, 2000, 3000], ws = [50, 150, 300, 500];
console.log('| Home distance from hub | ' + ws.map(w => `within ${w} m: passes/day at 150 / 250 flights`).join(' | ') + ' |'); console.log('|' + '---|'.repeat(ws.length + 1));
for (const r of rs) { const row = []; for (const w of ws) { let hit = 0; const nPts = 16; for (let k = 0; k < nPts; k++) { const a = 2 * Math.PI * k / nPts, px = r * Math.cos(a), py = r * Math.sin(a); for (let i = 0; i < M; i += 4) if (segDist(px, py, custs[i][0], custs[i][1]) < w) hit++; }
    const frac = hit / (nPts * M / 4); row.push(`${(2 * 150 * frac).toFixed(0)} / ${(2 * 250 * frac).toFixed(0)}`); }
  console.log(`| ${r / 1000} km | ${row.join(' | ')} |`); }
