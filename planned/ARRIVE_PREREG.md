# Arrival procedures at one site (written 2026-10-24 before any study run)
Status: behaviour model of planned operations at one isolated site; same-company meetings only. Not a safety assessment: companies' own site procedures are not public.

## Why
SITECAP found that spacing departures removes at most a third of a site's own near-site meetings and suggested (untested) that arrivals are the rest. The independent review (REVIEW_2026-10-24.md) flagged that as an untested claim. This study tests arrival procedures directly.

## Model (planned/arrive_run.js)
SITECAP's single site (filed profiles, A0 heights, pads uniform in a 30 m or 120 m square), with two changes from the review: meetings are counted only inside the 2 h measured window (`tEnd`), and throughput is reported (flights requested in the window that land by 30 min after it).
Procedures:
- **none**; **D20** departures at least 20 s apart (as SITECAP);
- **A20** arrivals: each returning drone stops at a hold point on its inbound track 500 m before the end of its last cruise segment, at cruise height, and starts its approach no sooner than 20 s after the previous arrival;
- **D20A20** both, as separate streams;
- **M20 / M10** one shared movement slot: any departure or arrival approach at least 20 s (10 s) after the previous movement of either kind.
Traffic 1× and 2× filed cap; Amazon, Wing, Zipline; seeds 1–3. 3 × 2 × 2 × 6 × 3 = 216 runs. Meetings: same-company wide (30 m / 10 m), both drones within 300 m of the site (also reported within 1 km, to see whether holding just moves meetings outward).

## Paper model (before any run)
Departures and arrivals share the site column. Spacing each stream separately still lets a departure and an arrival overlap; one shared slot does not. Movements per hour are twice the flight rate, so a shared slot of Δ caps a site at 3,600 / Δ movements an hour (Amazon 1× ≈ 121, 2× ≈ 242).

## Predictions (pooled over seeds)
- **P1:** a shared 20 s slot (M20) at 1× with 30 m pads cuts near-site meetings by >= 80 % against none, for each site. PREDICTION: holds.
- **P2:** separate 20 s slots (D20A20) cut less than a shared 20 s slot (M20), at 1×, 30 m pads, for each site. PREDICTION: holds.
- **P3:** Amazon at 2× with M20 (cap 180 movements an hour for about 242) has a mean departure wait or arrival hold above 600 s. PREDICTION: holds.
- **P4:** 120 m pads plus M10 at 2× cut near-site meetings by >= 90 % against 30 m pads with no procedure, with mean wait and hold <= 60 s, for each site. PREDICTION: holds.

## Rules
No changes after the data is in; code committed before runs; deviations logged below.
- **K1:** no procedure leaves flights identical; a hold keeps segments continuous and adds exactly its length; hold points lie more than 350 m from the site.

## Deviation log
(none yet)
- (Appended after fingerprint; the fingerprint covers the text above this line.) K1 PASS (identical flights with no procedure; continuous segments, +37 s; Amazon sample hold point 941 m out). The code check was run while writing the runner, before this text.
