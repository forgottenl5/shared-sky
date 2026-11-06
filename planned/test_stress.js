'use strict';
const ST = require('./stress.js'), F = require('./fair.js'), H2 = require('./houston2.js'), P = require('./proc.js'), VO = require('./vol.js');
let pass = 0, fail = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); c ? pass++ : fail++; };
{ let dd = 0; for (const s of [4, 5, 6]) { const S = H2.sites(4, s), a = ST.run('S0', 4, s).ic, b = F.intentCheck(F.flights(S, s, false), 'fifo'); for (const [id, D] of b.delays) if (a.delays.get(id) !== D) dd++; }
  ok(dd === 0, `K1 S0 == FAIR F0 delays (d 4, seeds 4-6): ${dd} differ`); }
{ const { fl, tag } = ST.build('TFR', 3, 16); let viol = 0, badHeld = 0, nR = 0;
  for (const f of fl) { const t = tag.get(f.id); if (t === 'held') { if (f.t0 !== ST.W1) badHeld++; continue; } if (f.t0orig < ST.W0 || f.t0orig >= ST.W1) continue; if (t === 'rerouted') nR++;
    for (const s of f.sg) { if (s[8] !== 'cruise') continue; for (let q = 0; q < s[1]; q++) { const p = P.posAt(s, s[0] + q); if (Math.hypot(p[0] - ST.C[0], p[1] - ST.C[1]) < ST.RAD - 1) { viol++; break; } } } }
  ok(viol === 0 && badHeld === 0 && nR > 0, `K2 TFR d3 s16: ${viol} window-start flights with cruise inside; held not at 7,200 s: ${badHeld}; rerouted ${nR}`); }
{ const { fl, info } = ST.build('SURGE', 3, 16), base = fl.filter(f => f.id < 1e7 && f.t0 >= ST.W0 && f.t0 < ST.W1).length, ex = fl.filter(f => f.id >= 1e7), outside = ex.filter(f => f.t0 < ST.W0 || f.t0 >= ST.W1).length, r = ex.length / base;
  ok(outside === 0 && r >= 1.7 && r <= 2.3, `K3 SURGE d3 s16: extra ${ex.length} vs base-in-window ${base} (ratio ${r.toFixed(2)}); outside window ${outside}`); }
{ const { ic } = ST.run('BOTH', 4, 16), chk = ic.fl.filter(f => f.delay !== undefined), pts = [];
  for (const f of chk) { const s = P.samples(f); for (let i = 0; i < s.length; i += 4) pts.push([f.t0 + s[i], s[i + 1], s[i + 2], s[i + 3], f.op]); }
  pts.sort((a, b) => a[0] - b[0]); let conf = 0, lo = 0; for (let i = 0; i < pts.length; i++) { while (pts[lo][0] < pts[i][0] - 5) lo++; for (let j = lo; j < i; j++) { const a = pts[i], b = pts[j]; if (a[4] === b[4]) continue;
      if (Math.abs(Math.floor(a[1] / 30) - Math.floor(b[1] / 30)) <= 1 && Math.abs(Math.floor(a[2] / 30) - Math.floor(b[2] / 30)) <= 1 && Math.abs(a[3] - b[3]) < 10 && !(a[3] < 1 && b[3] < 1)) conf++; } }
  ok(conf === 0, `K4 BOTH brute-force d4 s16: ${conf} conflicts among ${chk.length} flights (cancelled ${ic.cancelled})`); }
console.log(`${pass} passed, ${fail} failed`);
