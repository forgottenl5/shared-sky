'use strict';
const DV = require('./deviate.js'), H2 = require('./houston2.js'), VR = require('./vrate.js'), P = require('./proc.js'), VO = require('./vol.js');
let pass = 0, fail = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); c ? pass++ : fail++; };
for (const d of [4, 3]) { const r = DV.run('BASE', d, 19).r; ok(r.cross_wide === 0, `K1 BASE d${d} seed 19: cross-operator wide meetings ${r.cross_wide}`); }
{ const S = H2.sites(3, 19), fl = VR.flights(S, 19, 'V0'), dev = DV.draws(fl, 19), ic = VO.intentCheck(fl, 30, 5, 10), acc = new Map(ic.fl.map(f => [f.id, f])); let bad = 0, n = 0;
  for (const [id, off] of dev) { const f = acc.get(id); if (!f) continue; n++; const base = DV.expand(f), td = f.t0 + off;
    const h = DV.expand(DV.deviated(f, off, 'HOLD')), l = DV.expand(DV.deviated(f, off, 'LAND')), k = base.findIndex(p => p[0] === td), pd = base[k], same = (a, b) => a[0] === b[0] && Math.abs(a[1] - b[1]) < 1e-9 && Math.abs(a[2] - b[2]) < 1e-9 && Math.abs(a[3] - b[3]) < 1e-9;
    for (let i = 0; i < k; i++) if (!same(h[i], base[i]) || !same(l[i], base[i])) { bad++; break; }
    for (let i = 0; i < DV.HOLD_S; i++) { const p = h[k + i]; if (p[0] !== td + i || p[1] !== pd[1] || p[2] !== pd[2] || p[3] !== pd[3]) { bad++; break; } }
    for (let i = k; i < base.length; i++) { const p = h[i + DV.HOLD_S]; if (!p || p[0] !== base[i][0] + DV.HOLD_S || Math.abs(p[1] - base[i][1]) > 1e-9 || Math.abs(p[3] - base[i][3]) > 1e-9) { bad++; break; } }
    for (let i = k; i < l.length; i++) { const p = l[i], zExp = Math.max(0, pd[3] - DV.LAND_V * (i - k)); if (p[1] !== pd[1] || p[2] !== pd[2] || Math.abs(p[3] - zExp) > 1e-9) { bad++; break; } } if (l[l.length - 1][3] !== 0) bad++; }
  ok(bad === 0 && n > 0, `K2 deviated tracks (${n} deviations, ${bad} bad)`); }
{ const S = H2.sites(4, 19), fl = VR.flights(S, 19, 'V0'), dev = DV.draws(fl, 19), a = DV.intentCheckShared(fl, dev, 'LAND', true), b = VO.intentCheck(fl, 30, 5, 10); let dd = 0; for (const [id, D] of b.delays) if (a.delays.get(id) !== D) dd++;
  ok(dd === 0, `K3 shared check with invisible deviations == normal check (${dd} differ)`);
  const sh = DV.intentCheckShared(fl, dev, 'LAND', false), fin = DV.finalTracks(fl, sh.delays, dev, 'LAND'), byId = new Map(fin.map(f => [f.id, f])), devPts = [];
  for (const [id, dv] of sh.devTracks) { const s = P.samples(dv); for (let i = 0; i < s.length; i += 4) if (dv.t0 + s[i] >= dv.td) devPts.push([dv.t0 + s[i], s[i + 1], s[i + 2], s[i + 3], dv.op, dv.td]); }
  let conf = 0; const later = fin.filter(f => sh.delays.has(f.id) && !sh.devTracks.has(f.id));
  const G = new Map(); for (const p of devPts) { const k = Math.floor(p[0] / 10); (G.get(k) || G.set(k, []).get(k)).push(p); }
  for (const f of later) { const s = P.samples(f); for (let i = 0; i < s.length; i += 4) { const t = f.t0 + s[i]; for (let b = Math.floor((t - 5) / 10); b <= Math.floor((t + 5) / 10); b++) for (const p of G.get(b) || []) {
      if (p[4] === f.op || f.t0 < p[5] || Math.abs(p[0] - t) > 5) continue; if (Math.abs(Math.floor(p[1] / 30) - Math.floor(s[i + 1] / 30)) <= 1 && Math.abs(Math.floor(p[2] / 30) - Math.floor(s[i + 2] / 30)) <= 1 && Math.abs(p[3] - s[i + 3]) < 10 && !(p[3] < 1 && s[i + 3] < 1)) conf++; } } }
  ok(conf === 0, `K4 S-LAND d4 seed 19: flights launched after a deviation conflicting with it: ${conf} (deviations ${sh.devTracks.size})`); }
console.log(`${pass} passed, ${fail} failed`);
