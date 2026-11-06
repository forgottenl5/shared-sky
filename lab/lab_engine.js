'use strict';
// Shared Sky lab engine: a single-file, configurable copy of the planned-operations research engine, for the browser lab.
// Every function mirrors its research original (named in each comment); test_lab_engine.js checks they give identical results.
(function (root) {
  const OP = { wing: { rate: 400 / 15, radius: 9656, hours: 15 }, amazon: { rate: 1000 / 16.5, radius: 12070, hours: 16.5 }, zipline: { rate: 1000 * 0.95 / 15, radius: 16093, hours: 15 } };
  const RATIO = { wing: 75 / 75, zipline: 65 / 75, amazon: 6 / 75 };
  const HEIGHTS = { filed: { wing: [46, 91], aOut: 61, zip: 101, aIn: 105 }, allocation: { wing: [46, 71], aOut: 81, zip: 101, aIn: 115 }, reported: { wing: [46, 91], aOut: 69, zip: 101, aIn: 122 } };   // reported: Amazon per local Richardson reports (PRELAUNCH)
  const VZ = 5, MIN_R = 300, MARGIN = 1000, STEP = 30, TRIES = 40;
  function rng(seed) { let s = (seed * 2654435761) >>> 0; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; }
  const posAt = (sg, t) => { const f = (t - sg[0] + 0.5) / sg[1]; return [sg[2] + (sg[5] - sg[2]) * f, sg[3] + (sg[6] - sg[3]) * f, sg[4] + (sg[7] - sg[4]) * f]; };
  const toward = (a, b, d) => { const L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1; return [a[0] + (b[0] - a[0]) / L * d, a[1] + (b[1] - a[1]) / L * d]; };

  // ---- segment builder (valloc.js)
  function Seg(t0) { this.t = t0; this.s = []; }
  Seg.prototype.put = function (n, x0, y0, z0, x1, y1, z1, ph, leg) { this.s.push([this.t, n, x0, y0, z0, x1, y1, z1, ph, leg]); this.t += n; return this; };
  Seg.prototype.vert = function (x, y, z0, z1, dur, leg) { dur = dur === undefined ? Math.abs(z1 - z0) / VZ : dur; return this.put(Math.max(1, Math.round(dur)), x, y, z0, x, y, z1, 'vertical', leg); };
  Seg.prototype.hover = function (x, y, z, dur, leg) { return this.put(dur, x, y, z, x, y, z, 'hover', leg); };
  Seg.prototype.cruise = function (a, b, z, v, leg) { const L = Math.hypot(b[0] - a[0], b[1] - a[1]); return this.put(Math.max(1, Math.round(L / v)), a[0], a[1], z, b[0], b[1], z, 'cruise', leg); };
  Seg.prototype.ramp = function (a, b, z0, z1, dur, leg) { return this.put(Math.max(1, Math.round(dur)), a[0], a[1], z0, b[0], b[1], z1, 'vertical', leg); };
  // CORR2 (28 Oct 2026): optional via point for Wing and Zipline (registered-path corridors); with via null the flights are unchanged
  const useVia = (a, via, b) => via && Math.hypot(via[0] - a[0], via[1] - a[1]) > 300 && Math.hypot(b[0] - via[0], b[1] - via[1]) > 300;
  function wingFlight(t0, pad, cust, h, via) { const T = new Seg(t0); T.vert(pad[0], pad[1], 0, 7, undefined, 'out').hover(pad[0], pad[1], 7, 30, 'out').vert(pad[0], pad[1], 7, h, undefined, 'out');
    if (useVia(pad, via, cust)) T.cruise(pad, via, h, 26.4, 'out').cruise(via, cust, h, 26.4, 'out'); else T.cruise(pad, cust, h, 26.4, 'out');
    T.vert(cust[0], cust[1], h, 7, undefined, 'out').hover(cust[0], cust[1], 7, 30, 'out').vert(cust[0], cust[1], 7, h, undefined, 'in');
    if (useVia(pad, via, cust)) T.cruise(cust, via, h, 26.4, 'in').cruise(via, pad, h, 26.4, 'in'); else T.cruise(cust, pad, h, 26.4, 'in');
    T.vert(pad[0], pad[1], h, 0, undefined, 'in'); return T.s; }
  function amazonFlight(t0, pad, cust, ho, hi, via) { const T = new Seg(t0), V = 30, d1 = V * 40 / 2, d2 = V * 30 / 2;
    if (via && Math.hypot(via[0] - pad[0], via[1] - pad[1]) > d1 + d2 && Math.hypot(cust[0] - via[0], cust[1] - via[1]) > d1 + d2) {   // registered-path variant (CORRIDOR study): pad -> via -> customer, same path back
      const a1 = toward(pad, via, d1), c0 = toward(cust, via, d2), b1 = toward(cust, via, d1), p0 = toward(pad, via, d2);
      T.vert(pad[0], pad[1], 0, 35, 15, 'out').ramp(pad, a1, 35, ho, 40, 'out').cruise(a1, via, ho, V, 'out').cruise(via, c0, ho, V, 'out').ramp(c0, cust, ho, 43, 30, 'out').vert(cust[0], cust[1], 43, 4, 27, 'out').hover(cust[0], cust[1], 4, 4, 'out')
        .vert(cust[0], cust[1], 4, 60, 30, 'in').ramp(cust, b1, 60, hi, 40, 'in').cruise(b1, via, hi, V, 'in').cruise(via, p0, hi, V, 'in').ramp(p0, pad, hi, 60, 30, 'in').vert(pad[0], pad[1], 60, 0, 35, 'in'); return T.s; }
    const a1 = toward(pad, cust, d1), c0 = toward(cust, pad, d2), b1 = toward(cust, pad, d1), p0 = toward(pad, cust, d2);
    T.vert(pad[0], pad[1], 0, 35, 15, 'out').ramp(pad, a1, 35, ho, 40, 'out').cruise(a1, c0, ho, V, 'out').ramp(c0, cust, ho, 43, 30, 'out').vert(cust[0], cust[1], 43, 4, 27, 'out').hover(cust[0], cust[1], 4, 4, 'out')
      .vert(cust[0], cust[1], 4, 60, 30, 'in').ramp(cust, b1, 60, hi, 40, 'in').cruise(b1, p0, hi, V, 'in').ramp(p0, pad, hi, 60, 30, 'in').vert(pad[0], pad[1], 60, 0, 35, 'in'); return T.s; }
  function ziplineFlight(t0, dock, box, cust, hz, via) { const T = new Seg(t0); T.vert(dock[0], dock[1], 0, hz, undefined, 'toBox');
    if (useVia(dock, via, box)) T.cruise(dock, via, hz, 31.3, 'toBox').cruise(via, box, hz, 31.3, 'toBox'); else T.cruise(dock, box, hz, 31.3, 'toBox');
    T.hover(box[0], box[1], hz, 120, 'toBox').cruise(box, cust, hz, 31.3, 'out').hover(cust[0], cust[1], hz, 75, 'out');
    if (useVia(dock, via, cust)) T.cruise(cust, via, hz, 31.3, 'in').cruise(via, dock, hz, 31.3, 'in'); else T.cruise(cust, dock, hz, 31.3, 'in');
    T.vert(dock[0], dock[1], hz, 0, undefined, 'in'); return T.s; }

  // ---- sites (houston2.sites; ratios adjustable as fleet.js)
  function sites(cfg, d, seed, ratio) { ratio = ratio || RATIO; const r = rng(seed + 7919), L = 2 * cfg.half / 1000, out = [];
    for (const op of ['wing', 'zipline', 'amazon']) { const n = Math.round(L * L / (d * d) * ratio[op]); for (let k = 0; k < n; k++) out.push({ op, c: [(r() - 0.5) * 2 * cfg.half, (r() - 0.5) * 2 * cfg.half] }); } return out; }
  // ---- flights (valloc.flights)
  function flights(cfg, siteList, seed, A, opt) { const NB = opt && opt.boxes ? opt.boxes.n : 20, BR = opt && opt.boxes ? opt.boxes.r : 5000; const r = rng(seed), r2 = rng(seed + 104729), END = cfg.warm + cfg.meas, fl = [], pick = v => Array.isArray(v) ? v[0] + (v[1] - v[0]) * r2() : v;
    for (const S of siteList) { const o = OP[S.op], c = S.c, rate = S.rate || o.rate, boxes = [];
      if (S.op === 'zipline') for (let k = 0; k < NB; k++) { const rr = BR * Math.sqrt(r()), th = 2 * Math.PI * r(); boxes.push([c[0] + rr * Math.cos(th), c[1] + rr * Math.sin(th)]); }
      let t = -Math.log(1 - r()) * 3600 / rate;
      while (t < END) { let cust = opt && opt.cust ? opt.cust(S, r) : null; if (!cust) for (;;) { const rr = o.radius * Math.sqrt(r()), th = 2 * Math.PI * r(); if (rr < MIN_R) continue; cust = [c[0] + rr * Math.cos(th), c[1] + rr * Math.sin(th)]; break; }
        if (opt && opt.keep && !opt.keep(S, cust, r)) { t += -Math.log(1 - r()) * 3600 / rate; continue; }   // CAPS1 (28 Oct 2026): optional thinning; absent = unchanged
        const PS = opt && opt.padSpread ? opt.padSpread : 30, pad = [c[0] + (r() - 0.5) * PS, c[1] + (r() - 0.5) * PS], t0 = Math.round(t); let sg;
        if (S.op === 'wing') sg = wingFlight(t0, pad, cust, A.wing[0] + (A.wing[1] - A.wing[0]) * r(), opt && opt.viaAll ? opt.viaAll(S, cust) : null); else if (S.op === 'amazon') sg = amazonFlight(t0, pad, cust, pick(A.aOut), pick(A.aIn), opt && opt.via ? opt.via(S, cust) : opt && opt.viaAll ? opt.viaAll(S, cust) : null); else { const bx = boxes[Math.floor(r() * boxes.length)]; sg = ziplineFlight(t0, pad, bx, cust, A.zip, opt && opt.viaAll ? opt.viaAll(S, cust) : null); }
        fl.push({ id: fl.length, op: S.op, t0, sg, end: sg[sg.length - 1][0] + sg[sg.length - 1][1] }); t += -Math.log(1 - r()) * 3600 / rate; } }
    return fl; }
  // ---- zone helpers (proc.js)
  const reachesZone = (cfg, f, m) => { let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity; for (const s of f.sg) { x0 = Math.min(x0, s[2], s[5]); x1 = Math.max(x1, s[2], s[5]); y0 = Math.min(y0, s[3], s[6]); y1 = Math.max(y1, s[3], s[6]); } return x1 >= -cfg.zone - m && x0 <= cfg.zone + m && y1 >= -cfg.zone - m && y0 <= cfg.zone + m; };
  function samples(cfg, f) { const out = [], lim = cfg.zone + MARGIN; for (const sg of f.sg) for (let q = 0; q < sg[1]; q++) { const t = sg[0] + q, p = posAt(sg, t); if (Math.abs(p[0]) <= lim && Math.abs(p[1]) <= lim) out.push(t - f.t0, p[0], p[1], p[2]); } return out; }
  // ---- plan check, first filed goes first (vol.intentCheck)
  function intentCheck(cfg, fl, CELL, TB, VSEP) { const OPI = { wing: 0, amazon: 1, zipline: 2 };
    const order = fl.filter(f => reachesZone(cfg, f, 30)).sort((a, b) => a.t0 - b.t0 || a.id - b.id), book = new Map(), key = (ix, iy, b) => ((ix + 5000) * 10000 + (iy + 5000)) * 4000 + b;   // PCFIX 24 Oct 2026: was (ix+1000)*2000, which went negative beyond 30 km west/south (bookings pruned) and collided beyond 30 km east/north
    const delays = new Map(); let cancelled = 0, lastPrune = -Infinity;
    for (const f of order) {
      if (f.t0 - lastPrune > 600) { const minB = Math.floor((f.t0 - TB) / 10) - 1; for (const k of book.keys()) if (k % 4000 < minB) book.delete(k); lastPrune = f.t0; }
      const S = samples(cfg, f), me = OPI[f.op]; let D = -1;
      for (let k = 0; k < TRIES; k++) { const d = k * STEP; let bad = false;
        for (let i = 0; i < S.length && !bad; i += 4) { const t = f.t0 + d + S[i], x = S[i + 1], y = S[i + 2], z = S[i + 3], ix = Math.floor(x / CELL), iy = Math.floor(y / CELL);
          for (let b = Math.floor((t - TB) / 10); b <= Math.floor((t + TB) / 10) && !bad; b++) for (let ox = -1; ox <= 1 && !bad; ox++) for (let oy = -1; oy <= 1 && !bad; oy++) { const L = book.get(key(ix + ox, iy + oy, b)); if (!L) continue;
            for (let j = 0; j < L.length; j += 3) if (L[j + 2] !== me && Math.abs(L[j] - t) <= TB && Math.abs(L[j + 1] - z) < VSEP && !(L[j + 1] < 1 && z < 1)) { bad = true; break; } } }
        if (!bad) { D = d; break; } }
      if (D < 0) { cancelled++; delays.set(f.id, null); continue; }
      delays.set(f.id, D);
      for (let i = 0; i < S.length; i += 4) { const t = f.t0 + D + S[i], k = key(Math.floor(S[i + 1] / CELL), Math.floor(S[i + 2] / CELL), Math.floor(t / 10)); let L = book.get(k); if (!L) book.set(k, L = []); L.push(t, S[i + 3], me); } }
    return { delays, cancelled, checked: order.length }; }
  const shift = (f, D) => D ? { id: f.id, op: f.op, t0: f.t0 + D, sg: f.sg.map(s => [s[0] + D, ...s.slice(1)]), end: f.end + D } : f;
  // ---- contingencies (deviate.js, rth.js, countfix.drawsInZone, outage.js)
  const expand = f => { const o = []; for (const s of f.sg) for (let q = 0; q < s[1]; q++) { const p = posAt(s, s[0] + q); o.push([s[0] + q, p[0], p[1], p[2], s[8]]); } return o; };
  const toFlight = (f, smp) => ({ id: f.id, op: f.op, t0: f.t0, sg: smp.map(p => [p[0], 1, p[1], p[2], p[3], p[1], p[2], p[3], p[4], 'dev']), end: smp[smp.length - 1][0] + 1, dev: true });
  function hold(f, T, secs) { const smp = expand(f), k = smp.findIndex(p => p[0] === T); if (k < 0) return f; const p = smp[k], out = smp.slice(0, k); for (let i = 0; i < secs; i++) out.push([T + i, p[1], p[2], p[3], 'hover']); for (const q of smp.slice(k)) out.push([q[0] + secs, q[1], q[2], q[3], q[4]]); return toFlight(f, out); }
  function rth(f, off, H) { const SPD = { wing: 26.4, zipline: 31.3, amazon: 30 }, smp = expand(f), td = f.t0 + off, k = smp.findIndex(p => p[0] === td), out = smp.slice(0, k), p = smp[k], pad = [f.sg[0][2], f.sg[0][3]]; let t = td, z = p[3];
    const tgt = H === null ? z : H; while (Math.abs(z - tgt) > 1e-9) { out.push([t++, p[1], p[2], z, 'vertical']); z = Math.abs(tgt - z) <= 3 ? tgt : z + Math.sign(tgt - z) * 3; }
    const L = Math.hypot(pad[0] - p[1], pad[1] - p[2]), n = Math.max(1, Math.round(L / SPD[f.op])); out.push([t++, p[1], p[2], z, 'cruise']);
    for (let i = 1; i <= n; i++) out.push([t++, p[1] + (pad[0] - p[1]) * i / n, p[2] + (pad[1] - p[2]) * i / n, z, 'cruise']);
    for (z = z - 3; z > 0; z -= 3) out.push([t++, pad[0], pad[1], z, 'vertical']); out.push([t, pad[0], pad[1], 0, 'vertical']); return toFlight(f, out); }
  function drawsInZone(cfg, acc, seed, frac) { const r = rng(seed + 80000), out = new Map();
    for (const f of [...acc].sort((a, b) => a.id - b.id)) { if (!reachesZone(cfg, f, 30)) continue; const u = r(), u2 = r(); if (u >= frac) continue; const ok = [];
      for (const s of f.sg) { if (s[8] !== 'cruise') continue; for (let q = 0; q < s[1]; q++) { const t = s[0] + q; if (t < cfg.warm) continue; const p = posAt(s, t); if (Math.abs(p[0]) <= cfg.zone && Math.abs(p[1]) <= cfg.zone) ok.push(t - f.t0); } }
      if (ok.length) out.set(f.id, ok[Math.floor(u2 * ok.length)]); }
    return out; }
  function outages(cfg, acc, seed, n, radius, secs) { const r = rng(seed + 90000), ev = []; for (let i = 0; i < n; i++) ev.push({ T: Math.floor(cfg.warm + r() * cfg.meas * 0.9), c: [(r() - 0.5) * cfg.zone * 1.4, (r() - 0.5) * cfg.zone * 1.4] }); ev.sort((a, b) => a.T - b.T);
    const fin = acc.slice(); let held = 0;
    for (const e of ev) for (let i = 0; i < fin.length; i++) { const f = fin[i]; if (e.T < f.t0 || e.T >= f.end) continue; const sg = f.sg.find(s => e.T >= s[0] && e.T < s[0] + s[1]); if (!sg) continue; const p = posAt(sg, e.T); if (p[2] <= 0.5 || Math.hypot(p[0] - e.c[0], p[1] - e.c[1]) > radius) continue; fin[i] = hold(f, e.T, secs); held++; }
    return { fin, held, events: ev }; }
  // ---- meeting counter (houston2.count, exposure parts removed)
  // opts.field (4 Nov 2026, ERRORS2): (x, y, t) -> [dx, dy, dz] error shared by every aircraft at that place and time, added to the flown position (dz only when airborne); default unchanged
  // opts.herr (3 Nov 2026, ERRORS1): id -> per-flight sideways offset [dx, dy] in metres, added to the flown position; default unchanged
  function count(cfg, fl, opts) { opts = opts || {}; const warm = cfg.warm, zone = cfg.zone, inZ = (x, y) => Math.abs(x) <= zone && Math.abs(y) <= zone;
    const keep = fl.filter(f => { let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity; for (const s of f.sg) { x0 = Math.min(x0, s[2], s[5]); x1 = Math.max(x1, s[2], s[5]); y0 = Math.min(y0, s[3], s[6]); y1 = Math.max(y1, s[3], s[6]); } return x1 >= -zone - 30 && x0 <= zone + 30 && y1 >= -zone - 30 && y0 <= zone + 30; });
    keep.sort((a, b) => a.t0 - b.t0); const tmax = keep.length ? Math.min(opts.tEnd === undefined ? Infinity : opts.tEnd, Math.max(...keep.map(f => f.end))) : 0,   // opts.tEnd (24 Oct 2026): stop at the end of the measured window; default unchanged
    res = {}, add = k => { res[k] = (res[k] || 0) + 1; }, TH = opts.th || [['wide', 30, 10], ['close', 15, 5]];
    let prev = Object.fromEntries(TH.map(x => [x[0], new Set()])), nx = 0; const act = [];
    // speed-up (4 Nov 2026): numeric grid and pair keys, and a pre-filter that skips pairs outside every threshold before Math.hypot; counts unchanged (lab/bench_count.js)
    // opts.cell (5 Nov 2026, ERRORS3): neighbour-search cell size in metres (default 30, unchanged); must be at least the largest horizontal threshold
    const CELL = opts.cell || 30, GOFF = 1 << 20, GMUL = 1 << 22, PMUL = 1 << 24, RVMAX = Math.max(...TH.map(x => x[2])), RH2 = Math.pow(Math.max(...TH.map(x => x[1])) * 1.001 + 1e-6, 2);
    if (Math.max(...TH.map(x => x[1])) > CELL) throw new Error('count: a horizontal threshold exceeds opts.cell (' + CELL + ' m)');
    if (keep.some(f => !Number.isInteger(f.id) || f.id < 0 || f.id >= PMUL)) throw new Error('count: flight ids must be integers below 2^24');
    const SUB = opts.sub || 1, pAt = SUB === 1 ? posAt : (sg, t) => { const f = Math.min(1, Math.max(0, (t - sg[0] + 0.5) / sg[1])); return [sg[2] + (sg[5] - sg[2]) * f, sg[3] + (sg[6] - sg[3]) * f, sg[4] + (sg[7] - sg[4]) * f]; };
    for (let it = 0; it <= tmax * SUB; it++) { const t = it / SUB; if (opts.progress && it % (600 * SUB) === 0) opts.progress(t / tmax);
      while (nx < keep.length && keep[nx].t0 <= t) { const f = keep[nx++]; f.k = 0; f.zb = opts.zerr ? opts.zerr(f.id) : 0; f.hb = opts.herr ? opts.herr(f.id) : null; act.push(f); }
      const P = []; for (let a = act.length - 1; a >= 0; a--) { const f = act[a]; if (t >= f.end) { act.splice(a, 1); continue; } while (f.k < f.sg.length - 1 && t >= f.sg[f.k][0] + f.sg[f.k][1]) f.k++; const sg = f.sg[f.k]; if (t < sg[0]) continue; const p = pAt(sg, t);
        if (p[0] < -zone - 30 || p[0] > zone + 30 || p[1] < -zone - 30 || p[1] > zone + 30) continue; const F = opts.field ? opts.field(p[0], p[1], t) : null;
        P.push([f.id, f.op, (f.hb ? p[0] + f.hb[0] : p[0]) + (F ? F[0] : 0), (f.hb ? p[1] + f.hb[1] : p[1]) + (F ? F[1] : 0), p[2] >= 1 ? p[2] + f.zb + (F ? F[2] : 0) : p[2], sg[8], sg[9]]); }
      const g = new Map(); for (let a = 0; a < P.length; a++) { const k = (Math.floor(P[a][2] / CELL) + GOFF) * GMUL + Math.floor(P[a][3] / CELL) + GOFF, v = g.get(k); if (v) v.push(a); else g.set(k, [a]); }
      const now = Object.fromEntries(TH.map(x => [x[0], new Set()]));
      for (let a = 0; a < P.length; a++) { const gx = Math.floor(P[a][2] / CELL), gy = Math.floor(P[a][3] / CELL);
        for (let ox = -1; ox <= 1; ox++) for (let oy = -1; oy <= 1; oy++) { const v = g.get((gx + ox + GOFF) * GMUL + gy + oy + GOFF); if (!v) continue;
          for (const b of v) { if (b <= a) continue; const A = P[a], B = P[b]; if (A[4] < 1 && B[4] < 1) continue; const ex = A[2] - B[2], ey = A[3] - B[3], dz = Math.abs(A[4] - B[4]); if (dz >= RVMAX || ex * ex + ey * ey > RH2) continue; const dh = Math.hypot(ex, ey);
            for (const [nm, Rh, Rv] of TH) { if (!(dh < Rh && dz < Rv)) continue; const key = A[0] < B[0] ? A[0] * PMUL + B[0] : B[0] * PMUL + A[0]; now[nm].add(key);
              if (prev[nm].has(key) || t < warm || !(inZ(A[2], A[3]) || inZ(B[2], B[3]))) continue;
              const cross = A[1] !== B[1], pair = [A[1], B[1]].sort().join('-'); add(`${nm}|${cross ? 'cross' : 'same'}`); if (opts.onMeet) opts.onMeet(nm, A, B, t); add(`${nm}|pair|${pair}`); } } } }
      prev = now; }
    return res; }
  // ---- one lab scenario
  // p: { d, seed, heights: 'filed'|'allocation'|{wing:[lo,hi],aOut,zip,aIn}, wingFixed: null|m, fleet: 'filed'|'equal', check: bool, cell, tb, vsep, contingency: 'none'|'hold'|'rth-own'|'rth-120'|'outage', frac, sub }
  function run(cfg, p, progress) {
    const H = typeof p.heights === 'string' ? Object.assign({}, HEIGHTS[p.heights]) : Object.assign({}, p.heights);
    if (p.wingFixed) { const w = Math.min(p.wingFixed, H.wing[1]); H.wing = [w, w]; }
    const ratio = p.ratio ? p.ratio : p.fleet === 'equal' ? { wing: 1, zipline: 65 / 75 * 0.32, amazon: 6 / 75 * 5.4 } : RATIO;   // p.ratio (24 Oct, DFW page): metro site mix; default unchanged
    const S = sites(cfg, p.d, p.seed, ratio); if (p.rateMul) for (const x of S) if (p.rateMul[x.op]) x.rate = OP[x.op].rate * p.rateMul[x.op];   // p.rateMul: per-operator rate factor (DFW Zipline 400/950); default unchanged
    const fl = flights(cfg, S, p.seed, H, { boxes: p.boxes }); progress && progress('plan', 0);
    let acc = fl, delays = null, ic = null;
    if (p.vcheck) { ic = p.vcheck(cfg, fl); acc = fl.map(f => { if (!ic.delays.has(f.id)) return f; const D = ic.delays.get(f.id); return D === null ? null : shift(f, D); }).filter(Boolean); delays = ic.delays; }   // 28 Oct 2026: external plan check (e.g. planned/coord.js volumes); absent = unchanged
    else if (p.check) { ic = intentCheck(cfg, fl, p.cell, p.tb, p.vsep); acc = fl.map(f => { if (!ic.delays.has(f.id)) return f; const D = ic.delays.get(f.id); return D === null ? null : shift(f, D); }).filter(Boolean); delays = ic.delays; }
    let fin = acc, nEvents = 0;
    if (p.contingency === 'hold' || p.contingency === 'rth-own' || p.contingency === 'rth-120') { const dv = drawsInZone(cfg, acc, p.seed, p.frac); nEvents = dv.size;
      fin = acc.map(f => !dv.has(f.id) ? f : p.contingency === 'hold' ? hold(f, f.t0 + dv.get(f.id), 120) : rth(f, dv.get(f.id), p.contingency === 'rth-120' ? 120 : null)); }
    else if (p.contingency === 'outage') { const o = outages(cfg, acc, p.seed, p.outages || 6, 2000, 120); fin = o.fin; nEvents = o.held; }
    const events = []; const zerr = p.zsig ? (id => { const g = rng(p.seed * 7919 + id * 31 + 17), u = Math.max(1e-12, g()), v = g(); return p.zsig * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }) : null;
    const c = count(cfg, fin, { sub: p.sub || 4, th: p.th, zerr: zerr, progress: progress && (x => progress('count', x)), onMeet: (nm, A, B, t) => { if (A[1] !== B[1]) events.push([nm === 'close' ? 1 : 0, t, Math.round(A[2]), Math.round(A[3]), Math.round((A[4] + B[4]) / 2), A[1][0] + B[1][0]]); } });
    const ops = {}; for (const f of fl) if (f.t0 >= cfg.warm && reachesZone(cfg, f, 0)) ops[f.op] = (ops[f.op] || 0) + 1;
    const dstat = { checked: 0, delayed: 0, total_s: 0, cancelled: 0, byOp: {} };
    if (delays) { const opOf = new Map(fl.map(f => [f.id, f.op])); for (const [id, D] of delays) { const o = opOf.get(id), b = dstat.byOp[o] || (dstat.byOp[o] = { n: 0, delayed: 0 }); dstat.checked++; b.n++; if (D === null) { dstat.cancelled++; continue; } if (D > 0) { dstat.delayed++; b.delayed++; dstat.total_s += D; } } }
    const pairs = {}; for (const k in c) { const m = k.match(/^wide\|pair\|(.+)$/); if (m && m[1].split('-')[0] !== m[1].split('-')[1]) pairs[m[1]] = c[k]; }
    return { cross_wide: c['wide|cross'] || 0, cross_close: c['close|cross'] || 0, same_wide: c['wide|same'] || 0, pairs, delays: dstat, contingencyEvents: nEvents, flightsMeasured: ops, sites: S.length, heights: H, events, fin };
  }
  const api = { OP, RATIO, HEIGHTS, rng, posAt, sites, flights, intentCheck, count, drawsInZone, hold, rth, outages, expand, reachesZone, samples, run };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.SkyLab = api;
})(typeof self !== 'undefined' ? self : this);
