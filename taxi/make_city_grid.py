"""Bake a 500 m grid of residents (Census 2020 PL 94-171) and jobs (LEHD LODES8 WAC 2022, C000)
around each air-taxi network, in the page's coordinate frame, for the 3D cityscape backdrop.
Inputs: data/census/tx_blocks_2020.csv, data/census/tx_wac_S000_JT00_2022.csv.gz (both public).
Output: taxi/city_grid.json. Display only; no study uses it."""
import csv, gzip, json, math
D = json.load(open('taxi/airtaxi_data.json'))
REF = {'DFW': (33.0, {'AFW': (32.9937909, -97.3100623)}), 'HOU': (29.75, {'IAH': (29.9931058, -95.3416255)})}
OSM = {'DFW': 'city/osm_dallas.json', 'HOU': 'city/osm_houston.json'}
CELL, MARGIN = 500.0, 22000.0
frames = {}
for m, (lat0, one) in REF.items():
    c = math.cos(math.radians(lat0)); sid, (la, lo) = next(iter(one.items()))
    s = next(s for s in D['metros'][m]['sites'] if s['id'] == sid)
    cx = (lo + 97) * 111320 * c - s['x']; cy = (la - 30) * 110574 - s['y']
    xs = [t['x'] for t in D['metros'][m]['sites']]; ys = [t['y'] for t in D['metros'][m]['sites']]
    frames[m] = dict(c=c, cx=cx, cy=cy, x0=min(xs) - MARGIN, x1=max(xs) + MARGIN, y0=min(ys) - MARGIN, y1=max(ys) + MARGIN)
def xy(m, la, lo):
    f = frames[m]; return (lo + 97) * 111320 * f['c'] - f['cx'], (la - 30) * 110574 - f['cy']
grid = {m: {} for m in frames}; blk = {}
for r in csv.DictReader(open('data/census/tx_blocks_2020.csv')):
    la, lo, pop = float(r['lat']), float(r['lon']), int(r['pop'])
    for m, f in frames.items():
        x, y = xy(m, la, lo)
        if f['x0'] <= x <= f['x1'] and f['y0'] <= y <= f['y1']:
            blk[r['geoid']] = (m, x, y); k = (int((x - f['x0']) // CELL), int((y - f['y0']) // CELL)); g = grid[m].setdefault(k, [0, 0]); g[0] += pop
with gzip.open('data/census/tx_wac_S000_JT00_2022.csv.gz', 'rt') as fh:
    for r in csv.DictReader(fh):
        b = blk.get(r['w_geocode'])
        if not b: continue
        m, x, y = b; f = frames[m]; k = (int((x - f['x0']) // CELL), int((y - f['y0']) // CELL)); grid[m].setdefault(k, [0, 0])[1] += int(r['C000'])
out = {'note': 'Display backdrop only. 500 m cells: residents (US Census 2020 PL 94-171) and jobs (US Census LEHD LODES8 2022 WAC).', 'cell': CELL, 'metros': {}}
for m, f in frames.items():
    cells = [[i, j, p, w] for (i, j), (p, w) in grid[m].items() if p + w >= 40]
    o = json.load(open(OSM[m])); dx, dy = xy(m, *o['centre'])
    out['metros'][m] = {'x0': round(f['x0']), 'y0': round(f['y0']), 'cells': cells, 'downtown': [round(dx), round(dy)]}
    print(m, len(cells), 'cells; residents', sum(c[2] for c in cells), 'jobs', sum(c[3] for c in cells), 'downtown', round(dx), round(dy))
json.dump(out, open('taxi/city_grid.json', 'w'), separators=(',', ':'))
