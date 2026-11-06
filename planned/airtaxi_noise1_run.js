'use strict';
// AIRTAXI_NOISE1 runner (registration planned/AIRTAXI_NOISE1_PREREG.md). Engine taxi/net2.js, noise taxi/noise.js. Usage:
//   node planned/airtaxi_noise1_run.js checks          K2 (flights identical to AIRTAXI_NET2 settings; K1 is node taxi/test_noise.js)
//   node planned/airtaxi_noise1_run.js <shard> <n>     -> out/airtaxi_noise1_<shard>.json (and grids for seed 1, base levels, in out/airtaxi_noise1_grid_*.json)
const fs = require('fs'), path = require('path'), N = require('../taxi/net2.js'), Z = require('../taxi/noise.js');
const SITES = {   // identical to planned/airtaxi_net2_run.js
  DFW: { lat0: 33.0, list: [['AFW', 32.9937909, -97.3100623], ['DFWc', 32.9133576, -97.0355091], ['TOY', 33.0811809, -96.841015], ['49T', 32.772891, -96.8024551]],
         routes: [['AFW', 'DFWc'], ['AFW', 'TOY'], ['DFWc', 'TOY'], ['DFWc', '49T']], fleet: { 1.5: 8, 3: 14, 6: 24 }, probe: ['DFWc', 'AFW'] },
  HOU: { lat0: 29.75, list: [['IAH', 29.9931058, -95.3416255], ['HOU', 29.6459141, -95.2768951], ['EFD', 29.6073333, -95.15875]],
         routes: [['IAH', 'HOU'], ['IAH', 'EFD']], fleet: { 1.5: 5, 3: 8, 6: 14 }, probe: ['IAH', 'HOU'] } };
const P = { padZ: 15, vLift: 2.5, slope: 8, vClimb: 31, cruiseZ: 610, vCruise: 67 }, WARM = 7200, HOURS = 12, STEP = 200, MARGIN = 4000;
function sites(metro) { const M = SITES[metro], c = Math.cos(M.lat0 * Math.PI / 180);
  return M.list.map(([id, lat, lon]) => ({ id, xy: [(lon + 97) * 111320 * c, (lat - 30) * 110574], pads: 2, stands: 1e9 })); }
function config(metro, r, seed, trace) { const S = sites(metro), n = SITES[metro].fleet[r], fleet = {}; S.forEach(s => fleet[s.id] = 0); for (let k = 0; k < n; k++) fleet[S[k % S.length].id]++;
  const demand = []; for (const [a, b] of SITES[metro].routes) { demand.push({ from: a, to: b, perHour: r }); demand.push({ from: b, to: a, perHour: r }); }
  return { sites: S, fleet, aircraft: { seats: 4, rangeKm: 130, reserveKm: 30, routeFactor: 1.15, vtolKm: 5, chargeKmPerMin: 3.2 }, profile: P,
    ops: { padOccupancy: 90, turnaround: 300, maxWait: 1800, reposition: true }, demand, hours: HOURS, warm: WARM, seed, trace }; }
function run(metro, r, seed, off) {
  const cfg = config(metro, r, seed, true), res = N.simulate(cfg), S = {}; for (const s of cfg.sites) S[s.id] = s.xy;
  const xs = cfg.sites.map(s => s.xy[0]), ys = cfg.sites.map(s => s.xy[1]);
  const x0 = Math.floor((Math.min(...xs) - MARGIN) / STEP) * STEP, y0 = Math.floor((Math.min(...ys) - MARGIN) / STEP) * STEP;
  const nx = Math.ceil((Math.max(...xs) + MARGIN - x0) / STEP) + 1, ny = Math.ceil((Math.max(...ys) + MARGIN - y0) / STEP) + 1;
  const G = new Z.Grid(x0, y0, nx, ny, STEP), W = WARM, WE = WARM + HOURS * 3600;
  const [pa, pb] = SITES[metro].probe, d = Math.hypot(S[pb][0] - S[pa][0], S[pb][1] - S[pa][1]), px = S[pa][0] + (S[pb][0] - S[pa][0]) / d * 1000, py = S[pa][1] + (S[pb][1] - S[pa][1]) / d * 1000;
  const PR = new Z.Grid(px, py, 1, 1, STEP);
  for (const f of res.trace) { G.addFlight(f, S, P, off, W, WE); PR.addFlight(f, S, P, off, W, WE); }
  let area55 = 0, area65 = 0, reach = 0, offMax = -Infinity, allMax = -Infinity;
  for (let k = 0; k < nx * ny; k++) { const [x, y] = G.xy(k), dn = Math.min(...cfg.sites.map(s => Math.hypot(x - s.xy[0], y - s.xy[1])));
    if (G.n55[k] >= 10) area55++; if (G.n65[k] >= 1) area65++; if (G.n55[k] >= 1 && dn > reach) reach = dn;
    const L = G.dnl(k); if (L > allMax) allMax = L; if (dn > 300 && L > offMax) offMax = L; }
  return { metro, r, seed, off, flights: res.trace.length, takeoffs: Object.fromEntries(res.sites.map(s => [s.id, s.takeoffs])),
    area55_10: area55 * STEP * STEP / 1e6, area65_1: area65 * STEP * STEP / 1e6, reach, dnlOffsiteMax: offMax, dnlMax: allMax, probe: { from: pa, to: pb, n55: PR.n55[0], n65: PR.n65[0], dnl: PR.dnl(0) },
    grid: seed === 1 && off === 0 ? { x0, y0, nx, ny, step: STEP, n55: Array.from(G.n55), dnl: Array.from({ length: nx * ny }, (_, k) => { const L = G.dnl(k); return L > 0 ? Math.round(L * 10) / 10 : 0; }) } : undefined };
}
if (process.argv[2] === 'checks') {   // K2
  let bad = 0; for (const metro of ['DFW', 'HOU']) { const a = N.simulate(config(metro, 1.5, 1, false)), b = N.simulate(config(metro, 1.5, 1, true));
    const ta = a.sites.map(s => s.takeoffs).join(','), tb = b.sites.map(s => s.takeoffs).join(','); const okk = ta === tb && b.trace.length === b.sites.reduce((x, s) => x + s.takeoffs, 0);
    console.log((okk ? 'ok  ' : 'FAIL') + ' K2 ' + metro + ' take-offs per site without/with trace: ' + ta + ' / ' + tb + '; traced flights ' + b.trace.length); if (!okk) bad++; }
  console.log(bad ? bad + ' FAILED' : 'ALL PASS'); process.exit(bad ? 1 : 0); }
const shard = +process.argv[2], nsh = +process.argv[3];
if (!(shard >= 0 && nsh > 0)) { console.error('usage: node planned/airtaxi_noise1_run.js checks | <shard> <n>'); process.exit(2); }
const jobs = []; for (const metro of ['DFW', 'HOU']) { for (const r of [1.5, 3, 6]) for (let s = 1; s <= 5; s++) jobs.push([metro, r, s, 0]); for (const r of [1.5, 6]) for (const off of [-5, 5]) jobs.push([metro, r, 1, off]); }
const outDir = path.join(__dirname, '..', 'out'); fs.mkdirSync(outDir, { recursive: true }); const rows = [];
for (let i = shard; i < jobs.length; i += nsh) { const o = run(...jobs[i]);
  if (o.grid) { fs.writeFileSync(path.join(outDir, `airtaxi_noise1_grid_${o.metro}_${o.r}.json`), JSON.stringify(o.grid)); delete o.grid; }
  rows.push(o); console.log(JSON.stringify(o)); }
fs.writeFileSync(path.join(outDir, 'airtaxi_noise1_' + shard + '.json'), JSON.stringify(rows));
