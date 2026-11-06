'use strict';
// COUNTFIX re-runs. usage: node planned/countfix.js JOB ARM D SEED SUB
//  JOB valloc: ARM A0|A2 (no plan check)          JOB proc: ARM P2 (A2 + plan check)
//  JOB dev: ARM HOLD-A2|HOLD-A0 (in-zone draws, 20 %)   JOB rth: ARM RTH-OWN|RTH-120 (A2, in-zone draws, 20 %)
const fs = require('fs'), path = require('path'), H2 = require('./houston2.js'), V = require('./valloc.js'), VR = require('./vrate.js'), VO = require('./vol.js'), DV = require('./deviate.js'), RT = require('./rth.js'), P = require('./proc.js');
const FRAC = 0.2, ZONE = 6000, WARM = 3600;
function rng(seed) { let s = (seed * 2654435761) >>> 0; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; }
// in-zone draws on ACCEPTED tracks: offset (from accepted launch) uniform over cruise seconds that are inside the zone and after warm-up
function drawsInZone(acc, seed) { const r = rng(seed + 80000), out = new Map();
  for (const f of [...acc].sort((a, b) => a.id - b.id)) { if (!P.reachesZone(f, 30)) continue; const u = r(), u2 = r(); if (u >= FRAC) continue; const ok = [];
    for (const s of f.sg) { if (s[8] !== 'cruise') continue; for (let q = 0; q < s[1]; q++) { const t = s[0] + q; if (t < WARM) continue; const p = P.posAt(s, t); if (Math.abs(p[0]) <= ZONE && Math.abs(p[1]) <= ZONE) ok.push(t - f.t0); } }
    if (ok.length) out.set(f.id, ok[Math.floor(u2 * ok.length)]); }
  return out; }
function run(job, arm, d, seed, sub) { const S = H2.sites(d, seed); let fin, events = 0;
  if (job === 'valloc') fin = V.flights(S, seed, V.ARMS[arm]);
  else { const fl = (job === 'dev' && arm === 'HOLD-A0') ? V.flights(S, seed, V.ARMS.A0) : VR.flights(S, seed, 'V0'), { delays } = VO.intentCheck(fl, 30, 5, 10), acc = DV.finalTracks(fl, delays, new Map(), null);
    if (job === 'proc') fin = acc;
    else { const dev = drawsInZone(acc, seed); events = dev.size; fin = acc.map(f => !dev.has(f.id) ? f : job === 'dev' ? DV.deviated(f, dev.get(f.id), 'HOLD') : RT.rth(f, dev.get(f.id), arm === 'RTH-120' ? 120 : null)); } }
  const c = H2.count(fin, { sub }); return { job, arm, d, seed, sub, events, cross_wide: c['wide|cross'] || 0, cross_close: c['close|cross'] || 0, same_wide: c['wide|same'] || 0, same_close: c['close|same'] || 0 }; }
module.exports = { run, drawsInZone, FRAC };
if (require.main === module) { const [job, arm, d, seed, sub] = process.argv.slice(2), t0 = Date.now(), r = run(job, arm, +d, +seed, +sub); r.wall_s = (Date.now() - t0) / 1000; const od = path.join(__dirname, '..', 'out', 'countfix'); fs.mkdirSync(od, { recursive: true });
  fs.writeFileSync(path.join(od, `${job}_${arm}_d${d}_${seed}.json`), JSON.stringify(r)); console.log(JSON.stringify(r)); }
