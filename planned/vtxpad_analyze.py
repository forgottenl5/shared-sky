import json, statistics as st
R=[json.loads(l) for l in open('out/vtxpad/runs.jsonl')]
tot=lambda d: sum(d.values())
def med(stage,pt,r): return st.median(tot(x['res'][pt]['pass'][str(r)]) for x in R if x['stage']==stage)
def rng(stage,pt,r): v=[tot(x['res'][pt]['pass'][str(r)]) for x in R if x['stage']==stage]; return min(v),max(v)
print('## Drone flights passing per hour (median over 10 seeds; range)')
print('| Point | Stage | within 1 km | within 300 m | drones inside 1 km at a random moment | Wing / Zipline / Amazon share at 1 km |'); print('|---|---|---|---|---|---|')
for pt in ['TOY','AFW','DFW']:
  for sg in ['early','mid','full']:
    X=[x for x in R if x['stage']==sg]; ops={o:sum(x['res'][pt]['pass']['1000'].get(o,0) for x in X) for o in ['wing','zipline','amazon']}; T=sum(ops.values()) or 1
    a,b=rng(sg,pt,1000); c,d=rng(sg,pt,300); occ=st.median(x['res'][pt]['occ'] for x in X)
    print(f"| {pt} | {sg} | {med(sg,pt,1000):.1f} ({a:.1f}–{b:.1f}) | {med(sg,pt,300):.1f} ({c:.1f}–{d:.1f}) | {occ:.2f} | {100*ops['wing']/T:.0f} / {100*ops['zipline']/T:.0f} / {100*ops['amazon']/T:.0f} % |")
F=[x for x in R if x['stage']=='full']; ring=[st.median(tot(x['res'][f'TOY_{k}']['pass']['1000']) for x in F) for k in range(8)]
print(f"\nTOY position sensitivity (full, 1 km, medians at 8 points 500 m away): {min(ring):.1f}–{max(ring):.1f} (centre {med('full','TOY',1000):.1f})")
amz=max(x['res']['TOY']['pass'][r].get('amazon',0) for x in R for r in ['300','1000'])
v1=med('full','TOY',1000); v2=med('full','TOY',300); v4=med('early','TOY',1000)/v1 if v1 else float('nan')
print('\n| Prediction | Result | Verdict |\n|---|---|---|')
for n,res,ok in [('V1 TOY full 1 km median 5–40 an hour',f'{v1:.1f}',5<=v1<=40),('V2 TOY full 300 m median 1–12',f'{v2:.1f}',1<=v2<=12),('V3 Amazon passes at TOY 0 everywhere',f'max {amz}',amz==0),('V4 early <= 25 % of full (TOY 1 km)',f'{100*v4:.0f} %',v4<=0.25)]:
  print(f"| {n} | {res} | **{'PASS' if ok else 'FAIL'}** |")
print(f'Runs read: {len(R)} (expected 30).')
