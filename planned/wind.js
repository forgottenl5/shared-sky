'use strict';
// WIND study: fly planned tracks in real Houston wind (Open-Meteo 2025 hourly, data/openmeteo_houston_2025.json).
// Paths and heights are unchanged; each segment with horizontal motion is re-timed by its ground speed (the drone crabs to hold its track):
// g = w_along + sqrt(V^2 - w_cross^2), V = the segment's planned airspeed (length / planned duration). Vertical and hover segments keep their duration.
const fs = require('fs'), path = require('path'), L = require('../lab/lab_engine.js');
let W = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/openmeteo_houston_2025.json'), 'utf8')).hourly;
function useFile(f) { W = JSON.parse(fs.readFileSync(f, 'utf8')).hourly; }
function hourWind(i) { return { s: [[10, W.wind_speed_10m[i]], [80, W.wind_speed_80m[i]], [120, W.wind_speed_120m[i]], [180, W.wind_speed_180m[i]]], d80: W.wind_direction_80m[i], d120: W.wind_direction_120m[i], time: W.time[i] }; }
function windAt(h, z) { const s = h.s; let sp; if (z <= s[0][0]) sp = s[0][1]; else if (z >= s[3][0]) sp = s[3][1]; else for (let k = 0; k < 3; k++) if (z <= s[k + 1][0]) { sp = s[k][1] + (s[k + 1][1] - s[k][1]) * (z - s[k][0]) / (s[k + 1][0] - s[k][0]); break; }
  const dir = (z < 100 ? h.d80 : h.d120) * Math.PI / 180; return [-sp * Math.sin(dir), -sp * Math.cos(dir)]; }   // meteorological "from" direction -> vector toward (x east, y north)
function retime(f, h) { let t = f.sg[0][0]; const sg = [];
  for (const s of f.sg) { const dx = s[5] - s[2], dy = s[6] - s[3], Lh = Math.hypot(dx, dy); let n = s[1];
    if (Lh > 1 && s[8] !== 'hover') { const V = Lh / s[1], ux = dx / Lh, uy = dy / Lh, w = windAt(h, (s[4] + s[7]) / 2), wa = w[0] * ux + w[1] * uy, wc = -w[0] * uy + w[1] * ux;
      const g = wa + Math.sqrt(Math.max(0, V * V - wc * wc)); n = Math.max(1, Math.round(Lh / Math.max(1, g))); }
    sg.push([t, n, s[2], s[3], s[4], s[5], s[6], s[7], s[8], s[9]]); t += n; }
  return { id: f.id, op: f.op, t0: f.t0, sg, end: t }; }
// Study hours: daytime (13:00–03:00 UTC = 7 a.m.–9 p.m. Houston CST/CDT approx.) hours of 2025 closest to the 50th, 90th and 99th percentile of 120 m wind speed.
function studyHours() { const idx = W.time.map((t, i) => i).filter(i => { const hr = +W.time[i].slice(11, 13); return hr >= 13 || hr <= 3; });
  const sp = idx.map(i => W.wind_speed_120m[i]).slice().sort((a, b) => a - b), pick = q => { const v = sp[Math.floor(q * (sp.length - 1))]; let best = idx[0]; for (const i of idx) if (Math.abs(W.wind_speed_120m[i] - v) < Math.abs(W.wind_speed_120m[best] - v)) best = i; return best; };
  return { p50: pick(0.5), p90: pick(0.9), p99: pick(0.99) }; }
// WIND20: n daytime hours whose 120 m speed lies in the percentile band [lo, hi] of daytime hours, picked by a fixed hash order (deterministic).
function bandHours(lo, hi, n) { const idx = W.time.map((t, i) => i).filter(i => { const hr = +W.time[i].slice(11, 13); return hr >= 13 || hr <= 3; });
  const sp = idx.map(i => W.wind_speed_120m[i]).slice().sort((a, b) => a - b), vlo = sp[Math.floor(lo * (sp.length - 1))], vhi = sp[Math.floor(hi * (sp.length - 1))];
  const hash = i => ((i * 2654435761) >>> 0) / 4294967296; return idx.filter(i => W.wind_speed_120m[i] >= vlo && W.wind_speed_120m[i] <= vhi).sort((a, b) => hash(a) - hash(b)).slice(0, n); }
module.exports = { hourWind, windAt, retime, studyHours, bandHours, useFile };
