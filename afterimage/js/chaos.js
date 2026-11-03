/* CH 01 — ChaosAgent: "The Broken Signal"
   A dish sends a pulse down a telegraph line to the Ledger tower. The tower commits.
   The reply breaks mid-line. A searchlight finds the evidence. The title, torn in two
   like a lost horizontal hold, locks back together. */
(function () {
  const { E, PAL, HEAT, draw, warm, flick, letters, rand } = AFTER;
  const COOL = ['#020418', '#0c1d6e', '#2a46ff', '#52e4ff'];

  function coolWarm(tl, el, final, at, dur = 0.9, prop = 'fill') {
    tl.set(el, { [prop]: COOL[0], opacity: 1 }, at);
    tl.to(el, { keyframes: [{ [prop]: COOL[1], duration: dur * .25 }, { [prop]: COOL[2], duration: dur * .25 }, { [prop]: COOL[3], duration: dur * .2 }, { [prop]: final, duration: dur * .3 }], ease: 'none' }, at);
  }

  /* --- reusable props (also used by the lab) --- */
  function dish(g, x, y, s) {
    const G = E('g', { transform: `translate(${x} ${y}) scale(${s})`, fill: 'none', stroke: PAL.cream, 'stroke-width': 2.4 / s * s, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g);
    const bowl = E('path', { d: 'M-46 -10 Q-40 -78 30 -92 Q -6 -40 -46 -10 Z' }, G);
    const rim = E('path', { d: 'M-46 -10 L30 -92', stroke: PAL.cyan }, G);
    const arm = E('path', { d: 'M-8 -51 L40 -70 M40 -70 l6 -3' }, G);
    const stand = E('path', { d: 'M-10 -40 L-4 0 M-22 0 L14 0 M-4 0 L-24 22 M-4 0 L16 22' }, G);
    return { G, parts: [bowl, rim, arm, stand], feed: { x: x + 46 * s, y: y - 73 * s } };
  }

  function ledger(g, cx, base, s, seed) {
    const G = E('g', null, g);
    const w = [300, 220, 140].map((v) => v * s), hts = [170, 110, 70].map((v) => v * s);
    let y = base;
    const blocks = [];
    for (let i = 0; i < 3; i++) { blocks.push({ x: cx - w[i] / 2, y: y - hts[i], w: w[i], h: hts[i] }); y -= hts[i]; }
    const spireTop = y - 72 * s;
    // outline: trace both halves from the base centre (two paths meeting at the spire)
    const half = (sgn) => {
      let d = `M${cx} ${base} L${cx + sgn * w[0] / 2} ${base}`;
      let yy = base;
      for (let i = 0; i < 3; i++) {
        d += ` L${cx + sgn * w[i] / 2} ${yy - hts[i]}`;
        yy -= hts[i];
        if (i < 2) d += ` L${cx + sgn * w[i + 1] / 2} ${yy}`;
      }
      d += ` L${cx + sgn * 14 * s} ${yy} L${cx} ${spireTop}`;
      return d;
    };
    const body = E('path', { d: half(1).replace('M', 'M') + ' ' + half(-1).replace(/M[^L]+/, ''), fill: '#0a0512', opacity: 0 }, G);
    body.setAttribute('d', (() => {
      // closed silhouette for fill
      let d = `M${cx - w[0] / 2} ${base}`;
      let yy = base;
      const pts = [];
      for (let i = 0; i < 3; i++) { pts.push([cx - w[i] / 2, yy - hts[i]]); yy -= hts[i]; if (i < 2) pts.push([cx - w[i + 1] / 2, yy]); }
      pts.push([cx - 14 * s, yy], [cx, spireTop], [cx + 14 * s, yy]);
      for (let i = 2; i >= 0; i--) { if (i < 2) pts.push([cx + w[i + 1] / 2, yy]); pts.push([cx + w[i] / 2, yy]); yy += hts[i]; }
      pts.push([cx + w[0] / 2, base]);
      return d + pts.map((p) => ` L${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join('') + 'Z';
    })());
    const rimR = E('path', { d: half(1), fill: 'none', stroke: PAL.red, 'stroke-width': 2.4, 'stroke-linejoin': 'round' }, G);
    const rimL = E('path', { d: half(-1), fill: 'none', stroke: PAL.red, 'stroke-width': 2.4, 'stroke-linejoin': 'round' }, G);
    const wins = [];
    const r = rand(seed || 7);
    blocks.forEach((b, bi) => {
      const cols = bi === 0 ? 9 : bi === 1 ? 6 : 3, rows = bi === 0 ? 4 : bi === 1 ? 3 : 2;
      const ww = 9 * s, wh = 14 * s;
      const gx = (b.w - cols * ww) / (cols + 1), gy = (b.h - rows * wh) / (rows + 1);
      for (let c = 0; c < cols; c++) for (let rr = 0; rr < rows; rr++) {
        if (bi === 0 && rr === 0 && c > 2 && c < 6) continue; // marquee gap
        wins.push(E('rect', { x: (b.x + gx + c * (ww + gx)).toFixed(1), y: (b.y + gy + rr * (wh + gy)).toFixed(1), width: ww, height: wh, fill: HEAT[0], opacity: 0, 'data-r': r().toFixed(3) }, G));
      }
    });
    wins.sort((a, b) => a.dataset.r - b.dataset.r);
    return { G, body, rims: [rimR, rimL], wins, top: { x: cx, y: spireTop }, antenna: { x: cx - w[0] / 2 + 10 * s, y: base - hts[0] - 4 }, blocks };
  }

  function poles(g, xs, ground, top) {
    const out = [];
    xs.forEach((x) => {
      const P = E('g', null, g);
      const post = E('path', { d: `M${x} ${ground} L${x} ${top}`, stroke: '#c9b89c', 'stroke-width': 3, fill: 'none' }, P);
      const arm = E('path', { d: `M${x - 18} ${top + 10} L${x + 18} ${top + 10}`, stroke: '#c9b89c', 'stroke-width': 2.4, fill: 'none' }, P);
      out.push({ P, post, arm, x, top: top + 10 });
    });
    return out;
  }

  function wirePath(pts, sag) {
    let d = `M${pts[0][0]} ${pts[0][1]}`;
    for (let i = 1; i < pts.length; i++) {
      const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
      d += ` Q${((x0 + x1) / 2).toFixed(1)} ${(Math.max(y0, y1) + sag).toFixed(1)} ${x1} ${y1}`;
    }
    return d;
  }

  function pulse(g, color) {
    const P = E('g', { opacity: 0 }, g);
    E('circle', { r: 16, fill: color, opacity: 0.25 }, P);
    E('circle', { r: 7, fill: PAL.cream }, P);
    return P;
  }
  function travel(tl, P, path, from, to, at, dur, ease) {
    const L = path.getTotalLength();
    const o = { f: from };
    tl.set(P, { opacity: 1 }, at);
    tl.to(o, { f: to, duration: dur, ease: ease || 'power1.inOut', onUpdate: () => { const p = path.getPointAtLength(o.f * L); P.setAttribute('transform', `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})`); } }, at);
    return L;
  }
  function fracAtX(path, x) {
    const L = path.getTotalLength();
    let lo = 0, hi = L;
    for (let i = 0; i < 30; i++) { const m = (lo + hi) / 2; if (path.getPointAtLength(m).x < x) lo = m; else hi = m; }
    return lo / L;
  }

  /* ================= ident ================= */
  function build(svg) {
    svg.innerHTML = '';
    const W = 1600, Hh = 762, H = 560;
    const screen = svg.closest('.screen');
    const portrait = AFTER.isPortrait(svg);
    svg.setAttribute('viewBox', portrait ? '0 0 1000 1000' : `0 0 ${W} ${Hh}`);
    screen.style.setProperty('--ar', portrait ? '1000 / 1000' : `${W} / ${Hh}`);
    const tl = gsap.timeline({ paused: true });
    const defs = E('defs', null, svg);
    const hg = E('radialGradient', { id: 'c-glow', cx: '.5', cy: '1', r: '.7' }, defs);
    [['0', '#1a2cff', .55], ['.5', '#0a0f55', .35], ['1', '#000', 0]].forEach(([o, c, a]) => E('stop', { offset: o, 'stop-color': c, 'stop-opacity': a }, hg));
    const bg = E('linearGradient', { id: 'c-beam', x1: 1, y1: 0, x2: 0, y2: 0 }, defs);
    E('stop', { offset: 0, 'stop-color': PAL.cyan, 'stop-opacity': .7 }, bg); E('stop', { offset: 1, 'stop-color': PAL.cyan, 'stop-opacity': 0.05 }, bg);

    const root = E('g', { filter: 'url(#phos)' }, svg);

    // stars + crescent moon
    const r = rand(42);
    const stars = [];
    for (let i = 0; i < 40; i++) stars.push(E('circle', { cx: (r() * W).toFixed(0), cy: (r() * 330 + 20).toFixed(0), r: (0.8 + r() * 1.3).toFixed(1), fill: PAL.cream, opacity: 0 }, root));
    const moonMask = E('mask', { id: 'c-moon' }, defs);
    E('circle', { cx: 112, cy: 92, r: 44, fill: '#fff' }, moonMask);
    E('circle', { cx: 131, cy: 82, r: 40, fill: '#000' }, moonMask);
    const moon = E('circle', { cx: 112, cy: 92, r: 44, fill: COOL[0], mask: 'url(#c-moon)', opacity: 0 }, root);

    const glow = E('ellipse', { cx: W / 2, cy: H, rx: 1000, ry: 300, fill: 'url(#c-glow)', opacity: 0 }, root);
    const horizonR = E('path', { d: `M${W / 2} ${H} L${W + 400} ${H}`, stroke: PAL.cyan, 'stroke-width': 2, fill: 'none' }, root);
    const horizonL = E('path', { d: `M${W / 2} ${H} L-400 ${H}`, stroke: PAL.cyan, 'stroke-width': 2, fill: 'none' }, root);

    // title (behind the props in depth, in front of the sky); phones get it stacked
    const lines = portrait ? [['CHAOS', 250, 262], ['AGENT', 250, 516]] : [['CHAOSAGENT', 186, 214]];
    const tx = portrait ? 500 : 700;
    const titleG = E('g', null, root);
    const topHalf = [], botHalf = [], tA = { items: [] }, tB = { items: [] };
    lines.forEach(([word, size, capY], li) => {
      const cut = capY - size * 0.36;
      const clipTop = E('clipPath', { id: 'c-top' + li }, defs); E('rect', { x: -500, y: capY - size * 1.2, width: W + 1000, height: cut - (capY - size * 1.2) }, clipTop);
      const clipBot = E('clipPath', { id: 'c-bot' + li }, defs); E('rect', { x: -500, y: cut, width: W + 1000, height: size }, clipBot);
      const th = E('g', { 'clip-path': `url(#c-top${li})` }, titleG), bh = E('g', { 'clip-path': `url(#c-bot${li})` }, titleG);
      topHalf.push(th); botHalf.push(bh);
      tA.items.push(...letters(th, word, { x: tx, y: capY, size, family: 'Anton', spacing: 6, fill: PAL.cyan }).items);
      tB.items.push(...letters(bh, word, { x: tx, y: capY, size, family: 'Anton', spacing: 6, fill: PAL.red }).items);
    });
    const capY = lines[lines.length - 1][2];
    gsap.set([...topHalf, ...botHalf], { opacity: 0 });
    const sub = letters(root, 'THE BROKEN SIGNAL', { x: tx, y: capY + (portrait ? 70 : 44), size: portrait ? 34 : 24, family: 'Dela Gothic One', spacing: portrait ? 10 : 15, fill: PAL.cream });
    sub.items.forEach((it) => gsap.set(it.t, { opacity: 0 }));

    // ground
    const hill = E('path', { d: `M-500 ${H} L-500 ${H - 40} Q 120 ${H - 150} 280 ${H - 112} Q 420 ${H - 80} 560 ${H} Z`, fill: '#06040c', stroke: PAL.cream, 'stroke-width': 1.8 }, root);
    const plateau = E('path', { d: `M1000 ${H} Q 1040 ${H - 20} 1090 ${H - 18} L2100 ${H - 18} L2100 ${H} Z`, fill: '#06040c', stroke: PAL.cream, 'stroke-width': 1.8 }, root);
    gsap.set(hill, { x: -400, opacity: 0 }); gsap.set(plateau, { x: 420, opacity: 0 });
    const floor = E('rect', { x: -500, y: H, width: W + 1000, height: 400, fill: '#030206' }, root);
    // reflections of the wire line on the valley floor: three thin bands (the reels' stripe motif)
    const bands = [[H + 36, PAL.red], [H + 50, PAL.amber], [H + 64, PAL.blue]].map(([y, c], i) => E('rect', { x: -500, y, width: W + 1000, height: 7, fill: c, opacity: 0.9 }, root));
    bands.forEach((b, i) => gsap.set(b, { scaleX: 0, svgOrigin: `${i % 2 ? W + 500 : -500} 0` }));

    // dish, poles, wire, ledger
    const D = dish(root, 270, H - 108, 1.25);
    const Lg = ledger(root, 1330, H - 18, 1.12, 9);
    const px = [440, 560, 680, 800, 920, 1040];
    const P = poles(root, px, H + 2, H - 150);
    const pts = [[D.feed.x, D.feed.y], ...P.map((p) => [p.x, p.top]), [Lg.antenna.x, Lg.antenna.y]];
    const route = E('path', { d: wirePath(pts, 26), fill: 'none', stroke: 'none' }, root);
    // the wire is split into left and right of the break (between poles 3 and 4)
    const bx = 740;
    const ptsL = pts.slice(0, 4), ptsR = pts.slice(4);
    const wireL = E('path', { d: wirePath(ptsL, 26), fill: 'none', stroke: PAL.cyan, 'stroke-width': 2 }, root);
    const wireR = E('path', { d: wirePath(ptsR, 26), fill: 'none', stroke: PAL.cyan, 'stroke-width': 2 }, root);
    const p3 = P[2], p4 = P[3];
    const brkL = E('path', { d: `M${p3.x} ${p3.top} Q ${(p3.x + bx) / 2} ${p3.top + 26} ${bx} ${p3.top + 22}`, fill: 'none', stroke: PAL.cyan, 'stroke-width': 2 }, root);
    const brkR = E('path', { d: `M${bx} ${p3.top + 22} Q ${(bx + p4.x) / 2} ${p4.top + 26} ${p4.x} ${p4.top}`, fill: 'none', stroke: PAL.cyan, 'stroke-width': 2 }, root);
    const sparks = [];
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2 + 0.3, l = 14 + (i % 3) * 9;
      sparks.push(E('path', { d: `M${bx + Math.cos(a) * 6} ${p3.top + 22 + Math.sin(a) * 6} L${bx + Math.cos(a) * (6 + l)} ${p3.top + 22 + Math.sin(a) * (6 + l)}`, stroke: PAL.yellow, 'stroke-width': 2.2, opacity: 0 }, root));
    }
    const frags = [PAL.red, PAL.amber, PAL.cyan].map((c, i) => E('rect', { x: bx - 30, y: p3.top + 16 + i * 7, width: 60, height: 4, fill: c, opacity: 0 }, root));

    const reqP = pulse(root, PAL.amber);
    const resP = pulse(root, PAL.cyan);
    const commitRing = E('circle', { cx: Lg.antenna.x, cy: Lg.antenna.y, r: 10, fill: 'none', stroke: PAL.cream, 'stroke-width': 2, opacity: 0 }, root);
    const marquee = letters(root, 'LEDGER', { x: 1330, y: Lg.blocks[0].y + 34, size: 22, family: 'Dela Gothic One', spacing: 6, fill: PAL.amber });
    marquee.items.forEach((it) => gsap.set(it.t, { opacity: 0 }));

    // searchlight + evidence card
    const beam = E('polygon', { points: `${Lg.top.x},${Lg.top.y} 960,296 960,404`, fill: 'url(#c-beam)', opacity: 0 }, root);
    const card = E('g', { transform: 'rotate(-2.5 760 360)' }, root);
    const cardRect = E('rect', { x: 560, y: 300, width: 400, height: 100, rx: 3, fill: '#030a14', stroke: PAL.cyan, 'stroke-width': 1.8 }, card);
    gsap.set(cardRect, { fillOpacity: 0 });
    const cardLines = [];
    [['AUTHORITATIVE EVIDENCE', PAL.cyan, 'Dela Gothic One', 15], ['event 0042 · create_invoice · COMMITTED', PAL.cream, 'IBM Plex Mono', 16], ['response · lost in transit', PAL.amber, 'IBM Plex Mono', 16]].forEach(([s, c, f, z], i) => {
      const t = letters(card, s, { x: 582, y: 326 + i * 28, size: z, family: f, weight: f.includes('Mono') ? 500 : 400, spacing: i ? 0.5 : 4, fill: c, anchor: 'start' });
      t.items.forEach((it) => { gsap.set(it.t, { opacity: 0 }); cardLines.push(it.t); });
    });

    if (portrait) {
      const world = E('g', { transform: 'translate(-26 448) scale(0.66)' }, root);
      root.insertBefore(world, root.firstChild);
      [...root.children].forEach((c) => { if (c !== world && c !== titleG && c !== sub.g) world.appendChild(c); });
    }

    /* ===== choreography ===== */
    draw(tl, [horizonR, horizonL], 0.2, 0.7, { ease: 'power2.out' });
    tl.to(glow, { opacity: 1, duration: 1.4 }, 0.4);
    tl.to(hill, { x: 0, opacity: 1, duration: 1.1, ease: 'power3.out' }, 0.55);
    tl.to(plateau, { x: 0, opacity: 1, duration: 1.1, ease: 'power3.out' }, 0.7);
    coolWarm(tl, moon, '#cfe9ff', 0.9, 1.0);
    stars.forEach((s, i) => tl.set(s, { opacity: 0.25 + (i % 4) * 0.15 }, 0.9 + (i * 0.29) % 1.2));
    bands.forEach((b, i) => tl.to(b, { scaleX: 1, duration: 0.8, ease: 'power3.out' }, 1.0 + i * 0.14));

    draw(tl, D.parts, 1.1, 0.7, { stagger: 0.12 });
    draw(tl, Lg.rims, 1.3, 1.4, { ease: 'power1.inOut' });
    tl.to(Lg.body, { opacity: 1, duration: 0.5 }, 2.4);
    Lg.wins.forEach((w, i) => { warm(tl, w, PAL.amber, 2.2 + i * 0.012, 0.6); tl.set(w, { opacity: 0.35 + (i % 3) * 0.3 }, 2.2 + i * 0.012); });
    marquee.items.forEach((it, i) => { tl.set(it.t, { opacity: 1, fill: PAL.red }, 2.7 + i * 0.07); tl.to(it.t, { fill: PAL.amber, duration: 0.25 }, 2.75 + i * 0.07); });

    P.forEach((p, i) => {
      tl.from(p.P, { scaleY: 0, svgOrigin: `${p.x} ${H + 2}`, duration: 0.45, ease: 'power3.out' }, 1.8 + i * 0.08);
    });
    draw(tl, [wireL, brkL, brkR, wireR], 2.35, 0.25, { stagger: 0.22, ease: 'none' });

    // request travels; tower commits
    travel(tl, reqP, route, 0, 1, 3.3, 1.05, 'power1.inOut');
    tl.to(reqP, { opacity: 0, duration: 0.1 }, 4.35);
    tl.fromTo(commitRing, { opacity: 1, attr: { r: 8 } }, { opacity: 0, attr: { r: 60 }, duration: 0.6, ease: 'power2.out', immediateRender: false }, 4.35);
    tl.to(Lg.wins, { fill: PAL.cream, duration: 0.12, stagger: { each: 0.004, from: 'end' } }, 4.4);
    tl.to(Lg.wins, { fill: PAL.amber, duration: 0.5 }, 4.85);

    // reply heads home — and breaks
    const fb = fracAtX(route, bx);
    travel(tl, resP, route, 1, fb, 4.75, 0.6, 'power1.in');
    tl.set(resP, { opacity: 0 }, 5.35);
    tl.to(brkL, { rotation: 24, svgOrigin: `${p3.x} ${p3.top}`, duration: 0.5, ease: 'back.out(2)' }, 5.35);
    tl.to(brkR, { rotation: -24, svgOrigin: `${p4.x} ${p4.top}`, duration: 0.5, ease: 'back.out(2)' }, 5.35);
    tl.to([brkL, brkR], { stroke: PAL.red, duration: 0.3 }, 5.35);
    sparks.forEach((s, i) => { tl.set(s, { opacity: 1 }, 5.35); tl.to(s, { opacity: 0, duration: 0.35 }, 5.45 + i * 0.03); });
    frags.forEach((f, i) => {
      tl.set(f, { opacity: 1 }, 5.35);
      tl.to(f, { attr: { x: bx - 30 + (i - 1) * 90, y: p3.top + 60 + i * 26, width: 24 }, opacity: 0, duration: 0.7, ease: 'power2.out' }, 5.38);
    });

    // title arrives torn: halves misregistered, cool over hot
    tl.set([...topHalf, ...botHalf], { opacity: 1 }, 5.4);
    tl.fromTo(topHalf, { x: -120 }, { keyframes: [{ x: -36, duration: 0.18 }, { x: -58, duration: 0.12 }, { x: -22, duration: 0.3 }], ease: 'steps(3)' }, 5.4);
    tl.fromTo(botHalf, { x: 120 }, { keyframes: [{ x: 44, duration: 0.18 }, { x: 62, duration: 0.12 }, { x: 26, duration: 0.3 }], ease: 'steps(3)' }, 5.4);

    // searchlight finds the evidence
    tl.fromTo(beam, { opacity: 0, attr: { points: `${Lg.top.x},${Lg.top.y} ${Lg.top.x - 30},${Lg.top.y - 60} ${Lg.top.x + 10},${Lg.top.y - 70}` } },
      { opacity: 1, attr: { points: `${Lg.top.x},${Lg.top.y} 960,296 960,404` }, duration: 0.8, ease: 'power2.inOut' }, 5.7);
    draw(tl, cardRect, 6.3, 0.5);
    tl.to(cardRect, { fillOpacity: 0.85, duration: 0.3 }, 6.7);
    cardLines.forEach((t, i) => tl.set(t, { opacity: 1 }, 6.75 + i * 0.012));

    // the signal locks
    tl.to(topHalf, { x: 0, duration: 0.22, ease: 'power4.in' }, 7.5);
    tl.to(botHalf, { x: 0, duration: 0.22, ease: 'power4.in' }, 7.5);
    tl.to(tA.items.map((i) => i.t), { fill: PAL.cream, duration: 0.35 }, 7.72);
    tl.to(tB.items.map((i) => i.t), { fill: PAL.yellow, duration: 0.35 }, 7.72);
    flick(tl, screen, 7.72, 0.72);
    sub.items.forEach((it, i) => { tl.set(it.t, { opacity: 1, fill: PAL.red }, 7.95 + i * 0.04); tl.to(it.t, { fill: PAL.cream, duration: 0.25 }, 8.0 + i * 0.04); });
    tl.to(beam, { opacity: 0.55, duration: 0.6 }, 8.3);
    tl.to({}, { duration: 0.5 }, 8.8);
    return tl;
  }

  /* ================= ambiguity lab ================= */
  function lab() {
    const svg = document.getElementById('lab-svg');
    const form = document.getElementById('lab-form');
    const logEl = document.getElementById('lab-log');
    const vWord = document.getElementById('v-word'), vText = document.getElementById('v-text');
    const rows = document.getElementById('ledger-rows');
    const runBtn = document.getElementById('lab-run');
    const H = 410;
    svg.innerHTML = '';
    const root = E('g', { filter: 'url(#phos-lite)' }, svg);
    E('path', { d: `M0 ${H} L1300 ${H}`, stroke: PAL.cyan, 'stroke-width': 1.5, opacity: 0.6 }, root);
    [[H + 22, PAL.red], [H + 32, PAL.amber], [H + 42, PAL.blue]].forEach(([y, c]) => E('rect', { x: 0, y, width: 1300, height: 4, fill: c, opacity: .7 }, root));
    const D = dish(root, 150, H - 6, 1.05);
    const Lg = ledger(root, 1110, H, 0.8, 3);
    Lg.body.setAttribute('opacity', 1);
    Lg.wins.forEach((w, i) => { w.setAttribute('opacity', 0.35 + (i % 3) * 0.3); w.setAttribute('fill', PAL.amber); });
    const P = poles(root, [380, 520, 660, 800], H, H - 140);
    const pts = [[D.feed.x, D.feed.y], ...P.map((p) => [p.x, p.top]), [Lg.antenna.x, Lg.antenna.y]];
    const route = E('path', { d: wirePath(pts, 22), fill: 'none', stroke: PAL.cyan, 'stroke-width': 2, opacity: 0.85 }, root);
    const breakX = 590;
    const gap = E('g', { opacity: 0 }, root);
    E('rect', { x: breakX - 26, y: H - 150, width: 52, height: 60, fill: '#040203' }, gap);
    E('path', { d: `M${breakX - 26} ${H - 118} l10 16 M${breakX + 26} ${H - 118} l-10 16`, stroke: PAL.red, 'stroke-width': 2.4 }, gap);
    E('text', { x: breakX, y: H - 160, 'text-anchor': 'middle', fill: PAL.red, 'font-family': 'IBM Plex Mono', 'font-size': 18, 'font-weight': 600 }, gap).textContent = 'RESPONSE LOST';
    const agentQ = E('text', { x: 150, y: H - 150, 'text-anchor': 'middle', fill: PAL.yellow, 'font-family': 'Dela Gothic One', 'font-size': 40, opacity: 0 }, root);
    agentQ.textContent = '?';
    E('text', { x: 150, y: H + 80, 'text-anchor': 'middle', fill: '#c9b89c', 'font-family': 'IBM Plex Mono', 'font-size': 17 }, root).textContent = 'AGENT';
    E('text', { x: 1110, y: H + 80, 'text-anchor': 'middle', fill: '#c9b89c', 'font-family': 'IBM Plex Mono', 'font-size': 17 }, root).textContent = 'LEDGER · AUTHORITATIVE STATE';
    E('text', { x: 590, y: H + 80, 'text-anchor': 'middle', fill: '#c9b89c', 'font-family': 'IBM Plex Mono', 'font-size': 17 }, root).textContent = 'TOOL CALL · NETWORK';
    const req = pulse(root, PAL.amber), res = pulse(root, PAL.cyan), qry = pulse(root, PAL.teal);
    const ring = E('circle', { cx: Lg.antenna.x, cy: Lg.antenna.y, r: 10, fill: 'none', stroke: PAL.cream, 'stroke-width': 2, opacity: 0 }, root);
    const fb = fracAtX(route, breakX);

    let tl = null;
    const clock = () => `+${String(Math.round(tl.time() * 400)).padStart(4, ' ')}ms`;
    const log = (msg, cls) => { const li = document.createElement('li'); li.className = cls || ''; li.innerHTML = `<time>${clock()}</time><span>${msg}</span>`; logEl.appendChild(li); };
    let ledgerRows = [];
    const renderRows = () => {
      rows.innerHTML = ledgerRows.length ? ledgerRows.map((r) => `<div class="${r.dup ? 'dup' : ''}"><span>${r.id} · invoice · €120.00</span><span>${r.key}</span></div>`).join('') : '<div style="color:var(--muted)">ledger · empty</div>';
    };

    function run(e) {
      e && e.preventDefault();
      const f = new FormData(form);
      const fault = f.get('fault'), idem = f.get('idem') === 'on', strat = f.get('strategy');
      if (tl) tl.kill();
      logEl.innerHTML = ''; ledgerRows = []; renderRows();
      vWord.className = 'v-word'; vWord.textContent = 'Running…'; vText.textContent = '';
      gsap.set([gap, agentQ, req, res, qry], { opacity: 0 });
      runBtn.disabled = true;
      const key = idem ? 'key k-7f3a' : 'no key';
      const speed = AFTER.state.motion ? 1 : 30;
      tl = gsap.timeline({ onComplete: () => { runBtn.disabled = false; } });
      tl.timeScale(speed);
      let t = 0;
      const commit = (dup) => {
        tl.call(() => { ledgerRows.push({ id: `INV-00${ledgerRows.length + 1}`, key: idem ? 'k-7f3a' : '—', dup }); renderRows(); }, null, t);
        tl.fromTo(ring, { opacity: 1, attr: { r: 8 } }, { opacity: 0, attr: { r: 56 }, duration: 0.5 }, t);
        tl.to(Lg.wins, { fill: dup ? PAL.red : PAL.cream, duration: 0.1, stagger: 0.003 }, t);
        tl.to(Lg.wins, { fill: PAL.amber, duration: 0.4 }, t + 0.5);
      };
      const send = (attempt) => {
        tl.call(() => log(`agent → create_invoice(€120, ${key}) · attempt ${attempt}`), null, t);
        travel(tl, req, route, 0, 1, t, 0.9); t += 0.9; tl.set(req, { opacity: 0 }, t);
      };
      const reply = (lost) => {
        if (lost) {
          travel(tl, res, route, 1, fb, t, 0.55, 'power1.in'); t += 0.55;
          tl.set(res, { opacity: 0 }, t); tl.set(gap, { opacity: 1 }, t);
          tl.call(() => log('response dropped in transit (injected fault)', 'bad'), null, t);
          t += 0.4; tl.set(agentQ, { opacity: 1 }, t);
          tl.call(() => log('agent: timeout — outcome unknown', 'warn'), null, t); t += 0.6;
          tl.set([gap, agentQ], { opacity: 0 }, t);
        } else {
          travel(tl, res, route, 1, 0, t, 0.9); t += 0.9; tl.set(res, { opacity: 0 }, t);
        }
      };

      // attempt 1
      send(1);
      if (fault === 'pre-commit') {
        tl.call(() => log('ledger: request timed out before commit — nothing written', 'dim'), null, t); t += 0.3;
        tl.set(gap, { opacity: 1 }, t); t += 0.3; tl.set(agentQ, { opacity: 1 }, t);
        tl.call(() => log('agent: timeout — outcome unknown', 'warn'), null, t); t += 0.6; tl.set([gap, agentQ], { opacity: 0 }, t);
      } else {
        commit(false); tl.call(() => log('ledger: INV-001 committed', 'good'), null, t); t += 0.4;
        if (fault === 'none') { reply(false); tl.call(() => log('agent ← 201 Created INV-001', 'good'), null, t); }
        else reply(true);
      }

      // recovery
      let committedAfter1 = fault !== 'pre-commit';
      let effects = committedAfter1 ? 1 : 0;
      if (fault !== 'none') {
        const retry = () => {
          send(2);
          if (committedAfter1 && idem) {
            tl.call(() => log('ledger: key k-7f3a already applied → returns stored INV-001, no new effect', 'good'), null, t);
            tl.fromTo(ring, { opacity: 1, attr: { r: 8 } }, { opacity: 0, attr: { r: 40 }, duration: 0.4 }, t); t += 0.4;
          } else if (committedAfter1 && !idem) {
            commit(true); effects++;
            tl.call(() => log('ledger: INV-002 committed — second effect for the same intent', 'bad'), null, t); t += 0.4;
          } else {
            commit(false); effects = 1; tl.call(() => log('ledger: INV-001 committed', 'good'), null, t); t += 0.4;
          }
          reply(false); tl.call(() => log('agent ← 201 Created', 'dim'), null, t);
        };
        if (strat === 'verify') {
          tl.call(() => log(`agent → read ledger by ${idem ? 'key k-7f3a' : 'intent (amount, customer)'}`), null, t);
          travel(tl, qry, route, 0, 1, t, 0.8); t += 0.8; travel(tl, qry, route, 1, 0, t, 0.8); t += 0.8; tl.set(qry, { opacity: 0 }, t);
          if (committedAfter1) tl.call(() => log('evidence: INV-001 exists → adopt it, do not resend', 'good'), null, t);
          else { tl.call(() => log('evidence: no matching effect → safe to resend', 'dim'), null, t); t += 0.3; retry(); }
        } else {
          tl.call(() => log('agent: retrying without checking state', 'warn'), null, t); t += 0.3;
          retry();
        }
      }
      t += 0.4;
      tl.call(() => {
        if (effects === 1) {
          vWord.className = 'v-word good'; vWord.textContent = fault === 'none' ? 'Clean run' : 'Safe recovery';
          vText.textContent = fault === 'none' ? 'One intent, one effect. Nothing to recover from.' :
            strat === 'verify' ? 'The agent consulted authoritative state before acting, so the ambiguous failure produced exactly one effect.' :
              'The retry was blind, but the idempotency key let the ledger recognise it and return the stored result — exactly one effect.';
        } else {
          vWord.className = 'v-word bad'; vWord.textContent = 'Duplicate effect';
          vText.textContent = 'The first request had already succeeded. A blind retry without an idempotency key charged twice. This is the failure ChaosAgent is built to surface.';
        }
      }, null, t);
    }
    form.addEventListener('submit', run);
  }

  AFTER.buildChaos = build;
  AFTER.chaosLab = lab;
})();
