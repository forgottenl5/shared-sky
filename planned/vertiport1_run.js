'use strict';
// Runner for planned/VERTIPORT1_PREREG.md.  node planned/vertiport1_run.js checks | run   -> out/vertiport1.jsonl
const fs = require('fs'), N = require('../taxi/net4.js');
const P = { padZ: 15, vLift: 2.5, slope: 8, vClimb: 31, cruiseZ: 610, vCruise: 67 }, A = { seats: 4, rangeKm: 2000, reserveKm: 0, routeFactor: 1, vtolKm: 0, chargeKmPerMin: 10 };
const W = 900, NAC = 60;   // 60 (was 40): deviation 1 in the prereg
function cell(G, occ, turn) { const sites = [{ id: 'V', xy: [0, 0], pads: 1, stands: G }, { id: 'Z', xy: [20000, 0], pads: 200 }], req = [];
  for (let k = 0; k < NAC; k++) req.push(['Z', 'V', 0]); for (let k = 0; k < 200; k++) req.push(['V', 'Z', 0]);
  const R = N.simulate({ sites, fleet: { Z: NAC }, aircraft: A, profile: P, ops: { padOccupancy: occ, turnaround: turn, maxWait: 1e9, reposition: false }, demand: [], hours: 3, warm: 0, seed: 1, requests: req, trace: true });
  const inb = R.trace.filter(r => r[2] === 'V'), t0 = Math.min(...inb.map(r => r[4])), mv = R.sites.find(s => s.id === 'V').mov;
  let busy = 0, ops = 0; for (const m of mv) { busy += Math.max(0, Math.min(m + occ, t0 + W) - Math.max(m, t0)); if (m >= t0 && m + occ <= t0 + W) ops++; }
  const waiting = inb.filter(r => r[5] >= t0 + W).length;   // approaches not yet landed at the end of the window
  return { G, occ, turn, use: busy / W, ops, arr: inb.filter(r => r[5] >= t0 && r[5] + occ <= t0 + W).length, waitingAtEnd: waiting }; }
const J = []; for (const G of [1, 2, 3, 4, 5, 6, 7, 8]) { J.push(['fig14', G, 75, 300]); J.push(['fig15', G, 45, 300]); }
for (const G of [1, 2, 4, 6, 8]) for (const T of [30, 60, 90, 120, 180, 240, 300, 450, 600]) J.push(['fig17', G, 45, T]);
if (process.argv[2] === 'checks') { const r = require('child_process').spawnSync('node', ['taxi/test_net4.js'], { encoding: 'utf8' }); const k1 = /ALL PASS/.test(r.stdout);
  let minW = Infinity; for (const [, G, o, T] of J) minW = Math.min(minW, cell(G, o, T).waitingAtEnd);
  console.log('K1', k1 ? 'PASS' : 'FAIL', '| K2 min aircraft still waiting at 900 s:', minW, minW >= 30 ? 'PASS' : 'FAIL', '| jobs', J.length); }
else if (process.argv[2] === 'run') { fs.mkdirSync('out', { recursive: true }); fs.writeFileSync('out/vertiport1.jsonl', J.map(([fig, G, o, T]) => JSON.stringify(Object.assign({ fig }, cell(G, o, T)))).join('\n') + '\n'); console.log('wrote', J.length); }
