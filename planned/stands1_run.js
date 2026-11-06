'use strict';
// STANDS1 runner (registration planned/STANDS1_PREREG.md). Engine taxi/net4.js; NET3 comparison on taxi/net3.js.
// Usage: node planned/stands1_run.js <shard> <n>   -> out/stands1_<shard>.json
const fs = require('fs'), path = require('path'), N4 = require('../taxi/net4.js'), N3 = require('../taxi/net3.js');
const KM = 60 * 67 / 1000, U100 = { rangeKm: 100 + 20 * KM, reserveMin: 20 };
const SITES = {   // identical to planned/airtaxi_net3_run.js (last field = NET1 stand input)
  DFW: { lat0: 33.0, list: [['AFW', 32.9937909, -97.3100623, 2, 6], ['DFWc', 32.9133576, -97.0355091, 2, 6], ['TOY', 33.0811809, -96.841015, 2, 6], ['49T', 32.772891, -96.8024551, 2, 5]],
         routes: [['AFW', 'DFWc'], ['AFW', 'TOY'], ['DFWc', 'TOY'], ['DFWc', '49T']] },
  HOU: { lat0: 29.75, list: [['IAH', 29.9931058, -95.3416255, 2, 6], ['HOU', 29.6459141, -95.2768951, 2, 6], ['EFD', 29.6073333, -95.15875, 2, 6]],
         routes: [['IAH', 'HOU'], ['IAH', 'EFD']] } };
const P = { padZ: 15, vLift: 2.5, slope: 8, vClimb: 31, cruiseZ: 610, vCruise: 67 };
const WARM = 7200, HOURS = 12, SEEDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], RATES = [1.5, 3, 6, 12], UNI = [2, 3, 4, 5, 6, 8, 10, 12, 14, 16, 20, 24];
const outDir = path.join(__dirname, '..', 'out');
function median(a) { if (!a.length) return null; const b = a.slice().sort((x, y) => x - y), m = b.length >> 1; return b.length % 2 ? b[m] : (b[m - 1] + b[m]) / 2; }
function pct(a, p) { if (!a.length) return 0; const b = a.slice().sort((x, y) => x - y); return b[Math.min(b.length - 1, Math.floor(p * b.length))]; }
function standsFor(arm, metro) { return SITES[metro].list.map(s => arm === 'UNL' ? undefined : arm === 'REAL' ? s[4] : +arm.slice(1)); }
function config(metro, r, F, seed, stands) {
  const M = SITES[metro], c = Math.cos(M.lat0 * Math.PI / 180);
  const sites = M.list.map(([id, lat, lon], i) => ({ id, xy: [(lon + 97) * 111320 * c, (lat - 30) * 110574], pads: 2, stands: stands[i] }));
  const cap = stands.map(s => s === undefined ? Infinity : s); if (F > cap.reduce((a, b) => a + b, 0)) return null;   // cannot park
  const fleet = {}, used = sites.map(() => 0); sites.forEach(s => fleet[s.id] = 0);
  for (let k = 0, i = 0; k < F; i++) { const j = i % sites.length; if (used[j] < cap[j]) { used[j]++; fleet[sites[j].id]++; k++; } }
  const demand = []; for (const [a, b] of M.routes) { demand.push({ from: a, to: b, perHour: r }); demand.push({ from: b, to: a, perHour: r }); }
  return { cfg: { sites, fleet, aircraft: Object.assign({ seats: 4, routeFactor: 1.15, vtolKm: 5, chargeKmPerMin: 3.2 }, U100), profile: P,
    ops: { padOccupancy: 90, turnaround: 300, maxWait: 1800, reposition: true }, demand, hours: HOURS, warm: WARM, seed }, placed: used, cap }; }
function measure(res) {
  const E = res.end, sv = res.reqs.filter(q => q.served), land = res.sites.reduce((a, s) => a + s.landings, 0);
  const holds = [], perSite = {};
  for (const s of res.sites) { const h = s.arrHold.filter(x => x[0] >= WARM && x[0] < E).map(x => x[1]); holds.push(...h); perSite[s.id] = pct(h, 0.95); }
  const t = { n: res.reqs.length, served: sv.length, servedShare: res.reqs.length ? sv.length / res.reqs.length : 0, medWait: median(sv.map(q => q.wait)),
    holdP95: pct(holds, 0.95), belowShare: land ? res.belowReserve / land : 0, standOverflow: res.standOverflow || 0, stillHolding: res.stillHolding || 0, siteHoldP95: perSite };
  t.meets = t.servedShare >= 0.95 && t.medWait !== null && t.medWait <= 600 && t.holdP95 <= 120 && t.belowShare <= 0.01; return t; }
// fleets from NET3
const fl = {}; for (const f of fs.readdirSync(outDir).filter(f => f.startsWith('airtaxi_net3_fleet_'))) for (const x of JSON.parse(fs.readFileSync(path.join(outDir, f)))) if (x.arm === 'U100') fl[[x.metro, x.r, x.s].join('|')] = x.fleet;
const shard = +process.argv[2], nsh = +process.argv[3];
if (!(shard >= 0 && nsh > 0)) { console.error('usage: node planned/stands1_run.js <shard> <n>'); process.exit(2); }
const jobs = []; for (const metro of ['DFW', 'HOU']) for (const r of RATES) for (const s of SEEDS) for (const arm of ['NET3', 'UNL', 'REAL', ...UNI.map(u => 'S' + u)]) jobs.push([metro, r, s, arm]);
const rows = []; let k3missing = 0, k2bad = 0;
for (let i = shard; i < jobs.length; i += nsh) {
  const [metro, r, s, arm] = jobs[i], F = fl[[metro, r, s].join('|')]; if (F === undefined) { k3missing++; continue; }
  const st = standsFor(arm === 'NET3' ? 'UNL' : arm, metro), c = config(metro, r, F, s, st);
  if (!c) { rows.push({ metro, r, s, arm, F, cannotPark: true, meets: false }); continue; }
  if (c.placed.some((u, j) => u > c.cap[j])) k2bad++;
  const res = (arm === 'NET3' ? N3 : N4).simulate(c.cfg), m = measure(res);
  if (arm !== 'NET3' && arm !== 'UNL' && res.sites.some(x => x.maxHeld > x.stands)) k2bad++;   // deviation 1: ledger, not stays
  rows.push({ metro, r, s, arm, F, ...m });
}
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'stands1_' + shard + '.json'), JSON.stringify({ rows, k3missing, k2bad }));
console.log('shard', shard, 'rows', rows.length, 'K3 missing', k3missing, 'K2 bad', k2bad);
