'use strict';
// Export one run per metro and demand level for the 3D network page (docs/airtaxi.html).
// Usage: node taxi/export_airtaxi.js > taxi/airtaxi_data.json
// Display export (not a study; nothing here is a new result). Rebuilt 28 Oct 2026 on engine v5 (taxi/net5.js) with the settings the later studies
// found workable, replacing the engine-v2 export (unlimited stands, 30 km reserve, holding free of battery):
//   - aircraft as AIRTAXI_NET3 arm U100: 100 km usable plus the FAA 20-minute reserve; holding burns battery (v3+)
//   - landing rule 'slot' (pad slot booked at take-off; PADRULE1), limited parking stands per site
//   - pads and stands per level chosen from the PADRULE1 table so that each shown setup met its service and reserve test in at least 9 of 10 seeds:
//       DFW 1.5 / 3 / 6 requests an hour per route direction: 2 pads 6 stands / 2 pads 8 stands / 4 pads 12 stands
//       Houston:                                              2 pads 6 stands / 2 pads 8 stands / 4 pads 10 stands
//   - seed 1 and the fleet NET3 found for seed 1 (same as PADRULE1); the study medians and UNCERT1 ranges travel with each level for the page text
// The noise layer is computed here from this run's flights with the AIRTAXI_NOISE1 model (taxi/noise.js), so it matches what is shown.
const fs = require('fs'), path = require('path'), N = require('./net5.js'), Z = require('./noise.js'), ENC = require('./encounters.js');
const KM = 60 * 67 / 1000, U100 = { rangeKm: 100 + 20 * KM, reserveMin: 20 };
const SITES = {
  DFW: { lat0: 33.0, list: [['AFW', 'Perot Field Alliance', 32.9937909, -97.3100623], ['DFWc', 'DFW Airport (Corporate Aviation)', 32.9133576, -97.0355091], ['TOY', 'Toyota HQ, Plano', 33.0811809, -96.841015], ['49T', 'Downtown Dallas vertiport (49T, closed until about 2029)', 32.772891, -96.8024551]],
         routes: [['AFW', 'DFWc'], ['AFW', 'TOY'], ['DFWc', 'TOY'], ['DFWc', '49T']], closed: ['49T'],
         // [requests/h per route direction, pads, stands, study central fleet, UNCERT1 5th-95th or null]
         levels: [[1.5, 2, 6, 8, null], [3, 2, 8, 14, [12, 16]], [6, 4, 12, 24, [24, 28]]] },
  HOU: { lat0: 29.75, list: [['IAH', 'Bush Intercontinental (IAH)', 29.9931058, -95.3416255], ['HOU', 'Hobby', 29.6459141, -95.2768951], ['EFD', 'Ellington', 29.6073333, -95.15875]],
         routes: [['IAH', 'HOU'], ['IAH', 'EFD']], closed: [],
         levels: [[1.5, 2, 6, 5, null], [3, 2, 8, 8, [8, 12]], [6, 4, 10, 14, [12, 20]]] } };
// Originally from planned/AIRTAXI_NET1_RECHECK_V2_2026-10-26.md (same as the registered NET1 values); now ROUTE1 values, see below: request-to-landing time and peak break-even access time, minutes.
// Break-even is the average over both directions and the 08:00 and 17:30 peaks, with a 24-aircraft fleet (no queueing), engine v2.
const NET1 = { 'AFW>DFWc': [12.2, 31.1], 'AFW>TOY': [17.2, 42.8], 'DFWc>TOY': [11.8, 19.1], 'DFWc>49T': [12.0, 26.6], 'IAH>HOU': [15.5, 28.9], 'IAH>EFD': [17.6, 29.3] };   // 29 Oct: AIRTAXI_ROUTE1 at f = 1.15 (flown path 15% longer than the straight line); f = 1.00 reproduces NET1 exactly (11.1/32.1 ...)
const P = { padZ: 15, vLift: 2.5, slope: 8, vClimb: 31, cruiseZ: 610, vCruise: 67 }, WARM = 7200, HOURS = 12, SEED = 1, STEP = 200, MARGIN = 4000;
const drive = {}; for (const ln of fs.readFileSync(path.join(__dirname, 'data', 'drive_times_raw.tsv'), 'utf8').split('\n')) {
  if (!ln || ln.startsWith('#') || ln.startsWith('from')) continue; let [a, b, t, lo, hi] = ln.split('\t'); a = a === 'DFW' ? 'DFWc' : a; b = b === 'DFW' ? 'DFWc' : b;
  (drive[a + '>' + b] = drive[a + '>' + b] || {})[t] = [+lo, +hi]; }
// fleet NET3 found for each seed (arm U100), as PADRULE1 used it
const NET3 = {}; for (const f of fs.readdirSync(path.join(__dirname, '..', 'out')).filter(f => f.startsWith('airtaxi_net3_fleet_')))
  for (const x of JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'out', f)))) if (x.arm === 'U100') NET3[[x.metro, x.r, x.s].join('|')] = x.fleet;
const median = a => { const b = a.slice().sort((x, y) => x - y), m = b.length >> 1; return b.length ? (b.length % 2 ? b[m] : (b[m - 1] + b[m]) / 2) : null; };
const pct = (a, p) => { if (!a.length) return 0; const b = a.slice().sort((x, y) => x - y); return b[Math.min(b.length - 1, Math.floor(p * b.length))]; };
// close approaches in this run (AIRTAXI_ENC1 geometry, arm A); events in page coordinates: [t, x, y, z, nearMiss, terminal]
function encOut(trace, SX, cx, cy) { const r = ENC.events(trace, SX, P, WARM, WARM + HOURS * 3600);
  return { n: r.ev.length, nNearMiss: r.nE2, ev: r.ev.map(e => [Math.round(e[0]), Math.round(e[1] - cx), Math.round(e[2] - cy), Math.round(e[3]), e[4], e[5]]) }; }
const out = { note: 'Scenario model (Shared Sky engine v5, display export of 28 Oct 2026, seed 1). Demand, pads, stands and aircraft range are assumptions; not a forecast or real schedule.',
  engine: 'v5', rule: 'slot', reserveMin: 20, usableKm: 100, profile: P, warm: WARM, hours: HOURS, metros: {} };
for (const metro of ['DFW', 'HOU']) {
  const M = SITES[metro], c = Math.cos(M.lat0 * Math.PI / 180), n = M.list.length;
  const xy = M.list.map(([, , lat, lon]) => [(lon + 97) * 111320 * c, (lat - 30) * 110574]);
  const cx = xy.reduce((a, p) => a + p[0], 0) / n, cy = xy.reduce((a, p) => a + p[1], 0) / n, levels = [];
  for (const [r, pads, S, central, range] of M.levels) {
    const F = NET3[[metro, r, SEED].join('|')]; if (!F) { console.error('missing NET3 U100 fleet for', metro, r, '(run planned/airtaxi_net3_run.js)'); process.exit(1); }
    const sites = M.list.map(([id], i) => ({ id, xy: xy[i], pads, stands: S }));
    const fleet = {}; sites.forEach(s => fleet[s.id] = 0); const used = sites.map(() => 0);
    for (let k = 0, i = 0; k < F; i++) { const j = i % n; if (used[j] < S) { used[j]++; fleet[sites[j].id]++; k++; } }
    const demand = []; for (const [a, b] of M.routes) { demand.push({ from: a, to: b, perHour: r }); demand.push({ from: b, to: a, perHour: r }); }
    const res = N.simulate({ sites, fleet, aircraft: Object.assign({ seats: 4, routeFactor: 1.15, vtolKm: 5, chargeKmPerMin: 3.2 }, U100), profile: P,
      ops: { padOccupancy: 90, turnaround: 300, maxWait: 1800, reposition: true, padRule: 'slot' }, demand, hours: HOURS, warm: WARM, seed: SEED, trace: true });
    const sv = res.reqs.filter(q => q.served), land = res.sites.reduce((a, s) => a + s.landings, 0), holds = [];
    for (const s of res.sites) holds.push(...s.arrHold.filter(x => x[0] >= WARM && x[0] < res.end).map(x => x[1]));
    const sm = { requests: res.reqs.length, served: sv.length, medianWaitMin: +(median(sv.map(q => q.wait)) / 60).toFixed(1), deadheadShare: +(res.trace.filter(f => f[7]).length / res.trace.length).toFixed(3),
      holdP95s: Math.round(pct(holds, 0.95)), belowReserveShare: +(land ? res.belowReserve / land : 0).toFixed(4), maxParked: Object.fromEntries(res.sites.map(s => [s.id, s.maxHeld])) };
    sm.meets = sm.served / sm.requests >= 0.95 && sm.medianWaitMin <= 10 && sm.holdP95s <= 120 && sm.belowReserveShare <= 0.01 && res.sites.every(s => s.maxHeld <= S);
    if (!sm.meets) { console.error('level does not meet the PADRULE1 test:', metro, r, JSON.stringify(sm)); process.exit(1); }
    // noise: this run's flights through the AIRTAXI_NOISE1 model (base source levels)
    const SX = {}; sites.forEach(s => SX[s.id] = s.xy); const xs = xy.map(p => p[0]), ys = xy.map(p => p[1]);
    const x0 = Math.floor((Math.min(...xs) - MARGIN) / STEP) * STEP, y0 = Math.floor((Math.min(...ys) - MARGIN) / STEP) * STEP;
    const nx = Math.ceil((Math.max(...xs) + MARGIN - x0) / STEP) + 1, ny = Math.ceil((Math.max(...ys) + MARGIN - y0) / STEP) + 1, G = new Z.Grid(x0, y0, nx, ny, STEP);
    for (const f of res.trace) G.addFlight(f, SX, P, 0, WARM, WARM + HOURS * 3600);
    const cells = []; let dnlOff = -Infinity, reach = 0; G.n55.forEach((v, k) => { if (v > 0) cells.push([k, v]); });
    for (let k = 0; k < nx * ny; k++) { const [x, y] = G.xy(k), dn = Math.min(...xy.map(p => Math.hypot(x - p[0], y - p[1]))); if (G.n55[k] >= 1 && dn > reach) reach = dn; const L = G.dnl(k); if (dn > 300 && L > dnlOff) dnlOff = L; }
    levels.push({ r, tripsPerHour: r * demand.length, fleet: F, start: fleet, pads, stands: S, studyFleet: central, studyRange: range,
      flights: res.trace.map(f => [f[0], f[1], f[2], ...f.slice(3, 7).map(Math.round), f[7]]),
      reqs: res.reqs.map(q => [q.from, q.to, Math.round(q.t), q.served ? Math.round(q.depart) : -1]), summary: sm,
      noise: { x0: Math.round(x0 - cx), y0: Math.round(y0 - cy), nx, ny, step: STEP, cells, reachKm: +(reach / 1000).toFixed(1), dnlOffsiteMax: +dnlOff.toFixed(1) } ,
      enc: encOut(res.trace, SX, cx, cy) });
    console.error(metro, r, 'fleet', F, 'pads', pads, 'stands', S, JSON.stringify(sm), 'noise reach', (reach / 1000).toFixed(2), 'km, DNL off-site', dnlOff.toFixed(1)); }
  out.metros[metro] = { sites: M.list.map(([id, name], i) => ({ id, name, closed: M.closed.includes(id), x: Math.round(xy[i][0] - cx), y: Math.round(xy[i][1] - cy) })),
    routes: M.routes.map(([a, b]) => { const ia = M.list.findIndex(s => s[0] === a), ib = M.list.findIndex(s => s[0] === b);
      return { a, b, km: +(Math.hypot(xy[ia][0] - xy[ib][0], xy[ia][1] - xy[ib][1]) / 1000).toFixed(1), airMin: NET1[a + '>' + b][0], breakEvenMin: NET1[a + '>' + b][1], drive: { ab: drive[a + '>' + b], ba: drive[b + '>' + a] } }; }), levels };
}

// ---- Archer's announced network (AIRTAXI_NET4 Part B): same engine and rules, commute-shaped demand, fleet NET4 found for seed 1 (U100).
// Site positions use the 7-site network's centre for the metro, so the city blocks line up.
const SJ = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'out', 'access1b_sites.json'), 'utf8')).metros;
const NB = { DFW: { pairs: [['ADS', 'FTW', .249], ['DAL', 'FTW', .234], ['FRS', 'FTW', .224], ['FRS', 'GKY', .165], ['ADS', 'GKY', .082], ['AFW', 'DAL', .047]], totals: [12, 24, 48] },
  HOU: { pairs: [['IAH', 'SGR', .300], ['HOU', 'IAH', .229], ['GLS', 'IAH', .175], ['GLS', 'SGR', .125], ['GLS', 'THO', .102], ['HOU', 'SGR', .069]], totals: [6, 12, 24] } };
const NET4 = {}; for (const f of fs.readdirSync(path.join(__dirname, '..', 'out')).filter(f => /^airtaxi_net4_\d+\.json$/.test(f))) for (const x of JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'out', f)))) if (x.part === 'B' && x.U === 100) NET4[[x.metro, x.ti, x.seed].join('|')] = x;
out.archer = {};
for (const metro of ['DFW', 'HOU']) {
  const M = SITES[metro], c = Math.cos(M.lat0 * Math.PI / 180), xy7 = M.list.map(([, , lat, lon]) => [(lon + 97) * 111320 * c, (lat - 30) * 110574]);
  const cx = xy7.reduce((a, p) => a + p[0], 0) / xy7.length, cy = xy7.reduce((a, p) => a + p[1], 0) / xy7.length;
  const list = SJ[metro].sites, xy = list.map(s => [(s.lon + 97) * 111320 * c, (s.lat - 30) * 110574]), levels = [];
  for (let ti = 0; ti < 3; ti++) { const top = ti === 2, pads = top ? 4 : 2, S = top && metro === 'DFW' ? 16 : 12, T = NB[metro].totals[ti], n4 = NET4[[metro, ti, SEED].join('|')];
    if (!n4 || !n4.fleet) { console.error('no NET4 fleet for', metro, T); process.exit(1); } const F = n4.fleet;
    const sites = list.map((s, i) => ({ id: s.id, xy: xy[i], pads, stands: S })), n = sites.length;
    const fleet = {}; sites.forEach(s => fleet[s.id] = 0); const used = sites.map(() => 0); for (let k = 0, i = 0; k < F; i++) { const j = i % n; if (used[j] < S) { used[j]++; fleet[sites[j].id]++; k++; } }
    const demand = []; for (const [a, b, w] of NB[metro].pairs) { demand.push({ from: a, to: b, perHour: T * w / 2 }); demand.push({ from: b, to: a, perHour: T * w / 2 }); }
    const res = N.simulate({ sites, fleet, aircraft: Object.assign({ seats: 4, routeFactor: 1.15, vtolKm: 5, chargeKmPerMin: 3.2 }, U100), profile: P,
      ops: { padOccupancy: 90, turnaround: 300, maxWait: 1800, reposition: true, padRule: 'slot' }, demand, hours: HOURS, warm: WARM, seed: SEED, trace: true });
    const feas = res.reqs.filter(q => !q.infeasible), sv = feas.filter(q => q.served);
    const SX = {}; sites.forEach(s => SX[s.id] = s.xy); const xs = xy.map(p => p[0]), ys = xy.map(p => p[1]);
    const gx0 = Math.floor((Math.min(...xs) - MARGIN) / STEP) * STEP, gy0 = Math.floor((Math.min(...ys) - MARGIN) / STEP) * STEP;
    const gnx = Math.ceil((Math.max(...xs) + MARGIN - gx0) / STEP) + 1, gny = Math.ceil((Math.max(...ys) + MARGIN - gy0) / STEP) + 1, G = new Z.Grid(gx0, gy0, gnx, gny, STEP);
    for (const f of res.trace) G.addFlight(f, SX, P, 0, WARM, WARM + HOURS * 3600); const cells = []; G.n55.forEach((v, k) => { if (v > 0) cells.push([k, v]); });
    levels.push({ r: null, tripsPerHour: T, fleet: F, start: fleet, pads, stands: S, studyFleet: null, studyRange: null,
      flights: res.trace.map(f => [f[0], f[1], f[2], ...f.slice(3, 7).map(Math.round), f[7]]),
      reqs: res.reqs.filter(q => !q.infeasible).map(q => [q.from, q.to, Math.round(q.t), q.served ? Math.round(q.depart) : -1]),
      summary: { requests: feas.length, served: sv.length, infeasible: res.reqs.length - feas.length, medianWaitMin: +(median(sv.map(q => q.wait)) / 60).toFixed(1),
        deadheadShare: +(res.trace.filter(f => f[7]).length / res.trace.length).toFixed(3), maxParked: Object.fromEntries(res.sites.map(s => [s.id, s.maxHeld])), meets: !!n4.at.meets },
      noise: { x0: Math.round(gx0 - cx), y0: Math.round(gy0 - cy), nx: gnx, ny: gny, step: STEP, cells } ,
      enc: encOut(res.trace, SX, cx, cy) });
    console.error('archer', metro, T, 'fleet', F, 'served', sv.length + '/' + feas.length, 'infeasible', res.reqs.length - feas.length); }
  const nameOf = id => list.find(s => s.id === id).name, D2 = (a, b) => { const ia = list.findIndex(s => s.id === a), ib = list.findIndex(s => s.id === b); return Math.hypot(xy[ia][0] - xy[ib][0], xy[ia][1] - xy[ib][1]) / 1000; };
  out.archer[metro] = { sites: list.map((s, i) => ({ id: s.id, name: s.name, closed: false, x: Math.round(xy[i][0] - cx), y: Math.round(xy[i][1] - cy) })),
    routes: NB[metro].pairs.map(([a, b, w]) => ({ a, b, w, km: +D2(a, b).toFixed(1), feasible: D2(a, b) * 1.15 + 5 <= 100, airMin: null, breakEvenMin: null, drive: { ab: null, ba: null } })), levels };
}
process.stdout.write(JSON.stringify(out));
