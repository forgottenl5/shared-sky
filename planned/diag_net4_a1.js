'use strict';
// EXPLORATORY diagnosis of AIRTAXI_NET4 prediction A1 (failed), written after the runs; not a registered test.
// Question: why do some Part A seeds have very long request-to-landing times? Theory 1: 10 stands per site bind with 24 aircraft at the shared hub.
const fs = require('fs'), path = require('path'), N5 = require('../taxi/net5.js');
const KM = 60 * 67 / 1000, AC = { seats: 4, routeFactor: 1.15, vtolKm: 5, chargeKmPerMin: 3.2, rangeKm: 100 + 20 * KM, reserveMin: 20 };
const P = { padZ: 15, vLift: 2.5, slope: 8, vClimb: 31, cruiseZ: 610, vCruise: 67 }, xyOf = (lat0, lat, lon) => [(lon + 97) * 111320 * Math.cos(lat0 * Math.PI / 180), (lat - 30) * 110574];
const A = { DFW: { lat0: 33.0, list: [['AFW', 32.9937909, -97.3100623], ['DFWc', 32.9133576, -97.0355091], ['TOY', 33.0811809, -96.841015], ['49T', 32.772891, -96.8024551]], routes: [['AFW', 'DFWc'], ['AFW', 'TOY'], ['DFWc', 'TOY'], ['DFWc', '49T']] },
  HOU: { lat0: 29.75, list: [['IAH', 29.9931058, -95.3416255], ['HOU', 29.6459141, -95.2768951], ['EFD', 29.6073333, -95.15875]], routes: [['IAH', 'HOU'], ['IAH', 'EFD']] } };
const median = a => { const b = a.slice().sort((x, y) => x - y), m = b.length >> 1; return b.length ? (b.length % 2 ? b[m] : (b[m - 1] + b[m]) / 2) : null; };
function cfg(m, seed, stands, fleetN, rule) { const M = A[m], sites = M.list.map(([id, lat, lon]) => ({ id, xy: xyOf(M.lat0, lat, lon), pads: 2, stands }));
  const fleet = {}; sites.forEach(s => fleet[s.id] = 0); for (let k = 0; k < fleetN; k++) fleet[sites[k % sites.length].id]++;
  const demand = []; for (const [a, b] of M.routes) { demand.push({ from: a, to: b, perHour: 1.5 }); demand.push({ from: b, to: a, perHour: 1.5 }); }
  return { sites, fleet, aircraft: AC, profile: P, ops: { padOccupancy: 90, turnaround: 300, maxWait: 1800, reposition: true, padRule: rule }, demand, hours: 12, warm: 7200, seed }; }
const rows = ['0', '1'].flatMap(k => JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'out', `airtaxi_net4_${k}.json`)))).filter(r => r.part === 'A');
for (const r of rows) { const bad = Object.entries(r.ods).filter(([, v]) => v[2] / 60 > 30); if (bad.length) console.log('long median T:', r.metro, 'seed', r.seed, bad.map(([k, v]) => `${k} ${(v[2] / 60).toFixed(0)} min, served ${v[1]}/${v[0]}`).join('; ')); }
const arg = process.argv[2] || 'stands';
for (const r of rows.filter(r => Object.values(r.ods).some(v => v[2] / 60 > 30)).slice(0, 6)) for (const [st, F, rule] of (arg === 'stands' ? [[10, 24, 'slot'], [1e9, 24, 'slot']] : [[10, 24, 'slot'], [10, 16, 'slot'], [10, 24, 'arrive'], [10, 24, 'confirm']])) {
  const res = N5.simulate(cfg(r.metro, r.seed, st, F, rule)), sv = res.reqs.filter(q => q.served), lon = sv.filter(q => (q.arrive - q.t) / 60 > 60);
  console.log(r.metro, 'seed', r.seed, `stands ${st === 1e9 ? 'unlimited' : st}, fleet ${F}, ${rule}:`, `served ${sv.length}/${res.reqs.length}, median T ${(median(sv.map(q => q.arrive - q.t)) / 60).toFixed(1)} min, trips over 60 min ${lon.length}`,
    lon.length ? `e.g. wait ${(lon[0].wait / 60).toFixed(0)} min, airborne ${(lon[0].airborne / 60).toFixed(0)} min, holding ${(lon[0].holding / 60).toFixed(0)} min` : '', 'maxHeld', JSON.stringify(Object.fromEntries(res.sites.map(x => [x.id, x.maxHeld])))); }
// mode 'estar': Part A again with unlimited stands (exploratory), per-seed median request-to-landing per OD -> out/diag_net4_a1_unlimited.json
if (arg === 'estar') { const out = [];
  for (const m of ['DFW', 'HOU']) for (let s = 1; s <= 10; s++) { const res = N5.simulate(cfg(m, s, 1e9, 24, 'slot')), ods = {};
    for (const q of res.reqs) if (q.served && q.arrive !== undefined) (ods[q.from + '>' + q.to] = ods[q.from + '>' + q.to] || []).push(q.arrive - q.t);
    out.push({ part: 'A', metro: m, seed: s, ods: Object.fromEntries(Object.entries(ods).map(([k, v]) => [k, [v.length, v.length, median(v)]])) }); }
  fs.writeFileSync(path.join(__dirname, '..', 'out', 'diag_net4_a1_unlimited.json'), JSON.stringify(out)); console.log('wrote', out.length); }
