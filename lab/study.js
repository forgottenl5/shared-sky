'use strict';
// One study runner for any city (4 Nov 2026). A study is a JSON spec, not a copied script.
//   node lab/study.js <spec.json> jobs              list the jobs
//   node lab/study.js <spec.json> <shard> <n>       run shard k of n -> <out>/runs_<k>.jsonl (resumes: finished jobs are skipped)
//   node lab/study.js check                         the generic runner reproduces committed ERRORS1 / ERRORS2 / HEADLINE2 rows
// Spec: { name, out, cities: ["houston", ...] (cities/<name>.json), heights: {ARM: {wing, aOut, zip, aIn}},
//   cells: [ { tag, type: "count" | "check", arms: [...], errors: [{label, level, rho?, shared?}], seeds: {from, to} or a list,
//              th: [[name, horiz m, vert m], ...] (count; default v10/v15/v20/close),
//              check: {heights: ARM, wind: [lo, hi, nHours]} (type check: plan check on nominal plans in windy hours; arms NONE / V2 / V3) } ] }
// Job order: seed, then city, then cell, then arm, then error (as ERRORS1/2).
const fs = require('fs'), path = require('path'), L = require('./lab_engine.js'), CITY = require('./city.js'), E = require('./errors.js');
const C = require('../planned/coord.js'), W = require('../planned/wind.js');
const TH0 = [['v10', 30, 10], ['v15', 30, 15], ['v20', 30, 20], ['close', 15, 5]];
const seedsOf = s => Array.isArray(s) ? s : Array.from({ length: s.to - s.from + 1 }, (_, i) => s.from + i);   // {from, to} or a list
const lab = e => e.label || [e.level, e.rho ? 'rho' + e.rho : '', e.shared === false ? 'personal' : ''].filter(Boolean).join('_');
function jobs(S) { const J = [], maxS = Math.max(...S.cells.flatMap(c => seedsOf(c.seeds)));
  for (let s = 1; s <= maxS; s++) for (const m of S.cities) S.cells.forEach((c, ci) => { if (!seedsOf(c.seeds).includes(s)) return;
    for (const lvSpec of c.errors) for (const arm of c.arms) J.push({ cell: ci, tag: c.tag, city: m, arm, err: lvSpec, seed: s }); });
  return J; }
const keyOf = j => [j.tag, j.city, j.arm, lab(j.err), j.seed].join('|');
const cities = {}; const city = m => cities[m] || (cities[m] = CITY.load(m));
const HR = {}; function windHours(m, band) { const c = city(m), k = m + band.join(','); W.useFile(path.join(__dirname, '..', c.wind)); if (!HR[k]) HR[k] = W.bandHours(band[0], band[1], band[2]); return HR[k]; }
function runJob(S, j) { const c = city(j.city), cfg = c.cfg, cell = S.cells[j.cell], sites = c.sites(cfg, j.seed), X = E.build(j.err, j.seed), base = { tag: j.tag, city: j.city, arm: j.arm, err: lab(j.err), seed: j.seed };
  if (cell.type === 'count') { const fl = L.flights(cfg, sites, j.seed, S.heights[j.arm]), th = cell.th || TH0;
    const flown = X.slip ? fl.map(f => { const s = X.slip(f.id); return s ? C.shift(f, s) : f; }) : fl;
    const r = L.count(cfg, flown, { sub: 4, tEnd: cfg.warm + cfg.meas, th, zerr: X.zerr, herr: X.herr, field: X.field });
    for (const t of th) base[t[0]] = r[t[0] + '|cross'] || 0; base.flights = fl.length; return base; }
  if (cell.type === 'check') { const fl = L.flights(cfg, sites, j.seed, S.heights[cell.check.heights]), ha = windHours(j.city, cell.check.wind)[j.seed - 1], wa = W.hourWind(ha), wp = W.hourWind(ha - 1);
    const planned = fl.map(f => W.retime(f, wp)); let delays = null;
    if (j.arm !== 'NONE') delays = C.check(cfg, planned, C.VOL[j.arm]).delays;
    const flown = []; for (const f of fl) { const D = delays && delays.has(f.id) ? delays.get(f.id) : 0; if (D === null) continue; flown.push(W.retime(C.shift(f, D + (X.slip ? X.slip(f.id) : 0)), wa)); }
    const r = L.count(cfg, flown, { sub: 4, tEnd: cfg.warm + cfg.meas, th: [['wide', 30, 10], ['close', 15, 5]], zerr: X.zerr, herr: X.herr, field: X.field });
    let n = 0, delayed = 0, canc = 0, sumD = 0;
    if (delays) for (const f of fl) { if (!delays.has(f.id) || f.t0 < cfg.warm || f.t0 >= cfg.warm + cfg.meas) continue; const D = delays.get(f.id); n++; if (D === null) canc++; else if (D > 0) { delayed++; sumD += D; } }
    return Object.assign(base, { wide: r['wide|cross'] || 0, close: r['close|cross'] || 0, n, delayed, cancelled: canc, meanD: delayed ? sumD / delayed : 0, windHour: wa.time }); }
  throw new Error('unknown cell type ' + cell.type); }
module.exports = { jobs, runJob, keyOf };
if (require.main === module) {
  if (process.argv[2] === 'check') {   // generic runner vs registered runners' committed rows (picked jobs; ~2 min each)
    const rd = d => fs.readdirSync(d).flatMap(f => fs.readFileSync(path.join(d, f), 'utf8').split('\n').filter(Boolean).map(JSON.parse));
    const S = JSON.parse(fs.readFileSync(path.join(__dirname, 'studies', 'errors1.json'), 'utf8')), E1 = rd('out/errors1'); let bad = 0, n = 0;
    const picks = [{ tag: 'A', city: 'houston', arm: 'A2', err: { level: 'L2' }, seed: 1 }, { tag: 'A', city: 'dfw', arm: 'A0', err: { level: 'Z4' }, seed: 2 }, { tag: 'B', city: 'houston', arm: 'V2', err: { level: 'L4' }, seed: 1 }];
    for (const p of picks) { p.cell = S.cells.findIndex(c => c.tag === p.tag); const r = runJob(S, p), o = E1.find(x => x.study === p.tag && x.metro === p.city && x.arm === p.arm && x.level === p.err.level && x.seed === p.seed);
      const ks = p.tag === 'A' ? ['v10', 'v15', 'v20', 'close'] : ['wide', 'close', 'n', 'delayed', 'cancelled']; const ok = o && ks.every(k => r[k] === o[k]); n++; if (!ok) bad++;
      console.log((ok ? 'ok   ' : 'FAIL ') + keyOf(p), JSON.stringify(ks.map(k => r[k])), o && JSON.stringify(ks.map(k => o[k]))); }
    console.log(`${n - bad} of ${n} identical to ERRORS1`); process.exit(bad ? 1 : 0); }
  const S = JSON.parse(fs.readFileSync(process.argv[2], 'utf8')), J = jobs(S);
  if (process.argv[3] === 'jobs') { for (const j of J) console.log(keyOf(j)); console.log(J.length, 'jobs'); process.exit(0); }
  const k = +process.argv[3], n = +process.argv[4]; fs.mkdirSync(S.out, { recursive: true });
  const done = new Set(); for (const f of fs.readdirSync(S.out)) for (const l of fs.readFileSync(path.join(S.out, f), 'utf8').split('\n')) if (l.trim()) { const r = JSON.parse(l); done.add([r.tag, r.city, r.arm, r.err, r.seed].join('|')); }
  for (const j of J.filter((_, i) => i % n === k)) { if (done.has(keyOf(j))) continue; const t = Date.now(), r = runJob(S, j); r.wall_s = (Date.now() - t) / 1000; fs.appendFileSync(path.join(S.out, `runs_${k}.jsonl`), JSON.stringify(r) + '\n'); console.log(keyOf(j), r.wall_s); } }
