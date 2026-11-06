'use strict';
// AIRTAXI_NET2 runner (registration: planned/AIRTAXI_NET2_PREREG.md), engine taxi/net2.js. Usage:
//   node planned/airtaxi_net2_run.js checks             K3 on a few runs (K1: node taxi/test_net2.js && node taxi/test_net.js)
//   node planned/airtaxi_net2_run.js fleet <shard> <n>  fleet search  -> out/airtaxi_net2_fleet_<shard>.json
//   node planned/airtaxi_net2_run.js pads <shard> <n>   pad cases (needs all fleet files) -> out/airtaxi_net2_pads_<shard>.json
const fs = require('fs'), path = require('path'), N = require('../taxi/net2.js');
const SITES = {   // identical to planned/airtaxi_net1_run.js
  DFW: { lat0: 33.0, list: [['AFW', 32.9937909, -97.3100623, 2, 6], ['DFWc', 32.9133576, -97.0355091, 2, 6], ['TOY', 33.0811809, -96.841015, 2, 6], ['49T', 32.772891, -96.8024551, 2, 5]],
         routes: [['AFW', 'DFWc'], ['AFW', 'TOY'], ['DFWc', 'TOY'], ['DFWc', '49T']] },
  HOU: { lat0: 29.75, list: [['IAH', 29.9931058, -95.3416255, 2, 6], ['HOU', 29.6459141, -95.2768951, 2, 6], ['EFD', 29.6073333, -95.15875, 2, 6]],
         routes: [['IAH', 'HOU'], ['IAH', 'EFD']] } };
const P = { padZ: 15, vLift: 2.5, slope: 8, vClimb: 31, cruiseZ: 610, vCruise: 67 };
const WARM = 7200, HOURS = 12, SEEDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], RATES = [1.5, 3, 6, 12];
const FLEETS = [2, 3, 4, 5, 6, 8, 10, 12, 14, 16, 20, 24, 28, 32, 40, 48, 56, 64, 80, 96], PADS = [1, 2, 4], OCC = [60, 90, 180];
const outDir = path.join(__dirname, '..', 'out');

function sites(metro, pads) { const M = SITES[metro], c = Math.cos(M.lat0 * Math.PI / 180);
  return M.list.map(([id, lat, lon, , stands]) => ({ id, xy: [(lon + 97) * 111320 * c, (lat - 30) * 110574], pads, stands: 1e9 })); }
function median(a) { if (!a.length) return null; const b = a.slice().sort((x, y) => x - y), m = b.length >> 1; return b.length % 2 ? b[m] : (b[m - 1] + b[m]) / 2; }
function pct(a, p) { if (!a.length) return 0; const b = a.slice().sort((x, y) => x - y); return b[Math.min(b.length - 1, Math.floor(p * b.length))]; }
function config(metro, chg, r, fleetN, seed, pads, occ) {
  const S = sites(metro, pads), fleet = {}; S.forEach(s => fleet[s.id] = 0); for (let k = 0; k < fleetN; k++) fleet[S[k % S.length].id]++;
  const demand = []; for (const [a, b] of SITES[metro].routes) { demand.push({ from: a, to: b, perHour: r }); demand.push({ from: b, to: a, perHour: r }); }
  return { sites: S, fleet, aircraft: { seats: 4, rangeKm: 130, reserveKm: 30, routeFactor: 1.15, vtolKm: 5, chargeKmPerMin: chg },
    profile: P, ops: { padOccupancy: occ, turnaround: 300, maxWait: 1800, reposition: true }, demand, hours: HOURS, warm: WARM, seed }; }
function network(res) { const sv = res.reqs.filter(q => q.served); const fl = res.aircraft.reduce((a, x) => a + x.flights, 0), dh = res.aircraft.reduce((a, x) => a + x.dead, 0);
  return { n: res.reqs.length, served: sv.length, medWait: median(sv.map(q => q.wait)), flights: fl, dead: dh }; }
const meets = t => t.n && t.served / t.n >= 0.95 && t.medWait !== null && t.medWait <= 600;
function siteSummary(res) {
  const W = WARM, E = res.end, endAt = {}; for (const x of res.aircraft) endAt[x.at] = (endAt[x.at] || 0) + 1;
  const out = {}; let k3 = true;
  for (const s of res.sites) {
    if (s.stays.length !== s.takeoffs + (endAt[s.id] || 0)) k3 = false;
    if (s.arrHold.some(x => x[1] < -1e-9) || s.depWait.some(x => x[1] < -1e-9)) k3 = false;
    const mov = s.mov.filter(t => t >= W && t < E), bins = new Array(HOURS).fill(0); for (const t of mov) bins[Math.min(HOURS - 1, Math.floor((t - W) / 3600))]++;
    const hold = s.arrHold.filter(x => x[0] >= W && x[0] < E).map(x => x[1]), dw = s.depWait.filter(x => x[0] >= W && x[0] < E).map(x => x[1]);
    // time-weighted stand occupancy over [W, E]
    const ev = []; for (const [a, b] of s.stays) { const a2 = Math.max(a, W), b2 = Math.min(b, E); if (b2 > a2) { ev.push([a2, 1]); ev.push([b2, -1]); } }
    ev.sort((x, y) => x[0] - y[0] || x[1] - y[1]);
    let occ = s.stays.filter(([a, b]) => a < W && b >= W).length * 0, cur = 0, last = W, max = 0; const tAt = {};
    for (const [t, d] of ev) { tAt[cur] = (tAt[cur] || 0) + (t - last); last = t; cur += d; if (cur > max) max = cur; }
    tAt[cur] = (tAt[cur] || 0) + (E - last);
    let acc = 0, p95 = 0; for (const L of Object.keys(tAt).map(Number).sort((a, b) => a - b)) { acc += tAt[L]; if (acc / (E - W) >= 0.95) { p95 = L; break; } }
    out[s.id] = { mov: mov.length, busiest: Math.max(...bins), holdP95: pct(hold, 0.95), depP95: pct(dw, 0.95), standMax: max, standP95: p95 };
  }
  return { sites: out, k3 }; }

const mode = process.argv[2];
if (mode === 'checks') {
  let bad = 0;
  for (const [metro, r, n, pads, occ] of [['DFW', 3, 12, 1, 180], ['HOU', 6, 10, 2, 90], ['DFW', 12, 40, 4, 60]]) {
    const s = siteSummary(N.simulate(config(metro, 3.2, r, n, 1, pads, occ))); console.log((s.k3 ? 'ok  ' : 'FAIL') + ' K3', metro, r, n, pads, occ, JSON.stringify(s.sites)); if (!s.k3) bad++; }
  console.log(bad ? bad + ' FAILED' : 'ALL PASS'); process.exit(bad ? 1 : 0);
}
const shard = +process.argv[3], nsh = +process.argv[4];
if (!['fleet', 'pads'].includes(mode) || !(shard >= 0 && nsh > 0)) { console.error('usage: node planned/airtaxi_net2_run.js checks | fleet <shard> <n> | pads <shard> <n>'); process.exit(2); }
fs.mkdirSync(outDir, { recursive: true });
const rows = [];
if (mode === 'fleet') {
  const jobs = []; for (const metro of ['DFW', 'HOU']) { for (const r of RATES) for (const s of SEEDS) jobs.push([metro, 3.2, r, s]); for (const s of SEEDS) jobs.push([metro, 1.5, 1.5, s]); }
  for (let i = shard; i < jobs.length; i += nsh) { const [metro, c, r, s] = jobs[i]; let found = 96, t = null;
    for (const n of FLEETS) { const res = N.simulate(config(metro, c, r, n, s, 8, 90)); t = network(res); if (meets(t)) { found = n; break; } }
    rows.push({ metro, c, r, s, fleet: found, net: t }); }
} else {
  const fl = {}; for (const f of fs.readdirSync(outDir).filter(f => f.startsWith('airtaxi_net2_fleet_'))) for (const x of JSON.parse(fs.readFileSync(path.join(outDir, f)))) fl[[x.metro, x.c, x.r, x.s].join('|')] = x.fleet;
  const jobs = []; for (const metro of ['DFW', 'HOU']) for (const r of RATES) for (const s of SEEDS) for (const pads of PADS) for (const occ of OCC) jobs.push([metro, r, s, pads, occ]);
  for (let i = shard; i < jobs.length; i += nsh) { const [metro, r, s, pads, occ] = jobs[i], n = fl[[metro, 3.2, r, s].join('|')];
    if (n === undefined) { console.error('missing fleet result for', metro, r, s); process.exit(1); }
    const res = N.simulate(config(metro, 3.2, r, n, s, pads, occ)), ss = siteSummary(res);
    rows.push({ metro, r, s, pads, occ, fleet: n, net: network(res), sites: ss.sites, k3: ss.k3 }); }
}
fs.writeFileSync(path.join(outDir, 'airtaxi_net2_' + mode + '_' + shard + '.json'), JSON.stringify(rows));
console.log(mode, 'shard', shard, 'of', nsh, 'rows', rows.length);
