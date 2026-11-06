'use strict';
const CF = require('./countfix.js'), H2 = require('./houston2.js'), VR = require('./vrate.js'), VO = require('./vol.js'), DV = require('./deviate.js'), P = require('./proc.js');
const S = H2.sites(3, 19), fl = VR.flights(S, 19, 'V0'), { delays } = VO.intentCheck(fl, 30, 5, 10), acc = DV.finalTracks(fl, delays, new Map(), null), byId = new Map(acc.map(f => [f.id, f])), dev = CF.drawsInZone(acc, 19); let bad = 0;
for (const [id, off] of dev) { const f = byId.get(id), t = f.t0 + off, s = f.sg.find(x => t >= x[0] && t < x[0] + x[1]), p = P.posAt(s, t); if (s[8] !== 'cruise' || t < 3600 || Math.abs(p[0]) > 6000 || Math.abs(p[1]) > 6000) bad++; }
console.log((bad === 0 ? 'PASS' : 'FAIL') + ` K3 in-zone draws d3 seed 19: ${dev.size} deviations, ${bad} outside zone/window or not in cruise`);
