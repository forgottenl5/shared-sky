'use strict';
// WX1 runner (registration planned/WX1_PREREG.md). node planned/wx1_run.js checks | run   -> out/wx1/results.json
const fs = require('fs'), path = require('path'), W = require('./wind.js');
const F = { houston: ['data/openmeteo_houston_2025.json', 'data/openmeteo_houston_2025_weather.json'], dfw: ['data/openmeteo_dfw_2025.json', 'data/openmeteo_dfw_2025_weather.json'] };
const rd = f => JSON.parse(fs.readFileSync(path.join(__dirname, '..', f), 'utf8')).hourly;
const day = t => { const hr = +t.slice(11, 13); return hr >= 13 || hr <= 3; };
let bad = 0; const ok = (n, c, d) => { console.log(c ? 'ok  ' : 'FAIL', n, JSON.stringify(d)); if (!c) bad++; };
const med = a => { const s = a.slice().sort((x, y) => x - y); return s[Math.floor((s.length - 1) / 2)]; };
const res = {};
for (const m of ['houston', 'dfw']) { const w = rd(F[m][0]), x = rd(F[m][1]);
  const vars = ['precipitation', 'weather_code', 'wind_gusts_10m', 'cloud_cover_low'], miss = vars.reduce((a, v) => a + x[v].filter(q => q === null || q === undefined).length, 0);
  const same = x.time.length === w.time.length && x.time.every((t, i) => t === w.time[i]), D = x.time.map((t, i) => i).filter(i => day(x.time[i]));
  if (process.argv[2] === 'checks') { ok(`K1 ${m} 8760 rows, same timestamps as wind file, no missing`, x.time.length === 8760 && same && miss === 0, [x.time.length, same, miss]); ok(`K2 ${m} daytime hours = 5475`, D.length === 5475, D.length); continue; }
  const P = i => x.precipitation[i], share = f => D.filter(f).length / D.length, th = i => [95, 96, 99].includes(x.weather_code[i]);
  W.useFile(path.join(__dirname, '..', F[m][0])); const band = W.bandHours(0.85, 0.95, 10);
  res[m] = { n: D.length, wet: share(i => P(i) >= 0.1), rain1: share(i => P(i) >= 1), heavy: share(i => P(i) >= 2.5), thunder: share(th), gust40: share(i => x.wind_gusts_10m[i] >= 40), gust55: share(i => x.wind_gusts_10m[i] >= 55),
    hard: share(i => th(i) || x.wind_gusts_10m[i] >= 55 || P(i) >= 2.5), medGustDay: med(D.map(i => x.wind_gusts_10m[i])),
    band: band.map(i => ({ t: x.time[i], p: P(i), code: x.weather_code[i], gust: x.wind_gusts_10m[i], w120: w.wind_speed_120m[i] })), medGustBand: med(band.map(i => x.wind_gusts_10m[i])) }; }
if (process.argv[2] === 'checks') { console.log(bad ? bad + ' FAILED' : 'ALL PASS'); process.exit(bad ? 1 : 0); }
fs.mkdirSync('out/wx1', { recursive: true }); fs.writeFileSync('out/wx1/results.json', JSON.stringify(res, null, 1)); console.log('wrote out/wx1/results.json');
