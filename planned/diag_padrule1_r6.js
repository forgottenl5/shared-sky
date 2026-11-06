// EXPLORATORY (not registered): age of aircraft still waiting for a stand at the end of confirm runs (PADRULE1 R6). Patches a copy of taxi/net5.js in memory. Usage: node planned/diag_padrule1_r6.js
// Exploratory: how long have aircraft in launchQ been waiting at the end of confirm runs?
const fs=require('fs'); let s=fs.readFileSync('<repo>/taxi/net5.js','utf8');
s=s.replace("stillWaitingToLaunch: [...S.values()].reduce((a, s) => a + s.launchQ.length, 0),","stillWaitingToLaunch: [...S.values()].reduce((a, s) => a + s.launchQ.length, 0), waitingDetail: [...S.values()].flatMap(s => s.launchQ.map(w => ({ at: s.id, to: w.to, ageS: END - w.t, minusEnd: END }))),");
const m={exports:{}}; new Function('module','exports','require',s)(m,m.exports,require); const N=m.exports;
const runSrc=fs.readFileSync('<repo>/planned/padrule1_run.js','utf8');
const KM=60*67/1000,U100={rangeKm:100+20*KM,reserveMin:20};
eval(runSrc.match(/const SITES = [\s\S]*?routes: \[\['IAH', 'HOU'\], \['IAH', 'EFD'\]\] } };/)[0].replace('const SITES','globalThis.SITES'));
const P={padZ:15,vLift:2.5,slope:8,vClimb:31,cruiseZ:610,vCruise:67},WARM=7200,HOURS=12;
eval('globalThis.config = '+runSrc.match(/function config[\s\S]*?seed }; }/)[0]);
const fl={}; for (const f of fs.readdirSync('<repo>/out').filter(f=>f.startsWith('airtaxi_net3_fleet_'))) for (const x of JSON.parse(fs.readFileSync('<repo>/out/'+f))) if (x.arm==='U100') fl[[x.metro,x.r,x.s].join('|')]=x.fleet;
const rows=JSON.parse(fs.readFileSync('<repo>/out/padrule1_0.json')).rows;
for (const [metro,r,S] of [['HOU',3,5],['HOU',3,6],['DFW',3,6],['DFW',1.5,4]]) for (let seed=1;seed<=10;seed++) {
  const res=N.simulate(config(metro,r,fl[[metro,r,seed].join('|')],seed,S,'confirm',2)); if(!res.stillWaitingToLaunch) continue;
  console.log(metro,r,'S'+S,'seed',seed,'waiting',res.stillWaitingToLaunch,'ages(min)',res.waitingDetail.map(w=>w.at+'>'+w.to+':'+Math.round(w.ageS/60)).join(' '),'swaps',res.swaps,'deferred',res.deferred);
}
