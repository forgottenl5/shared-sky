'use strict';
// AIRTAXI_ENC1 runner (registration planned/AIRTAXI_ENC1_PREREG.md). node planned/airtaxi_enc1_run.js checks | <shard> <n>  -> out/airtaxi_enc1/runs_<shard>.jsonl
// Simulation setups copied from taxi/export_airtaxi.js (base network); K1 checks seed 1 against the page export.
const fs = require('fs'), path = require('path'), N = require('../taxi/net5.js');
const KM = 60 * 67 / 1000, U100 = { rangeKm: 100 + 20 * KM, reserveMin: 20 };
const SITES = {
  DFW: { lat0: 33.0, list: [['AFW', 32.9937909, -97.3100623], ['DFWc', 32.9133576, -97.0355091], ['TOY', 33.0811809, -96.841015], ['49T', 32.772891, -96.8024551]],
         routes: [['AFW', 'DFWc'], ['AFW', 'TOY'], ['DFWc', 'TOY'], ['DFWc', '49T']], levels: [[1.5, 2, 6], [3, 2, 8], [6, 4, 12]] },
  HOU: { lat0: 29.75, list: [['IAH', 29.9931058, -95.3416255], ['HOU', 29.6459141, -95.2768951], ['EFD', 29.6073333, -95.15875]],
         routes: [['IAH', 'HOU'], ['IAH', 'EFD']], levels: [[1.5, 2, 6], [3, 2, 8], [6, 4, 10]] } };
const P = { padZ: 15, vLift: 2.5, slope: 8, vClimb: 31, cruiseZ: 610, vCruise: 67 }, WARM = 7200, HOURS = 12;
const ZB = 457, H1 = 2778, V1 = 152.4, D2 = 152.4, GAP = 30, DT = 0.5;
const NET3 = {}; for (const f of fs.readdirSync(path.join(__dirname, '..', 'out')).filter(f => f.startsWith('airtaxi_net3_fleet_')))
  for (const x of JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'out', f)))) if (x.arm === 'U100') NET3[[x.metro, x.r, x.s].join('|')] = x.fleet;
function setup(metro, li, seed) { const M = SITES[metro], c = Math.cos(M.lat0 * Math.PI / 180), n = M.list.length, [r, pads, S] = M.levels[li];
  const xy = M.list.map(([, lat, lon]) => [(lon + 97) * 111320 * c, (lat - 30) * 110574]), F = NET3[[metro, r, seed].join('|')];
  const sites = M.list.map(([id], i) => ({ id, xy: xy[i], pads, stands: S })), fleet = {}; sites.forEach(s => fleet[s.id] = 0); const used = sites.map(() => 0);
  for (let k = 0, i = 0; k < F; i++) { const j = i % n; if (used[j] < S) { used[j]++; fleet[sites[j].id]++; k++; } }
  const demand = []; for (const [a, b] of M.routes) { demand.push({ from: a, to: b, perHour: r }); demand.push({ from: b, to: a, perHour: r }); }
  const res = N.simulate({ sites, fleet, aircraft: Object.assign({ seats: 4, routeFactor: 1.15, vtolKm: 5, chargeKmPerMin: 3.2 }, U100), profile: P,
    ops: { padOccupancy: 90, turnaround: 300, maxWait: 1800, reposition: true, padRule: 'slot' }, demand, hours: HOURS, warm: WARM, seed, trace: true });
  const SX = {}; sites.forEach(s => SX[s.id] = s.xy); return { r, F, trace: res.trace, SX }; }
// position along the profile, as along() in taxi/airtaxi.template.html, metres, no exaggeration; zc = cruise height (arm B redraws within the same times)
function prof(Dm, zcWant) { let zc = zcWant, dc = (zc - P.padZ) * P.slope; if (2 * dc > Dm) { dc = Dm / 2; zc = P.padZ + dc / P.slope; }
  return { dc, zc, tl: P.padZ / P.vLift, tr: Math.hypot(dc, zc - P.padZ) / P.vClimb, tc: Math.max(0, Dm - 2 * dc) / P.vCruise }; }
function mkFlight(f, SX, armB) { const a = SX[f[1]], b = SX[f[2]], dx = b[0] - a[0], dy = b[1] - a[1], Dm = Math.hypot(dx, dy), qa = prof(Dm, P.cruiseZ);
  const q = armB && dx <= 0 ? prof(Dm, ZB) : qa, k = (2 * qa.tr + qa.tc) / Math.max(1e-9, 2 * q.tr + q.tc);   // stretch climb+cruise+descent to arm A's duration
  return { f, a, b, Dm, ux: dx / Dm, uy: dy / Dm, q, k }; }
function pos(F, tt) { const { f, a, q, k, ux, uy, Dm } = F, at = (s, z) => [a[0] + ux * s, a[1] + uy * s, z];
  if (tt < f[3]) return null;
  if (tt <= f[4]) { let e = tt - f[3]; if (e < q.tl) return at(0, P.padZ * e / q.tl); e = (e - q.tl) / k;
    if (e < q.tr) { const u = e / q.tr; return at(q.dc * u, P.padZ + (q.zc - P.padZ) * u); } e -= q.tr;
    if (e < q.tc) return at(q.dc + P.vCruise * e, q.zc); e -= q.tc;
    if (e < q.tr) { const u = e / q.tr; return at(Dm - q.dc * (1 - u), q.zc - (q.zc - P.padZ) * u); } return at(Dm, P.padZ); }
  if (tt < f[5]) return 'hold';
  if (tt < f[5] + q.tl) return at(Dm, P.padZ * (1 - (tt - f[5]) / q.tl)); return null; }
function count(trace, SX, armB, t0, t1) { const FL = trace.map(f => mkFlight(f, SX, armB)).sort((x, y) => x.f[3] - y.f[3]), sx = Object.values(SX);
  const ep = { E1: { en: 0, term: 0 }, E2: { en: 0, term: 0 } }, last = { E1: new Map(), E2: new Map() }, holdSamples = {}; let multiHold = 0, act = [], ix = 0;
  const term = p => sx.some(s => Math.hypot(p[0] - s[0], p[1] - s[1]) < H1);
  for (let tt = t0; tt < t1; tt += DT) {
    while (ix < FL.length && FL[ix].f[3] <= tt) act.push(FL[ix++]); act = act.filter(F => tt < F.f[5] + F.q.tl + 1);
    const air = [], hold = {};
    for (const F of act) { const p = pos(F, tt); if (p === 'hold') hold[F.f[2]] = (hold[F.f[2]] || 0) + 1; else if (p) air.push([F, p]); }
    for (const s in hold) if (hold[s] >= 2) multiHold++;
    for (let i = 0; i < air.length; i++) for (let j = i + 1; j < air.length; j++) { const p = air[i][1], o = air[j][1], h = Math.hypot(p[0] - o[0], p[1] - o[1]), v = Math.abs(p[2] - o[2]);
      const c1 = h < H1 && v < V1, c2 = Math.hypot(h, v) < D2; if (!c1 && !c2) continue; const key = air[i][0].f[0] + '|' + air[j][0].f[0] + '|' + Math.min(air[i][0].f[3], air[j][0].f[3]);
      for (const [nm, c] of [['E1', c1], ['E2', c2]]) if (c) { const L = last[nm].get(key); if (L === undefined || tt - L > GAP) ep[nm][term(p) || term(o) ? 'term' : 'en']++; last[nm].set(key, tt); } } }
  return { ep, multiHoldMinutes: multiHold * DT / 60 }; }
if (process.argv[2] === 'checks') { let bad = 0; const ok = (n, c, d) => { console.log(c ? 'ok  ' : 'FAIL', n, JSON.stringify(d)); if (!c) bad++; };
  const D = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'taxi', 'airtaxi_data.json'), 'utf8'));
  for (const m of ['DFW', 'HOU']) for (let li = 0; li < 3; li++) { const s = setup(m, li, 1), mine = JSON.stringify(s.trace.map(f => [f[0], f[1], f[2], ...f.slice(3, 7).map(Math.round), f[7]]));
    ok(`K1 ${m} level ${li + 1} seed 1 = page export`, mine === JSON.stringify(D.metros[m].levels[li].flights), [s.trace.length, D.metros[m].levels[li].flights.length]);
    let worst = 0; for (const armB of [false, true]) for (const f of s.trace) { const F = mkFlight(f, s.SX, armB), p = pos(F, f[4]), b = s.SX[f[2]]; if (p && p !== 'hold') worst = Math.max(worst, Math.hypot(p[0] - b[0], p[1] - b[1]), Math.abs(p[2] - P.padZ)); }
    ok(`K3 ${m} level ${li + 1} arrival positions at destination pad height`, worst <= 1, worst); }
  const SX = { A: [0, 0], B: [30000, 0] }, T = q => q, flt = (id, from, to, t) => { const T0 = N.flightTime ? null : null; const q = prof(30000, P.cruiseZ), tot = 2 * q.tl + 2 * q.tr + q.tc; return [id, from, to, t, t + tot, t + tot, t + tot + 90, 0]; };
  const head = [flt('a', 'A', 'B', 100), flt('b', 'B', 'A', 100)], same = [flt('a', 'A', 'B', 100), flt('b', 'A', 'B', 190)];
  const h = count(head, SX, false, 0, 3000), sm = count(same, SX, false, 0, 3000), hb = count(head, SX, true, 0, 3000);
  ok('K2 head-on: one en-route E1 and one en-route E2', h.ep.E1.en === 1 && h.ep.E2.en === 1, h.ep); ok('K2 same direction 90 s apart: none', sm.ep.E1.en + sm.ep.E1.term + sm.ep.E2.en + sm.ep.E2.term === 0, sm.ep);
  ok('K2 arm B head-on: no en-route E1 or E2', hb.ep.E1.en === 0 && hb.ep.E2.en === 0, hb.ep);
  console.log(bad ? bad + ' FAILED' : 'ALL PASS'); process.exit(bad ? 1 : 0); }
const k = +process.argv[2], n = +process.argv[3]; fs.mkdirSync('out/airtaxi_enc1', { recursive: true });
const J = []; for (const m of ['DFW', 'HOU']) for (let li = 0; li < 3; li++) for (let s = 1; s <= 10; s++) J.push([m, li, s]);
for (const [m, li, s] of J.filter((_, i) => i % n === k)) { const t = Date.now(), S = setup(m, li, s), r = { metro: m, level: li + 1, r: S.r, seed: s, fleet: S.F, flights: S.trace.length };
  for (const armB of [false, true]) r[armB ? 'B' : 'A'] = count(S.trace, S.SX, armB, WARM, WARM + HOURS * 3600);
  r.wall_s = (Date.now() - t) / 1000; fs.appendFileSync(`out/airtaxi_enc1/runs_${k}.jsonl`, JSON.stringify(r) + '\n'); console.log(JSON.stringify({ m, l: li + 1, s, A: r.A.ep, B: r.B.ep, wall: r.wall_s })); }
