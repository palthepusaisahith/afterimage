/* THE AFTERIMAGE — opt-in score.
   An original, slow, dark analog-synth cue synthesized live with Web Audio:
   detuned arpeggio through a resonant filter that opens across the intro, a
   pulsing sub bass, chorused pads, long reverb, ping-pong delay, slight tape
   wobble and a faint hiss bed. Cued to the opening: signal blips, CRT swell, sun
   pad, bass under the bands, arpeggio as the name rises, a bell per letter of
   PALTHEPU, a chord on the settle flicker — then a quiet loop.
   Never starts without a click. If assets/intro-music.mp3 exists it plays instead. */
(function () {
  const BPM = 84, S8 = 60 / BPM / 2, BAR = S8 * 8;
  const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);
  // E minor: Em – Cmaj7 – G/D – D, one bar each
  const CHORDS = [[40, 47, 52, 55, 59], [36, 43, 52, 55, 59], [38, 43, 50, 55, 59], [38, 45, 50, 54, 57]];
  const ARP = [0, 2, 3, 1, 2, 4, 3, 2];

  let ctx = null, master, wet, bus, hiss = null, wobble, on = false, loopTimer = null, nextBar = 0, bar = 0;
  let file = null, fileChecked = false, cutoff;

  function impulse(sec) {
    const len = ctx.sampleRate * sec, b = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) { const d = b.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6); }
    return b;
  }
  function init() {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain(); master.gain.value = 0;
    const warmth = ctx.createBiquadFilter(); warmth.type = 'lowshelf'; warmth.frequency.value = 180; warmth.gain.value = 3;
    const air = ctx.createBiquadFilter(); air.type = 'highshelf'; air.frequency.value = 7000; air.gain.value = -6;
    const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -20; comp.ratio.value = 3; comp.attack.value = 0.01; comp.release.value = 0.3;
    master.connect(warmth).connect(air).connect(comp).connect(ctx.destination);
    bus = ctx.createGain(); bus.connect(master);
    // long hall
    const rev = ctx.createConvolver(); rev.buffer = impulse(4.5);
    wet = ctx.createGain(); wet.gain.value = 0.42;
    wet.connect(rev).connect(master);
    // ping-pong delay, dotted eighth
    const merger = ctx.createChannelMerger(2);
    const dL = ctx.createDelay(2), dR = ctx.createDelay(2); dL.delayTime.value = S8 * 1.5; dR.delayTime.value = S8 * 1.5;
    const fb = ctx.createGain(); fb.gain.value = 0.38;
    const dlp = ctx.createBiquadFilter(); dlp.type = 'lowpass'; dlp.frequency.value = 2200;
    wet.connect(dL); dL.connect(merger, 0, 0); dL.connect(dR); dR.connect(merger, 0, 1); dR.connect(dlp).connect(fb).connect(dL);
    const dg = ctx.createGain(); dg.gain.value = 0.5; merger.connect(dg).connect(master);
    // tape wobble shared by all pitched voices
    wobble = ctx.createOscillator(); wobble.frequency.value = 0.35;
    const wd = ctx.createGain(); wd.gain.value = 6; wobble.connect(wd); wobble.start();
    wobble.out = wd;
    // arpeggio filter cutoff — opened across the intro
    cutoff = ctx.createConstantSource ? ctx.createConstantSource() : null;
    if (cutoff) { cutoff.offset.value = 500; cutoff.start(); }
  }
  const send = (node, dry = 1, w = 1) => {
    const g = ctx.createGain(); g.gain.value = dry; node.connect(g).connect(bus);
    const h = ctx.createGain(); h.gain.value = w; node.connect(h).connect(wet);
  };
  function osc(type, f, t, end, det = 0) {
    const o = ctx.createOscillator(); o.type = type; o.frequency.value = f; o.detune.value = det;
    wobble.out.connect(o.detune); o.start(t); o.stop(end); return o;
  }

  function arpNote(m, t, vel) {
    const end = t + S8 * 2.2;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = 9;
    if (cutoff) { lp.frequency.value = 0; cutoff.connect(lp.frequency); } else lp.frequency.value = 900;
    const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.09 * vel, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, end);
    [['sawtooth', -9], ['square', 9]].forEach(([ty, d]) => osc(ty, hz(m + 12), t, end + 0.05, d).connect(lp));
    lp.connect(g); send(g, 0.9, 0.7);
  }
  function pad(chord, t, dur, lvl = 0.03) {
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 700; lp.Q.value = 1;
    const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(lvl, t + dur * 0.45); g.gain.linearRampToValueAtTime(0.0001, t + dur);
    chord.slice(1).forEach((m) => [-11, 0, 11].forEach((d) => osc('sawtooth', hz(m), t, t + dur + 0.1, d).connect(lp)));
    lp.connect(g); send(g, 0.7, 0.9);
  }
  function bass(m, t, len = S8 * 1.7, lvl = 0.16) {
    const end = t + len;
    const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(lvl, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, end);
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(600, t); lp.frequency.exponentialRampToValueAtTime(140, end);
    osc('sine', hz(m - 12), t, end + 0.05).connect(g);
    osc('sawtooth', hz(m), t, end + 0.05, 4).connect(lp).connect(g);
    send(g, 1, 0.08);
  }
  function bell(m, t) {
    const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.06, t + 0.005); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.6);
    osc('triangle', hz(m + 24), t, t + 1.7).connect(g);
    osc('sine', hz(m + 31), t, t + 1.7).connect(g);
    send(g, 0.6, 1.2);
  }
  function blip(t) {
    const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.09, t + 0.005); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
    osc('sine', hz(88), t, t + 0.55).connect(g); send(g, 0.6, 1.2);
  }
  function noise(sec) {
    const len = ctx.sampleRate * sec, b = ctx.createBuffer(1, len, ctx.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const n = ctx.createBufferSource(); n.buffer = b; return n;
  }
  function swell(t, dur) {
    const n = noise(dur);
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 5;
    bp.frequency.setValueAtTime(150, t); bp.frequency.exponentialRampToValueAtTime(4200, t + dur * 0.75);
    const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.06, t + dur * 0.6); g.gain.linearRampToValueAtTime(0.0001, t + dur);
    n.connect(bp).connect(g); send(g, 0.5, 1.2); n.start(t);
  }
  function startHiss() {
    if (hiss) return;
    hiss = noise(4); hiss.loop = true;
    const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 3500;
    const g = ctx.createGain(); g.gain.value = 0.006;
    hiss.connect(hp).connect(g).connect(master); hiss.start();
  }
  function playBar(t, idx, intensity) {
    const ch = CHORDS[idx % 4];
    for (let k = 0; k < 8; k++) arpNote(ch[ARP[k]] + (k === 7 && idx % 2 ? 12 : 0), t + k * S8, intensity * (k % 2 ? 0.75 : 1));
    for (let k = 0; k < 4; k++) bass(ch[0], t + k * S8 * 2, S8 * 1.6, 0.12 + 0.05 * intensity);
    pad(ch, t, BAR, 0.018 + 0.016 * intensity);
  }

  /* the opening cue, aligned with hero.js timings (seconds from the sequence start) */
  function intro(t0) {
    sfx('thunk');
    blip(t0 + 0.35); blip(t0 + 0.85);
    swell(t0 + 1.05, 1.2);
    pad(CHORDS[0], t0 + 1.85, 3.2, 0.032);
    for (let k = 0; k < 5; k++) bass(CHORDS[0][0], t0 + 2.05 + k * S8 * 1.0, S8 * 0.9, 0.1 + k * 0.015);
    // the filter opens as the name rises and the arpeggio enters
    if (cutoff) {
      cutoff.offset.cancelScheduledValues(t0);
      cutoff.offset.setValueAtTime(380, t0 + 3.9);
      cutoff.offset.exponentialRampToValueAtTime(2600, t0 + 7.25);
      cutoff.offset.exponentialRampToValueAtTime(1300, t0 + 10.5);
    }
    const start = t0 + 3.95;
    for (let k = 0; start + k * S8 < t0 + 7.2; k++) {
      const ch = CHORDS[Math.floor(k / 8) % 4 === 0 ? 0 : 1];
      arpNote(ch[ARP[k % 8]], start + k * S8, 0.7 + k * 0.04);
      if (k % 2 === 0) bass(ch[0], start + k * S8, S8 * 1.6, 0.14);
    }
    // a bell for each letter of PALTHEPU
    [64, 67, 71, 74, 76, 74, 71, 79].forEach((m, i) => bell(m, t0 + 5.35 + i * 0.075));
    // the settle chord on the flicker
    pad([40, 47, 52, 55, 59, 64], t0 + 7.25, 5, 0.05);
    bass(40, t0 + 7.25, 2.2, 0.2);
    bell(64, t0 + 7.25);
    nextBar = t0 + 7.25 + BAR; bar = 1;
  }
  // quiet loop under the rest of the broadcast
  function schedule() {
    if (!on) return;
    while (nextBar < ctx.currentTime + 1.5) { playBar(nextBar, bar++, 0.5); nextBar += BAR; }
    loopTimer = setTimeout(schedule, 400);
  }

  async function checkFile() {
    if (fileChecked) return file;
    fileChecked = true;
    try { const r = await fetch('assets/intro-music.mp3', { method: 'HEAD' }); if (r.ok) { file = new Audio('assets/intro-music.mp3'); file.loop = true; file.volume = 0.6; } } catch (e) { /* no file */ }
    return file;
  }

  async function start(syncHero) {
    on = true;
    const f = await checkFile();
    if (syncHero && AFTER.reels.hero) AFTER.reels.hero.replay();
    if (f) { f.currentTime = 0; f.play(); return; }
    if (!ctx) init();
    await ctx.resume();
    startHiss();
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
    master.gain.linearRampToValueAtTime(1.5, ctx.currentTime + 0.3);
    const t0 = ctx.currentTime + 0.02;
    if (syncHero) intro(t0);
    else { if (cutoff) cutoff.offset.setValueAtTime(1300, t0); nextBar = t0; bar = 0; }
    schedule();
  }
  function stop() {
    on = false; clearTimeout(loopTimer);
    if (file) file.pause();
    if (ctx) { master.gain.cancelScheduledValues(ctx.currentTime); master.gain.setValueAtTime(master.gain.value, ctx.currentTime); master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.8); setTimeout(() => !on && ctx.suspend(), 900); }
  }

  function wire() {
    const tool = document.getElementById('sound-toggle');
    const heroBtn = document.getElementById('sound-intro');
    const sync = () => {
      tool.setAttribute('aria-pressed', String(on));
      tool.querySelector('span').textContent = on ? 'Sound on' : 'Sound off';
      heroBtn.textContent = on ? '♪ Sound on' : '♪ Play intro with sound';
    };
    tool.addEventListener('click', async () => { on ? stop() : await start(false); sync(); });
    heroBtn.addEventListener('click', async () => { if (on) stop(); else await start(true); sync(); });
    sync();
  }
  /* ---------- set sounds: only while sound is on ---------- */
  function ready() { if (!on) return false; if (!ctx) { init(); master.gain.value = 1.5; } return ctx.state !== 'closed'; }
  function sfx(name) {
    if (!ready()) return;
    const t = ctx.currentTime + 0.01;
    if (name === 'static' || name === 'whirr') {
      const dur = name === 'static' ? 0.36 : 0.5;
      const n = noise(dur);
      const bp = ctx.createBiquadFilter(); bp.type = name === 'static' ? 'highpass' : 'bandpass';
      bp.frequency.value = name === 'static' ? 1800 : 900; bp.Q.value = 3;
      if (name === 'whirr') bp.frequency.exponentialRampToValueAtTime(2600, t + dur);
      const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(name === 'static' ? 0.07 : 0.035, t + 0.03); g.gain.linearRampToValueAtTime(0.0001, t + dur);
      n.connect(bp).connect(g).connect(master); n.start(t);
    } else if (name === 'clunk') {
      const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.25, t + 0.005); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
      const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(48, t + 0.15);
      o.connect(g).connect(master); o.start(t); o.stop(t + 0.2);
      const c = noise(0.03); const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 3000;
      const cg = ctx.createGain(); cg.gain.value = 0.05; c.connect(hp).connect(cg).connect(master); c.start(t + 0.04);
    } else if (name === 'thunk') {
      // a set powering on: degauss thump, a breath of mains hum, the faint line whine
      const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.28, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
      const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(90, t); o.frequency.exponentialRampToValueAtTime(32, t + 0.5);
      o.connect(g).connect(master); o.start(t); o.stop(t + 0.65);
      const h = ctx.createGain(); h.gain.setValueAtTime(0.0001, t); h.gain.linearRampToValueAtTime(0.03, t + 0.1); h.gain.linearRampToValueAtTime(0.0001, t + 1.2);
      const ho = ctx.createOscillator(); ho.type = 'sawtooth'; ho.frequency.value = 50;
      const hl = ctx.createBiquadFilter(); hl.type = 'lowpass'; hl.frequency.value = 220;
      ho.connect(hl).connect(h).connect(master); ho.start(t); ho.stop(t + 1.25);
      const w = ctx.createGain(); w.gain.setValueAtTime(0.0001, t); w.gain.linearRampToValueAtTime(0.006, t + 0.2); w.gain.linearRampToValueAtTime(0.0001, t + 1.6);
      const wo = ctx.createOscillator(); wo.type = 'sine'; wo.frequency.value = 7800; wo.connect(w).connect(master); wo.start(t); wo.stop(t + 1.7);
    }
  }
  // the test card's line-up tone; returns a stop function
  function tone() {
    if (!ready()) return null;
    const t = ctx.currentTime;
    const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.025, t + 0.4);
    const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = 440; o.connect(g).connect(master); o.start(t);
    return () => { const n = ctx.currentTime; g.gain.cancelScheduledValues(n); g.gain.setValueAtTime(g.gain.value, n); g.gain.linearRampToValueAtTime(0.0001, n + 0.3); o.stop(n + 0.35); };
  }

  AFTER.sound = { start, stop, wire, sfx, tone, get on() { return on; } };
})();
