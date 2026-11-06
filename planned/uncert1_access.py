"""UNCERT1 access headline (registration planned/UNCERT1_PREREG.md). Usage: python3 -I planned/uncert1_access.py check | run  -> out/uncert1_access.json
Same model as planned/access1_run.py (12 sites = out/access1b_sites.json); the only change is the four drawn inputs f, g, h, P."""
import json, math, sys
import numpy as np, pandas as pd
SITES = json.load(open('out/access1b_sites.json')); DR = json.load(open('planned/uncert1_draws.json'))['access']
CTY = {'DFW': [85, 113, 121, 139, 231, 251, 257, 367, 397, 439, 497], 'HOU': [15, 39, 71, 157, 167, 201, 291, 339, 473]}
A1 = json.load(open('out/access1b_v1.json')); c0, vpk = A1['calibration']['c'], A1['calibration']['v_peak']
B = pd.read_csv('data/census/tx_blocks_2020.csv', dtype={'geoid': np.int64}).sort_values('geoid').reset_index(drop=True); geo = B['geoid'].values
OD = pd.read_csv('data/census/tx_od_main_JT00_2022.csv.gz', usecols=['w_geocode', 'h_geocode', 'S000'], dtype={'w_geocode': np.int64, 'h_geocode': np.int64})
def idx_of(g): i = np.clip(np.searchsorted(geo, g), 0, len(geo) - 1); return i, geo[i] == g
M = {}
for m in ('DFW', 'HOU'):
    S = SITES['metros'][m]; sites = S['sites']; F = np.array(S['flightMin']); ns = len(sites); cty = np.array(CTY[m], dtype=np.int64)
    sel = (OD['h_geocode'] // 10**10 - 48000).isin(cty) & (OD['w_geocode'] // 10**10 - 48000).isin(cty); od = OD[sel].reset_index(drop=True)
    hi, hok = idx_of(od['h_geocode'].values); wi, wok = idx_of(od['w_geocode'].values); k = hok & wok; od = od[k].reset_index(drop=True); hi, wi = hi[k], wi[k]
    c = math.cos(S['lat0'] * math.pi / 180); X = (B['lon'].values + 97) * 111320 * c / 1000; Y = (B['lat'].values - 30) * 110574 / 1000
    sx = np.array([(s['lon'] + 97) * 111320 * c / 1000 for s in sites]); sy = np.array([(s['lat'] - 30) * 110574 / 1000 for s in sites])
    Dsite = np.hypot(X[:, None] - sx[None, :], Y[:, None] - sy[None, :]); dhw = np.hypot(X[hi] - X[wi], Y[hi] - Y[wi]); w = od['S000'].values.astype(float)
    inb = np.isin(geo // 10**10 - 48000, cty); used = np.unique(np.concatenate([hi, wi]))
    M[m] = dict(ns=ns, F=F, Dsite=Dsite, dhw=dhw, w=w, hi=hi, wi=wi)
def share(m, f, g, h, P, T=10):
    d = M[m]; c = c0 * h; drive = c * d['dhw'] / (vpk * g) * 60; acc = c * d['Dsite'] / (vpk * f) * 60; aH, aW = acc[d['hi']], acc[d['wi']]
    best = np.full(len(drive), np.inf)
    for a in range(d['ns']):
        for b in range(d['ns']):
            if a != b: best = np.minimum(best, aH[:, a] + aW[:, b] + P + d['F'][a, b])
    return float(d['w'][(drive - best) >= T].sum() / d['w'].sum())
if sys.argv[1] == 'check':
    ok = True
    for m in ('DFW', 'HOU'):
        s = share(m, 1, 1, 1, 20); ref = A1['metros'][m]['scen']['peak_P20_T10']['share']; print(m, s, ref); ok &= abs(s - ref) < 1e-9
    print('K1', 'PASS' if ok else 'FAIL'); sys.exit(0 if ok else 1)
out = {'draws': DR, 'share': {m: [] for m in M}}
for i in range(len(DR['f'])):
    for m in M: out['share'][m].append(share(m, DR['f'][i], DR['g'][i], DR['h'][i], DR['P'][i]))
    if i % 10 == 9: print('draw', i + 1, flush=True)
json.dump(out, open('out/uncert1_access.json', 'w')); print('done')
