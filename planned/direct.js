'use strict';
// DIRECT1 (planned/DIRECT1_PREREG.md): reassign each Wing / Amazon leg's cruise height by the leg's direction or length, shared by both companies.
// Zipline is untouched (filed at a fixed 101 m). Every leg has one cruise segment; climb and descent endpoints that sit at that leg's old cruise
// height move with it; hovers, deliveries and points at other heights stay as they are. All layers are inside both filed bands (Wing 46-91, Amazon 55-115).
const LAYOUTS = {
  D2: { kind: 'dir2', layers: [56, 76] },          // eastbound (dx >= 0) 56 m, westbound 76 m (as aviation's direction-based levels)
  D4: { kind: 'dir4', layers: [56, 64, 72, 80] },  // heading sectors E, N, W, S (centred on the axes) at 56, 64, 72, 80 m
  DD: { kind: 'dist', layers: [56, 80] } };        // legs shorter than the metro's median Wing / Amazon cruise leg 56 m, longer legs 80 m
const isCruise = s => s[8] === 'cruise' && Math.hypot(s[5] - s[2], s[6] - s[3]) > 1;
function layerFor(s, lay, split) { const dx = s[5] - s[2], dy = s[6] - s[3];
  if (lay.kind === 'dir2') return dx >= 0 ? lay.layers[0] : lay.layers[1];
  if (lay.kind === 'dir4') { const a = (Math.atan2(dy, dx) * 180 / Math.PI + 360 + 45) % 360; return lay.layers[Math.floor(a / 90)]; }
  return Math.hypot(dx, dy) < split ? lay.layers[0] : lay.layers[1]; }
function relayer(f, lay, split) { if (f.op === 'zipline') return f;
  const sg = f.sg.map(s => s.slice()), cr = []; sg.forEach((s, i) => { if (isCruise(s)) cr.push(i); }); if (!cr.length) return f;
  const newZ = new Map(cr.map(i => [i, layerFor(sg[i], lay, split)])), oldZ = new Map(cr.map(i => [i, sg[i][4]]));
  for (let i = 0; i < sg.length; i++) { const s = sg[i];
    if (newZ.has(i)) { s[4] = s[7] = newZ.get(i); continue; }
    const prev = cr.filter(j => j < i).pop(), next = cr.find(j => j > i);
    if (prev !== undefined && Math.abs(s[4] - oldZ.get(prev)) < 1e-6) s[4] = newZ.get(prev);
    if (next !== undefined && Math.abs(s[7] - oldZ.get(next)) < 1e-6) s[7] = newZ.get(next); }
  return { id: f.id, op: f.op, t0: f.t0, end: f.end, sg }; }
function medianLeg(fl) { const v = []; for (const f of fl) if (f.op !== 'zipline') for (const s of f.sg) if (isCruise(s)) v.push(Math.hypot(s[5] - s[2], s[6] - s[3])); v.sort((a, b) => a - b); return v.length ? v[Math.floor(v.length / 2)] : 0; }
module.exports = { LAYOUTS, relayer, layerFor, medianLeg, isCruise };
