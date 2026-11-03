/* THE AFTERIMAGE — the television around the broadcast.
   Remote-control keys, a VCR on-screen display, static between stations,
   rewind / fast-forward tracking when you scroll fast, and a late-night test
   card when nobody has touched the set for a minute. */
(function () {
  const { E, state } = AFTER;
  const CHANNELS = [
    ['top', '00', 'PALTHEPU SAI SAHITH', '#ffb01f'],
    ['about', '01', 'INTRODUCTION', '#ffb01f'],
    ['skills', '02', 'SKILLS', '#ffd23a'],
    ['experience', '03', 'PROGRAMME LOG', '#ffb01f'],
    ['topology', '04', 'HIDDEN STRUCTURE', '#8a6bff'],
    ['chaosagent', '05', 'CHAOSAGENT', '#ff4a2a'],
    ['praxismirror', '06', 'PRAXISMIRROR', '#1fe3b2'],
    ['pneumonet', '07', 'PNEUMONET', '#6ee36a'],
    ['contact', '08', 'SIGN-OFF', '#ffd23a']
  ];
  const sfx = (n) => AFTER.sound && AFTER.sound.sfx && AFTER.sound.sfx(n);

  /* ---------- on-screen display ---------- */
  const osdEl = document.createElement('div');
  osdEl.id = 'osd'; osdEl.setAttribute('role', 'status'); osdEl.setAttribute('aria-live', 'polite');
  document.body.appendChild(osdEl);
  let osdTimer;
  function osd(line, sub, ms = 2600) {
    osdEl.innerHTML = `<b>${line}</b>${sub ? `<span>${sub}</span>` : ''}`;
    osdEl.classList.add('on');
    clearTimeout(osdTimer);
    if (ms) osdTimer = setTimeout(() => osdEl.classList.remove('on'), ms);
  }

  /* ---------- static between stations ---------- */
  const tuner = document.getElementById('tuner');
  const sc = document.createElement('canvas');
  sc.className = 'static'; sc.width = 192; sc.height = 108;
  tuner.insertBefore(sc, tuner.firstChild);
  const sctx = sc.getContext('2d');
  const img = sctx.createImageData(192, 108);
  function staticBurst(dur = 0.32) {
    sfx('static');
    const end = performance.now() + dur * 1000;
    sc.style.opacity = 1;
    const frame = () => {
      const d = img.data;
      for (let i = 0; i < d.length; i += 4) { const r = Math.random(); const v = r * r * 235; d[i] = v; d[i + 1] = v * 0.96; d[i + 2] = v * 0.9; d[i + 3] = 255; }
      sctx.putImageData(img, 0, 0);
      if (performance.now() < end) requestAnimationFrame(frame); else sc.style.opacity = 0;
    };
    frame();
  }

  /* ---------- which channel is on ---------- */
  function current() {
    const y = window.scrollY + innerHeight / 3;
    let idx = 0;
    CHANNELS.forEach(([id], i) => { const el = document.getElementById(id); if (el && el.offsetTop <= y) idx = i; });
    return idx;
  }
  function go(i) {
    const n = (i + CHANNELS.length) % CHANNELS.length;
    const [id, , name, color] = CHANNELS[n];
    AFTER.tune(id, color, name);
  }
  function announce(id) {
    const ch = CHANNELS.find((c) => c[0] === id);
    if (ch) osd(`CH ${ch[1]}`, `▶ ${ch[2]}`);
  }

  /* ---------- remote control ---------- */
  addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const t = e.target;
    if (t.closest && t.closest('input, select, textarea, [contenteditable]')) return;
    if (testcardOn) return;
    if (AFTER.gameActive || (AFTER.extras && AFTER.extras.open)) return;
    if (e.key === 'g' || e.key === 'G') { e.preventDefault(); AFTER.extras.guide(); return; }
    if (/^[0-8]$/.test(e.key)) { e.preventDefault(); go(+e.key); return; }
    if (e.key === 'ArrowRight' && !e.shiftKey) { e.preventDefault(); go(current() + 1); return; }
    if (e.key === 'ArrowLeft' && !e.shiftKey) { e.preventDefault(); go(current() - 1); return; }
    if (e.key === 'm' || e.key === 'M') {
      document.getElementById('sound-toggle').click();
      setTimeout(() => osd(AFTER.sound.on ? '♪ SOUND' : '✕ MUTE', null, 1600), 30);
    }
  });

  /* ---------- rewind / fast-forward ---------- */
  const track = document.createElement('div');
  track.id = 'tracking'; track.setAttribute('aria-hidden', 'true'); track.innerHTML = '<i></i><i></i>';
  document.body.appendChild(track);
  let lastY = window.scrollY, lastT = performance.now(), fastHits = 0, mode = null, stopTimer;
  const tape = () => {
    const f = window.scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight);
    const s = Math.round(f * 30 * 60);
    return `${String(Math.floor(s / 3600)).padStart(1, '0')}:${String(Math.floor(s / 60) % 60).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  };
  addEventListener('scroll', () => {
    const now = performance.now(), y = window.scrollY;
    const v = (y - lastY) / Math.max(1, now - lastT);
    lastY = y; lastT = now;
    if (!state.motion || document.documentElement.classList.contains('tuning')) return;
    if (Math.abs(v) > 3.2) fastHits++; else fastHits = Math.max(0, fastHits - 1);
    if (fastHits >= 2) {
      const m = v < 0 ? 'rew' : 'ff';
      if (m !== mode) { mode = m; track.className = 'on ' + m; sfx('whirr'); }
      osd(m === 'rew' ? '◀◀ REW' : '▶▶ FF', tape(), 0);
    }
    clearTimeout(stopTimer);
    stopTimer = setTimeout(() => {
      if (!mode) return;
      mode = null; fastHits = 0; track.className = '';
      osd('▶ PLAY', tape(), 1400);
    }, 220);
  }, { passive: true });

  /* ---------- late-night test card ---------- */
  const card = document.createElement('div');
  card.id = 'testcard'; card.className = 'screen'; card.setAttribute('aria-hidden', 'true');
  card.innerHTML = '<svg class="scene" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice"></svg>';
  document.body.appendChild(card);
  const svg = card.querySelector('svg');
  let clockEl, dateEl;
  function drawCard() {
    const root = E('g', { filter: 'url(#phos-lite)' }, svg);
    E('rect', { x: 0, y: 0, width: 1600, height: 900, fill: '#050304' }, root);
    const bars = ['#efe6cf', '#e8d23a', '#3fd8e8', '#56d65a', '#d24fc4', '#e83a24', '#3e57e8'];
    bars.forEach((c, i) => E('rect', { x: i * (1600 / 7), y: 0, width: 1600 / 7 + 1, height: 560, fill: c }, root));
    [...bars].reverse().forEach((c, i) => E('rect', { x: i * (1600 / 7), y: 560, width: 1600 / 7 + 1, height: 60, fill: i % 2 ? '#0b0708' : c }, root));
    for (let i = 0; i < 8; i++) E('rect', { x: i * 200, y: 620, width: 200, height: 280, fill: `rgb(${12 + i * 26},${10 + i * 24},${9 + i * 22})` }, root);
    // centre disc with a fine grid and the monogram
    const cl = E('clipPath', { id: 'tc-disc' }, svg); E('circle', { cx: 800, cy: 450, r: 300 }, cl);
    const disc = E('g', { 'clip-path': 'url(#tc-disc)' }, root);
    E('rect', { x: 500, y: 150, width: 600, height: 600, fill: '#070405' }, disc);
    for (let k = 0; k <= 12; k++) {
      E('line', { x1: 500 + k * 50, x2: 500 + k * 50, y1: 150, y2: 750, stroke: '#3a2a20', 'stroke-width': 2 }, disc);
      E('line', { y1: 150 + k * 50, y2: 150 + k * 50, x1: 500, x2: 1100, stroke: '#3a2a20', 'stroke-width': 2 }, disc);
    }
    [[0, '#ff3a1c'], [1, '#ffb01f'], [2, '#4f69ff']].forEach(([k, c]) => E('rect', { x: 500, y: 540 + k * 22, width: 600, height: 12, fill: c }, disc));
    E('circle', { cx: 800, cy: 450, r: 300, fill: 'none', stroke: '#fff1cf', 'stroke-width': 6 }, root);
    E('circle', { cx: 800, cy: 450, r: 150, fill: 'none', stroke: '#fff1cf', 'stroke-width': 2, opacity: 0.6 }, root);
    E('line', { x1: 800, x2: 800, y1: 150, y2: 750, stroke: '#fff1cf', 'stroke-width': 2, opacity: 0.6 }, root);
    E('line', { x1: 500, x2: 1100, y1: 450, y2: 450, stroke: '#fff1cf', 'stroke-width': 2, opacity: 0.6 }, root);
    const mono = E('text', { x: 800, y: 505, 'text-anchor': 'middle', 'font-family': 'Fraunces', 'font-weight': 900, 'font-size': 170, fill: '#fff1cf', style: 'font-variation-settings:"SOFT" 100' }, root);
    mono.textContent = 'PSS';
    // caption plate
    E('rect', { x: 560, y: 780, width: 480, height: 82, rx: 4, fill: '#050304', stroke: '#ffb01f', 'stroke-width': 3 }, root);
    const t1 = E('text', { x: 800, y: 814, 'text-anchor': 'middle', 'font-family': 'Dela Gothic One', 'font-size': 24, 'letter-spacing': 5, fill: '#ffb01f' }, root);
    t1.textContent = 'PALTHEPU SAI SAHITH';
    clockEl = E('text', { x: 800, y: 848, 'text-anchor': 'middle', 'font-family': 'IBM Plex Mono', 'font-weight': 600, 'font-size': 22, 'letter-spacing': 4, fill: '#fff1cf' }, root);
    const sb = E('text', { x: 800, y: 120, 'text-anchor': 'middle', 'font-family': 'Dela Gothic One', 'font-size': 40, 'letter-spacing': 12, fill: '#050304' }, root);
    sb.textContent = 'STAND BY';
    dateEl = E('text', { x: 800, y: 600 + 0, 'text-anchor': 'middle', 'font-family': 'IBM Plex Mono', 'font-size': 18, 'letter-spacing': 6, fill: '#050304' }, root);
    dateEl.setAttribute('y', 890); dateEl.setAttribute('fill', '#fff1cf'); dateEl.setAttribute('font-size', 15);
    dateEl.textContent = 'MOVE THE MOUSE OR PRESS ANY KEY TO RETURN';
  }
  drawCard();
  let testcardOn = false, idleTimer, clockTimer, stopTone = null;
  const tick = () => {
    const d = new Date();
    clockEl.textContent = `${d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }).toUpperCase()}  ${d.toTimeString().slice(0, 8)}`;
  };
  function showCard() {
    if (testcardOn || document.hidden) return;
    testcardOn = true; tick(); clockTimer = setInterval(tick, 1000);
    card.classList.add('on');
    if (state.motion) gsap.fromTo(card, { scaleY: 0.004, filter: 'brightness(2.4)' }, { scaleY: 1, filter: 'brightness(1)', duration: 0.5, ease: 'power3.out' });
    stopTone = AFTER.sound && AFTER.sound.tone ? AFTER.sound.tone() : null;
  }
  function hideCard() {
    if (!testcardOn) return;
    testcardOn = false; clearInterval(clockTimer);
    if (stopTone) { stopTone(); stopTone = null; }
    const done = () => { card.classList.remove('on'); gsap.set(card, { clearProps: 'transform,filter' }); };
    if (state.motion) gsap.to(card, { scaleY: 0.004, filter: 'brightness(2.4)', duration: 0.25, ease: 'power3.in', onComplete: done });
    else done();
    osd('▶ BACK ON AIR', null, 1600);
  }
  const IDLE_MS = 60000;
  function activity() {
    if (testcardOn) hideCard();
    clearTimeout(idleTimer);
    idleTimer = setTimeout(showCard, IDLE_MS);
  }
  ['pointermove', 'pointerdown', 'keydown', 'wheel', 'touchstart', 'scroll'].forEach((ev) => addEventListener(ev, activity, { passive: true }));
  document.addEventListener('visibilitychange', () => { if (document.hidden) clearTimeout(idleTimer); else activity(); });

  // run the channel-change machinery once, invisibly, so the first real change is as quick as the rest
  function warm() {
    const slate = tuner.querySelector('.slate');
    tuner.style.opacity = 0.001; sc.style.opacity = 1;
    const d = img.data; for (let i = 0; i < d.length; i += 4) { d[i] = d[i + 1] = d[i + 2] = 40; d[i + 3] = 255; }
    sctx.putImageData(img, 0, 0);
    const main = document.getElementById('main');
    gsap.set(main, { scaleY: 0.999, transformOrigin: '50% 50%' });
    requestAnimationFrame(() => requestAnimationFrame(() => {
      tuner.style.opacity = ''; sc.style.opacity = 0; slate.style.opacity = '';
      gsap.set(main, { clearProps: 'transform' });
    }));
  }

  function init() {
    document.addEventListener('hero:done', () => setTimeout(warm, 300), { once: true });
    activity();
    // one-time hint for keyboard users on desktop
    let seen = false;
    try { seen = sessionStorage.getItem('tv-hint') === '1'; sessionStorage.setItem('tv-hint', '1'); } catch (e) { /* storage blocked */ }
    if (!seen && matchMedia('(pointer: fine)').matches) {
      document.addEventListener('hero:done', () => osd('REMOTE', '1–8 CHANNELS · ← → SURF · G GUIDE · M MUTE', 4200), { once: true });
    }
  }

  AFTER.tv = { osd, staticBurst, announce, init, showCard };
})();
