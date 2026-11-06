'use strict';
// OUTAGE_PREREG.md: 20 area outages per run (r 2 km, 120 s hover) vs N independent holds (ISO-R any phase, ISO-C cruise only). d = 3.
const fs = require('fs'), path = require('path'), H2 = require('./houston2.js'), V = require('./valloc.js'), VR = require('./vrate.js'), VO = require('./vol.js'), DV = require('./deviate.js'), P = require('./proc.js');
const NEV = 20, R_OUT = 2000, HOLD = 120, TA = 4000, TB_ = 9000, ZONE = 6000;
function rng(seed) { let s = (seed * 2654435761) >>> 0; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; }
const segAt = (f, t) => { if (t < f.t0 || t >= f.end) return null; for (const s of f.sg) if (t >= s[0] && t < s[0] + s[1]) return s; return null; };
const toFlight = (f, smp) => ({ id: f.id, op: f.op, t0: f.t0, sg: smp.map(p => [p[0], 1, p[1], p[2], p[3], p[1], p[2], p[3], p[4], 'dev']), end: smp[smp.length - 1][0] + 1 });
function hold(f, T) { const smp = DV.expand(f), k = smp.findIndex(p => p[0] === T), p = smp[k], out = smp.slice(0, k); for (let i = 0; i < HOLD; i++) out.push([T + i, p[1], p[2], p[3], 'hover']); for (const q of smp.slice(k)) out.push([q[0] + HOLD, q[1], q[2], q[3], q[4]]); return toFlight(f, out); }
const events = seed => { const r = rng(seed + 90000), ev = []; for (let i = 0; i < NEV; i++) ev.push({ T: Math.floor(TA + r() * (TB_ - TA)), c: [(r() - 0.5) * 8000, (r() - 0.5) * 8000] }); return ev.sort((a, b) => a.T - b.T); };
function accepted(seed, a0) { const S = H2.sites(3, seed), fl = a0 ? V.flights(S, seed, V.ARMS.A0) : VR.flights(S, seed, 'V0'), { delays } = VO.intentCheck(fl, 30, 5, 10); return DV.finalTracks(fl, delays, new Map(), null); }
function applyOutages(acc, ev, log) { const fin = acc.slice(); for (const e of ev) for (let i = 0; i < fin.length; i++) { const f = fin[i], s = segAt(f, e.T); if (!s) continue; const p = P.posAt(s, e.T); if (p[2] <= 0.5 || Math.hypot(p[0] - e.c[0], p[1] - e.c[1]) > R_OUT) continue;
    fin[i] = hold(f, e.T); if (log) log.push({ id: f.id, T: e.T, phase: s[8] }); } return fin; }
function applyIso(acc, N, seed, cruiseOnly, log) { const r = rng(seed + (cruiseOnly ? 92000 : 91000)), fin = acc.slice(); let made = 0, guard = 0;
  while (made < N && guard++ < N * 1000) { const T = Math.floor(TA + r() * (TB_ - TA)), cand = [];
    for (let i = 0; i < fin.length; i++) { const s = segAt(fin[i], T); if (!s) continue; const p = P.posAt(s, T); if (p[2] <= 0.5 || Math.abs(p[0]) > ZONE || Math.abs(p[1]) > ZONE) continue; if (cruiseOnly && s[8] !== 'cruise') continue; cand.push([i, s[8]]); }
    if (!cand.length) continue; const [i, ph] = cand[Math.floor(r() * cand.length)]; fin[i] = hold(fin[i], T); made++; if (log) log.push({ id: fin[i].id, T, phase: ph }); }
  return fin; }
function run(arm, seed, nev) { const ev = events(seed).slice(0, nev === undefined ? NEV : nev), log = []; let fin;
  if (arm === 'OUT-A2' || arm === 'OUT-A0') fin = applyOutages(accepted(seed, arm === 'OUT-A0'), ev, log);
  else { const acc = accepted(seed, false), nlog = []; applyOutages(acc, ev, nlog); fin = applyIso(acc, nlog.length, seed, arm === 'ISO-C', log); }
  const c = H2.count(fin), ph = {}; for (const l of log) ph[l.phase] = (ph[l.phase] || 0) + 1;
  return { r: { arm, seed, holds: log.length, phases: ph, cross_wide: c['wide|cross'] || 0, cross_close: c['close|cross'] || 0 }, fin, log }; }
module.exports = { run, hold, events, accepted, applyOutages, applyIso, segAt, R_OUT, HOLD };
if (require.main === module) { const [arm, seed] = process.argv.slice(2), { r } = run(arm, +seed), od = path.join(__dirname, '..', 'out', 'outage'); fs.mkdirSync(od, { recursive: true }); fs.writeFileSync(path.join(od, `${arm}_${seed}.json`), JSON.stringify(r)); console.log(JSON.stringify(r)); }
