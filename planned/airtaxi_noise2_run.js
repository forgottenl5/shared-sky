'use strict';
// AIRTAXI_NOISE2 runner (registration planned/AIRTAXI_NOISE2_PREREG.md). Engine taxi/net5.js, noise taxi/noise.js.
//   node planned/airtaxi_noise2_run.js checks        K1-K3
//   node planned/airtaxi_noise2_run.js <shard> <n>   -> out/airtaxi_noise2_<shard>.json
const fs = require('fs'), path = require('path'), N5 = require('../taxi/net5.js'), Z = require('../taxi/noise.js');
const KM = 60 * 67 / 1000, U100 = { rangeKm: 100 + 20 * KM, reserveMin: 20 }, P = { padZ: 15, vLift: 2.5, slope: 8, vClimb: 31, cruiseZ: 610, vCruise: 67 };
const WARM = 7200, STEP = 200, MARGIN = 4000, WINDOWS = { D12: 12, D16: 16, D18: 18 }, SEEDS = [1, 2, 3, 4, 5], OUT = path.join(__dirname, '..', 'out');
// identical to taxi/export_airtaxi.js
const SITES = { DFW: { lat0: 33.0, list: [['AFW', 32.9937909, -97.3100623], ['DFWc', 32.9133576, -97.0355091], ['TOY', 33.0811809, -96.841015], ['49T', 32.772891, -96.8024551]], routes: [['AFW', 'DFWc'], ['AFW', 'TOY'], ['DFWc', 'TOY'], ['DFWc', '49T']], levels: [[1.5, 2, 6], [3, 2, 8], [6, 4, 12]] },
  HOU: { lat0: 29.75, list: [['IAH', 29.9931058, -95.3416255], ['HOU', 29.6459141, -95.2768951], ['EFD', 29.6073333, -95.15875]], routes: [['IAH', 'HOU'], ['IAH', 'EFD']], levels: [[1.5, 2, 6], [3, 2, 8], [6, 4, 10]] } };
const NET3 = {}; for (const f of fs.readdirSync(OUT).filter(f => f.startsWith('airtaxi_net3_fleet_'))) for (const x of JSON.parse(fs.readFileSync(path.join(OUT, f)))) if (x.arm === 'U100') NET3[[x.metro, x.r, x.s].join('|')] = x.fleet;
const xyOf = (lat0, lat, lon) => [(lon + 97) * 111320 * Math.cos(lat0 * Math.PI / 180), (lat - 30) * 110574];
function cfg(m, li, seed, hours) { const M = SITES[m], [r, pads, S] = M.levels[li], sites = M.list.map(([id, lat, lon]) => ({ id, xy: xyOf(M.lat0, lat, lon), pads, stands: S })), F = NET3[[m, r, seed].join('|')], n = sites.length;
  const fleet = {}; sites.forEach(s => fleet[s.id] = 0); const used = sites.map(() => 0); for (let k = 0, i = 0; k < F; i++) { const j = i % n; if (used[j] < S) { used[j]++; fleet[sites[j].id]++; k++; } }
  const demand = []; for (const [a, b] of M.routes) { demand.push({ from: a, to: b, perHour: r }); demand.push({ from: b, to: a, perHour: r }); }
  return { sites, fleet, aircraft: Object.assign({ seats: 4, routeFactor: 1.15, vtolKm: 5, chargeKmPerMin: 3.2 }, U100), profile: P,
    ops: { padOccupancy: 90, turnaround: 300, maxWait: 1800, reposition: true, padRule: 'slot' }, demand, hours, warm: WARM, seed, trace: true }; }
function gridFor(sites) { const xs = sites.map(s => s.xy[0]), ys = sites.map(s => s.xy[1]);
  const x0 = Math.floor((Math.min(...xs) - MARGIN) / STEP) * STEP, y0 = Math.floor((Math.min(...ys) - MARGIN) / STEP) * STEP;
  return { x0, y0, nx: Math.ceil((Math.max(...xs) + MARGIN - x0) / STEP) + 1, ny: Math.ceil((Math.max(...ys) + MARGIN - y0) / STEP) + 1 }; }
// Census blocks -> population per grid cell (cell k covers centre +- STEP/2, matching noise.js receivers at x0 + i*STEP)
const POPCACHE = {};
function popGrid(m) { if (POPCACHE[m]) return POPCACHE[m]; const M = SITES[m], sites = M.list.map(([id, lat, lon]) => ({ id, xy: xyOf(M.lat0, lat, lon) })), g = gridFor(sites), pop = new Float64Array(g.nx * g.ny); let inside = 0, assigned = 0;
  const lines = fs.readFileSync(path.join(__dirname, '..', 'data', 'census', 'tx_blocks_2020.csv'), 'utf8').split('\n');
  for (let i = 1; i < lines.length; i++) { const p = lines[i].split(','); if (p.length < 5) continue; const n = +p[1]; if (!n) continue; const [x, y] = xyOf(M.lat0, +p[3], +p[4]);
    const ii = Math.round((x - g.x0) / STEP), jj = Math.round((y - g.y0) / STEP); if (ii < 0 || jj < 0 || ii >= g.nx || jj >= g.ny) continue; inside += n; pop[jj * g.nx + ii] += n; assigned += n; }
  return (POPCACHE[m] = { g, pop, inside, assigned, sites }); }
function run(m, li, seed, win) { const hours = WINDOWS[win], c = cfg(m, li, seed, hours), res = N5.simulate(c), PG = popGrid(m), g = PG.g, G = new Z.Grid(g.x0, g.y0, g.nx, g.ny, STEP), SX = {};
  c.sites.forEach(s => SX[s.id] = s.xy); for (const f of res.trace) G.addFlight(f, SX, P, 0, WARM, WARM + hours * 3600);
  let dnlMax = -Infinity, p10 = 0, p50 = 0, p55 = 0, p65 = 0, cells65 = 0;
  for (let k = 0; k < g.nx * g.ny; k++) { const [x, y] = G.xy(k); if (Math.min(...c.sites.map(s => Math.hypot(x - s.xy[0], y - s.xy[1]))) <= 300) continue;
    const L = G.dnl(k), pp = PG.pop[k]; if (L > dnlMax) dnlMax = L; if (G.n55[k] >= 10) p10 += pp; if (G.n55[k] >= 50) p50 += pp; if (L >= 55) p55 += pp; if (L >= 65) { p65 += pp; cells65++; } }
  return { metro: m, li, T: c.demand.reduce((a, d) => a + d.perHour, 0), seed, win, flights: res.trace.length, dnlOffsiteMax: +dnlMax.toFixed(2), popN55_10: Math.round(p10), popN55_50: Math.round(p50), popDNL55: Math.round(p55), popDNL65: Math.round(p65), cells65,
    n55: seed === 1 && win === 'D12' ? Array.from(G.n55) : undefined }; }
if (process.argv[2] === 'checks') { let bad = 0; const ok = (n, c, i) => { console.log((c ? 'ok  ' : 'FAIL') + ' ' + n + (i !== undefined ? ' ' + JSON.stringify(i) : '')); if (!c) bad++; };
  const D = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'taxi', 'airtaxi_data.json'), 'utf8'));
  for (const m of ['DFW', 'HOU']) for (let li = 0; li < 3; li++) { const r = run(m, li, 1, 'D12'), want = D.metros[m].levels[li].noise.cells, got = []; r.n55.forEach((v, k) => { if (v > 0) got.push([k, v]); });
    ok(`K1 ${m} level ${li} N55 cells match the page`, JSON.stringify(got) === JSON.stringify(want), [got.length, want.length]); }
  for (const m of ['DFW', 'HOU']) { const PG = popGrid(m); ok(`K2 ${m} population assigned = inside grid, > 100,000`, PG.assigned === PG.inside && PG.assigned > 100000, PG.assigned); }
  ok('K3 night penalty 22:30 / 06:30 / 12:00', Z.penalty((22.5 - 4) * 3600) === 10 && Z.penalty((6.5 - 4) * 3600) === 10 && Z.penalty((12 - 4) * 3600) === 0);
  console.log(bad ? bad + ' FAILED' : 'ALL PASS'); process.exit(bad ? 1 : 0); }
const shard = +process.argv[2], nsh = +process.argv[3]; if (!(shard >= 0 && nsh > 0)) { console.error('usage: checks | <shard> <n>'); process.exit(2); }
const J = []; for (const m of ['DFW', 'HOU']) for (let li = 0; li < 3; li++) for (const s of SEEDS) for (const w of Object.keys(WINDOWS)) J.push([m, li, s, w]);
const rows = []; for (let i = shard; i < J.length; i += nsh) { const r = run(...J[i]); delete r.n55; rows.push(r); fs.writeFileSync(path.join(OUT, `airtaxi_noise2_${shard}.json`), JSON.stringify(rows)); console.log(JSON.stringify(r)); }
console.log('done', rows.length);
