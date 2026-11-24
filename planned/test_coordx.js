'use strict';
const C = require('./coord.js'), X = require('./coordx.js'); let bad = 0; const ok = (n, c) => { console.log((c ? 'ok  ' : 'FAIL') + ' ' + n); if (!c) bad++; };
const f = { id: 1, op: 'wing', t0: 0, end: 300, sg: [[0, 20, 0, 0, 0, 0, 0, 60, 'c'], [20, 200, 0, 0, 60, 2000, 0, 60, 'r'], [220, 20, 2000, 0, 60, 2000, 0, 7, 'd'], [240, 10, 2000, 0, 7, 2000, 0, 7, 'h']] };
const g = X.moved(f, 10); ok('moved keeps points at or below 20 m', g.sg[0][4] === 0 && g.sg[2][7] === 7 && g.sg[3][4] === 7);
ok('moved shifts cruise points', g.sg[1][4] === 70 && g.sg[1][7] === 70 && g.sg[0][7] === 70 && g.sg[2][4] === 70);
const m = X.moves(f, [46, 91]); ok('moves stay in band, smallest first', m[0] === 0 && m[1] === 5 && m[2] === -5 && m.every(d => 60 + d >= 46 && 60 + d <= 91) && m.includes(30) && !m.includes(35));
ok('fixed band gives no moves', JSON.stringify(X.moves(f, [60, 60])) === '[0]');
ok('VOL.V2 is coord V2', X.VOL.V2 === C.VOL.V2);
process.exit(bad ? 1 : 0);
