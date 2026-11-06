'use strict';
// DFWBUILD: staged DFW build-out. Amazon's 6 geocoded DFW sites (dfwreal.js) open in a fixed order: STX8 Richardson (flying since Dec 2025) first, then the Texas EA list order.
// Wing (cap 75, 400/day) and Zipline (cap 75, 400/day per site, DFW EA) positions are not public: uniform at random in the counted square, nested across stages (stream seed + 51,413).
// No "today" stage: neither company publishes its operating DFW site list or count (DroneXL trackers, 20-22 Oct 2026).
const L = require('../lab/lab_engine.js'), DR = require('./dfwreal.js');
const AMZ_ORDER = ['STX8', 'STX2', 'STX3', 'DAL3', 'DFW7', 'FTW4'];
const STAGES = { early: { wing: 19, zipline: 19, amazon: 2, vol: 0.5 }, mid: { wing: 38, zipline: 38, amazon: 3, vol: 0.75 }, full: { wing: 75, zipline: 75, amazon: 6, vol: 1 } };
const RATE = { wing: 400 / 15, amazon: 1000 / 16.5, zipline: 400 / 15 };
function sites(cfg, seed, stage) { const st = STAGES[stage], r = L.rng(seed + 51413), out = [];
  for (const code of AMZ_ORDER.slice(0, st.amazon)) { const a = DR.AMAZON.find(x => x[0] === code); out.push({ op: 'amazon', code, c: DR.toXY(a[1], a[2]) }); }
  const ex = { wing: [], zipline: [] }; for (const op of ['wing', 'zipline']) for (let k = 0; k < 75; k++) ex[op].push([(r() - 0.5) * 2 * cfg.zone, (r() - 0.5) * 2 * cfg.zone]);
  for (const op of ['wing', 'zipline']) ex[op].slice(0, st[op]).forEach((c, k) => out.push({ op, code: op[0].toUpperCase() + '+' + k, c }));
  for (const s of out) s.rate = RATE[s.op] * st.vol; return out; }
module.exports = { AMZ_ORDER, STAGES, sites };
