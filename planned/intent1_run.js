'use strict';
// INTENT1 runner (planned/INTENT1_PREREG.md). COORD1's layouts, wind, hours (extended to 10 as SEEDS2) and flight logic, with planned/coordx.js.
//   node planned/intent1_run.js checks | <shard> <n>   -> out/intent1/runs_<shard>.jsonl
const fs = require('fs'), path = require('path'), L = require('../lab/lab_engine.js'), C = require('./coord.js'), X = require('./coordx.js'), RS = require('./realsites.js');
const src = fs.readFileSync(path.join(__dirname, 'coord1_run.js'), 'utf8'), cut = src.indexOf('function one(');
const body = src.slice(0, cut).replace('return W.bandHours(0.85, 0.95, 3);', 'return W.bandHours(0.85, 0.95, 10);');
const M0 = {}; new Function('require', '__dirname', 'module', body + '\nmodule.exports = { W, MET, H, hours };')(require, __dirname, M0);
const { W, MET, H, hours } = M0.exports;
Object.assign(H, { S1: { wing: [46, 91], aOut: 69, zip: 101, aIn: [85, 115] }, M1: { wing: [46, 52], aOut: 76, zip: 101, aIn: 76 } });
const BANDS = { wing: [46, 91], amazon: [55, 115], zipline: [101, 101] }, TH = [['wide', 30, 10]];
const TODAY = { houston: 'today', dfw: 'early' }, KEY = { houston: 'hou', dfw: 'dfw' };
function one(m, hk, seed, vol, mode, sitesMode) {
  const cfg = sitesMode ? { half: RS.M[KEY[m]].zone + 17000, zone: RS.M[KEY[m]].zone, warm: 3600, meas: 7200 } : MET[m].cfg;
  const S = sitesMode ? RS.sites(cfg, seed, TODAY[m], KEY[m]) : MET[m].R.sites(cfg, seed), fl = L.flights(cfg, S, seed, H[hk === 'FLEX' ? 'S1' : hk]);
  const ha = hours(m)[seed - 1], wa = W.hourWind(ha), wp = W.hourWind(ha - 1), planned = fl.map(f => W.retime(f, wp));
  const opt = { own: mode === 'own', flex: hk === 'FLEX' ? BANDS : null }, r = X.check(cfg, planned, X.VOL[vol], opt);
  const flown = [], cost = {}, mv = { n: 0, sumAbs: 0 };
  for (const f of fl) { const D = r.delays.has(f.id) ? r.delays.get(f.id) : 0; if (D === null) continue; const dz = r.moves.get(f.id) || 0; flown.push(W.retime(C.shift(X.moved(f, dz), D), wa));
    if (!r.delays.has(f.id) || f.t0 < cfg.warm || f.t0 >= cfg.warm + cfg.meas) continue; if (dz) { mv.n++; mv.sumAbs += Math.abs(dz); }
    for (const k of ['all', f.op]) { const b = cost[k] || (cost[k] = { n: 0, delayed: 0, cancelled: 0, sumD: 0 }); b.n++; if (D === null) b.cancelled++; else if (D > 0) { b.delayed++; b.sumD += D; } } }
  for (const f of fl) { const D = r.delays.get(f.id); if (D === null && f.t0 >= cfg.warm && f.t0 < cfg.warm + cfg.meas) for (const k of ['all', f.op]) { const b = cost[k] || (cost[k] = { n: 0, delayed: 0, cancelled: 0, sumD: 0 }); b.n++; b.cancelled++; } }
  const c = L.count(cfg, flown, { sub: 4, tEnd: cfg.warm + cfg.meas, th: TH }), own = {}; for (const op of ['wing', 'zipline', 'amazon']) own[op] = c[`wide|pair|${op}-${op}`] || 0;
  return { metro: m, heights: hk, seed, vol, mode, sites: sitesMode ? TODAY[m] : 'headline', flights: fl.length, checked: r.checked, cost, moved: mv, wideCross: c['wide|cross'] || 0, wideOwn: own }; }
const J = [];
for (const m of ['houston', 'dfw']) for (let s = 1; s <= 5; s++) {
  for (const hk of ['A0', 'A2', 'M1', 'FLEX']) for (const vol of ['V2', 'VL1', 'VL2']) J.push([m, hk, s, vol, 'cross', false]);
  for (const hk of ['A2', 'M1', 'FLEX']) J.push([m, hk, s, 'V2', 'own', false]);
  J.push([m, 'A0', s, 'V2', 'cross', true]); }
const keyOf = r => [r.metro, r.heights, r.seed, r.vol, r.mode, r.sites !== 'headline'].join('|');
if (process.argv[2] === 'checks') { let bad = 0; const ok = (n, c, i) => { console.log((c ? 'ok  ' : 'FAIL') + ' ' + n + (i !== undefined ? ' ' + JSON.stringify(i) : '')); if (!c) bad++; };
  const t = require('child_process').spawnSync('node', ['planned/test_coordx.js'], { encoding: 'utf8' }); ok('K1a coordx unit tests', t.status === 0);
  const m = 'houston', cfg = MET[m].cfg, fl = L.flights(cfg, MET[m].R.sites(cfg, 1), 1, H.A2), wp = W.hourWind(hours(m)[0] - 1), planned = fl.map(f => W.retime(f, wp));
  const a = C.check(cfg, planned, C.VOL.V2), b = X.check(cfg, planned, X.VOL.V2, {});
  ok('K1b coordx without options = coord.check (Houston A2 V2 seed 1, every delay)', a.delays.size === b.delays.size && [...a.delays].every(([k, v]) => b.delays.get(k) === v) && b.moves.size === 0, [a.delays.size, b.delays.size]);
  const SD = fs.readdirSync('out/coord1').flatMap(f => fs.readFileSync('out/coord1/' + f, 'utf8').split('\n').filter(Boolean).map(JSON.parse)), o = SD.find(x => x.metro === m && x.heights === 'A2' && x.seed === 1 && x.arm === 'V2'), r = one(m, 'A2', 1, 'V2', 'cross', false);
  ok('K2 runner A2 V2 seed 1 Houston: held and checked = COORD1 row', o && r.cost.all.delayed === o.cost.all.delayed && r.checked === o.checked && r.wideCross === o.wide, [r.cost.all.delayed, o && o.cost.all.delayed, r.wideCross, o && o.wide]);
  console.log('jobs', J.length, bad ? bad + ' FAILED' : 'ALL PASS'); process.exit(bad ? 1 : 0); }
const k = +process.argv[2], n = +process.argv[3]; if (!(k >= 0 && n > 0)) { console.error('usage: checks | <shard> <n>'); process.exit(2); }
fs.mkdirSync('out/intent1', { recursive: true });
const done = new Set(); for (const f of fs.readdirSync('out/intent1')) for (const l of fs.readFileSync('out/intent1/' + f, 'utf8').split('\n')) if (l.trim()) done.add(keyOf(JSON.parse(l)));
for (const j of J.filter((_, i) => i % n === k)) { if (done.has(j.join('|'))) continue; const t = Date.now(), r = one(...j); r.wall_s = (Date.now() - t) / 1000; fs.appendFileSync(`out/intent1/runs_${k}.jsonl`, JSON.stringify(r) + '\n'); console.log(j.join(' '), r.wall_s); }
