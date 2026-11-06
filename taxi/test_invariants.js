'use strict';
// Randomised invariant tests for the air-taxi engine (taxi/net5.js) and the delivery-drone engine (lab/lab_engine.js). GAP_PLAN A12.
// Usage: node taxi/test_invariants.js [cases]   (default 60). Exit 1 on any violation.
const N5 = require('./net5.js'), L = require('../lab/lab_engine.js');
const CASES = +(process.argv[2] || 60); let fails = 0, checks = 0;
const bad = (msg) => { fails++; if (fails <= 20) console.log('FAIL', msg); };
function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
const KM = 60 * 67 / 1000, P = { padZ: 15, vLift: 2.5, slope: 8, vClimb: 31, cruiseZ: 610, vCruise: 67 };
// ---- air taxis
for (let c = 0; c < CASES; c++) { const r = rng(1000 + c), nS = 2 + Math.floor(r() * 4), sites = [];
  for (let i = 0; i < nS; i++) sites.push({ id: 'S' + i, xy: [(r() - 0.5) * 80000, (r() - 0.5) * 80000], pads: 1 + Math.floor(r() * 4), stands: r() < 0.3 ? undefined : 3 + Math.floor(r() * 10) });
  const F = 2 + Math.floor(r() * 20), fleet = {}; sites.forEach(s => fleet[s.id] = 0); const cap = sites.map(s => s.stands === undefined ? Infinity : s.stands), used = sites.map(() => 0);
  for (let k = 0, i = 0; k < F && i < 1000; i++) { const j = i % nS; if (used[j] < cap[j]) { used[j]++; fleet[sites[j].id]++; k++; } }
  const demand = []; for (let a = 0; a < nS; a++) for (let b = 0; b < nS; b++) if (a !== b && r() < 0.6) demand.push({ from: 'S' + a, to: 'S' + b, perHour: 0.5 + r() * 4 });
  if (!demand.length) demand.push({ from: 'S0', to: 'S1', perHour: 2 });
  const U = [60, 100, 144][Math.floor(r() * 3)], rule = ['arrive', 'slot', 'confirm'][Math.floor(r() * 3)];
  const cfg = { sites, fleet, aircraft: { seats: 4, routeFactor: 1.15, vtolKm: 5, chargeKmPerMin: 1.5 + r() * 3, rangeKm: U + 20 * KM, reserveMin: 20 }, profile: P,
    ops: { padOccupancy: 60 + Math.floor(r() * 120), turnaround: 300, maxWait: 1800, reposition: r() < 0.8, padRule: rule }, demand, hours: 4, warm: 1800, seed: c + 1, trace: true };
  let res; try { res = N5.simulate(cfg); } catch (e) { bad(`air case ${c}: engine threw ${e.message}`); continue; }
  const byAc = {}; for (const f of res.trace) (byAc[f[0]] = byAc[f[0]] || []).push(f);
  // 1. an aircraft never flies two flights at once; each flight's times are ordered
  for (const [id, fl] of Object.entries(byAc)) { fl.sort((a, b) => a[3] - b[3]);
    for (let i = 0; i < fl.length; i++) { const f = fl[i]; checks++; if (!(f[3] <= f[4] && f[4] <= f[5] && f[5] <= f[6])) bad(`air case ${c}: aircraft ${id} flight times out of order ${f.slice(3, 7)}`);
      if (i && fl[i - 1][6] > f[3] + 1e-6) bad(`air case ${c}: aircraft ${id} takes off at ${f[3]} before its previous pad clear ${fl[i - 1][6]}`);
      if (i && fl[i - 1][2] !== f[1]) bad(`air case ${c}: aircraft ${id} departs ${f[1]} but last landed at ${fl[i - 1][2]}`); } }
  // 2. served requests take off no earlier than requested and arrive after take-off; never served when infeasible
  for (const q of res.reqs) { checks++; if (q.served && q.infeasible) bad(`air case ${c}: infeasible request served`);
    if (q.served && (q.depart + 1e-6 < q.t || (q.arrive !== undefined && q.arrive < q.depart))) bad(`air case ${c}: request ${q.id} times ${q.t} ${q.depart} ${q.arrive}`); }
  // 3. stand ledger within limits; pads: at most `pads` take-offs/landings overlapping at a site
  for (const s of res.sites) { checks++; if (s.stands !== undefined && s.stands !== Infinity && s.maxHeld > s.stands) bad(`air case ${c}: site ${s.id} held ${s.maxHeld} > ${s.stands} stands`); }
  const occ = {}; for (const f of res.trace) { (occ[f[1]] = occ[f[1]] || []).push([f[3], f[3] + cfg.ops.padOccupancy]); /* engine: a take-off holds its pad from take-off time (bookPad slot [tt, tt + occupancy]) */ (occ[f[2]] = occ[f[2]] || []).push([f[5], f[6]]); }
  for (const s of sites) { const iv = (occ[s.id] || []).map(([a, b]) => [[a, 1], [b, -1]]).flat().sort((x, y) => x[0] - y[0] || x[1] - y[1]); let n = 0, mx = 0; for (const [, d] of iv) { n += d; mx = Math.max(mx, n); }
    checks++; if (mx > s.pads) bad(`air case ${c}: site ${s.id} up to ${mx} pad uses at once with ${s.pads} pads (rule ${rule})`); }
  // 4. below-reserve landings are counted, never negative charge
  for (const ac of res.aircraft) { checks++; if (ac.soc < -1e-6 && !(res.belowReserve > 0)) bad(`air case ${c}: aircraft ${ac.id} charge ${ac.soc.toFixed(1)} below zero and not counted`); }
}
// ---- delivery drones: flight segments are continuous and time-ordered; via options keep the endpoints
for (let c = 0; c < Math.ceil(CASES / 3); c++) { const cfg = { half: 8000, zone: 4000, warm: 600, meas: 1200 }, S = L.sites(cfg, 3, c + 1), r = rng(77 + c);
  const via = (site, dest) => [site.c[0] + (r() - 0.5) * 4000, site.c[1] + (r() - 0.5) * 4000];
  for (const opt of [undefined, { viaAll: via }, { keep: (s, cu, rr) => rr() < 0.5 }]) { const fl = L.flights(cfg, S, c + 1, L.HEIGHTS.allocation, opt);
    for (const f of fl) { checks++; for (let i = 1; i < f.sg.length; i++) { const a = f.sg[i - 1], b = f.sg[i];
        if (Math.abs(a[0] + a[1] - b[0]) > 1e-6 || Math.hypot(a[5] - b[2], a[6] - b[3]) > 1e-6 || Math.abs(a[7] - b[4]) > 1e-6) { bad(`drone case ${c} ${opt ? Object.keys(opt)[0] : 'base'}: flight ${f.id} segment ${i} not continuous`); break; } }
      const s0 = f.sg[0], s1 = f.sg[f.sg.length - 1]; if (Math.hypot(s0[2] - s1[5], s0[3] - s1[6]) > 1e-6 || s0[4] !== 0 || s1[7] !== 0) bad(`drone case ${c}: flight ${f.id} does not start and end on the ground at its site`); } } }
console.log(`${checks} checks, ${fails} violations`); process.exit(fails ? 1 : 0);
