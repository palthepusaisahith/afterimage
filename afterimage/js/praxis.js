/* CH 02 — PraxisMirror: "The Memory of Events"
   A rounded broadcast frame traces itself from one corner. Inside, a harbour at dusk
   cycles through its palette (black > yellow > red > pink) the way old idents settled
   their colours. Container and vessel histories cross through shared events, and the
   title is mirrored in the water below. */
(function () {
  const { E, PAL, HEAT, draw, warm, flick, letters, rand } = AFTER;

  function crane(g, x, base, s, fill) {
    const d = [
      `M${x - 46 * s} ${base} L${x - 30 * s} ${base - 190 * s} L${x - 22 * s} ${base - 190 * s} L${x - 34 * s} ${base} Z`,
      `M${x + 46 * s} ${base} L${x + 30 * s} ${base - 190 * s} L${x + 22 * s} ${base - 190 * s} L${x + 34 * s} ${base} Z`,
      `M${x - 40 * s} ${base - 90 * s} L${x + 40 * s} ${base - 90 * s} L${x + 40 * s} ${base - 80 * s} L${x - 40 * s} ${base - 80 * s} Z`,
      `M${x - 120 * s} ${base - 196 * s} L${x + 210 * s} ${base - 196 * s} L${x + 210 * s} ${base - 184 * s} L${x - 120 * s} ${base - 184 * s} Z`,
      `M${x - 8 * s} ${base - 190 * s} L${x} ${base - 250 * s} L${x + 8 * s} ${base - 190 * s} Z`,
      `M${x} ${base - 248 * s} L${x + 200 * s} ${base - 196 * s} L${x + 196 * s} ${base - 192 * s} L${x} ${base - 240 * s} Z`,
      `M${x - 6 * s} ${base - 248 * s} L${x - 112 * s} ${base - 196 * s} L${x - 108 * s} ${base - 192 * s} L${x - 6 * s} ${base - 240 * s} Z`,
      `M${x + 120 * s} ${base - 184 * s} L${x + 150 * s} ${base - 184 * s} L${x + 150 * s} ${base - 164 * s} L${x + 120 * s} ${base - 164 * s} Z`
    ].join(' ');
    return E('path', { d, fill }, g);
  }

  function build(svg) {
    svg.innerHTML = '';
    const W = 1600, Hh = 1020;
    svg.setAttribute('viewBox', `0 0 ${W} ${Hh}`);
    const screen = svg.closest('.screen');
    const tl = gsap.timeline({ paused: true });
    const defs = E('defs', null, svg);
    const fx = 130, fy = 190, fw = 1340, fh = 640, rx = 64;
    const clip = E('clipPath', { id: 'p-frame' }, defs);
    E('rect', { x: fx, y: fy, width: fw, height: fh, rx }, clip);
    const refl = E('linearGradient', { id: 'p-refl', x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
    E('stop', { offset: 0, 'stop-color': '#fff', 'stop-opacity': 0.75 }, refl); E('stop', { offset: 1, 'stop-color': '#fff', 'stop-opacity': 0 }, refl);
    const rm = E('mask', { id: 'p-reflmask', maskContentUnits: 'userSpaceOnUse' }, defs);
    E('rect', { x: 0, y: 850, width: W, height: 170, fill: 'url(#p-refl)' }, rm);

    const root = E('g', { filter: 'url(#phos)' }, svg);
    const inner = E('g', { 'clip-path': 'url(#p-frame)' }, root);

    const sky = E('rect', { x: fx, y: fy, width: fw, height: fh, fill: '#040203' }, inner);
    const sunG = E('g', null, inner);
    const sun = E('circle', { cx: 1010, cy: 600, r: 128, fill: PAL.yellow }, sunG);
    gsap.set(sunG, { y: 420 });
    const hills = E('path', { d: `M${fx} 640 L 260 600 L 380 618 L 520 560 L 640 596 L 760 548 L 900 600 L 1100 586 L 1260 540 L 1380 590 L ${fx + fw} 576 L ${fx + fw} 720 L ${fx} 720 Z`, fill: '#2a1030' }, inner);
    gsap.set(hills, { opacity: 0 });

    // object-history lines (behind the harbour silhouettes, crossing the sky)
    const linesG = E('g', { fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, inner);
    const hist = [
      { c: PAL.cream, pts: [[fx - 20, 330], [330, 330], [450, 450], [640, 450], [760, 330], [1110, 330], [1220, 420], [fx + fw + 20, 420]] },
      { c: PAL.yellow, pts: [[fx - 20, 470], [420, 470], [520, 370], [640, 370], [700, 430], [1110, 430], [1180, 360], [fx + fw + 20, 360]] },
      { c: PAL.blue, pts: [[fx - 20, 260], [560, 260], [640, 410], [880, 410], [960, 290], [1100, 290], [1160, 390], [fx + fw + 20, 390]] }
    ];
    const casings = [], strokes = [];
    hist.forEach((h) => {
      const d = 'M' + h.pts.map((p) => p.join(' ')).join(' L');
      casings.push(E('path', { d, stroke: '#140812', 'stroke-width': 14 }, linesG));
      strokes.push(E('path', { d, stroke: h.c, 'stroke-width': 7 }, linesG));
    });
    const nodes = [[640, 410], [640, 450], [640, 370], [1110, 330], [1110, 430], [1100, 290], [330, 330], [960, 290]].map(([x, y], i) =>
      E('circle', { cx: x, cy: y, r: i < 3 ? 13 : 10, fill: PAL.cream, stroke: '#140812', 'stroke-width': 5, opacity: 0 }, linesG));
    const shared = E('rect', { x: 626, y: 352, width: 28, height: 116, rx: 14, fill: 'none', stroke: '#140812', 'stroke-width': 5, opacity: 0 }, linesG);

    // harbour silhouettes
    const harbour = E('g', null, inner);
    const cranes = [crane(harbour, 360, 700, 1.05, '#06030a'), crane(harbour, 640, 700, 0.9, '#06030a'), crane(harbour, 1290, 700, 1.15, '#06030a')];
    cranes.forEach((c) => gsap.set(c, { y: 320 }));
    const quay = E('rect', { x: fx, y: 700, width: fw, height: 46, fill: '#040203' }, harbour);
    const r = rand(5);
    const boxCols = [PAL.teal, '#c2306d', PAL.cream, PAL.red, '#2a7fff', PAL.teal];
    const boxes = [];
    [[190, 3], [262, 2], [470, 4], [542, 3], [614, 2], [760, 3], [832, 1]].forEach(([x, n]) => {
      for (let k = 0; k < n; k++) boxes.push(E('rect', { x, y: 700 - (k + 1) * 32, width: 68, height: 30, fill: '#040203', stroke: '#06030a', 'stroke-width': 2, 'data-c': boxCols[Math.floor(r() * boxCols.length)] }, harbour));
    });
    const ship = E('g', null, harbour);
    E('path', { d: 'M980 712 L1450 712 L1420 770 L1010 770 Z', fill: '#06030a' }, ship);
    E('path', { d: 'M1340 712 L1340 660 L1400 660 L1400 712 Z M1360 660 L1360 636 L1376 636 L1376 660 Z', fill: '#06030a' }, ship);
    const deck = [];
    for (let i = 0; i < 6; i++) for (let k = 0; k < 2; k++) deck.push(E('rect', { x: 1020 + i * 52, y: 712 - (k + 1) * 26, width: 50, height: 24, fill: boxCols[(i + k * 3) % boxCols.length], stroke: '#06030a', 'stroke-width': 2 }, ship));
    gsap.set(ship, { x: 520 });

    const water = E('rect', { x: fx, y: 746, width: fw, height: 100, fill: '#071c2b', opacity: 0 }, inner);
    const glints = [[770, PAL.pink, 1], [790, PAL.yellow, -1], [808, PAL.pink, 1], [822, '#2a7fff', -1]].map(([y, c, d], i) => {
      const g = E('rect', { x: d > 0 ? fx : fx + fw, y, width: 0, height: 5, fill: c, opacity: 0.85 }, inner);
      return { g, d };
    });

    // frame border: two traces from the top-left corner meeting at bottom-right
    const borderA = E('path', { d: `M${fx + rx} ${fy} L${fx + fw - rx} ${fy} Q${fx + fw} ${fy} ${fx + fw} ${fy + rx} L${fx + fw} ${fy + fh - rx} Q${fx + fw} ${fy + fh} ${fx + fw - rx} ${fy + fh}`, fill: 'none', stroke: PAL.red, 'stroke-width': 9, 'stroke-linecap': 'round' }, root);
    const borderB = E('path', { d: `M${fx + rx} ${fy} Q${fx} ${fy} ${fx} ${fy + rx} L${fx} ${fy + fh - rx} Q${fx} ${fy + fh} ${fx + rx} ${fy + fh} L${fx + fw - rx} ${fy + fh}`, fill: 'none', stroke: PAL.red, 'stroke-width': 9, 'stroke-linecap': 'round' }, root);
    const corner = E('circle', { cx: fx + rx, cy: fy, r: 6, fill: HEAT[0], opacity: 0 }, root);

    // title sits on the top border, reflected in the water below the frame
    const tOpts = { x: W / 2, y: fy + 26, size: 96, family: 'Dela Gothic One', spacing: 4, fill: PAL.yellow };
    const tCase = letters(root, 'PRAXISMIRROR', Object.assign({}, tOpts, { fill: '#040203' }));
    tCase.items.forEach((it) => { it.t.setAttribute('stroke', '#040203'); it.t.setAttribute('stroke-width', 18); it.t.setAttribute('stroke-linejoin', 'round'); gsap.set(it.t, { opacity: 0 }); });
    const title = letters(root, 'PRAXISMIRROR', tOpts);
    title.items.forEach((it) => gsap.set(it.t, { opacity: 0 }));
    const reflWrap = E('g', { mask: 'url(#p-reflmask)', opacity: 0 }, svg);
    const reflG = E('g', { filter: 'url(#ripple)', transform: `translate(0 ${fy + fh + 30}) scale(1 -0.82)` }, reflWrap);
    letters(reflG, 'PRAXISMIRROR', Object.assign({}, tOpts, { y: 0, fill: PAL.pink }));
    const sub = letters(root, 'THE MEMORY OF EVENTS', { x: W / 2, y: fy - 96, size: 22, family: 'IBM Plex Mono', weight: 600, spacing: 14, fill: PAL.teal });
    sub.items.forEach((it) => gsap.set(it.t, { opacity: 0 }));

    /* ===== choreography ===== */
    warm(tl, corner, PAL.yellow, 0.2, 0.4);
    draw(tl, [borderA, borderB], 0.45, 1.25, { ease: 'power1.inOut' });
    tl.to([borderA, borderB], { keyframes: [{ stroke: PAL.orange, duration: 0.4 }, { stroke: PAL.yellow, duration: 0.5 }] }, 1.1);
    tl.to(corner, { opacity: 0, duration: 0.3 }, 1.7);

    // palette cycle: silhouette yellow on black -> red/green -> pink/teal
    tl.set(quay, { fill: PAL.yellow }, 1.55);
    tl.set(boxes, { fill: PAL.yellow, stroke: PAL.yellow }, 1.55);
    cranes.forEach((c, i) => tl.to(c, { y: 0, duration: 1.0, ease: 'power3.out' }, 1.6 + i * 0.14));
    tl.set(sky, { fill: '#d4140a' }, 2.05);
    tl.set([quay], { fill: '#2fd27a' }, 2.05);
    tl.set(boxes, { fill: '#2fd27a', stroke: '#06030a' }, 2.05);
    tl.set(hills, { opacity: 1, fill: '#5a0a10' }, 2.05);
    tl.to(sky, { fill: PAL.pink, duration: 0.45 }, 2.5);
    tl.to(quay, { fill: PAL.teal, duration: 0.45 }, 2.5);
    tl.to(hills, { fill: '#2a1030', duration: 0.45 }, 2.5);
    boxes.forEach((b, i) => tl.to(b, { fill: b.dataset.c, duration: 0.25 }, 2.55 + i * 0.03));
    tl.to(sunG, { y: 0, duration: 1.3, ease: 'power2.out' }, 2.35);
    tl.to(ship, { x: 0, duration: 1.5, ease: 'power3.out' }, 2.2);
    tl.set(water, { opacity: 1, fill: '#2fd27a' }, 2.05);
    tl.to(water, { fill: '#0b2a40', duration: 0.45 }, 2.5);
    glints.forEach(({ g, d }, i) => {
      if (d > 0) tl.to(g, { attr: { width: fw }, duration: 0.7, ease: 'power3.out' }, 2.8 + i * 0.12);
      else tl.to(g, { attr: { x: fx, width: fw }, duration: 0.7, ease: 'power3.out' }, 2.8 + i * 0.12);
    });

    // histories trace through the scene; shared events light up
    draw(tl, casings, 3.25, 1.2, { stagger: 0.22, ease: 'power1.inOut' });
    draw(tl, strokes, 3.3, 1.2, { stagger: 0.22, ease: 'power1.inOut' });
    nodes.forEach((n, i) => warm(tl, n, PAL.cream, 4.0 + i * 0.06, 0.45));
    tl.set(shared, { opacity: 1 }, 4.5);
    tl.from(shared, { attr: { height: 0, y: 410 }, duration: 0.35, ease: 'power2.out' }, 4.5);

    // title pops letter by letter, then its mirror rises in the water
    title.items.forEach((it, i) => {
      const at = 4.6 + i * 0.07;
      tl.set([it.t, tCase.items[i].t], { opacity: 1 }, at);
      tl.set(it.t, { fill: PAL.red }, at);
      tl.to(it.t, { fill: PAL.yellow, duration: 0.3 }, at + 0.05);
    });
    tl.to(reflWrap, { opacity: 0.55, duration: 0.8, ease: 'sine.out' }, 5.5);
    tl.from(reflG, { attr: { transform: `translate(0 ${fy + fh + 30}) scale(1 0)` }, duration: 0.8, ease: 'power2.out' }, 5.5);
    sub.items.forEach((it, i) => tl.set(it.t, { opacity: 1 }, 5.8 + i * 0.03));
    flick(tl, screen, 6.4, 0.78);
    tl.to({}, { duration: 0.6 }, 6.8);
    return tl;
  }

  /* ============ object history explorer (toy OCEL-style log) ============ */
  const OBJ = [
    { id: 'C1', type: 'container', c: '#fff1cf', lane: 60 },
    { id: 'C2', type: 'container', c: '#ffd23a', lane: 108 },
    { id: 'C3', type: 'container', c: '#f5a8d6', lane: 156 },
    { id: 'V1', type: 'vessel', c: '#6f86ff', lane: 216 },
    { id: 'T1', type: 'truck', c: '#1fe3b2', lane: 270 }
  ];
  const EV = [
    { id: 'e1', type: 'gate_in', t: 8.2, attrs: { lane: 'G3 (string)' }, rel: [['C1', 'container'], ['T1', 'carrier']] },
    { id: 'e2', type: 'gate_in', t: 9.1, attrs: { lane: 'G1 (string)' }, rel: [['C2', 'container'], ['T1', 'carrier']] },
    { id: 'e3', type: 'gate_in', t: 9.7, attrs: { lane: 'G2 (string)' }, rel: [['C3', 'container']] },
    { id: 'e4', type: 'load', t: 13.3, attrs: { crane: 'QC-2 (string)', weight_t: '21.4 (float)' }, rel: [['C1', 'cargo'], ['C2', 'cargo'], ['V1', 'vessel']] },
    { id: 'e5', type: 'reschedule', t: 15.0, attrs: { new_departure: '22:30 (timestamp)' }, rel: [['V1', 'vessel']] },
    { id: 'e6', type: 'inspect', t: 16.2, attrs: { outcome: 'hold (string)' }, rel: [['C3', 'container']] },
    { id: 'e7', type: 'depart', t: 22.5, attrs: { berth: 'B4 (string)' }, rel: [['V1', 'vessel'], ['C1', 'cargo'], ['C2', 'cargo']] }
  ];
  const X = (t) => 90 + (t - 7.5) / (23.5 - 7.5) * 1060;
  const hhmm = (t) => `${String(Math.floor(t)).padStart(2, '0')}:${String(Math.round((t % 1) * 60)).padStart(2, '0')}`;

  function explorer() {
    const svg = document.getElementById('ocel-svg');
    const chips = document.getElementById('obj-chips');
    const detail = document.getElementById('ocel-detail');
    svg.innerHTML = '';
    for (let h = 8; h <= 23; h += 3) {
      E('line', { x1: X(h), x2: X(h), y1: 30, y2: 300, stroke: '#ffffff12' }, svg);
      E('text', { x: X(h), y: 322, 'text-anchor': 'middle', fill: '#7d6f60', 'font-family': 'IBM Plex Mono', 'font-size': 13 }, svg).textContent = hhmm(h);
    }
    const objG = {};
    OBJ.forEach((o) => {
      const evs = EV.filter((e) => e.rel.some((r) => r[0] === o.id));
      const g = E('g', { 'data-obj': o.id }, svg);
      E('text', { x: 20, y: o.lane + 5, fill: o.c, 'font-family': 'IBM Plex Mono', 'font-size': 14, 'font-weight': 600 }, g).textContent = o.id;
      E('line', { x1: X(evs[0].t), x2: X(evs[evs.length - 1].t), y1: o.lane, y2: o.lane, stroke: o.c, 'stroke-width': 4, 'stroke-linecap': 'round' }, g);
      if (o.type === 'container' && !evs.some((e) => e.type === 'depart')) {
        E('line', { x1: X(evs[evs.length - 1].t) + 10, x2: X(22.5), y1: o.lane, y2: o.lane, stroke: o.c, 'stroke-width': 2, 'stroke-dasharray': '4 7', opacity: 0.7 }, g);
        E('text', { x: X(22.5) + 12, y: o.lane + 5, fill: '#ff7a5c', 'font-family': 'IBM Plex Mono', 'font-size': 13 }, g).textContent = '⚠ missing departure';
      }
      objG[o.id] = g;
    });
    const evG = {};
    EV.forEach((e) => {
      const lanes = e.rel.map((r) => OBJ.find((o) => o.id === r[0]).lane);
      const g = E('g', { class: 'ev', tabindex: 0, role: 'button', 'aria-label': `Event ${e.type} at ${hhmm(e.t)}, relates ${e.rel.map((r) => r[0] + ' as ' + r[1]).join(', ')}` }, svg);
      if (lanes.length > 1) E('rect', { x: X(e.t) - 9, y: Math.min(...lanes) - 9, width: 18, height: Math.max(...lanes) - Math.min(...lanes) + 18, rx: 9, fill: '#0b0608', stroke: '#eadfc8', 'stroke-width': 2 }, g);
      lanes.forEach((y) => { E('circle', { class: 'ring', cx: X(e.t), cy: y, r: 7, fill: '#fff1cf', stroke: '#0b0608', 'stroke-width': 2 }, g); });
      E('text', { x: X(e.t), y: 22, 'text-anchor': 'middle', fill: '#ab9c86', 'font-family': 'IBM Plex Mono', 'font-size': 12 }, g).textContent = e.type;
      const pick = () => showEvent(e);
      g.addEventListener('click', pick);
      g.addEventListener('keydown', (k) => { if (k.key === 'Enter' || k.key === ' ') { k.preventDefault(); pick(); } });
      evG[e.id] = g;
    });

    let active = null;
    OBJ.forEach((o) => {
      const b = document.createElement('button');
      b.className = 'chip'; b.type = 'button'; b.style.setProperty('--c', o.c); b.setAttribute('aria-pressed', 'false');
      b.innerHTML = `<i></i>${o.id} · ${o.type}`;
      b.addEventListener('click', () => {
        active = active === o.id ? null : o.id;
        chips.querySelectorAll('.chip').forEach((c) => c.setAttribute('aria-pressed', String(c === b && active === o.id)));
        highlight(active);
        if (active) showObject(o);
      });
      chips.appendChild(b);
    });

    function highlight(id) {
      OBJ.forEach((o) => gsap.to(objG[o.id], { opacity: !id || id === o.id ? 1 : 0.18, duration: 0.3 }));
      EV.forEach((e) => gsap.to(evG[e.id], { opacity: !id || e.rel.some((r) => r[0] === id) ? 1 : 0.2, duration: 0.3 }));
    }
    function showObject(o) {
      const evs = EV.filter((e) => e.rel.some((r) => r[0] === o.id));
      const gi = evs.find((e) => e.type === 'gate_in'), dp = evs.find((e) => e.type === 'depart');
      let dwell = '';
      if (o.type === 'container') dwell = gi && dp ? `${(dp.t - gi.t).toFixed(1)} h (in the elapsed-time population)` : '<span style="color:#ff7a5c">excluded — no departure event; flagged</span>';
      detail.innerHTML = `<h4 class="panel-h">Object ${o.id} · ${o.type}</h4><table>${evs.map((e) => `<tr><td>${hhmm(e.t)}</td><td>${e.type} <span class="q">as ${e.rel.find((r) => r[0] === o.id)[1]}</span>${e.rel.length > 1 ? ` · with ${e.rel.filter((r) => r[0] !== o.id).map((r) => r[0]).join(', ')}` : ''}</td></tr>`).join('')}${dwell ? `<tr><td>dwell</td><td>${dwell}</td></tr>` : ''}</table>`;
    }
    function showEvent(e) {
      detail.innerHTML = `<h4 class="panel-h">Event ${e.id} · ${e.type} · ${hhmm(e.t)}</h4><table>${Object.entries(e.attrs).map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`).join('')}${e.rel.map(([o, q]) => `<tr><td>${o}</td><td><span class="q">qualifier: ${q}</span></td></tr>`).join('')}<tr><td>lineage</td><td>toy-log.json · row ${EV.indexOf(e) + 1}</td></tr></table>`;
    }

    /* evidence contract */
    const A = { unit: 'hours', cohort: 'departed containers', perspective: 'container', rev: 'rev 3', lineage: 'snapshot recorded' };
    const B = [
      { label: 'Same metric, next snapshot', unit: 'hours', cohort: 'departed containers', perspective: 'container', rev: 'rev 3', lineage: 'snapshot recorded' },
      { label: 'Median dwell reported in days', unit: 'days', cohort: 'departed containers', perspective: 'container', rev: 'rev 3', lineage: 'snapshot recorded' },
      { label: 'Median dwell over all containers', unit: 'hours', cohort: 'all containers (incl. no departure)', perspective: 'container', rev: 'rev 3', lineage: 'snapshot recorded' },
      { label: 'Median vessel turnaround', unit: 'hours', cohort: 'departed vessels', perspective: 'vessel', rev: 'rev 3', lineage: 'snapshot recorded' },
      { label: 'Median dwell, older computation', unit: 'hours', cohort: 'departed containers', perspective: 'container', rev: 'rev 2', lineage: 'snapshot recorded' },
      { label: 'Spreadsheet figure, no lineage', unit: 'hours', cohort: 'departed containers', perspective: 'container', rev: 'rev 3', lineage: 'unknown source' }
    ];
    const sel = document.getElementById('contract-b');
    const checks = document.getElementById('checks');
    const verdict = document.getElementById('contract-verdict');
    B.forEach((b, i) => { const o = document.createElement('option'); o.value = i; o.textContent = b.label; sel.appendChild(o); });
    sel.value = 1;
    const keys = [['unit', 'Unit'], ['cohort', 'Cohort'], ['perspective', 'Perspective'], ['rev', 'Computation'], ['lineage', 'Lineage']];
    function check() {
      const b = B[sel.value];
      checks.innerHTML = keys.map(([k, n]) => {
        const ok = b[k] === A[k];
        return `<li><span class="${ok ? 'ok' : 'no'}">${ok ? '✓' : '✕'}</span><span>${n}</span><span>${ok ? b[k] : `${A[k]} ≠ ${b[k]}`}</span></li>`;
      }).join('');
      const bad = keys.filter(([k]) => b[k] !== A[k]).length;
      verdict.innerHTML = bad ? `<span style="color:#ff7a5c">Refused</span> <span style="font:400 14px var(--f-body);color:var(--muted)">— the contract blocks this reuse.</span>` : `<span style="color:var(--teal)">Compatible</span> <span style="font:400 14px var(--f-body);color:var(--muted)">— safe to compare.</span>`;
      if (AFTER.state.motion) gsap.from(checks.children, { opacity: 0, x: -10, stagger: 0.06, duration: 0.25 });
    }
    sel.addEventListener('change', check);
    check();
  }

  AFTER.buildPraxis = build;
  AFTER.praxisExplorer = explorer;
})();
