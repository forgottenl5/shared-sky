#!/usr/bin/env python3
"""One-off text corrections from the 28 Oct 2026 review (claims audit, coverage and audience reviews).
Edits city/city.template.html and keeps city/dfw_text.json in step: every replaced Houston string is also
replaced inside any DFW key (so the DFW swap still finds it) and, where given, inside DFW values.
Each edit asserts an exact occurrence count, so nothing changes silently. Run once from the repo root."""
import json, sys
T = 'city/city.template.html'; D = 'city/dfw_text.json'
tpl = open(T, encoding='utf8').read(); dfw = json.load(open(D, encoding='utf8'))
log = []

def rep(old, new, n=1, vals=0, keys=None):
    """Replace in template (exactly n times), in every DFW key containing it, and in DFW values (exactly `vals` times in total)."""
    global tpl
    c = tpl.count(old)
    if c != n: sys.exit(f'template count {c} != {n}: {old[:90]!r}')
    tpl = tpl.replace(old, new)
    kc = vc = 0
    for p in dfw:
        if old in p[0]: p[0] = p[0].replace(old, new); kc += 1
        if old in p[1]: vc += p[1].count(old); p[1] = p[1].replace(old, new)
    if keys is not None and kc != keys: sys.exit(f'dfw key count {kc} != {keys}: {old[:90]!r}')
    if vc != vals: sys.exit(f'dfw value count {vc} != {vals}: {old[:90]!r}')
    log.append(f'T{n} K{kc} V{vc}  {old[:70]!r}')

def repd(old, new, n=1):
    """Replace inside DFW values only (DFW-specific wording)."""
    c = sum(p[1].count(old) for p in dfw)
    if c != n: sys.exit(f'dfw value count {c} != {n}: {old[:90]!r}')
    for p in dfw: p[1] = p[1].replace(old, new)
    log.append(f'D{n}  {old[:70]!r}')

def addpair(a, b):
    if any(p[0] == a for p in dfw): sys.exit('pair exists: ' + a)
    dfw.append([a, b]); log.append(f'+pair {a[:60]!r}')

# ---- intro card ----
rep('Amazon says it flies out at about 69 m (225 ft); its FAA filings put the return trip anywhere in 85–115 m, which includes Zipline’s 101 m cruise.',
    'Amazon told Richardson council it flies out at about 69 m (225 ft); its FAA filings for Florida, Detroit and Kansas City put the return trip anywhere in 85–115 m, which includes Zipline’s 101 m cruise.')
rep('Only if Amazon came home near the 400 ft (122 m) ceiling, a height',
    'Only if Amazon came home near the 400 ft (122 m) maximum in its filings, a height')
rep('The 72% (95% interval 67–76%, 10 runs) assumes', 'The 72% (95% interval 67–76% across 10 random layouts of Wing and Zipline sites; it does not cover model error) assumes', keys=1)
repd('The 73% (95% interval 66–80%, 10 runs; Houston 72%) assumes', 'The 73% (95% interval 66–80% across 10 random layouts of Wing and Zipline sites, not model error; Houston 72%) assumes')
rep('the animation below is a denser test patch (sites every 3 km, about three times the filed build-out).',
    'the animation below is a denser test patch: sites every 3 km, about 7 times as tightly packed as the filed layout, so it shows roughly 40 times more planned conflicts per square km than the headline study.', keys=1)
repd('the animation below is a denser test patch (sites every 3 km, about three times the filed build-out; Zipline’s DFW filing is 400 flights a day per site, under half its Houston figure).',
     'the animation below is a denser test patch: sites every 3 km, about 9 times as tightly packed as the filed layout, so it shows roughly 75 times more planned conflicts per square km than the headline study (Zipline’s DFW filing is 400 flights a day per site, under half its Houston figure).')
rep('With only the sites flying in Houston today, the companies’ plans almost never meet;', 'With only the sites flying in Houston today, the companies’ plans almost never meet (HOUTODAY: 1–2 planned conflicts in 60 simulated hours);', keys=1)
rep('Real operators already share flight plans before take-off (ASTM F3548), so this is a reference point',
    'Some operators already share flight plans before take-off (the industry standard is ASTM F3548; Wing and Flytrex report doing so in DFW), so this is a reference point', keys=1)
repd('Real operators already share flight plans before take-off (ASTM F3548): in Little Elm and Wylie,', 'Some operators already share flight plans before take-off (ASTM F3548 is the industry standard): in Little Elm and Wylie,')
rep('<input type="checkbox" id="sndOn" checked>', '<input type="checkbox" id="sndOn">')
rep('Built with the Sky-Grid engine · every study written down before it ran, failed predictions reported · forgottenl5',
    'Built with the Sky-Grid engine · studies written down before they ran (since 22 Oct 2026), failed predictions reported · forgottenl5')

# ---- hero ----
rep('<div class="ui hero" id="hero" aria-live="polite">', '<div class="ui hero" id="hero">')
rep('<div class="hsub" id="heroSub"></div>', '<div class="hsub" id="heroSub" aria-live="polite"></div>')
rep('aria-pressed="true">As filed today</button>', 'aria-pressed="true">As filed, no coordination</button>')
rep('aria-pressed="false">Shared heights + plan check</button>', 'aria-pressed="false">Shared heights + simple check</button>')
rep('<b style="color:var(--good)">Planned conflicts drop to zero</b> by design in still air.',
    '<b style="color:var(--good)">Planned conflicts drop to zero</b> by design in still air. This check is idealised: a realistic one with reserved airspace blocks removes 96–99% but makes about 1 in 5 flights wait about 6 minutes in windy hours (COORD1).')

# ---- tour ----
rep('Add a <b>pre-flight plan check</b>, like the plan sharing operators already use: a flight whose plan comes too close waits 30 s and tries again.',
    'Add a <b>simple pre-flight plan check</b>, a stripped-down version of the plan sharing real operators use: a flight whose plan comes too close waits 30 s and tries again.')
rep('so a check with no wind allowance leaves most of them (see the Build-out tab).',
    'so a check with no wind allowance leaves most of them (see the Build-out tab). A realistic check with reserved airspace blocks removes 96–99% but makes about 1 in 5 flights wait about 6 minutes in windy hours (COORD1).')
rep('The lesson either way: <b>keep each company’s return trip at least 10 m clear of the others’ cruise</b>.',
    'The lesson in this model: <b>keep each company’s return trip clear of the others’ cruise</b>. With real plan sharing the gap also has to be wider than the airspace blocks each flight reserves (COORD2).')

# ---- Results tab ----
rep('122 m is the 400 ft legal ceiling, above every filed return band (at most 115 m)', '122 m is the 400 ft maximum stated in Amazon’s filings, above every filed return band (at most 115 m)', n=2, keys=1, vals=1)
rep("it waits 30 s and tries again.',", "it waits 30 s and tries again. This is a simple ±5 s check; a realistic one costs more (see Results).',")
rep('A plan check then removes the rest by design.', 'A simple plan check then removes the rest by design (a realistic one has a cost; see below).')
rep('<tr><td>Amazon at its Omaha profile (61 / 105 m)</td>', '<tr><td>Amazon at its Omaha profile (61 / 105 m), dense test patch</td>')
rep('<td><b>79% / 71% / 27%</b></td><td>HOUREAL</td>', '<td><b>79% / 71% / 27%</b> (3 runs; the 10-run headline above supersedes it)</td><td>HOUREAL</td>')
rep('<tr><td>Close means within 15 m vertically (filed heights)</td><td><b>44–46%</b></td><td>ROBUST</td></tr>',
    '<tr><td>Close means within 15 m vertically (real layouts, best-sourced Amazon)</td><td><b>55%</b> Houston, <b>45%</b> DFW (an older layout gave 44–46%)</td><td>HEADLINE2, ROBUST</td></tr>')
rep('the filed plans do not meet: no planned conflicts between companies in 54 simulated hours (every height plan, calm and windy).',
    'the filed plans almost never meet: no planned conflicts between companies in 54 simulated hours at 20% of the filed volume (the Build-out tab’s “today” stage, every height plan, calm and windy), and 1–2 in 60 hours at the full filed volume (HOUTODAY, run when 5 Wing stores were open).', keys=1)
rep('And operators already share flight plans before take-off (ASTM F3548), so “as filed” is a no-coordination reference, not what happens today.',
    'And some operators already share flight plans before take-off (ASTM F3548), so “as filed” is a no-coordination reference, not what happens today.')
rep('<h3>Checked since (24 Oct)</h3>', '<h3>Checked since (24–26 Oct)</h3>', keys=1, vals=1)
rep('<li><b>Independent review (25 Oct).</b> Three outside reviewers (research methods, a drone-industry engineering view, a public critic) read the code and pages. Their findings led to',
    '<li><b>AI-assisted review (24–25 Oct).</b> Three AI reviewers (fresh sessions of the AI assistant used to build this project, each given a role: research methods, drone-industry practice, public critic) read the code and pages. They are not people or industry experts, and no human outside reviewer has looked at the work yet. Their findings led to', keys=1, vals=1)
rep('Today no modelled drone comes near the Texas Medical Center helipad, the one busy vertical-flight site. At full build-out about 1 in 2 air-taxi or helicopter take-offs and landings there would have a delivery drone inside the “well clear” volume (2,000 ft / 250 ft), mostly',
    'Today no modelled drone comes near the Texas Medical Center helipad (the one vertical-flight site modelled in Houston). At full build-out about 2 in 5 air-taxi or helicopter take-offs and landings there (41%) would have at least one delivery drone inside the “well clear” volume (2,000 ft / 250 ft) and about 1 in 45 one inside the near-mid-air-collision volume (planned paths, no avoidance), mostly', keys=1)
repd('At full build-out about 1 in 2 air-taxi take-offs and landings at Toyota’s Plano HQ or the downtown Dallas vertiport would have a delivery drone inside the “well clear” volume (2,000 ft / 250 ft), and about 1 in 20 inside the near-mid-air-collision volume,',
     'At full build-out about 1 in 3 air-taxi take-offs and landings (35%) at Toyota’s Plano HQ or the downtown Dallas vertiport (closed for rebuilding, reported to reopen about 2029) would have at least one delivery drone inside the “well clear” volume (2,000 ft / 250 ft), and about 1 in 20 to 1 in 25 one inside the near-mid-air-collision volume (planned paths, no avoidance),')
rep('Amazon waits most (9–14% of its flights), mainly', 'With this minimal check Amazon waits most (9–14% of its flights), mainly', keys=1)
REAL = ('<h3>A realistic check costs more</h3><p>The check above is minimal (±5 s, 30 m cells). With reserved airspace blocks sized like real plan-sharing systems '
        '(COORD1, inspired by ASTM F3548: the standard itself was not read and the block sizes are my assumptions), shared-out heights still remove 96–99% of '
        'planned conflicts in windy hours, but about 1 in 5 flights in Houston and 1 in 6 in DFW wait, about 6 minutes on average, and Amazon waits on '
        'about 80–86% of its flights. I had predicted at most 5% delayed; it was 17–19%. The cause is in the layout: the shared-out layers are 10–14 m apart, '
        'closer than two 10 m reserved blocks, so neighbouring layers block each other on paper. Layers 20 m apart cut that delay by about 60% (COORD2); '
        '5 m blocks with Zipline on top cut it to about 4% of flights (LAYER2, 6 of 6 predictions passed). Wait times also rise with demand, and above '
        'today’s filings the cost moves into cancellations (DENS1).</p>')
rep("its cause is not tested.</p>',\n  bad: '", "its cause is not tested.</p>' +\n    '" + REAL + "',\n  bad: '")

# ---- Bad days tab ----
rep('<p><b>The practical lesson:</b> most of the bad-day risk, like the normal-day risk, comes from one company’s return trip sitting within 10 m of another’s cruise. Keeping every company’s cruise and return heights at least 10 m apart does most of the work; full height sharing adds a little more.</p>',
    '<p><b>The practical lesson, in this model:</b> most of the bad-day risk, like the normal-day risk, comes from one company’s return trip sitting within 10 m of another’s cruise. Keeping every company’s cruise and return heights at least 10 m apart does most of the work on paper; full height sharing adds a little more. With real plan sharing the layers also need gaps wider than the reserved airspace blocks (COORD2). This is a model result, not operational advice.</p>')

# ---- How it works tab ----
rep('120 s and 75 s (filed); 20 drop boxes within 5 km of each dock (assumed, not filed)', '120 s and 75 s (filed); 20 drop boxes per dock (filed), placed within 5 km of it (assumed)')
rep('That is about three times the filed Houston build-out (about 420 sites against 146 filed)',
    'That is about three times as many sites as the filed Houston build-out (about 420 against 146) packed into a smaller area, about 7 times as dense', keys=1)
repd('That is about three times the filed DFW build-out (about 450 sites against 157 filed)',
     'That is about three times as many sites as the filed DFW build-out (about 450 against 157) packed into a smaller area, about 9 times as dense')
rep('<li>Only pairs from different companies, inside the counted zone, each episode counted once.</li>',
    '<li>Only pairs from different companies, inside the counted zone, each episode counted once (a pair that separates for one check and closes again counts again).</li>')
rep('<li>Every study is written down and fingerprinted (sha256) before it runs; the analysis script is committed before the runs (one exception, FLEET, is logged in its file).</li>',
    '<li>Since 22 Oct 2026 every study is written down and fingerprinted (sha256) before it runs, and its analysis script is committed before the runs. Exceptions: VALLOC, VALLOC2 and ROBUST, which include the first height-sharing study, were committed together with their results, so their order cannot be checked; FLEET’s analysis was written after its runs. Earlier work (before 22 Oct) is not fingerprinted.</li>')
rep('The registrations and their fingerprints are in the project’s repository with commit times',
    'The registrations and their fingerprints are in the project’s repository (private for now; available on request) with commit times')

# ---- What's checked tab ----
rep("'<tr><td>Planned conflicts grow with the square of traffic</td><td>We ran TU Delft’s open-source BlueSky simulator ourselves: slope about 2 in both. This checks the growth law, not the 81%.</td><td><span class=\"tag ok\">matches</span></td></tr>' +",
    "'<tr><td>Planned conflicts grow roughly with the square of traffic</td><td>We ran TU Delft’s open-source BlueSky simulator on a Vienna street benchmark against an earlier version of this engine (with avoidance): the growth slope was about 2 in both, but absolute counts differed 2–4 times, so 2 of the 3 predictions failed. This checks the growth law only, not the headline cut. On the Texas layouts the growth exponent is 1.65–2.4 (DENS1; my 1.7–2.3 prediction failed narrowly).</td><td><span class=\"tag mid\">growth law matches</span></td></tr>' +")
rep('Our zero is built into the check, so this is weak support.</td>',
    'Our zero is built into the check, so this is weak support. A realistic check with reserved blocks removes 96–99%, at a delay cost (COORD1).</td>')
rep('<h3>Does it hold at other traffic levels?</h3><p>The headline is pooled over sites every 3 km and every 4 km, three random seeds each. Planned conflicts grow with the square of traffic in this engine and in TU Delft’s BlueSky, so denser build-outs produce more of them, and the share removed by height sharing was 83% at 4 km, 82% at 3 km and 80% at 2 km spacing (original 1-per-second counting; the pooled 81% uses the corrected 4-per-second counting at 3 and 4 km).</p>',
    '<h3>Does it hold at other traffic levels?</h3><p>The headline uses the filed Houston site counts on one real layout, 10 runs (HEADLINE2). In the dense 12 km test patch the share removed by height sharing was 83% with sites every 4 km, 82% at 3 km and 80% at 2 km (older 1-per-second counting). Planned conflicts grow roughly with the square of demand (exponent 1.65–1.7 in Houston, 2.3–2.4 in DFW; DENS1), so denser build-outs produce many more of them.</p>', keys=1)
rep('<li>An outside reviewer: none yet.', '<li>A human outside reviewer: none yet (the reviews so far were AI-assisted).')

# ---- Go further tab ----
rep('<div class="links"><a href="https://github.com/forgottenl5/sky-grid/tree/main/planned" target="_blank" rel="noopener">The full write-up →<span>Every study, its prediction, the result, and the corrections.</span></a>',
    '<div class="links"><a href="findings.html">What the simulation found →<span>The main results on one page, with charts, what failed and what is still open.</span></a>')
rep('<p>The write-up is the study record (registrations, code fingerprints and results) in the project’s public repository.</p>',
    '<p>The full study record (registrations, code fingerprints, code and results) is in a repository that is private for now; it is available on request.</p>')
rep('<p>If you spot a mistake, want the run data, or have real flight tracks that could check the model, open an issue on the project’s GitHub repository.</p>',
    '<p>If you spot a mistake, want the run data, or have real flight tracks that could check the model: a contact route is being set up. Until then the study record is available on request.</p>')

# ---- Build-out tab ----
rep('<li>Today: no planned conflicts between companies; the sites are too far apart.</li>', '<li>Today (at 20% of filed volume): no planned conflicts between companies; the sites are too far apart.</li>', keys=1)
rep('Corrected 24 Oct after an independent review found a plan-check bug', 'Corrected 24 Oct after an AI-assisted review found a plan-check bug', keys=1)

# ---- cinema captions and conflict shot ----
rep("capSet('Planned conflict · ' + opsName(C.e.ops), 'Within 30 metres.', 'Two companies’ planned paths overlap. In this scenario",
    "capSet('Planned conflict · ' + opsName(C.e.ops), 'Within 30 m sideways, 10 m up or down.', 'Two companies’ planned paths come this close. In this scenario")
rep("capSet('Planned conflict · ' + opsName(e.ops), 'Within 30 metres.', '', true);", "capSet('Planned conflict · ' + opsName(e.ops), 'Within 30 m sideways, 10 m up or down.', 'Planned paths, not a crash', true);")
rep('var sh = C.hit ? 14 * Math.exp(-(t - C.hit) * 3) : 0;', 'var sh = 0; /* no camera shake: a planned conflict is not an impact */')
rep('var sh = S.hit ? 14 * Math.exp(-(t - S.hit) * 3) : 0;', 'var sh = 0;')
rep("capSet('', 'Now watch two hours of it.', ''); }", "capSet('', 'Own heights for each company: 72% fewer.', 'The study result (real Houston layout, 10 runs). Next: two hours of a denser test patch.'); }")
rep("if (t > 24.5 && !C.cleared)", "if (t > 26 && !C.cleared)")
addpair('Own heights for each company: 72% fewer.', 'Own heights for each company: 73% fewer.')
addpair('The study result (real Houston layout, 10 runs).', 'The study result (real DFW layout, 10 runs).')

# DFW key 30 ('This checks the growth law, not the 81%.') no longer exists in the template: drop it.
before = len(dfw); dfw = [p for p in dfw if p[0] != 'This checks the growth law, not the 81%.']
assert len(dfw) == before - 1; log.append('-pair growth-law line')

open(T, 'w', encoding='utf8').write(tpl)
json.dump(dfw, open(D, 'w', encoding='utf8'), ensure_ascii=False)
print('\n'.join(log)); print(len(log), 'edits')
