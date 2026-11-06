'use strict';
// Feature checks for lab/airtaxi.js (run: node lab/test_airtaxi.js). Hand-built cases with known answers.
const T = require('./airtaxi.js'); let fails = 0; const ok = (name, c, info) => { console.log((c ? 'ok  ' : 'FAIL') + ' ' + name + (info !== undefined ? ' ' + JSON.stringify(info) : '')); if (!c) fails++; };
const cfg = { half: 20000, zone: 15000, warm: 0, meas: 3600 };
// 1. taxi geometry: 20 km flight, default profile: climb ramp (457-15)*8 = 3536 m horizontal, cruise 457 m
const f = T.taxiFlight(0, 100, [0, 0], [20000, 0]);
const zs = f.sg.map(s => s[7]); ok('T1 cruise height 457', Math.abs(f.cruiseZ - 457) < 1e-9);
const dep = f.sg.find(s => s[8] === 'depart'); ok('T1 departure ramp ends 3536 m out', Math.abs(dep[5] - 3536) < 1, dep[5]);
ok('T1 lands at destination', f.sg[f.sg.length - 1][5] === 20000 && f.sg[f.sg.length - 1][7] === 0);
const at = T.posOf(f, dep[0] + dep[1] / 2); ok('T1 mid-ramp height ~236 m', Math.abs(at[2] - 236) < 3, at);
// short flight: cruise capped
const g = T.taxiFlight(1, 0, [0, 0], [2000, 0]); ok('T1 short flight peaks at 15 + 1000/8 = 140 m', Math.abs(g.cruiseZ - 140) < 1e-9, g.cruiseZ);
// 2. encounters: taxi departs east from (0,0); find when it is 800 m out (height 15 + 800/8 = 115 m)
const tAt = x => { const s = f.sg.find(s => s[8] === 'depart'); return Math.round(s[0] + s[1] * x / 3536); };
const t8 = tAt(800);
const mk = (id, y, z, t) => ({ id, op: 'wing', t0: t - 60, end: t + 60, sg: [[t - 60, 120, 800, y - 1600, z, 800, y + 1600, z, 'cruise', 'out']] });   // north-south drone crossing x = 800 at time t
const d1 = mk(1, 0, 110, t8), d2 = mk(2, 1000, 110, t8), d3 = mk(3, 0, 40, t8);
const E = T.encounters(cfg, [d1, d2, d3], [f], { pads: [[0, 0]] });
ok('T2 crossing drone 5 m below taxi path counts as NMAC', E.th.nmac.list.some(e => e.drone === 1), E.th.nmac.list);
ok('T2 drone 1 km off the path: no NMAC', !E.th.nmac.list.some(e => e.drone === 2));
ok('T2 drone 75 m below: no NMAC (Rv 30.5), well-clear yes (Rv 76.2)', !E.th.nmac.list.some(e => e.drone === 3) && E.th.wellclear.list.some(e => e.drone === 3));
ok('T2 each drone counted once per movement', E.th.nmac.n === 1, E.th.nmac.n);
// 3. exclusion: drone path through a 1 km circle at (0,0) is detoured; minimum distance >= 1000; flight with a point inside is dropped
const thru = { id: 5, op: 'wing', t0: 0, end: 200, sg: [[0, 200, -3000, 0, 60, 3000, 0, 60, 'cruise', 'out']] };
const inside = { id: 6, op: 'wing', t0: 0, end: 30, sg: [[0, 30, 500, 0, 0, 500, 0, 60, 'vertical', 'out']] };
const X = T.exclude([thru, inside], [[0, 0]], 1000);
let mind = Infinity; for (const s of X.drones[0].sg) for (let u = 0; u <= 1; u += 0.01) mind = Math.min(mind, Math.hypot(s[2] + (s[5] - s[2]) * u, s[3] + (s[6] - s[3]) * u));
ok('T3 detoured path stays >= 1000 m from the pad', mind >= 1000, Math.round(mind)); ok('T3 one dropped, one detoured', X.dropped === 1 && X.detoured === 1, [X.dropped, X.detoured]);
ok('T3 detour takes longer', X.drones[0].end > thru.end, [thru.end, X.drones[0].end]);
// 4. reservation: the crossing drone (d1) is delayed; d2 far away is not checked or not delayed
const Rv = T.reserve(cfg, [d1, d2], [f], { Rh: 152.4, Rv: 30.5, TB: 30 });
const nd1 = Rv.drones.find(x => x.id === 1); ok('T4 conflicting drone delayed', nd1 && nd1.t0 > d1.t0, nd1 && nd1.t0 - d1.t0);
const E2 = T.encounters(cfg, Rv.drones, [f], {}); ok('T4 no NMAC after reservation', E2.th.nmac.n === 0, E2.th.nmac.n);
console.log(fails ? fails + ' FAILED' : 'ALL PASS'); process.exit(fails ? 1 : 0);
