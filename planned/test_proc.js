'use strict';
// PROC_PREREG.md feature checks K1-K4.
const P = require('./proc.js'), V = require('./valloc.js'), H2 = require('./houston2.js');
let pass = 0, fail = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); c ? pass++ : fail++; };
// K1: P0 equals VALLOC A2
{ let same = true; const diffs = []; for (const d of [4, 3]) for (const s of [1, 2, 3]) { const a = P.run('P0', d, s).r, b = V.run('A2', d, s).r; for (const k of Object.keys(b)) if (k.includes('|') && a[k] !== b[k]) { same = false; diffs.push(`d${d}s${s} ${k} ${a[k]} vs ${b[k]}`); } for (const k of Object.keys(a)) if (k.includes('|') && !(k in b)) { same = false; diffs.push(k); } }
  ok(same, 'K1 P0 == VALLOC A2 (d 4, 3; seeds 1-3) ' + diffs.slice(0, 5).join('; ')); }
// K2: P1 keep-out
for (const d of [4, 2]) { const S = H2.sites(d, 1), st = { depthHits: 0, unclear: 0 }, R = P.makeRouter(S, st), fl = P.flights(S, 1, R); let viol = 0, checked = 0;
  for (const f of fl.slice(0, 20000)) { // legs: consecutive cruise pieces; original ends = first/last points of each run of cruise segments
    let i = 0; while (i < f.sg.length) { if (f.sg[i][8] !== 'cruise') { i++; continue; } let j = i; while (j + 1 < f.sg.length && f.sg[j + 1][8] === 'cruise') j++;
      const a = [f.sg[i][2], f.sg[i][3]], b = [f.sg[j][5], f.sg[j][6]], foreign = S.filter(s => s.op !== f.op && Math.hypot(a[0] - s.c[0], a[1] - s.c[1]) >= P.KEEP_R && Math.hypot(b[0] - s.c[0], b[1] - s.c[1]) >= P.KEEP_R);
      const G = new Map(); for (const s of foreign) { const k = Math.floor(s.c[0] / 600) + ',' + Math.floor(s.c[1] / 600); (G.get(k) || G.set(k, []).get(k)).push(s); }
      for (let k = i; k <= j; k++) { const sg = f.sg[k]; for (let q = 0; q < sg[1]; q++) { const p = P.posAt(sg, sg[0] + q), gx = Math.floor(p[0] / 600), gy = Math.floor(p[1] / 600); checked++; let hit = false;
        for (let ox = -1; ox <= 1 && !hit; ox++) for (let oy = -1; oy <= 1 && !hit; oy++) for (const s of G.get((gx + ox) + ',' + (gy + oy)) || []) if (Math.hypot(p[0] - s.c[0], p[1] - s.c[1]) < P.KEEP_R) { hit = true; break; }
        if (hit) viol++; } }
      i = j + 1; } }
  ok(viol === 0, `K2 d${d}: ${viol} cruise samples inside a foreign 300 m circle out of ${checked} (depth-cap hits ${st.depthHits}, uncleared waypoints ${st.unclear})`); }
// K3 + K4: P2
{ const S = H2.sites(4, 1), base = P.flights(S, 1, null), ic = P.intentCheck(P.flights(S, 1, null)); const byId = new Map(base.map(f => [f.id, f]));
  let shapeOk = true, delayOk = true; for (const f of ic.fl) { const b = byId.get(f.id), D = f.t0 - b.t0; if (D < 0 || D % 30) delayOk = false; if (f.sg.length !== b.sg.length || f.sg.some((s, i) => s[0] !== b.sg[i][0] + D || s.slice(1).some((v, j) => v !== b.sg[i][j + 1]))) shapeOk = false; }
  ok(shapeOk && delayOk, `K4 tracks identical up to the delay; delays >= 0 and multiples of 30 s (shape ${shapeOk}, delays ${delayOk})`);
  // brute force: all accepted checked flights, all sample pairs from different operators
  const chk = ic.fl.filter(f => f.delay !== undefined), pts = []; for (const f of chk) { const s = P.samples(f), o = f.op; for (let i = 0; i < s.length; i += 4) pts.push([f.t0 + s[i], s[i + 1], s[i + 2], s[i + 3], o, f.id]); }
  pts.sort((a, b) => a[0] - b[0]); let conf = 0, lo = 0; for (let i = 0; i < pts.length; i++) { while (pts[lo][0] < pts[i][0] - P.TB) lo++; for (let j = lo; j < i; j++) { const a = pts[i], b = pts[j]; if (a[4] === b[4]) continue;
      if (Math.abs(Math.floor(a[1] / P.CELL) - Math.floor(b[1] / P.CELL)) <= 1 && Math.abs(Math.floor(a[2] / P.CELL) - Math.floor(b[2] / P.CELL)) <= 1 && Math.abs(a[3] - b[3]) < P.VSEP && !(a[3] < 1 && b[3] < 1)) conf++; } }
  ok(conf === 0, `K3 brute-force recheck d4 seed 1: ${conf} cross-operator conflicts among ${chk.length} accepted flights (${pts.length} samples; cancelled ${ic.cancelled})`); }
console.log(`${pass} passed, ${fail} failed`);
