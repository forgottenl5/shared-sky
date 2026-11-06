'use strict';
// Display export for the "shared sky" close-up page (docs/shared.html): delivery drones and air-taxi movements around two
// vertical-flight sites, from the same code and settings as study AIRTAXI1 (planned/airtaxi1_run.js): full drone build-out,
// seed 1, 8:1 air-taxi climb, 12 movements an hour, the 2 measured hours. Arm "none" (nobody gives way) and arm "RES"
// (drones wait for booked air-taxi movements, AIRTAXI1's reservation arm). Positions are metres from the pad, every 2 s,
// kept within 3 km of the pad. Usage: node taxi/export_shared.js  -> taxi/shared_data.json
const fs = require('fs'), path = require('path'), L = require('../lab/lab_engine.js'), T = require('../lab/airtaxi.js');
// copied verbatim from planned/airtaxi1_run.js (MET, A0, PROF, PER_HOUR, FAR, movements); the export checks it reproduces that study's seed-1 counts
const MET = {
  houston: { B: require('../planned/buildout.js'), xy: require('../planned/houreal.js').toXY, cfg: { half: 42000 + 17000, zone: 42000, warm: 3600, meas: 7200 }, stages: ['today', 'early', 'mid', 'full'],
    sites: { '38TE': [29.7133, -95.3947] } },
  dfw: { B: require('../planned/dfwbuild.js'), xy: require('../planned/dfwreal.js').toXY, cfg: { half: 40000 + 17000, zone: 40000, warm: 3600, meas: 7200 }, stages: ['early', 'mid', 'full'],
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
const R = { MET, A0, movements };
const SITES = [
  { key: 'TMC', metro: 'houston', code: '38TE', name: 'Texas Medical Center helipad, Houston', note: 'The helipad is a working hospital helipad (FAA site 38TE); no air-taxi service there has been announced.' },
  { key: 'TOY', metro: 'dfw', code: 'TOY', name: 'Toyota North America HQ, Plano', note: 'Toyota\u2019s Plano HQ is on Joby\u2019s announced Texas demonstration routes; the pad position here is approximate.' } ];
const RAD = 3000, DT = 3, SEED = 1, STAGE = 'full';
const out = { note: 'Display export of study AIRTAXI1 settings (full drone build-out, seed 1, 8:1 climb, 12 air-taxi movements an hour, 2 measured hours). Positions in metres from the pad; real heights (the page exaggerates them for display).', rad: RAD, dt: DT, sites: [] };
for (const S of SITES) {
  const M = R.MET[S.metro], cfg = M.cfg, drones = L.flights(cfg, M.B.sites(cfg, SEED, STAGE), SEED, R.A0);
  const salt = Object.keys(M.sites).indexOf(S.code) + 1, ll = M.sites[S.code], pad = M.xy(ll[0], ll[1]), tx = R.movements(cfg, pad, SEED, 8, salt);
  const RS = T.reserve(cfg, drones, tx, { Rh: 609.6, Rv: 76.2, TB: 30 }), tA = cfg.warm, tB = cfg.warm + cfg.meas;
  const track = (f, kind) => { const pts = []; let first = null; for (let t = Math.max(tA, Math.ceil(f.t0 / DT) * DT); t < Math.min(tB, f.end); t += DT) { const p = T.posOf(f, t); if (!p) continue;
      const dx = p[0] - pad[0], dy = p[1] - pad[1]; if (Math.hypot(dx, dy) > RAD) { if (first !== null) break; continue; } if (first === null) first = t - tA; pts.push(Math.round(dx), Math.round(dy), Math.round(p[2])); }
    return pts.length >= 6 ? { k: kind, id: f.id, t: first, p: pts } : null; };
  const arm = (dr) => { const E = T.encounters(cfg, dr, tx, { pads: [pad] }); const ev = [];
    for (const nm of ['wellclear', 'nmac']) for (const e of E.th[nm].list) ev.push([nm === 'nmac' ? 1 : 0, Math.round(e.t - tA), e.dPad, e.op, e.taxiZ, e.droneZ, e.taxi, e.dh]);
    ev.sort((a, b) => a[1] - b[1]);
    return { drones: dr.map(f => track(f, f.op[0])).filter(Boolean), events: ev, wellclear: E.th.wellclear.n, nmac: E.th.nmac.n, movements: E.movements, withAny: E.th.wellclear.movementsWithAny }; };
  const a0 = arm(drones), a1 = arm(RS.drones);
  out.sites.push({ key: S.key, name: S.name, note: S.note, taxis: tx.map(f => track(f, f.kind)).filter(Boolean), none: a0, res: Object.assign(a1, { delayed: RS.delayed, cancelled: RS.cancelled, meanDelay: Math.round(RS.meanDelay) }) });
  console.log(S.key, 'drones in 3 km', a0.drones.length, 'taxi tracks', out.sites.at(-1).taxis.length, 'well clear', a0.wellclear, 'nmac', a0.nmac, 'movements', a0.movements, '| RES well clear', a1.wellclear, 'delayed', RS.delayed);
}
// check: same counts as AIRTAXI1's own seed-1 full-stage run (out/airtaxi1/runs_*.jsonl)
{ const rows = fs.readdirSync(path.join(__dirname, '..', 'out', 'airtaxi1')).filter(f => f.endsWith('.jsonl')).flatMap(f => fs.readFileSync(path.join(__dirname, '..', 'out', 'airtaxi1', f), 'utf8').split('\n').filter(Boolean).map(JSON.parse));
  let bad = 0; for (const [i, S] of SITES.entries()) { const r = rows.find(x => x.metro === S.metro && x.stage === STAGE && x.seed === SEED); const pick = arm => r.res.find(z => z.site === S.code && z.profile === 8 && z.arm === arm);
    for (const [arm, mine] of [['none', out.sites[i].none], ['RES', out.sites[i].res]]) { const z = pick(arm), ok = z && z.wellclear.n === mine.wellclear && z.nmac.n === mine.nmac && z.movements === mine.movements;
      console.log(ok ? 'ok  ' : 'FAIL', S.key, arm, 'AIRTAXI1:', z && [z.wellclear.n, z.nmac.n, z.movements], 'export:', [mine.wellclear, mine.nmac, mine.movements]); if (!ok) bad++; } }
  if (bad) { console.error('export does not reproduce AIRTAXI1'); process.exit(1); } }
fs.writeFileSync(path.join(__dirname, 'shared_data.json'), JSON.stringify(out)); console.log('wrote', fs.statSync(path.join(__dirname, 'shared_data.json')).size, 'bytes');
