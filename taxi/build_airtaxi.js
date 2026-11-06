'use strict';
// Build the 3D air-taxi network page: inline taxi/airtaxi_data.json (from taxi/export_airtaxi.js) into taxi/airtaxi.template.html.
// Usage: node taxi/build_airtaxi.js docs/airtaxi.html
const fs = require('fs'), out = process.argv[2] || 'docs/airtaxi.html';
const tpl = fs.readFileSync(__dirname + '/airtaxi.template.html', 'utf8'), data = fs.readFileSync(__dirname + '/airtaxi_data.json', 'utf8').replace(/<\//g, '<\\/');
const city = JSON.stringify({ grid: JSON.parse(fs.readFileSync(__dirname + '/city_grid.json', 'utf8')), osm: { DFW: JSON.parse(fs.readFileSync(__dirname + '/../city/osm_dallas.json', 'utf8')), HOU: JSON.parse(fs.readFileSync(__dirname + '/../city/osm_houston.json', 'utf8')) } }).replace(/<\//g, '<\\/');
fs.writeFileSync(out, tpl.replace('/*DATA*/', () => data).replace('/*CITY*/', () => city).replace('/*SCORE*/', () => fs.readFileSync(__dirname + '/../common/score.js', 'utf8')).replace('/*MODELS3D*/', () => fs.readFileSync(__dirname + '/../city/models3d.js', 'utf8'))); console.log('bytes', fs.statSync(out).size);
