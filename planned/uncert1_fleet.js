'use strict';
// UNCERT1 network headline (registration planned/UNCERT1_PREREG.md). Engine taxi/net5.js, rule slot, 4 pads, unlimited stands, aircraft arm U100.
// Usage: node planned/uncert1_fleet.js k2 | run <shard> <n>   -> out/uncert1_k2.json | out/uncert1_fleet_<shard>.json
const fs = require('fs'), path = require('path'), N5 = require('../taxi/net5.js');
const KM = 60 * 67 / 1000, U100 = { rangeKm: 100 + 20 * KM, reserveMin: 20 };
const SITES = {
  DFW: { lat0: 33.0, list: [['AFW', 32.9937909, -97.3100623], ['DFWc', 32.9133576, -97.0355091], ['TOY', 33.0811809, -96.841015], ['49T', 32.772891, -96.8024551]],
         routes: [['AFW', 'DFWc'], ['AFW', 'TOY'], ['DFWc', 'TOY'], ['DFWc', '49T']] },
  HOU: { lat0: 29.75, list: [['IAH', 29.9931058, -95.3416255], ['HOU', 29.6459141, -95.2768951], ['EFD', 29.6073333, -95.15875]], routes: [['IAH', 'HOU'], ['IAH', 'EFD']] } };
const P = { padZ: 15, vLift: 2.5, slope: 8, vClimb: 31, cruiseZ: 610, vCruise: 67 }, WARM = 7200, HOURS = 12;
const FLEETS = [2, 3, 4, 5, 6, 8, 10, 12, 14, 16, 20, 24, 28, 32, 40, 48, 56, 64, 80, 96], REG = { padOcc: 90, turnaround: 300, charge: 3.2, routeFactor: 1.15 };
const DR = JSON.parse(fs.readFileSync(path.join(__dirname, 'uncert1_draws.json'))).fleet;
function median(a) { if (!a.length) return null; const b = a.slice().sort((x, y) => x - y), m = b.length >> 1; return b.length % 2 ? b[m] : (b[m - 1] + b[m]) / 2; }
function config(metro, r, F, seed, v) {
  const M = SITES[metro], c = Math.cos(M.lat0 * Math.PI / 180), n = M.list.length;
  const sites = M.list.map(([id, lat, lon]) => ({ id, xy: [(lon + 97) * 111320 * c, (lat - 30) * 110574], pads: 4, stands: undefined }));
  const fleet = {}; sites.forEach(s => fleet[s.id] = 0); for (let k = 0; k < F; k++) fleet[sites[k % n].id]++;
  const demand = []; for (const [a, b] of M.routes) { demand.push({ from: a, to: b, perHour: r }); demand.push({ from: b, to: a, perHour: r }); }
  return { sites, fleet, aircraft: Object.assign({ seats: 4, routeFactor: v.routeFactor, vtolKm: 5, chargeKmPerMin: v.charge }, U100), profile: P,
    ops: { padOccupancy: v.padOcc, turnaround: v.turnaround, maxWait: 1800, reposition: true, padRule: 'slot' }, demand, hours: HOURS, warm: WARM, seed }; }
function required(metro, r, seed, v) {
  for (const F of FLEETS) { const res = N5.simulate(config(metro, r, F, seed, v)), sv = res.reqs.filter(q => q.served), mw = median(sv.map(q => q.wait));
    if (res.reqs.length && sv.length / res.reqs.length >= 0.95 && mw !== null && mw <= 600) return F; } return 96; }
const mode = process.argv[2], outDir = path.join(__dirname, '..', 'out'); fs.mkdirSync(outDir, { recursive: true });
if (mode === 'k2') {
  const rows = []; for (const metro of ['DFW', 'HOU']) for (const r of [3, 6]) { const f = []; for (let s = 1; s <= 10; s++) f.push(required(metro, r, s, REG)); rows.push({ metro, r, fleets: f, median: median(f) }); console.log(metro, r, f.join(','), 'median', median(f)); }
  fs.writeFileSync(path.join(outDir, 'uncert1_k2.json'), JSON.stringify(rows));
} else {
  const shard = +process.argv[3], nsh = +process.argv[4]; if (!(shard >= 0 && nsh > 0)) { console.error('usage: node planned/uncert1_fleet.js k2 | run <shard> <n>'); process.exit(2); }
  const rows = []; for (let i = shard; i < DR.padOcc.length; i += nsh) { const v = { padOcc: DR.padOcc[i], turnaround: DR.turnaround[i], charge: DR.charge[i], routeFactor: DR.routeFactor[i] }, seed = 1 + (i % 10);
    for (const metro of ['DFW', 'HOU']) for (const r of [3, 6]) rows.push({ i, metro, r, seed, v, fleet: required(metro, r, seed, v) }); }
  fs.writeFileSync(path.join(outDir, 'uncert1_fleet_' + shard + '.json'), JSON.stringify(rows)); console.log('shard', shard, 'rows', rows.length);
}
