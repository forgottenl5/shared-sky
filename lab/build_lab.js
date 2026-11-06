'use strict';
// Build the Shared Sky Lab page: inline the engine, two example runs computed with the same engine and settings, and the study record.
const fs = require('fs'), path = require('path'), L = require('./lab_engine.js');
const CFG = { half: 12000, zone: 5000, warm: 1800, meas: 3600 };
const base = { d: 3, seed: 1, wingFixed: null, fleet: 'filed', check: false, cell: 30, tb: 5, vsep: 10, contingency: 'none', frac: 0.2, outages: 6, sub: 4 };
const ex = ['filed', 'allocation'].map(h => { const p = Object.assign({}, base, { heights: h }), r = L.run(CFG, p); delete r.fin; r.events = []; r.ms = 0; return { p, r }; });
console.log('examples', ex.map(e => `${e.p.heights}: ${e.r.cross_wide}/${e.r.cross_close}`).join(', '));
const engine = fs.readFileSync(path.join(__dirname, 'lab_engine.js'), 'utf8'), studies = fs.readFileSync(path.join(__dirname, 'studies.json'), 'utf8');
for (const [n, s] of [['engine', engine], ['studies', studies]]) if (s.includes('</script')) throw new Error(n + ' contains a closing script tag');
const html = fs.readFileSync(path.join(__dirname, 'lab.template.html'), 'utf8').replace('__ENGINE__', () => engine).replace('__SEEDRUNS__', () => JSON.stringify(ex)).replace('__STUDIES__', () => studies);
const out = process.argv[2] || path.join(__dirname, 'shared-sky-lab.html'); fs.writeFileSync(out, html); { const q = v => '"' + String(v).replace(/"/g, '""') + '"', st = JSON.parse(studies), rows = ['study,question,result,predictions_passed,predictions_total'].concat(st.map(x => [q(x.name), q(x.q), q(x.r), x.pass, x.n].join(','))); fs.writeFileSync(path.join(path.dirname(out), 'studies.csv'), rows.join('\n') + '\n'); }
console.log('wrote', out, fs.statSync(out).size, 'bytes');
