'use strict';
// Exploratory diagnosis after VRATE (not registered): which operator blocks each delayed flight's first try (V0, d = 3, seed 7).
// Note: the first try stops at the first blocking sample, so each delayed flight records one blocker.
const VR = require('./vrate.js'), F = require('./fair.js'), H2 = require('./houston2.js');
const S = H2.sites(3, 7), fl = VR.flights(S, 7, 'V0'), rec = {}, ic = F.intentCheck(fl, 'fifo', rec), ic2 = F.intentCheck(VR.flights(S, 7, 'V0'), 'fifo');
let same = true; for (const [id, D] of ic2.delays) if (ic.delays.get(id) !== D) same = false; console.log('recorder leaves results unchanged:', same);
const NAME = ['wing', 'amazon', 'zipline'], opOf = new Map(fl.map(f => [f.id, f.op])), tab = {}, n = {};
for (const [id] of ic.delays) { const o = opOf.get(id); n[o] = (n[o] || 0) + 1; }
for (const [id, set] of Object.entries(rec)) { const o = opOf.get(+id); for (const b of set) { const k = o + ' delayed by ' + NAME[b]; tab[k] = (tab[k] || 0) + 1; } }
console.log('checked flights', n); for (const k of Object.keys(tab).sort()) console.log(' ', k, tab[k]);
// per unordered pair: who waited
const pairs = {}; for (const [k, v] of Object.entries(tab)) { const [a, , , b] = k.split(' '), key = [a, b].sort().join('-'); (pairs[key] || (pairs[key] = {}))[a] = v; }
for (const [k, v] of Object.entries(pairs)) console.log(' pair', k, JSON.stringify(v));
