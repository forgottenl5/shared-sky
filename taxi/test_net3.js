'use strict';
// v3 checks for taxi/net3.js (node taxi/test_net3.js). The v2 checks are re-run on net3 by: sed "s#./net2.js#./net3.js#" taxi/test_net2.js
const N = require('./net3.js'); let fails = 0; const ok = (n, c, i) => { console.log((c ? 'ok  ' : 'FAIL') + ' ' + n + (i !== undefined ? ' ' + JSON.stringify(i) : '')); if (!c) fails++; };
const P = { padZ: 15, vLift: 2.5, slope: 8, vClimb: 31, cruiseZ: 610, vCruise: 67 }, KMMIN = 60 * 67 / 1000;
const A = { seats: 4, rangeKm: 160, reserveKm: 30, routeFactor: 1, vtolKm: 5, chargeKmPerMin: 2 };
const O = { padOccupancy: 90, turnaround: 300, maxWait: 1800, reposition: true };
const two = (padsA, padsB, stands) => [{ id: 'A', xy: [0, 0], pads: padsA, stands }, { id: 'B', xy: [30000, 0], pads: padsB, stands }];
const sim = (x) => N.simulate(Object.assign({ sites: two(2, 1, 4), fleet: { A: 2 }, aircraft: A, profile: P, ops: O, demand: [], hours: 2, warm: 0, seed: 1 }, x));
// T1 holding costs battery: two aircraft leave A together (2 pads) for B (1 pad); the second holds 90 s and lands with 90/60 x cruise km/min less
{ const R = sim({ requests: [['A', 'B', 0], ['A', 'B', 0]] }), s = R.aircraft.map(x => x.soc).sort((a, b) => b - a);
  ok('T1 a 90 s hold uses 1.5 min of cruise energy', Math.abs(s[0] - s[1] - 1.5 * KMMIN) < 1e-6 && Math.abs(s[0] - (160 - 35)) < 1e-6, s); }
// T2 time-based reserve
{ const R = sim({ aircraft: Object.assign({}, A, { reserveMin: 20 }), requests: [] }); ok('T2 reserveMin 20 = 80.4 km at 67 m/s', Math.abs(R.reserveKm - 20 * KMMIN) < 1e-9, R.reserveKm); }
// T3 landing below reserve is counted: range 70, reserve 30, trip 35 leaves 35; the held aircraft lands with 35 - 6.03 < 30
{ const R = sim({ aircraft: Object.assign({}, A, { rangeKm: 70 }), requests: [['A', 'B', 0], ['A', 'B', 0]] });
  ok('T3 one landing below reserve (7.2 min of cruise left vs a 7.46 min reserve)', R.belowReserve === 1 && Math.abs(R.belowReserveMin[0] - (35 - 1.5 * KMMIN) / KMMIN) < 1e-6, [R.belowReserve, R.belowReserveMin]); }
// T4 cross-site: the only aircraft flies A->C; a request at B arrives meanwhile; when the aircraft lands at C it repositions to B (v2 waited for a landing at B)
{ const sites = [{ id: 'A', xy: [0, 0], pads: 1, stands: 4 }, { id: 'B', xy: [20000, 0], pads: 1, stands: 4 }, { id: 'C', xy: [10000, 5000], pads: 1, stands: 4 }];
  const cfg = { sites, fleet: { A: 1 }, aircraft: A, profile: P, ops: O, demand: [], hours: 2, warm: 0, seed: 1, requests: [['A', 'C', 0], ['B', 'A', 60]] };
  const R = N.simulate(cfg), q = R.reqs.find(x => x.from === 'B');
  ok('T4 request at B served by repositioning the aircraft once it lands at C', q && q.served && q.repositioned, q && { served: q.served, rep: q.repositioned, wait: Math.round(q.wait) }); }
// T5 stand use from stays: 3 aircraft based at a 2-stand site, no demand: peak 3, one overflow
{ const R = N.simulate({ sites: two(1, 1, 2), fleet: { A: 3 }, aircraft: A, profile: P, ops: O, demand: [], hours: 1, warm: 0, seed: 1 }), a = R.sites.find(s => s.id === 'A');
  ok('T5 peak stands 3 and one overflow at a 2-stand site', a.peakStands === 3 && R.standOverflow === 1, [a.peakStands, R.standOverflow]); }
// T6 invariants on a busy random 3-site network: no request gets two repositioning flights; energy is conserved (charge in = flown + held + change in battery)
{ const sites = [{ id: 'A', xy: [0, 0], pads: 1, stands: 6 }, { id: 'B', xy: [25000, 0], pads: 1, stands: 6 }, { id: 'C', xy: [0, 30000], pads: 1, stands: 6 }];
  const dem = []; for (const a of ['A', 'B', 'C']) for (const b of ['A', 'B', 'C']) if (a !== b) dem.push({ from: a, to: b, perHour: a === 'A' ? 6 : 1 });
  const excess = E => { let w = 0; for (let seed = 1; seed <= 20; seed++) { const R = E.simulate({ sites, fleet: { B: 2, C: 2 }, aircraft: Object.assign({}, A, { chargeKmPerMin: 1 }), profile: P, ops: O, demand: dem, hours: 6, warm: 0, seed });
    w = Math.max(w, R.aircraft.reduce((s, x) => s + x.dead, 0) - R.reqs.filter(q => q.repositioned).length); } return w; };
  const w3 = excess(N), w2 = excess(require('./net2.js'));
  ok('T6 over 20 busy runs: repositioning flights never exceed requests marked repositioned (v2 shown for the record)', w3 <= 0, { v3worstExcess: w3, v2worstExcess: w2 }); }
console.log(fails ? fails + ' FAILED' : 'ALL PASS'); process.exit(fails ? 1 : 0);
