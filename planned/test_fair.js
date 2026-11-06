'use strict';
// FAIR_PREREG.md feature checks K1-K4.
const F = require('./fair.js'), P = require('./proc.js'), H2 = require('./houston2.js'), V = require('./valloc.js');
let pass = 0, fail = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); c ? pass++ : fail++; };
// K1: F0 (seeds 1-3) == PROC P2
{ const diffs = []; for (const d of [4, 3]) for (const s of [1, 2, 3]) { const S = H2.sites(d, s), a = F.intentCheck(F.flights(S, s, false), 'fifo'), b = P.intentCheck(P.flights(S, s, null));
    for (const [id, D] of b.delays) if (a.delays.get(id) !== D) diffs.push(`d${d}s${s} flight ${id}: ${a.delays.get(id)} vs ${D}`);
    if (a.delays.size !== b.delays.size) diffs.push(`d${d}s${s} sizes`); const ca = H2.count(a.fl), cb = H2.count(b.fl); for (const k of Object.keys(cb)) if (k.includes('|') && ca[k] !== cb[k]) diffs.push(`d${d}s${s} ${k}`); }
  ok(diffs.length === 0, 'K1 F0 == PROC P2 delays and counts (d 4, 3; seeds 1-3) ' + diffs.slice(0, 5).join('; ')); }
// K2: F1 Amazon profile
{ const S = H2.sites(3, 4), fl = F.flights(S, 4, true), base = F.flights(S, 4, false); let bad = 0, n = 0;
  for (let i = 0; i < fl.length; i++) { if (fl[i].op !== 'amazon') continue; n++; const sg = fl[i].sg, b = base[i].sg;
    const ch = sg.filter(s => s[4] !== s[7]), chb = b.filter(s => s[4] !== s[7]);
    if (ch.some(s => s[2] !== s[5] || s[3] !== s[6])) bad++;   // height change without lateral motion
    else if (ch.length !== chb.length || ch.some((s, k) => s[4] !== chb[k][4] || s[7] !== chb[k][7] || s[1] !== chb[k][1])) bad++;   // same start/end heights and durations
    else { const cz = sg.filter(s => s[8] === 'cruise').map(s => s[4]), czb = b.filter(s => s[8] === 'cruise').map(s => s[4]); if (cz.join() !== czb.join()) bad++; } }
  ok(bad === 0 && n > 0, `K2 F1 Amazon profile (${n} flights, ${bad} bad)`); }
// K3 + K4
{ const S = H2.sites(4, 4), fl0 = F.flights(S, 4, false), ic = F.intentCheck(fl0, 'amazon');
  const chk = ic.fl.filter(f => f.delay !== undefined), pts = []; for (const f of chk) { const s = P.samples(f); for (let i = 0; i < s.length; i += 4) pts.push([f.t0 + s[i], s[i + 1], s[i + 2], s[i + 3], f.op]); }
  pts.sort((a, b) => a[0] - b[0]); let conf = 0, lo = 0; for (let i = 0; i < pts.length; i++) { while (pts[lo][0] < pts[i][0] - P.TB) lo++; for (let j = lo; j < i; j++) { const a = pts[i], b = pts[j]; if (a[4] === b[4]) continue;
      if (Math.abs(Math.floor(a[1] / P.CELL) - Math.floor(b[1] / P.CELL)) <= 1 && Math.abs(Math.floor(a[2] / P.CELL) - Math.floor(b[2] / P.CELL)) <= 1 && Math.abs(a[3] - b[3]) < P.VSEP && !(a[3] < 1 && b[3] < 1)) conf++; } }
  ok(conf === 0, `K3 F2 brute-force recheck d4 seed 4: ${conf} conflicts among ${chk.length} accepted flights (cancelled ${ic.cancelled})`);
  const chkOrder = (log, firstOf) => { let bad = 0; const byW = new Map(); for (const [id, op, t0] of log) { const w = Math.floor(t0 / F.WIN); if (!byW.has(w)) byW.set(w, []); byW.get(w).push(op); }
    let prevW = -Infinity; for (const [id, op, t0] of log) { const w = Math.floor(t0 / F.WIN); if (w < prevW) bad++; prevW = w; }
    for (const [w, ops] of byW) { const f = firstOf(w); let seenOther = false; for (const o of ops) { if (o !== f) seenOther = true; else if (seenOther) { bad++; break; } } } return bad; };
  const b2 = chkOrder(ic.log, () => 'amazon'), ic3 = F.intentCheck(F.flights(S, 4, false), 'rotate'), b3 = chkOrder(ic3.log, w => F.ROT[((w % 3) + 3) % 3]);
  ok(b2 === 0 && b3 === 0, `K4 processing order: F2 violations ${b2}, F3 violations ${b3}`); }
console.log(`${pass} passed, ${fail} failed`);
