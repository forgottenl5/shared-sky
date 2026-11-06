'use strict';
// CAPS1 runner (registration planned/CAPS1_PREREG.md). node planned/caps1_run.js checks | <shard> <n>   -> out/caps1/runs_<shard>.jsonl
const fs = require('fs'), L = require('../lab/lab_engine.js');
const MET = { houston: { R: require('./houreal.js'), cfg: { half: 34000 + 17000, zone: 34000, warm: 3600, meas: 7200 } }, dfw: { R: require('./dfwreal.js'), cfg: { half: 40000 + 17000, zone: 40000, warm: 3600, meas: 7200 } } };
const H = { S1: { wing: [46, 91], aOut: 69, zip: 101, aIn: [85, 115] }, A2: { wing: [46, 71], aOut: 81, zip: 101, aIn: 115 } };   // identical to headline2_run.js
const RAD = { wing: 9656, zipline: 16093 };   // service radii as lab_engine OP
function keepFn(S) { const by = { wing: S.filter(s => s.op === 'wing'), zipline: S.filter(s => s.op === 'zipline') };
  return (site, cust, r) => { const list = by[site.op]; if (!list) return true; let n = 0; const R2 = RAD[site.op] ** 2;
    for (const s of list) { const dx = cust[0] - s.c[0], dy = cust[1] - s.c[1]; if (dx * dx + dy * dy <= R2) n++; } return r() < 1 / Math.max(1, n); }; }
function one(m, arm, seed, caps) { const cfg = MET[m].cfg, S = MET[m].R.sites(cfg, seed), fl = L.flights(cfg, S, seed, H[arm], caps ? { keep: keepFn(S) } : undefined);
  const b = L.count(cfg, fl, { sub: 4, tEnd: cfg.warm + cfg.meas, th: [['v10', 30, 10]] }), pairs = {};
  for (const k in b) { const q = k.match(/^v10\|pair\|(.+)$/); if (q && q[1].split('-')[0] !== q[1].split('-')[1]) pairs[q[1]] = b[k]; }
  const byOp = {}; for (const f of fl) byOp[f.op] = (byOp[f.op] || 0) + 1;
  return { metro: m, arm, seed, caps, v10: b['v10|cross'] || 0, pairs, flights: fl.length, byOp, fl, sites: S }; }
if (process.argv[2] === 'checks') { let bad = 0; const ok = (n, c, i) => { console.log((c ? 'ok  ' : 'FAIL') + ' ' + n + (i !== undefined ? ' ' + JSON.stringify(i) : '')); if (!c) bad++; };
  const H2 = fs.readdirSync('out/headline2').flatMap(f => fs.readFileSync('out/headline2/' + f, 'utf8').split('\n').filter(Boolean).map(JSON.parse));
  const s = one('houston', 'S1', 1, false), h = H2.find(x => x.metro === 'houston' && x.arm === 'S1' && x.seed === 1);
  ok('K1 houston S1 seed 1 caps off = HEADLINE2', s.v10 === h.v10 && s.flights === h.flights, [s.v10, h.v10, s.flights, h.flights]);
  const c = one('houston', 'S1', 1, true), used = new Set();
  // flights carry no site id; check per site via the start of the first segment being within the 30 m pad spread of the site centre
  for (const f of c.fl) { const x = f.sg[0][2], y = f.sg[0][3]; for (const st of c.sites) if (st.op === f.op && Math.abs(x - st.c[0]) <= 15 && Math.abs(y - st.c[1]) <= 15) { used.add(st); break; } }
  const missing = c.sites.filter(st => st.op !== 'amazon' && !used.has(st)).length;
  ok('K2 Amazon flights unchanged, every Wing and Zipline site keeps a flight', c.byOp.amazon === s.byOp.amazon && missing === 0, [c.byOp, s.byOp, 'sites without a flight', missing]);
  console.log(bad ? bad + ' FAILED' : 'ALL PASS'); process.exit(bad ? 1 : 0); }
const k = +process.argv[2], n = +process.argv[3]; fs.mkdirSync('out/caps1', { recursive: true });
const J = []; for (const m of ['houston', 'dfw']) for (const arm of ['S1', 'A2']) for (let s = 1; s <= 10; s++) J.push([m, arm, s]);
for (const j of J.filter((_, i) => i % n === k)) { const t = Date.now(), r = one(...j, true); delete r.fl; delete r.sites;
  { const cfg = MET[j[0]].cfg, S0 = MET[j[0]].R.sites(cfg, j[2]), u = {}; for (const f of L.flights(cfg, S0, j[2], H[j[1]])) u[f.op] = (u[f.op] || 0) + 1; r.byOpUncapped = u; }   /* uncapped flight counts, generation only */ r.wall_s = (Date.now() - t) / 1000; fs.appendFileSync(`out/caps1/runs_${k}.jsonl`, JSON.stringify(r) + '\n'); console.log(JSON.stringify({ m: r.metro, arm: r.arm, s: r.seed, v10: r.v10, byOp: r.byOp, wall: r.wall_s })); }
