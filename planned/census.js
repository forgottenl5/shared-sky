'use strict';
// Population-weighted customers (CENSUS study). Census 2020 block-group centres of population for Texas
// (data/CenPop2020_Mean_BG48.csv, founder download 23 Oct 2026; 18,638 rows, total 29,145,505 = Texas 2020 count).
// Optional strict airport rule from FAA UAS Facility Map ceilings (data/uasfm_houston.geojson).
const fs = require('fs'), path = require('path');
const SIG = 400, MIN_R = 300, R = { wing: 9656, amazon: 12070, zipline: 16093 };
function loadBG(toXY) { return fs.readFileSync(path.join(__dirname, '../data/CenPop2020_Mean_BG48.csv'), 'utf8').trim().split('\n').slice(1)
  .map(l => l.split(',')).map(f => ({ pop: +f[4], c: toXY(+f[5], +f[6]) })).filter(b => b.pop > 0); }
function loadZero(lat0, lon0) {   // set of 30-arc-second cells with a 0 ft ceiling, keyed in lon/lat cell indices
  const G = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/uasfm_houston.geojson'), 'utf8')), z = new Set();
  for (const f of G.features) if (f.properties.CEILING === 0) { const c = f.geometry.coordinates[0]; z.add(Math.round(Math.min(...c.map(p => p[0])) * 120) + ',' + Math.round(Math.min(...c.map(p => p[1])) * 120)); }
  const cosl = Math.cos(lat0 * Math.PI / 180), toLL = (x, y) => [lat0 + y / 110540, lon0 + x / (111320 * cosl)];
  const zeroAt = (x, y) => { const [la, lo] = toLL(x, y); return z.has(Math.floor(lo * 120 + 1e-9) + ',' + Math.floor(la * 120 + 1e-9)); };
  return { n: z.size, zeroAt }; }
function crossesZero(zeroAt, a, b) { const d = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(1, Math.ceil(d / 100));
  for (let i = 0; i <= n; i++) if (zeroAt(a[0] + (b[0] - a[0]) * i / n, a[1] + (b[1] - a[1]) * i / n)) return true; return false; }
// Build the opt.cust sampler. mode: 'P' population, 'PA' population + strict airport rule, 'UA' uniform + strict airport rule.
// Returns { cust, dropSite, stats }. Sites whose own position is in a 0 ft cell are dropped in the airport arms (dropSite).
function make(siteList, toXY, mode, lat0, lon0) {
  const BG = mode === 'UA' ? null : loadBG(toXY), Z = mode === 'P' ? null : loadZero(lat0, lon0), stats = { draws: 0, rejectAir: 0, fallback: 0, emptySites: 0, dropped: 0 };
  const tab = new Map();
  for (const S of siteList) { if (!BG) continue; const rad = R[S.op], list = [], cum = []; let tot = 0;
    for (const b of BG) { const d = Math.hypot(b.c[0] - S.c[0], b.c[1] - S.c[1]); if (d <= rad + SIG) { tot += b.pop; list.push(b); cum.push(tot); } }
    if (!tot) stats.emptySites++; tab.set(S, { list, cum, tot }); }
  const dropSite = S => !!Z && Z.zeroAt(S.c[0], S.c[1]);
  function uni(S, r) { const rad = R[S.op]; for (;;) { const rr = rad * Math.sqrt(r()), th = 2 * Math.PI * r(); if (rr >= MIN_R) return [S.c[0] + rr * Math.cos(th), S.c[1] + rr * Math.sin(th)]; } }
  function pop(S, r) { const T = tab.get(S); if (!T || !T.tot) { stats.fallback++; return uni(S, r); }
    for (let k = 0; k < 50; k++) { const u = r() * T.tot; let lo = 0, hi = T.cum.length - 1; while (lo < hi) { const m = (lo + hi) >> 1; if (T.cum[m] < u) lo = m + 1; else hi = m; }
      const b = T.list[lo], g1 = Math.sqrt(-2 * Math.log(1 - r())), g2 = 2 * Math.PI * r(), p = [b.c[0] + SIG * g1 * Math.cos(g2), b.c[1] + SIG * g1 * Math.sin(g2)], d = Math.hypot(p[0] - S.c[0], p[1] - S.c[1]);
      if (d >= MIN_R && d <= R[S.op]) return p; }
    stats.fallback++; return uni(S, r); }
  function cust(S, r) { stats.draws++; stats['draws_' + S.op] = (stats['draws_' + S.op] || 0) + 1; const base = BG ? pop : uni; if (!Z) return base(S, r);
    for (let k = 0; k < 50; k++) { const p = base(S, r); if (!crossesZero(Z.zeroAt, S.c, p)) return p; stats.rejectAir++; stats['rej_' + S.op] = (stats['rej_' + S.op] || 0) + 1; }
    stats.fallback++; return base(S, r); }
  return { cust, dropSite, stats, zeroCells: Z ? Z.n : 0 }; }
module.exports = { make, loadBG, loadZero, crossesZero, SIG };
