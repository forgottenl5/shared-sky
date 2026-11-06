"""Check every pre-registration fingerprint in planned/.

Convention: a PREREG is fingerprinted (sha256) when written, ending with its '## Deviation log' heading and '(none yet)'.
Later lines are appended below that point only (labelled '(Appended after fingerprint ...)'). So the fingerprint must match
the file cut at the end of the first '(none yet)' line after '## Deviation log' (or, for the oldest registrations, at the end of that heading line); any edit above that point fails.
Usage: python3 planned/verify_prereg.py   (run from the repo root)
"""
import glob, hashlib, os, re, sys
ok = bad = red = 0; rows = []
REDACTED = set(open('planned/REDACTED.txt').read().split()) if os.path.exists('planned/REDACTED.txt') else set()   # public release only: registrations with a private detail redacted
for h in sorted(glob.glob('planned/*PREREG*.sha256')):
    line = open(h).read().split()
    if len(line) < 2: rows.append((h, 'unreadable')); bad += 1; continue
    want, path = line[0], line[1]
    if not os.path.exists(path):
        alt = os.path.join('planned', os.path.basename(path))
        path = alt if os.path.exists(alt) else path
    if not os.path.exists(path): rows.append((h, 'file missing')); bad += 1; continue
    b = open(path, 'rb').read()
    full = hashlib.sha256(b).hexdigest()
    m = re.search(rb'## Deviation log\r?\n\(none yet\)\r?\n', b)
    cut = hashlib.sha256(b[:m.end()]).hexdigest() if m else None
    m2 = re.search(rb'## Deviation log\r?\n', b)   # older registrations (22-23 Oct) were fingerprinted ending at the heading itself
    cut2 = hashlib.sha256(b[:m2.end()]).hexdigest() if m2 else None
    if want == full: rows.append((path, 'PASS (whole file, nothing appended)')); ok += 1
    elif want in (cut, cut2): rows.append((path, 'PASS (text above the appended deviation log)')); ok += 1
    elif os.path.basename(path) in REDACTED: rows.append((path, 'REDACTED (private detail removed; original verified privately)')); red += 1
    else: rows.append((path, 'FAIL: matches neither the whole file nor the text above the log')); bad += 1
for p, s in rows: print(f'{s:62s} {p}')
print(f'\n{ok} pass, {bad} fail' + (f', {red} redacted' if red else '') + f', of {ok + bad + red} fingerprinted pre-registrations in planned/.')
sys.exit(1 if bad else 0)
