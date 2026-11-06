'use strict';
// CORRIDOR study: registered-path model. Each Amazon site has K departure corridors at bearings th0 + 2*pi*k/K (math angle, x east, y north);
// a customer uses the corridor nearest its bearing; the flight goes site -> via point at distance D along that corridor -> customer, and back the same way.
function viaFn(K, D, th0of) { return (S, cust) => { const th = Math.atan2(cust[1] - S.c[1], cust[0] - S.c[0]), t0 = th0of(S), step = 2 * Math.PI / K;
  const k = Math.round((((th - t0) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI) / step) % K, a = t0 + k * step; return [S.c[0] + D * Math.cos(a), S.c[1] + D * Math.sin(a)]; }; }
module.exports = { viaFn };
