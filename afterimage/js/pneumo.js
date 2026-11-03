/* CH 04 — PneumoNet: "Learning Apart, Together"
   Four clinics on separate islands keep their X-ray lightboxes. Only light — model
   updates — rises to a shared layered model and returns. Plus the closing sign-off card. */
(function () {
  const { E, PAL, HEAT, draw, warm, flick, letters, rand } = AFTER;
  const GREEN = ['#021204', '#0b4a12', '#2fb84a', '#6ee36a'];

  function greenWarm(tl, el, final, at, dur = 0.7, prop = 'fill') {
    tl.set(el, { [prop]: GREEN[0], opacity: 1 }, at);
    tl.to(el, { keyframes: [{ [prop]: GREEN[1], duration: dur * .25 }, { [prop]: GREEN[2], duration: dur * .3 }, { [prop]: final, duration: dur * .45 }], ease: 'none' }, at);
  }

  let fed = null;
  function build(svg) {
    svg.innerHTML = '';
    const W = 1200, Hh = 800;
    svg.setAttribute('viewBox', `0 0 ${W} ${Hh}`);
    const screen = svg.closest('.screen');
    const tl = gsap.timeline({ paused: true });
    const defs = E('defs', null, svg);
    const rb = E('linearGradient', { id: 'n-rainbow' }, defs);
    ['#ff3a1c', '#ffb01f', '#ffe14a', '#6ee36a', '#52e4ff'].forEach((c, i) => E('stop', { offset: i / 4, 'stop-color': c }, rb));
    const root = E('g', { filter: 'url(#phos)' }, svg);

    // water bands
    const bands = [[716, PAL.green], [732, PAL.cream], [748, PAL.teal], [764, '#1d6b3a']].map(([y, c], i) => {
      const b = E('rect', { x: i % 2 ? W : 0, y, width: 0, height: 8, fill: c }, root);
      return { b, dir: i % 2 ? -1 : 1 };
    });

    // islands + clinics
    const isl = [170, 440, 760, 1030];
    const islands = [], outlines = [], windows = [], ribs = [], crosses = [];
    isl.forEach((x, k) => {
      const g = E('g', null, root);
      E('path', { d: `M${x - 120} 712 Q ${x - 90} ${662} ${x} 656 Q ${x + 90} 662 ${x + 120} 712 Z`, fill: '#062a10', stroke: PAL.green, 'stroke-width': 2 }, g);
      islands.push(g);
      const bx = x - 62, by = 560;
      const o = E('path', { d: `M${bx} 662 L${bx} ${by} L${x} ${by - 46} L${bx + 124} ${by} L${bx + 124} 662`, fill: 'none', stroke: PAL.cream, 'stroke-width': 2.4, 'stroke-linejoin': 'round' }, g);
      outlines.push(o);
      const win = E('rect', { x: x - 34, y: by + 14, width: 68, height: 62, rx: 3, fill: HEAT[0], opacity: 0 }, g);
      windows.push(win);
      const rp = E('path', { d: `M${x} ${by + 20} L${x} ${by + 70} M${x - 6} ${by + 28} Q${x - 26} ${by + 30} ${x - 26} ${by + 40} M${x + 6} ${by + 28} Q${x + 26} ${by + 30} ${x + 26} ${by + 40} M${x - 6} ${by + 40} Q${x - 26} ${by + 42} ${x - 26} ${by + 52} M${x + 6} ${by + 40} Q${x + 26} ${by + 42} ${x + 26} ${by + 52} M${x - 6} ${by + 52} Q${x - 24} ${by + 54} ${x - 24} ${by + 64} M${x + 6} ${by + 52} Q${x + 24} ${by + 54} ${x + 24} ${by + 64}`, fill: 'none', stroke: '#0a3a14', 'stroke-width': 2.6, 'stroke-linecap': 'round' }, g);
      ribs.push(rp);
      crosses.push(E('path', { d: `M${x - 7} ${by - 22} h14 M${x} ${by - 29} v14`, stroke: PAL.red, 'stroke-width': 4, opacity: 0 }, g));
      E('path', { d: `M${x - 12} 662 L${x - 12} 640 L${x + 12} 640 L${x + 12} 662`, fill: '#062a10', stroke: PAL.cream, 'stroke-width': 1.6 }, g);
      gsap.set(g, { y: 90, opacity: 0 });
    });

    // shared model: VGG16-style stack of conv blocks then dense layers
    const model = E('g', null, root);
    const blocks = [];
    const spec = [[2, 120], [2, 104], [3, 88], [3, 70], [3, 54]];
    let mx = 330;
    spec.forEach(([n, h], bi) => {
      for (let s = 0; s < n; s++) {
        blocks.push(E('rect', { x: mx, y: 300 - h / 2, width: 14, height: h, rx: 2, fill: GREEN[0], opacity: 0 }, model));
        mx += 20;
      }
      mx += 22;
    });
    [34, 34, 18].forEach((h) => { blocks.push(E('rect', { x: mx, y: 300 - h / 2, width: 28, height: h, rx: 2, fill: GREEN[0], opacity: 0 }, model)); mx += 40; });
    const modelW = mx - 330;
    const halo = E('ellipse', { cx: 330 + modelW / 2, cy: 300, rx: modelW / 2 + 60, ry: 110, fill: 'none', stroke: PAL.green, 'stroke-width': 1.6, opacity: 0 }, root);
    const mcx = 330 + modelW / 2;
    const label = letters(root, 'SHARED MODEL · VGG16 TRANSFER LEARNING', { x: mcx, y: 438, size: 15, family: 'IBM Plex Mono', weight: 500, spacing: 3, fill: '#9fd89a' });
    label.items.forEach((it) => gsap.set(it.t, { opacity: 0 }));

    // update paths: clinic -> model, model -> clinic
    const ups = isl.map((x) => E('path', { d: `M${x} 548 C ${x} 470 ${mcx + (x - mcx) * 0.35} 440 ${mcx + (x - mcx) * 0.25} 410`, fill: 'none', stroke: PAL.green, 'stroke-width': 2.2, 'stroke-dasharray': '2 9', 'stroke-linecap': 'round', opacity: 0 }, root));
    const upP = isl.map(() => E('circle', { r: 7, fill: PAL.green, opacity: 0 }, root));
    const dnP = isl.map(() => E('circle', { r: 6, fill: PAL.cream, opacity: 0 }, root));

    // title
    const title = letters(root, 'PneumoNet', { x: W / 2, y: 140, size: 120, family: 'Righteous', spacing: 2, fill: PAL.green });
    title.items.forEach((it) => gsap.set(it.t, { opacity: 0 }));
    const lead = E('rect', { x: title.x0 - 20, y: 156, width: 0, height: 4, fill: 'url(#n-rainbow)' }, root);
    const sub = letters(root, 'LEARNING APART, TOGETHER', { x: W / 2, y: 196, size: 22, family: 'Dela Gothic One', spacing: 10, fill: PAL.cream });
    sub.items.forEach((it) => gsap.set(it.t, { opacity: 0 }));

    function travel(t, P, path, rev, at, dur) {
      const L = path.getTotalLength(), o = { f: 0 };
      t.set(P, { opacity: 1 }, at);
      t.to(o, { f: 1, duration: dur, ease: 'power1.inOut', onUpdate: () => { const p = path.getPointAtLength((rev ? 1 - o.f : o.f) * L); P.setAttribute('cx', p.x); P.setAttribute('cy', p.y); } }, at);
      t.set(P, { opacity: 0 }, at + dur);
    }
    function round(t, at) {
      windows.forEach((w, i) => t.to(w, { keyframes: [{ fill: '#ffffff', duration: 0.08 }, { fill: PAL.cream, duration: 0.2 }] }, at + i * 0.05));
      upP.forEach((p, i) => travel(t, p, ups[i], false, at + 0.3 + i * 0.06, 0.8));
      t.to(blocks, { fill: '#d8ffd0', duration: 0.12, stagger: 0.01 }, at + 1.15);
      t.to(blocks, { fill: PAL.green, duration: 0.4 }, at + 1.5);
      t.fromTo(halo, { opacity: 0.9, attr: { rx: modelW / 2 + 30 } }, { opacity: 0.35, attr: { rx: modelW / 2 + 70 }, duration: 0.6, immediateRender: false }, at + 1.2);
      dnP.forEach((p, i) => travel(t, p, ups[i], true, at + 1.6 + i * 0.05, 0.8));
    }

    /* ===== choreography ===== */
    bands.forEach(({ b, dir }, i) => {
      if (dir > 0) tl.to(b, { attr: { width: W }, duration: 0.7, ease: 'power3.out' }, 0.2 + i * 0.12);
      else tl.to(b, { attr: { x: 0, width: W }, duration: 0.7, ease: 'power3.out' }, 0.2 + i * 0.12);
    });
    islands.forEach((g, i) => tl.to(g, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }, 0.6 + i * 0.12));
    draw(tl, outlines, 1.0, 0.7, { stagger: 0.1 });
    windows.forEach((w, i) => warm(tl, w, PAL.cream, 1.5 + i * 0.1, 0.6));
    draw(tl, ribs, 1.8, 0.5, { stagger: 0.08 });
    crosses.forEach((c, i) => tl.set(c, { opacity: 1 }, 1.9 + i * 0.08));
    blocks.forEach((b, i) => greenWarm(tl, b, PAL.green, 2.0 + i * 0.04, 0.5));
    tl.to(halo, { opacity: 0.35, duration: 0.6 }, 2.8);
    label.items.forEach((it, i) => tl.set(it.t, { opacity: 1 }, 2.9 + i * 0.01));
    tl.to(ups, { opacity: 0.55, duration: 0.4 }, 3.0);
    round(tl, 3.1);
    tl.to(lead, { attr: { width: title.width + 40 }, duration: 0.4, ease: 'power2.inOut' }, 4.6);
    title.items.forEach((it, i) => { tl.set(it.t, { opacity: 1, fill: PAL.red }, 4.8 + i * 0.07); tl.to(it.t, { keyframes: [{ fill: PAL.yellow, duration: 0.15 }, { fill: PAL.green, duration: 0.25 }] }, 4.85 + i * 0.07); });
    tl.to(lead, { attr: { x: title.x0 + title.width + 20, width: 0 }, duration: 0.3, ease: 'power2.in' }, 5.45);
    sub.items.forEach((it, i) => tl.set(it.t, { opacity: 1 }, 5.5 + i * 0.025));
    flick(tl, screen, 6.1, 0.8);
    tl.to({}, { duration: 0.6 }, 6.4);

    fed = { round, n: 0 };
    return tl;
  }

  function fedButton() {
    const btn = document.getElementById('fed-round');
    const count = document.getElementById('fed-count');
    btn.addEventListener('click', () => {
      const reel = AFTER.reels.pneumo;
      if (reel && reel.tl.progress() < 1) reel.finish();
      fed.n++;
      count.textContent = `Conceptual · round ${fed.n} · X-rays moved: 0`;
      const t = gsap.timeline();
      if (!AFTER.state.motion) t.timeScale(40);
      fed.round(t, 0);
    });
  }

  /* ================= sign-off ================= */
  function buildEnd(svg) {
    svg.innerHTML = '';
    const screen = svg.closest('.screen');
    const portrait = AFTER.isPortrait(svg);
    const [W, Hh, H, cx, R] = portrait ? [1000, 1000, 700, 500, 220] : [1600, 700, 470, 800, 230];
    svg.setAttribute('viewBox', `0 0 ${W} ${Hh}`);
    screen.style.setProperty('--ar', `${W} / ${Hh}`);
    const tl = gsap.timeline({ paused: true });
    const defs = E('defs', null, svg);
    const sg = E('linearGradient', { id: 'e-sun', x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
    [['0', '#ffe68a'], ['.4', '#ffb01f'], ['1', '#e81e0e']].forEach(([o, c]) => E('stop', { offset: o, 'stop-color': c }, sg));
    const clip = E('clipPath', { id: 'e-sky' }, defs); E('rect', { x: -800, y: -200, width: W + 1600, height: H + 200 }, clip);
    const tclip = E('clipPath', { id: 'e-t' }, defs); E('rect', { x: -800, y: 0, width: W + 1600, height: portrait ? 600 : 300 }, tclip);
    const root = E('g', { filter: 'url(#phos)' }, svg);
    const sunG = E('g', { 'clip-path': 'url(#e-sky)' }, root);
    const sun = E('circle', { cx, cy: H, r: R, fill: 'url(#e-sun)' }, sunG);
    const mask = E('mask', { id: 'e-mask', maskUnits: 'userSpaceOnUse', x: -800, y: -200, width: W + 1600, height: 1200 }, defs);
    E('rect', { x: -800, y: -200, width: W + 1600, height: 1200, fill: '#fff' }, mask);
    const cuts = [0.3, 0.45, 0.58, 0.7, 0.8, 0.9].map((f, i) => E('rect', { x: cx - R, y: H - R + f * R, width: 2 * R, height: 4 + i * 3, fill: '#000' }, mask));
    sun.setAttribute('mask', 'url(#e-mask)');
    const horizon = E('rect', { x: -800, y: H, width: W + 1600, height: 2, fill: PAL.cream }, root);
    const bands = [[H + 30, PAL.red], [H + 48, PAL.amber], [H + 66, PAL.yellow]].map(([y, c]) => E('rect', { x: -800, y, width: W + 1600, height: 10, fill: c }, root));
    const tg = E('g', { 'clip-path': 'url(#e-t)' }, root);
    const title = { items: [] };
    (portrait ? [['Stay', 300], ['tuned.', 540]] : [['Stay tuned.', 270]]).forEach(([w, y]) => {
      title.items.push(...AFTER.heatLetters(tg, w, { x: cx, y, size: portrait ? 240 : 170, family: 'Fraunces', weight: 900, fvs: '"SOFT" 100, "WONK" 0, "opsz" 144', spacing: -2, fill: PAL.cream }).items);
    });
    const sign = { items: [] };
    (portrait ? [['PALTHEPU SAI SAHITH', H + 150], ['END OF PROGRAMME', H + 200]] : [['PALTHEPU SAI SAHITH  ·  END OF PROGRAMME', H + 140]]).forEach(([w, y]) => {
      sign.items.push(...letters(root, w, { x: cx, y, size: portrait ? 32 : 24, family: 'Dela Gothic One', spacing: portrait ? 7 : 9, fill: PAL.cream }).items);
    });
    sign.items.forEach((it) => gsap.set(it.t, { opacity: 0 }));

    // starts from a held frame and SETS: the sun sinks, its stripes widen, the bands stay
    gsap.set(bands, { scaleX: 0, svgOrigin: `${cx} 0` });
    tl.to(bands, { scaleX: 1, duration: 0.9, ease: 'power3.out', stagger: 0.12 }, 0.2);
    tl.from(sun, { attr: { cy: H + R + 20 }, duration: 1.2, ease: 'power2.out' }, 0.3);
    tl.to(sun, { attr: { cy: H + R * 0.55 }, duration: 2.6, ease: 'sine.inOut' }, 1.6);
    cuts.forEach((c, i) => tl.to(c, { attr: { height: 10 + i * 6 }, duration: 2.6, ease: 'sine.inOut' }, 1.6));
    title.items.forEach((it, i) => {
      const at = 2.0 + i * 0.07;
      tl.from(it.g, { y: portrait ? 300 : 200, duration: 0.9, ease: 'power3.out' }, at);
      warm(tl, it.heat, PAL.cream, at, 1.0);
      tl.to(it.heat, { opacity: 0, duration: 0.4 }, at + 0.95);
    });
    sign.items.forEach((it, i) => { tl.set(it.t, { opacity: 1, fill: PAL.red }, 3.4 + i * 0.03); tl.to(it.t, { fill: PAL.cream, duration: 0.25 }, 3.45 + i * 0.03); });
    flick(tl, screen, 4.4, 0.8);
    tl.to({}, { duration: 0.6 }, 4.8);
    return tl;
  }

  AFTER.buildPneumo = build;
  AFTER.fedButton = fedButton;
  AFTER.buildEnd = buildEnd;
})();
