'use strict';
// REALSITES: build-out stages on real candidate sites (OSM Walmart stores, founder downloads 24 Oct 2026).
// Growth rule: each company starts from its known sites and repeatedly claims the unclaimed Walmart nearest to its existing network; Wing and Zipline pick in turn (DFW).
// Houston: Wing starts from its 13 operating stores; Zipline (restaurant / hospital partners in Houston, not Walmart) stays random as in BUILDOUT.
// DFW: Wing starts at its Frisco and Little Elm nests (2022 FAA decision, DroneXL tracker); Zipline at Mesquite (first DFW site, Apr 2025). When stores run out, the rest are random.
const fs = require('fs'), path = require('path'), L = require('../lab/lab_engine.js'), HR = require('./houreal.js'), DR = require('./dfwreal.js'), BO = require('./buildout.js'), DB = require('./dfwbuild.js');
function stores(file) { const d = JSON.parse(fs.readFileSync(path.join(__dirname, '../data', file), 'utf8')).elements, seen = new Map();
  for (const e of d) { const t = e.tags || {}, lat = e.lat !== undefined ? e.lat : e.center && e.center.lat, lon = e.lon !== undefined ? e.lon : e.center && e.center.lon; if (lat === undefined) continue;
    const ref = t['ref:walmart'] || t.ref || 'osm' + e.id; if (!seen.has(ref)) seen.set(ref, { ref, lat, lon, name: t.name || '' }); } return [...seen.values()]; }
const M = {
  hou: { toXY: HR.toXY, zone: 42000, file: 'walmart_houston_osm.json', stages: BO.STAGES, amz: (S) => BO.AMZ_ORDER.slice(0, S.amazon).map(c => { const a = HR.AMAZON.find(x => x[0] === c); return HR.toXY(a[1], a[2]); }),
    wingStart: () => BO.WING13.map(w => HR.toXY(w[1], w[2])), zipStart: null, zipWalmart: false, rate: { wing: 400 / 15, amazon: 1000 / 16.5, zipline: 1000 * 0.95 / 15 } },
  dfw: { toXY: DR.toXY, zone: 40000, file: 'walmart_dfw_osm.json', stages: DB.STAGES, amz: (S) => DB.AMZ_ORDER.slice(0, S.amazon).map(c => { const a = DR.AMAZON.find(x => x[0] === c); return DR.toXY(a[1], a[2]); }),
    wingStart: () => [DR.toXY(33.150, -96.824), DR.toXY(33.163, -96.938)], zipStart: () => [DR.toXY(32.767, -96.599)], zipWalmart: true, rate: { wing: 400 / 15, amazon: 1000 / 16.5, zipline: 400 / 15 } } };
function plan(metro) { const m = M[metro], inZ = p => Math.abs(p[0]) <= m.zone && Math.abs(p[1]) <= m.zone, pool = stores(m.file).map(s => ({ ...s, c: m.toXY(s.lat, s.lon) })).filter(s => inZ(s.c));
  const d2 = (a, b) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2, near = (net, p) => Math.min(...net.map(q => d2(p, q)));
  const wing = [], zip = [], wNet = m.wingStart().slice(), zNet = m.zipStart ? m.zipStart().slice() : null, full = m.stages.full;
  if (metro === 'hou') { for (const c of wNet) { let k = 0; for (let j = 1; j < pool.length; j++) if (d2(pool[j].c, c) < d2(pool[k].c, c)) k = j; const s = pool.splice(k, 1)[0]; wing.push({ c, real: 'operating', ref: s ? s.ref : null }); } }
  else { for (const start of wNet) { let k = 0; for (let j = 1; j < pool.length; j++) if (d2(pool[j].c, start) < d2(pool[k].c, start)) k = j; wing.push({ c: pool[k].c, real: 'walmart', ref: pool[k].ref }); pool.splice(k, 1); }
         { let k = 0; for (let j = 1; j < pool.length; j++) if (d2(pool[j].c, zNet[0]) < d2(pool[k].c, zNet[0])) k = j; zip.push({ c: pool[k].c, real: 'walmart', ref: pool[k].ref }); pool.splice(k, 1); } }
  const pick = (list) => { if (!pool.length) return false; const net = list.map(x => x.c); let k = 0, best = Infinity; for (let j = 0; j < pool.length; j++) { const v = near(net, pool[j].c); if (v < best) { best = v; k = j; } } list.push({ c: pool[k].c, real: 'walmart', ref: pool[k].ref }); pool.splice(k, 1); return true; };
  while ((wing.length < full.wing || (m.zipWalmart && zip.length < full.zipline)) && pool.length) { if (wing.length < full.wing) pick(wing); if (m.zipWalmart && zip.length < full.zipline && pool.length) pick(zip); }
  return { wing, zip }; }
const PLANS = {};
function sites(cfg, seed, stage, metro) { const m = M[metro], st = m.stages[stage], P = PLANS[metro] || (PLANS[metro] = plan(metro)), r = L.rng(seed + 61613), out = [];
  for (const c of m.amz(st)) out.push({ op: 'amazon', c, real: 'amazon' });
  const rnd = () => [(r() - 0.5) * 2 * m.zone, (r() - 0.5) * 2 * m.zone], extraW = [], extraZ = []; for (let k = 0; k < 80; k++) { extraW.push(rnd()); extraZ.push(rnd()); }
  const wl = P.wing.concat(extraW.map(c => ({ c, real: 'random' }))), zl = (metro === 'hou' ? [{ c: (() => { const cz = HR.toXY(29.97083, -95.69722), rr = 5000 * Math.sqrt(r()), th = 2 * Math.PI * r(); return [cz[0] + rr * Math.cos(th), cz[1] + rr * Math.sin(th)]; })(), real: 'cypress' }] : P.zip).concat(extraZ.map(c => ({ c, real: 'random' })));
  wl.slice(0, st.wing).forEach(w => out.push({ op: 'wing', c: w.c, real: w.real })); zl.slice(0, st.zipline).forEach(z => out.push({ op: 'zipline', c: z.c, real: z.real }));
  for (const s of out) s.rate = m.rate[s.op] * st.vol; return out; }
module.exports = { stores, plan, sites, M };
if (require.main === module) { for (const metro of ['hou', 'dfw']) { const P = plan(metro), cfg = { zone: M[metro].zone };
  console.log(metro, 'Walmarts in zone', stores(M[metro].file).filter(s => { const c = M[metro].toXY(s.lat, s.lon); return Math.abs(c[0]) <= cfg.zone && Math.abs(c[1]) <= cfg.zone; }).length, '| Wing real', P.wing.length, '| Zipline at Walmart', P.zip.length);
  for (const st of Object.keys(M[metro].stages)) { const S = sites(cfg, 1, st, metro), c = (op, k) => S.filter(s => s.op === op && s.real === k).length; console.log('  ', st, 'wing real', S.filter(s => s.op === 'wing' && s.real !== 'random').length, 'random', c('wing', 'random'), '| zipline real', S.filter(s => s.op === 'zipline' && s.real !== 'random').length, 'random', c('zipline', 'random'), '| amazon', c('amazon', 'amazon')); } } }
