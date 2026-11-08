'use strict';
// Build docs/findings.html: the public findings page (charts are inline SVG; numbers are copied from the results files named in each source line).
// Usage: node lab/build_findings.js
const fs = require('fs'), path = require('path');
const studies = JSON.parse(fs.readFileSync(path.join(__dirname, 'studies.json'), 'utf8'));
const N = studies.reduce((a, s) => a + (s.n || 0), 0), PASS = studies.reduce((a, s) => a + (s.pass || 0), 0), FAIL = N - PASS, UNS = studies.reduce((a, s) => a + (s.unscored || 0), 0);
const FP = fs.readdirSync(path.join(__dirname, '..', 'planned')).filter(f => /PREREG.*\.sha256$/.test(f)).length;
const BASE = 'https://forgottenl5.github.io/shared-sky/';
const FAV = '<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 32 32%27%3E%3Crect width=%2732%27 height=%2732%27 rx=%277%27 fill=%27%2303060c%27/%3E%3Ccircle cx=%279%27 cy=%2720%27 r=%274%27 fill=%27%234fd8ff%27/%3E%3Ccircle cx=%2716%27 cy=%2711%27 r=%274%27 fill=%27%23ffbe3d%27/%3E%3Ccircle cx=%2723%27 cy=%2720%27 r=%274%27 fill=%27%23a98bff%27/%3E%3C/svg%3E">';
const OG = (t, d, page) => `<meta property="og:type" content="website"><meta property="og:title" content="${t}"><meta property="og:description" content="${d}"><meta property="og:url" content="${BASE}${page}"><meta property="og:image" content="${BASE}img/houston.jpg"><meta property="og:image:width" content="720"><meta property="og:image:height" content="405"><meta name="twitter:card" content="summary_large_image">${FAV}`;
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const C = ['var(--s1)', 'var(--s2)', 'var(--s3)'];
const table = (head, rows) => `<details class="tv"><summary>Table view</summary><div class="tw"><table><thead><tr>${head.map(h => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${r.map(c => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div></details>`;
const legend = (names) => `<div class="lg">${names.map((n, i) => `<span><i style="background:${C[i]}"></i>${esc(n)}</span>`).join('')}</div>`;

// ---- waffle: every registered prediction
function waffle() {
  const cols = 19, cell = 18, gap = 4, rows = Math.ceil(N / cols), W = cols * (cell + gap), H = rows * (cell + gap);
  let out = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${PASS} of ${N} registered predictions passed, ${FAIL} failed">`;
  for (let k = 0; k < N; k++) { const x = (k % cols) * (cell + gap), y = Math.floor(k / cols) * (cell + gap), ok = k < PASS;
    out += ok ? `<rect x="${x}" y="${y}" width="${cell}" height="${cell}" rx="3" fill="var(--s1)"><title>passed</title></rect>`
      : `<g><rect x="${x + 1}" y="${y + 1}" width="${cell - 2}" height="${cell - 2}" rx="3" fill="none" stroke="var(--s2)" stroke-width="2"/><path d="M${x + 5} ${y + 5}L${x + cell - 5} ${y + cell - 5}M${x + cell - 5} ${y + 5}L${x + 5} ${y + cell - 5}" stroke="var(--s2)" stroke-width="2"/><title>failed</title></g>`; }
  return out + '</svg>'; }

// ---- grouped bars with direct value labels
function bars({ groups, series, max, unit = '', capLabel = {} }) {
  const W = 560, H = 300, L = 44, R = 12, T = 18, B = 56, pw = W - L - R, ph = H - T - B, gw = pw / groups.length, bw = Math.min(46, (gw - 28) / series.length);
  const y = v => T + ph - Math.min(v, max) / max * ph;
  let o = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="grouped bar chart">`;
  for (let t = 0; t <= 4; t++) { const v = max * t / 4; o += `<line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" class="gl"/><text x="${L - 6}" y="${y(v) + 4}" class="ax" text-anchor="end">${+v.toFixed(1)}${unit}</text>`; }
  groups.forEach((g, gi) => { const x0 = L + gi * gw + (gw - bw * series.length - 4 * (series.length - 1)) / 2;
    series.forEach((s, si) => { const v = g.values[si], x = x0 + si * (bw + 4), capped = capLabel[gi + ':' + si];
      o += `<rect x="${x}" y="${y(v)}" width="${bw}" height="${T + ph - y(v)}" rx="3" fill="${C[si]}"><title>${esc(g.name)}, ${esc(s)}: ${capped || v + unit}</title></rect>`;
      o += `<text x="${x + bw / 2}" y="${y(v) - 6}" class="vl" text-anchor="middle">${capped || v + unit}</text>`; });
    o += `<text x="${L + gi * gw + gw / 2}" y="${H - 28}" class="gn" text-anchor="middle">${esc(g.name)}</text>`; });
  return o + '</svg>'; }

// ---- range chart (5-95 whisker, 25-75 bar, median tick, marker for the earlier single point)
function ranges({ rows, max }) {
  const W = 560, H = 70 + rows.length * 70, L = 156, R = 24, T = 24, pw = W - L - R, x = v => L + v / max * pw;
  let o = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="ranges of the share of jobs that would save time">`;
  for (let t = 0; t <= 5; t++) { const v = max * t / 5; o += `<line x1="${x(v)}" x2="${x(v)}" y1="${T}" y2="${H - 40}" class="gl"/><text x="${x(v)}" y="${H - 22}" class="ax" text-anchor="middle">${+v.toFixed(1)}%</text>`; }
  rows.forEach((r, i) => { const cy = T + 30 + i * 70;
    o += `<text x="${L - 12}" y="${cy + 4}" class="gn" text-anchor="end">${esc(r.name)}</text>`;
    o += `<line x1="${x(r.p5)}" x2="${x(r.p95)}" y1="${cy}" y2="${cy}" stroke="${C[i]}" stroke-width="3"><title>5th to 95th percentile ${r.p5}% to ${r.p95}%</title></line>`;
    o += `<rect x="${x(r.p25)}" y="${cy - 12}" width="${x(r.p75) - x(r.p25)}" height="24" rx="3" fill="${C[i]}" opacity=".85"><title>25th to 75th percentile ${r.p25}% to ${r.p75}%</title></rect>`;
    o += `<line x1="${x(r.p50)}" x2="${x(r.p50)}" y1="${cy - 16}" y2="${cy + 16}" stroke="var(--ink)" stroke-width="3"><title>median ${r.p50}%</title></line>`;
    o += `<path d="M${x(r.pt)} ${cy - 10}l8 10l-8 10l-8 -10z" fill="var(--bg)" stroke="var(--ink)" stroke-width="2"><title>single-point run ${r.pt}%</title></path>`;
    o += `<text x="${x(r.p50)}" y="${cy - 22}" class="vl" text-anchor="middle">median ${r.p50}%</text><text x="${x(r.pt)}" y="${cy + 32}" class="ax" text-anchor="middle">single point ${r.pt}%</text>`; });
  return o + '</svg>'; }

// ---- calibration chart: pass rate with Wilson interval per group
function calib(rows) {
  const W = 560, H = 60 + rows.length * 36, L = 190, R = 30, T = 20, pw = W - L - R, lo0 = 50, x = v => L + (v - lo0) / (100 - lo0) * pw;
  const wil = (k, n) => { const z = 1.96, p = k / n, d = 1 + z * z / n, c = (p + z * z / (2 * n)) / d, h = z * Math.sqrt(p * (1 - p) / n + z * z / (4 * n * n)) / d; return [c - h, c + h]; };
  let o = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="share of registered predictions that held, by group, with 95 percent intervals">`;
  for (let t = 50; t <= 100; t += 10) o += `<line x1="${x(t)}" x2="${x(t)}" y1="${T}" y2="${H - 34}" class="gl"/><text x="${x(t)}" y="${H - 16}" class="ax" text-anchor="middle">${t}%</text>`;
  o += `<line x1="${x(100)}" x2="${x(100)}" y1="${T}" y2="${H - 34}" stroke="var(--ink)" stroke-width="2" stroke-dasharray="4 3"/><text x="${x(100)}" y="${T - 6}" class="ax" text-anchor="end">every prediction said “holds”: 100%</text>`;
  rows.forEach((r, i) => { const cy = T + 20 + i * 36, [lo, hi] = wil(r.k, r.n), p = 100 * r.k / r.n;
    o += `<text x="${L - 10}" y="${cy + 4}" class="gn" text-anchor="end">${esc(r.name)}</text>`;
    o += `<line x1="${x(100 * lo)}" x2="${x(100 * hi)}" y1="${cy}" y2="${cy}" stroke="${C[0]}" stroke-width="3"><title>95% interval ${(100 * lo).toFixed(0)} to ${(100 * hi).toFixed(0)}%</title></line>`;
    o += `<circle cx="${x(p)}" cy="${cy}" r="6" fill="${C[0]}" stroke="var(--bg)" stroke-width="2"><title>${r.name}: ${r.k} of ${r.n} held (${p.toFixed(1)}%)</title></circle>`; });
  return o + '</svg>'; }

// ---- lines with whiskers
function lines({ xs, series, whiskers, max }) {
  const W = 560, H = 320, L = 44, R = 90, T = 18, B = 44, pw = W - L - R, ph = H - T - B, x = i => L + i / (xs.length - 1) * pw, y = v => T + ph - v / max * ph;
  let o = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="required fleet against demand">`;
  for (let t = 0; t <= 5; t++) { const v = max * t / 5; o += `<line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" class="gl"/><text x="${L - 6}" y="${y(v) + 4}" class="ax" text-anchor="end">${v}</text>`; }
  xs.forEach((v, i) => { o += `<text x="${x(i)}" y="${H - 22}" class="ax" text-anchor="middle">${v}</text>`; });
  o += `<text x="${L + pw / 2}" y="${H - 4}" class="ax" text-anchor="middle">requests per hour, per route direction</text>`;
  series.forEach((s, si) => { o += `<polyline points="${s.v.map((v, i) => x(i) + ',' + y(v)).join(' ')}" fill="none" stroke="${C[si]}" stroke-width="3"/>`;
    s.v.forEach((v, i) => { o += `<circle cx="${x(i)}" cy="${y(v)}" r="5" fill="${C[si]}" stroke="var(--bg)" stroke-width="2"><title>${esc(s.name)}, ${xs[i]} per hour: ${v} aircraft</title></circle>`; });
    o += `<text x="${x(xs.length - 1) + 10}" y="${y(s.v[s.v.length - 1]) + 4}" class="gn">${esc(s.name)}</text>`;
    (whiskers[si] || []).forEach(([i, lo, hi]) => { const dx = si ? 8 : -8; o += `<line x1="${x(i) + dx}" x2="${x(i) + dx}" y1="${y(lo)}" y2="${y(hi)}" stroke="${C[si]}" stroke-width="2"/><line x1="${x(i) + dx - 4}" x2="${x(i) + dx + 4}" y1="${y(lo)}" y2="${y(lo)}" stroke="${C[si]}" stroke-width="2"/><line x1="${x(i) + dx - 4}" x2="${x(i) + dx + 4}" y1="${y(hi)}" y2="${y(hi)}" stroke="${C[si]}" stroke-width="2"/>`; }); });
  return o + '</svg>'; }

const fig = (svg, cap, tbl, src) => `<figure>${svg}<figcaption>${cap}</figcaption>${tbl}<p class="src">Source: ${src}</p></figure>`;

const f1 = fig(bars({ groups: [{ name: 'Houston', values: [18.5, 7.9, 4.4] }, { name: 'Dallas–Fort Worth', values: [17.0, 6.8, 4.1] }], series: ['Shared-out heights, 10 m blocks', 'Thinner 5 m blocks', 'Zipline on top + 5 m blocks'], max: 20, unit: '%' }) + legend(['Shared-out heights, 10 m blocks', 'Thinner 5 m blocks', 'Zipline on top + 5 m blocks']),
  'Share of flights delayed by the plan check, simulated delivery drones at the filed site counts, windy hours (about the 90th percentile of 2025 wind), 6 seeds of 2 measured hours.', table(['Metro', 'Shared-out, 10 m blocks', 'Thinner blocks', 'Zipline on top + thinner blocks'], [['Houston', '18.5 %', '7.9 %', '4.4 %'], ['Dallas–Fort Worth', '17.0 %', '6.8 %', '4.1 %']]), 'planned/LAYER2_RESULTS_2026-10-27.md');
const f2 = fig(ranges({ max: 5, rows: [{ name: 'Dallas–Fort Worth', p5: 0.02, p25: 0.32, p50: 1.2, p75: 2.8, p95: 4.93, pt: 3.05 }, { name: 'Houston', p5: 0.22, p25: 0.34, p50: 0.48, p75: 0.94, p95: 2.43, pt: 1.28 }] }),
  'Share of jobs with a commute that flying between two of Archer’s twelve announced sites would shorten by 10 minutes or more at peak. Line: 5th to 95th percentile; bar: 25th to 75th; tick: median; diamond: the single-point run.',
  table(['Metro', '5th', '25th', 'median', '75th', '95th', 'single point'], [['Dallas–Fort Worth', '0.02 %', '0.32 %', '1.20 %', '2.80 %', '4.93 %', '3.05 %'], ['Houston', '0.22 %', '0.34 %', '0.48 %', '0.94 %', '2.43 %', '1.28 %']]), 'planned/UNCERT1_RESULTS_2026-10-27.md, planned/ACCESS1B_ADDENDUM_2026-10-27.md');
const f3 = fig(bars({ groups: [{ name: 'DFW, 2 pads', values: [16, 8, 5] }, { name: 'Houston, 2 pads', values: [16, 8, 5] }, { name: 'DFW, 4 pads', values: [7, 7, 5] }, { name: 'Houston, 4 pads', values: [6, 6, 5] }], series: ['First come, first served', 'Landing slot booked at take-off', 'Hold on the ground until a stand is reserved'], max: 16, capLabel: { '0:0': 'never', '1:0': 'never' } }) + legend(['First come, first served', 'Landing slot booked at take-off', 'Hold on the ground until a stand is reserved']),
  'Parking stands per site needed to meet the service and reserve test at 3 requests an hour per route direction. “Never” means no stand count up to 16 met it.',
  table(['Case', 'First come', 'Slot at take-off', 'Hold on ground'], [['DFW, 2 pads', 'never (>16)', '8', '5'], ['Houston, 2 pads', 'never (>16)', '8', '5'], ['DFW, 4 pads', '7', '7', '5'], ['Houston, 4 pads', '6', '6', '5']]), 'planned/PADRULE1_RESULTS_2026-10-27.md');
const f5 = fig(calib([{ name: 'All scored predictions', k: 274, n: 353 }, { name: 'Ranges and limits', k: 251, n: 323 }, { name: 'Comparisons and claims', k: 23, n: 30 }, { name: 'Delivery-drone studies', k: 162, n: 217 }, { name: 'Air-taxi studies', k: 101, n: 125 }, { name: 'First half of the project', k: 138, n: 177 }, { name: 'Second half', k: 136, n: 176 }]),
  'Share of registered predictions that held, by group, with 95 % intervals. Dashed line: what every prediction implied.',
  table(['Group', 'Held / scored', 'Rate'], [['All scored predictions', '274 / 353', '77.6 %'], ['Ranges and limits', '251 / 323', '77.7 %'], ['Comparisons and claims', '23 / 30', '76.7 %'], ['Delivery-drone studies', '162 / 217', '74.7 %'], ['Air-taxi studies', '101 / 125', '80.8 %'], ['First half of the project', '138 / 177', '78.0 %'], ['Second half', '136 / 176', '77.3 %']]), 'planned/CALIB1_RESULTS_2026-10-31.md, planned/calib1_results_table.md');

const f4 = fig(lines({ xs: [1.5, 3, 6, 12], max: 50, series: [{ name: 'DFW', v: [8, 14, 24, 48] }, { name: 'Houston', v: [5, 8, 14, 28] }], whiskers: [[[1, 12, 16], [2, 24, 28]], [[1, 8, 12], [2, 12, 20]]] }),
  'Aircraft needed to serve 95 % of requests with a median wait under 10 minutes, with 100 km usable after a 20-minute reserve (the Part 135 daytime VFR minimum that powered-lift able to land vertically along the route may use, 14 CFR 194.306(ss) as quoted in FAA AC 194-1; otherwise 30 minutes by day, which changes nothing here, or 45 at night, not modelled) and unlimited parking stands. Requests are per route direction: DFW has 8 route directions and Houston 4, so 1.5 requests an hour means 12 and 6 trips an hour on the air-taxi page. Lines: assumed central inputs. Whiskers at 3 and 6 requests an hour: 5th to 95th percentile when the inputs vary over the stated ranges. The two sources used different setups: the lines come from NET3 (8 pads per site, unlimited stands), the whiskers from UNCERT1 (4 pads, the landing-slot rule, unlimited stands), so a line can sit at the low edge of its whisker (Houston at 3 requests an hour: line 8, median of the draws 10). The registered inputs behind the lines favour a small fleet.',
  table(['Requests/h per route direction', 'DFW', 'Houston'], [['1.5', '8', '5'], ['3', '14 (12–16)', '8 (8–12)'], ['6', '24 (24–28)', '14 (12–20)'], ['12', '48', '28']]), 'planned/AIRTAXI_NET3_RESULTS_2026-10-27.md, planned/UNCERT1_RESULTS_2026-10-27.md');

const css = `:root{--bg:#03060c;--ink:#eaf1fb;--ink2:#9fb1c8;--ink3:#6f8299;--line:rgba(140,185,235,.20);--accent:#ffe9a8;--s1:#3987e5;--s2:#d95926;--s3:#199e70;--mono:"JetBrains Mono",ui-monospace,Menlo,Consolas,monospace;--sans:"Space Grotesk",system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;color-scheme:dark}
*{box-sizing:border-box}html,body{margin:0;background:var(--bg);color:var(--ink);font-family:var(--sans)}
body{min-height:100vh;background:radial-gradient(ellipse 90% 60% at 50% -10%,rgba(57,135,229,.14),transparent 60%),var(--bg)}
main{max-width:820px;margin:0 auto;padding:48px 16px 56px}
.kick{font-family:var(--mono);font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:var(--accent)}
h1{font-size:clamp(32px,6vw,52px);line-height:1.04;margin:10px 0 14px;letter-spacing:-.02em}h2{font-size:24px;margin:44px 0 8px;letter-spacing:-.01em}
p,li{color:var(--ink2);font-size:16px;line-height:1.55}p.lede{font-size:18px;color:var(--ink)}b{color:var(--ink)}a{color:var(--s1)}
nav{font-family:var(--mono);font-size:13px;margin-bottom:8px}nav a{margin-right:16px}
figure{margin:18px 0 10px;padding:16px;border:1px solid var(--line);border-radius:12px;background:rgba(10,18,32,.7)}
svg{width:100%;height:auto;display:block}.gl{stroke:var(--line);stroke-width:1}.ax{fill:var(--ink3);font-size:13px;font-family:var(--mono)}.vl{fill:var(--ink);font-size:14px;font-family:var(--mono)}.gn{fill:var(--ink);font-size:15px;font-family:var(--sans)}
figcaption{color:var(--ink2);font-size:14px;margin-top:10px}.src{font-family:var(--mono);font-size:12px;color:var(--ink3);margin:8px 0 0}
.lg{display:flex;flex-wrap:wrap;gap:6px 18px;margin-top:8px;font-size:13px;color:var(--ink2)}.lg i{display:inline-block;width:12px;height:12px;border-radius:3px;margin-right:6px;vertical-align:-1px}
.tv{margin-top:8px}.tv summary{cursor:pointer;color:var(--ink3);font-family:var(--mono);font-size:12px}.tw{overflow-x:auto}table{border-collapse:collapse;margin-top:8px;font-size:13px}th,td{padding:5px 10px;border-bottom:1px solid var(--line);text-align:left;color:var(--ink2);white-space:nowrap}th{color:var(--ink)}
.quiz{border:1px solid var(--line);border-radius:12px;padding:14px 16px;margin:12px 0;background:rgba(140,185,235,.04)}.quiz .q{font-weight:600;margin:0 0 8px}.quiz .opts{display:flex;flex-wrap:wrap;gap:8px}.quiz button{font:inherit;font-size:14px;color:var(--ink);background:rgba(140,185,235,.08);border:1px solid var(--line);border-radius:8px;padding:8px 14px;cursor:pointer;min-width:64px}.quiz button:hover{background:rgba(140,185,235,.18)}.quiz button.pick{border-color:var(--accent)}.quiz button.right{background:rgba(109,255,179,.16);border-color:#6dffb3}.quiz .a{margin:10px 0 0;color:var(--ink2);font-size:14px;line-height:1.5}.quiz .a b{color:var(--ink)}.quiz .mine{display:block;margin-top:4px;font-size:13px;color:var(--ink3)}#qscore{font-family:var(--mono);font-size:13px;color:var(--ink3);margin-top:6px}
.cav{border-left:3px solid var(--s2);padding:2px 0 2px 14px;margin:10px 0}.big{font-size:44px;font-weight:700;color:var(--ink);letter-spacing:-.02em}.row{display:flex;gap:28px;flex-wrap:wrap;align-items:center}.row>div{flex:1 1 300px}
ul{padding-left:20px}footer{margin-top:48px;color:var(--ink3);font-size:13px}`;

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Shared Sky findings</title>
${OG("Shared Sky findings", "What a pre-registered simulation of delivery drones and air taxis over Houston and Dallas–Fort Worth found, and the predictions that failed.", "findings.html")}
<meta name="description" content="What a pre-registered simulation of delivery drones and air taxis over Houston and Dallas–Fort Worth found, including the ${FAIL} predictions that failed.">
<link rel="stylesheet" href="vendor/fonts/fonts.css">
<style>${css}</style></head><body><main>
<nav><a href="index.html">Shared Sky</a><a href="lab.html">Lab</a><a href="houston.html">Houston</a><a href="dfw.html">Dallas–Fort Worth</a><a href="airtaxi.html">Air taxis</a><a href="about.html">About</a></nav>
<div class="kick">Findings, updated 6 November 2026</div>
<h1>What the simulation found, and what it got wrong</h1>
<p class="lede">Shared Sky is a scenario model of delivery drones (Wing, Zipline, Amazon) and of air taxis between Texas airports and vertiports, built from FAA filings, company announcements and Census data. It is not a forecast and nobody has endorsed it. No person outside the project has reviewed it yet; the reviews so far were done by AI reviewers. Predictions are written down and fingerprinted before the runs; this page shows the ones that came true and the ones that did not.</p>
<div class="cav"><p><b>Read this first.</b> Every result here comes from a simulation, not from real flights, and none has been checked against real operations: the companies do not publish flight-level data, and the air-taxi networks are scenarios built from announced sites. Read each percentage as “what happens in this model under these assumptions”, not as what operators will see. Being reproducible and pre-registered makes the work checkable, not accurate. The assumptions that move the numbers most are <a href="#drivers">listed at the end</a>.</p></div>

<h2>Guess first</h2>
<p>Before you read the results, try four of the questions this project asked. Each answer also shows what I predicted, in writing, before the simulation ran. Your guesses stay in your browser; nothing is sent anywhere.</p>
<div class="quiz" data-right="2"><p class="q">1. If the three delivery-drone companies each flew their own slice of the height band they already filed, how much would planned conflicts between them fall?</p><div class="opts"><button>about 10 %</button><button>about 40 %</button><button>about 70 %</button><button>about 95 %</button></div><p class="a" hidden><b>About 72 % in Houston and 73 % in Dallas–Fort Worth</b> (10 m vertical gap, no plan sharing; if Amazon really flies near 400 ft the cut shrinks to about 29–35 %).<span class="mine">My prediction before the runs: 60–80 % in Houston, 55–80 % in DFW. Both held (HEADLINE2).</span></p></div>
<div class="quiz" data-right="2"><p class="q">2. If drones check their flight plans against each other before take-off and wait when they overlap, what share of flights would have to wait in windy hours?</p><div class="opts"><button>about 1 %</button><button>about 5 %</button><button>about 18 %</button><button>about 40 %</button></div><p class="a" hidden><b>About 1 in 5 or 6: 18.9 % in Houston and 17.5 % in DFW</b> over 10 windy hours (SEEDS2). Resizing the layer gaps to fit the reservations removes more than half of that cost but not all of it (COORD2).<span class="mine">My prediction before the runs: at most 5 %. It failed (COORD1, SEEDS2).</span></p></div>
<div class="quiz" data-right="1"><p class="q">3. Flying between twelve announced Texas air-taxi sites, what share of Dallas–Fort Worth jobs would have a commute at least 10 minutes faster at peak?</p><div class="opts"><button>about 0.1 %</button><button>about 1 %</button><button>about 10 %</button><button>about 30 %</button></div><p class="a" hidden><b>About 1.2 %</b> (median; 5th–95th percentile 0.02–4.9 %), mostly long cross-metro commutes, and that is at zero fare (UNCERT1).<span class="mine">My prediction before the runs: between 0.1 % and 3 %. It held in the main run (DFW 2.57 %, Houston 1.25 %), though DFW sat close to the upper edge and one earlier single run came out at 3.05 % (ACCESS1, UNCERT1).</span></p></div>
<div class="quiz" data-right="0"><p class="q">4. With air taxis flying until midnight at the busiest level, how many people live where the noise reaches a day–night average of 55 dB (a busy street)?</p><div class="opts"><button>none</button><button>about 1,000</button><button>about 10,000</button><button>about 100,000</button></div><p class="a" hidden><b>None, in either metro.</b> The loudest squares off the pads are airport land with no residents. About 7,600 people near the DFW network and 2,100 near Houston's would still hear 10 or more loud flights a day (NOISE2).<span class="mine">My prediction before the runs: at least some people. It failed (NOISE2).</span></p></div>
<p id="qscore" aria-live="polite"></p>
<script>(function(){var Q=document.querySelectorAll('.quiz'),got=0,done=0;Q.forEach(function(q){var bs=q.querySelectorAll('button'),r=+q.dataset.right;bs.forEach(function(b,i){b.addEventListener('click',function(){if(q.dataset.done)return;q.dataset.done=1;done++;b.classList.add('pick');bs[r].classList.add('right');if(i===r)got++;q.querySelector('.a').hidden=false;if(done===Q.length)document.getElementById('qscore').textContent='You got '+got+' of '+Q.length+' close. I got 2 of 4 of my own predictions right.';});});});})();</script>

<h2>The headline: sharing out heights cuts planned conflicts by about 72 % (Houston) and 73 % (DFW)</h2>
<p>If each delivery company flies its own slice of height inside the band it already filed with the FAA, planned conflicts between the companies fall by 72 % in Houston (95 % range 67–76 %) and 73 % in Dallas–Fort Worth (66–80 %), with Amazon at its best-sourced heights. A planned conflict is two companies’ planned paths within 30 m sideways and under 10 m vertically, with no coordination between them. Real layouts at the filed site counts, 10 runs each.</p>
<div class="cav"><p><b>It depends on:</b> where Amazon really flies home (if near 400 ft, as one secondhand staff remark says, the cut is 29 % / 35 %), and on 10 m between companies being enough (at 15 m it is 55 % / 45 %). The ranges cover random site layouts, not model error. With a realistic plan-sharing check 99–99.6 % of them are removed either way (10 windy hours, SEEDS2), and height sharing roughly halves how many flights have to wait (COORD1). In collision risk at average GPS, though, that check leaves the shared-out heights slightly more residual risk than the best-sourced heights, because Amazon’s and Zipline’s layers sit exactly 20 m apart, at the edge of what the check sees (RISK2); the gaps need a margin. Wing’s and Zipline’s sites are placed at random because their lists are not public. Two later checks: with all three companies on departure corridors the cut is 71 % / 82 % (CORR2); with the filed overlap caps applied the cut is 72 % / 59 % but absolute conflicts fall by 82–90 %, so every absolute count here is an upper bound (CAPS1). The model flies in wind but not in rain: in 2025 about 22 % (Houston) and 13 % (DFW) of daytime hours had measurable rain and 4–5 % had heavy rain or 55 km/h gusts; the data cannot see thunderstorms (WX1).</p></div>
<p class="src">Source: planned/HEADLINE2_RESULTS_2026-10-25.md, COORD1_RESULTS_2026-10-26.md, CORR2_RESULTS_2026-10-28.md, CAPS1_RESULTS_2026-10-28.md, WX1_RESULTS_2026-10-29.md</p>

<h2>The scorecard</h2>
<div class="row"><div><div class="big">${PASS} of ${N}</div><p><b>${FAIL} registered predictions failed</b>${UNS ? ` and ${UNS} were not scored (a pre-run check failed, or the case never occurred)` : ''}. They are across ${studies.length} studies, drones and air taxis; each is listed in the <a href="lab.html#record">study record</a>. Some passes were easy predictions; the failures are the informative part. A model whose predictions always come true has not been tested.</p></div>
<div>${waffle()}<div class="lg"><span><i style="background:var(--s1)"></i>passed</span><span><i style="border:2px solid var(--s2);background:none"></i>failed (crossed)</span></div></div></div>

<h2>1. Thinner reserved blocks plus a different layer order cut drone delays by about three quarters</h2>
<p>Drones that fly in the same airspace reserve a block of sky around their planned path and wait if it overlaps another. With the shared-out heights this project proposes and 10 m blocks, about 1 flight in 5 to 6 waits in windy hours. I had predicted at most 5 % delayed (COORD1); it was 17–19 % (confirmed over 10 windy hours each, SEEDS2). Putting Zipline on the top layer does nothing alone, and thinner blocks do most of the work; together they cut the delayed share to about 4 %.</p>
${f1}
<div class="cav"><p><b>Not shown:</b> that 5 m blocks are safe. The simulated conflict counts are 0 to 3 per arm, too few to show a difference. GPS-level errors are tested in the next section.</p></div>

<h2>1b. The height-sharing cut shrinks with GPS error, mostly because of height error</h2>
<p>The headline runs fly every drone exactly on its plan. ERRORS1 (276 runs, both metros) gives each flight a random sideways error, height error and late start, sized to published figures: near the best monitored GPS sites (L1), the GPS standard’s committed average (L2), its committed worst site (L3), and the size the FAA Remote ID rule allows (L4). This study compares the shared-out heights with the heights the companies filed (not with Amazon’s best-sourced heights, which give the 72 % / 73 % headline and were not rerun here). Without errors that cut is 80 % in Houston and 81 % in DFW on these six seeds; with them it is <b>76 % / 79 % at L1, 63 % / 59 % at L2, 30 % / 26 % at L3 and 20 % / 23 % at L4</b>. Height error alone does nearly all of this; sideways error or late starts alone change the cut by 3 points or less. I predicted the cut would fall further at L2–L4 (3 of 13 predictions failed).</p>
<p>The plan-sharing check is affected too: the minimal reservation (30 m wide, ±10 m high) removes 83 % / 77 % of flown conflicts at L2 but only 18 % / 22 % at L4, while a block taller than the height error (±46 m) removes almost all, at the cost of roughly twice as many flights waiting (37 % / 47 % in windy hours against 18 % / 17 %).</p>
<div class="cav"><p><b>Read with care:</b> errors here are independent between flights, but real GPS and barometer errors are partly shared by nearby drones, so L2–L4 probably overstate the damage. The late-start size is my assumption, and I found no published figure for the height accuracy of delivery drones, so none of these levels is a measurement of any company’s aircraft. Six seeds; intervals are wide (for example DFW at L4: 12–32 %).</p></div>
<p><b>The headline case and shared errors (ERRORS2).</b> Against Amazon’s best-sourced heights (the 72 % / 73 % headline), the cut behaves the same way: 71 % / 73 % at best-site GPS, 60 % / 54 % at the average, 22 % / 23 % at the Remote ID size. But nearby drones share most of their error, because they see the same satellites and the same air pressure. Splitting each error into a shared and a personal part shows that only the personal part matters for separation: if 80–95 % is shared, the average-GPS cut is 66–75 %, close to the no-error 72–74 %. How much is shared on real delivery drones is not measured, so the independent-error numbers above are the pessimistic end. All 10 predictions held, some with wide bands.</p>

<h2>1c. In collision risk, not just conflicts, height sharing gives about the same cut</h2>
<p>A planned conflict at 25 m is not the same as one at 1 m. RISK1 turns every planned encounter between companies (36,150 over 40 runs) into a collision probability with the Reich model used by ICAO: the drones collide if their errors bring them closer than their combined size. Against Amazon at its best-sourced heights, sharing out heights cuts modelled collision risk by <b>79 % (Houston) and 82 % (DFW) at best-site GPS and 61 % / 58 % at the GPS standard’s average</b>; if most of the error is shared by nearby drones, the average-GPS cut is 78–83 %. At the Remote ID size it is at least 16–18 %. All 5 predictions held.</p>
<div class="cav"><p><b>Read with care:</b> these runs have no plan-sharing check and no avoidance, so the rates (about 1 modelled collision per 10,000 flight hours) describe plans as filed, not real operations, where the plan check removes 98–99 % of conflicts at average-or-better GPS. Zipline’s and Amazon’s sizes are not published and are assumed; risk roughly doubles with double the size. Without errors the counts are whole events (3 planned collisions in about 31,500 Houston flight hours with best-sourced heights, 0 with shared-out heights; 2 and 1 in DFW). This is a model quantity, not a safety assessment.</p></div>

<h2>1d. Drones dodging each other over Remote ID barely helps once GPS has its normal error</h2>
<p>AVOID1 gives every drone a simple avoidance rule, with figures from an FAA-funded Remote ID avoidance test (BAA004: detection at 100–500 m, message gaps of 5 s or more, 36 of 51 test encounters avoided): detect the other drone at 300 m, react after 6 s, climb or descend at 2 m/s towards a 10 m gap. With exact GPS this removes 71 % of the modelled collision risk. <b>At the GPS standard’s average error it removes only 3–5 %</b>, even if every alert is acted on (4–7 %). Most of that risk comes from drones planned more than 10 m apart in height that their errors bring together, and each drone broadcasts where it <i>thinks</i> it is, so the broadcasts cannot show it; and a 10 m gap is inside the height error. Height sharing still cuts the remaining risk by 57–61 % and the number of manoeuvres by three quarters. I predicted a 50–71 % cut; 2 of 5 predictions failed.</p>
<div class="cav"><p><b>Read with care:</b> one manoeuvre per encounter, the other drone does not react, climb rate and latency are assumptions, and no plan check (as RISK1). Avoidance with sensors that see true positions (radar, cameras) is not modelled and could do better.</p></div>

<h2>1e. With plans checked before take-off, the modelled risk mostly disappears, and the shared-out heights show a weak spot</h2>
<p>RISK2 switches on the plan-sharing check before computing collision risk. The minimal check (blocks 30 m half-width, ±10 m high) removes <b>81–96 % of the modelled risk at the GPS standard’s average error</b> and effectively all of it at best-site GPS; a larger check (±46 m) removes all of it but delays 40–48 % of flights and cancels about a quarter. With the minimal check, though, <b>the shared-out heights keep more residual risk than Amazon’s best-sourced heights</b> (Houston 0.93 vs 0.82, DFW 1.11 vs 0.51 modelled collisions per 100,000 flight hours). The reason is the layout: Amazon’s outbound height (81 m) and Zipline’s (101 m) are exactly 20 m apart, the edge of what ±10 m blocks can see, so the check never flags the pair while average GPS errors can still bring them together; they cause about 90 % of what is left. Height sharing still halves the flights the check delays (19 % vs 40 % in Houston, 17 % vs 37 % in DFW). Layer gaps and check sizes have to be set together, with a margin for height error. 3 of 5 predictions failed.</p>
<div class="cav"><p><b>Read with care:</b> still air, block sizes are my assumptions (the ASTM standard is paywalled), and the residual rates rest on few encounters. A model quantity, not a safety assessment.</p></div>

<h2>1f. Bad GPS among tall buildings hardly moves the metro-wide figure</h2>
<p>ERRORS3 gives downtown the urban-canyon error measured by NASA Langley in Columbus, Ohio (95th percentile 47.8 m sideways raw, 4.4 m with their processing) and keeps average GPS elsewhere. <b>Metro-wide modelled collision risk changes by +0.1 %</b>, because downtown is about 0.2 % of each counted area and holds under 0.4 % of the close encounters. If every place had canyon-sized sideways error, risk without a plan check changes by at most 6 %. I predicted that with the minimal plan check the residual risk would rise by at least 50 % under canyon error everywhere; it changed by &minus;11 % to +17 %, so that prediction failed. A likely reason, not tested here, is that the check's weak spot is height gaps (RISK2), which sideways error does not touch. Errors that wander during a flight were settled by argument (same size at any moment, same expected rate), not by runs. 1 of 4 predictions failed.</p>
<div class="cav"><p><b>Read with care:</b> downtown is a box, not a building-by-building signal model; one city, one study; height error assumed unaffected; still air; lower bound with canyon error everywhere (90 m search). A model quantity, not a safety assessment.</p></div>

<h2>1g. Weather stops and dinner-time peaks add conflicts, because conflicts grow with the square of traffic</h2>
<p>Doubling traffic roughly quadruples planned conflicts (exponent 1.98–2.09, WX2). So anything that bunches flights adds conflicts even when the day's total is the same. If drones stop in 2025's bad-weather hours (3.9 % of daytime hours in Houston, 4.6 % in DFW) and catch up afterwards at up to 1.5 times the normal rate, a year has <b>about 6–7 % more planned conflicts</b>. If orders peak at lunch and dinner with the busiest hour twice the average, a day has <b>40–48 % more</b>, and the busiest hour about 4 times an even hour (DEMAND1). Height sharing keeps its 72–75 % cut in both. Every absolute count on this site assumes even demand, so it is low by about that much. At double traffic the plan check's delayed share barely moved while cancellations rose (I predicted the opposite). 2 of 8 predictions failed.</p>
<div class="cav"><p><b>Read with care:</b> stop rule, catch-up rate and peak size are assumptions; the demand shape is from food delivery in Beijing; thunderstorms are not in the weather data; still air.</p></div>

<h2>1h. Real helicopters fly lower than I expected, but meet few drones</h2>
<p>HELI1 uses 14 days of 2025 public flight-tracking data (adsb.lol, ODbL): 1,199 helicopter-days over Houston and Dallas–Fort Worth. <b>30 % of helicopter time over the counted areas in Houston and 46 % in DFW is below 150 m above ground, and 14–17 % is inside the drone height band (46–121 m).</b> I had predicted under 15 % and under 8 %, so three of five predictions failed. The shares move a lot with the ground height I assumed (roughly 20–60 % below 150 m), and volunteer receivers miss low flights, so they are floors. Against the drone traffic of the simulation, a low-flying helicopter has on average <b>0.03 drones (Houston) or 0.009 (DFW)</b> in a 450 × 450 × 60 m box around it, and height sharing makes no difference to that. This counts exposure, not encounters or collisions.</p>
<div class="cav"><p><b>Read with care:</b> ground elevation is an assumption, heights are pressure altitude, helicopters and drones are not matched in time of day, and rules or avoidance that would separate them are not modelled. No aircraft identifiers are published.</p></div>

<h2>2. About 1% of jobs or fewer would see a commute that flying shortens, and the number is very uncertain</h2>
<p>Using Census blocks and the Census commute-flow data, I counted existing commuters whose door-to-door time falls by 10 minutes or more if they flew between two of the twelve Texas sites Archer announced on 23 October 2026 (a different, larger network than the seven sites on the air-taxi page). The single run I first published gave 3.1 % of jobs in Dallas–Fort Worth and 1.3 % in Houston. Letting the uncertain inputs vary shows that was an optimistic reading.</p>
${f2}
<div class="cav"><p><b>Not shown:</b> riders. This counts people with a time saving at zero fare, ignoring queues, weather, aircraft limits and whether anyone would pay. The input ranges are my assumptions. The biggest driver is how fast the road is that people would otherwise drive. Beneficiaries commute about 67–77 km in a straight line against a typical 20 km, and they do not hold a higher share of high-wage jobs than average: that prediction failed.</p></div>

<h2>3. How a vertiport lets aircraft land matters more than how many stands it has</h2>
<p>When parking stands are limited, an arriving aircraft may have to wait in the air. With two landing pads per site, the simple first-come rule never met the service and battery-reserve test at 3 requests an hour, however many stands there were. Booking the landing slot when the aircraft takes off needed 8 stands per site; holding the aircraft on the ground until a stand is reserved needed 5, at the price of longer waits for passengers (about 225–285 seconds against 46–130).</p>
${f3}
<div class="cav"><p><b>Not shown:</b> a certified procedure. Real arrival priority, go-arounds and weather are not modelled, and stand counts at real airports are not public. One of the six predictions for this study failed.</p></div>

<h2>4. The aircraft fleet needed is fairly robust; the charging rate is what moves it</h2>
<p>Across the stated ranges for pad time, turnaround, charging rate and flown distance, the required fleet moves by one or two steps. A faster charger shrinks it most. It rises quickly with demand: each doubling of requests multiplies the aircraft by about 1.6 to 2.</p>
${f4}
<div class="cav"><p><b>Not shown:</b> real demand. The request rates are scenario settings, not forecasts; the charging rate comes from a manufacturer’s marketing figure and aircraft range is a cautious assumption checked against Wisk’s and Joby’s stated figures (planned/AIRTAXI_INPUTS_ADDENDUM_2026-10-28.md).</p></div>

<h2>5. How well my own predictions held up</h2>
<p>Every study here was registered with predictions before it ran, each written as “this will hold”. Of the 353 that were scored before this check, 274 held (78 %, 95 % interval 73–82 %). I was overconfident by about 22 points, and I found no kind of prediction I was better at.</p>
${f5}
<ul>
<li><b>No improvement over the project.</b> The first half of the predictions held 78 %, the second half 77 %.</li>
<li><b>Numeric targets were no harder than comparisons.</b> Ranges and limits held 78 %, comparisons and claims 77 %.</li>
<li><b>The newer topic did slightly better, not worse.</b> Air-taxi questions held 81 %, delivery-drone questions 75 % (intervals overlap).</li>
<li><b>Misses leaned one way.</b> When a numeric prediction failed and the miss could be placed, the result was worse for the system than I had predicted 37 times and better 19 times (16 could not be placed). Only 8 of the 79 misses were close calls.</li>
</ul>
<div class="cav"><p><b>Not shown:</b> that these are independent tests. Predictions inside one study share data and a model, so the intervals are too narrow. I also chose the questions. I predicted five things about my own forecasting and only one held (the lean toward worse results); the other four were wrong (registered in planned/CALIB1_PREREG.md). Coding by three independent coders; a blind re-check of 10 % of rows agreed on every verdict.</p></div>

<h2>Other results, in one line each</h2>
<ul>
<li><b>Outside check.</b> The air-taxi engine reproduces a published MIT vertiport-capacity study (Vascik &amp; Hansman, 2019) in 5 of 5 predictions: pad use within 10 points in 15 of 16 cases and the same saturation points.</li>
<li><b>Shared flight plans.</b> Reserved airspace blocks inspired by ASTM F3548 (the standard is paywalled and was not read; block sizes are my assumptions) cut flown conflicts by 99–99.6 % in windy hours (SEEDS2, 10 runs); about 1 flight in 5 to 6 waits, about 6 minutes on average.</li>
<li><b>Air taxis near drone sites.</b> At full drone build-out about 2 in 5 take-offs and landings at the Texas Medical Center helipad, and 1 in 3 at Toyota’s Plano HQ, would have a delivery drone inside the “well clear” volume on planned paths; drones yielding to booked air-taxi movements removes all of them (AIRTAXI1).</li>
<li><b>Air-taxi noise.</b> The highest day-night level off-site is 54 dB over 12 daytime hours, under the FAA’s 65; loud (55 dBA) events reach about 2.4 km from a site (AIRTAXI_NOISE1; flying on to 22:00 adds under 1 dB and to midnight 2.4–3.3 dB, AIRTAXI_NOISE2).</li>
<li><b>What I got wrong.</b> My explanation that Amazon’s delays come from its own climbs and descents held with 20 m gaps between layers but not with the 10–14 m gaps of the shared-out heights. An early “the DFW cut is about half” claim was wrong: the corrected figure is 75–77 %. Both are on the pages they appeared on.</li>
</ul>

<h2>How the work is done</h2>
<ul>
<li>Each study’s question, settings and predictions are written in a registration file and fingerprinted (SHA-256) before any run. A script checks all ${FP} fingerprints against the files. The oldest fingerprinted registrations date from 22 October 2026; earlier work was not fingerprinted. Three early studies (VALLOC, VALLOC2, ROBUST, which include the first height-sharing result) were committed together with their results, so their order cannot be checked, and FLEET’s analysis was written after its runs. The fingerprints are not timestamped by an outside party.</li>
<li>The runner and analysis code are committed before the runs. Failed predictions are reported as failures.</li>
<li>Changes made after seeing a problem are logged as deviations, with at most two fix attempts. Reruns done to understand a result are labelled exploratory.</li>
<li>Outside claims are checked against the primary source where one is public (FAA filings, company releases, published papers). Some rest on press reports, and ASTM F3548 was not read; anything I could not confirm is marked unverified or left out.</li>
<li>Reviews: AI reviewers (fresh sessions of the AI assistant used to build the project, each given a role) have checked the code and pages several times and their findings are logged. No person outside the project has reviewed it.</li>
<li>The project was built with an AI assistant (Claude), which wrote most of the code and text under the author’s direction.</li>
</ul>
<h2>Method in brief (for regulators and planners)</h2>
<ul>
<li><b>What is flown.</b> Each company’s filed flight profile (heights, speeds, hovers, sites and daily volumes from its FAA environmental assessment) is turned into planned 4D paths: straight lines between a site and a customer, with filed climbs, hovers and descents. Nothing reacts to anything else in flight unless a plan check is switched on.</li>
<li><b>What is counted.</b> A planned conflict is two different companies’ planned paths within 30 m sideways and less than 10 m vertically at the same moment, checked 4 times a second and counted once per episode. A “close” count uses 15 m and 5 m. There is no published separation standard between delivery drones of different companies, so these values are my choice, not a rule; the 15 m and 20 m vertical columns on the city pages show how the result changes if more room is needed (in Houston the cut is 72% at 10 m, 55% at 15 m and 67% at 20 m).</li>
<li><b>What the plan check is.</b> Before take-off, each new flight’s plan is compared with the plans already accepted. The minimal check flags any overlap within ±5 s in 30 m cells; the realistic check (COORD1) reserves blocks of airspace around each plan, block sizes are assumptions inspired by ASTM F3548, which I have not read. A flagged flight waits and tries again. The headline runs have no navigation error or wind drift (wind, WIND20 and SEEDS2, height-keeping error, PRELAUNCH, and GPS-level errors, ERRORS1, were tested separately) and there is no tactical avoidance, so the model measures how often plans would need to be changed, not collision risk.</li>
<li><b>What the ranges mean.</b> Ranges are the spread over random placements of Wing and Zipline sites (whose site lists are not public) and random demand, not model error. A few quoted intervals (RECOUNT1, COUNTFIX) are instead counting intervals on the number of events.</li>
</ul>
<h2 id="drivers">What this is not, and what moves the numbers</h2>
<ul>
<li><b>Not checked against real operations.</b> No result here has been compared with real drone or air-taxi traffic, because I found no public data at that level. The one outside check is against another model (the MIT vertiport study), and a comparison with the BlueSky simulator gave different counts.</li>
<li>Not a forecast, a safety case, or a business plan. Demand, pad times, aircraft range and charging rates are assumptions, listed with each study.</li>
<li>Not affiliated with, or endorsed by, any company named. Coordinates and site lists come from public sources and may be off.</li>
</ul>
<p>The assumptions that change the results most, from the studies above:</p>
<ul>
<li><b>Where Amazon flies.</b> At its best-sourced heights the cut is 72 % / 73 %; if it cruises near 400 ft it is 29 % / 35 %.</li>
<li><b>How much vertical room counts as safe.</b> 10 m gives 72 % / 73 %; 15 m gives 55 % / 45 %. No published standard sets this.</li>
<li><b>Where Wing and Zipline sites are.</b> Their site lists are not public, so they are placed at random; the ranges show that spread.</li>
<li><b>How many flights there are.</b> Volumes come from the FAA filings; with the filed caps applied absolute conflicts fall by 82–90 %, so every absolute count is an upper bound (CAPS1).</li>
<li><b>Flying errors.</b> The headline runs have no GPS or height error, no wind drift and no in-flight avoidance. Wind and height error were tested separately, and with GPS-level errors the cut against the filed heights falls from 80 % / 81 % to 59–79 % at best-site and average GPS and 20–30 % at the worst committed site (ERRORS1; the headline case gives 71–73 % and 54–60 %, and most of the cut returns if nearby drones share most of their error, ERRORS2); rain and thunderstorms are not modelled.</li>
<li><b>The size of reserved airspace blocks.</b> My assumption, not the ASTM standard. It sets how many flights wait (about 1 in 5 to 6).</li>
<li><b>Road speeds and fares for air taxis.</b> The commute result is driven mostly by how fast the road alternative is, and assumes a zero fare. The fleet size is driven mostly by the charging rate, taken from a manufacturer’s figure.</li>
</ul>
<ul>
<li>The code, registrations and results are in a repository that is private for now; they are available on request. A contact route is being set up.</li>
</ul>
<footer>Shared Sky · <a href="lab.html">Lab (run it yourself)</a> · <a href="about.html">About and how it was built</a> · <a href="index.html">Home</a></footer>
</main></body></html>`;
fs.writeFileSync(path.join(__dirname, '..', 'docs', 'findings.html'), html); console.log('wrote docs/findings.html', html.length, 'bytes; predictions', PASS, '/', N);

// ---- docs/about.html: who/what/how, generated here so its counts stay in step with lab/studies.json
const STUD = studies.length;
const about = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>About Shared Sky</title>
<meta name="description" content="What Shared Sky is, how it was built (including the AI assistance), what data it uses and how to cite it.">
${OG('About Shared Sky', 'What Shared Sky is, how it was built, what data it uses and how to cite it.', 'about.html')}
<link rel="stylesheet" href="vendor/fonts/fonts.css">
<style>${css}</style></head><body><main>
<nav><a href="index.html">Shared Sky</a><a href="findings.html">Findings</a><a href="lab.html">Lab</a><a href="houston.html">Houston</a><a href="dfw.html">Dallas–Fort Worth</a><a href="airtaxi.html">Air taxis</a></nav>
<div class="kick">About</div>
<h1>About Shared Sky</h1>
<p class="lede">Shared Sky is a personal, unaffiliated simulation project by an anonymous author (forgottenl5), built for learning and as a portfolio piece. It flies the delivery-drone plans that Wing, Zipline and Amazon filed with the FAA for Houston and Dallas–Fort Worth together, and simulates small air-taxi networks for the same metros. It is not affiliated with, or endorsed by, any company or agency named.</p>
<h2>What it consists of</h2>
<ul>
<li><b>Two simulation engines</b> written in JavaScript (Node.js, no packages): a delivery-drone engine that builds flights from each company’s filed heights, speeds and hover times and counts where planned paths come close, and an air-taxi network engine (now in its fifth version) with pads, parking stands, batteries, dispatch and queues.</li>
<li><b>${STUD} studies</b> with ${N + UNS} registered predictions (${PASS} passed, ${FAIL} failed${UNS ? `, ${UNS} not scored` : ''}), each written down and fingerprinted before it ran since 22 October 2026 (exceptions: VALLOC, VALLOC2 and ROBUST were committed with their results, and FLEET’s analysis came after its runs), with Python analysis scripts committed before the runs.</li>
<li><b>Three 3D pages</b> (three.js / WebGL) that replay engine runs; a <a href="lab.html">Lab</a> that runs the delivery-drone engine in your browser; and a <a href="findings.html">findings page</a>.</li>
<li><b>Checks</b>: the air-taxi engine reproduces a published MIT vertiport study; the delivery engine’s growth law was compared with TU Delft’s BlueSky simulator (counts differed); page claims are audited against the study files.</li>
</ul>
<h2>How it was built</h2>
<p>The project was built with an AI assistant (Claude). The assistant wrote most of the code, analysis and text under the author’s direction; the author chose the questions, supplied hand-read inputs such as coordinates and drive times, and decided what to publish. Every number on these pages comes from the engines’ runs or from the cited sources, not from the assistant’s memory. The reviews so far were done by AI reviewers: fresh sessions of the same assistant, each given a role. No person outside the project has reviewed the work yet, and nobody at the companies named has commented.</p>
<h2>Data</h2>
<ul>
<li>FAA environmental assessments for Wing, Zipline and Amazon (heights, speeds, hover times, site counts, daily volumes).</li>
<li>US Census Bureau 2020 population and LODES 2022 jobs; FAA UAS facility maps; historical weather from <a href="https://open-meteo.com/">Open-Meteo</a> (CC BY 4.0); buildings © OpenStreetMap contributors (ODbL).</li>
<li>Company announcements and press reports for a few inputs (named on each page); Google Maps “typically” drive times read by hand.</li>
</ul>
<h2>Code, data and contact</h2>
<p>The code, registrations and results are in a repository that is private for now; they are available on request. A contact address is being set up. Everything the pages need is served from this site: three.js (MIT licence) and the fonts (SIL Open Font License) are copied in, so the pages make no requests to other servers.</p>
<h2>How to cite</h2>
<p class="src">forgottenl5 (2026). Shared Sky: a pre-registered simulation of delivery drones and air taxis over Houston and Dallas–Fort Worth. ${BASE}, version of 28 October 2026.</p>
<footer>Shared Sky · <a href="index.html">Home</a> · <a href="findings.html">Findings</a></footer>
</main></body></html>`;
fs.writeFileSync(path.join(__dirname, '..', 'docs', 'about.html'), about); console.log('wrote docs/about.html', about.length, 'bytes');
