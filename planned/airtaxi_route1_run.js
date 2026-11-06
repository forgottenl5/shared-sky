'use strict';
// AIRTAXI_ROUTE1 runner (registration: planned/AIRTAXI_ROUTE1_PREREG.md). Engine taxi/net5.js.
//   node planned/airtaxi_route1_run.js checks      K2 (distances and flight-time increase)
//   node planned/airtaxi_route1_run.js run         writes out/airtaxi_route1.json
const fs = require('fs'), path = require('path'), N5 = require('../taxi/net5.js');
const P0 = { padZ: 15, vLift: 2.5, slope: 8, vClimb: 31, cruiseZ: 610, vCruise: 67 };
const xyOf = (lat0, lat, lon) => [(lon + 97) * 111320 * Math.cos(lat0 * Math.PI / 180), (lat - 30) * 110574];
const A = { DFW: { lat0: 33.0, list: [['AFW', 32.9937909, -97.3100623], ['DFWc', 32.9133576, -97.0355091], ['TOY', 33.0811809, -96.841015], ['49T', 32.772891, -96.8024551]], routes: [['AFW', 'DFWc'], ['AFW', 'TOY'], ['DFWc', 'TOY'], ['DFWc', '49T']] },
  HOU: { lat0: 29.75, list: [['IAH', 29.9931058, -95.3416255], ['HOU', 29.6459141, -95.2768951], ['EFD', 29.6073333, -95.15875]], routes: [['IAH', 'HOU'], ['IAH', 'EFD']] } };
const AC = { seats: 4, rangeKm: 130, reserveKm: 30, routeFactor: 1.15, vtolKm: 5, chargeKmPerMin: 3.2 };   // NET1 convention: U = 100 km usable
const FS = [1.0, 1.15, 1.3], FLEETS = [1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24], SEEDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const median = a => { const b = a.slice().sort((x, y) => x - y), m = b.length >> 1; return b.length ? (b.length % 2 ? b[m] : (b[m - 1] + b[m]) / 2) : null; };
function sites(m) { const M = A[m]; return M.list.map(([id, lat, lon]) => ({ id, xy: xyOf(M.lat0, lat, lon), pads: 2, stands: Infinity })); }
function cfg(m, seed, fleetN, f) { const S = sites(m), fleet = {}; S.forEach(s => fleet[s.id] = 0); for (let k = 0; k < fleetN; k++) fleet[S[k % S.length].id]++;
  const demand = []; for (const [a, b] of A[m].routes) { demand.push({ from: a, to: b, perHour: 1.5 }); demand.push({ from: b, to: a, perHour: 1.5 }); }
  return { sites: S, fleet, aircraft: AC, profile: Object.assign({}, P0, f === 1 ? {} : { timeFactor: f }), ops: { padOccupancy: 90, turnaround: 300, maxWait: 1800, reposition: true, padRule: 'slot' }, demand, hours: 12, warm: 7200, seed }; }
function summarize(res) { const ods = {}, all = res.reqs; for (const q of all) (ods[q.from + '>' + q.to] = ods[q.from + '>' + q.to] || []).push(q);
  const f = qs => { const sv = qs.filter(q => q.served); return [qs.length, sv.length, median(sv.map(q => q.arrive - q.t)), median(sv.map(q => q.wait))]; };
  const out = {}; for (const k of Object.keys(ods)) out[k] = f(ods[k]); return { ods: out, tot: f(all) }; }
if (process.argv[2] === 'checks') { let fails = 0; const ok = (n, c, i) => { console.log((c ? 'ok  ' : 'FAIL') + ' ' + n + (i !== undefined ? ' ' + JSON.stringify(i) : '')); if (!c) fails++; };
  const want = { 'DFW:AFW>TOY': 44.9, 'DFW:AFW>DFWc': 27.1, 'DFW:DFWc>TOY': 26.0, 'DFW:DFWc>49T': 26.8, 'HOU:IAH>HOU': 39.1, 'HOU:IAH>EFD': 46.4 };
  for (const m of ['DFW', 'HOU']) { const S = new Map(sites(m).map(s => [s.id, s]));
    for (const [a, b] of A[m].routes) { const d = Math.hypot(S.get(a).xy[0] - S.get(b).xy[0], S.get(a).xy[1] - S.get(b).xy[1]);
      const t0 = N5.flightTime(d, P0).total, t1 = N5.flightTime(d, Object.assign({}, P0, { timeFactor: 1.15 })).total; let zc = 610, dc = (zc - 15) * 8; const cruise0 = Math.max(0, d - 2 * dc) / 67, cruise1 = Math.max(0, d * 1.15 - 2 * dc) / 67;
      ok('K2 ' + m + ' ' + a + '-' + b + ' distance', Math.abs(d / 1000 / want[m + ':' + a + '>' + b] - 1) < 0.01, +(d / 1000).toFixed(2));
      ok('K2 ' + m + ' ' + a + '-' + b + ' time increase', Math.abs((t1 - t0) / (cruise1 - cruise0) - 1) < 0.02, [+((t1 - t0) / 60).toFixed(2), +((cruise1 - cruise0) / 60).toFixed(2)]); } }
  console.log(fails ? fails + ' FAILED' : 'ALL PASS'); process.exit(fails ? 1 : 0); }
const rows = [];
for (const m of ['DFW', 'HOU']) for (const f of FS) for (const s of SEEDS) { rows.push({ part: 'A', metro: m, f, n: 24, seed: s, ...summarize(N5.simulate(cfg(m, s, 24, f))) }); }
for (const m of ['DFW', 'HOU']) for (const f of [1.0, 1.15]) for (const n of FLEETS) for (const s of SEEDS) rows.push({ part: 'B', metro: m, f, n, seed: s, ...summarize(N5.simulate(cfg(m, s, n, f))) });
fs.mkdirSync(path.join(__dirname, '..', 'out'), { recursive: true }); fs.writeFileSync(path.join(__dirname, '..', 'out', 'airtaxi_route1.json'), JSON.stringify(rows)); console.log('rows', rows.length);
