'use strict';
// CORRIDOR_PREREG.md part B: HOUREAL with Amazon on registered-path corridors (K 4, D 2 km, orientation random per site).
const fs = require('fs'), L = require('../lab/lab_engine.js'), HR = require('./houreal.js'), { viaFn } = require('./corridor.js');
const cfg = { half: 34000 + 17000, zone: 34000, warm: 3600, meas: 7200 };
const H = { A0: { wing: [46, 91], aOut: 61, zip: 101, aIn: 105 }, R: { wing: [46, 91], aOut: 69, zip: 101, aIn: 122 }, A2: { wing: [46, 71], aOut: 81, zip: 101, aIn: 115 } };
function orient(seed) { const r = L.rng(seed + 4242), m = new Map(); return S => { if (!m.has(S.code)) m.set(S.code, 2 * Math.PI * r()); return m.get(S.code); }; }
function one(arm, seed) { const S = HR.sites(cfg, seed), fl = L.flights(cfg, S, seed, H[arm], { via: viaFn(4, 2000, orient(seed)) }), c = L.count(cfg, fl, { sub: 4 }), pairs = {};
  for (const k in c) { const m = k.match(/^wide\|pair\|(.+)$/); if (m && m[1].split('-')[0] !== m[1].split('-')[1]) pairs[m[1]] = c[k]; }
  return { arm, seed, cross_wide: c['wide|cross'] || 0, cross_close: c['close|cross'] || 0, pairs, flights: fl.length }; }
if (process.argv[2] === 'checks') { const S = HR.sites(cfg, 1), fl = L.flights(cfg, S, 1, H.A0, { via: viaFn(4, 2000, orient(1)) }), am = fl.filter(f => f.op === 'amazon');
  const viaUsed = am.filter(f => f.sg.length === 13).length, base = L.flights(cfg, S, 1, H.A0), same = base.length === fl.length && base.filter(f => f.op !== 'amazon').every((f, i) => JSON.stringify(f.sg) === JSON.stringify(fl.filter(g => g.op !== 'amazon')[i].sg));
  const st = am.find(f => f.sg.length === 13), outEnd = st.sg.findIndex(s => s[8] === 'hover'), turn = st.sg[3];
  console.log('K1 amazon flights', am.length, 'with via', viaUsed, '| non-Amazon flights identical to straight', same, '| sample via point', Math.round(turn[5]), Math.round(turn[6]));
  console.log(viaUsed > 0.8 * am.length && same ? 'K1 PASS' : 'K1 FAIL'); }
else { const k = +process.argv[2], m = +process.argv[3], J = []; for (const arm of ['A0', 'R', 'A2']) for (const seed of [1, 2, 3]) J.push([arm, seed]);
  fs.mkdirSync('out/corridor', { recursive: true }); for (const [arm, seed] of J.filter((_, i) => i % m === k)) { const r = one(arm, seed); fs.appendFileSync(`out/corridor/runs_${k}.jsonl`, JSON.stringify(r) + '\n'); } }
