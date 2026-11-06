'use strict';
// Runner for AIRTAXI1_PREREG.md. node planned/airtaxi1_run.js checks | <shard> <n>
const fs = require('fs'), L = require('../lab/lab_engine.js'), T = require('../lab/airtaxi.js');
const MET = {
  houston: { B: require('./buildout.js'), xy: require('./houreal.js').toXY, cfg: { half: 42000 + 17000, zone: 42000, warm: 3600, meas: 7200 }, stages: ['today', 'early', 'mid', 'full'],
    sites: { '38TE': [29.7133, -95.3947] } },
  dfw: { B: require('./dfwbuild.js'), xy: require('./dfwreal.js').toXY, cfg: { half: 40000 + 17000, zone: 40000, warm: 3600, meas: 7200 }, stages: ['early', 'mid', 'full'],
    sites: { TOY: [33.0826, -96.8366], '49T': [32.77333, -96.80028], AFW: [32.99028, -97.31944] } } };
const A0 = { wing: [46, 91], aOut: 61, zip: 101, aIn: 105 };
const PROF = s => ({ padZ: 15, vLift: 2.5, slope: s, vClimb: 31, cruiseZ: 610 });
const PER_HOUR = 6, FAR = 20000;
// Departures (lift + climb only) and arrivals (approach + landing only) at one pad; Poisson, random bearing.
function movements(cfg, pad, seed, slope, salt) {
  const r = L.rng(seed * 1009 + salt), END = cfg.warm + cfg.meas, out = [];
  for (const kind of ['dep', 'arr']) { let t = -Math.log(1 - r()) * 3600 / PER_HOUR;
    while (t < END) { const th = 2 * Math.PI * r(), far = [pad[0] + FAR * Math.cos(th), pad[1] + FAR * Math.sin(th)];
      const f = kind === 'dep' ? T.taxiFlight(out.length, Math.round(t), pad, far, PROF(slope)) : T.taxiFlight(out.length, Math.round(t), far, pad, PROF(slope));
      const sg = f.sg.filter(s => s[9] === kind); out.push(Object.assign(f, { sg, t0: sg[0][0], end: sg[sg.length - 1][0] + sg[sg.length - 1][1], kind }));
      t += -Math.log(1 - r()) * 3600 / PER_HOUR; } }
  return out; }
function summ(E) { const o = { movements: E.movements }; for (const k of ['nmac', 'wellclear']) { const R = E.th[k]; o[k] = { n: R.n, byOp: R.byOp, byPhase: R.byPhase, withAny: R.movementsWithAny, dPad: R.list.map(e => e.dPad) }; } return o; }
function one(m, stage, seed) {
  const M = MET[m], cfg = M.cfg, drones = L.flights(cfg, M.B.sites(cfg, seed, stage), seed, A0), out = { metro: m, stage, seed, droneFlights: drones.length, res: [] };
  let salt = 0;
  for (const [code, ll] of Object.entries(M.sites)) { salt++;
    const pad = M.xy(ll[0], ll[1]), tx8 = movements(cfg, pad, seed, 8, salt), tx6 = movements(cfg, pad, seed, 6, salt), o = { pads: [pad] };
    out.res.push({ site: code, profile: 8, arm: 'none', taxis: tx8.length, ...summ(T.encounters(cfg, drones, tx8, o)) });
    out.res.push({ site: code, profile: 6, arm: 'none', taxis: tx6.length, ...summ(T.encounters(cfg, drones, tx6, o)) });
    for (const R of [1000, 2000]) { const X = T.exclude(drones, [pad], R);
      out.res.push({ site: code, profile: 8, arm: 'X' + R / 1000, taxis: tx8.length, dropped: X.dropped, detoured: X.detoured, extraSeconds: X.extraSeconds, ...summ(T.encounters(cfg, X.drones, tx8, o)) }); }
    const RS = T.reserve(cfg, drones, tx8, { Rh: 609.6, Rv: 76.2, TB: 30 });
    out.res.push({ site: code, profile: 8, arm: 'RES', taxis: tx8.length, checked: RS.checked, delayed: RS.delayed, cancelled: RS.cancelled, meanDelay: RS.meanDelay, ...summ(T.encounters(cfg, RS.drones, tx8, o)) });
    if (m === 'dfw' && code === 'TOY' && stage === 'full') for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4, p2 = [pad[0] + 500 * Math.sin(a), pad[1] + 500 * Math.cos(a)], tx = movements(cfg, p2, seed, 8, salt);
      out.res.push({ site: 'TOY+500m_' + ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][k], profile: 8, arm: 'none', taxis: tx.length, ...summ(T.encounters(cfg, drones, tx, { pads: [p2] })) }); } }
  return out; }
const J = []; for (const m of ['houston', 'dfw']) for (const st of MET[m].stages) for (let s = 1; s <= 10; s++) J.push([m, st, s]);
if (process.argv[2] === 'checks') {
  const { execSync } = require('child_process'); let k1 = true; try { execSync('node ' + __dirname + '/../lab/test_airtaxi.js', { stdio: 'pipe' }); } catch (e) { k1 = false; } console.log('K1 lab/test_airtaxi.js', k1 ? 'PASS' : 'FAIL');
  const M = MET.dfw, cfg = M.cfg; let ok = true;
  for (const [code, ll] of Object.entries(M.sites)) { const pad = M.xy(ll[0], ll[1]); for (const sl of [8, 6]) { const tx = movements(cfg, pad, 1, sl, 1);
    for (const f of tx) { const LS = T.lowSamples([f], 206.2, 0, Infinity, 1); if (LS.some(s => Math.hypot(s.x - pad[0], s.y - pad[1]) > 2000)) ok = false;
      const s0 = f.sg[0], sN = f.sg[f.sg.length - 1]; if (f.kind === 'dep' && !(s0[2] === pad[0] && s0[3] === pad[1] && s0[4] === 0)) ok = false; if (f.kind === 'arr' && !(sN[5] === pad[0] && sN[6] === pad[1] && sN[7] === 0)) ok = false; } } }
  console.log('K2 low samples within 2 km; departures start and arrivals end on the pad', ok ? 'PASS' : 'FAIL'); console.log('jobs', J.length); }
else { const k = +process.argv[2], n = +process.argv[3]; fs.mkdirSync('out/airtaxi1', { recursive: true });
  for (const j of J.filter((_, i) => i % n === k)) { const t = Date.now(), r = one(...j); r.wall_s = (Date.now() - t) / 1000; fs.appendFileSync(`out/airtaxi1/runs_${k}.jsonl`, JSON.stringify(r) + '\n'); } }
