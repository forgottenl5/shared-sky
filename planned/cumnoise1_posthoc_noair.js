// CUMNOISE1 post-hoc check (26 Nov, after the results; NOT pre-registered): the same 12 runs with airport detours switched off (factor air = false).
//   node planned/cumnoise1_posthoc_noair.js <out.json>
const path=require('path');const req=require('module').createRequire(path.resolve('planned/x.js'));
const RO=req('./realops.js');const F0=RO.flights;RO.flights=(c,S,s,A,o)=>F0(c,S,s,A,Object.assign({},o,{factors:Object.assign({},o.factors,{air:false})}));
const C=req('./cumnoise1_run.js');const fs=require('fs');const out=[];
for(const j of C.J){const r=C.run(...j);delete r.top;out.push(r);console.log(j.join(' '),'max',r.dist.all.max,'p999',r.dist.all.p999,'dnl',r.dnl.max,'ge500',r.ge['500'],'ge1150',r.ge['1150'],'two',(r.overflownBy.two/r.overflownBy.one).toFixed(2), 'detours',r.stats.detour);}
fs.writeFileSync(process.argv[2],JSON.stringify(out));
