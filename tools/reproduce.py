#!/usr/bin/env python3
"""Reproduce the Shared Sky study record in a clean copy of the committed repo.

  python3 tools/reproduce.py            # steps 1-3 (a few minutes)
  python3 tools/reproduce.py --rerun    # also re-runs a few fast studies end to end and compares their raw output

Step 1  every pre-registration fingerprint (planned/verify_prereg.py)
Step 2  every analysis script re-run on the committed raw outputs (planned/raw/out_snapshot.tar.xz); each generated
        results table must be byte-identical to the committed one, and each script's printed output must equal its
        committed snapshot in planned/repro/stdout/
Step 3  the scorecard (lab/studies.json) totals must match the counts printed on the built pages
Step 4  (--rerun) selected simulations re-run from scratch; their raw output must be byte-identical to the snapshot

What this proves: the committed analyses and tables follow from the committed raw outputs, the registrations are
unchanged, and (step 4) that the simulations are deterministic. It does NOT re-run every simulation (that takes many
hours); use each runner's own instructions for that.
Writes planned/repro/REPORT.md. Exit code 0 only if everything passes.
"""
import glob, hashlib, json, os, re, shutil, subprocess, sys, tarfile, tempfile, datetime
ROOT = subprocess.run(['git', 'rev-parse', '--show-toplevel'], capture_output=True, text=True, check=True).stdout.strip()
HEAD = subprocess.run(['git', '-C', ROOT, 'rev-parse', '--short', 'HEAD'], capture_output=True, text=True, check=True).stdout.strip()
SNAP = os.path.join(ROOT, 'planned', 'repro', 'stdout')
ARGS = {'wind20': [['dfw'], ['hou']]}          # analyses that take arguments
RERUN = [  # (label, command, raw output that must come out byte-identical)
    ('AIRTAXI_ROUTE1', ['node', 'planned/airtaxi_route1_run.js', 'run'], 'out/airtaxi_route1.json'),
    ('VERTIPORT1', ['node', 'planned/vertiport1_run.js', 'run'], 'out/vertiport1.jsonl'),
    ('RECOUNT1 (sub 1, seeds 22-24)', ['node', 'planned/recount1_run.js', '1', '22', '24'], 'out/recount1_sub1_22-24.json'),
    ('Shared-sky page data (checks itself against AIRTAXI1)', ['node', 'taxi/export_shared.js'], 'taxi/shared_data.json'),
]
update = '--update-snapshots' in sys.argv; rerun = '--rerun' in sys.argv
rows, bad = [], 0
def rec(step, item, ok, note=''):
    global bad; rows.append((step, item, 'PASS' if ok else 'FAIL', note)); bad += 0 if ok else 1
    print(f"{'PASS' if ok else 'FAIL'}  [{step}] {item}{'  ' + note if note else ''}", flush=True)
tmp = tempfile.mkdtemp(prefix='skygrid_repro_'); work = os.path.join(tmp, 'repo')
os.makedirs(work)
arch = subprocess.run(['git', '-C', ROOT, 'archive', 'HEAD'], capture_output=True, check=True).stdout
p = subprocess.run(['tar', '-x', '-C', work], input=arch); assert p.returncode == 0
for tf in sorted(glob.glob(os.path.join(work, 'planned', 'raw', 'out_*.tar.xz'))):   # out_snapshot.tar.xz (30 Oct) plus later per-study raw outputs
    with tarfile.open(tf) as t: t.extractall(work, filter='data')
env = dict(os.environ, PYTHONHASHSEED='0')
def run(cmd, timeout=1800): return subprocess.run(cmd, cwd=work, capture_output=True, text=True, env=env, timeout=timeout)
# 1
r = run([sys.executable, 'planned/verify_prereg.py']); last = (r.stdout.strip().splitlines() or [''])[-1]
rec('1 registrations', 'all fingerprints', r.returncode == 0, last)
# 2
os.makedirs(SNAP, exist_ok=True)
WF = os.path.join(work, 'planned', 'WITHHELD_INPUTS.txt')   # public release only: analyses whose input file is not published
WITHHELD = dict(l.split(None, 1) for l in open(WF).read().splitlines() if l.strip()) if os.path.exists(WF) else {}
for f in sorted(glob.glob(os.path.join(work, 'planned', '*_analyze.py'))):
    b = os.path.basename(f)[:-len('_analyze.py')]
    if b in WITHHELD:
        rows.append(('2 analyses', b, 'SKIP', 'input withheld: ' + WITHHELD[b])); print(f'SKIP  [2 analyses] {b}  input withheld: {WITHHELD[b]}', flush=True); continue
    for a in ARGS.get(b, [[]]):
        tag = b + ('_' + '_'.join(a) if a else '')
        r = run([sys.executable, os.path.relpath(f, work)] + a)
        out = r.stdout.replace(work, '<repo>')
        snap = os.path.join(SNAP, tag + '.txt')
        if update: open(snap, 'w').write(out)
        # a few analyses stamp the day they ran into their title, e.g. "results (2026-10-31)"; that date is not a result
        nd = lambda s: re.sub(r'results \(\d{4}-\d{2}-\d{2}\)', 'results (<run date>)', s)
        same = os.path.exists(snap) and nd(open(snap).read()) == nd(out)
        rec('2 analyses', tag + ' runs', r.returncode == 0, '' if r.returncode == 0 else (r.stderr.strip().splitlines() or [''])[-1][:160])
        rec('2 analyses', tag + ' output = snapshot', same, '' if same else 'differs from planned/repro/stdout/' + tag + '.txt')
    t = os.path.join('planned', b + '_results_table.md')
    if os.path.exists(os.path.join(ROOT, t)):
        committed = subprocess.run(['git', '-C', ROOT, 'show', 'HEAD:' + t], capture_output=True).stdout
        rec('2 analyses', t + ' regenerated identically', open(os.path.join(work, t), 'rb').read() == committed)
# 3
S = json.load(open(os.path.join(work, 'lab', 'studies.json')))
n_st, n_pass, n_sc = len(S), sum(x['pass'] for x in S), sum(x['n'] for x in S)
fh = open(os.path.join(ROOT, 'docs', 'findings.html')).read(); ab = open(os.path.join(ROOT, 'docs', 'about.html')).read()
rec('3 scorecard', f'{n_st} studies, {n_pass} of {n_sc} passed', f'{n_pass} of {n_sc}' in fh and f'{n_st} studies' in fh and f'{n_pass} passed' in ab,
    'findings and about pages show the same totals as lab/studies.json')
MAP = json.load(open(os.path.join(work, 'tools', 'scorecard_map.json'))); byname = {x['name']: x for x in S}
for x in MAP:
    e = byname.get(x['name']); ok = e is not None and (e['pass'], e['n']) == (x['pass_record'], x['n_record'])
    rec('3 scorecard', f"{x['code']}: scorecard {e['pass'] if e else '?'}/{e['n'] if e else '?'} = record {x['pass_record']}/{x['n_record']}", ok, '' if ok else 'scorecard differs from the counted record (tools/scorecard_map.json)')
rec('3 scorecard', 'every scorecard entry is mapped to its record', len(MAP) == len(S) and all(x['name'] in byname for x in MAP))
csv = os.path.join(ROOT, 'docs', 'studies.csv')
rec('3 scorecard', 'docs/studies.csv rows', os.path.exists(csv) and len(open(csv).read().strip().splitlines()) == n_st + 1)
# 4
if rerun:
    for label, cmd, raw in RERUN:
        want = open(os.path.join(work, raw), 'rb').read(); os.remove(os.path.join(work, raw))
        r = run(cmd, timeout=3600); got = open(os.path.join(work, raw), 'rb').read() if os.path.exists(os.path.join(work, raw)) else b''
        rec('4 re-runs', label, r.returncode == 0 and got == want, f'{raw}: ' + ('identical' if got == want else 'DIFFERENT'))
# report
n_ok = sum(1 for x in rows if x[2] == 'PASS'); n_skip = sum(1 for x in rows if x[2] == 'SKIP')
L = [f'# Reproduction report', '', f'Commit {HEAD}, run {datetime.datetime.now().strftime("%Y-%m-%d %H:%M")} by tools/reproduce.py{" --rerun" if rerun else ""}.', '',
     f'**{n_ok} of {len(rows) - n_skip} checks passed' + (f' ({n_skip} skipped: input withheld)' if n_skip else '') + '.**', '', '| Step | Item | Result | Note |', '|---|---|---|---|'] + [f'| {a} | {b} | {c} | {d} |' for a, b, c, d in rows]
os.makedirs(os.path.join(ROOT, 'planned', 'repro'), exist_ok=True); open(os.path.join(ROOT, 'planned', 'repro', 'REPORT.md'), 'w').write('\n'.join(L) + '\n')
print(f'\n{n_ok} of {len(rows) - n_skip} checks passed' + (f' ({n_skip} skipped: input withheld)' if n_skip else '') + '. Report: planned/repro/REPORT.md'); shutil.rmtree(tmp, ignore_errors=True); sys.exit(1 if bad else 0)
