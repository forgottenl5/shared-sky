'use strict';
// RTH_PREREG.md: RTH-OWN, RTH-120 (A2) on DEVIATE's draws; OUT-A2 / OUT-A0 area outage at t = 5,400 s (r = 2 km, 120 s hover). Plan check 30 m / ±5 s / 10 m, not shared.
const fs = require('fs'), path = require('path'), H2 = require('./houston2.js'), V = require('./valloc.js'), VR = require('./vrate.js'), VO = require('./vol.js'), DV = require('./deviate.js');
const VZ = 3, SPD = { wing: 26.4, zipline: 31.3, amazon: 30 }, T_OUT = 5400, R_OUT = 2000, HOLD = 120;
const toFlight = (f, smp) => ({ id: f.id, op: f.op, t0: f.t0, sg: smp.map(p => [p[0], 1, p[1], p[2], p[3], p[1], p[2], p[3], p[4], 'dev']), end: smp[smp.length - 1][0] + 1 });
function rth(f, off, H) { const smp = DV.expand(f), td = f.t0 + off, k = smp.findIndex(p => p[0] === td), out = smp.slice(0, k), p = smp[k], pad = [f.sg[0][2], f.sg[0][3]]; let t = td, z = p[3];
  const tgt = H === null ? z : H; while (Math.abs(z - tgt) > 1e-9) { out.push([t++, p[1], p[2], z, 'vertical']); z = Math.abs(tgt - z) <= VZ ? tgt : z + Math.sign(tgt - z) * VZ; }
  const L = Math.hypot(pad[0] - p[1], pad[1] - p[2]), n = Math.max(1, Math.round(L / SPD[f.op])); out.push([t++, p[1], p[2], z, 'cruise']);
  for (let i = 1; i <= n; i++) out.push([t++, p[1] + (pad[0] - p[1]) * i / n, p[2] + (pad[1] - p[2]) * i / n, z, 'cruise']);
  for (z = z - VZ; z > 0; z -= VZ) out.push([t++, pad[0], pad[1], z, 'vertical']); out.push([t, pad[0], pad[1], 0, 'vertical']); return toFlight(f, out); }
function outage(f) { const smp = DV.expand(f), k = smp.findIndex(p => p[0] === T_OUT); if (k < 0) return f; const p = smp[k]; if (p[3] <= 0.5 || Math.hypot(p[1], p[2]) > R_OUT) return f;
  const out = smp.slice(0, k); for (let i = 0; i < HOLD; i++) out.push([T_OUT + i, p[1], p[2], p[3], 'hover']); for (const q of smp.slice(k)) out.push([q[0] + HOLD, q[1], q[2], q[3], q[4]]); const g = toFlight(f, out); g.held = true; return g; }
function run(arm, d, seed) { const S = H2.sites(d, seed), a0 = arm === 'OUT-A0', fl = a0 ? V.flights(S, seed, V.ARMS.A0) : VR.flights(S, seed, 'V0'), dev = DV.draws(fl, seed), { delays } = VO.intentCheck(fl, 30, 5, 10);
  const acc = DV.finalTracks(fl, delays, dev, null), byId = new Map(acc.map(f => [f.id, f])); let fin, events = 0;
  if (arm.startsWith('RTH')) { const H = arm === 'RTH-120' ? 120 : null; fin = acc.map(f => dev.has(f.id) && delays.has(f.id) && delays.get(f.id) !== null ? (events++, rth(f, dev.get(f.id), H)) : f); }
  else { fin = acc.map(f => { const g = outage(f); if (g.held) events++; return g; }); }
  const c = H2.count(fin); return { r: { arm, d, seed, events, cross_wide: c['wide|cross'] || 0, cross_close: c['close|cross'] || 0, same_wide: c['wide|same'] || 0 }, acc, fin, dev }; }
module.exports = { run, rth, outage, VZ, SPD, T_OUT, R_OUT, HOLD };
if (require.main === module) { const [arm, d, seed] = process.argv.slice(2), { r } = run(arm, +d, +seed), od = path.join(__dirname, '..', 'out', 'rth'); fs.mkdirSync(od, { recursive: true }); fs.writeFileSync(path.join(od, `${arm}_d${d}_${seed}.json`), JSON.stringify(r)); console.log(JSON.stringify(r)); }
