'use strict';
// Exact deviations for the research modules (port of lab/lab_engine.js FIX1, 22 Nov 2026; tested in lab/test_fixes.js and planned/test_exact_dev.js).
// The research modules rebuild a deviated flight as 1 s stationary steps (toFlight). Counted once per second that is exact; counted
// 4 times per second the drone appears to jump up to ~30 m each second, which undercounts. These versions split the flight's own
// segments at the deviation time and add the new legs as segments. Used only when SKY_EXACT_DEV=1 (RECHECK_A2); default unchanged.
// Also: SKY_BOUND=1 makes houston2.count stop at the end of the measured window (FIX3), see houston2.js.
const ON = () => process.env.SKY_EXACT_DEV === '1';
const splitAt = (f, T) => { const pre = [], post = []; for (const s of f.sg) { if (s[0] + s[1] <= T) pre.push(s); else if (s[0] >= T) post.push(s); else { const a = T - s[0], u = a / s[1],
  m = [s[2] + (s[5] - s[2]) * u, s[3] + (s[6] - s[3]) * u, s[4] + (s[7] - s[4]) * u]; pre.push([s[0], a, s[2], s[3], s[4], m[0], m[1], m[2], s[8], s[9]]); post.push([T, s[1] - a, m[0], m[1], m[2], s[5], s[6], s[7], s[8], s[9]]); } } return { pre, post }; };
const hereAt = (f, T) => { const s = f.sg.find(q => T >= q[0] && T < q[0] + q[1]) || f.sg[f.sg.length - 1]; const u = Math.min(1, Math.max(0, (T - s[0]) / s[1])); return [s[2] + (s[5] - s[2]) * u, s[3] + (s[6] - s[3]) * u, s[4] + (s[7] - s[4]) * u]; };
function hold(f, T, secs) { if (T < f.t0 || T >= f.end) return f; const { pre, post } = splitAt(f, T); if (!secs) return { id: f.id, op: f.op, t0: f.t0, sg: pre.concat(post), end: f.end };
  const p = hereAt(f, T); return { id: f.id, op: f.op, t0: f.t0, sg: pre.concat([[T, secs, p[0], p[1], p[2], p[0], p[1], p[2], 'hover', 'dev']], post.map(s => [s[0] + secs, ...s.slice(1)])), end: f.end + secs }; }
// return home: climb or descend at VZ m/s to H (null = stay), 1 s turn, straight cruise to the pad at the operator's speed, descend at VZ m/s
function rth(f, off, H, VZ, SPD) { const td = f.t0 + off; if (td < f.t0 || td >= f.end) return f; const { pre } = splitAt(f, td), p = hereAt(f, td), pad = [f.sg[0][2], f.sg[0][3]], sg = pre.slice(); let t = td, z = p[2];
  const tgt = H === null ? z : H; if (Math.abs(tgt - z) > 1e-9) { const n = Math.ceil(Math.abs(tgt - z) / VZ); sg.push([t, n, p[0], p[1], z, p[0], p[1], tgt, 'vertical', 'dev']); t += n; z = tgt; }
  const L = Math.hypot(pad[0] - p[0], pad[1] - p[1]), n = Math.max(1, Math.round(L / SPD[f.op])); sg.push([t, 1, p[0], p[1], z, p[0], p[1], z, 'cruise', 'dev']); t += 1; sg.push([t, n, p[0], p[1], z, pad[0], pad[1], z, 'cruise', 'dev']); t += n;
  const nd = Math.max(1, Math.ceil(z / VZ)); sg.push([t, nd, pad[0], pad[1], z, pad[0], pad[1], 0, 'vertical', 'dev']); t += nd; return { id: f.id, op: f.op, t0: f.t0, sg, end: t }; }
// land in place at LAND_V m/s
function land(f, off, V) { const td = f.t0 + off; if (td < f.t0 || td >= f.end) return f; const { pre } = splitAt(f, td), p = hereAt(f, td), n = Math.max(1, Math.ceil(p[2] / V));
  return { id: f.id, op: f.op, t0: f.t0, sg: pre.concat([[td, n, p[0], p[1], p[2], p[0], p[1], 0, 'vertical', 'dev']]), end: td + n }; }
module.exports = { ON, splitAt, hereAt, hold, rth, land };
