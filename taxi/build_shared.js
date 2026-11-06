'use strict';
// Build docs/shared.html from taxi/shared.template.html and taxi/shared_data.json (made by taxi/export_shared.js).
const fs = require('fs'), path = require('path');
const data = fs.readFileSync(path.join(__dirname, 'shared_data.json'), 'utf8'); if (data.includes('</script')) throw new Error('data contains a closing script tag');
const html = fs.readFileSync(path.join(__dirname, 'shared.template.html'), 'utf8').replace('/*DATA*/', () => data);
const out = process.argv[2] || path.join(__dirname, '..', 'docs', 'shared.html'); fs.writeFileSync(out, html); console.log('wrote', out, fs.statSync(out).size, 'bytes');
