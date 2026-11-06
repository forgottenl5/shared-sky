'use strict';
// City loader (4 Nov 2026): a city is a data file in cities/<name>.json, not code. Reproduces planned/houreal.js and planned/dfwreal.js exactly
// (same random stream, same site order; check: node lab/city.js check).
//   fixed.sites: [code, lat, lon, note] placed at their coordinates; random: [{op, n, rate?}] placed uniformly in the counted square.
//   rate: {perDay, hours} -> flights per site per hour; rateKey: true writes rate: undefined (as dfwreal.js did; no effect on flights).
const fs = require('fs'), path = require('path'), L = require('./lab_engine.js');
function load(name) { const file = name.endsWith('.json') ? name : path.join(__dirname, '..', 'cities', name + '.json'), C = JSON.parse(fs.readFileSync(file, 'utf8'));
  const F = C.fixed.sites, lat0 = (Math.min(...F.map(s => s[1])) + Math.max(...F.map(s => s[1]))) / 2, lon0 = (Math.min(...F.map(s => s[2])) + Math.max(...F.map(s => s[2]))) / 2;
  const toXY = (lat, lon) => [(lon - lon0) * 111320 * Math.cos(lat0 * Math.PI / 180), (lat - lat0) * 110540];
  const R = C.random.map(x => Object.assign({}, x, { rateV: x.rate ? x.rate.perDay / x.rate.hours : undefined }));
  function sites(cfg, seed) { const r = L.rng(seed + C.rngOffset), out = [];
    for (const a of F) out.push({ op: C.fixed.op, c: toXY(a[1], a[2]), code: a[0] });
    for (const x of R) for (let k = 0; k < x.n; k++) { const s = { op: x.op, c: [(r() - 0.5) * 2 * cfg.zone, (r() - 0.5) * 2 * cfg.zone] }; if (x.rate || x.rateKey || R.some(y => y.rate)) s.rate = x.rateV; out.push(s); }
    return out; }
  return { name: C.name, label: C.label, cfg: Object.assign({}, C.cfg), wind: C.wind, AMAZON: F, lat0, lon0, toXY, sites, data: C }; }
module.exports = { load };
if (require.main === module && process.argv[2] === 'check') {   // old modules vs data files: sites and flights for seeds 1-30, three height layouts
  const old = { houston: require('./reference/houreal_2026-10-23.js'), dfw: require('./reference/dfwreal_2026-10-23.js') }, wrap = { houston: require('../planned/houreal.js'), dfw: require('../planned/dfwreal.js') }; let bad = 0, n = 0;
  const H = [{ wing: [46, 91], aOut: 61, zip: 101, aIn: 105 }, { wing: [46, 91], aOut: 69, zip: 101, aIn: [85, 115] }, { wing: [46, 71], aOut: 81, zip: 101, aIn: 115 }];
  for (const m of ['houston', 'dfw']) { const c = load(m);
    for (let seed = 1; seed <= 30; seed++) { const a = old[m].sites(c.cfg, seed), b = c.sites(c.cfg, seed), w = wrap[m].sites(c.cfg, seed);
      const same = (x, y) => x.length === y.length && x.every((s, i) => s.op === y[i].op && s.c[0] === y[i].c[0] && s.c[1] === y[i].c[1] && s.code === y[i].code && s.rate === y[i].rate && ('rate' in s) === ('rate' in y[i]));
      n++; if (!same(a, b) || !same(a, w)) { bad++; console.log('sites differ', m, seed); }
      if (seed <= 5) for (const h of H) { n++; if (JSON.stringify(L.flights(c.cfg, a, seed, h)) !== JSON.stringify(L.flights(c.cfg, b, seed, h))) { bad++; console.log('flights differ', m, seed); } } } }
  console.log(`${n - bad} of ${n} identical`); process.exit(bad ? 1 : 0); }
