'use strict';
const A = require('./deva0.js'), DV = require('./deviate.js'), H2 = require('./houston2.js'), V = require('./valloc.js'), VR = require('./vrate.js');
let pass = 0, fail = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); c ? pass++ : fail++; };
for (const d of [4, 3]) { const r = A.run('F-BASE', d, 19).r; ok(r.cross_wide === 0, `K1 F-BASE d${d} seed 19: cross wide ${r.cross_wide}`); }
{ // K2 fix attempt 1 (DEVA0 deviation log): same flights, and the same cruise time elapsed at the deviation (clock offsets differ because Wing climbs to different heights)
  const cruiseAt = (f, off) => { let e = 0; for (const sg of f.sg) { if (sg[8] !== 'cruise') continue; const st = sg[0] - f.t0; if (off < st + sg[1]) return e + Math.max(0, off - st); e += sg[1]; } return e; };
  let bad = 0; for (const d of [4, 3]) for (const s of [19, 20, 21]) { const S = H2.sites(d, s), fa = V.flights(S, s, V.ARMS.A0), fb = VR.flights(S, s, 'V0'), a = DV.draws(fa, s), b = DV.draws(fb, s); if (a.size !== b.size) bad++;
    for (const [id, o] of b) if (!a.has(id) || cruiseAt(fa[id], a.get(id)) !== cruiseAt(fb[id], o)) { bad++; break; } }
  ok(bad === 0, `K2 same deviating flights and same cruise time elapsed, A0 vs A2 (${bad} mismatching runs)`); }
console.log(`${pass} passed, ${fail} failed`);
