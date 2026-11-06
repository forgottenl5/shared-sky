"""ACCESS1 runner (see planned/ACCESS1_PREREG.md). Usage: python3 -I planned/access1_run.py   (writes out/access1.json)"""
import json, math, sys, gzip, csv, os
import numpy as np, pandas as pd
import os
SITES = json.load(open(os.environ.get('A1_SITES', 'out/access1_sites.json')))
CTY = {'DFW': [85, 113, 121, 139, 231, 251, 257, 367, 397, 439, 497], 'HOU': [15, 39, 71, 157, 167, 201, 291, 339, 473]}
OLD = {'DFW': (32.9133576, -97.0355091), 'AFW': (32.9937909, -97.3100623), 'DFWc': (32.9133576, -97.0355091), 'TOY': (33.0811809, -96.841015), '49T': (32.772891, -96.8024551),
       'IAH': (29.9931058, -95.3416255), 'HOU': (29.6459141, -95.2768951), 'EFD': (29.6073333, -95.15875)}
LAT0 = {'AFW': 33.0, 'DFW': 33.0, 'DFWc': 33.0, 'TOY': 33.0, '49T': 33.0, 'IAH': 29.75, 'HOU': 29.75, 'EFD': 29.75}
def xy(lat, lon, lat0):
    c = math.cos(lat0 * math.pi / 180); return (lon + 97) * 111320 * c / 1000, (lat - 30) * 110574 / 1000   # km
def dkm(a, b, lat0):
    A, B = xy(*a, lat0), xy(*b, lat0); return math.hypot(A[0] - B[0], A[1] - B[1])
def acc_min(d_km, c, v): return c * d_km / v * 60
bad = 0
def check(name, ok, msg=''):
    global bad; print(('ok   ' if ok else 'FAIL ') + name, msg); bad += (not ok)

# ---- calibration from the hand-typed Google table
cs, vp, vo = [], [], []
for ln in open('taxi/data/drive_times_raw.tsv'):
    if ln.startswith('#') or ln.startswith('from\t'): continue
    f = ln.rstrip('\n').split('\t'); a, b, t, lo, hi, mi = f[0], f[1], f[2], float(f[3]), float(f[4]), float(f[5])
    road = mi * 1.609344; s = dkm(OLD[a], OLD[b], LAT0[a]); cs.append(road / s); v = road / ((lo + hi) / 2 / 60)
    (vo if t == '12:00' else vp).append(v)
c, v_peak, v_off = float(np.median(cs)), float(np.median(vp)), float(np.median(vo))
print(f'calibration: c={c:.3f} (n={len(cs)}), v_peak={v_peak:.1f} km/h (n={len(vp)}), v_off={v_off:.1f} km/h (n={len(vo)})')
check('K4 calibration ranges', 1.1 <= c <= 1.5 and 30 <= v_peak <= 90 and 30 <= v_off <= 90 and v_off > v_peak)
# ---- K3: hand-computed pair. c=1.3, v=50 km/h, 10 km from site A, 0 km from site B, P=20, F=9 min: 1.3*10/50*60 = 15.6; 15.6+0+20+9 = 44.6
check('K3 hand pair', abs(acc_min(10, 1.3, 50) - 15.6) < 0.01 and abs(acc_min(10, 1.3, 50) + acc_min(0, 1.3, 50) + 20 + 9 - 44.6) < 0.01)

# ---- data
B = pd.read_csv('data/census/tx_blocks_2020.csv', dtype={'geoid': np.int64}).sort_values('geoid').reset_index(drop=True)
check('K1 population total', int(B['pop'].sum()) == 29145505, str(int(B['pop'].sum())))
OD = pd.read_csv('data/census/tx_od_main_JT00_2022.csv.gz', usecols=['w_geocode', 'h_geocode', 'S000', 'SE03'], dtype={'w_geocode': np.int64, 'h_geocode': np.int64})
WAC = pd.read_csv('data/census/tx_wac_S000_JT00_2022.csv.gz', usecols=['w_geocode', 'C000'], dtype={'w_geocode': np.int64})
geo = B['geoid'].values
def idx_of(g):
    i = np.searchsorted(geo, g); i = np.clip(i, 0, len(geo) - 1); return i, geo[i] == g
OUT = {'calibration': {'c': c, 'v_peak': v_peak, 'v_off': v_off, 'n_c': len(cs), 'n_vpeak': len(vp), 'n_voff': len(vo)}, 'metros': {}}
minOK = 1.0
for m in ('DFW', 'HOU'):
    S = SITES['metros'][m]; lat0 = S['lat0']; sites = S['sites']; F = np.array(S['flightMin']); ns = len(sites)
    cty = np.array(CTY[m], dtype=np.int64)
    odc_h, odc_w = OD['h_geocode'] // 10**10 - 48000, OD['w_geocode'] // 10**10 - 48000
    sel = odc_h.isin(cty) & odc_w.isin(cty); od = OD[sel].reset_index(drop=True)
    hi, hok = idx_of(od['h_geocode'].values); wi, wok = idx_of(od['w_geocode'].values)
    frac = float(od.loc[hok & wok, 'S000'].sum() / od['S000'].sum()); minOK = min(minOK, frac)
    od = od[hok & wok].reset_index(drop=True); hi, wi = hi[hok & wok], wi[hok & wok]
    c0 = math.cos(lat0 * math.pi / 180)
    X = (B['lon'].values + 97) * 111320 * c0 / 1000; Y = (B['lat'].values - 30) * 110574 / 1000
    sx = np.array([(s['lon'] + 97) * 111320 * c0 / 1000 for s in sites]); sy = np.array([(s['lat'] - 30) * 110574 / 1000 for s in sites])
    Dsite = np.hypot(X[:, None] - sx[None, :], Y[:, None] - sy[None, :])          # blocks x sites, km
    w = od['S000'].values.astype(float); se3 = od['SE03'].values.astype(float)
    dhw = np.hypot(X[hi] - X[wi], Y[hi] - Y[wi])                                    # straight-line commute, km
    def wmedian(x, ww):
        o = np.argsort(x); cw = np.cumsum(ww[o]); return float(x[o][np.searchsorted(cw, cw[-1] / 2)]) if len(x) else None
    R = {'jobs_all': float(w.sum()), 'se03_all': float(se3.sum() / w.sum()), 'median_km_all': wmedian(dhw, w), 'rows': int(len(od)), 'matched_frac': frac, 'scen': {}, 'sites': [s['id'] for s in sites]}
    for sname, v in (('peak', v_peak), ('off', v_off)):
        drive = c * dhw / v * 60; acc = acc_min(Dsite, c, v * float(os.environ.get('A1_ACCESS_V_FACTOR', '1')))   # factor 1 = registered run; other values are exploratory
        for P in (10, 20, 30):
            best = np.full(len(od), np.inf); bi = np.zeros(len(od), dtype=np.int16)
            aH, aW = acc[hi], acc[wi]
            for a in range(ns):
                for b in range(ns):
                    if a == b: continue
                    t = aH[:, a] + aW[:, b] + P + F[a, b]; m_ = t < best; best = np.where(m_, t, best); bi = np.where(m_, a * ns + b, bi)
            sav = drive - best
            for T in (0, 10, 20):
                ben = sav >= T; jb = float(w[ben].sum())
                pairs = {}
                for k in np.unique(bi[ben]): pairs[f'{sites[k // ns]["id"]}-{sites[k % ns]["id"]}'] = float(w[ben & (bi == k)].sum())
                R['scen'][f'{sname}_P{P}_T{T}'] = {'jobs_benefit': jb, 'share': jb / w.sum(), 'median_km': wmedian(dhw[ben], w[ben]) if ben.any() else None,
                    'se03': float(se3[ben].sum() / w[ben].sum()) if ben.any() else None, 'median_saving_min': wmedian(sav[ben], w[ben]) if ben.any() else None,
                    'pairs': dict(sorted(pairs.items(), key=lambda kv: -kv[1])[:10])}
    # catchment (peak speed), residents in the metro's counties
    inb = np.isin(B['geoid'].values // 10**10 - 48000, cty); accb = acc_min(Dsite, c, v_peak)
    wj = WAC.set_index('w_geocode')['C000']; jobs_b = np.zeros(len(B)); ji, jok = idx_of(wj.index.values); np.add.at(jobs_b, ji[jok], wj.values[jok])
    popb = B['pop'].values.astype(float)
    R['pop_total'] = float(popb[inb].sum()); R['jobs_total_wac'] = float(jobs_b[inb].sum()); R['catch'] = {}
    for lim in (15, 30):
        anyin = inb & (accb.min(axis=1) <= lim)
        R['catch'][str(lim)] = {'pop_any': float(popb[anyin].sum()), 'jobs_any': float(jobs_b[anyin].sum()),
            'per_site': {sites[j]['id']: {'pop': float(popb[inb & (accb[:, j] <= lim)].sum()), 'jobs': float(jobs_b[inb & (accb[:, j] <= lim)].sum())} for j in range(ns)}}
    OUT['metros'][m] = R
    print(m, 'rows', len(od), 'matched', round(frac, 5), 'primary share', round(R['scen']['peak_P20_T10']['share'], 5))
check('K2 OD rows matched', minOK >= 0.999, f'min {minOK:.5f}')
OUT['checks_failed'] = bad
json.dump(OUT, open(os.environ.get('A1_OUT', 'out/access1.json'), 'w'))
print('checks failed:', bad)
