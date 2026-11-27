'use strict';
// ROUTE1 runner (planned/ROUTE1_PREREG.md). Departure / arrival gates (planned/realops.js option `gates`) vs direct routing.
//   node planned/route1_run.js checks | <shard> <n>   -> out/route1/{n,c}_<shard>.jsonl
// N part: CUMNOISE1's helpers (overflights, en route DNL, people). C part: PHYS1 / CAPACITY1 plan-sharing cost at filed volume.
const fs = require('fs'), path = require('path'), RO = require('./realops.js'), CN = require('./cumnoise1_run.js');
let src = fs.readFileSync(path.join(__dirname, 'phys1_run.js'), 'utf8'); src = src.slice(0, src.indexOf('\nconst J = [];'));
const M0 = {}; new Function('require', '__dirname', 'module', src + '\nmodule.exports = { c, MET };')(require, __dirname, M0);
const { c } = M0.exports;
const OPS = ['wing', 'zipline', 'amazon'], ARMS = { DIRECT: null, GATE1: 'one', GATE4: 'four' };
let GATES = null; const F0 = RO.flights;
RO.flights = (cfg, S, seed, A, o) => F0(cfg, S, seed, A, GATES ? Object.assign({}, o, { gates: GATES }) : o);   // the same module object is used by CUMNOISE1's and PHYS1's code
const hlen = f => f.sg.reduce((a, s) => a + Math.hypot(s[5] - s[2], s[6] - s[3]), 0);

function runN(m, arm, seed) { GATES = ARMS[arm];
  try { const t0 = Date.now(), { zone, S } = CN.sitesFor(m, seed, 'FILED'), fl = CN.tracks(m, seed, S), G = CN.makeGrid(zone), cnt = {};
    for (const op of OPS) cnt[op] = new Float32Array(G.N);
    CN.raster(G, fl, cnt); const ok = CN.receiverMask(G, S), people = new Float64Array(G.N);
    for (const b of CN.bg(m)) { const k = G.idx(b.c[0], b.c[1]); if (k >= 0) people[k] += b.pop; }
    let mx = 0, dMax = -Infinity, p100 = 0, p50 = 0; const ge = { 100: 0, 500: 0, 1150: 0, 2300: 0 };
    for (let k = 0; k < G.N; k++) { if (!ok[k]) continue; const v = OPS.map(op => cnt[op][k]), tot = v[0] + v[1] + v[2]; if (tot <= 0) continue;
      if (tot > mx) mx = tot; for (const t of Object.keys(ge)) if (tot >= +t) ge[t]++; if (tot >= 100) p100 += people[k]; if (tot >= 50) p50 += people[k];
      const e = OPS.reduce((a, op, i) => a + v[i] * CN.WDNL[op] * Math.pow(10, CN.SEL[op] / 10), 0), d = e > 0 ? 10 * Math.log10(e / 86400) : -Infinity; if (d > dMax) dMax = d; }
    const distKm = {}, nf = {}; for (const op of OPS) { const x = fl.filter(f => f.op === op); nf[op] = x.length; distKm[op] = x.length ? +(x.reduce((a, f) => a + hlen(f), 0) / x.length / 1000).toFixed(3) : 0; }
    const allKm = +(fl.reduce((a, f) => a + hlen(f), 0) / fl.length / 1000).toFixed(3);
    let wedge = null; if (GATES) { wedge = {}; for (const op of OPS) { const s = S.find(q => q.op === op); if (s) { const g = RO.gatesOf(s, { metro: m, toXY: require(m === 'dfw' ? './dfwreal.js' : './houreal.js').toXY, gates: GATES }); wedge[op] = { k0: g.k0, pops: g.wedgePop }; } } }
    return { part: 'n', metro: m, arm, seed, flights: nf, gateUsed: fl.stats.gate || 0, detour: fl.stats.detour, n: fl.length, busiest: +mx.toFixed(1), ge, dnlMax: +dMax.toFixed(2), pop100: Math.round(p100), pop50: Math.round(p50), distKm, allKm, wedge, wall_s: (Date.now() - t0) / 1000 };
  } finally { GATES = null; } }
function runC(m, arm, hk, vol, seed) { GATES = ARMS[arm]; try { const r = c(m, hk, seed, vol, {}); return Object.assign(r, { part: 'c', arm }); } finally { GATES = null; } }

const J = [];
for (const m of ['houston', 'dfw']) for (const s of [1, 2, 3]) { for (const a of Object.keys(ARMS)) J.push(['n', m, a, '-', '-', s]); for (const a of ['GATE1', 'GATE4']) for (const [h, v] of [['A2', 'N2'], ['G1', 'V135']]) J.push(['c', m, a, h, v, s]); }
const keyOf = r => r.part === 'n' ? ['n', r.metro, r.arm, '-', '-', r.seed] : ['c', r.metro, r.arm, r.heights, r.vol, r.seed];
const runJ = j => j[0] === 'n' ? runN(j[1], j[2], j[5]) : runC(j[1], j[2], j[3], j[4], j[5]);
if (process.argv[2] === 'checks') { let bad = 0; const ok = (n, cc, i) => { console.log((cc ? 'ok  ' : 'FAIL') + ' ' + n + (i !== undefined ? ' ' + JSON.stringify(i) : '')); if (!cc) bad++; };
  const rd = d => fs.readdirSync(d).filter(f => f.endsWith('.jsonl')).flatMap(f => fs.readFileSync(path.join(d, f), 'utf8').split('\n').filter(Boolean).map(JSON.parse));
  const cn = rd('out/cumnoise1').find(r => r.metro === 'houston' && r.vol === 'FILED' && r.seed === 1), n0 = runN('houston', 'DIRECT', 1);
  ok('K1 gates off reproduce CUMNOISE1 (Houston FILED seed 1)', n0.busiest === cn.dist.all.max && n0.ge[100] === cn.ge['100'] && n0.ge[500] === cn.ge['500'], [n0.busiest, cn.dist.all.max, n0.ge[100], cn.ge['100'], n0.ge[500], cn.ge['500']]);
  const cap = rd('out/capacity1').find(r => r.part === 'c' && r.metro === 'houston' && r.heights === 'A2' && r.vol === 'N2' && r.seed === 1 && r.axis === 'k' && r.x === 1), c0 = runC('houston', 'DIRECT', 'A2', 'N2', 1);
  ok('K2 gates off reproduce CAPACITY1 k = 1 cost row (Houston A2 N2 seed 1)', JSON.stringify(c0.cost) === JSON.stringify(cap.cost), [c0.cost.all.delayed, cap.cost.all.delayed]);
  for (const m of ['houston', 'dfw']) { const { S } = CN.sitesFor(m, 1, 'FILED'); const fD = CN.tracks(m, 1, S); GATES = 'one'; const fG = CN.tracks(m, 1, S); GATES = null;
    const same = OPS.every(op => fD.filter(f => f.op === op).length === fG.filter(f => f.op === op).length), share = (fG.stats.gate || 0) / fG.length;
    const R = require(m === 'dfw' ? './dfwreal.js' : './houreal.js'); let far = 0, low = true;
    for (const s of S) { const g = RO.gatesOf(s, { metro: m, toXY: R.toXY, gates: 'one' }); if (Math.abs(Math.hypot(g.G[0].p[0] - s.c[0], g.G[0].p[1] - s.c[1]) - 1000) > 1) far++; if (g.wedgePop[g.k0] > Math.min(...g.wedgePop)) low = false; }
    ok(`K3 ${m} same flights per company; >= 50 % use a gate; gates 1,000 m out`, same && share >= 0.5 && far === 0, [same, +share.toFixed(3), far]);
    ok(`K4 ${m} GATE1 wedge is the least-populated of 8 (every site)`, low); }
  console.log('jobs', J.length, bad ? bad + ' FAILED' : 'ALL PASS'); process.exit(bad ? 1 : 0); }
const k = +process.argv[2], n = +process.argv[3]; if (!(k >= 0 && n > 0)) { console.error('usage: checks | <shard> <n>'); process.exit(2); }
fs.mkdirSync('out/route1', { recursive: true });
const done = new Set(); for (const f of fs.readdirSync('out/route1').filter(f => f.endsWith('.jsonl'))) for (const l of fs.readFileSync('out/route1/' + f, 'utf8').split('\n')) if (l.trim()) done.add(keyOf(JSON.parse(l)).join('|'));
for (const j of J.filter((_, i) => i % n === k)) { if (done.has(j.join('|'))) continue; const t = Date.now(), r = runJ(j); r.wall_s = (Date.now() - t) / 1000; fs.appendFileSync(`out/route1/${j[0]}_${k}.jsonl`, JSON.stringify(r) + '\n'); console.log(j.join(' '), r.wall_s); }
