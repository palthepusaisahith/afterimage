/* THE AFTERIMAGE — make your own 1984 title card.
   The visitor's name gets the same treatment as the opening: a signal line,
   streak bars, a striped sun rising behind a ridge, the name rising and warming
   from ember to cream, then a flicker and a hold. "Save image" paints the held
   frame to a canvas and downloads it as a PNG. */
(function () {
  const { E, PAL, HEAT, draw, warm, flick, letters, heatLetters } = AFTER;
  const W = 1600, H = 900, HZ = 560, CX = 800, R = 270;
  const TAG = 'A PALTHEPU SAI SAHITH BROADCAST · 1984';
  let current = '', tl = null;

  const clean = (s) => (s || '').replace(/[^\p{L}\p{N} .'&-]/gu, '').replace(/\s+/g, ' ').trim().slice(0, 16);

  function ridgeD(base, amp, seed) {
    let d = '';
    for (let x = -200, i = 0; x <= W + 200; x += 60, i++) {
      const y = base - amp * (0.4 + 0.6 * Math.abs(Math.sin(i * 0.7 + seed) * Math.cos(i * 0.23 + seed)));
      d += (i ? 'L' : 'M') + x + ' ' + y.toFixed(1);
    }
    return d;
  }

  function build(svg, name) {
    svg.innerHTML = '';
    const screen = svg.closest('.screen');
    const t = gsap.timeline({ paused: true });
    const defs = E('defs', null, svg);
    const sg = E('linearGradient', { id: 'i-sun', x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
    [['0', '#ffe68a'], ['.4', '#ffb01f'], ['.75', '#ff5a1c'], ['1', '#e81e0e']].forEach(([o, c]) => E('stop', { offset: o, 'stop-color': c }, sg));
    const ng = E('linearGradient', { id: 'i-name', x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
    [['0', '#fffaf0'], ['.5', '#fff1cf'], ['.75', '#ffd23a'], ['1', '#ff9a1f']].forEach(([o, c]) => E('stop', { offset: o, 'stop-color': c }, ng));
    const sky = E('clipPath', { id: 'i-sky' }, defs); E('rect', { x: -400, y: -100, width: W + 800, height: HZ + 100 }, sky);
    const nclip = E('clipPath', { id: 'i-nclip' }, defs); E('rect', { x: -400, y: -100, width: W + 800, height: 640 + 100 }, nclip);
    const mask = E('mask', { id: 'i-cuts', maskUnits: 'userSpaceOnUse', x: -400, y: -100, width: W + 800, height: H + 200 }, defs);
    E('rect', { x: -400, y: -100, width: W + 800, height: H + 200, fill: '#fff' }, mask);
    const cuts = [0.45, 0.58, 0.69, 0.79, 0.88, 0.95].map((f, i) => E('rect', { x: CX - R - 10, y: HZ - R + f * R, width: 2 * R + 20, height: 5 + i * 3, fill: '#000' }, mask));

    const root = E('g', { filter: 'url(#phos)' }, svg);
    for (let i = 0; i < 40; i++) {
      const x = (i * 397) % W, y = 30 + ((i * 211) % 380);
      if (Math.abs(x - CX) < R && y > HZ - R - 60) continue;
      E('circle', { class: 'i-star', cx: x, cy: y, r: 1 + (i % 3) * 0.6, fill: PAL.cream, opacity: 0 }, root);
    }
    const sunG = E('g', { 'clip-path': 'url(#i-sky)' }, root);
    const sun = E('g', { mask: 'url(#i-cuts)' }, sunG);
    E('circle', { cx: CX, cy: HZ, r: R, fill: 'url(#i-sun)' }, sun);
    const heat = E('circle', { cx: CX, cy: HZ, r: R, fill: HEAT[0] }, sun);
    gsap.set(sun, { y: R + 40 });
    const line = E('rect', { x: CX, y: HZ - 1.5, width: 0, height: 3, fill: PAL.cream }, root);
    const rim = E('path', { d: ridgeD(HZ + 30, 50, 4), fill: 'none', stroke: PAL.amber, 'stroke-width': 2 }, root);
    const ridgeFill = E('path', { d: ridgeD(HZ + 30, 50, 4) + `L${W + 200} ${H + 100} L-200 ${H + 100} Z`, fill: '#0b0405', opacity: 0 }, root);

    // the name, auto-sized, rising from behind the ridge
    const wrap = E('g', { 'clip-path': 'url(#i-nclip)' }, root);
    const shadow = E('g', { opacity: 0 }, wrap);
    const base = { x: CX, y: 600, size: 250, family: 'Fraunces', weight: 900, fvs: '"SOFT" 100, "WONK" 0, "opsz" 144', spacing: -3, wordGap: 40, fill: 'url(#i-name)' };
    const probe = letters(wrap, name, base); const w = probe.width; probe.g.remove();
    if (w > 1380) base.size = 250 * 1380 / w;
    const sh = letters(shadow, name, Object.assign({}, base, { fill: '#7a1006' }));
    const face = heatLetters(wrap, name, base);

    const bands = [[690, PAL.red], [712, PAL.amber], [734, PAL.blue]].map(([y, c], i) => {
      const b = E('rect', { x: -200, y, width: W + 400, height: 12, fill: c }, root);
      gsap.set(b, { scaleX: 0, svgOrigin: `${i % 2 ? W + 200 : -200} 0` });
      return b;
    });
    const tag = letters(root, TAG, { x: CX, y: 810, size: 26, family: 'Dela Gothic One', spacing: 8, fill: PAL.cream });
    tag.items.forEach((it) => gsap.set(it.t, { opacity: 0 }));

    // choreography
    t.set(line, { opacity: 1 }, 0.2);
    t.to(line, { attr: { x: -100, width: W + 200 }, duration: 0.45, ease: 'power3.out' }, 0.2);
    t.to(line, { opacity: 0.3, duration: 0.5 }, 0.7);
    bands.forEach((b, i) => t.to(b, { scaleX: 1, duration: 0.7, ease: 'power3.out' }, 0.5 + i * 0.12));
    t.to(sun, { y: 0, duration: 1.3, ease: 'power2.out' }, 0.7);
    warm(t, heat, '#ff5a1c', 0.7, 0.9);
    t.to(heat, { opacity: 0, duration: 0.6 }, 1.5);
    cuts.forEach((c, i) => t.from(c, { attr: { x: CX, width: 0 }, duration: 0.45, ease: 'power2.out' }, 1.3 + i * 0.06));
    draw(t, rim, 1.0, 0.9);
    t.to(ridgeFill, { opacity: 1, duration: 0.5 }, 1.5);
    t.to(svg.querySelectorAll('.i-star'), { opacity: 0.6, duration: 0.01, stagger: 0.02 }, 1.2);
    face.items.forEach((it, i) => {
      const at = 1.9 + i * 0.07;
      t.from(it.g, { y: base.size * 1.1, duration: 0.85, ease: 'power3.out' }, at);
      warm(t, it.heat, PAL.cream, at, 1.0);
      t.to(it.heat, { opacity: 0, duration: 0.4 }, at + 0.95);
    });
    const endName = 1.9 + face.items.length * 0.07 + 1.0;
    t.set(shadow, { opacity: 1 }, endName);
    t.fromTo(sh.items.map((i) => i.g), { x: 0, y: 0 }, { x: 7, y: 7, duration: 0.3, ease: 'power2.out', immediateRender: false }, endName);
    tag.items.forEach((it, i) => t.set(it.t, { opacity: 1 }, endName + 0.2 + i * 0.02));
    flick(t, screen, endName + 1.1, 0.78);
    t.to({}, { duration: 0.5 }, endName + 1.5);
    return t;
  }

  /* ---------- the held frame, painted for download ---------- */
  function paint(name) {
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    const x = c.getContext('2d');
    x.fillStyle = '#040203'; x.fillRect(0, 0, W, H);
    const gl = x.createRadialGradient(CX, HZ, 0, CX, HZ, 900);
    gl.addColorStop(0, 'rgba(122,20,8,.9)'); gl.addColorStop(0.55, 'rgba(42,5,3,.5)'); gl.addColorStop(1, 'rgba(0,0,0,0)');
    x.save(); x.beginPath(); x.rect(0, 0, W, HZ); x.clip();
    x.fillStyle = gl; x.fillRect(0, 0, W, H);
    for (let i = 0; i < 40; i++) {
      const sx = (i * 397) % W, sy = 30 + ((i * 211) % 380);
      if (Math.abs(sx - CX) < R && sy > HZ - R - 60) continue;
      x.fillStyle = 'rgba(255,241,207,.6)'; x.beginPath(); x.arc(sx, sy, 1 + (i % 3) * 0.6, 0, 7); x.fill();
    }
    const sg = x.createLinearGradient(0, HZ - R, 0, HZ + R);
    [[0, '#ffe68a'], [0.4, '#ffb01f'], [0.75, '#ff5a1c'], [1, '#e81e0e']].forEach(([o, cl]) => sg.addColorStop(o * 0.5, cl));
    x.shadowColor = '#ff7a1a'; x.shadowBlur = 40;
    x.fillStyle = sg; x.beginPath(); x.arc(CX, HZ, R, Math.PI, 0); x.fill();
    x.shadowBlur = 0; x.fillStyle = '#040203';
    [0.45, 0.58, 0.69, 0.79, 0.88, 0.95].forEach((f, i) => x.fillRect(CX - R - 10, HZ - R + f * R, 2 * R + 20, 5 + i * 3));
    x.restore();
    // ridge
    x.beginPath();
    for (let px = -200, i = 0; px <= W + 200; px += 60, i++) {
      const py = HZ + 30 - 50 * (0.4 + 0.6 * Math.abs(Math.sin(i * 0.7 + 4) * Math.cos(i * 0.23 + 4)));
      i ? x.lineTo(px, py) : x.moveTo(px, py);
    }
    x.lineTo(W + 200, H + 100); x.lineTo(-200, H + 100); x.closePath();
    x.fillStyle = '#0b0405'; x.fill(); x.strokeStyle = '#ffb01f'; x.lineWidth = 2; x.shadowColor = '#ffb01f'; x.shadowBlur = 10; x.stroke(); x.shadowBlur = 0;
    // bands
    [[690, '#ff3a1c'], [712, '#ffb01f'], [734, '#4f69ff']].forEach(([y, cl]) => { x.shadowColor = cl; x.shadowBlur = 14; x.fillStyle = cl; x.fillRect(0, y, W, 12); });
    x.shadowBlur = 0;
    // name
    let size = 250;
    x.font = `900 ${size}px Fraunces`;
    const mw = x.measureText(name).width;
    if (mw > 1380) { size = 250 * 1380 / mw; x.font = `900 ${size}px Fraunces`; }
    // the lettering is painted on its own layer so the stripe cuts only bite into the letters
    const lay = document.createElement('canvas'); lay.width = W; lay.height = H;
    const lx = lay.getContext('2d');
    lx.font = x.font; lx.textAlign = 'center'; lx.textBaseline = 'alphabetic';
    lx.fillStyle = '#7a1006'; lx.fillText(name, CX + 7, 607);
    const ng = lx.createLinearGradient(0, 600 - size * 0.72, 0, 600);
    [[0, '#fffaf0'], [0.5, '#fff1cf'], [0.75, '#ffd23a'], [1, '#ff9a1f']].forEach(([o, cl]) => ng.addColorStop(o, cl));
    lx.fillStyle = ng; lx.fillText(name, CX, 600);
    lx.globalCompositeOperation = 'destination-out';
    [[0.25, 3], [0.17, 4], [0.1, 5]].forEach(([f, hh]) => lx.fillRect(0, 600 - size * f, W, hh));
    x.shadowColor = '#ffb01f'; x.shadowBlur = 26; x.drawImage(lay, 0, 0); x.shadowBlur = 0;
    // tag
    x.font = '400 26px "Dela Gothic One"'; x.textAlign = 'center'; x.fillStyle = '#fff1cf'; x.shadowColor = '#ffb01f'; x.shadowBlur = 10;
    if ('letterSpacing' in x) x.letterSpacing = '8px';
    x.fillText(TAG, CX, 810); x.shadowBlur = 0;
    // raster and lens falloff
    x.fillStyle = 'rgba(0,0,0,.32)'; for (let px = 0; px < W; px += 3) x.fillRect(px, 0, 1, H);
    const v = x.createRadialGradient(CX, H / 2, H * 0.55, CX, H / 2, W * 0.62);
    v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.65)');
    x.fillStyle = v; x.fillRect(0, 0, W, H);
    return c;
  }

  function init() {
    const form = document.getElementById('ident-form');
    const input = document.getElementById('ident-name');
    const save = document.getElementById('ident-save');
    const svg = document.getElementById('ident-svg');
    if (!form) return;
    const run = (n) => {
      current = n;
      if (tl) tl.kill();
      tl = build(svg, n);
      if (AFTER.state.motion) tl.play(0); else tl.progress(1);
      save.disabled = false;
    };
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const n = clean(input.value) || 'Your Name';
      AFTER.sound && AFTER.sound.sfx && AFTER.sound.sfx('thunk');
      run(n);
    });
    save.addEventListener('click', () => {
      const c = paint(current);
      c.toBlob((b) => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(b);
        a.download = `title-card-${current.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'afterimage'}.png`;
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(a.href), 2000);
      }, 'image/png');
    });
    // an example is on air before anyone types
    const io = new IntersectionObserver(([en]) => { if (en.isIntersecting) { io.disconnect(); if (!current) run('Your Name'); } }, { threshold: 0.4 });
    io.observe(svg);
  }

  AFTER.ident = { init };
})();
