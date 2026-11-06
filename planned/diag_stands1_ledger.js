'use strict';
// EXPLORATORY (not registered), STANDS1 diagnosis: with unlimited stands (UNL, engine v4), the peak of each site's stand ledger (maxHeld),
// i.e. the most aircraft parked or with a stand reserved at once. Compared with NET1's 6 (5 at 49T). Same configs as planned/stands1_run.js.
// Usage: node planned/diag_stands1_ledger.js > out/diag_stands1_ledger.json
const fs = require('fs'), path = require('path'), N4 = require('../taxi/net4.js');
const src = fs.readFileSync(path.join(__dirname, 'stands1_run.js'), 'utf8');
const KM = 60 * 67 / 1000, U100 = { rangeKm: 100 + 20 * KM, reserveMin: 20 };
eval(src.match(/const SITES = [\s\S]*?routes: \[\['IAH', 'HOU'\], \['IAH', 'EFD'\]\] } };/)[0].replace('const SITES', 'globalThis.SITES'));
const P = { padZ: 15, vLift: 2.5, slope: 8, vClimb: 31, cruiseZ: 610, vCruise: 67 }, WARM = 7200, HOURS = 12;
eval('globalThis.config = ' + src.match(/function config[\s\S]*?seed }, placed: used, cap }; }/)[0]);
const fl = {}; for (const f of fs.readdirSync('out').filter(f => f.startsWith('airtaxi_net3_fleet_'))) for (const x of JSON.parse(fs.readFileSync('out/' + f))) if (x.arm === 'U100') fl[[x.metro, x.r, x.s].join('|')] = x.fleet;
const rows = [];
for (const metro of ['DFW', 'HOU']) for (const r of [1.5, 3, 6, 12]) for (let s = 1; s <= 10; s++) {
  const F = fl[[metro, r, s].join('|')], c = config(metro, r, F, s, SITES[metro].list.map(() => undefined)), res = N4.simulate(c.cfg);
  rows.push({ metro, r, s, F, peak: Object.fromEntries(res.sites.map(x => [x.id, x.maxHeld])) }); }
console.log(JSON.stringify(rows));
