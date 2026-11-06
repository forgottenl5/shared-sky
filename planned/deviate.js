'use strict';
// DEVIATE_PREREG.md: off-plan drones (HOLD 120 s or LAND at 3 m/s) on plan-checked traffic; contingency shared (S) or not (N).
// usage: node planned/deviate.js ARM D_KM SEED   ARM in BASE N-HOLD S-HOLD N-LAND S-LAND
const fs = require('fs'), path = require('path'), H2 = require('./houston2.js'), VR = require('./vrate.js'), P = require('./proc.js'), VO = require('./vol.js');
const FRAC = 0.05, HOLD_S = 120, LAND_V = 3, CELL = 30, TB = 5, VSEP = 10, STEP = 30, TRIES = 40, OPI = { wing: 0, amazon: 1, zipline: 2 };
function rng(seed) { let s = (seed * 2654435761) >>> 0; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; }
// deviation draws: independent of arm; offset = seconds after the flight's (accepted) launch
function draws(fl, seed) { const r = rng(seed + 70000), out = new Map();
  for (const f of [...fl].sort((a, b) => a.id - b.id)) { if (!P.reachesZone(f, 30)) continue; const u = r(), u2 = r(); if (u >= FRAC) continue;
    const cr = f.sg.filter(s => s[8] === 'cruise'), Tc = cr.reduce((a, s) => a + s[1], 0); if (!Tc) continue; let x = Math.floor(u2 * Tc);
    for (const s of cr) { if (x < s[1]) { out.set(f.id, s[0] - f.t0 + x); break; } x -= s[1]; } }
  return out; }
const expand = f => { const o = []; for (const s of f.sg) for (let q = 0; q < s[1]; q++) { const p = P.posAt(s, s[0] + q); o.push([s[0] + q, p[0], p[1], p[2], s[8]]); } return o; };
function deviated(f, off, type) {   // f: accepted (shifted) flight; returns new flight built from 1-s segments
  const smp = expand(f), td = f.t0 + off, k = smp.findIndex(p => p[0] === td), out = smp.slice(0, k), pd = smp[k];
  if (type === 'HOLD') { for (let i = 0; i < HOLD_S; i++) out.push([td + i, pd[1], pd[2], pd[3], 'hover']); for (const p of smp.slice(k)) out.push([p[0] + HOLD_S, p[1], p[2], p[3], p[4]]); }
  else { for (let i = 0; ; i++) { const z = pd[3] - LAND_V * i; if (z <= 0) { out.push([td + i, pd[1], pd[2], 0, 'vertical']); break; } out.push([td + i, pd[1], pd[2], z, 'vertical']); } }
  const sg = out.map(p => [p[0], 1, p[1], p[2], p[3], p[1], p[2], p[3], p[4], 'dev']); return { id: f.id, op: f.op, t0: f.t0, sg, end: out[out.length - 1][0] + 1, dev: type, td }; }
// plan check with contingency visibility: entries [t, z, op, vis]
function intentCheckShared(fl, dev, type, invisible) {
  const order = fl.filter(f => P.reachesZone(f, 30)).sort((a, b) => a.t0 - b.t0 || a.id - b.id), book = new Map(), key = (ix, iy, b) => ((ix + 1000) * 2000 + (iy + 1000)) * 4000 + b;
  const delays = new Map(), devTracks = new Map(); let cancelled = 0, lastPrune = -Infinity;
  const put = (t, x, y, z, me, vis) => { const k = key(Math.floor(x / CELL), Math.floor(y / CELL), Math.floor(t / 10)); let L = book.get(k); if (!L) book.set(k, L = []); L.push(t, z, me, vis); };
  for (const f of order) {
    if (f.t0 - lastPrune > 600) { const minB = Math.floor((f.t0 - TB) / 10) - 1; for (const k of book.keys()) if (k % 4000 < minB) book.delete(k); lastPrune = f.t0; }
    const S = P.samples(f), me = OPI[f.op]; let D = -1;
    for (let k = 0; k < TRIES; k++) { const d = k * STEP, launch = f.t0 + d; let bad = false;
      for (let i = 0; i < S.length && !bad; i += 4) { const t = f.t0 + d + S[i], x = S[i + 1], y = S[i + 2], z = S[i + 3], ix = Math.floor(x / CELL), iy = Math.floor(y / CELL);
        for (let b = Math.floor((t - TB) / 10); b <= Math.floor((t + TB) / 10) && !bad; b++) for (let ox = -1; ox <= 1 && !bad; ox++) for (let oy = -1; oy <= 1 && !bad; oy++) { const L = book.get(key(ix + ox, iy + oy, b)); if (!L) continue;
          for (let j = 0; j < L.length; j += 4) if (L[j + 2] !== me && L[j + 3] <= launch && Math.abs(L[j] - t) <= TB && Math.abs(L[j + 1] - z) < VSEP && !(L[j + 1] < 1 && z < 1)) { bad = true; break; } } }
      if (!bad) { D = d; break; } }
    if (D < 0) { cancelled++; delays.set(f.id, null); continue; }
    delays.set(f.id, D); for (let i = 0; i < S.length; i += 4) put(f.t0 + D + S[i], S[i + 1], S[i + 2], S[i + 3], me, -Infinity);
    if (dev.has(f.id)) { const acc = D ? { id: f.id, op: f.op, t0: f.t0 + D, sg: f.sg.map(s => [s[0] + D, ...s.slice(1)]), end: f.end + D } : f, dv = deviated(acc, dev.get(f.id), type); devTracks.set(f.id, dv);
      const vis = invisible ? Infinity : dv.td, DS = P.samples(dv); for (let i = 0; i < DS.length; i += 4) if (dv.t0 + DS[i] >= dv.td) put(dv.t0 + DS[i], DS[i + 1], DS[i + 2], DS[i + 3], me, vis); } }
  return { delays, cancelled, checked: order.length, devTracks };
}
function finalTracks(fl, delays, dev, type) { const out = []; for (const f of fl) { if (!delays.has(f.id)) { out.push(f); continue; } const D = delays.get(f.id); if (D === null) continue;
    let g = D ? { id: f.id, op: f.op, t0: f.t0 + D, sg: f.sg.map(s => [s[0] + D, ...s.slice(1)]), end: f.end + D } : f; if (type && dev.has(f.id)) g = deviated(g, dev.get(f.id), type); out.push(g); } return out; }
function run(arm, d, seed) { const S = H2.sites(d, seed), fl = VR.flights(S, seed, 'V0'), dev = draws(fl, seed), type = arm === 'BASE' ? null : arm.slice(2), shared = arm[0] === 'S';
  let delays, cancelled; if (shared) ({ delays, cancelled } = intentCheckShared(fl, dev, type, false)); else ({ delays, cancelled } = VO.intentCheck(fl, CELL, TB, VSEP));
  const fin = finalTracks(fl, delays, dev, type), c = H2.count(fin), pos = [...delays.values()].filter(x => x > 0);
  return { r: { arm, d, seed, deviations: type ? dev.size : 0, cross_wide: c['wide|cross'] || 0, cross_close: c['close|cross'] || 0, same_wide: c['wide|same'] || 0, delayed: pos.length, total_delay_s: pos.reduce((a, b) => a + b, 0), cancelled, checked: delays.size }, fin, delays, dev }; }
module.exports = { run, draws, deviated, intentCheckShared, finalTracks, expand, HOLD_S, LAND_V };
if (require.main === module) { const [arm, d, seed] = process.argv.slice(2), t0 = Date.now(), { r } = run(arm, +d, +seed); r.wall_s = (Date.now() - t0) / 1000; const od = path.join(__dirname, '..', 'out', 'deviate'); fs.mkdirSync(od, { recursive: true });
  fs.writeFileSync(path.join(od, `${arm}_d${d}_${seed}.json`), JSON.stringify(r)); console.log(JSON.stringify(r)); }
