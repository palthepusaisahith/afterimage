/* THE AFTERIMAGE — the rest of the schedule.
   VHS shelf for the projects, a sky that follows the visitor's clock, end credits,
   station ads and a TV Guide (G). */
(function () {
  const { E, PAL, state } = AFTER;
  const sfx = (n) => AFTER.sound && AFTER.sound.sfx && AFTER.sound.sfx(n);
  const motion = () => state.motion;

  /* ================= sky follows the clock ================= */
  const SKIES = {
    dawn: { label: 'DAWN BROADCAST', sun: ['#fff2f7', '#ffb8d4', '#ff7aa8', '#e2457a'], glow: '#7a1440' },
    day: { label: 'DAYTIME BROADCAST', sun: ['#fff8d0', '#ffd23a', '#ffa21f', '#ff6a1c'], glow: '#6a2a08' },
    dusk: { label: 'EVENING BROADCAST', sun: null, glow: null },
    night: { label: 'LATE-NIGHT BROADCAST', sun: ['#ffffff', '#e8eeff', '#aab9ff', '#5a6fd8'], glow: '#0c1a5e' }
  };
  function skyNow() {
    const h = new Date().getHours();
    return h >= 5 && h < 8 ? 'dawn' : h >= 8 && h < 16 ? 'day' : h >= 16 && h < 19 ? 'dusk' : 'night';
  }
  function applySky(svg) {
    const sky = SKIES[skyNow()];
    if (sky.sun) svg.querySelectorAll('#h-sun stop').forEach((st, i) => st.setAttribute('stop-color', sky.sun[i] || sky.sun[sky.sun.length - 1]));
    if (sky.glow) { const g = svg.querySelector('#h-glow stop'); if (g) g.setAttribute('stop-color', sky.glow); }
    const note = document.getElementById('sky-note');
    if (note) {
      const d = new Date();
      note.textContent = `LOCAL TIME ${d.toTimeString().slice(0, 5)} · ${sky.label}`;
    }
  }
  // every time the opening is (re)composed, it takes the visitor's sky
  const buildHero = AFTER.buildHero;
  AFTER.buildHero = (svg) => { const tl = buildHero(svg); applySky(svg); return tl; };

  /* ================= VHS shelf ================= */
  function cover(svg, kind) {
    const W = 240, H = 380;
    const g = E('g', null, svg);
    E('rect', { x: 0, y: 0, width: W, height: H, rx: 6, fill: '#0b0708' }, g);
    E('rect', { x: 0, y: 0, width: W, height: 30, fill: '#fff1cf' }, g);
    const brand = E('text', { x: 12, y: 21, 'font-family': 'Dela Gothic One', 'font-size': 13, 'letter-spacing': 2, fill: '#0b0708' }, g);
    brand.textContent = 'AFTERIMAGE VIDEO';
    const art = E('g', null, g);
    if (kind === 'chaos') {
      E('rect', { x: 10, y: 40, width: 220, height: 220, fill: '#05061a' }, art);
      E('circle', { cx: 62, cy: 82, r: 18, fill: '#cfe9ff' }, art); E('circle', { cx: 70, cy: 77, r: 16, fill: '#05061a' }, art);
      E('path', { d: 'M150 250 V170 h18 v-24 h14 v-18 h6 l6 -26 l6 26 h6 v18 h14 v24 h18 V250 Z', fill: '#0a0512', stroke: '#ff3a1c', 'stroke-width': 2 }, art);
      for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) E('rect', { x: 160 + c * 14, y: 182 + r * 16, width: 6, height: 9, fill: (r + c) % 3 ? '#ffb01f' : '#3a2a10' }, art);
      E('path', { d: 'M20 200 Q55 214 80 198 M104 200 Q128 214 150 190', stroke: '#52e4ff', 'stroke-width': 2.5, fill: 'none' }, art);
      E('path', { d: 'M80 198 l8 16 M104 200 l-8 14', stroke: '#ff3a1c', 'stroke-width': 2.5, fill: 'none' }, art);
      [['#ff3a1c', 238], ['#ffb01f', 246], ['#4f69ff', 254]].forEach(([c, y]) => E('rect', { x: 10, y, width: 220, height: 5, fill: c }, art));
      [['CHAOS', 296], ['AGENT', 344]].forEach(([w, y]) => { const t = E('text', { x: 120, y, 'text-anchor': 'middle', 'font-family': 'Anton', 'font-size': 52, fill: '#fff1cf' }, g); t.textContent = w; });
    } else if (kind === 'praxis') {
      E('rect', { x: 14, y: 44, width: 212, height: 200, rx: 22, fill: '#f5a8d6', stroke: '#ffd23a', 'stroke-width': 5 }, art);
      E('circle', { cx: 160, cy: 180, r: 34, fill: '#ffd23a' }, art);
      E('path', { d: 'M30 150 L80 150 L80 156 L46 156 Z M52 156 L58 210 L64 210 L60 156 Z M120 142 L190 142 L190 148 L136 148 Z M146 148 L152 210 L158 210 L154 148 Z', fill: '#140812' }, art);
      E('path', { d: 'M14 120 H90 L110 160 H226', stroke: '#fff1cf', 'stroke-width': 4, fill: 'none' }, art);
      E('path', { d: 'M14 175 H70 L100 130 H226', stroke: '#4f69ff', 'stroke-width': 4, fill: 'none' }, art);
      E('rect', { x: 14, y: 210, width: 212, height: 18, fill: '#1fe3b2' }, art);
      [[30, '#1fe3b2'], [62, '#c2306d'], [94, '#fff1cf']].forEach(([x, c]) => E('rect', { x, y: 192, width: 28, height: 18, fill: c, stroke: '#140812' }, art));
      const t = E('text', { x: 120, y: 300, 'text-anchor': 'middle', 'font-family': 'Dela Gothic One', 'font-size': 26, fill: '#ffd23a' }, g); t.textContent = 'PRAXIS';
      const t2 = E('text', { x: 120, y: 336, 'text-anchor': 'middle', 'font-family': 'Dela Gothic One', 'font-size': 26, fill: '#ffd23a' }, g); t2.textContent = 'MIRROR';
      const t3 = E('text', { x: 120, y: 360, 'text-anchor': 'middle', transform: 'translate(0 720) scale(1 -1)', 'font-family': 'Dela Gothic One', 'font-size': 26, fill: '#f5a8d6', opacity: 0.3 }, g); t3.textContent = 'MIRROR';
    } else {
      E('rect', { x: 10, y: 40, width: 220, height: 220, fill: '#031006' }, art);
      [[60, 50], [96, 42], [132, 34], [168, 24]].forEach(([x, h], i) => E('rect', { x: x - 6, y: 120 - h / 2, width: 12 + i * 4, height: h, rx: 2, fill: '#6ee36a' }, art));
      E('ellipse', { cx: 120, cy: 120, rx: 96, ry: 46, fill: 'none', stroke: '#6ee36a', 'stroke-width': 1.5, opacity: 0.6 }, art);
      [50, 120, 190].forEach((x) => {
        E('path', { d: `M${x - 30} 240 Q${x} 222 ${x + 30} 240 Z`, fill: '#0b4a12', stroke: '#6ee36a', 'stroke-width': 1.5 }, art);
        E('path', { d: `M${x - 16} 228 V206 L${x} 194 L${x + 16} 206 V228`, fill: 'none', stroke: '#fff1cf', 'stroke-width': 2 }, art);
        E('rect', { x: x - 8, y: 208, width: 16, height: 14, fill: '#fff1cf' }, art);
        E('path', { d: `M${x} 190 C${x} 170 120 166 120 150`, stroke: '#6ee36a', 'stroke-width': 1.5, 'stroke-dasharray': '2 5', fill: 'none' }, art);
      });
      const t = E('text', { x: 120, y: 318, 'text-anchor': 'middle', 'font-family': 'Righteous', 'font-size': 40, fill: '#6ee36a' }, g); t.textContent = 'PneumoNet';
      const t2 = E('text', { x: 120, y: 346, 'text-anchor': 'middle', 'font-family': 'IBM Plex Mono', 'font-weight': 600, 'font-size': 11, 'letter-spacing': 2, fill: '#fff1cf' }, g); t2.textContent = 'LEARNING APART, TOGETHER';
    }
    const badge = E('rect', { x: 186, y: 358, width: 44, height: 16, rx: 2, fill: 'none', stroke: '#fff1cf', 'stroke-width': 1.2 }, g);
    const bt = E('text', { x: 208, y: 370, 'text-anchor': 'middle', 'font-family': 'IBM Plex Mono', 'font-size': 10, 'font-weight': 600, fill: '#fff1cf' }, g); bt.textContent = 'VHS';
    void badge;
  }

  function shelf() {
    document.querySelectorAll('svg.cover').forEach((s) => cover(s, s.dataset.cover));
    const led = document.getElementById('vcr-led');
    const slot = document.querySelector('.vcr-slot');
    const tickLed = () => { const d = new Date(); led.textContent = `${String(d.getHours()).padStart(2, '0')} : ${String(d.getMinutes()).padStart(2, '0')}`; };
    tickLed(); setInterval(tickLed, 15000);
    document.querySelectorAll('.tape').forEach((tp) => {
      tp.addEventListener('click', (e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey) return;
        e.preventDefault(); e.stopImmediatePropagation();
        const go = () => AFTER.tune(tp.dataset.tune, tp.dataset.tc, tp.dataset.name);
        if (!motion()) { go(); return; }
        const box = tp.querySelector('.box');
        const b = box.getBoundingClientRect(), s = slot.getBoundingClientRect();
        const dx = s.left + s.width / 2 - (b.left + b.width / 2), dy = s.top + s.height / 2 - (b.top + b.height / 2);
        sfx('clunk');
        gsap.timeline({ onComplete: () => { gsap.set(box, { clearProps: 'all' }); go(); } })
          .to(box, { y: -26, rotation: -5, duration: 0.22, ease: 'power2.out' })
          .to(box, { x: dx, y: dy, rotation: 90, scale: 0.35, duration: 0.5, ease: 'power2.in' })
          .to(box, { opacity: 0, duration: 0.12 }, '-=0.12')
          .call(() => { slot.classList.add('busy'); led.textContent = 'PLAY'; AFTER.tv && AFTER.tv.osd('▶ PLAY', tp.dataset.name.toUpperCase(), 1200); })
          .to({}, { duration: 0.35 })
          .call(() => { slot.classList.remove('busy'); tickLed(); });
      }, { capture: true });
    });
  }

  /* ================= end credits ================= */
  function credits() {
    const win = document.querySelector('.roll-window'), roll = document.querySelector('.roll');
    if (!win) return;
    let tw = null;
    const io = new IntersectionObserver(([en]) => {
      if (!motion()) { win.classList.add('static'); return; }
      win.classList.remove('static');
      if (en.isIntersecting) {
        if (!tw) {
          const dist = roll.offsetHeight + win.offsetHeight;
          tw = gsap.fromTo(roll, { y: win.offsetHeight }, { y: -roll.offsetHeight, duration: dist / 55, ease: 'none', repeat: -1 });
        } else tw.resume();
      } else if (tw) tw.pause();
    }, { threshold: 0.25 });
    io.observe(win);
  }

  /* ================= station ads ================= */
  function ads() {
    const io = new IntersectionObserver((ents) => ents.forEach((en) => {
      if (!en.isIntersecting) return;
      io.unobserve(en.target);
      const a = en.target;
      if (!motion()) return;
      const head = a.querySelector('.ad-head'), line = a.querySelector('.ad-line'), small = a.querySelector('.ad-small'), back = a.querySelector('.ad-back'), kick = a.querySelector('.ad-kick');
      gsap.timeline()
        .from(a, { scaleY: 0.02, duration: 0.35, ease: 'power3.out' })
        .from(kick, { opacity: 0, duration: 0.01 }, 0.3)
        .fromTo(head, { opacity: 0, color: '#ff3a1c', scale: 1.25 }, { opacity: 1, scale: 1, color: getComputedStyle(a).getPropertyValue('--ad').trim() || '#ffd23a', duration: 0.45, ease: 'back.out(2.2)' }, 0.42)
        .from(line, { clipPath: 'inset(0 100% 0 0)', duration: 0.6, ease: 'steps(16)' }, 0.8)
        .from(small, { opacity: 0, duration: 0.3 }, 1.4)
        .fromTo(back, { opacity: 0 }, { keyframes: [{ opacity: 1, duration: 0.01 }, { opacity: 0.2, duration: 0.01, delay: 0.35 }, { opacity: 1, duration: 0.01, delay: 0.35 }] }, 1.7);
    }), { threshold: 0.6 });
    document.querySelectorAll('.station-ad').forEach((a) => io.observe(a));
  }

  /* ================= overlay: TV Guide ================= */
  let openOverlay = null, lastFocus = null;
  function overlay(id, html) {
    const o = document.createElement('div');
    o.id = id; o.className = 'tv-overlay screen'; o.setAttribute('role', 'dialog'); o.setAttribute('aria-modal', 'true'); o.hidden = true;
    o.innerHTML = html;
    document.body.appendChild(o);
    o.addEventListener('keydown', (e) => { if (e.key === 'Escape') { e.preventDefault(); close(); } });
    o.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', close));
    return o;
  }
  function open(o, focusSel) {
    if (openOverlay) close(true);
    lastFocus = document.activeElement;
    o.hidden = false; openOverlay = o;
    document.documentElement.classList.add('overlay-open');
    sfx('static');
    if (motion()) gsap.fromTo(o, { scaleY: 0.01, filter: 'brightness(2)' }, { scaleY: 1, filter: 'brightness(1)', duration: 0.35, ease: 'power3.out', clearProps: 'filter' });
    const f = o.querySelector(focusSel || 'button, a'); f && f.focus();
  }
  function close(instant) {
    const o = openOverlay; if (!o) return;
    openOverlay = null;
    document.documentElement.classList.remove('overlay-open');
    const done = () => { o.hidden = true; gsap.set(o, { clearProps: 'transform' }); lastFocus && lastFocus.focus && lastFocus.focus({ preventScroll: true }); };
    if (motion() && instant !== true) gsap.to(o, { scaleY: 0.01, duration: 0.2, ease: 'power3.in', onComplete: done }); else done();
  }

  const LISTINGS = [
    ['top', '00', 'Palthepu Sai Sahith', 'The opening title sequence. A signal, a sunrise, a name.', '#ffb01f', 'g-display'],
    ['about', '01', 'Introduction', 'Backend & reliable systems, with research on the side.', '#ffb01f', 'g-display'],
    ['skills', '02', 'Skills', 'Languages, systems, AI/ML and research tooling.', '#ffd23a', 'g-wide'],
    ['experience', '03', 'Programme Log', 'CVIT research and industry experience, plus education.', '#ffb01f', 'g-wide'],
    ['topology', '04', 'The Hidden Structure', 'Comparing scientific data by its shape. Merge trees live.', '#8a6bff', 'g-topo'],
    ['chaosagent', '05', 'CHAOSAGENT', 'The Broken Signal. Ambiguous failure, safe recovery. Flagship.', '#ff4a2a', 'g-chaos'],
    ['praxismirror', '06', 'PRAXISMIRROR', 'The Memory of Events. Object-centric process analytics.', '#1fe3b2', 'g-wide'],
    ['pneumonet', '07', 'PneumoNet', 'Learning Apart, Together. Federated pneumonia detection.', '#6ee36a', 'g-geo'],
    ['contact', '08', 'Sign-off', 'Credits, your own title card, and how to reach me.', '#ffd23a', 'g-display']
  ];
  let guideEl;
  function buildGuide() {
    const start = new Date(); start.setMinutes(start.getMinutes() < 30 ? 0 : 30, 0, 0);
    const rows = LISTINGS.map(([id, n, t, d, c, cls], i) => {
      const at = new Date(start.getTime() + i * 30 * 60000);
      const time = at.toTimeString().slice(0, 5);
      return `<li><button type="button" class="g-row" data-id="${id}" data-c="${c}" data-name="${t}" style="--c:${c}">
        <span class="g-time">${i === 0 ? 'NOW' : time}</span><span class="g-ch">CH ${n}</span><span class="g-t ${cls}">${t}</span><span class="g-d">${d}</span></button></li>`;
    }).join('');
    guideEl = overlay('tvguide', `<div class="tv-sheet">
      <div class="tv-head"><span class="tv-logo">TV GUIDE</span><span class="tv-sub">Tonight on THE AFTERIMAGE · ↑ ↓ to choose · Enter to tune · Esc to close</span><button type="button" class="btn" data-close>Close ✕</button></div>
      <ol class="g-list">${rows}</ol></div>`);
    const btns = [...guideEl.querySelectorAll('.g-row')];
    btns.forEach((b, i) => {
      b.addEventListener('click', () => { close(true); AFTER.tune(b.dataset.id, b.dataset.c, b.dataset.name); });
      b.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown') { e.preventDefault(); btns[(i + 1) % btns.length].focus(); }
        if (e.key === 'ArrowUp') { e.preventDefault(); btns[(i - 1 + btns.length) % btns.length].focus(); }
      });
    });
  }
  function guide() { open(guideEl, '.g-row'); }

  function init() {
    shelf(); credits(); ads(); buildGuide();
  }

  AFTER.extras = { init, guide, close: () => close(), get open() { return !!openOverlay; } };
})();
