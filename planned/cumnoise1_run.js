'use strict';
// CUMNOISE1 runner (planned/CUMNOISE1_PREREG.md). Combined en route overflights and DNL from Wing, Zipline and Amazon at filed and cap volumes.
//   node planned/cumnoise1_run.js checks | <shard> <n>   -> out/cumnoise1/r_<shard>.jsonl
// Sites: planned/realsites.js 'full'. Tracks: planned/realops.js unchanged (all PHYS1 factors except the lunch peak), today's heights A0, one 15 h day.
const fs = require('fs'), path = require('path'), RO = require('./realops.js'), RS = require('./realsites.js'), CEN = require('./census.js');
const HR = require('./houreal.js'), DR = require('./dfwreal.js');
const val = v => typeof v === 'function' ? v() : v;
const MET = { houston: { key: 'hou', R: HR }, dfw: { key: 'dfw', R: DR } };
const OPS = ['wing', 'zipline', 'amazon'], A0 = { wing: [46, 91], aOut: 61, zip: 101, aIn: 105 };
const CFG = { warm: 0, meas: 54000 }, HOURS = 15, CELL = 50, STEP = 5, EXCL = 200, SQ = 1000;
const DAILY = { FILED: { houston: { wing: 400, zipline: 1000, amazon: 1000 }, dfw: { wing: 400, zipline: 400, amazon: 1000 } }, CAP: { houston: { wing: 1150, zipline: 1150, amazon: 1150 }, dfw: { wing: 1150, zipline: 1150, amazon: 1150 } } };
const ZDAY = 0.95, NIGHTX = 10;                                    // Zipline: 95 % of flights 07:00-22:00, night counts 10 times
const WCOUNT = { wing: 1, amazon: 1, zipline: 1 / ZDAY }, WDNL = { wing: 1, amazon: 1, zipline: (ZDAY + (1 - ZDAY) * NIGHTX) / ZDAY };
const SEL = { wing: 61.0, amazon: 62.4, zipline: 69.0 }, SELMAX = 78.4, RANGE = { wing: 9656, amazon: 12070, zipline: 16093 };
const dnlOf = e => e > 0 ? 10 * Math.log10(e / 86400) : -Infinity;   // e = sum of N x 10^(SEL/10), daily
const pct = (a, q) => a.length ? a[Math.min(a.length - 1, Math.floor(q * (a.length - 1)))] : 0;

function sitesFor(m, seed, vol) { const k = MET[m].key, zone = RS.M[k].zone, S = RS.sites({ zone }, seed, 'full', k);
  return { zone, S: S.map(s => Object.assign({}, s, { rate: DAILY[vol][m][s.op] * (s.op === 'zipline' ? ZDAY : 1) / HOURS })) }; }
function tracks(m, seed, S) { const R = MET[m].R;
  return RO.flights(CFG, S, seed, A0, { metro: m, toXY: R.toXY, lat0: val(R.lat0), lon0: val(R.lon0), Pk: 2, factors: { peak: false } }); }

// ---- grid: 50 m cells over the zone; a leg counts once in every cell its horizontal path crosses
function makeGrid(zone) { const n = Math.round(2 * zone / CELL); return { zone, n, N: n * n, idx: (x, y) => { const i = Math.floor((x + zone) / CELL), j = Math.floor((y + zone) / CELL); return i < 0 || j < 0 || i >= n || j >= n ? -1 : j * n + i; },
  ctr: k => [-zone + (k % n + 0.5) * CELL, -zone + (Math.floor(k / n) + 0.5) * CELL] }; }
function raster(G, fl, cnt) {   // cnt: {op: Float32Array}; returns legs counted
  const stamp = new Int32Array(G.N); let tag = 0, legs = 0;
  for (const f of fl) { const A = cnt[f.op], w = WCOUNT[f.op]; let lastLeg = null;
    for (const s of f.sg) { const [, , x0, y0, , x1, y1, , , leg] = s, L = Math.hypot(x1 - x0, y1 - y0); if (L < 1e-6) continue;   // vertical climbs, descents and hovers do not count
      if (leg !== lastLeg) { tag++; lastLeg = leg; legs++; }
      const ns = Math.max(1, Math.ceil(L / STEP));
      for (let q = 0; q <= ns; q++) { const k = G.idx(x0 + (x1 - x0) * q / ns, y0 + (y1 - y0) * q / ns); if (k < 0 || stamp[k] === tag) continue; stamp[k] = tag; A[k] += w; } } }
  return legs; }
function receiverMask(G, S) { const ok = new Uint8Array(G.N).fill(1), r = Math.ceil(EXCL / CELL) + 1;
  for (const s of S) { const k0 = G.idx(s.c[0], s.c[1]); if (k0 < 0) continue; const i0 = k0 % G.n, j0 = Math.floor(k0 / G.n);
    for (let j = j0 - r; j <= j0 + r; j++) for (let i = i0 - r; i <= i0 + r; i++) { if (i < 0 || j < 0 || i >= G.n || j >= G.n) continue; const k = j * G.n + i, c = G.ctr(k); if (Math.hypot(c[0] - s.c[0], c[1] - s.c[1]) <= EXCL) ok[k] = 0; } }
  return ok; }
const BGC = {}; function bg(m) { return BGC[m] || (BGC[m] = CEN.loadBG(MET[m].R.toXY)); }

function run(m, vol, seed) {
  const t0 = Date.now(), { zone, S } = sitesFor(m, seed, vol), fl = tracks(m, seed, S), G = makeGrid(zone), cnt = {};
  for (const op of OPS) cnt[op] = new Float32Array(G.N);
  const legs = raster(G, fl, cnt), ok = receiverMask(G, S), TH = [100, 500, 1150, 2300];
  const vals = { all: [] }; OPS.forEach(op => vals[op] = []);
  const ge = {}, geOnly = {}; TH.forEach(t => { ge[t] = 0; geOnly[t] = 0; });
  let nRec = 0, over1 = 0, over2 = 0, over3 = 0, dMax = -Infinity, dMax78 = -Infinity, d45 = 0, d50 = 0; const top = [];
  const people = new Float64Array(G.N); for (const b of bg(m)) { const k = G.idx(b.c[0], b.c[1]); if (k >= 0) people[k] += b.pop; }
  let pop45 = 0, popOver2 = 0, popAll = 0;
  for (let k = 0; k < G.N; k++) { popAll += people[k]; if (!ok[k]) continue; nRec++;
    const c = OPS.map(op => cnt[op][k]), tot = c[0] + c[1] + c[2]; if (tot <= 0) continue;
    vals.all.push(tot); OPS.forEach((op, i) => { if (c[i] > 0) vals[op].push(c[i]); });
    const nops = c.filter(v => v >= 1).length; if (nops >= 1) over1++; if (nops >= 2) { over2++; popOver2 += people[k]; } if (nops >= 3) over3++;
    for (const t of TH) if (tot >= t) { ge[t]++; if (c.every(v => v < t)) geOnly[t]++; }
    const e = OPS.reduce((a, op, i) => a + c[i] * WDNL[op] * Math.pow(10, SEL[op] / 10), 0), e78 = OPS.reduce((a, op, i) => a + c[i] * WDNL[op], 0) * Math.pow(10, SELMAX / 10);
    const d = dnlOf(e); if (d > dMax) dMax = d; const d7 = dnlOf(e78); if (d7 > dMax78) dMax78 = d7; if (d >= 45) { d45++; pop45 += people[k]; } if (d >= 50) d50++;
    if (top.length < 5 || tot > top[top.length - 1].tot) { const ctr = G.ctr(k); let nd = Infinity, nop = null; for (const s of S) { const dd = Math.hypot(s.c[0] - ctr[0], s.c[1] - ctr[1]); if (dd < nd) { nd = dd; nop = s.op; } }
      top.push({ tot: +tot.toFixed(1), byOp: Object.fromEntries(OPS.map((op, i) => [op, +c[i].toFixed(1)])), xy: ctr.map(Math.round), nearestSite: { op: nop, m: Math.round(nd) }, dnl: +d.toFixed(1) }); top.sort((a, b) => b.tot - a.tot); if (top.length > 5) top.pop(); } }
  const dist = {}; for (const key of Object.keys(vals)) { const a = vals[key].sort((x, y) => x - y); dist[key] = { overflown: a.length, max: +(a[a.length - 1] || 0).toFixed(1), p999: +pct(a, 0.999).toFixed(1), p99: +pct(a, 0.99).toFixed(1), p50: +pct(a, 0.5).toFixed(1) }; }
  // reading 2: daily deliveries of every hub whose range covers each 1 km square
  const nq = Math.round(2 * zone / SQ), sq = new Float64Array(nq * nq), sqPop = new Float64Array(nq * nq);
  for (let j = 0; j < nq; j++) for (let i = 0; i < nq; i++) { const x = -zone + (i + 0.5) * SQ, y = -zone + (j + 0.5) * SQ; let t = 0; for (const s of S) if (Math.hypot(s.c[0] - x, s.c[1] - y) <= RANGE[s.op]) t += DAILY[vol][m][s.op]; sq[j * nq + i] = t; }
  for (const b of bg(m)) { const i = Math.floor((b.c[0] + zone) / SQ), j = Math.floor((b.c[1] + zone) / SQ); if (i >= 0 && j >= 0 && i < nq && j < nq) sqPop[j * nq + i] += b.pop; }
  let sqOver = 0, popSq = 0, popSqOver = 0; const sqv = Array.from(sq).sort((a, b) => a - b);
  for (let q = 0; q < nq * nq; q++) { popSq += sqPop[q]; if (sq[q] > 1150) { sqOver++; popSqOver += sqPop[q]; } }
  // Richardson check (DFW, Amazon STX8): Amazon overflights at receivers 1-3 km from the site
  let rich = null; if (m === 'dfw') { const st = DR.AMAZON.find(a => a[0] === 'STX8'), p = DR.toXY(st[1], st[2]), a = [];
    for (let k = 0; k < G.N; k++) { if (!ok[k]) continue; const c = G.ctr(k), d = Math.hypot(c[0] - p[0], c[1] - p[1]); if (d >= 1000 && d <= 3000) a.push(cnt.amazon[k]); }
    a.sort((x, y) => x - y); rich = { receivers: a.length, overflown: a.filter(v => v > 0).length, max: +a[a.length - 1].toFixed(1), p90: +pct(a, 0.9).toFixed(1), p50: +pct(a, 0.5).toFixed(1) }; }
  return { metro: m, vol, seed, sites: Object.fromEntries(OPS.map(op => [op, S.filter(s => s.op === op).length])), flights: Object.fromEntries(OPS.map(op => [op, fl.filter(f => f.op === op).length])), legs, stats: fl.stats,
    receivers: nRec, dist, ge, geOnly, overflownBy: { one: over1, two: over2, three: over3 }, dnl: { max: +dMax.toFixed(2), max78: +dMax78.toFixed(2), ge45: d45, ge50: d50, pop45: Math.round(pop45) },
    popZone: Math.round(popAll), popOverflown2: Math.round(popOver2),
    reading2: { squares: nq * nq, over1150: sqOver, popZone: Math.round(popSq), popOver1150: Math.round(popSqOver), median: sqv[Math.floor(sqv.length / 2)], max: sqv[sqv.length - 1] },
    richardson: rich, top, wall_s: (Date.now() - t0) / 1000 }; }

const J = []; for (const m of ['houston', 'dfw']) for (const vol of ['FILED', 'CAP']) for (const s of [1, 2, 3]) J.push([m, vol, s]);
if (require.main === module) {
  if (process.argv[2] === 'checks') { let bad = 0; const ok = (n, c, i) => { console.log((c ? 'ok  ' : 'FAIL') + ' ' + n + (i !== undefined ? ' ' + JSON.stringify(i) : '')); if (!c) bad++; };
    for (const m of ['houston', 'dfw']) { const { S } = sitesFor(m, 1, 'FILED'), fl = tracks(m, 1, S), got = {}, want = {};
      for (const op of OPS) { got[op] = fl.filter(f => f.op === op).length; want[op] = S.filter(s => s.op === op).length * DAILY.FILED[m][op] * (op === 'zipline' ? ZDAY : 1); }
      ok(`K1 ${m} daily flights per company within 5 % of filed`, OPS.every(op => Math.abs(got[op] / want[op] - 1) <= 0.05), { got, want }); }
    const D = (sel, n, w = 1) => dnlOf(n * w * Math.pow(10, sel / 10));
    const k2 = [D(SEL.wing, 800), D(SEL.amazon, 1000), D(SEL.zipline, 800, ZDAY + (1 - ZDAY) * NIGHTX), D(SELMAX, 1150)].map(v => +v.toFixed(2));
    ok('K2 DNL reproduces filings (Wing 40.7, Amazon 43.0, Zipline 50.3, PEA 59.6)', Math.abs(k2[0] - 40.7) <= 0.1 && Math.abs(k2[1] - 43.0) <= 0.1 && Math.abs(k2[2] - 50.3) <= 0.2 && Math.abs(k2[3] - 59.6) <= 0.1, k2);
    const G = makeGrid(2000), c1 = { wing: new Float32Array(G.N), zipline: new Float32Array(G.N), amazon: new Float32Array(G.N) };
    raster(G, [{ op: 'wing', sg: [[0, 1, -500, 25, 50, 500, 25, 50, 'cruise', 'out']] }], c1); const n1 = c1.wing.filter(v => v > 0).length, once = c1.wing.every(v => v === 0 || v === 1);
    const c2 = { wing: new Float32Array(G.N), zipline: new Float32Array(G.N), amazon: new Float32Array(G.N) };
    raster(G, [{ op: 'amazon', sg: [[0, 1, -500, 25, 50, 500, 25, 50, 'cruise', 'out'], [1, 1, 500, 25, 50, 500, 25, 10, 'vertical', 'out'], [2, 1, 500, 25, 80, -500, 25, 80, 'cruise', 'in']] }], c2);
    ok('K3 a 1,000 m leg crosses 20-21 cells once each; out and back counts 2', (n1 === 20 || n1 === 21) && once && c2.amazon.filter(v => v > 0).every(v => v === 2), [n1, once, Math.max(...c2.amazon)]);
    for (const m of ['houston', 'dfw']) { const { zone, S } = sitesFor(m, 1, 'FILED'), Gm = makeGrid(zone), mk = receiverMask(Gm, S); let leak = 0;
      for (const s of S) for (const dx of [-150, 0, 150]) for (const dy of [-150, 0, 150]) { const k = Gm.idx(s.c[0] + dx, s.c[1] + dy); if (k >= 0 && mk[k]) { const c = Gm.ctr(k); if (Math.hypot(c[0] - s.c[0], c[1] - s.c[1]) <= EXCL) leak++; } }
      const pop = bg(m).filter(b => Math.abs(b.c[0]) <= zone && Math.abs(b.c[1]) <= zone).reduce((a, b) => a + b.pop, 0);
      ok(`K4 ${m} zone population > 1,000,000 and no receiver within 200 m of a site`, pop > 1e6 && leak === 0, [Math.round(pop), leak]); }
    console.log('jobs', J.length, bad ? bad + ' FAILED' : 'ALL PASS'); process.exit(bad ? 1 : 0); }
  const k = +process.argv[2], n = +process.argv[3]; if (!(k >= 0 && n > 0)) { console.error('usage: checks | <shard> <n>'); process.exit(2); }
  fs.mkdirSync('out/cumnoise1', { recursive: true });
  const done = new Set(); for (const f of fs.readdirSync('out/cumnoise1').filter(f => f.endsWith('.jsonl'))) for (const l of fs.readFileSync('out/cumnoise1/' + f, 'utf8').split('\n')) if (l.trim()) { const r = JSON.parse(l); done.add([r.metro, r.vol, r.seed].join('|')); }
  for (const j of J.filter((_, i) => i % n === k)) { if (done.has(j.join('|'))) continue; const r = run(...j); fs.appendFileSync(`out/cumnoise1/r_${k}.jsonl`, JSON.stringify(r) + '\n'); console.log(j.join(' '), r.wall_s, 'max', r.dist.all.max, 'dnl', r.dnl.max); } }
module.exports = { run, J, SEL, DAILY, WCOUNT, WDNL, sitesFor, tracks, makeGrid, raster, receiverMask, bg };
