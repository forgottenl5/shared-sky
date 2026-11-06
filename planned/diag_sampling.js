'use strict';
// Exploratory (not registered): does 1-s sampling undercount meetings? Re-time the same flights 4x slower (0.25 s effective step) and count again.
const H2 = require('./houston2.js'), V = require('./valloc.js');
const K = 4; for (const d of [3]) for (const seed of [1]) { const S = H2.sites(d, seed);
  for (const arm of ['A0', 'A2']) { const fl = V.flights(S, seed, V.ARMS[arm]);
    const slow = fl.map(f => ({ id: f.id, op: f.op, t0: f.t0 * K, end: f.end * K, sg: f.sg.map(s => [s[0] * K, s[1] * K, ...s.slice(2)]) }));
    const c1 = H2.count(fl), c4 = H2.count(slow, { warm: 3600 * K, meas: 7200 * K });
    for (const k of ['wide|cross', 'close|cross', 'wide|same', 'close|same']) console.log(arm, k, '1 s:', c1[k] || 0, ' 0.25 s:', c4[k] || 0, ' ratio', ((c4[k] || 0) / (c1[k] || 1)).toFixed(2)); } }
