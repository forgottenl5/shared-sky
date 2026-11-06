'use strict';
// Diagnosis before PROC_PREREG: where do A2's remaining cross-operator meetings happen? (A2 arm, wide 30/10 m)
const V = require('./valloc.js'), H2 = require('./houston2.js');
const out = {};
for (const d of [2, 3, 4]) for (const seed of [1, 2, 3]) {
  const S = H2.sites(d, seed), fl = V.flights(S, seed, V.ARMS.A2), segAt = (f, t) => f.sg.find(s => t >= s[0] && t < s[0] + s[1]);
  const role = (f, t) => { const sg = segAt(f, t), i = f.sg.indexOf(sg), first = f.sg[0], last = f.sg[f.sg.length - 1];
    if (sg[8] !== 'vertical') return sg[8];
    const atStart = Math.hypot(sg[2] - first[2], sg[3] - first[3]) < 700 && sg[9] !== 'in' ? 'site-climb' : null, atEnd = Math.hypot(sg[5] - last[5], sg[6] - last[6]) < 700 && sg[9] === 'in' ? 'site-descent' : null;
    return atStart || atEnd || 'customer-vertical'; };
  H2.count(fl, { onMeet: (nm, A, B, t) => { if (nm !== 'wide' || A[1] === B[1]) return; const ra = A[1] + ':' + role(fl[A[0]], t), rb = B[1] + ':' + role(fl[B[0]], t), k = `d${d}|` + [ra, rb].sort().join(' x '); out[k] = (out[k] || 0) + 1;
    const dmin = Math.min(...S.map(s => Math.hypot(s.c[0] - A[2], s.c[1] - A[3]))), kk = `d${d}|nearest site ` + (dmin < 300 ? '<300m' : dmin < 1000 ? '300-1000m' : '>1km'); out[kk] = (out[kk] || 0) + 1; } });
}
for (const k of Object.keys(out).sort()) console.log(k, out[k]);
