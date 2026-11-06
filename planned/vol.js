'use strict';
// VOL_PREREG.md: plan check (first filed goes first) with a parameterised reserved volume. Filed profiles, A2 heights.
// usage: node planned/vol.js ARM D_KM SEED
const fs = require('fs'), path = require('path'), H2 = require('./houston2.js'), VR = require('./vrate.js'), F = require('./fair.js'), P = require('./proc.js');
const ARMS = { H15: [15, 5, 10], H30: [30, 5, 10], H60: [60, 5, 10], H90: [90, 5, 10], T15: [30, 15, 10], T30: [30, 30, 10], V20: [30, 5, 20] };   // [cell m, time buffer s, vertical sep m]
const STEP = 30, TRIES = 40, OPI = { wing: 0, amazon: 1, zipline: 2 };
function intentCheck(fl, CELL, TB, VSEP) {
  const order = fl.filter(f => P.reachesZone(f, 30)).sort((a, b) => a.t0 - b.t0 || a.id - b.id), book = new Map(), key = (ix, iy, b) => ((ix + 1000) * 2000 + (iy + 1000)) * 4000 + b;
  const delays = new Map(); let cancelled = 0, lastPrune = -Infinity;
  for (const f of order) {
    if (f.t0 - lastPrune > 600) { const minB = Math.floor((f.t0 - TB) / 10) - 1; for (const k of book.keys()) if (k % 4000 < minB) book.delete(k); lastPrune = f.t0; }
    const S = P.samples(f), me = OPI[f.op]; let D = -1;
    for (let k = 0; k < TRIES; k++) { const d = k * STEP; let bad = false;
      for (let i = 0; i < S.length && !bad; i += 4) { const t = f.t0 + d + S[i], x = S[i + 1], y = S[i + 2], z = S[i + 3], ix = Math.floor(x / CELL), iy = Math.floor(y / CELL);
        for (let b = Math.floor((t - TB) / 10); b <= Math.floor((t + TB) / 10) && !bad; b++) for (let ox = -1; ox <= 1 && !bad; ox++) for (let oy = -1; oy <= 1 && !bad; oy++) { const L = book.get(key(ix + ox, iy + oy, b)); if (!L) continue;
          for (let j = 0; j < L.length; j += 3) if (L[j + 2] !== me && Math.abs(L[j] - t) <= TB && Math.abs(L[j + 1] - z) < VSEP && !(L[j + 1] < 1 && z < 1)) { bad = true; break; } } }
      if (!bad) { D = d; break; } }
    if (D < 0) { cancelled++; delays.set(f.id, null); continue; }
    delays.set(f.id, D);
    for (let i = 0; i < S.length; i += 4) { const t = f.t0 + D + S[i], k = key(Math.floor(S[i + 1] / CELL), Math.floor(S[i + 2] / CELL), Math.floor(t / 10)); let L = book.get(k); if (!L) book.set(k, L = []); L.push(t, S[i + 3], me); } }
  const out = []; for (const f of fl) { if (!delays.has(f.id)) { out.push(f); continue; } const D = delays.get(f.id); if (D === null) continue;
    out.push(D ? { id: f.id, op: f.op, t0: f.t0 + D, sg: f.sg.map(s => [s[0] + D, ...s.slice(1)]), end: f.end + D, delay: D } : Object.assign(f, { delay: 0 })); }
  return { fl: out, delays, cancelled, checked: order.length };
}
function run(arm, d, seed) { const S = H2.sites(d, seed), fl = VR.flights(S, seed, 'V0'), [C, T, Vs] = ARMS[arm], ic = intentCheck(fl, C, T, Vs), st = F.stats(ic, fl);
  const pos = [...ic.delays.values()].filter(x => x > 0); return { r: Object.assign({ arm, d, seed, cell: C, tb: T, vsep: Vs, delay_mean_delayed_s: pos.length ? pos.reduce((a, b) => a + b, 0) / pos.length : 0 }, st), ic }; }
module.exports = { run, intentCheck, ARMS };
if (require.main === module) { const [arm, d, seed] = process.argv.slice(2), t0 = Date.now(), { r } = run(arm, +d, +seed); r.wall_s = (Date.now() - t0) / 1000; const od = path.join(__dirname, '..', 'out', 'vol'); fs.mkdirSync(od, { recursive: true });
  fs.writeFileSync(path.join(od, `${arm}_d${d}_${seed}.json`), JSON.stringify(r));
  console.log(arm, 'd', d, 'seed', seed, 'delayed', r.tot.delayed, 'of', r.tot.n, 'cancelled', r.tot.cancelled, 'mean delay', r.delay_mean_delayed_s.toFixed(0) + 's', r.wall_s + 's'); }
