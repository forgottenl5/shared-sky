'use strict';
// ERRORS1 runner (registration planned/ERRORS1_PREREG.md).
//   node planned/errors1_run.js checks          pre-run checks K1-K4
//   node planned/errors1_run.js <shard> <n>     -> out/errors1/runs_<shard>.jsonl   (resumes: finished jobs are skipped)
// Study A (still air, no plan check): HEADLINE2 layouts, current heights A0 vs shared-out heights A2, error levels L0-L4 plus one-error-only arms at L4.
// Study B (windy hours, plan check): COORD1 machinery on A2 heights, arms NONE / V2 / V3, error levels L0, L2, L4. The plan check sees the nominal plans; errors act only on what is flown.
// Error model: each flight gets one random sideways offset (2-D Gaussian), one random height offset (Gaussian) and one random late start (half-Gaussian, whole seconds), fixed for the whole flight.
const fs = require('fs'), path = require('path'), L = require('../lab/lab_engine.js'), W = require('./wind.js'), C = require('./coord.js');
const MET = { houston: { R: require('./houreal.js'), cfg: { half: 34000 + 17000, zone: 34000, warm: 3600, meas: 7200 }, wind: 'data/openmeteo_houston_2025.json' },
  dfw: { R: require('./dfwreal.js'), cfg: { half: 40000 + 17000, zone: 40000, warm: 3600, meas: 7200 }, wind: 'data/openmeteo_dfw_2025.json' } };
const H = { A0: { wing: [46, 91], aOut: 61, zip: 101, aIn: 105 }, A2: { wing: [46, 71], aOut: 81, zip: 101, aIn: 115 } };   // as HEADLINE2 / COORD1
const TH = [['v10', 30, 10], ['v15', 30, 15], ['v20', 30, 20], ['close', 15, 5]];
const K_RAD = Math.sqrt(-2 * Math.log(0.05)), K_VER = 1.96;   // 95 % radial error = 2.4477 sigma (2-D); 95 % vertical error = 1.96 sigma (1-D)
// level: 95 % sideways error (m), 95 % height error (m), late-start sigma (s). L1-L4 sideways/height from the sources in the registration; late start is an assumption.
const LV = { L0: { h95: 0, v95: 0, slip: 0 }, L1: { h95: 3, v95: 4, slip: 5 }, L2: { h95: 8, v95: 13, slip: 15 }, L3: { h95: 15, v95: 33, slip: 30 }, L4: { h95: 30.48, v95: 45.72, slip: 60 } };
const ONLY = { H4: { h95: LV.L4.h95, v95: 0, slip: 0 }, Z4: { h95: 0, v95: LV.L4.v95, slip: 0 }, T4: { h95: 0, v95: 0, slip: LV.L4.slip } };
const lev = k => LV[k] || ONLY[k];
const NA = +process.env.ERR_NA || 6, NB = +process.env.ERR_NB || 6;
function gauss(g) { const u = Math.max(1e-12, g()), v = g(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
function errs(level, seed) { const e = lev(level), sh = e.h95 / K_RAD, sz = e.v95 / K_VER;
  return { zerr: sz ? (id => sz * gauss(L.rng(seed * 7919 + id * 31 + 101))) : null,
    herr: sh ? (id => { const g = L.rng(seed * 104729 + id * 37 + 7); return [sh * gauss(g), sh * gauss(g)]; }) : null,
    slip: e.slip ? (id => Math.round(Math.abs(e.slip * gauss(L.rng(seed * 15485863 + id * 41 + 3))))) : null }; }
const late = (f, s) => s ? C.shift(f, s) : f;
// ---- Study A
function oneA(m, arm, level, seed) { const cfg = MET[m].cfg, S = MET[m].R.sites(cfg, seed), fl = L.flights(cfg, S, seed, H[arm]), E = errs(level, seed);
  const flown = E.slip ? fl.map(f => late(f, E.slip(f.id))) : fl;
  const c = L.count(cfg, flown, { sub: 4, tEnd: cfg.warm + cfg.meas, th: TH, zerr: E.zerr, herr: E.herr });
  return { study: 'A', metro: m, arm, level, seed, v10: c['v10|cross'] || 0, v15: c['v15|cross'] || 0, v20: c['v20|cross'] || 0, close: c['close|cross'] || 0, flights: fl.length }; }
// ---- Study B (COORD1 one(), with errors on the flown flights only)
const HR = {}; function hours(m) { if (!HR[m]) { W.useFile(path.join(__dirname, '..', MET[m].wind)); HR[m] = W.bandHours(0.85, 0.95, Math.max(NB, 10)); } W.useFile(path.join(__dirname, '..', MET[m].wind)); return HR[m]; }
function oneB(m, arm, level, seed) { const cfg = MET[m].cfg, S = MET[m].R.sites(cfg, seed), fl = L.flights(cfg, S, seed, H.A2), E = errs(level, seed);
  const ha = hours(m)[seed - 1], hp = ha - 1, wa = W.hourWind(ha), wp = W.hourWind(hp);
  const planned = fl.map(f => W.retime(f, wp));
  let delays = null, cancelled = 0, checked = 0;
  if (arm !== 'NONE') { const r = C.check(cfg, planned, C.VOL[arm]); delays = r.delays; cancelled = r.cancelled; checked = r.checked; }
  const flown = [];
  for (const f of fl) { const D = delays && delays.has(f.id) ? delays.get(f.id) : 0; if (D === null) continue; flown.push(W.retime(C.shift(f, D + (E.slip ? E.slip(f.id) : 0)), wa)); }
  const c = L.count(cfg, flown, { sub: 4, tEnd: cfg.warm + cfg.meas, th: [['wide', 30, 10], ['close', 15, 5]], zerr: E.zerr, herr: E.herr });
  let n = 0, delayed = 0, canc = 0, sumD = 0;
  if (delays) for (const f of fl) { if (!delays.has(f.id) || f.t0 < cfg.warm || f.t0 >= cfg.warm + cfg.meas) continue; const D = delays.get(f.id); n++; if (D === null) canc++; else if (D > 0) { delayed++; sumD += D; } }
  return { study: 'B', metro: m, arm, level, seed, wide: c['wide|cross'] || 0, close: c['close|cross'] || 0, n, delayed, cancelled: canc, meanD: delayed ? sumD / delayed : 0, windHour: wa.time }; }
const J = [];
for (let s = 1; s <= Math.max(NA, NB); s++) for (const m of ['houston', 'dfw']) {
  if (s <= NA) for (const lv of ['L0', 'L1', 'L2', 'L3', 'L4'].concat(s <= 4 ? ['H4', 'Z4', 'T4'] : [])) for (const arm of ['A0', 'A2']) J.push(['A', m, arm, lv, s]);
  if (s <= NB) for (const lv of ['L0', 'L2', 'L4']) for (const arm of ['NONE', 'V2', 'V3']) J.push(['B', m, arm, lv, s]); }
const key = j => j.join('|');
if (process.argv[2] === 'checks') { let bad = 0; const ok = (n, c, i) => { console.log((c ? 'ok  ' : 'FAIL') + ' ' + n + (i !== undefined ? ' ' + JSON.stringify(i) : '')); if (!c) bad++; };
  const rd = d => fs.readdirSync(d).flatMap(f => fs.readFileSync(d + '/' + f, 'utf8').split('\n').filter(Boolean).map(JSON.parse));
  const HL = rd('out/headline2'), CO = rd('out/coord1');
  for (const [m, arm] of [['houston', 'A0'], ['dfw', 'A2']]) { const r = oneA(m, arm, 'L0', 1), h = HL.find(x => x.metro === m && x.arm === arm && x.seed === 1);
    ok(`K1 ${m} ${arm} seed 1, no errors = HEADLINE2 (v10, v15, v20, close)`, h && r.v10 === h.v10 && r.v15 === h.v15 && r.v20 === h.v20 && r.close === h.close, [[r.v10, r.v15, r.v20, r.close], h && [h.v10, h.v15, h.v20, h.close]]); }
  { const r = oneB('houston', 'V2', 'L0', 1), c = CO.find(x => x.metro === 'houston' && x.heights === 'A2' && x.seed === 1 && x.arm === 'V2');
    ok('K2 houston A2 V2 seed 1 windy hour, no errors = COORD1 (wide, close, delayed)', c && r.wide === c.wide && r.close === c.close && r.delayed === c.cost.all.delayed, [[r.wide, r.close, r.delayed], c && [c.wide, c.close, c.cost.all.delayed]]); }
  { const cfg = MET.houston.cfg, S = MET.houston.R.sites(cfg, 1), fl = L.flights(cfg, S, 1, H.A2), o = { sub: 4, tEnd: cfg.warm + cfg.meas, th: [['wide', 30, 10]] };
    const a = L.count(cfg, fl, o), b = L.count(cfg, fl, Object.assign({}, o, { herr: () => [0, 0] }));
    ok('K3 a zero sideways offset changes nothing', a['wide|cross'] === b['wide|cross'], [a['wide|cross'], b['wide|cross']]); }
  { const e = errs('L4', 3); let r95 = 0, z95 = 0, N = 20000; const hr = [], zr = [];
    for (let id = 1; id <= N; id++) { const h = e.herr(id); hr.push(Math.hypot(h[0], h[1])); zr.push(Math.abs(e.zerr(id))); }
    hr.sort((a, b) => a - b); zr.sort((a, b) => a - b); r95 = hr[Math.floor(0.95 * N)]; z95 = zr[Math.floor(0.95 * N)];
    ok('K4 drawn errors have the intended 95 % values (30.48 m sideways, 45.72 m height, within 4 %)', Math.abs(r95 / 30.48 - 1) < 0.04 && Math.abs(z95 / 45.72 - 1) < 0.04, [r95.toFixed(2), z95.toFixed(2)]); }
  console.log('jobs', J.length, bad ? bad + ' FAILED' : 'ALL PASS'); process.exit(bad ? 1 : 0); }
else if (process.argv[2] === 'time') { for (const j of [['A', 'houston', 'A2', 'L3', 1], ['B', 'houston', 'V3', 'L4', 1]]) { const t = Date.now(); const r = j[0] === 'A' ? oneA(...j.slice(1)) : oneB(...j.slice(1)); console.log(key(j), JSON.stringify(r), (Date.now() - t) / 1000 + 's'); } }
else { const k = +process.argv[2], n = +process.argv[3]; fs.mkdirSync('out/errors1', { recursive: true });
  const done = new Set(); for (const f of fs.readdirSync('out/errors1')) for (const l of fs.readFileSync('out/errors1/' + f, 'utf8').split('\n')) if (l.trim()) { const r = JSON.parse(l); done.add([r.study, r.metro, r.arm, r.level, r.seed].join('|')); }
  for (const j of J.filter((_, i) => i % n === k)) { if (done.has(key(j))) continue; const t = Date.now(), r = j[0] === 'A' ? oneA(...j.slice(1)) : oneB(...j.slice(1)); r.wall_s = (Date.now() - t) / 1000; fs.appendFileSync(`out/errors1/runs_${k}.jsonl`, JSON.stringify(r) + '\n'); console.log(key(j), r.wall_s); } }
