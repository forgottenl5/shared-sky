'use strict';
// Tests for planned/prio.js on hand-made crossing flights (segments: [t0, dur, x0, y0, z0, x1, y1, z1, phase, leg]).
const P = require('./prio.js'), X = require('./coordx.js'); let bad = 0; const ok = (n, c) => { console.log((c ? 'ok  ' : 'FAIL') + ' ' + n); if (!c) bad++; };
const cfg = { half: 20000, zone: 20000, warm: 0, meas: 7200 }, vol = { w: 10, v: 14, h0: 10, g: 0.05 };
const cr = (id, op, t0, ang, len) => { const c = Math.cos(ang), s = Math.sin(ang); return { id, op, t0, end: t0 + len / 10, sg: [[t0, len / 10, -c * len / 2, -s * len / 2, 60, c * len / 2, s * len / 2, 60, 'cruise', 'out']] }; };
// three companies crossing at the origin within one batch; the long Amazon flight files first
const fl = [cr(1, 'amazon', 10, 0, 4000), cr(2, 'wing', 20, Math.PI / 2, 1000), cr(3, 'zipline', 30, Math.PI / 4, 2000)];
const d = r => JSON.stringify([...P.check(cfg, fl, vol, { rule: r }).delays].sort((a, b) => a[0] - b[0]));
ok('T1 FCFS equals coordx', d('FCFS') === JSON.stringify([...X.check(cfg, fl, vol).delays].sort((a, b) => a[0] - b[0])));
ok('T2 FCFS: Amazon (first filed) not held', P.check(cfg, fl, vol, { rule: 'FCFS' }).delays.get(1) === 0);
ok('T3 SHORT: Wing (shortest) not held, Amazon held', P.check(cfg, fl, vol, { rule: 'SHORT' }).delays.get(2) === 0 && P.check(cfg, fl, vol, { rule: 'SHORT' }).delays.get(1) > 0);
ok('T4 ROT batch 0: Wing goes first', P.check(cfg, fl, vol, { rule: 'ROT' }).delays.get(2) === 0);
const fl2 = fl.map(f => Object.assign({}, f, { t0: f.t0 + 300, end: f.end + 300, sg: f.sg.map(s => [s[0] + 300].concat(s.slice(1))) }));
ok('T5 ROT batch 1: Zipline goes first', P.check(cfg, fl2, vol, { rule: 'ROT' }).delays.get(3) === 0);
ok('T6 every flight gets a decision under every rule', ['FCFS', 'ROT', 'SHORT', 'FAIR'].every(r => P.check(cfg, fl, vol, { rule: r }).delays.size === 3));
ok('T7 batch path in take-off order equals FCFS', d('BATCHT0') === d('FCFS'));
process.exit(bad ? 1 : 0);
