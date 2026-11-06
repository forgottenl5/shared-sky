'use strict';
// Runner for WIND20_PREREG.md. node planned/wind20_run.js <metro> checks | <metro> <shard> <n>   (metro: hou | dfw)
const fs = require('fs'), path = require('path'), L = require('../lab/lab_engine.js'), WD = require('./wind.js');
const metro = process.argv[2], FILE = { hou: '../data/openmeteo_houston_2025.json', dfw: '../data/openmeteo_dfw_2025.json' }[metro]; WD.useFile(path.join(__dirname, FILE));
const cfg = { half: 22000, zone: 6000, warm: 3600, meas: 7200 }, d = 4;
const H = { A0: { wing: [46, 91], aOut: 61, zip: 101, aIn: 105 }, A2: { wing: [46, 71], aOut: 81, zip: 101, aIn: 115 } };
const BANDS = { p50: WD.bandHours(0.40, 0.60, 20), p90: WD.bandHours(0.85, 0.95, 20), p99: WD.bandHours(0.97, 1.0, 20) };
const shift = (f, D) => D ? { id: f.id, op: f.op, t0: f.t0 + D, sg: f.sg.map(s => [s[0] + D, ...s.slice(1)]), end: f.end + D } : f;
const cnt = x => { const c = L.count(cfg, x, { sub: 4, tEnd: cfg.warm + cfg.meas }); return { w: c['wide|cross'] || 0, c: c['close|cross'] || 0 }; };
function one(arm, band, k) { const seed = k + 1, S = L.sites(cfg, d, seed), fl = L.flights(cfg, S, seed, H[arm]), hi = band === 'still' ? null : BANDS[band][k], h = hi === null ? null : WD.hourWind(hi), fly = x => h ? x.map(f => WD.retime(f, h)) : x;
  const ic = L.intentCheck(cfg, fl, 30, 5, 10), acc = fl.map(f => ic.delays.has(f.id) ? (ic.delays.get(f.id) === null ? null : shift(f, ic.delays.get(f.id))) : f).filter(Boolean);
  return { metro, arm, band, k, seed, hour: h ? h.time : null, w120: h ? h.s[2][1] : 0, noCheck: cnt(fly(fl)), afterCheck: cnt(fly(acc)) }; }
const J = []; for (const arm of ['A0', 'A2']) for (const band of ['still', 'p50', 'p90', 'p99']) for (let k = 0; k < 20; k++) J.push([arm, band, k]);
if (process.argv[3] === 'checks') { const ok = Object.values(BANDS).every(b => b.length === 20 && new Set(b).size === 20);
  console.log('K1', metro, 'bands of 20 distinct hours', ok, Object.fromEntries(Object.entries(BANDS).map(([k, b]) => [k, [Math.min(...b.map(i => WD.hourWind(i).s[2][1])).toFixed(1), Math.max(...b.map(i => WD.hourWind(i).s[2][1])).toFixed(1)]])), '| jobs', J.length, ok ? 'PASS' : 'FAIL'); }
else { const k = +process.argv[3], n = +process.argv[4]; fs.mkdirSync('out/wind20', { recursive: true }); for (const j of J.filter((_, i) => i % n === k)) fs.appendFileSync(`out/wind20/${metro}_${k}.jsonl`, JSON.stringify(one(...j)) + '\n'); }
