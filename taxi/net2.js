'use strict';
// Shared Sky air-taxi network simulation, version 2 (26 Oct 2026; v1 is net.js, frozen for AIRTAXI_NET1). Changes from v1: repositioning checks the charge needed for the passenger's leg after landing; each site logs stand stays, departure pad waits, arrival holds and movement times.
// Original v1 header: Event-driven model of an air-taxi network: sites with landing pads (FATOs)
// and parking stands with chargers, a fleet, trip requests between sites, dispatch, flight times from the climb/cruise/descent
// profile, battery state, and queues at pads and stands. All inputs are parameters; the study files say where each value comes from.
//
// Units: metres, seconds, km of range for battery state.

function rng(seed) { let s = (seed * 2654435761) >>> 0; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; }

// ---- flight time for a straight trip of horizontal distance D (m) with profile P
// lift (vertical to padZ), climb along slope to cruiseZ at vClimb, cruise at vCruise, mirror descent, vertical landing.
function flightTime(D, P) {
  let zc = P.cruiseZ, dc = (zc - P.padZ) * P.slope; if (2 * dc > D) { dc = D / 2; zc = P.padZ + dc / P.slope; }
  const ramp = Math.hypot(dc, zc - P.padZ) / P.vClimb, vert = P.padZ / P.vLift;
  return { total: 2 * vert + 2 * ramp + Math.max(0, D - 2 * dc) / P.vCruise, padTime: vert, cruiseZ: zc };
}
// energy used for a trip, as km of rated range: distance flown x routeFactor + a fixed allowance for take-off and landing
function energyKm(D, A) { return D / 1000 * A.routeFactor + A.vtolKm; }

// ---- simple binary-heap event queue
class Heap { constructor() { this.a = []; } push(t, k, x) { const a = this.a; a.push([t, k, x]); let i = a.length - 1; while (i > 0) { const p = (i - 1) >> 1; if (a[p][0] < t || (a[p][0] === t && a[p][1] <= k)) break; [a[p], a[i]] = [a[i], a[p]]; i = p; } }
  pop() { const a = this.a, top = a[0], last = a.pop(); if (a.length) { a[0] = last; let i = 0; for (;;) { const l = 2 * i + 1, r = l + 1; let m = i; if (l < a.length && (a[l][0] < a[m][0] || (a[l][0] === a[m][0] && a[l][1] < a[m][1]))) m = l; if (r < a.length && (a[r][0] < a[m][0] || (a[r][0] === a[m][0] && a[r][1] < a[m][1]))) m = r; if (m === i) break; [a[m], a[i]] = [a[i], a[m]]; i = m; } } return top; }
  get size() { return this.a.length; } }

// ---- the simulation
// cfg: { sites: [{id, xy:[x,y], pads, stands}] (every stand assumed to have a charger), fleet: {siteId: n}, aircraft: A, profile: P, ops: O, demand: [{from, to, perHour}], hours, warm, seed }
// A: { seats, rangeKm, reserveKm, routeFactor, vtolKm, chargeKmPerMin }
// O: { padOccupancy (s a take-off or landing holds a pad), turnaround (s deplane+board), maxWait (s a request waits before it is lost), reposition: bool }
function simulate(cfg) {
  const A = cfg.aircraft, P = cfg.profile, O = cfg.ops, r = rng(cfg.seed || 1), H = new Heap();
  const S = new Map(cfg.sites.map(s => [s.id, { ...s, padFree: [], standsUsed: 0, idle: [], queueReq: [], padQueue: [], log: { takeoffs: 0, landings: 0, padWaitSum: 0, padWaitN: 0, standFullEvents: 0, stays: [], depWait: [], arrHold: [], mov: [] } }]));
  for (const s of S.values()) s.padBook = Array.from({ length: s.pads }, () => []);   // v2: booked [start, end) slots per pad, sorted by start
  const D = (a, b) => Math.hypot(S.get(a).xy[0] - S.get(b).xy[0], S.get(a).xy[1] - S.get(b).xy[1]);
  // fleet
  const ac = []; for (const [sid, n] of Object.entries(cfg.fleet)) for (let k = 0; k < n; k++) { const x = { id: ac.length, at: sid, soc: A.rangeKm, busyUntil: 0, readyAt: 0, flights: 0, dead: 0, flownKm: 0, state: 'idle', stayStart: 0 }; ac.push(x); S.get(sid).idle.push(x); S.get(sid).standsUsed++; }
  // demand: Poisson requests per OD
  const END = (cfg.warm + cfg.hours * 3600), reqs = [];
  for (const d of cfg.demand) { let t = -Math.log(1 - r()) * 3600 / d.perHour; while (t < END) { const q = { id: reqs.length, from: d.from, to: d.to, t, served: false }; reqs.push(q); H.push(t, 0, { type: 'req', q }); t += -Math.log(1 - r()) * 3600 / d.perHour; } }
  // pad booking: earliest time >= t that a pad at site s is free; holds it for padOccupancy
  // v2 pad booking: earliest slot >= t of length padOccupancy that overlaps no booked slot on some pad (v1 kept one 'free from' time per pad,
  // so a booking far in the future blocked every earlier one)
  let now = 0;
  const slotOn = (L, t, d) => { let c = t; for (const [a, b] of L) { if (b <= c) continue; if (a >= c + d) break; c = Math.max(c, b); } return c; };
  const bookPad = (s, t) => { let bi = 0, bt = Infinity; for (let k = 0; k < s.padBook.length; k++) { const c = slotOn(s.padBook[k], t, O.padOccupancy); if (c < bt) { bt = c; bi = k; } }
    let L = s.padBook[bi]; if (L.length > 64) L = s.padBook[bi] = L.filter(([, b]) => b > now - 1);
    let at = L.findIndex(([a]) => a > bt); if (at < 0) at = L.length; L.splice(at, 0, [bt, bt + O.padOccupancy]);
    s.log.padWaitSum += bt - t; s.log.padWaitN++; return bt; };
  const charge = (x, t) => { x.soc = Math.min(A.rangeKm, x.soc + A.chargeKmPerMin * (t - x.readyAt) / 60); x.readyAt = t; };
  function canFly(x, km) { return x.soc - km >= A.reserveKm; }
  function minutesToCharge(x, km) { return Math.max(0, (km + A.reserveKm - x.soc) / A.chargeKmPerMin); }
  function dispatch(q, t) {   // pick an idle aircraft at the origin able to fly (after charging if needed); else reposition one; else queue
    const s = S.get(q.from), need = energyKm(D(q.from, q.to), A);
    let best = null, bestT = Infinity;
    if (need + A.reserveKm > A.rangeKm) { q.infeasible = true; return true; }   // trip longer than a full battery allows: never served
    for (const x of s.idle) { charge(x, t); const ready = Math.max(t, x.busyUntil, t + minutesToCharge(x, need) * 60); if (ready < bestT) { bestT = ready; best = x; } }
    if (best && bestT - q.t <= O.maxWait) { fly(best, q, bestT, need); return true; }
    if (O.reposition) {   // nearest site with an idle aircraft that can reach the origin and then fly the trip after charging there
      let cand = null, cT = Infinity;
      for (const o of S.values()) { if (o.id === q.from) continue; for (const x of o.idle) { charge(x, t); const dk = energyKm(D(o.id, q.from), A); if (dk + A.reserveKm > A.rangeKm) continue; const leave = Math.max(t, x.busyUntil, t + minutesToCharge(x, dk) * 60); const arrive = leave + flightTime(D(o.id, q.from), P).total + O.padOccupancy;
        // v2: the aircraft must also hold enough charge for the passenger's leg after landing (charging continues from leave)
        const socArr = Math.min(A.rangeKm, x.soc + A.chargeKmPerMin * (leave - t) / 60) - dk, extra = Math.max(0, (need + A.reserveKm - socArr) / A.chargeKmPerMin) * 60;
        const readyP = arrive + Math.max(O.turnaround, extra); if (readyP < cT) { cT = readyP; cand = [x, o, dk, leave]; } } }
      if (cand && cT - q.t <= O.maxWait) { const [x, o, dk, leave] = cand; reposition(x, o, q.from, leave, dk, q); return true; } }
    s.queueReq.push(q); return false; }
  function takeOff(x, from, to, t, km) {   // returns arrival-complete time
    const s = S.get(from), tt = bookPad(s, t); charge(x, tt); s.log.takeoffs++; s.log.stays.push([x.stayStart, tt]); s.log.depWait.push([t, tt - t]); s.log.mov.push(tt); s.idle = s.idle.filter(y => y !== x); s.standsUsed--;
    const ft = flightTime(D(from, to), P), d = S.get(to), eta = tt + ft.total - P.padZ / P.vLift, land = bookPad(d, eta); d.log.landings++; d.log.arrHold.push([land, land - eta]); d.log.mov.push(land);
    const done = land + O.padOccupancy; if (cfg.trace) trace.push([x.id, from, to, tt, eta, land, done, x.state === 'dead' ? 1 : 0]); x.soc -= km; x.flownKm += D(from, to) / 1000; x.flights++; x.at = to; x.busyUntil = done + O.turnaround; x.readyAt = done;
    return { tt, land, done, airborne: ft.total, holding: land - (tt + ft.total - P.padZ / P.vLift) }; }
  function fly(x, q, t, need) { const s = S.get(q.from); x.state = 'pax'; const f = takeOff(x, q.from, q.to, t, need);
    q.served = true; q.depart = f.tt; q.arrive = f.done; q.wait = f.tt - q.t; q.airborne = f.airborne; q.holding = f.holding; q.aircraft = x.id;
    H.push(f.done, 1, { type: 'arrive', x, site: q.to }); }
  function reposition(x, o, to, t, dk, q) { x.state = 'dead'; x.dead++; const f = takeOff(x, o.id, to, t, dk); q.repositioned = true; S.get(to).queueReq.unshift(q); H.push(f.done, 1, { type: 'arrive', x, site: to }); }
  const stats = { standOverflow: 0 }, trace = [];   // trace (cfg.trace only, for the 3D page): [aircraft, from, to, take-off, eta, landing, pad clear, deadhead]
  while (H.size) { const [t, , e] = H.pop(); now = t;
    if (e.type === 'req') { dispatch(e.q, t); }
    else if (e.type === 'arrive') { const s = S.get(e.site); e.x.state = 'idle'; e.x.stayStart = t; s.idle.push(e.x); s.standsUsed++; if (s.standsUsed > s.stands) stats.standOverflow++;
      // serve waiting requests at this site, oldest first, dropping ones past maxWait
      s.queueReq = s.queueReq.filter(q => !q.served && t - q.t <= O.maxWait);
      while (s.queueReq.length && s.idle.length) { const q = s.queueReq.shift(); if (!dispatch(q, Math.max(t, q.t))) break; } } }
  for (const x of ac) S.get(x.at).log.stays.push([x.stayStart, Math.max(END, x.stayStart)]);
  const meas = reqs.filter(q => q.t >= cfg.warm);
  return { reqs: meas, aircraft: ac, sites: [...S.values()].map(s => ({ id: s.id, pads: s.pads, stands: s.stands, ...s.log })), standOverflow: stats.standOverflow, end: END, trace: cfg.trace ? trace : undefined };
}

module.exports = { rng, flightTime, energyKm, simulate, Heap };
