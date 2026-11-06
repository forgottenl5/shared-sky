'use strict';
// AIRTAXI_NET4 runner (registration planned/AIRTAXI_NET4_PREREG.md). Engine taxi/net5.js.
//   node planned/airtaxi_net4_run.js checks          K1-K3
//   node planned/airtaxi_net4_run.js <shard> <n>     -> out/airtaxi_net4_<shard>.json (Part A rows and Part B fleet-search rows)
const fs = require('fs'), path = require('path'), N5 = require('../taxi/net5.js');
const KM = 60 * 67 / 1000, AC = U => ({ seats: 4, routeFactor: 1.15, vtolKm: 5, chargeKmPerMin: 3.2, rangeKm: U + 20 * KM, reserveMin: 20 });
const P = { padZ: 15, vLift: 2.5, slope: 8, vClimb: 31, cruiseZ: 610, vCruise: 67 }, WARM = 7200, HOURS = 12, SEEDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const xyOf = (lat0, lat, lon) => [(lon + 97) * 111320 * Math.cos(lat0 * Math.PI / 180), (lat - 30) * 110574];
// ---- Part A: NET1 network
const A = { DFW: { lat0: 33.0, list: [['AFW', 32.9937909, -97.3100623], ['DFWc', 32.9133576, -97.0355091], ['TOY', 33.0811809, -96.841015], ['49T', 32.772891, -96.8024551]], routes: [['AFW', 'DFWc'], ['AFW', 'TOY'], ['DFWc', 'TOY'], ['DFWc', '49T']] },
  HOU: { lat0: 29.75, list: [['IAH', 29.9931058, -95.3416255], ['HOU', 29.6459141, -95.2768951], ['EFD', 29.6073333, -95.15875]], routes: [['IAH', 'HOU'], ['IAH', 'EFD']] } };
function configA(metro, seed) { const M = A[metro], sites = M.list.map(([id, lat, lon]) => ({ id, xy: xyOf(M.lat0, lat, lon), pads: 2, stands: 10 }));
  const fleet = {}; sites.forEach(s => fleet[s.id] = 0); for (let k = 0; k < 24; k++) fleet[sites[k % sites.length].id]++;
  const demand = []; for (const [a, b] of M.routes) { demand.push({ from: a, to: b, perHour: 1.5 }); demand.push({ from: b, to: a, perHour: 1.5 }); }
  return { sites, fleet, aircraft: AC(100), profile: P, ops: { padOccupancy: 90, turnaround: 300, maxWait: 1800, reposition: true, padRule: 'slot' }, demand, hours: HOURS, warm: WARM, seed }; }
function median(a) { if (!a.length) return null; const b = a.slice().sort((x, y) => x - y), m = b.length >> 1; return b.length % 2 ? b[m] : (b[m - 1] + b[m]) / 2; }
function pct(a, p) { if (!a.length) return 0; const b = a.slice().sort((x, y) => x - y); return b[Math.min(b.length - 1, Math.floor(p * b.length))]; }
function runA(metro, seed) { const res = N5.simulate(configA(metro, seed)), ods = {};
  for (const q of res.reqs) { const k = q.from + '>' + q.to; (ods[k] = ods[k] || []).push(q); }
  const o = {}; for (const k in ods) { const sv = ods[k].filter(q => q.served); o[k] = [ods[k].length, sv.length, median(sv.map(q => q.arrive - q.t))]; }
  return { part: 'A', metro, seed, ods: o }; }
// ---- Part B: Archer network
const SJ = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'out', 'access1b_sites.json'), 'utf8')).metros;
const B = { DFW: { lat0: 33.0, pairs: [['ADS', 'FTW', .249], ['DAL', 'FTW', .234], ['FRS', 'FTW', .224], ['FRS', 'GKY', .165], ['ADS', 'GKY', .082], ['AFW', 'DAL', .047]], totals: [12, 24, 48] },
  HOU: { lat0: 29.75, pairs: [['IAH', 'SGR', .300], ['HOU', 'IAH', .229], ['GLS', 'IAH', .175], ['GLS', 'SGR', .125], ['GLS', 'THO', .102], ['HOU', 'SGR', .069]], totals: [6, 12, 24] } };
const FLEETS = [4, 6, 8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64];
function sitesB(metro, pads, S) { return SJ[metro].sites.map(s => ({ id: s.id, xy: xyOf(B[metro].lat0, s.lat, s.lon), pads, stands: S })); }
function groundB(metro, ti) { const top = ti === 2; return { pads: top ? 4 : 2, S: top && metro === 'DFW' ? 16 : 12 }; }
function configB(metro, ti, F, seed, U) { const { pads, S } = groundB(metro, ti), sites = sitesB(metro, pads, S), n = sites.length, T = B[metro].totals[ti];
  const fleet = {}; sites.forEach(s => fleet[s.id] = 0); const used = sites.map(() => 0);
  for (let k = 0, i = 0; k < F && i < 10000; i++) { const j = i % n; if (used[j] < S) { used[j]++; fleet[sites[j].id]++; k++; } }
  const demand = []; for (const [a, b, w] of B[metro].pairs) { demand.push({ from: a, to: b, perHour: T * w / 2 }); demand.push({ from: b, to: a, perHour: T * w / 2 }); }
  return { sites, fleet, aircraft: AC(U), profile: P, ops: { padOccupancy: 90, turnaround: 300, maxWait: 1800, reposition: true, padRule: 'slot' }, demand, hours: HOURS, warm: WARM, seed }; }
function measureB(res, S) { const E = res.end, feas = res.reqs.filter(q => !q.infeasible), sv = feas.filter(q => q.served), land = res.sites.reduce((a, s) => a + s.landings, 0), holds = [];
  for (const s of res.sites) holds.push(...s.arrHold.filter(x => x[0] >= WARM && x[0] < E).map(x => x[1]));
  const t = { n: res.reqs.length, infeasible: res.reqs.length - feas.length, nFeas: feas.length, served: sv.length, servedShare: feas.length ? sv.length / feas.length : 0, medWait: median(sv.map(q => q.wait)),
    holdP95: pct(holds, 0.95), belowShare: land ? res.belowReserve / land : 0, maxHeld: Object.fromEntries(res.sites.map(s => [s.id, s.maxHeld])), ledgerOk: res.sites.every(s => s.maxHeld <= S),
    flights: res.sites.reduce((a, s) => a + s.takeoffs, 0), infeasPairs: [...new Set(res.reqs.filter(q => q.infeasible).map(q => [q.from, q.to].sort().join('-')))].sort() };
  t.meets = t.servedShare >= 0.95 && t.medWait !== null && t.medWait <= 600 && t.holdP95 <= 120 && t.belowShare <= 0.01 && t.ledgerOk; return t; }
function searchB(metro, ti, seed, U) { const { S } = groundB(metro, ti), tried = [];
  for (const F of FLEETS) { if (F > S * SJ[metro].sites.length) break; const res = N5.simulate(Object.assign(configB(metro, ti, F, seed, U), { trace: true })), m = measureB(res, S);
    m.deadShare = res.trace.length ? res.trace.filter(f => f[7]).length / res.trace.length : 0; tried.push(Object.assign({ F }, m)); if (m.meets) return { part: 'B', metro, ti, T: B[metro].totals[ti], seed, U, fleet: F, at: tried[tried.length - 1], tried: tried.length }; }
  return { part: 'B', metro, ti, T: B[metro].totals[ti], seed, U, fleet: null, at: tried[tried.length - 1], tried: tried.length }; }
// ---- checks
if (process.argv[2] === 'checks') { let bad = 0; const ok = (n, c, i) => { console.log((c ? 'ok  ' : 'FAIL') + ' ' + n + (i !== undefined ? ' ' + JSON.stringify(i) : '')); if (!c) bad++; };
  const want = { 'ADS-FTW': 51.6, 'DAL-FTW': 48.0, 'FRS-FTW': 59.4, 'FRS-GKY': 55.5, 'ADS-GKY': 41.4, 'AFW-DAL': 46.9, 'IAH-SGR': 50.3, 'HOU-IAH': 38.0, 'GLS-IAH': 92.1, 'GLS-SGR': 86.5, 'GLS-THO': 74.4, 'HOU-SGR': 36.8 };
  for (const m of ['DFW', 'HOU']) { const X = new Map(sitesB(m, 2, 12).map(s => [s.id, s.xy])); for (const [a, b] of B[m].pairs) { const d = Math.hypot(X.get(a)[0] - X.get(b)[0], X.get(a)[1] - X.get(b)[1]) / 1000; ok(`K1 ${a}-${b}`, Math.abs(d / want[a + '-' + b] - 1) < 0.02, +d.toFixed(1)); } }
  for (const [U, exp] of [[100, ['GLS-IAH', 'GLS-SGR']], [144, []]]) { const m = measureB(N5.simulate(configB('HOU', 1, 40, 1, U)), 12); ok(`K2 U${U} infeasible pairs`, JSON.stringify(m.infeasPairs) === JSON.stringify(exp), m.infeasPairs); }
  for (const m of ['DFW', 'HOU']) { const r = N5.simulate(configA(m, 1)), sv = r.reqs.filter(q => q.served).length; ok(`K3 ${m} fleet 24 served >= 99 %`, sv / r.reqs.length >= 0.99, [sv, r.reqs.length]); }
  console.log(bad ? bad + ' FAILED' : 'ALL PASS'); process.exit(bad ? 1 : 0); }
const shard = +process.argv[2], nsh = +process.argv[3];
if (!(shard >= 0 && nsh > 0)) { console.error('usage: node planned/airtaxi_net4_run.js checks | <shard> <n>'); process.exit(2); }
const jobs = [];
for (const m of ['DFW', 'HOU']) for (const s of SEEDS) jobs.push(['A', m, s]);
for (const m of ['DFW', 'HOU']) for (let ti = 0; ti < 3; ti++) for (const s of SEEDS) { jobs.push(['B', m, ti, s, 100]); if (m === 'HOU') jobs.push(['B', m, ti, s, 144]); }
const rows = [], outF = path.join(__dirname, '..', 'out', `airtaxi_net4_${shard}.json`);
for (let i = shard; i < jobs.length; i += nsh) { const j = jobs[i], t0 = Date.now(), r = j[0] === 'A' ? runA(j[1], j[2]) : searchB(j[1], j[2], j[3], j[4]); r.wall_s = (Date.now() - t0) / 1000; rows.push(r);
  fs.writeFileSync(outF, JSON.stringify(rows)); console.log(JSON.stringify({ i, part: r.part, metro: r.metro, T: r.T, seed: r.seed, U: r.U, fleet: r.fleet, wall: r.wall_s })); }
console.log('done', rows.length);
