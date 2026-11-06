'use strict';
// AIRTAXI_POWER1 runner (registration planned/AIRTAXI_POWER1_PREREG.md). Engine taxi/net5.js.
//   node planned/airtaxi_power1_run.js checks        K1, K2 on seed 1 of every setup
//   node planned/airtaxi_power1_run.js <shard> <n>   -> out/airtaxi_power1_<shard>.json
const fs = require('fs'), path = require('path'), N5 = require('../taxi/net5.js');
const KM = 60 * 67 / 1000, AC = U => ({ seats: 4, routeFactor: 1.15, vtolKm: 5, chargeKmPerMin: 3.2, rangeKm: U + 20 * KM, reserveMin: 20 });
const P = { padZ: 15, vLift: 2.5, slope: 8, vClimb: 31, cruiseZ: 610, vCruise: 67 }, WARM = 7200, HOURS = 12, SEEDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], E = [0.45, 0.65, 0.85];
const xyOf = (lat0, lat, lon) => [(lon + 97) * 111320 * Math.cos(lat0 * Math.PI / 180), (lat - 30) * 110574];
const OUT = path.join(__dirname, '..', 'out');
// 7-site networks: identical to taxi/export_airtaxi.js
const S7 = { DFW: { lat0: 33.0, list: [['AFW', 32.9937909, -97.3100623], ['DFWc', 32.9133576, -97.0355091], ['TOY', 33.0811809, -96.841015], ['49T', 32.772891, -96.8024551]], routes: [['AFW', 'DFWc'], ['AFW', 'TOY'], ['DFWc', 'TOY'], ['DFWc', '49T']], levels: [[1.5, 2, 6], [3, 2, 8], [6, 4, 12]] },
  HOU: { lat0: 29.75, list: [['IAH', 29.9931058, -95.3416255], ['HOU', 29.6459141, -95.2768951], ['EFD', 29.6073333, -95.15875]], routes: [['IAH', 'HOU'], ['IAH', 'EFD']], levels: [[1.5, 2, 6], [3, 2, 8], [6, 4, 10]] } };
const NET3 = {}; for (const f of fs.readdirSync(OUT).filter(f => f.startsWith('airtaxi_net3_fleet_'))) for (const x of JSON.parse(fs.readFileSync(path.join(OUT, f)))) if (x.arm === 'U100') NET3[[x.metro, x.r, x.s].join('|')] = x.fleet;
function place(sites, F, S) { const fleet = {}; sites.forEach(s => fleet[s.id] = 0); const used = sites.map(() => 0);
  for (let k = 0, i = 0; k < F && i < 10000; i++) { const j = i % sites.length; if (used[j] < S) { used[j]++; fleet[sites[j].id]++; k++; } } return fleet; }
function cfg7(m, li, seed) { const M = S7[m], [r, pads, S] = M.levels[li], sites = M.list.map(([id, lat, lon]) => ({ id, xy: xyOf(M.lat0, lat, lon), pads, stands: S })), F = NET3[[m, r, seed].join('|')];
  const demand = []; for (const [a, b] of M.routes) { demand.push({ from: a, to: b, perHour: r }); demand.push({ from: b, to: a, perHour: r }); }
  return { tag: `7site ${m} ${r * demand.length}/h`, net: '7site', metro: m, T: r * demand.length, F, cfg: { sites, fleet: place(sites, F, S), aircraft: AC(100), profile: P, ops: { padOccupancy: 90, turnaround: 300, maxWait: 1800, reposition: true, padRule: 'slot' }, demand, hours: HOURS, warm: WARM, seed, trace: true } }; }
// Archer networks: identical to planned/airtaxi_net4_run.js Part B, fleet NET4 found per seed (U100)
const SJ = JSON.parse(fs.readFileSync(path.join(OUT, 'access1b_sites.json'), 'utf8')).metros;
const B = { DFW: { lat0: 33.0, pairs: [['ADS', 'FTW', .249], ['DAL', 'FTW', .234], ['FRS', 'FTW', .224], ['FRS', 'GKY', .165], ['ADS', 'GKY', .082], ['AFW', 'DAL', .047]], totals: [12, 24, 48] },
  HOU: { lat0: 29.75, pairs: [['IAH', 'SGR', .300], ['HOU', 'IAH', .229], ['GLS', 'IAH', .175], ['GLS', 'SGR', .125], ['GLS', 'THO', .102], ['HOU', 'SGR', .069]], totals: [6, 12, 24] } };
const NET4 = {}; for (const f of fs.readdirSync(OUT).filter(f => /^airtaxi_net4_\d+\.json$/.test(f))) for (const x of JSON.parse(fs.readFileSync(path.join(OUT, f)))) if (x.part === 'B' && x.U === 100) NET4[[x.metro, x.ti, x.seed].join('|')] = x.fleet;
function cfgA(m, ti, seed) { const top = ti === 2, pads = top ? 4 : 2, S = top && m === 'DFW' ? 16 : 12, T = B[m].totals[ti], F = NET4[[m, ti, seed].join('|')];
  const sites = SJ[m].sites.map(s => ({ id: s.id, xy: xyOf(B[m].lat0, s.lat, s.lon), pads, stands: S }));
  const demand = []; for (const [a, b, w] of B[m].pairs) { demand.push({ from: a, to: b, perHour: T * w / 2 }); demand.push({ from: b, to: a, perHour: T * w / 2 }); }
  return { tag: `archer ${m} ${T}/h`, net: 'archer', metro: m, T, F, cfg: F ? { sites, fleet: place(sites, F, S), aircraft: AC(100), profile: P, ops: { padOccupancy: 90, turnaround: 300, maxWait: 1800, reposition: true, padRule: 'slot' }, demand, hours: HOURS, warm: WARM, seed, trace: true } : null }; }
// ---- charging rebuilt from the trace: per site, number of aircraft charging in each minute of the run
function rebuild(c, res) { const A = c.aircraft, R = A.rangeKm, rate = A.chargeKmPerMin, holdPerMin = 60 * c.profile.vCruise / 1000, X = new Map(c.sites.map(s => [s.id, s.xy]));
  const D = (a, b) => Math.hypot(X.get(a)[0] - X.get(b)[0], X.get(a)[1] - X.get(b)[1]), endMin = Math.ceil(res.end / 60);
  const charging = Object.fromEntries(c.sites.map(s => [s.id, new Float64Array(endMin + 1)])), byAc = {}, start = [];
  for (const [sid, n] of Object.entries(c.fleet)) for (let k = 0; k < n; k++) start.push(sid);   // engine numbers aircraft in fleet order
  for (const f of res.trace) (byAc[f[0]] = byAc[f[0]] || []).push(f);
  let used = 0, charged = 0, k1max = 0, k1bad = 0, socEnd = 0;
  const addCharge = (site, t0, t1, soc) => { // charge from t0 to t1 (s) starting at soc; returns soc at t1, marks charging minutes (fractional)
    if (t1 <= t0 || soc >= R) return soc; const tFull = t0 + (R - soc) / rate * 60, tEnd = Math.min(t1, tFull), arr = charging[site];
    for (let m = Math.floor(t0 / 60); m * 60 < tEnd && m <= endMin; m++) { const a = Math.max(t0, m * 60), b = Math.min(tEnd, (m + 1) * 60); if (b > a) arr[m] += (b - a) / 60; }
    charged += (tEnd - t0) / 60 * rate; return Math.min(R, soc + (tEnd - t0) / 60 * rate); };
  res.aircraft.forEach((ac, i) => { const F = (byAc[i] || []).sort((a, b) => a[3] - b[3]); let soc = R, site = start[i], tFree = 0;
    for (const f of F) { soc = addCharge(site, tFree, f[3], soc); const e = D(f[1], f[2]) / 1000 * A.routeFactor + A.vtolKm + (f[5] - f[4]) / 60 * holdPerMin; soc -= e; used += e; site = f[2]; tFree = f[6]; }
    // K1 (deviation 1): the engine tops up an idle aircraft lazily, up to its last charge update (ac.readyAt), so compare there
    const tCmp = Math.max(tFree, ac.readyAt), saveC = charged, socCmp = tCmp > tFree ? Math.min(R, soc + (tCmp - tFree) / 60 * rate) : soc; charged = saveC;
    const d = Math.abs(socCmp - ac.soc); k1max = Math.max(k1max, d); if (d > 0.5) k1bad++;
    soc = addCharge(site, tFree, res.end, soc); socEnd += soc; });
  const nAc = res.aircraft.length, k2 = Math.abs(charged - (used - (nAc * R - socEnd))) / Math.max(1, used);
  return { charging, k1max, k1bad, k2, usedKm: used, chargedKm: charged }; }
function measure(job) { if (!job.cfg) return Object.assign({}, job, { cfg: undefined, skipped: true });
  const res = N5.simulate(job.cfg), rb = rebuild(job.cfg, res), m0 = Math.floor(WARM / 60), m1 = Math.floor(res.end / 60), sites = {};
  for (const [id, arr] of Object.entries(rb.charging)) { let pk = 0, sum = 0; for (let m = m0; m < m1; m++) { pk = Math.max(pk, arr[m]); sum += arr[m]; }
    sites[id] = { peakCharging: +pk.toFixed(2), chargingAcHours: +(sum / 60).toFixed(2), byE: Object.fromEntries(E.map(e => [e, { peakMW: +(pk * 3.2 * 60 * e / 1000).toFixed(3), MWh: +(sum / 60 * 3.2 * 60 * e / 1000).toFixed(3) }])) }; }
  const sv = res.reqs.filter(q => q.served && !q.infeasible).length, nf = res.reqs.filter(q => !q.infeasible).length;
  return { net: job.net, metro: job.metro, T: job.T, F: job.F, seed: job.cfg.seed, served: sv, feasible: nf, k1max: +rb.k1max.toFixed(4), k1bad: rb.k1bad, k2: +rb.k2.toFixed(5), sites }; }
function jobs() { const J = []; for (const m of ['DFW', 'HOU']) for (let li = 0; li < 3; li++) for (const s of SEEDS) { J.push(['7', m, li, s]); J.push(['A', m, li, s]); } return J; }
const mk = ([k, m, li, s]) => k === '7' ? cfg7(m, li, s) : cfgA(m, li, s);
if (process.argv[2] === 'checks') { let bad = 0;
  for (const j of jobs().filter(j => j[3] === 1)) { const r = measure(mk(j)); if (r.skipped) { console.log('skip (no fleet)', j); continue; }
    const ok = r.k1bad === 0 && r.k2 <= 0.01; if (!ok) bad++; console.log((ok ? 'ok  ' : 'FAIL') + ` ${r.net} ${r.metro} ${r.T}/h F${r.F}: K1 max diff ${r.k1max} km (${r.k1bad} aircraft over 0.5), K2 ${(100 * r.k2).toFixed(3)} %`); }
  console.log(bad ? bad + ' FAILED' : 'ALL PASS'); process.exit(bad ? 1 : 0); }
const shard = +process.argv[2], nsh = +process.argv[3]; if (!(shard >= 0 && nsh > 0)) { console.error('usage: checks | <shard> <n>'); process.exit(2); }
const rows = []; const J = jobs(); for (let i = shard; i < J.length; i += nsh) { rows.push(measure(mk(J[i]))); fs.writeFileSync(path.join(OUT, `airtaxi_power1_${shard}.json`), JSON.stringify(rows)); }
console.log('done', rows.length);
