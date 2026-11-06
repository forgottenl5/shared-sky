'use strict';
// AIRTAXI_NET1 runner (registration: planned/AIRTAXI_NET1_PREREG.md). Usage:
//   node planned/airtaxi_net1_run.js checks            fast checks K2, K3 (K1 is taxi/test_net.js)
//   node planned/airtaxi_net1_run.js <shard> <n>       runs configurations with index % n == shard, writes out/airtaxi_net1_<shard>.json
const fs = require('fs'), path = require('path'), N = require('../taxi/net.js');

const SITES = {
  DFW: { lat0: 33.0, list: [['AFW', 32.9937909, -97.3100623, 2, 6], ['DFWc', 32.9133576, -97.0355091, 2, 6], ['TOY', 33.0811809, -96.841015, 2, 6], ['49T', 32.772891, -96.8024551, 2, 5]],
         routes: [['AFW', 'DFWc'], ['AFW', 'TOY'], ['DFWc', 'TOY'], ['DFWc', '49T']] },
  HOU: { lat0: 29.75, list: [['IAH', 29.9931058, -95.3416255, 2, 6], ['HOU', 29.6459141, -95.2768951, 2, 6], ['EFD', 29.6073333, -95.15875, 2, 6]],
         routes: [['IAH', 'HOU'], ['IAH', 'EFD']] } };
const P = { padZ: 15, vLift: 2.5, slope: 8, vClimb: 31, cruiseZ: 610, vCruise: 67 };
const O = { padOccupancy: 90, turnaround: 300, maxWait: 1800, reposition: true };
const WARM = 7200, HOURS = 12, FLEETS = [1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24], SEEDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const URANGE = [60, 100, 150], CHARGE = [1.5, 3.2], RATE = [0.5, 1.5, 3];

function sites(metro) { const M = SITES[metro], c = Math.cos(M.lat0 * Math.PI / 180);
  return M.list.map(([id, lat, lon, pads, stands]) => ({ id, xy: [(lon + 97) * 111320 * c, (lat - 30) * 110574], pads, stands })); }
function median(a) { if (!a.length) return null; const b = a.slice().sort((x, y) => x - y), m = b.length >> 1; return b.length % 2 ? b[m] : (b[m - 1] + b[m]) / 2; }
function pct(a, p) { if (!a.length) return null; const b = a.slice().sort((x, y) => x - y); return b[Math.min(b.length - 1, Math.floor(p * b.length))]; }
function config(metro, U, chg, r, fleetN, seed, vCruise) {
  const S = sites(metro), fleet = {}; S.forEach(s => fleet[s.id] = 0); for (let k = 0; k < fleetN; k++) fleet[S[k % S.length].id]++;
  const demand = []; for (const [a, b] of SITES[metro].routes) { demand.push({ from: a, to: b, perHour: r }); demand.push({ from: b, to: a, perHour: r }); }
  return { sites: S, fleet, aircraft: { seats: 4, rangeKm: U + 30, reserveKm: 30, routeFactor: 1.15, vtolKm: 5, chargeKmPerMin: chg },
    profile: Object.assign({}, P, vCruise ? { vCruise } : {}), ops: O, demand, hours: HOURS, warm: WARM, seed }; }
function summarize(res) {
  const ods = {}, all = [];
  for (const q of res.reqs) { const k = q.from + '>' + q.to; (ods[k] = ods[k] || []).push(q); }
  const f = qs => { const sv = qs.filter(q => q.served); const w = sv.map(q => q.wait), T = sv.map(q => q.arrive - q.t);
    return [qs.length, sv.length, median(T), median(w), pct(w, 0.9)]; };
  const out = {}; for (const k of Object.keys(ods)) out[k] = f(ods[k]);
  return { ods: out, tot: f(res.reqs) }; }

function allConfigs() { const L = [];
  for (const metro of ['DFW', 'HOU']) for (const U of URANGE) for (const c of CHARGE) for (const r of RATE) for (const n of FLEETS) for (const s of SEEDS) L.push({ metro, U, c, r, n, s, v: 0, tag: 'grid' });
  for (const metro of ['DFW', 'HOU']) for (const v of [55, 89]) for (const s of SEEDS) L.push({ metro, U: 100, c: 3.2, r: 1.5, n: 24, s, v, tag: 'speed' });
  return L; }

if (process.argv[2] === 'checks') {
  let fails = 0; const ok = (n, c, i) => { console.log((c ? 'ok  ' : 'FAIL') + ' ' + n + (i !== undefined ? ' ' + JSON.stringify(i) : '')); if (!c) fails++; };
  // K3: distances and flight times against the arithmetic written into the registration
  const want = { 'DFW:AFW>TOY': [44.9, 14.4], 'DFW:AFW>DFWc': [27.1, 9.9], 'DFW:DFWc>TOY': [26.0, 9.7], 'DFW:DFWc>49T': [26.8, 9.9], 'HOU:IAH>HOU': [39.1, 12.9], 'HOU:IAH>EFD': [46.4, 14.7] };
  for (const metro of ['DFW', 'HOU']) { const S = new Map(sites(metro).map(s => [s.id, s]));
    for (const [a, b] of SITES[metro].routes) { const d = Math.hypot(S.get(a).xy[0] - S.get(b).xy[0], S.get(a).xy[1] - S.get(b).xy[1]), ft = N.flightTime(d, P).total / 60, w = want[metro + ':' + a + '>' + b];
      console.log(metro, a, b, (d / 1000).toFixed(1) + ' km', ft.toFixed(1) + ' min');
      ok('K3 ' + metro + ' ' + a + '-' + b, Math.abs(d / 1000 / w[0] - 1) < 0.05 && Math.abs(ft / w[1] - 1) < 0.05, [+(d / 1000).toFixed(1), +ft.toFixed(1), w]); } }
  // K2: network not broken
  for (const metro of ['DFW', 'HOU']) { const sums = SEEDS.slice(0, 3).map(s => summarize(N.simulate(config(metro, 100, 3.2, 0.5, 24, s))).tot); const sv = sums.reduce((a, x) => a + x[1], 0), nn = sums.reduce((a, x) => a + x[0], 0);
    ok('K2 ' + metro + ' served share at fleet 24, r 0.5 >= 99 %', sv / nn >= 0.99, [sv, nn]); }
  console.log(fails ? fails + ' FAILED' : 'ALL PASS'); process.exit(fails ? 1 : 0);
}

const shard = +process.argv[2], nsh = +process.argv[3];
if (!(shard >= 0 && nsh > 0)) { console.error('usage: node planned/airtaxi_net1_run.js <shard> <n> | checks'); process.exit(2); }
const outDir = path.join(__dirname, '..', 'out'); fs.mkdirSync(outDir, { recursive: true });
const rows = []; const L = allConfigs();
for (let i = shard; i < L.length; i += nsh) { const c = L[i], res = N.simulate(config(c.metro, c.U, c.c, c.r, c.n, c.s, c.v)); rows.push(Object.assign({}, c, summarize(res))); }
fs.writeFileSync(path.join(outDir, 'airtaxi_net1_' + shard + '.json'), JSON.stringify(rows));
console.log('shard', shard, 'of', nsh, 'rows', rows.length);
