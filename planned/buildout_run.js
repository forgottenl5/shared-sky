'use strict';
// Runner for BUILDOUT_PREREG.md. node planned/buildout_run.js checks | <shard> <n>
const fs = require('fs'), L = require('../lab/lab_engine.js'), B = require(process.env.METRO === 'dfw' ? './dfwbuild.js' : './buildout.js'), WD = require('./wind.js'), HR = require('./houreal.js');
const cfg = process.env.METRO === 'dfw' ? { half: 40000 + 17000, zone: 40000, warm: 3600, meas: 7200 } : { half: 42000 + 17000, zone: 42000, warm: 3600, meas: 7200 };
if (process.env.METRO === 'dfw') WD.useFile(require('path').join(__dirname, '../data/openmeteo_dfw_2025.json'));
const H = { A0: { wing: [46, 91], aOut: 61, zip: 101, aIn: 105 }, R: { wing: [46, 91], aOut: 69, zip: 101, aIn: 122 }, A2: { wing: [46, 71], aOut: 81, zip: 101, aIn: 115 } };
const P50 = WD.hourWind(WD.studyHours().p50);
const shift = (f, D) => D ? { id: f.id, op: f.op, t0: f.t0 + D, sg: f.sg.map(s => [s[0] + D, ...s.slice(1)]), end: f.end + D } : f;
function cnt(x) { const c = L.count(cfg, x, { sub: 4, tEnd: cfg.warm + cfg.meas }), pairs = {}; for (const k in c) { const m = k.match(/^wide\|pair\|(.+)$/); if (m && m[1].split('-')[0] !== m[1].split('-')[1]) pairs[m[1]] = c[k]; } return { w: c['wide|cross'] || 0, c: c['close|cross'] || 0, pairs }; }
// variant: 'still5' (plan check +-5 s, flown in still air), 'wind5' (+-5 s, flown in p50 wind), 'wind30' (+-30 s, flown in p50 wind)
function one(stage, arm, variant, seed) { const S = B.sites(cfg, seed, stage), fl = L.flights(cfg, S, seed, H[arm]), windy = variant !== 'still5', TB = variant === 'wind30' ? 30 : 5;
  const fly = x => windy ? x.map(f => WD.retime(f, P50)) : x, noCheck = cnt(fly(fl)), ic = L.intentCheck(cfg, fl, 30, TB, 10);
  let checked = 0, delayed = 0, cancelled = 0, dsum = 0; for (const [, D] of ic.delays) { checked++; if (D === null) cancelled++; else if (D > 0) { delayed++; dsum += D; } }
  const acc = fl.map(f => ic.delays.has(f.id) ? (ic.delays.get(f.id) === null ? null : shift(f, ic.delays.get(f.id))) : f).filter(Boolean), after = cnt(fly(acc));
  return { stage, arm, variant, seed, sites: { wing: S.filter(s => s.op === 'wing').length, zipline: S.filter(s => s.op === 'zipline').length, amazon: S.filter(s => s.op === 'amazon').length }, flights: fl.length, noCheck, afterCheck: after, check: { checked, delayed, cancelled, meanDelay: delayed ? Math.round(dsum / delayed) : 0 } }; }
const E = process.env, ls = (v, d) => v ? v.split(',') : d;   // SEEDS study (24 Oct): env overrides; defaults = the registered BUILDOUT job list
const J = []; for (const stage of ls(E.STAGES, E.METRO === 'dfw' ? ['early', 'mid', 'full'] : ['today', 'early', 'mid', 'full'])) for (const arm of ['A0', 'R', 'A2']) for (const variant of ls(E.VARIANTS, ['still5', 'wind5', 'wind30'])) for (const seed of ls(E.SEEDS, ['1', '2', '3']).map(Number)) J.push([stage, arm, variant, seed]);
const OUT = E.OUT || 'out/buildout';
if (E.RESUME) { const fsx = require('fs'), done = new Set(); if (fsx.existsSync(OUT)) for (const f of fsx.readdirSync(OUT)) for (const l of fsx.readFileSync(OUT + '/' + f, 'utf8').split('\n')) if (l.trim()) { const r = JSON.parse(l); done.add([r.stage, r.arm, r.variant, r.seed].join('|')); } const keep = J.filter(j => !done.has(j.join('|'))); J.length = 0; J.push(...keep); }   // resume after an interrupted run; default unchanged
if (process.argv[2] === 'checks') { let ok = process.env.METRO === 'dfw' ? true : B.WING13.length === 13; const inZ = s => Math.abs(s.c[0]) <= cfg.zone && Math.abs(s.c[1]) <= cfg.zone;
  for (const st of Object.keys(B.STAGES)) { const S = B.sites(cfg, 1, st), n = o => S.filter(s => s.op === o).length, want = B.STAGES[st]; const good = n('wing') === want.wing && n('zipline') === want.zipline && n('amazon') === want.amazon && S.every(inZ);
    console.log('K1', st, 'wing', n('wing'), 'zipline', n('zipline'), 'amazon', n('amazon'), 'all in zone', S.every(inZ), good ? 'ok' : 'BAD'); ok = ok && good; }
  const a = B.sites(cfg, 1, 'early'), b = B.sites(cfg, 1, 'full'), nest = a.every(s => b.some(t => t.op === s.op && Math.hypot(t.c[0] - s.c[0], t.c[1] - s.c[1]) < 1e-6)); console.log('K2 stages nest', nest);
  console.log('jobs', J.length, ok && nest ? 'K PASS' : 'K FAIL'); }
else { const k = +process.argv[2], m = +process.argv[3]; fs.mkdirSync(OUT, { recursive: true });
  for (const j of J.filter((_, i) => i % m === k)) { const t = Date.now(), r = one(...j); r.wall_s = (Date.now() - t) / 1000; fs.appendFileSync(`${OUT}/runs_${k}.jsonl`, JSON.stringify(r) + '\n'); } }
