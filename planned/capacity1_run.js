'use strict';
// CAPACITY1 runner (planned/CAPACITY1_PREREG.md). PHYS1's realistic flights (all factors on) at scaled traffic.
//   node planned/capacity1_run.js checks | <shard> <n>   -> out/capacity1/{u,c}_<shard>.jsonl
// Volume is scaled per site (utilisation k: each site's hourly rate times k) or by building out a share f of each company's sites at full rate.
// The site lists are wrapped at the source (houreal / dfwreal .sites); PHYS1's code is loaded unchanged.
const fs = require('fs'), path = require('path');
let src = fs.readFileSync(path.join(__dirname, 'phys1_run.js'), 'utf8'); src = src.slice(0, src.indexOf('\nconst J = [];'));
const M0 = {}; new Function('require', '__dirname', 'module', src + '\nmodule.exports = { u, c, H, MET, OFF, RO, L, I2 };')(require, __dirname, M0);
const { u, c, H, MET, RO, L } = M0.exports;
const OPS = ['wing', 'zipline', 'amazon'];
// ---- volume scaling
let SC = { k: 1, f: 1 };
const baseRate = (s, metro) => s.rate || (s.op === 'wing' ? 400 / 15 : s.op === 'amazon' ? 1000 / 15 : 1000 * 0.95 / 15);   // PHYS1 REAL rates (amz15 on)
function scaleSites(S, metro, seed) {
  if (SC.k === 1 && SC.f === 1) return S;
  let out = S;
  if (SC.f !== 1) { const r = L.rng(seed + 7919), keep = new Set();
    for (const op of OPS) { const list = S.filter(s => s.op === op).map(s => [r(), s]).sort((a, b) => a[0] - b[0]).map(x => x[1]); list.slice(0, Math.max(1, Math.round(list.length * SC.f))).forEach(s => keep.add(s)); }
    out = S.filter(s => keep.has(s)); }
  if (SC.k !== 1) out = out.map(s => Object.assign({}, s, { rate: baseRate(s, metro) * SC.k }));
  return out; }
for (const m of ['houston', 'dfw']) { const R = MET[m].R, orig = R.sites; R.sites = (cfg, seed, ...rest) => scaleSites(orig.call(R, cfg, seed, ...rest), m, seed); }
// ---- fleet: aircraft in the air at once per site (no turnaround time: a lower bound on fleet needed)
let LAST = null; const LF = L.flights; L.flights = (...a) => (LAST = LF(...a));
function fleet(fl, S) {
  const res = {};
  for (const op of OPS) { const sites = S.filter(s => s.op === op); if (!sites.length) continue; const ev = sites.map(() => []);
    for (const f of fl) { if (f.op !== op) continue; const p = [f.sg[0][2], f.sg[0][3]]; let bi = 0, bd = Infinity; sites.forEach((s, i) => { const d = Math.hypot(s.c[0] - p[0], s.c[1] - p[1]); if (d < bd) { bd = d; bi = i; } }); ev[bi].push([f.t0, 1], [f.end, -1]); }
    const peaks = ev.map(e => { e.sort((a, b) => a[0] - b[0] || a[1] - b[1]); let n = 0, mx = 0; for (const [, d] of e) { n += d; if (n > mx) mx = n; } return mx; }).sort((a, b) => a - b);
    res[op] = { sites: peaks.length, max: peaks[peaks.length - 1], p95: peaks[Math.floor(0.95 * (peaks.length - 1))], median: peaks[Math.floor(0.5 * (peaks.length - 1))] }; }
  return res; }
// ---- jobs
const K = [0.1, 0.25, 0.5, 0.75, 1, 1.5], F = [0.25, 0.5], CFG = [['A0', 'N2'], ['A2', 'N2'], ['G1', 'N2'], ['G1', 'V135']], SEEDS = [1, 2, 3];
const J = [];
for (const m of ['houston', 'dfw']) for (const s of SEEDS) {
  for (const k of K) { for (const [h, v] of CFG) J.push(['c', m, h, v, s, 'k', k]); for (const a of ['S1', 'A2']) J.push(['u', m, a, '-', s, 'k', k]); }
  for (const f of F) for (const [h, v] of CFG.slice(0, 2)) J.push(['c', m, h, v, s, 'f', f]); }
function run(j) {
  const [part, m, h, v, s, ax, x] = j; SC = ax === 'k' ? { k: x, f: 1 } : { k: 1, f: x };
  try {
    if (part === 'u') { const r = u(m, h, s, {}, 'REAL'); delete r.pairs; return Object.assign(r, { axis: ax, x }); }
    LAST = null; const r = c(m, h, s, v, {}), cfg = MET[m].cfg, S = MET[m].R.sites(cfg, s);
    return Object.assign(r, { axis: ax, x, fleet: LAST ? fleet(LAST, S) : null, siteCount: Object.fromEntries(OPS.map(op => [op, S.filter(q => q.op === op).length])) });
  } finally { SC = { k: 1, f: 1 }; } }
const keyOf = r => r.part === 'u' ? ['u', r.metro, r.arm, '-', r.seed, r.axis, r.x] : ['c', r.metro, r.heights, r.vol, r.seed, r.axis, r.x];
if (process.argv[2] === 'checks') { let bad = 0; const ok = (n, cc, i) => { console.log((cc ? 'ok  ' : 'FAIL') + ' ' + n + (i !== undefined ? ' ' + JSON.stringify(i) : '')); if (!cc) bad++; };
  const rd = d => fs.readdirSync(d).filter(f => f.endsWith('.jsonl')).flatMap(f => fs.readFileSync(path.join(d, f), 'utf8').split('\n').filter(Boolean).map(JSON.parse));
  const P1 = rd('out/phys1');
  const pc = P1.find(x => x.part === 'c' && x.metro === 'houston' && x.heights === 'A2' && x.vol === 'N2' && x.seed === 1), rc = run(['c', 'houston', 'A2', 'N2', 1, 'k', 1]);
  ok('K1 k = 1 reproduces PHYS1 cost row (Houston A2 N2 seed 1)', pc && JSON.stringify(rc.cost) === JSON.stringify(pc.cost), [rc.cost.all.delayed, pc && pc.cost.all.delayed]);
  const pu = P1.find(x => x.part === 'u' && x.tag === 'REAL' && x.metro === 'dfw' && x.arm === 'A2' && x.seed === 1), ru = run(['u', 'dfw', 'A2', '-', 1, 'k', 1]);
  ok('K2 k = 1 reproduces PHYS1 meeting row (DFW A2 seed 1)', pu && JSON.stringify(ru.cross) === JSON.stringify(pu.cross) && JSON.stringify(ru.own) === JSON.stringify(pu.own), [ru.cross.h30v10, pu && pu.cross.h30v10]);
  const cfg = MET.houston.cfg, S = MET.houston.R.sites(cfg, 1), n1 = RO.flights(cfg, S, 1, H.A2, { metro: 'houston', toXY: MET.houston.R.toXY, lat0: typeof MET.houston.R.lat0 === 'function' ? MET.houston.R.lat0() : MET.houston.R.lat0, lon0: typeof MET.houston.R.lon0 === 'function' ? MET.houston.R.lon0() : MET.houston.R.lon0, Pk: 2, factors: {} }).length;
  SC = { k: 0.5, f: 1 }; const S5 = MET.houston.R.sites(cfg, 1); const n5 = RO.flights(cfg, S5, 1, H.A2, { metro: 'houston', toXY: MET.houston.R.toXY, lat0: typeof MET.houston.R.lat0 === 'function' ? MET.houston.R.lat0() : MET.houston.R.lat0, lon0: typeof MET.houston.R.lon0 === 'function' ? MET.houston.R.lon0() : MET.houston.R.lon0, Pk: 2, factors: {} }).length;
  SC = { k: 1, f: 0.5 }; const Sf = MET.houston.R.sites(cfg, 1); SC = { k: 1, f: 1 };
  ok('K3 k = 0.5 gives 45-55 % of the flights; f = 0.5 keeps about half of each company\'s sites', n5 / n1 > 0.45 && n5 / n1 < 0.55 && OPS.every(op => { const a = S.filter(s => s.op === op).length, b = Sf.filter(s => s.op === op).length; return b === Math.max(1, Math.round(a * 0.5)); }), [n1, n5, OPS.map(op => Sf.filter(s => s.op === op).length)]);
  ok('K4 fleet counter: every flight assigned, peaks positive', rc.fleet && OPS.every(op => rc.fleet[op] && rc.fleet[op].max > 0), rc.fleet);
  console.log('jobs', J.length, bad ? bad + ' FAILED' : 'ALL PASS'); process.exit(bad ? 1 : 0); }
const k = +process.argv[2], n = +process.argv[3]; if (!(k >= 0 && n > 0)) { console.error('usage: checks | <shard> <n>'); process.exit(2); }
fs.mkdirSync('out/capacity1', { recursive: true });
const done = new Set(); for (const f of fs.readdirSync('out/capacity1').filter(f => f.endsWith('.jsonl'))) for (const l of fs.readFileSync('out/capacity1/' + f, 'utf8').split('\n')) if (l.trim()) done.add(keyOf(JSON.parse(l)).join('|'));
for (const j of J.filter((_, i) => i % n === k)) { if (done.has(j.join('|'))) continue; const t = Date.now(), r = run(j); r.wall_s = (Date.now() - t) / 1000; fs.appendFileSync(`out/capacity1/${j[0]}_${k}.jsonl`, JSON.stringify(r) + '\n'); console.log(j.join(' '), r.wall_s); }
