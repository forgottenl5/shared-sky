'use strict';
// Regression test for every city data file (cities/*.json). node tests/test_cities.js
// For each city: the file loads; every fixed site lies inside the counted square; sites are deterministic per seed; the wind file exists and has
// 8760 hourly rows; a short planned-conflict count runs. For Houston and DFW the layouts must also equal the frozen originals (lab/city.js check covers
// flights too; this test is the quick version).
const fs = require('fs'), path = require('path'), L = require('../lab/lab_engine.js'), CITY = require('../lab/city.js');
let bad = 0, n = 0; const ok = (name, c, info) => { n++; console.log((c ? 'ok   ' : 'FAIL ') + name + (info !== undefined ? ' ' + JSON.stringify(info) : '')); if (!c) bad++; };
const REF = { houston: './../lab/reference/houreal_2026-10-23.js', dfw: './../lab/reference/dfwreal_2026-10-23.js' };
for (const f of fs.readdirSync(path.join(__dirname, '..', 'cities')).filter(f => f.endsWith('.json')).sort()) {
  const name = f.replace(/\.json$/, ''); let c; try { c = CITY.load(name); } catch (e) { ok(`${name}: loads`, false, e.message); continue; }
  ok(`${name}: loads`, true);
  const out = c.AMAZON.map(a => [a[0], c.toXY(a[1], a[2])]).filter(([, p]) => Math.abs(p[0]) > c.cfg.zone || Math.abs(p[1]) > c.cfg.zone);
  ok(`${name}: every fixed site inside the counted square (+-${c.cfg.zone} m)`, out.length === 0, out.map(x => x[0]));
  const a = JSON.stringify(c.sites(c.cfg, 7)), b = JSON.stringify(c.sites(c.cfg, 7)), d = JSON.stringify(c.sites(c.cfg, 8));
  ok(`${name}: sites deterministic per seed and differ between seeds`, a === b && a !== d);
  const wf = path.join(__dirname, '..', c.wind); let rows = 0; try { rows = JSON.parse(fs.readFileSync(wf, 'utf8')).hourly.time.length; } catch (e) {}
  ok(`${name}: wind file ${c.wind} has 8760 hourly rows`, rows === 8760, rows);
  const cfg = Object.assign({}, c.cfg, { meas: 600 }), fl = L.flights(cfg, c.sites(cfg, 1), 1, { wing: [46, 71], aOut: 81, zip: 101, aIn: 115 });
  const r = L.count(cfg, fl, { sub: 4, tEnd: cfg.warm + cfg.meas, th: [['v10', 30, 10]] });
  ok(`${name}: a 10-minute planned-conflict count runs`, fl.length > 0 && Number.isInteger(r['v10|cross'] || 0), [fl.length, r['v10|cross'] || 0]);
  if (REF[name]) { const o = require(REF[name]); let same = true; for (let s = 1; s <= 5; s++) { const x = o.sites(c.cfg, s), y = c.sites(c.cfg, s); same = same && x.length === y.length && x.every((q, i) => q.op === y[i].op && q.c[0] === y[i].c[0] && q.c[1] === y[i].c[1]); }
    ok(`${name}: layout equals the frozen original (seeds 1-5)`, same); } }
console.log(`${n - bad} of ${n} passed`); process.exit(bad ? 1 : 0);
