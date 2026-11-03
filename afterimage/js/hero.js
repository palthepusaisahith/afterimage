/* Opening title sequence — "PALTHEPU SAI SAHITH"
   A lost 1984 station ident: one point of light becomes a horizon, colour bars
   streak in, a striped sun rises behind traced ridges and a lattice tower, and the
   name rises from behind the ridge, warming from ember to cream before it holds. */
(function () {
  const { E, PAL, HEAT, draw, warm, flick, letters, heatLetters, rand } = AFTER;

  function layout(portrait) {
    return portrait
      ? { w: 900, h: 1500, cx: 450, H: 905, sunR: 300, tower: { x: 760, base: 965, top: 560 },
          pal: { y: 330, size: 60, sp: 20 },
          name: [{ s: 'SAI', y: 640, size: 250 }, { s: 'SAHITH', y: 880, size: 230 }], maxW: 820,
          bands: [1010, 1032, 1054], bandH: 13,
          role: [{ s: 'SOFTWARE ENGINEER', y: 1150 }, { s: '& RESEARCHER', y: 1200 }], roleSize: 36, roleSp: 8,
          tag: [{ s: 'RELIABLE AI SYSTEMS', y: 1275 }, { s: 'PROCESS INTELLIGENCE', y: 1310 }, { s: 'COMPUTATIONAL TOPOLOGY', y: 1345 }], tagSize: 22 }
      : { w: 1600, h: 1000, cx: 800, H: 600, sunR: 300, tower: { x: 1395, base: 668, top: 238 },
          pal: { y: 236, size: 64, sp: 34 },
          name: [{ s: 'SAI SAHITH', y: 618, size: 236 }], maxW: 1360,
          bands: [716, 738, 760], bandH: 13,
          role: [{ s: 'SOFTWARE ENGINEER  ·  RESEARCHER', y: 846 }], roleSize: 30, roleSp: 9,
          tag: [{ s: 'RELIABLE AI SYSTEMS  /  PROCESS INTELLIGENCE  /  COMPUTATIONAL TOPOLOGY', y: 892 }], tagSize: 17 };
  }

  function ridge(x0, x1, base, amp, seed, step, bottom) {
    const r = rand(seed);
    let d = '', top = '';
    let y = base;
    for (let x = x0, i = 0; x <= x1; x += step, i++) {
      y = base - amp * (0.35 + 0.65 * Math.abs(Math.sin(i * 0.55 + seed) * Math.cos(i * 0.21 + seed * 0.3))) - r() * amp * 0.18;
      top += (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1);
    }
    d = top + `L${x1} ${bottom}L${x0} ${bottom}Z`;
    return { fill: d, rim: top };
  }

  function build(svg) {
    svg.innerHTML = '';
    const portrait = svg.clientWidth / Math.max(1, svg.clientHeight) < 0.9;
    const L = layout(portrait);
    svg.setAttribute('viewBox', `0 0 ${L.w} ${L.h}`);
    const tl = gsap.timeline({ paused: true });
    const screen = svg.closest('.screen');

    /* defs */
    const defs = E('defs', null, svg);
    const sg = E('linearGradient', { id: 'h-sun', x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
    [['0', '#ffe68a'], ['.35', '#ffb01f'], ['.68', '#ff5a1c'], ['1', '#e81e0e']].forEach(([o, c]) => E('stop', { offset: o, 'stop-color': c }, sg));
    const ng = E('linearGradient', { id: 'h-name', x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
    [['0', '#fffaf0'], ['.45', '#fff1cf'], ['.7', '#ffd23a'], ['1', '#ff9a1f']].forEach(([o, c]) => E('stop', { offset: o, 'stop-color': c }, ng));
    const gl = E('radialGradient', { id: 'h-glow', cx: '.5', cy: '.5', r: '.5' }, defs);
    [['0', '#7a1408', 1], ['.55', '#2a0503', .6], ['1', '#000', 0]].forEach(([o, c, a]) => E('stop', { offset: o, 'stop-color': c, 'stop-opacity': a }, gl));
    const rb = E('linearGradient', { id: 'h-rainbow' }, defs);
    ['#ff3a1c', '#ffb01f', '#ffe14a', '#6ee36a', '#52e4ff', '#4f69ff'].forEach((c, i) => E('stop', { offset: i / 5, 'stop-color': c }, rb));
    const tailR = E('linearGradient', { id: 'h-tail-r' }, defs);
    E('stop', { offset: 0, 'stop-color': '#fff', 'stop-opacity': 0 }, tailR); E('stop', { offset: 1, 'stop-color': '#fff', 'stop-opacity': 1 }, tailR);
    const tailL = E('linearGradient', { id: 'h-tail-l' }, defs);
    E('stop', { offset: 0, 'stop-color': '#fff', 'stop-opacity': 1 }, tailL); E('stop', { offset: 1, 'stop-color': '#fff', 'stop-opacity': 0 }, tailL);

    const clipSky = E('clipPath', { id: 'h-sky' }, defs);
    E('rect', { x: -2000, y: -500, width: L.w + 4000, height: L.H + 500 }, clipSky);
    const lastName = L.name[L.name.length - 1];
    const clipName = E('clipPath', { id: 'h-nameclip' }, defs);
    E('rect', { x: -2000, y: -800, width: L.w + 4000, height: lastName.y + 50 + 800 }, clipName);

    // sun stripe cuts (mask) — slices grow from the centre outwards
    const sunMask = E('mask', { id: 'h-sunmask', maskUnits: 'userSpaceOnUse', x: -2000, y: -500, width: L.w + 4000, height: L.h + 1000 }, defs);
    E('rect', { x: -2000, y: -500, width: L.w + 4000, height: L.h + 1000, fill: '#fff' }, sunMask);
    const cuts = [];
    const cutDefs = [[0.42, 5], [0.55, 8], [0.66, 11], [0.76, 14], [0.85, 17], [0.93, 20]];
    cutDefs.forEach(([f, hh]) => {
      const y = L.H - L.sunR + f * L.sunR;
      cuts.push(E('rect', { x: L.cx - L.sunR - 10, y: y.toFixed(1), width: L.sunR * 2 + 20, height: hh, fill: '#000' }, sunMask));
    });

    // name stripe cuts: thin black slices across the lower third of the letters
    const nameMask = E('mask', { id: 'h-namemask', maskUnits: 'userSpaceOnUse', x: -2000, y: -800, width: L.w + 4000, height: L.h + 1600 }, defs);
    E('rect', { x: -2000, y: -800, width: L.w + 4000, height: L.h + 1600, fill: '#fff' }, nameMask);
    const nameCuts = [];
    L.name.forEach((ln) => {
      [[0.25, 3], [0.17, 4], [0.1, 5]].forEach(([f, hh]) => {
        nameCuts.push(E('rect', { x: -2000, y: (ln.y - ln.size * f).toFixed(1), width: L.w + 4000, height: hh, fill: '#000' }, nameMask));
      });
    });

    /* scene */
    const root = E('g', { filter: 'url(#phos)' }, svg);

    // stars: fixed, sparse
    const stars = E('g', null, root);
    const r = rand(66);
    const starEls = [];
    for (let i = 0; i < (portrait ? 36 : 54); i++) {
      const x = r() * L.w, y = r() * (L.H - 340) + 40;
      if (Math.abs(x - L.cx) < L.sunR * 0.9 && y > L.H - L.sunR - 120) continue;
      starEls.push(E('circle', { cx: x.toFixed(1), cy: y.toFixed(1), r: (0.9 + r() * 1.6).toFixed(2), fill: PAL.cream, opacity: 0 }, stars));
    }

    const glowWrap = E('g', { 'clip-path': 'url(#h-sky)' }, root);
    const glow = E('ellipse', { cx: L.cx, cy: L.H, rx: L.w * 0.8, ry: L.h * 0.45, fill: 'url(#h-glow)', opacity: 0 }, glowWrap);

    // sun
    const sunWrap = E('g', { 'clip-path': 'url(#h-sky)' }, root);
    const sun = E('g', { mask: 'url(#h-sunmask)' }, sunWrap);
    const sunDisc = E('circle', { cx: L.cx, cy: L.H, r: L.sunR, fill: 'url(#h-sun)' }, sun);
    const sunHeat = E('circle', { cx: L.cx, cy: L.H, r: L.sunR, fill: HEAT[0] }, sun);
    gsap.set(sun, { y: L.sunR + 40 });

    // horizon signal: dot -> line
    const dot = E('circle', { cx: L.cx, cy: L.H, r: 4, fill: HEAT[0], opacity: 0 }, root);
    const line = E('rect', { x: L.cx, y: L.H - 1.5, width: 0, height: 3, fill: PAL.cream, opacity: 0 }, root);

    // far ridge
    const far = ridge(-1400, L.w + 1400, L.H + 6, portrait ? 70 : 60, 3, 46, L.h + 300);
    const farG = E('g', null, root);
    const farFill = E('path', { d: far.fill, fill: '#1c0605', opacity: 0 }, farG);
    const farRim = E('path', { d: far.rim, fill: 'none', stroke: PAL.red, 'stroke-width': 2, 'stroke-linejoin': 'round' }, farG);

    // tower (midground)
    const T = L.tower;
    const towerG = E('g', { fill: 'none', stroke: PAL.amber, 'stroke-width': 2.2, 'stroke-linecap': 'round' }, root);
    const legL = E('path', { d: `M${T.x - 62} ${T.base} L${T.x - 9} ${T.top + 40}` }, towerG);
    const legR = E('path', { d: `M${T.x + 62} ${T.base} L${T.x + 9} ${T.top + 40}` }, towerG);
    const braces = [];
    const N = 9;
    for (let i = 0; i < N; i++) {
      const f0 = i / N, f1 = (i + 1) / N;
      const y0 = T.base + (T.top + 40 - T.base) * f0, y1 = T.base + (T.top + 40 - T.base) * f1;
      const w0 = 62 - 53 * f0, w1 = 62 - 53 * f1;
      braces.push(E('path', { d: `M${T.x - w0} ${y0} L${T.x + w1} ${y1} M${T.x + w0} ${y0} L${T.x - w1} ${y1}`, 'stroke-width': 1.3, stroke: '#ff8a1c' }, towerG));
    }
    const plat = [0.42, 0.72].map((f) => {
      const y = T.base + (T.top + 40 - T.base) * f, w = 62 - 53 * f + 18;
      return E('path', { d: `M${T.x - w} ${y} L${T.x + w} ${y} M${T.x - w} ${y} L${T.x - w} ${y - 10} M${T.x + w} ${y} L${T.x + w} ${y - 10} M${T.x - w} ${y - 10} L${T.x + w} ${y - 10}`, stroke: PAL.cream, 'stroke-width': 1.6 }, towerG);
    });
    const mast = E('path', { d: `M${T.x} ${T.top + 40} L${T.x} ${T.top - 18}`, stroke: PAL.cream, 'stroke-width': 2.4 }, towerG);
    const beacon = E('circle', { cx: T.x, cy: T.top - 24, r: 7, fill: HEAT[0], stroke: 'none', opacity: 0 }, root);
    const arcs = [];
    [42, 74, 108].forEach((rad) => {
      const a0 = -50 * Math.PI / 180, a1 = 50 * Math.PI / 180;
      const cx = T.x, cy = T.top - 24;
      const p = (a, s) => `${(cx + s * rad * Math.cos(a)).toFixed(1)} ${(cy + rad * Math.sin(a)).toFixed(1)}`;
      arcs.push(E('path', { d: `M${p(a0, 1)} A${rad} ${rad} 0 0 1 ${p(a1, 1)}`, fill: 'none', stroke: PAL.cream, 'stroke-width': 2, 'stroke-linecap': 'round' }, root));
      arcs.push(E('path', { d: `M${p(a0, -1)} A${rad} ${rad} 0 0 0 ${p(a1, -1)}`, fill: 'none', stroke: PAL.cream, 'stroke-width': 2, 'stroke-linecap': 'round' }, root));
    });

    // mid ridge (slides in from the left)
    const mid = ridge(-1400, L.w + 1400, L.H + (portrait ? 60 : 52), portrait ? 80 : 66, 11, 64, L.h + 300);
    const midG = E('g', null, root);
    E('path', { d: mid.fill, fill: '#0d0304' }, midG);
    const midRim = E('path', { d: mid.rim, fill: 'none', stroke: PAL.amber, 'stroke-width': 2 }, midG);
    gsap.set(midG, { x: -420, opacity: 0 });

    // NAME — sits between the mid and front ridges, rises from behind the front ridge
    const nameWrap = E('g', { 'clip-path': 'url(#h-nameclip)' }, root);
    const shadowG = E('g', { opacity: 0 }, nameWrap);
    const nameG = E('g', { mask: 'url(#h-namemask)' }, nameWrap);
    const nameLines = L.name.map((ln) => {
      let size = ln.size;
      let o = { x: L.cx, y: ln.y, size, family: 'Fraunces', weight: 900, fvs: '"SOFT" 100, "WONK" 0, "opsz" 144', spacing: -4, wordGap: size * 0.2, fill: 'url(#h-name)' };
      let probe = letters(nameG, ln.s, o); const w = probe.width; probe.g.remove();
      if (w > L.maxW) o.size = size * L.maxW / w;
      const sh = letters(shadowG, ln.s, Object.assign({}, o, { fill: '#7a1006' }));
      const face = heatLetters(nameG, ln.s, o);
      return { face, sh };
    });

    // front ridge (slides in from the right)
    const front = ridge(-1400, L.w + 1400, lastName.y + (portrait ? 92 : 96), portrait ? 46 : 44, 21, 80, L.h + 300);
    const frontG = E('g', null, root);
    E('path', { d: front.fill, fill: '#040203' }, frontG);
    const frontRim = E('path', { d: front.rim, fill: 'none', stroke: PAL.cream, 'stroke-width': 1.6 }, frontG);
    gsap.set(frontG, { x: 480, opacity: 0 });

    // PALTHEPU — pops letter by letter after a spectral lead-in line
    const pal = letters(root, 'PALTHEPU', { x: L.cx, y: L.pal.y, size: L.pal.size, family: 'Dela Gothic One', spacing: L.pal.sp, fill: PAL.amber });
    pal.items.forEach((it) => gsap.set(it.t, { opacity: 0 }));
    const lead = E('rect', { x: pal.x0 - 20, y: L.pal.y + 16, width: 0, height: 4, fill: 'url(#h-rainbow)' }, root);

    // colour bands — streak in from alternating sides
    const bandCols = [PAL.red, PAL.amber, PAL.blue];
    const bands = L.bands.map((y, i) => {
      const clip = E('clipPath', { id: 'h-band' + i }, defs);
      const cr = E('rect', { x: i % 2 ? L.w + 1400 : -1400, y: y - 4, width: 0, height: L.bandH + 8 }, clip);
      const b = E('rect', { x: -1400, y, width: L.w + 2800, height: L.bandH, fill: bandCols[i], 'clip-path': `url(#h-band${i})` }, root);
      const head = E('rect', { x: 0, y: y - 1, width: 360, height: L.bandH + 2, fill: `url(#h-tail-${i % 2 ? 'l' : 'r'})`, opacity: 0 }, root);
      return { b, cr, head, dir: i % 2 ? -1 : 1, y };
    });
    // short pre-streaks (the zip before the bands lay down)
    const pre = [0, 1, 2].map((i) => E('rect', { x: -800, y: L.bands[i], width: 300, height: L.bandH, fill: `url(#h-tail-${i % 2 ? 'l' : 'r'})`, opacity: 0, style: `color:${bandCols[i]}` }, root));
    pre.forEach((p, i) => p.setAttribute('fill', bandCols[i]));

    // role + tagline
    const roleClip = E('clipPath', { id: 'h-roleclip' }, defs);
    const roleRect = E('rect', { x: 0, y: L.role[0].y - L.roleSize - 10, width: 0, height: (L.role.length * 54) + 30 }, roleClip);
    const roleG = E('g', { 'clip-path': 'url(#h-roleclip)' }, root);
    let roleMinX = Infinity, roleMaxX = -Infinity;
    L.role.forEach((rl) => {
      const t = letters(roleG, rl.s, { x: L.cx, y: rl.y, size: L.roleSize, family: 'Dela Gothic One', spacing: L.roleSp, fill: PAL.cream });
      roleMinX = Math.min(roleMinX, t.x0); roleMaxX = Math.max(roleMaxX, t.x0 + t.width);
    });
    roleRect.setAttribute('x', roleMinX - 20);
    const cursor = E('rect', { x: roleMinX - 20, y: L.role[0].y - L.roleSize + 2, width: 16, height: L.roleSize + 4 + (L.role.length - 1) * 50, fill: PAL.cream, opacity: 0 }, root);
    const tagItems = [];
    L.tag.forEach((tg) => {
      const t = letters(root, tg.s, { x: L.cx, y: tg.y, size: L.tagSize, family: 'IBM Plex Mono', weight: 500, spacing: portrait ? 3 : 4, fill: '#c9b89c' });
      t.items.forEach((it) => { gsap.set(it.t, { opacity: 0 }); tagItems.push(it.t); });
    });

    /* ===== choreography ===== */
    tl.addLabel('signal', 0.35);
    warm(tl, dot, PAL.cream, 0.35, 0.5);
    tl.to(dot, { keyframes: [{ opacity: 0.25, duration: 0.12 }, { opacity: 1, duration: 0.12 }, { opacity: 0.3, duration: 0.1 }, { opacity: 1, duration: 0.12 }] }, 0.85);
    tl.set(line, { opacity: 1 }, 1.3);
    tl.to(line, { attr: { x: L.cx - L.w * 0.62, width: L.w * 1.24 }, duration: 0.5, ease: 'power3.out' }, 1.3);
    tl.to(dot, { opacity: 0, duration: 0.2 }, 1.45);
    tl.to(line, { opacity: 0.35, attr: { height: 1.5, y: L.H - 0.75 }, duration: 0.8 }, 1.8);

    // pre-streaks zip across
    pre.forEach((p, i) => {
      const dir = i % 2 ? -1 : 1;
      tl.fromTo(p, { opacity: 1, attr: { x: dir > 0 ? -600 : L.w + 300 } },
        { attr: { x: dir > 0 ? L.w + 300 : -600 }, duration: 0.42, ease: 'power2.in', immediateRender: false }, 1.5 + i * 0.12);
      tl.set(p, { opacity: 0 }, 1.92 + i * 0.12);
    });

    tl.to(glow, { opacity: 0.95, duration: 1.6, ease: 'sine.out' }, 1.7);
    // sun rises from behind the horizon while warming up
    tl.to(sun, { y: 0, duration: 1.6, ease: 'power2.out' }, 1.85);
    warm(tl, sunHeat, '#ff5a1c', 1.85, 1.0);
    tl.to(sunHeat, { opacity: 0, duration: 0.7, ease: 'sine.inOut' }, 2.75);
    cuts.forEach((c, i) => tl.from(c, { attr: { x: L.cx, width: 0 }, duration: 0.5, ease: 'power2.out' }, 2.45 + i * 0.07));

    // bands lay down
    bands.forEach((bd, i) => {
      const t0 = 2.05 + i * 0.16, d = 0.85;
      const full = L.w + 2800;
      if (bd.dir > 0) tl.to(bd.cr, { attr: { width: full }, duration: d, ease: 'power3.out' }, t0);
      else tl.to(bd.cr, { attr: { x: -1400, width: full }, duration: d, ease: 'power3.out' }, t0);
      tl.fromTo(bd.head, { opacity: 1, attr: { x: bd.dir > 0 ? -1700 : L.w + 1400 } },
        { attr: { x: bd.dir > 0 ? L.w + 1050 : -1350 }, duration: d, ease: 'power3.out', immediateRender: false }, t0);
      tl.to(bd.head, { opacity: 0, duration: 0.25 }, t0 + d - 0.2);
    });

    // ridges: trace, fill, slide
    draw(tl, farRim, 2.4, 1.1, { ease: 'power2.inOut' });
    tl.to(farFill, { opacity: 1, duration: 0.6 }, 3.1);
    tl.to(midG, { x: 0, opacity: 1, duration: 1.2, ease: 'power3.out' }, 2.75);
    draw(tl, midRim, 2.75, 1.2);
    tl.to(frontG, { x: 0, opacity: 1, duration: 1.2, ease: 'power3.out' }, 2.95);
    draw(tl, frontRim, 2.95, 1.2, { dir: -1 });

    starEls.forEach((s, i) => { tl.set(s, { opacity: 0.25 + (i % 5) * 0.12 }, 3.0 + (i * 0.37) % 1.1); });

    // tower traces up from its footing, beacon lights, signal arcs go out once
    draw(tl, [legL, legR], 3.15, 0.9, { ease: 'power2.out' });
    braces.forEach((b, i) => draw(tl, b, 3.3 + i * 0.07, 0.3));
    draw(tl, plat, 3.85, 0.4, { stagger: 0.1 });
    draw(tl, mast, 4.0, 0.3);
    warm(tl, beacon, PAL.red, 4.2, 0.4);
    arcs.forEach((a, i) => {
      draw(tl, a, 4.3 + Math.floor(i / 2) * 0.13, 0.35);
      tl.to(a, { opacity: 0.28 + (2 - Math.floor(i / 2)) * 0.12, duration: 0.5 }, 4.75 + Math.floor(i / 2) * 0.13);
    });

    // the name rises from behind the front ridge, warming ember -> cream
    let k = 0;
    nameLines.forEach((nl, li) => {
      nl.face.items.forEach((it, i) => {
        const t0 = 3.95 + k * 0.075;
        tl.from(it.g, { y: (L.name[li].size * 1.15), duration: 0.95, ease: 'power3.out' }, t0);
        warm(tl, it.heat, '#fff1cf', t0, 1.1);
        tl.to(it.heat, { opacity: 0, duration: 0.45, ease: 'sine.inOut' }, t0 + 1.0);
        k++;
      });
      nl.sh.items.forEach((it, i) => gsap.set(it.g, { x: 0, y: 0 }));
    });
    // block extrusion slides out from behind the letters
    const shItems = nameLines.flatMap((nl) => nl.sh.items.map((it) => it.g));
    tl.set(shadowG, { opacity: 1 }, 5.15);
    tl.fromTo(shItems, { x: 0, y: 0 }, { x: 7, y: 7, duration: 0.35, ease: 'power2.out' }, 5.15);
    nameCuts.forEach((c, i) => tl.from(c, { attr: { width: 0 }, duration: 0.45, ease: 'power2.out' }, 5.05 + i * 0.04));

    // PALTHEPU
    tl.to(lead, { attr: { width: pal.width + 40 }, duration: 0.45, ease: 'power2.inOut' }, 5.1);
    pal.items.forEach((it, i) => {
      tl.set(it.t, { opacity: 1, fill: PAL.red }, 5.35 + i * 0.075);
      tl.to(it.t, { fill: PAL.amber, duration: 0.3 }, 5.4 + i * 0.075);
    });
    tl.to(lead, { attr: { x: pal.x0 + pal.width + 20, width: 0 }, duration: 0.35, ease: 'power2.in' }, 5.95);

    // role wipes on behind a cursor block; tagline types on
    tl.set(cursor, { opacity: 1 }, 5.95);
    tl.to(roleRect, { attr: { width: roleMaxX - roleMinX + 40 }, duration: 0.7, ease: 'steps(18)' }, 5.95);
    tl.to(cursor, { attr: { x: roleMaxX + 8 }, duration: 0.7, ease: 'steps(18)' }, 5.95);
    tl.to(cursor, { keyframes: [{ opacity: 0, duration: 0.01 }, { opacity: 1, duration: 0.01, delay: 0.18 }, { opacity: 0, duration: 0.01, delay: 0.18 }] }, 6.7);
    tagItems.forEach((t, i) => tl.set(t, { opacity: 1 }, 6.35 + i * 0.012));

    // settle and hold
    flick(tl, screen, 7.25, 0.78);
    tl.to({}, { duration: 0.6 }, 7.6);
    tl.call(() => document.dispatchEvent(new CustomEvent('hero:done')), null, 7.7);
    tl.progress(0);
    return tl;
  }

  AFTER.buildHero = build;
})();
