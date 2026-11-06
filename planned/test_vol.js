'use strict';
const VO = require('./vol.js'), F = require('./fair.js'), H2 = require('./houston2.js'), VR = require('./vrate.js'), P = require('./proc.js');
let pass = 0, fail = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); c ? pass++ : fail++; };
{ let dd = 0; for (const d of [4, 3]) for (const s of [4, 5, 6]) { const S = H2.sites(d, s), a = VO.intentCheck(VR.flights(S, s, 'V0'), 30, 5, 10), b = F.intentCheck(F.flights(S, s, false), 'fifo'); for (const [id, D] of b.delays) if (a.delays.get(id) !== D) dd++; if (a.delays.size !== b.delays.size) dd++; }
  ok(dd === 0, `K1 H30 == FAIR F0 delays (d 4, 3; seeds 4-6): ${dd} differ`); }
for (const arm of ['H90', 'T30', 'V20']) { const [C, T, Vs] = VO.ARMS[arm], S = H2.sites(4, 13), ic = VO.intentCheck(VR.flights(S, 13, 'V0'), C, T, Vs), chk = ic.fl.filter(f => f.delay !== undefined), pts = [];
  for (const f of chk) { const s = P.samples(f); for (let i = 0; i < s.length; i += 4) pts.push([f.t0 + s[i], s[i + 1], s[i + 2], s[i + 3], f.op]); }
  pts.sort((a, b) => a[0] - b[0]); let conf = 0, lo = 0; for (let i = 0; i < pts.length; i++) { while (pts[lo][0] < pts[i][0] - T) lo++; for (let j = lo; j < i; j++) { const a = pts[i], b = pts[j]; if (a[4] === b[4]) continue;
      if (Math.abs(Math.floor(a[1] / C) - Math.floor(b[1] / C)) <= 1 && Math.abs(Math.floor(a[2] / C) - Math.floor(b[2] / C)) <= 1 && Math.abs(a[3] - b[3]) < Vs && !(a[3] < 1 && b[3] < 1)) conf++; } }
  ok(conf === 0, `K2 ${arm} brute-force d4 seed 13: ${conf} conflicts among ${chk.length} flights (cancelled ${ic.cancelled})`); }
console.log(`${pass} passed, ${fail} failed`);
