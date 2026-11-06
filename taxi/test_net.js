'use strict';
// Feature checks for taxi/net.js (node taxi/test_net.js): hand-built cases with known answers.
const N = require('./net.js'); let fails = 0; const ok = (n, c, i) => { console.log((c ? 'ok  ' : 'FAIL') + ' ' + n + (i !== undefined ? ' ' + JSON.stringify(i) : '')); if (!c) fails++; };
const P = { padZ: 15, vLift: 2.5, slope: 8, vClimb: 31, cruiseZ: 610, vCruise: 67 };
const A = { seats: 4, rangeKm: 160, reserveKm: 30, routeFactor: 1, vtolKm: 5, chargeKmPerMin: 2 };
const O = { padOccupancy: 90, turnaround: 300, maxWait: 1800, reposition: true };
// N1 flight time
const ft = N.flightTime(30000, P), ramp = Math.hypot(4760, 595) / 31, want = 12 + 2 * ramp + (30000 - 9520) / 67;
ok('N1 flight time 30 km', Math.abs(ft.total - want) < 1e-6, [ft.total.toFixed(1), want.toFixed(1)]);
ok('N1 short trip caps cruise height', Math.abs(N.flightTime(4000, P).cruiseZ - (15 + 2000 / 8)) < 1e-9);
// a two-site world 30 km apart; deterministic single request via perHour tiny and manual check
const sites = (pads, stands) => [{ id: 'A', xy: [0, 0], pads, stands }, { id: 'B', xy: [30000, 0], pads, stands }];
function run(extra) { return N.simulate(Object.assign({ sites: sites(1, 4), fleet: { A: 1 }, aircraft: A, profile: P, ops: O, demand: [], hours: 2, warm: 0, seed: 1 }, extra)); }
// N2 one aircraft, requests A->B: first request served without wait, airborne time = flight time
let R = run({ demand: [{ from: 'A', to: 'B', perHour: 0.6 }] }); const q0 = R.reqs.find(q => q.served);
ok('N2 first request departs at once', q0 && Math.abs(q0.wait) < 1e-6, q0 && q0.wait); ok('N2 airborne time matches', q0 && Math.abs(q0.airborne - ft.total) < 1e-6);
// N3 one pad, two aircraft, two requests at the same moment: the second waits one pad occupancy
{ const sim = require('./net.js'); const cfg = { sites: sites(1, 4), fleet: { A: 2 }, aircraft: A, profile: P, ops: O, demand: [{ from: 'A', to: 'B', perHour: 1e-9 }], hours: 1, warm: 0, seed: 1 };
  // inject two simultaneous requests by giving two OD lines with high rate and checking the first two departures' spacing
  const R3 = sim.simulate(Object.assign(cfg, { demand: [{ from: 'A', to: 'B', perHour: 3600 }], hours: 0.0004 }));
  const dep = R3.reqs.filter(q => q.served).map(q => q.depart).sort((a, b) => a - b);
  ok('N3 second take-off from a 1-pad site waits for the pad', dep.length >= 2 && Math.abs(dep[1] - Math.max(dep[0] + 90, R3.reqs.filter(q => q.served)[1].t)) < 1e-6, dep.slice(0, 2)); }
// N4 a trip longer than a full battery allows is never served (range 40 km < 30 + 5 + 30 reserve)
{ const R5 = N.simulate({ sites: sites(1, 4), fleet: { A: 1 }, aircraft: Object.assign({}, A, { rangeKm: 40 }), profile: P, ops: O, demand: [{ from: 'A', to: 'B', perHour: 0.5 }], hours: 3, warm: 0, seed: 2 });
  ok('N4 infeasible trips are not flown', R5.reqs.length > 0 && R5.reqs.every(q => !q.served), R5.reqs.length); }
// N4b charging: range 80 km; after A->B (uses 35) the aircraft has 45 km; B->A needs 65 -> 10 min charge (> 5 min turnaround)
{ const R = N.simulate({ sites: sites(1, 4), fleet: { A: 1 }, aircraft: Object.assign({}, A, { rangeKm: 80 }), profile: P, ops: Object.assign({}, O, { reposition: false, maxWait: 7200 }), demand: [{ from: 'A', to: 'B', perHour: 0.4 }, { from: 'B', to: 'A', perHour: 6 }], hours: 4, warm: 0, seed: 5 });
  const ab = R.reqs.filter(q => q.served && q.from === 'A').sort((a, b) => a.depart - b.depart)[0], ba = ab && R.reqs.filter(q => q.served && q.from === 'B' && q.depart > ab.depart).sort((a, b) => a.depart - b.depart)[0];
  ok('N4b next departure waits for 10 min of charging after landing', ab && ba && Math.abs(ba.depart - (ab.arrive + 600)) < 1e-6, ab && ba && [Math.round(ab.arrive), Math.round(ba.depart), Math.round(ba.t)]); }
// N5 reposition: aircraft at A, request at B: served after a deadhead flight; wait >= flight time + pad occupancy + turnaround
{ const R6 = N.simulate({ sites: sites(1, 4), fleet: { A: 1 }, aircraft: A, profile: P, ops: O, demand: [{ from: 'B', to: 'A', perHour: 0.5 }], hours: 3, warm: 0, seed: 3 });
  const q = R6.reqs.find(x => x.served); ok('N5 request at an empty site is served by repositioning', q && q.repositioned && q.wait >= ft.total + 90, q && { wait: Math.round(q.wait), rep: q.repositioned }); }
// N6 maxWait: no reposition, aircraft elsewhere: requests are lost
{ const R7 = N.simulate({ sites: sites(1, 4), fleet: { A: 1 }, aircraft: A, profile: P, ops: Object.assign({}, O, { reposition: false }), demand: [{ from: 'B', to: 'A', perHour: 2 }], hours: 2, warm: 0, seed: 4 });
  ok('N6 without repositioning, requests at an empty site are lost', R7.reqs.length > 0 && R7.reqs.every(q => !q.served), R7.reqs.length); }
console.log(fails ? fails + ' FAILED' : 'ALL PASS'); process.exit(fails ? 1 : 0);
