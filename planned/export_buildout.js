'use strict';
// Export BUILDOUT stage layouts (seed 1) and pooled results for the city page's Build-out tab.
const fs = require('fs'), METRO = process.env.METRO || 'hou', B = require(METRO === 'dfw' ? './dfwbuild.js' : './buildout.js'), out = process.argv[2];
const DIR = METRO === 'dfw' ? 'out/dfwbuild' : 'out/buildout', cfg = { zone: METRO === 'dfw' ? 40000 : 42000 }, R = fs.readdirSync(DIR).flatMap(f => fs.readFileSync(DIR + '/' + f, 'utf8').trim().split('\n').map(JSON.parse));
const ST = METRO === 'dfw' ? ['early', 'mid', 'full'] : ['today', 'early', 'mid', 'full'], AR = ['A0', 'R', 'A2'], DRm = require('./dfwreal.js'), toXY = METRO === 'dfw' ? DRm.toXY : B.toXY, data = { metro: METRO, zoneKm: METRO === 'dfw' ? 80 : 84, stages: {}, centre: (METRO === 'dfw' ? toXY(32.7767, -96.7970) : toXY(29.7604, -95.3698)).map(v => +(v / 1000).toFixed(1)) };
for (const st of ST) { const S = B.sites(cfg, 1, st), real = s => /^WM|Cypress|HOU6|SAHx|STX5|HOU2|STX4|STX8|STX2|STX3|DAL3|DFW7|FTW4/.test(s.code || '') && !/^W\+|^Z\+/.test(s.code);
  const res = {}; for (const a of AR) { const g = v => R.filter(r => r.stage === st && r.arm === a && r.variant === v), hrs = v => 2 * g(v).length;
    const nc = g('still5').reduce((t, r) => t + r.noCheck.w, 0) / hrs('still5'), cell = v => { const rows = g(v), ck = rows.reduce((t, r) => t + r.check.checked, 0), dl = rows.reduce((t, r) => t + r.check.delayed, 0);
      return { perHour: +(rows.reduce((t, r) => t + r.afterCheck.w, 0) / hrs(v)).toFixed(2), delayedPct: +(100 * dl / Math.max(1, ck)).toFixed(1) }; };
    res[a] = { none: { perHour: +nc.toFixed(2), delayedPct: 0 }, still5: cell('still5'), wind5: cell('wind5'), wind30: cell('wind30') }; }
  data.stages[st] = { counts: B.STAGES[st], sites: S.map(s => [s.op[0], +(s.c[0] / 1000).toFixed(1), +(s.c[1] / 1000).toFixed(1), real(s) ? 1 : 0]), res }; }
fs.writeFileSync(out, JSON.stringify(data)); console.log('bytes', fs.statSync(out).size, JSON.stringify(data.stages.full.res.A0), JSON.stringify(data.stages.mid.res.A2));
