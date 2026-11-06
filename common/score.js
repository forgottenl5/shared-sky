// Shared Sky score v2: generative music made live with WebAudio (no audio files, nothing downloaded).
// Three styles: 'horizon' (warm ambient: chorused pads, electric-piano arpeggio, bell melody), 'pulse' (night-drive synth: soft kick, hats, bass line, brighter arp), 'orbit' (slow cinematic: wide pads, sparse bells, deep air).
// All notes come from F major 9 - C major 9 - A minor 9 - G sus (A minor pentatonic melody), so nothing clashes.
// Tuned to sound right on laptop speakers: most energy 150 Hz - 5 kHz, restrained sub bass, stereo width, slow dynamics.
// API: Score.start(), Score.stop(), Score.on(), Score.chime(veryClose), Score.mood(0..1), Score.style(name?) -> current name, Score.styles.
var Score = (function () {
  var AC = null, out = null, bus = null, rev = null, dly = null, on = false, timer = null, step = 0, nextT = 0, bar = 0, moodV = 0.4, lastChime = 0, cur = 'horizon', t0 = 0, noiseBuf = null;
  var STY = {
    horizon: { trim: 1.0, bpm: 84, pad: 1.0, arp: 0.55, bass: 0.7, drums: 0, bell: 0.5, bright: 2300, air: 1.0 },
    pulse:   { trim: 0.7, bpm: 104, pad: 0.7, arp: 0.9, bass: 1.0, drums: 1, bell: 0.3, bright: 3200, air: 0.6 },
    orbit:   { trim: 1.3, bpm: 66, pad: 1.3, arp: 0.25, bass: 0.5, drums: 0, bell: 0.8, bright: 1700, air: 1.4 } };
  // chords: bass root, upper voicing (MIDI)
  var PROG = [{ b: 41, u: [57, 60, 64, 67, 72] }, { b: 48, u: [55, 59, 62, 64, 71] }, { b: 45, u: [55, 60, 64, 67, 71] }, { b: 43, u: [57, 62, 64, 67, 74] }];
  var PENTA = [69, 72, 74, 76, 79, 81, 84, 88];   // A C D E G A C E
  var MOTIF = [0, 2, 3, 2, 4, 3, 2, 0];            // indexes into PENTA, a gentle rising-falling phrase
  var hz = function (m) { return 440 * Math.pow(2, (m - 69) / 12); };
  var S = function () { return STY[cur]; };
  function pan(x) { if (AC.createStereoPanner) { var p = AC.createStereoPanner(); p.pan.value = x; return p; } return AC.createGain(); }
  function noise() { if (!noiseBuf) { var n = AC.sampleRate * 2, b = AC.createBuffer(1, n, AC.sampleRate), d = b.getChannelData(0); for (var i = 0; i < n; i++) d[i] = Math.random() * 2 - 1; noiseBuf = b; } var s = AC.createBufferSource(); s.buffer = noiseBuf; s.loop = true; return s; }
  function reverbIR(len, decay) { var n = Math.floor(AC.sampleRate * len), b = AC.createBuffer(2, n, AC.sampleRate), lp = [0, 0];
    for (var c = 0; c < 2; c++) { var d = b.getChannelData(c); for (var i = 0; i < n; i++) { var u = i / n, w = (Math.random() * 2 - 1) * Math.pow(1 - u, decay); lp[c] += (w - lp[c]) * (0.55 - 0.45 * u); d[i] = lp[c]; } } return b; }
  function init() { if (AC) return true; var C = window.AudioContext || window.webkitAudioContext; if (!C) return false; AC = new C();
    out = AC.createGain(); out.gain.value = 0; var hp = AC.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 38; hp.Q.value = 0.5;
    var comp = AC.createDynamicsCompressor(); comp.threshold.value = -20; comp.knee.value = 20; comp.ratio.value = 2.2; comp.attack.value = 0.02; comp.release.value = 0.35;
    var mk = AC.createGain(); mk.gain.value = 1.9; out.connect(hp); hp.connect(comp); comp.connect(mk); mk.connect(AC.destination);
    bus = AC.createGain(); bus.connect(out);
    rev = AC.createConvolver(); rev.buffer = reverbIR(4.2, 2.4); var rhp = AC.createBiquadFilter(); rhp.type = 'highpass'; rhp.frequency.value = 220; var rg = AC.createGain(); rg.gain.value = 0.55; rev.connect(rhp); rhp.connect(rg); rg.connect(out);
    var send = AC.createGain(); send.gain.value = 1; bus.connect(send); send.connect(rev); bus.rev = send;
    dly = AC.createGain(); var dl = AC.createDelay(2), dr = AC.createDelay(2), fb = AC.createGain(), lp = AC.createBiquadFilter(), pl = pan(-0.6), pr = pan(0.6), dg = AC.createGain();
    lp.type = 'lowpass'; lp.frequency.value = 2600; fb.gain.value = 0.36; dg.gain.value = 0.5; dly.connect(dl); dl.connect(pl); pl.connect(dg); dl.connect(dr); dr.connect(pr); pr.connect(dg); dr.connect(lp); lp.connect(fb); fb.connect(dl); dg.connect(bus); dg.connect(send);
    dly.dl = dl; dly.dr = dr; return true; }
  function spb() { return 60 / S().bpm / 4; }
  function chorus(src, dst, t, dur) {   // short modulated delay mixed with the dry signal for width
    var d = AC.createDelay(0.05), lfo = AC.createOscillator(), lg = AC.createGain(), g = AC.createGain(); d.delayTime.value = 0.017; lfo.frequency.value = 0.35 + Math.random() * 0.3; lg.gain.value = 0.004; lfo.connect(lg); lg.connect(d.delayTime);
    g.gain.value = 0.7; src.connect(d); d.connect(g); g.connect(dst); lfo.start(t); lfo.stop(t + dur); }
  function pad(ch, t, dur, k) {   // two detuned saws and a triangle per note through a slow low-pass, chorused and spread across the stereo field
    var st = S(), f = AC.createBiquadFilter(), g = AC.createGain(), L = AC.createGain(), cutoff = st.bright * (0.7 + 0.8 * moodV);
    f.type = 'lowpass'; f.Q.value = 0.6; f.frequency.setValueAtTime(cutoff * 0.45, t); f.frequency.linearRampToValueAtTime(cutoff, t + dur * 0.55); f.frequency.linearRampToValueAtTime(cutoff * 0.55, t + dur + 1.5);
    var a = 0.062 * st.pad; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(a, t + Math.min(2.4, dur * 0.3)); g.gain.setValueAtTime(a, t + dur * 0.72); g.gain.linearRampToValueAtTime(0, t + dur + 2.2); f.connect(g); g.connect(L); chorus(L, bus, t, dur + 3); L.connect(bus);
    ch.u.forEach(function (m, i) { [-7, 7].forEach(function (det, j) { var o = AC.createOscillator(), og = AC.createGain(), p = pan(((i + j) % 2 ? 1 : -1) * (0.15 + 0.12 * i));
      o.type = 'sawtooth'; o.frequency.value = hz(m); o.detune.value = det; og.gain.value = 0.05; o.connect(og); og.connect(p); p.connect(f); o.start(t); o.stop(t + dur + 2.4); });
      var tr = AC.createOscillator(), tg = AC.createGain(); tr.type = 'triangle'; tr.frequency.value = hz(m); tg.gain.value = 0.03; tr.connect(tg); tg.connect(f); tr.start(t); tr.stop(t + dur + 2.4); }); }
  function bassNote(m, t, len) { var st = S(), o = AC.createOscillator(), o2 = AC.createOscillator(), g = AC.createGain(), f = AC.createBiquadFilter();
    o.type = 'sine'; o2.type = 'triangle'; o.frequency.value = hz(m); o2.frequency.value = hz(m + 12); f.type = 'lowpass'; f.frequency.value = 520; var a = 0.085 * st.bass;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(a, t + 0.06); g.gain.setValueAtTime(a, t + len * 0.75); g.gain.linearRampToValueAtTime(0, t + len); var g2 = AC.createGain(); g2.gain.value = 0.35; o.connect(g); o2.connect(g2); g2.connect(g); g.connect(f); f.connect(out); o.start(t); o2.start(t); o.stop(t + len + 0.1); o2.stop(t + len + 0.1); }
  function ep(m, t, v, p) {   // electric-piano tone: sine carrier, 1:1 modulator whose depth decays, a quiet octave "tine"
    var c = AC.createOscillator(), md = AC.createOscillator(), mg = AC.createGain(), g = AC.createGain(), tn = AC.createOscillator(), tg = AC.createGain(), f = AC.createBiquadFilter(), pn = pan(p || 0), f0 = hz(m);
    c.frequency.value = f0; md.frequency.value = f0; mg.gain.setValueAtTime(f0 * 1.4 * v, t); mg.gain.exponentialRampToValueAtTime(f0 * 0.12, t + 0.5); md.connect(mg); mg.connect(c.frequency);
    tn.frequency.value = f0 * 2; tg.gain.setValueAtTime(0.25 * v, t); tg.gain.exponentialRampToValueAtTime(0.0001, t + 0.25); tn.connect(tg);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.1 * v, t + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.7); c.connect(g); tg.connect(g); f.type = 'lowpass'; f.frequency.value = 5200; g.connect(f); f.connect(pn);
    pn.connect(bus); pn.connect(dly); c.start(t); md.start(t); tn.start(t); c.stop(t + 1.8); md.stop(t + 1.8); tn.stop(t + 0.3); }
  function bell(m, t, v) { var c = AC.createOscillator(), md = AC.createOscillator(), mg = AC.createGain(), g = AC.createGain(), pn = pan((Math.random() - 0.5) * 0.7), f0 = hz(m);
    c.frequency.value = f0; md.frequency.value = f0 * 2.01; mg.gain.setValueAtTime(f0 * 0.9, t); mg.gain.exponentialRampToValueAtTime(1, t + 2.8);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.05 * v, t + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t + 3.6); md.connect(mg); mg.connect(c.frequency); c.connect(g); g.connect(pn); pn.connect(bus); pn.connect(dly); c.start(t); md.start(t); c.stop(t + 3.7); md.stop(t + 3.7); }
  function kick(t) { var o = AC.createOscillator(), g = AC.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(120, t); o.frequency.exponentialRampToValueAtTime(48, t + 0.18);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.12, t + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.32); o.connect(g); g.connect(out); o.start(t); o.stop(t + 0.35);
    var c = AC.createOscillator(), cg = AC.createGain(); c.type = 'triangle'; c.frequency.value = 180; cg.gain.setValueAtTime(0.03, t); cg.gain.exponentialRampToValueAtTime(0.0001, t + 0.05); c.connect(cg); cg.connect(out); c.start(t); c.stop(t + 0.06); }
  function hat(t, open) { var n = noise(), f = AC.createBiquadFilter(), g = AC.createGain(), pn = pan((Math.random() - 0.5) * 0.5); f.type = 'highpass'; f.frequency.value = 7500; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(open ? 0.028 : 0.02, t + 0.002); g.gain.exponentialRampToValueAtTime(0.0001, t + (open ? 0.22 : 0.05));
    n.connect(f); f.connect(g); g.connect(pn); pn.connect(bus); n.start(t, Math.random()); n.stop(t + 0.25); }
  function clap(t) { var n = noise(), f = AC.createBiquadFilter(), g = AC.createGain(); f.type = 'bandpass'; f.frequency.value = 1500; f.Q.value = 0.9; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.05, t + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18); n.connect(f); f.connect(g); g.connect(bus); n.start(t, Math.random()); n.stop(t + 0.2); }
  function air(t, dur) { var st = S(), n = noise(), f = AC.createBiquadFilter(), g = AC.createGain(), pn = AC.createStereoPanner ? AC.createStereoPanner() : AC.createGain(); f.type = 'bandpass'; f.frequency.setValueAtTime(2500, t); f.frequency.linearRampToValueAtTime(5200, t + dur); f.Q.value = 0.7;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.007 * st.air, t + dur * 0.5); g.gain.linearRampToValueAtTime(0, t + dur); if (pn.pan) pn.pan.setValueAtTime(-0.5, t), pn.pan.linearRampToValueAtTime(0.5, t + dur); n.connect(f); f.connect(g); g.connect(pn); pn.connect(bus); n.start(t, Math.random()); n.stop(t + dur + 0.1); }
  var ARP = [[0, 1, 2, 3, 2, 1, 4, 3], [1, 2, 3, 4, 3, 2, 1, 0], [0, 2, 1, 3, 2, 4, 3, 1], [2, 3, 4, 3, 2, 1, 0, 1]];
  function schedule() { var q = spb(); while (nextT < AC.currentTime + 0.2) { var t = nextT, st = S(), s = step % 64, bi = Math.floor(step / 64), ch = PROG[bi % 4], inten = Math.max(0, Math.min(1, 0.3 + 0.25 * Math.sin((t - t0) / 38) + 0.45 * moodV));
      if (s === 0) { pad(ch, t, 64 * q, bi); air(t, 64 * q); bassNote(ch.b, t, 32 * q); if (st.bass > 0.6) bassNote(ch.b, t + 32 * q, 32 * q); }
      // arpeggio on 8th notes (every other 16th), pattern per chord, thinner when the picture is calm
      if (s % 2 === 0 && Math.random() < st.arp * (0.45 + 0.7 * inten)) { var idx = ARP[bi % 4][(s / 2) % 8], note = ch.u[idx % ch.u.length] + (idx > 3 ? 0 : 12); ep(note, t, 0.6 + 0.4 * Math.random(), (Math.random() - 0.5) * 0.7); }
      // bell melody: the motif, two notes a bar at the start of beats 2 and 4 of every second bar
      if ((s === 16 || s === 48) && bi % 2 === 1 && Math.random() < st.bell + 0.2 * inten) { var mi = ((step >> 4) + bi) % MOTIF.length; bell(PENTA[MOTIF[mi]], t, 0.7 + 0.3 * inten); if (Math.random() < 0.5) bell(PENTA[MOTIF[(mi + 1) % MOTIF.length]], t + q * 3, 0.55); }
      if (st.drums && inten > 0.25) { if (s % 16 === 0 || (s % 16 === 10 && inten > 0.55)) kick(t); if (s % 16 === 8) clap(t); if (s % 2 === 0) hat(t + (s % 4 === 2 ? 0.01 : 0), s % 8 === 6); }
      if (st.bass > 0.9 && s % 8 === 6 && inten > 0.4) bassNote(ch.b + 12, t, q * 1.6);
      step++; nextT += q; } }
  var api = {
    styles: ['horizon', 'pulse', 'orbit'],
    style: function (n) { if (n && STY[n]) { var was = on; cur = n; if (was && AC) { step = Math.ceil(step / 64) * 64; out.gain.cancelScheduledValues(AC.currentTime); out.gain.setValueAtTime(out.gain.value, AC.currentTime); out.gain.linearRampToValueAtTime(0.9 * STY[cur].trim, AC.currentTime + 1.5); } } return cur; },
    start: function () { if (!init()) return false; AC.resume(); on = true; out.gain.cancelScheduledValues(AC.currentTime); out.gain.setValueAtTime(out.gain.value, AC.currentTime); out.gain.linearRampToValueAtTime(0.9 * STY[cur].trim, AC.currentTime + 2.5);
      if (!timer) { step = 0; t0 = AC.currentTime; nextT = AC.currentTime + 0.1; timer = setInterval(schedule, 40); } return true; },
    stop: function () { on = false; if (!AC) return; out.gain.cancelScheduledValues(AC.currentTime); out.gain.setValueAtTime(out.gain.value, AC.currentTime); out.gain.linearRampToValueAtTime(0, AC.currentTime + 0.8);
      setTimeout(function () { if (!on && timer) { clearInterval(timer); timer = null; } }, 900); },
    on: function () { return on; },
    mood: function (x) { moodV = Math.max(0, Math.min(1, x)); },
    chime: function (veryClose) { if (!on || !AC) return; var t = AC.currentTime; if (t - lastChime < 0.25) return; lastChime = t; bell(veryClose ? 88 : 83, t, veryClose ? 1 : 0.7); }
  };
  return api;
})();
