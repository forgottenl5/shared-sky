'use strict';
// Feature checks for taxi/net2.js (node taxi/test_net2.js): the v1 checks, then v2 checks: hand-built cases with known answers.
const N = require('./net2.js'); let fails = 0; const ok = (n, c, i) => { console.log((c ? 'ok  ' : 'FAIL') + ' ' + n + (i !== undefined ? ' ' + JSON.stringify(i) : '')); if (!c) fails++; };
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
{ const sim = require('./net2.js'); const cfg = { sites: sites(1, 4), fleet: { A: 2 }, aircraft: A, profile: P, ops: O, demand: [{ from: 'A', to: 'B', perHour: 1e-9 }], hours: 1, warm: 0, seed: 1 };
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
// V1 repositioning must not send an aircraft that could not fly the passenger's leg within maxWait after landing
// A and B 30 km apart; aircraft at A, full 80 km, reserve 30, charging 0.5 km/min. Deadhead A->B uses 35 -> 45 left; B->A needs 35 + 30 -> 20 km = 40 min of charging > 30 min maxWait
{ const R = N.simulate({ sites: sites(1, 4), fleet: { A: 1 }, aircraft: Object.assign({}, A, { rangeKm: 80, chargeKmPerMin: 0.5 }), profile: P, ops: O, demand: [{ from: 'B', to: 'A', perHour: 0.3 }], hours: 3, warm: 0, seed: 3 });
  const v1 = require('./net.js').simulate({ sites: sites(1, 4), fleet: { A: 1 }, aircraft: Object.assign({}, A, { rangeKm: 80, chargeKmPerMin: 0.5 }), profile: P, ops: O, demand: [{ from: 'B', to: 'A', perHour: 0.3 }], hours: 3, warm: 0, seed: 3 });
  ok('V1 v2 does not deadhead an aircraft that cannot then fly the leg in time (v1 did)', R.aircraft[0].dead === 0 && v1.aircraft[0].dead >= 1, [R.aircraft[0].dead, v1.aircraft[0].dead]); }
// V2 stand stays: 2 aircraft at A, no demand: A logs two stays spanning the run, B none
{ const R = N.simulate({ sites: sites(1, 4), fleet: { A: 2 }, aircraft: A, profile: P, ops: O, demand: [], hours: 1, warm: 0, seed: 1 });
  const a = R.sites.find(s => s.id === 'A'), b = R.sites.find(s => s.id === 'B');
  ok('V2 idle fleet: stays cover the whole run at A, none at B', a.stays.length === 2 && a.stays.every(([s0, s1]) => s0 === 0 && s1 === 3600) && b.stays.length === 0, a.stays); }
// V3 one flight A->B: A stay ends at take-off, B stay starts when the landing pad clears; dep wait 0, arrival hold 0
{ const R = N.simulate({ sites: sites(1, 4), fleet: { A: 1 }, aircraft: A, profile: P, ops: Object.assign({}, O, { reposition: false }), demand: [{ from: 'A', to: 'B', perHour: 0.6 }], hours: 2, warm: 0, seed: 1 });
  const q = R.reqs.filter(x => x.served).sort((x, y) => x.depart - y.depart)[0], a = R.sites.find(s => s.id === 'A'), b = R.sites.find(s => s.id === 'B');
  ok('V3 stays follow the first flight', q && a.stays[0][1] === q.depart && b.stays[0][0] === q.arrive && a.depWait[0][1] === 0 && b.arrHold[0][1] === 0, q && [a.stays[0], b.stays[0], q.depart, q.arrive]); }
// V4 arrival hold: one pad at B, two aircraft land at the same moment -> second holds one pad occupancy (90 s)
{ const R = N.simulate({ sites: sites(1, 4).map(s => s.id === 'A' ? Object.assign(s, { pads: 2 }) : s), fleet: { A: 2 }, aircraft: A, profile: P, ops: O, demand: [{ from: 'A', to: 'B', perHour: 3600 }], hours: 0.0004, warm: 0, seed: 1 });
  const h = R.sites.find(s => s.id === 'B').arrHold.slice().sort((x, y) => x[0] - y[0]);
  ok('V4 two near-simultaneous arrivals at a 1-pad site land exactly one pad occupancy (90 s) apart; first holds 0', h.length >= 2 && h[0][1] === 0 && h[1][1] > 0 && Math.abs(h[1][0] - h[0][0] - 90) < 1e-6, h); }
// V5 a pad booked for a later slot does not block an earlier free slot (v1 did): one pad, aircraft 1 at A must charge 20 min before
// its trip; aircraft 2's request comes 1 min after and should take off at once, not after aircraft 1's booked slot
{ const sim = (E) => E.simulate({ sites: sites(1, 4), fleet: { A: 1, B: 1 }, aircraft: Object.assign({}, A, { rangeKm: 80 }), profile: P, ops: Object.assign({}, O, { reposition: false, maxWait: 7200 }),
    demand: [{ from: 'A', to: 'B', perHour: 0.5 }, { from: 'B', to: 'A', perHour: 0.5 }], hours: 6, warm: 0, seed: 11 });
  const R = sim(N); const w = R.sites.map(s => Math.max(0, ...s.depWait.map(x => x[1])));
  const R1 = sim(require('./net.js')); const w1 = R1.sites.map(s => s.padWaitN ? s.padWaitSum / s.padWaitN : 0);
  ok('V5 sparse traffic on one pad: no departure waits more than one pad occupancy (90 s)', w.every(x => x <= 90 + 1e-6), { v2maxDepWait: w.map(Math.round), v1meanPadWait: w1.map(Math.round) }); }
console.log(fails ? fails + ' FAILED' : 'ALL PASS'); process.exit(fails ? 1 : 0);
