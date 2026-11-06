'use strict';
// PADRULE1 runner (registration planned/PADRULE1_PREREG.md). Engine taxi/net5.js. Usage: node planned/padrule1_run.js <shard> <n>   -> out/padrule1_<shard>.json
const fs = require('fs'), path = require('path'), N5 = require('../taxi/net5.js');
const KM = 60 * 67 / 1000, U100 = { rangeKm: 100 + 20 * KM, reserveMin: 20 };
const SITES = {   // identical to planned/stands1_run.js
  DFW: { lat0: 33.0, list: [['AFW', 32.9937909, -97.3100623], ['DFWc', 32.9133576, -97.0355091], ['TOY', 33.0811809, -96.841015], ['49T', 32.772891, -96.8024551]],
         routes: [['AFW', 'DFWc'], ['AFW', 'TOY'], ['DFWc', 'TOY'], ['DFWc', '49T']] },
  HOU: { lat0: 29.75, list: [['IAH', 29.9931058, -95.3416255], ['HOU', 29.6459141, -95.2768951], ['EFD', 29.6073333, -95.15875]], routes: [['IAH', 'HOU'], ['IAH', 'EFD']] } };
const P = { padZ: 15, vLift: 2.5, slope: 8, vClimb: 31, cruiseZ: 610, vCruise: 67 };
const WARM = 7200, HOURS = 12, SEEDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], RATES = [1.5, 3, 6, 12], SS = [3, 4, 5, 6, 8, 10, 12, 16], RULES = ['arrive', 'slot', 'confirm'], PADS = [2, 4];
const outDir = path.join(__dirname, '..', 'out');
function median(a) { if (!a.length) return null; const b = a.slice().sort((x, y) => x - y), m = b.length >> 1; return b.length % 2 ? b[m] : (b[m - 1] + b[m]) / 2; }
function pct(a, p) { if (!a.length) return 0; const b = a.slice().sort((x, y) => x - y); return b[Math.min(b.length - 1, Math.floor(p * b.length))]; }
function config(metro, r, F, seed, S, rule, pads) {
  const M = SITES[metro], c = Math.cos(M.lat0 * Math.PI / 180), n = M.list.length, cap = S === null ? Infinity : S;
  if (F > cap * n) return null;   // cannot park
  const sites = M.list.map(([id, lat, lon]) => ({ id, xy: [(lon + 97) * 111320 * c, (lat - 30) * 110574], pads, stands: S === null ? undefined : S }));
  const fleet = {}; sites.forEach(s => fleet[s.id] = 0); const used = sites.map(() => 0);
  for (let k = 0, i = 0; k < F; i++) { const j = i % n; if (used[j] < cap) { used[j]++; fleet[sites[j].id]++; k++; } }
  const demand = []; for (const [a, b] of M.routes) { demand.push({ from: a, to: b, perHour: r }); demand.push({ from: b, to: a, perHour: r }); }
  return { sites, fleet, aircraft: Object.assign({ seats: 4, routeFactor: 1.15, vtolKm: 5, chargeKmPerMin: 3.2 }, U100), profile: P,
    ops: { padOccupancy: 90, turnaround: 300, maxWait: 1800, reposition: true, padRule: rule }, demand, hours: HOURS, warm: WARM, seed }; }
function measure(res) {
  const E = res.end, sv = res.reqs.filter(q => q.served), land = res.sites.reduce((a, s) => a + s.landings, 0), holds = [], perSite = {};
  for (const s of res.sites) { const h = s.arrHold.filter(x => x[0] >= WARM && x[0] < E).map(x => x[1]); holds.push(...h); perSite[s.id] = pct(h, 0.95); }
  const t = { n: res.reqs.length, served: sv.length, servedShare: res.reqs.length ? sv.length / res.reqs.length : 0, medWait: median(sv.map(q => q.wait)), waitP95: pct(sv.map(q => q.wait), 0.95),
    holdP95: pct(holds, 0.95), belowShare: land ? res.belowReserve / land : 0, swaps: res.swaps || 0, deferred: res.deferred || 0, stillWaitingToLaunch: res.stillWaitingToLaunch || 0, stillHolding: res.stillHolding || 0,
    maxHeld: Object.fromEntries(res.sites.map(s => [s.id, s.maxHeld])), ledgerOk: res.sites.every(s => s.maxHeld <= s.stands), siteHoldP95: perSite };
  t.meets = t.servedShare >= 0.95 && t.medWait !== null && t.medWait <= 600 && t.holdP95 <= 120 && t.belowShare <= 0.01; return t; }
const fl = {}; for (const f of fs.readdirSync(outDir).filter(f => f.startsWith('airtaxi_net3_fleet_'))) for (const x of JSON.parse(fs.readFileSync(path.join(outDir, f)))) if (x.arm === 'U100') fl[[x.metro, x.r, x.s].join('|')] = x.fleet;
const shard = +process.argv[2], nsh = +process.argv[3];
if (!(shard >= 0 && nsh > 0)) { console.error('usage: node planned/padrule1_run.js <shard> <n>'); process.exit(2); }
const jobs = []; for (const metro of ['DFW', 'HOU']) for (const r of RATES) for (const s of SEEDS) for (const pads of PADS) { jobs.push([metro, r, s, 'slot', null, pads]); for (const rule of RULES) for (const S of SS) jobs.push([metro, r, s, rule, S, pads]); }
const rows = []; let k3missing = 0, k2bad = 0;
for (let i = shard; i < jobs.length; i += nsh) {
  const [metro, r, s, rule, S, pads] = jobs[i], F = fl[[metro, r, s].join('|')]; if (F === undefined) { k3missing++; continue; }
  const cfg = config(metro, r, F, s, S, rule, pads);
  if (!cfg) { rows.push({ metro, r, s, rule, S, pads, F, cannotPark: true, meets: false }); continue; }
  const m = measure(N5.simulate(cfg)); if (S !== null && !m.ledgerOk) k2bad++;
  rows.push({ metro, r, s, rule, S, pads, F, ...m }); }
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'padrule1_' + shard + '.json'), JSON.stringify({ rows, k3missing, k2bad }));
console.log('shard', shard, 'rows', rows.length, 'K3 missing', k3missing, 'K2 bad', k2bad);
