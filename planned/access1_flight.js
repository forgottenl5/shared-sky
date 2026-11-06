'use strict';
// ACCESS1: sites and engine flight times between them. Usage: node planned/access1_flight.js > out/access1_sites.json
const N = require('../taxi/net2.js');
const P = { padZ: 15, vLift: 2.5, slope: 8, vClimb: 31, cruiseZ: 610, vCruise: 67 };   // as AIRTAXI_NET2
const METROS = {
  DFW: { lat0: 33.0, sites: [['DFW', 'Dallas Fort Worth Intl', 32.896801, -97.038002], ['DAL', 'Dallas Love Field', 32.844776, -96.847653], ['ADS', 'Addison', 32.9686012268, -96.8364028931],
    ['GKY', 'Arlington Municipal', 32.66389846801758, -97.09429931640625], ['FTW', 'Fort Worth Meacham', 32.819919, -97.360818], ['AFW', 'Fort Worth Alliance', 32.99044, -97.31947]] },
  HOU: { lat0: 29.75, sites: [['IAH', 'Bush Intercontinental', 29.9844, -95.3414], ['HOU', 'Hobby', 29.645336, -95.276812], ['SGR', 'Sugar Land Regional', 29.622299194336, -95.65650177002],
    ['GLS', 'Galveston (Scholes, assumed)', 29.265301, -94.860397]] } };
// ACCESS1b addendum (descriptive): A1_ADDENDUM=1 adds the two sites whose coordinates the founder hand-read from Google Maps on 27 Oct 2026.
if (process.env.A1_ADDENDUM === '1') {
  METROS.DFW.sites.push(['FRS', 'Frisco Station (point in development; pad not public)', 33.11296089149642, -96.8277353946615]);
  METROS.HOU.sites.push(['THO', 'Thompson Hotel helipad', 29.760414824829493, -95.38212908531595]); }
const out = { profile: P, metros: {} };
for (const [m, M] of Object.entries(METROS)) {
  const c = Math.cos(M.lat0 * Math.PI / 180), xy = s => [(s[3] + 97) * 111320 * c, (s[2] - 30) * 110574];
  const F = M.sites.map(a => M.sites.map(b => { if (a === b) return 0; const A = xy(a), B = xy(b); const D = Math.hypot(A[0] - B[0], A[1] - B[1]); return N.flightTime(D, P).total / 60; }));
  out.metros[m] = { lat0: M.lat0, sites: M.sites.map(s => ({ id: s[0], name: s[1], lat: s[2], lon: s[3] })), flightMin: F };
}
console.log(JSON.stringify(out));
