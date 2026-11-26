'use strict';
// PHYS1 runner (planned/PHYS1_PREREG.md). Flights from planned/realops.js; counting as OWN2 (planned/own2_run.js), plan-sharing cost as INTENT2.
//   node planned/phys1_run.js checks | <shard> <n>   -> out/phys1/{u,c}_<shard>.jsonl
const fs = require('fs'), path = require('path'), L = require('../lab/lab_engine.js'), RO = require('./realops.js'), X = require('./coordx.js');
const MET = { houston: { R: require('./houreal.js'), cfg: { half: 51000, zone: 34000, warm: 3600, meas: 7200 } }, dfw: { R: require('./dfwreal.js'), cfg: { half: 57000, zone: 40000, warm: 3600, meas: 7200 } } };
const val = v => typeof v === 'function' ? v() : v;
const H = { A0: { wing: [46, 91], aOut: 61, zip: 101, aIn: 105 }, S1: { wing: [46, 91], aOut: 69, zip: 101, aIn: [85, 115] }, A2: { wing: [46, 71], aOut: 81, zip: 101, aIn: 115 }, G1: { wing: [46, 46], aOut: 73.5, zip: 101, aIn: 73.5 } };
const OFF = { prof: false, zdfw: false, pop: false, air: false, peak: false, amz15: false }, FACT = ['prof', 'zdfw', 'pop', 'air', 'peak', 'amz15'];
const ropts = (m, factors) => ({ metro: m, toXY: MET[m].R.toXY, lat0: val(MET[m].R.lat0), lon0: val(MET[m].R.lon0), Pk: 2, factors });
const TH = [['h30v10', 30, 10], ['h20v5', 20, 5]], OPS = ['wing', 'zipline', 'amazon'];
// ---- U: uncoordinated meetings between and within companies (OWN2's counter, unchanged)
function u(m, arm, seed, factors, tag) {
  const cfg = MET[m].cfg, S = MET[m].R.sites(cfg, seed), fl = RO.flights(cfg, S, seed, H[arm], ropts(m, factors));
  const sites = Object.fromEntries(OPS.map(op => [op, S.filter(s => s.op === op).map(s => s.c)])), near = (op, x, y) => { let d = Infinity; for (const c of sites[op]) d = Math.min(d, Math.hypot(c[0] - x, c[1] - y)); return d; };
  const own = {}; for (const [nm] of TH) { own[nm] = {}; for (const op of OPS) own[nm][op] = { lt50: 0, lt200: 0, far: 0 }; }
  const c = L.count(cfg, fl, { sub: 4, tEnd: cfg.warm + cfg.meas, th: TH, onMeet: (nm, A, B) => { if (A[1] !== B[1]) return; const d = near(A[1], (A[2] + B[2]) / 2, (A[3] + B[3]) / 2), o = own[nm][A[1]]; if (d < 50) o.lt50++; else if (d < 200) o.lt200++; else o.far++; } });
  const cross = {}, same = {}, pairs = {}; for (const [nm] of TH) { cross[nm] = c[`${nm}|cross`] || 0; same[nm] = c[`${nm}|same`] || 0; } for (const k of Object.keys(c)) if (k.includes('|pair|')) pairs[k] = c[k];
  return { part: 'u', tag, metro: m, arm, seed, flights: fl.length, byOp: Object.fromEntries(OPS.map(op => [op, fl.filter(f => f.op === op).length])), stats: fl.stats, cross, same, own, pairs }; }
// ---- C: plan-sharing cost (INTENT2's runner) with flights swapped in by metro (zone size identifies the metro)
function load(file, cutAt, exp) { let src = fs.readFileSync(path.join(__dirname, file), 'utf8'); src = src.slice(0, src.indexOf(cutAt));
  const M = {}; new Function('require', '__dirname', 'module', src + `\nmodule.exports = { ${exp} };`)(require, __dirname, M); return M.exports; }
const I2 = load('intent2_run.js', '\nconst J = [];', 'one, H'); I2.H.G1 = H.G1; Object.assign(X.VOL, { V135: { w: 10, v: 13.5, h0: 10, g: 0.05 } });
const ORIG = L.flights; let SWAP = null;
L.flights = (cfg, S, seed, A, opt) => SWAP ? RO.flights(cfg, S, seed, A, ropts(cfg.zone === 40000 ? 'dfw' : 'houston', SWAP)) : ORIG(cfg, S, seed, A, opt);
function c(m, hk, seed, vol, factors) { SWAP = factors; try { return Object.assign({ part: 'c', tag: 'REAL' }, I2.one(m, hk, seed, vol, 'cross', false)); } finally { SWAP = null; } }
// ---- jobs
const J = [];
for (const m of ['houston', 'dfw']) for (let s = 1; s <= 5; s++) { for (const a of ['A0', 'S1', 'A2', 'G1']) J.push(['u', m, a, s, 'REAL']);
  for (const [h, v] of [['A0', 'N2'], ['A2', 'N2'], ['G1', 'V135'], ['G1', 'N2']]) J.push(['c', m, h, s, v]); }
for (const m of ['houston', 'dfw']) for (let s = 1; s <= 3; s++) for (const f of FACT) { if (m === 'houston' && f === 'zdfw') continue; for (const a of ['S1', 'A2']) J.push(['u', m, a, s, 'NO_' + f]); }
const factorsOf = tag => tag === 'REAL' ? {} : tag === 'OFF' ? OFF : { [tag.slice(3)]: false };
const run = j => j[0] === 'u' ? u(j[1], j[2], j[3], factorsOf(j[4]), j[4]) : c(j[1], j[2], j[3], j[4], {});
const keyOf = r => r.part === 'u' ? ['u', r.metro, r.arm, r.seed, r.tag] : ['c', r.metro, r.heights, r.seed, r.vol];
if (process.argv[2] === 'checks') { let bad = 0; const ok = (n, cc, i) => { console.log((cc ? 'ok  ' : 'FAIL') + ' ' + n + (i !== undefined ? ' ' + JSON.stringify(i) : '')); if (!cc) bad++; };
  const rd = d => fs.readdirSync(d).filter(f => f.endsWith('.jsonl')).flatMap(f => fs.readFileSync(path.join(d, f), 'utf8').split('\n').filter(Boolean).map(JSON.parse));
  const t = require('child_process').spawnSync('node', ['planned/test_realops.js'], { encoding: 'utf8' }); ok('K1 planned/test_realops.js passes (incl. all factors off = engine flights)', t.status === 0);
  const o2 = rd('out/own2').find(x => x.metro === 'dfw' && x.arm === 'A2' && x.seed === 1), r = u('dfw', 'A2', 1, OFF, 'OFF');
  ok('K2 counter with all factors off reproduces OWN2 (DFW A2 seed 1: between and within)', o2 && JSON.stringify(r.cross) === JSON.stringify(o2.cross) && JSON.stringify(r.own) === JSON.stringify(o2.own), [r.cross.h30v10, o2 && o2.cross.h30v10]);
  const i2 = rd('out/intent2').find(x => x.part === 'c' && x.metro === 'houston' && x.heights === 'A2' && x.seed === 1 && x.vol === 'N2'); SWAP = OFF; const rc = I2.one('houston', 'A2', 1, 'N2', 'cross', false); SWAP = null;
  ok('K3 cost runner with all factors off reproduces INTENT2 A2 N2 (Houston seed 1)', i2 && JSON.stringify(rc.cost) === JSON.stringify(i2.cost), [rc.cost.all.delayed, i2 && i2.cost.all.delayed]);
  const m = 'houston', cfg = MET[m].cfg, fl = RO.flights(cfg, MET[m].R.sites(cfg, 1), 1, H.A2, ropts(m, {}));
  ok('K4 realistic flights: fewer than 3 % fly through a 0 ft airport cell (gave-up redraws)', fl.stats.gaveUpAir / fl.stats.n < 0.03, fl.stats);
  console.log('jobs', J.length, bad ? bad + ' FAILED' : 'ALL PASS'); process.exit(bad ? 1 : 0); }
const k = +process.argv[2], n = +process.argv[3]; if (!(k >= 0 && n > 0)) { console.error('usage: checks | <shard> <n>'); process.exit(2); }
fs.mkdirSync('out/phys1', { recursive: true });
const done = new Set(); for (const f of fs.readdirSync('out/phys1').filter(f => f.endsWith('.jsonl'))) for (const l of fs.readFileSync('out/phys1/' + f, 'utf8').split('\n')) if (l.trim()) done.add(keyOf(JSON.parse(l)).join('|'));
for (const j of J.filter((_, i) => i % n === k)) { if (done.has(j.join('|'))) continue; const t = Date.now(), r = run(j); r.wall_s = (Date.now() - t) / 1000; fs.appendFileSync(`out/phys1/${j[0]}_${k}.jsonl`, JSON.stringify(r) + '\n'); console.log(j.join(' '), r.wall_s); }
