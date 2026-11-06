'use strict';
// Runner for WIND_PREREG.md. node planned/wind_run.js checks | <shard> <n>
const fs = require('fs'), L = require('../lab/lab_engine.js'), WD = require('./wind.js');
const cfg = { half: 22000, zone: 6000, warm: 3600, meas: 7200 };
const H = { A0: { wing: [46, 91], aOut: 61, zip: 101, aIn: 105 }, A2: { wing: [46, 71], aOut: 81, zip: 101, aIn: 115 } };
const HRS = WD.studyHours();
const shift = (f, D) => D ? { id: f.id, op: f.op, t0: f.t0 + D, sg: f.sg.map(s => [s[0] + D, ...s.slice(1)]), end: f.end + D } : f;
function one(d, seed, arm, wind) { const S = L.sites(cfg, d, seed), fl = L.flights(cfg, S, seed, H[arm]), h = wind === 'W0' ? null : WD.hourWind(HRS[wind]);
  const fly = x => h ? x.map(f => WD.retime(f, h)) : x, cnt = x => { const c = L.count(cfg, x, { sub: 4 }); return { w: c['wide|cross'] || 0, c: c['close|cross'] || 0 }; };
  const noCheck = cnt(fly(fl)), ic = L.intentCheck(cfg, fl, 30, 5, 10), acc = fl.map(f => ic.delays.has(f.id) ? (ic.delays.get(f.id) === null ? null : shift(f, ic.delays.get(f.id))) : f).filter(Boolean), after = cnt(fly(acc));
  return { d, seed, arm, wind, hour: h ? h.time : null, noCheck, afterCheck: after, flights: fl.length }; }
if (process.argv[2] === 'checks') { const h = WD.hourWind(HRS.p90); console.log('hours', Object.fromEntries(Object.entries(HRS).map(([k, i]) => [k, WD.hourWind(i).time + ' 120m ' + WD.hourWind(i).s[2][1] + ' m/s'])));
  const calm = { s: [[10, 0], [80, 0], [120, 0], [180, 0]], d80: 0, d120: 0 }, S = L.sites(cfg, 4, 1), fl = L.flights(cfg, S, 1, H.A0);
  const same = fl.every(f => { const g = WD.retime(f, calm); return g.sg.length === f.sg.length && g.sg.every((s, i) => Math.abs(s[0] - f.sg[i][0]) <= g.sg.length && s[1] >= f.sg[i][1] - 1 && s[1] <= f.sg[i][1] + 1); });
  const tail = { s: [[10, 10], [80, 10], [120, 10], [180, 10]], d80: 270, d120: 270 }, seg = [0, 100, 0, 0, 100, 2640, 0, 100, 'cruise', 'out'], g = WD.retime({ id: 0, op: 'wing', t0: 0, sg: [seg] }, tail).sg[0][1];
  const ok = same && g === Math.round(2640 / 36.4); console.log('K1 calm leaves durations within 1 s', same, '| 10 m/s tailwind on a 26.4 m/s, 2,640 m leg ->', g, 's (expect', Math.round(2640 / 36.4) + ')', ok ? 'PASS' : 'FAIL'); }
else { const k = +process.argv[2], m = +process.argv[3], J = []; for (const d of [4, 3]) for (const arm of ['A0', 'A2']) for (const wind of ['W0', 'p50', 'p90', 'p99']) for (const seed of [1, 2, 3]) J.push([d, seed, arm, wind]);
  fs.mkdirSync('out/wind', { recursive: true }); for (const [d, seed, arm, wind] of J.filter((_, i) => i % m === k)) fs.appendFileSync(`out/wind/runs_${k}.jsonl`, JSON.stringify(one(d, seed, arm, wind)) + '\n'); }
