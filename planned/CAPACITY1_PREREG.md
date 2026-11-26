# CAPACITY1: how much traffic plan sharing can take (written 2026-11-25 before any study run)
Status: new study, first of the auditor-question backlog (IDEAS_BACKLOG.md item 1). A regulator approving drone delivery has to decide how fast approvals can grow. This study scales traffic from a tenth of the filed volumes to one and a half times them on PHYS1's realistic model, and finds where flights held by the shared pre-flight check take off, for each height layout.

## Model
PHYS1's realistic flights and operations, all factors on ("REAL": measured flight profiles, 30-degree turns, DFW Zipline as filed, customers by population, airport detours, lunch peak, Amazon 15 h), loaded unchanged from planned/phys1_run.js. Same sites, windows (11:00-14:00 local, 12:00-14:00 measured), counters and plan check (INTENT2's runner; plans by F3548's 95 % rule at average GPS, N2 = +-10 m sideways, +-14 m in height; V135 = +-13.5 m in height).
- **Utilisation sweep (k):** every site's hourly rate times k, for k = 0.1, 0.25, 0.5, 0.75, 1 (the filed volumes as PHYS1 models them), 1.5 (beyond the filings; stress test only).
- **Build-out sweep (f):** a random share f = 0.25 or 0.5 of each company's sites (at least one), each at full rate. Compared with k = f, it asks whether it matters how the same traffic is reached (fewer busy sites or many quiet ones).
- **Filed volumes (100 %):** Wing 400 flights per nest per day over 7 am-10 pm; Amazon 1,000 per site per day over 15 h; Houston Zipline 1,000 x 0.95 per site over 15 h (engine figure); DFW Zipline the engine's 400 over 15 h, which is 5 % above the filing (400 over 24 h, 95 % in daytime). That small excess is kept so k = 1 equals PHYS1 exactly; disclosed, not corrected.
- **Fleet (reported, not used to limit flights):** filed fleet sizes are Wing up to 24 aircraft per nest (Wing Houston final EA, Aug 2026) and Zipline DFW up to 20 docks per site (Zipline DFW FONSI, Dec 2025). Amazon and Houston Zipline file no per-site count. No filing gives charging or turnaround time or a peak-hour rate, so flights are not limited by fleet. Instead the most aircraft any site has in the air at once (no turnaround: a lower bound on the fleet needed) is reported against the filed numbers.

## Parts
- **C (plan-sharing cost):** heights / plan A0 / N2, A2 / N2, G1 / N2, G1 / V135; k sweep (6 levels) and f sweep (A0 and A2 at N2 only); both metros; seeds 1-3. 192 runs.
- **U (uncoordinated meetings between companies):** S1 and A2, k sweep, both metros, seeds 1-3. 72 runs.
264 runs.

## Definitions
- Held share = (delayed + cancelled) / flights checked, as INTENT2 and PHYS1.
- **Capacity** of a layout = the highest tested k at which, pooled over seeds, the overall held share is at most 10 % **and** every company's held share is at most 25 %. If none qualifies, capacity < 0.1.

## Predictions (pooled seeds; each in both metros)
- **C1:** held share rises with traffic: for every layout, held at k = 0.1 < 0.5 < 1 < 1.5.
- **C2:** today's heights (A0 / N2) already hold at least 10 % of flights at a quarter of the filed volumes (k = 0.25).
- **C3:** the shared-out heights (A2 / N2) hold at most 10 % overall at half the filed volumes (k = 0.5). [At k = 1 PHYS1 measured 12-14 %, so the cross-over is expected between 0.5 and 1.]
- **C4:** Amazon is the limit: for A0 / N2 and A2 / N2, the condition that fails first as k rises is Amazon's 25 %, not the overall 10 % (the lowest k at which Amazon exceeds 25 % is strictly below the lowest k at which the overall share exceeds 10 %; never exceeding counts as above 1.5).
- **C5:** GAP1's spacing with +-13.5 m plans (G1 / V135) has the highest capacity of the four layouts (at least every other layout's, and above A0 / N2's).
- **C6:** only the total traffic matters: at matched volume (f = 0.25 vs k = 0.25, f = 0.5 vs k = 0.5) the overall held share differs by no more than 3 points, for A0 / N2 and A2 / N2.
- **C7:** the headline cut without sharing (S1 to A2, between-company meetings at 30 m / 10 m) stays within 10 points of its k = 1 value at every k from 0.25 to 1.5.
- **C8:** at the filed volumes (k = 1) no Wing nest needs more than its filed 24 aircraft in the air at once (largest peak over all nests and seeds, A2 / N2 runs).
- Reported, not predicted: capacity of every layout; held share by company and by k; cancellations and mean delay; meetings per flight; fleet peaks for every company (Zipline DFW against 20 docks); k = 0.1 against the "today" result of INTENT1 (about 1 % held).

## Checks (K, run after this file is fingerprinted, before the study runs)
- **K1:** k = 1 reproduces PHYS1's stored cost row (Houston A2 N2 seed 1) exactly.
- **K2:** k = 1 reproduces PHYS1's stored meeting row (DFW A2 seed 1) exactly.
- **K3:** k = 0.5 gives 45-55 % of the flights; f = 0.5 keeps round(n / 2) sites per company (at least one).
- **K4:** the fleet counter assigns every flight to a site and finds a positive peak for every company.

## Limits stated in advance
Same as PHYS1 (assumed demand shape at the lunch peak, turn limits, no weather, buildings, other aircraft or in-flight avoidance; plans cover position error only). Volumes above k = 1 exceed what was filed. Three seeds. Only the measured 2-hour window at the lunch peak is simulated, so capacity here is peak-hour capacity; a whole day would hold fewer flights.

## Rules
Runner and analysis committed before any study run; no changes after the data is in; deviations logged below.

## Deviation log
(none yet)
- **D1 (25 Nov, after the pre-checks, before any study run):** the run counts above are an arithmetic slip. The design as described gives 168 C runs (6 k levels x 4 layouts + 2 f levels x 2 layouts, x 2 metros x 3 seeds) and 72 U runs, 240 in all, not 192 and 264. Design unchanged.
