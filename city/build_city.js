'use strict';
// Build the Shared Sky Houston city page: inline the export from planned/export_city.js into the template.
const fs = require('fs'), [,, dataPath, outPath, osmPath] = process.argv;
const tpl = fs.readFileSync(__dirname + '/city.template.html', 'utf8'), data = fs.readFileSync(dataPath, 'utf8').replace(/<\//g, '<\\/');
const osm = fs.readFileSync(osmPath || (__dirname + '/osm_houston.json'), 'utf8').replace(/<\//g, '<\\/');
// Optional env: GROW (build-out data file), TEXT (comma-separated JSON files, each a list of [houstonText, replacement] pairs; each must be found).
let page = tpl;
if (process.env.TEXT) for (const f of process.env.TEXT.split(',')) for (const [a, b] of JSON.parse(fs.readFileSync(f, 'utf8'))) { if (!page.includes(a)) throw new Error('text not found: ' + a.slice(0, 80)); page = page.split(a).join(b); }
const grow = fs.readFileSync(process.env.GROW || (__dirname + '/buildout_data.json'), 'utf8');
fs.writeFileSync(outPath, page.replace('/*DATA*/', () => data).replace('/*OSM*/', () => osm).replace('/*GROW*/', () => grow).replace('/*SCORE*/', () => fs.readFileSync(__dirname + '/../common/score.js', 'utf8')).replace('/*MODELS3D*/', () => fs.readFileSync(__dirname + '/models3d.js', 'utf8'))); console.log('bytes', fs.statSync(outPath).size);
