'use strict';
// AIRTAXI_NOISEWIND1 runner (registration planned/AIRTAXI_NOISEWIND1_PREREG.md). Engine taxi/net5.js, noise taxi/noise.js (optional Grid.posFn hook).
//   node planned/airtaxi_noisewind1_run.js checks        K1-K3
//   node planned/airtaxi_noisewind1_run.js <shard> <n>   -> out/airtaxi_noisewind1_<shard>.json
const fs = require('fs'), path = require('path'), N5 = require('../taxi/net5.js'), Z = require('../taxi/noise.js');
const KM = 60 * 67 / 1000, U100 = { rangeKm: 100 + 20 * KM, reserveMin: 20 }, P = { padZ: 15, vLift: 2.5, slope: 8, vClimb: 31, cruiseZ: 610, vCruise: 67 };
const WARM = 7200, STEP = 200, MARGIN = 4000, WINDOWS = { D12: 12 }, SEEDS = [1, 2, 3, 4, 5], OUT = path.join(__dirname, '..', 'out');
// identical to taxi/export_airtaxi.js
const SITES = { DFW: { lat0: 33.0, list: [['AFW', 32.9937909, -97.3100623], ['DFWc', 32.9133576, -97.0355091], ['TOY', 33.0811809, -96.841015], ['49T', 32.772891, -96.8024551]], routes: [['AFW', 'DFWc'], ['AFW', 'TOY'], ['DFWc', 'TOY'], ['DFWc', '49T']], levels: [[1.5, 2, 6], [3, 2, 8], [6, 4, 12]] },
  HOU: { lat0: 29.75, list: [['IAH', 29.9931058, -95.3416255], ['HOU', 29.6459141, -95.2768951], ['EFD', 29.6073333, -95.15875]], routes: [['IAH', 'HOU'], ['IAH', 'EFD']], levels: [[1.5, 2, 6], [3, 2, 8], [6, 4, 10]] } };
const NET3 = {}; for (const f of fs.readdirSync(OUT).filter(f => f.startsWith('airtaxi_net3_fleet_'))) for (const x of JSON.parse(fs.readFileSync(path.join(OUT, f)))) if (x.arm === 'U100') NET3[[x.metro, x.r, x.s].join('|')] = x.fleet;
const xyOf = (lat0, lat, lon) => [(lon + 97) * 111320 * Math.cos(lat0 * Math.PI / 180), (lat - 30) * 110574];
// ---- real wind (Open-Meteo 2025, UTC) -> one real weekday per seed, hourly direction by local hour
const FMT = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Chicago', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hourCycle: 'h23', weekday: 'short' });
function localParts(iso) { const o = {}; for (const p of FMT.formatToParts(new Date(iso + ':00Z'))) o[p.type] = p.value; return { date: `${o.year}-${o.month}-${o.day}`, hour: +o.hour, wd: o.weekday }; }
const WDAYS = {};
function windDays(m) { if (WDAYS[m]) return WDAYS[m]; const file = { DFW: 'openmeteo_dfw_2025.json', HOU: 'openmeteo_houston_2025.json' }[m], H = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', file), 'utf8')).hourly, days = {};
  H.time.forEach((t, i) => { const p = localParts(t); (days[p.date] = days[p.date] || { wd: p.wd, dir: {} }).dir[p.hour] = H.wind_direction_80m[i]; });
  const ok = Object.keys(days).sort().filter(d => !['Sat', 'Sun'].includes(days[d].wd) && d.startsWith('2025') && Array.from({ length: 12 }, (_, k) => days[d].dir[6 + k]).every(v => v !== null && v !== undefined));
  return (WDAYS[m] = { days, ok, rows: H.time.length, missing: H.wind_direction_80m.filter(v => v === null || v === undefined).length }); }
function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function windFor(m, seed) { const W = windDays(m), r = mulberry32(seed * 7919 + (m === 'DFW' ? 17 : 31)), d = W.ok[Math.floor(r() * W.ok.length)];
  return { date: d, from: t => { const h = Math.floor(4 + t / 3600); return W.days[d].dir[h]; } }; }
const hv = deg => [Math.sin(deg * Math.PI / 180), Math.cos(deg * Math.PI / 180)];   // heading toward bearing deg (x east, y north)
// as noise.posAt, but the first dc m of ground track (climb-out) and the last dc m (approach) are on the into-the-wind heading
function posAtWind(wf) { return function (f, t, S, P) { const a = S[f[1]], b = S[f[2]], dx = b[0] - a[0], dy = b[1] - a[1], D = Math.hypot(dx, dy), q = Z.prof(D, P), ux = dx / D, uy = dy / D;
  const at = (s, z, src) => { let x = a[0] + ux * s, y = a[1] + uy * s;
    if (s < q.dc) { const w = hv(wf(t)); x = a[0] + w[0] * s; y = a[1] + w[1] * s; } else if (s > D - q.dc) { const w = hv(wf(t)); x = b[0] - w[0] * (D - s); y = b[1] - w[1] * (D - s); }
    return { x, y, z, src }; };
  if (t < f[3]) return null;
  if (t <= f[4]) { let e = t - f[3];
    if (e < q.tl) return at(0, P.padZ * e / q.tl, 'tol'); e -= q.tl;
    if (e < q.tr) { const k = e / q.tr; return at(q.dc * k, P.padZ + (q.zc - P.padZ) * k, 'tol'); } e -= q.tr;
    if (e < q.tc) return at(q.dc + P.vCruise * e, q.zc, 'cr'); e -= q.tc;
    if (e < q.tr) { const k = e / q.tr; return at(D - q.dc * (1 - k), q.zc - (q.zc - P.padZ) * k, 'tol'); }
    return at(D, P.padZ, 'tol'); }
  if (t < f[5]) return { x: b[0], y: b[1], z: 150, src: 'tol' };
  const e = t - f[5]; if (e <= q.tl) return at(D, P.padZ * (1 - e / q.tl), 'tol');
  return null; }; }
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
function run(m, li, seed, win, mode) { const hours = WINDOWS[win], c = cfg(m, li, seed, hours), res = N5.simulate(c), PG = popGrid(m), g = PG.g, G = new Z.Grid(g.x0, g.y0, g.nx, g.ny, STEP), SX = {};
  c.sites.forEach(s => SX[s.id] = s.xy); const WD = mode === 'wind' ? windFor(m, seed) : null; if (WD) G.posFn = posAtWind(WD.from); for (const f of res.trace) G.addFlight(f, SX, P, 0, WARM, WARM + hours * 3600);
  let cells1 = 0, dnlMax = -Infinity, p10 = 0, p50 = 0, p55 = 0, p65 = 0, cells65 = 0;
  for (let k = 0; k < g.nx * g.ny; k++) { const [x, y] = G.xy(k); if (Math.min(...c.sites.map(s => Math.hypot(x - s.xy[0], y - s.xy[1]))) <= 300) continue;
    const L = G.dnl(k), pp = PG.pop[k]; if (G.n55[k] >= 1) cells1++; if (L > dnlMax) dnlMax = L; if (G.n55[k] >= 10) p10 += pp; if (G.n55[k] >= 50) p50 += pp; if (L >= 55) p55 += pp; if (L >= 65) { p65 += pp; cells65++; } }
  return { mode, windDay: WD ? WD.date : null, cellsN55_1: cells1, metro: m, li, T: c.demand.reduce((a, d) => a + d.perHour, 0), seed, win, flights: res.trace.length, dnlOffsiteMax: +dnlMax.toFixed(2), popN55_10: Math.round(p10), popN55_50: Math.round(p50), popDNL55: Math.round(p55), popDNL65: Math.round(p65), cells65,
    n55: seed === 1 && win === 'D12' ? Array.from(G.n55) : undefined }; }
if (process.argv[2] === 'checks') { let bad = 0; const ok = (n, c, i) => { console.log((c ? 'ok  ' : 'FAIL') + ' ' + n + (i !== undefined ? ' ' + JSON.stringify(i) : '')); if (!c) bad++; };
  const D = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'taxi', 'airtaxi_data.json'), 'utf8'));
  for (const m of ['DFW', 'HOU']) for (let li = 0; li < 3; li++) { const r = run(m, li, 1, 'D12', 'line'), want = D.metros[m].levels[li].noise.cells, got = []; r.n55.forEach((v, k) => { if (v > 0) got.push([k, v]); });
    ok(`K1 ${m} level ${li} N55 cells match the page`, JSON.stringify(got) === JSON.stringify(want), [got.length, want.length]); }
  for (const m of ['DFW', 'HOU']) { const PG = popGrid(m); ok(`K2 ${m} population assigned = inside grid, > 100,000`, PG.assigned === PG.inside && PG.assigned > 100000, PG.assigned); }
  { const P0 = { padZ: 15, vLift: 2.5, slope: 8, vClimb: 31, cruiseZ: 610, vCruise: 67 }, S0 = { A: [0, 0], B: [30000, 0] }, f = ['x', 'A', 'B', 100, 1800, 1900, 1900], q = Z.prof(30000, P0);
    const tClimb = 100 + q.tl + q.tr * 0.5, tApp = 100 + q.tl + q.tr + q.tc + q.tr * 0.5;
    const pe = posAtWind(() => 90)(f, tClimb, S0, P0), pa = posAtWind(() => 90)(f, tApp, S0, P0), pn = posAtWind(() => 0)(f, tClimb, S0, P0);
    ok('K2 wind from east: climb-out goes east, approach comes from the west; wind from north: climb-out goes north', pe.x > 100 && Math.abs(pe.y) < 1 && pa.x > 30000 - 3500 && pa.x < 30000 && Math.abs(pa.y) < 1 && Math.abs(pn.x) < 1 && pn.y > 100, [Math.round(pe.x), Math.round(pa.x), Math.round(pn.y)]);
    for (const m of ['DFW', 'HOU']) { const W = windDays(m); ok(`K3 ${m} wind file: 8760 rows, none missing, >= 200 usable weekdays`, W.rows === 8760 && W.missing === 0 && W.ok.length >= 200, [W.rows, W.missing, W.ok.length]); }
    const a = localParts('2025-07-15T11:00'), b = localParts('2025-01-15T12:00'); ok('K3 local hour: 11:00 UTC on 15 Jul and 12:00 UTC on 15 Jan are 06:00 local', a.hour === 6 && b.hour === 6, [a.hour, b.hour]); }
  console.log(bad ? bad + ' FAILED' : 'ALL PASS'); process.exit(bad ? 1 : 0); }
const shard = +process.argv[2], nsh = +process.argv[3]; if (!(shard >= 0 && nsh > 0)) { console.error('usage: checks | <shard> <n>'); process.exit(2); }
const J = []; for (const m of ['DFW', 'HOU']) for (let li = 0; li < 3; li++) for (const s of SEEDS) for (const md of ['line', 'wind']) J.push([m, li, s, 'D12', md]);
const rows = []; for (let i = shard; i < J.length; i += nsh) { const r = run(...J[i]); delete r.n55; rows.push(r); fs.writeFileSync(path.join(OUT, `airtaxi_noisewind1_${shard}.json`), JSON.stringify(rows)); console.log(JSON.stringify(r)); }
console.log('done', rows.length);
