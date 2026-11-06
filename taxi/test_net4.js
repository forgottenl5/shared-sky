'use strict';
// v4 checks for taxi/net4.js (node taxi/test_net4.js). The v2 and v3 checks are also re-run on net4 (see the end of this file).
const N = require('./net4.js'); let fails = 0; const ok = (n, c, i) => { console.log((c ? 'ok  ' : 'FAIL') + ' ' + n + (i !== undefined ? ' ' + JSON.stringify(i) : '')); if (!c) fails++; };
const P = { padZ: 15, vLift: 2.5, slope: 8, vClimb: 31, cruiseZ: 610, vCruise: 67 };
const A = { seats: 4, rangeKm: 2000, reserveKm: 0, routeFactor: 1, vtolKm: 0, chargeKmPerMin: 10 };
// Single-vertiport cell (Vascik & Hansman 2019 setting): V has 1 pad and G stands; Z is a source 20 km away with ample pads and stands.
// n aircraft leave Z together for V; V has many waiting departures to Z. Pad occupancy = approach/departure + taxi (dependent operations).
function cell(G, occ, turn, n) { const sites = [{ id: 'V', xy: [0, 0], pads: 1, stands: G }, { id: 'Z', xy: [20000, 0], pads: 200 }];
  const req = []; for (let k = 0; k < n; k++) req.push(['Z', 'V', 0]); for (let k = 0; k < 200; k++) req.push(['V', 'Z', 0]);
  return N.simulate({ sites, fleet: { Z: n }, aircraft: A, profile: P, ops: { padOccupancy: occ, turnaround: turn, maxWait: 1e9, reposition: false }, demand: [], hours: 3, warm: 0, seed: 1, requests: req, trace: true }); }
function padUse(R, w) { const v = R.sites.find(s => s.id === 'V'), mv = v.mov.slice().sort((a, b) => a - b), t0 = Math.min(...R.trace.filter(r => r[2] === 'V').map(r => r[4]));
  const occ = R.occ; let busy = 0; for (const m of mv) busy += Math.max(0, Math.min(m + occ, t0 + w) - Math.max(m, t0)); return { t0, busy, use: busy / w, mov: mv.map(m => Math.round(m - t0)) }; }
// T1 hand timeline, G = 2, pad 75 s, turnaround 300 s. Rule: a departure books its pad slot when its aircraft lands (for the time it is ready);
// an arrival books when its approach is accepted. So at 450 s the second aircraft's departure (booked at 150 s) goes before the third arrival.
// Slots: arr 0, arr 75, dep 375, dep 450, arr 525 (stand freed at 375), arr 600 (stand freed at 450); next departure 900. Use 450/900 = 50 %.
{ const R = cell(2, 75, 300, 20); R.occ = 75; const u = padUse(R, 900), want = [0, 75, 375, 450, 525, 600];
  ok('T1 G=2 pad slots in the first 900 s match the hand timeline (50 % use)', JSON.stringify(u.mov.filter(m => m < 900)) === JSON.stringify(want) && Math.abs(u.use - 450 / 900) < 1e-9, u.mov.filter(m => m < 900)); }
// T2 stands are never exceeded: aircraft holding a stand at V (landed or landing) never exceed G
{ let worst = 0; for (const G of [1, 2, 3, 5]) { const R = cell(G, 75, 300, 20), tr = R.trace.filter(r => r[2] === 'V'), dep = R.trace.filter(r => r[1] === 'V');
    const ev = []; for (const r of tr) ev.push([r[5], 1]); for (const r of dep) ev.push([r[3], -1]); ev.sort((a, b) => a[0] - b[0] || a[1] - b[1]); let c = 0; for (const [, d] of ev) { c += d; worst = Math.max(worst, c - G); } }
  ok('T2 aircraft on stands at V never exceed the stand count', worst <= 0, worst); }
// T3 unlimited stands: no stand waits, and holding is only pad queueing
{ const R = cell(undefined, 75, 300, 10), v = R.sites.find(s => s.id === 'V'); ok('T3 unlimited stands: every stand wait is 0', v.standWait.every(w => w === 0), v.standWait.length); }
// T4 nothing left holding at the end when stands keep turning over
{ const R = cell(3, 75, 300, 12); ok('T4 every inbound aircraft eventually lands', R.stillHolding === 0, R.stillHolding); }
// v2 and v3 checks re-run on net4 (v3 T5 expects stays-based overflow; with stands enforced only for landings, base fleet above stands is still counted)
for (const f of ['test_net2.js', 'test_net3.js']) { const src = require('fs').readFileSync(__dirname + '/' + f, 'utf8').replace(/\.\/net[23]\.js'\)/, "./net4.js')").replace("require('./net2.js')", "require('./net2.js')");
  const tmp = __dirname + '/.tmp_' + f; require('fs').writeFileSync(tmp, src); const r = require('child_process').spawnSync('node', [tmp], { encoding: 'utf8' }); require('fs').unlinkSync(tmp);
  const bad = (r.stdout.match(/^FAIL.*$/mg) || []); ok('re-run of ' + f + ' on net4', bad.length === 0, bad); }
console.log(fails ? fails + ' FAILED' : 'ALL PASS'); process.exitCode = fails ? 1 : 0;
