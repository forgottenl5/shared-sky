'use strict';
// VRATE_PREREG.md feature checks K1-K3.
const VR = require('./vrate.js'), F = require('./fair.js'), H2 = require('./houston2.js'), P = require('./proc.js');
let pass = 0, fail = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); c ? pass++ : fail++; };
{ const diffs = []; for (const [arm, inPlace] of [['V0', false], ['V1', true]]) for (const d of [4, 3]) for (const s of [4, 5, 6]) { const S = H2.sites(d, s), a = F.intentCheck(VR.flights(S, s, arm), 'fifo'), b = F.intentCheck(F.flights(S, s, inPlace), 'fifo');
    if (a.delays.size !== b.delays.size) diffs.push(`${arm} d${d}s${s} size`); for (const [id, D] of b.delays) if (a.delays.get(id) !== D) { diffs.push(`${arm} d${d}s${s} ${id}`); break; }
    const ca = H2.count(a.fl), cb = H2.count(b.fl); for (const k of Object.keys(cb)) if (k.includes('|') && ca[k] !== cb[k]) { diffs.push(`${arm} d${d}s${s} ${k}`); break; } }
  ok(diffs.length === 0, 'K1 V0/V1 == FAIR F0/F1 (d 4, 3; seeds 4-6) ' + diffs.slice(0, 5).join('; ')); }
{ const S = H2.sites(3, 7), fl = VR.flights(S, 7, 'V2'), base = VR.flights(S, 7, 'V0'); let bad = 0, n = 0, other = 0;
  const changes = sg => sg.filter(s => s[4] !== s[7]).map(s => [s[4], s[7]]);
  for (let i = 0; i < fl.length; i++) { const sg = fl[i].sg, b = base[i].sg;
    if (fl[i].op !== 'amazon') { if (JSON.stringify(sg) !== JSON.stringify(b)) other++; continue; } n++;
    const ch = sg.filter(s => s[4] !== s[7]);
    if (ch.some(s => s[2] !== s[5] || s[3] !== s[6] || s[1] !== Math.max(1, Math.round(Math.abs(s[7] - s[4]) / VR.VFAST)))) { bad++; continue; }
    const cb = changes(b), cf = changes(sg); // filed heights: in V0, ramps and verticals give the same height sequence
    if (JSON.stringify(cf) !== JSON.stringify(cb)) { bad++; continue; }
    if (sg.filter(s => s[8] === 'cruise').map(s => s[4]).join() !== b.filter(s => s[8] === 'cruise').map(s => s[4]).join()) bad++; }
  ok(bad === 0 && other === 0 && n > 0, `K2 V2 Amazon profile (${n} flights, ${bad} bad; non-Amazon flights changed: ${other})`); }
{ const S = H2.sites(4, 7), ic = F.intentCheck(VR.flights(S, 7, 'V2'), 'fifo'), chk = ic.fl.filter(f => f.delay !== undefined), pts = [];
  for (const f of chk) { const s = P.samples(f); for (let i = 0; i < s.length; i += 4) pts.push([f.t0 + s[i], s[i + 1], s[i + 2], s[i + 3], f.op]); }
  pts.sort((a, b) => a[0] - b[0]); let conf = 0, lo = 0; for (let i = 0; i < pts.length; i++) { while (pts[lo][0] < pts[i][0] - P.TB) lo++; for (let j = lo; j < i; j++) { const a = pts[i], b = pts[j]; if (a[4] === b[4]) continue;
      if (Math.abs(Math.floor(a[1] / P.CELL) - Math.floor(b[1] / P.CELL)) <= 1 && Math.abs(Math.floor(a[2] / P.CELL) - Math.floor(b[2] / P.CELL)) <= 1 && Math.abs(a[3] - b[3]) < P.VSEP && !(a[3] < 1 && b[3] < 1)) conf++; } }
  ok(conf === 0, `K3 V2 brute-force recheck d4 seed 7: ${conf} conflicts among ${chk.length} flights (cancelled ${ic.cancelled})`); }
console.log(`${pass} passed, ${fail} failed`);
