/* CH 03 — Computational topology: "The Hidden Structure"
   Everything here is computed in the browser from a synthetic scalar field:
   contours by marching squares, the merge tree of superlevel sets by union-find,
   persistence pairs by the elder rule. Conceptual only — not research output. */
(function () {
  const { E, PAL, HEAT, draw, warm, flick, letters, rand } = AFTER;

  /* ---------- field ---------- */
  function makeField(nx, ny, seed) {
    const r = rand(seed);
    const peaks = [];
    const n = 6 + Math.floor(r() * 3);
    for (let i = 0; i < n; i++) peaks.push({ x: 0.15 + r() * 0.7, y: 0.15 + r() * 0.7, a: 0.35 + r() * 0.65, s: 0.06 + r() * 0.09 });
    const F = new Float32Array(nx * ny);
    let lo = Infinity, hi = -Infinity;
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
      const x = i / (nx - 1), y = j / (ny - 1);
      let v = 0;
      for (const p of peaks) v += p.a * Math.exp(-((x - p.x) ** 2 + (y - p.y) ** 2) / (2 * p.s * p.s));
      v *= Math.pow(Math.sin(Math.PI * x) * Math.sin(Math.PI * y), 0.35);
      F[j * nx + i] = v; lo = Math.min(lo, v); hi = Math.max(hi, v);
    }
    for (let k = 0; k < F.length; k++) F[k] = (F[k] - lo) / (hi - lo);
    return { F, nx, ny };
  }

  /* ---------- marching squares, chained into polylines ---------- */
  const SEG = [[], [[3, 2]], [[2, 1]], [[3, 1]], [[0, 1]], [[3, 0], [2, 1]], [[0, 2]], [[3, 0]], [[3, 0]], [[0, 2]], [[3, 2], [0, 1]], [[0, 1]], [[3, 1]], [[2, 1]], [[3, 2]], []];
  function contours({ F, nx, ny }, l) {
    const pt = {}, adj = {};
    const at = (i, j) => F[j * nx + i];
    const key = (i, j, e) => e === 0 ? `h${i},${j}` : e === 2 ? `h${i},${j + 1}` : e === 3 ? `v${i},${j}` : `v${i + 1},${j}`;
    const pos = (i, j, e) => {
      let a, b, pa, pb;
      if (e === 0) { a = at(i, j); b = at(i + 1, j); pa = [i, j]; pb = [i + 1, j]; }
      else if (e === 2) { a = at(i, j + 1); b = at(i + 1, j + 1); pa = [i, j + 1]; pb = [i + 1, j + 1]; }
      else if (e === 3) { a = at(i, j); b = at(i, j + 1); pa = [i, j]; pb = [i, j + 1]; }
      else { a = at(i + 1, j); b = at(i + 1, j + 1); pa = [i + 1, j]; pb = [i + 1, j + 1]; }
      const t = (l - a) / (b - a || 1e-9);
      return [pa[0] + (pb[0] - pa[0]) * t, pa[1] + (pb[1] - pa[1]) * t];
    };
    for (let j = 0; j < ny - 1; j++) for (let i = 0; i < nx - 1; i++) {
      const c = (at(i, j) > l) << 3 | (at(i + 1, j) > l) << 2 | (at(i + 1, j + 1) > l) << 1 | (at(i, j + 1) > l);
      for (const [e1, e2] of SEG[c]) {
        const k1 = key(i, j, e1), k2 = key(i, j, e2);
        pt[k1] = pt[k1] || pos(i, j, e1); pt[k2] = pt[k2] || pos(i, j, e2);
        (adj[k1] = adj[k1] || []).push(k2); (adj[k2] = adj[k2] || []).push(k1);
      }
    }
    const seen = new Set(), lines = [];
    for (const s in adj) {
      if (seen.has(s)) continue;
      // start from an open end if there is one
      let start = s;
      const line = [];
      let prev = null, cur = start;
      while (cur && !seen.has(cur)) {
        seen.add(cur); line.push(pt[cur]);
        const nxt = (adj[cur] || []).find((k) => k !== prev && !seen.has(k));
        prev = cur; cur = nxt;
      }
      if (adj[start].length === 2 && (adj[start].includes(prev))) line.push(pt[start]);
      if (line.length > 2) lines.push(line);
    }
    return lines;
  }

  /* ---------- merge tree of superlevel sets + elder-rule persistence ---------- */
  function mergeTree({ F, nx, ny }) {
    const N = nx * ny;
    const order = Array.from({ length: N }, (_, k) => k).sort((a, b) => F[b] - F[a]);
    const parent = new Int32Array(N).fill(-1);
    const birth = new Int32Array(N).fill(-1); // component root -> its maximum vertex
    const find = (x) => { while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; } return x; };
    const maxima = [];
    const info = {}; // max vertex -> {v, f, death, killer, saddle}
    for (const v of order) {
      parent[v] = v;
      const i = v % nx, j = (v / nx) | 0;
      const roots = new Set();
      for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) {
        if (!di && !dj) continue;
        const ii = i + di, jj = j + dj;
        if (ii < 0 || jj < 0 || ii >= nx || jj >= ny) continue;
        const u = jj * nx + ii;
        if (parent[u] !== -1) roots.add(find(u));
      }
      if (!roots.size) { birth[v] = v; maxima.push(v); info[v] = { v, f: F[v], i, j, death: null, killer: null }; continue; }
      const rs = [...roots].sort((a, b) => F[birth[b]] - F[birth[a]]);
      const elder = rs[0];
      for (const r of rs.slice(1)) {
        const m = birth[r];
        info[m].death = F[v]; info[m].killer = birth[elder]; info[m].saddle = { i, j, f: F[v] };
        parent[r] = elder;
      }
      parent[v] = elder;
    }
    const gmax = maxima[0];
    let fmin = Infinity; for (let k = 0; k < N; k++) fmin = Math.min(fmin, F[k]);
    info[gmax].death = fmin; info[gmax].essential = true;
    const list = maxima.map((m) => Object.assign(info[m], { p: info[m].f - info[m].death }));
    return { list, gmax: info[gmax] };
  }

  const LEVEL_COLS = ['#3b1fb0', '#5b3cff', '#8a6bff', '#52a8ff', '#52e4ff', '#9ff0d8', '#ffd23a', '#ffe9a8', '#fff1cf'];
  function levelColor(t) {
    const x = t * (LEVEL_COLS.length - 1), i = Math.floor(x), f = x - i;
    const c0 = LEVEL_COLS[Math.min(i, LEVEL_COLS.length - 1)], c1 = LEVEL_COLS[Math.min(i + 1, LEVEL_COLS.length - 1)];
    return gsap.utils.interpolate(c0, c1, f);
  }

  /* ================= ident ================= */
  function build(svg) {
    svg.innerHTML = '';
    const W = 1600, Hh = 840;
    const screen = svg.closest('.screen');
    const portrait = AFTER.isPortrait(svg);
    svg.setAttribute('viewBox', portrait ? '0 0 1000 920' : `0 0 ${W} ${Hh}`);
    screen.style.setProperty('--ar', portrait ? '1000 / 920' : `${W} / ${Hh}`);
    const tl = gsap.timeline({ paused: true });
    // pick a deterministic field with a characterful merge tree
    let seed = 2026, fld;
    for (let k = 0; k < 60; k++) { fld = makeField(64, 64, seed + k); if (mergeTree(fld).list.filter((m) => m.p > 0.08).length >= 5) break; }
    const A = 640, B = 205, Hz = 262, cx = 800, cy = 388;
    const P = (u, v, z) => [cx + (u - v) * A, cy + (u + v) * B - z * Hz];
    const g2u = (gx, gy) => [gx / (fld.nx - 1), gy / (fld.ny - 1)];
    const root = E('g', { filter: 'url(#phos)' }, svg);
    const defs = E('defs', null, svg);

    // sky: a few fixed stars and a pale horizon wash
    const r = rand(9);
    const stars = [];
    for (let i = 0; i < 30; i++) stars.push(E('circle', { cx: (r() * W).toFixed(0), cy: (r() * 300 + 10).toFixed(0), r: (0.8 + r() * 1.2).toFixed(1), fill: '#d9d0ff', opacity: 0 }, root));

    // floor
    const c0 = P(0, 0, 0), c1 = P(1, 0, 0), c2 = P(1, 1, 0), c3 = P(0, 1, 0);
    const floor = E('path', { d: `M${c0} L${c1} L${c2} L${c3} Z`, fill: '#07041a', stroke: '#5b3cff', 'stroke-width': 2 }, root);
    const grid = [];
    for (let k = 1; k < 8; k++) {
      const t = k / 8;
      grid.push(E('path', { d: `M${P(t, 0, 0)} L${P(t, 1, 0)}`, stroke: '#2b1a7a', 'stroke-width': 1.2, fill: 'none' }, root));
      grid.push(E('path', { d: `M${P(0, t, 0)} L${P(1, t, 0)}`, stroke: '#2b1a7a', 'stroke-width': 1.2, fill: 'none' }, root));
    }

    // contour terrain
    const levels = [];
    const NL = 15;
    for (let k = 0; k < NL; k++) {
      const l = 0.06 + k * (0.9 / (NL - 1));
      const lines = contours(fld, l);
      const g = E('g', null, root);
      const paths = lines.map((ln) => E('path', {
        d: 'M' + ln.map(([gx, gy]) => { const [u, v] = g2u(gx, gy); return P(u, v, l).map((n) => n.toFixed(1)).join(' '); }).join(' L'),
        fill: 'none', stroke: levelColor(k / (NL - 1)), 'stroke-width': k > NL - 4 ? 2.6 : 2, 'stroke-linejoin': 'round'
      }, g));
      levels.push({ g, paths, l, k });
    }

    // merge tree embedded in the terrain: branches drop from each peak to the saddle where it merges
    const T = mergeTree(fld);
    const sig = T.list.filter((m) => m.p > 0.035);
    const branchPaths = [], maxMarks = [], sadMarks = [];
    sig.forEach((m) => {
      const [u, v] = g2u(m.i, m.j);
      const top = P(u, v, m.f);
      maxMarks.push(E('path', { d: `M${top[0]} ${top[1] - 11} l9 11 l-9 11 l-9 -11 Z`, fill: PAL.cream, opacity: 0 }, root));
      if (m.essential) {
        const bot = P(u, v, 0);
        branchPaths.push(E('path', { d: `M${top} L${bot}`, stroke: PAL.yellow, 'stroke-width': 2.4, fill: 'none', 'stroke-dasharray': '0' }, root));
        return;
      }
      const [su, sv] = g2u(m.saddle.i, m.saddle.j);
      const drop = P(u, v, m.death), sad = P(su, sv, m.death);
      branchPaths.push(E('path', { d: `M${top} L${drop} L${sad}`, stroke: PAL.yellow, 'stroke-width': 2.4, fill: 'none' }, root));
      sadMarks.push(E('path', { d: `M${sad[0] - 8} ${sad[1] - 8} l16 16 M${sad[0] + 8} ${sad[1] - 8} l-16 16`, stroke: PAL.cream, 'stroke-width': 3, opacity: 0 }, root));
    });

    // titles
    const kick = letters(root, 'COMPUTATIONAL TOPOLOGY', { x: portrait ? 56 : 140, y: portrait ? 84 : 96, size: portrait ? 30 : 26, family: 'Dela Gothic One', spacing: portrait ? 6 : 10, fill: PAL.violet, anchor: 'start' });
    kick.items.forEach((it) => gsap.set(it.t, { opacity: 0 }));
    const clip = E('clipPath', { id: 't-clip' }, defs);
    E('rect', { x: 0, y: 0, width: W, height: portrait ? 362 : 226 }, clip);
    const tg = E('g', { 'clip-path': 'url(#t-clip)' }, root);
    const title = { items: [] };
    (portrait ? [['The Hidden', 210], ['Structure', 340]] : [['The Hidden Structure', 210]]).forEach(([w, y]) => {
      title.items.push(...AFTER.heatLetters(tg, w, { x: portrait ? 48 : 132, y, size: portrait ? 136 : 118, family: 'Fraunces', weight: 800, italic: true, fvs: '"SOFT" 100, "WONK" 1, "opsz" 144', spacing: -1, fill: '#fff1cf', anchor: 'start' }).items);
    });
    const tline = E('rect', { x: portrait ? 56 : 140, y: portrait ? 372 : 236, width: 0, height: 4, fill: PAL.violet }, root);
    const legend = letters(root, '◆ MAXIMA   ✕ SADDLES   │ MERGE TREE', { x: portrait ? 56 : W - 140, y: portrait ? 424 : 96, size: portrait ? 22 : 17, family: 'IBM Plex Mono', weight: 500, spacing: 2, fill: '#c9b8ff', anchor: portrait ? 'start' : 'end' });
    legend.items.forEach((it) => gsap.set(it.t, { opacity: 0 }));
    const note = letters(root, 'SYNTHETIC FIELD · COMPUTED LIVE · CONCEPTUAL', { x: portrait ? 56 : W - 140, y: portrait ? 456 : 126, size: portrait ? 17 : 14, family: 'IBM Plex Mono', weight: 500, spacing: 3, fill: '#7d6fa8', anchor: portrait ? 'start' : 'end' });
    if (portrait) {
      const keep = [kick.g, tg, tline, legend.g, note.g];
      const world = E('g', { transform: 'translate(-70 312) scale(0.72)' }, root);
      root.insertBefore(world, root.firstChild);
      [...root.children].forEach((c) => { if (c !== world && !keep.includes(c)) world.appendChild(c); });
    }
    note.items.forEach((it) => gsap.set(it.t, { opacity: 0 }));

    /* ===== choreography ===== */
    draw(tl, floor, 0.2, 0.9, { ease: 'power2.inOut' });
    tl.from(floor, { fillOpacity: 0, duration: 0.6 }, 0.7);
    draw(tl, grid, 0.6, 0.5, { stagger: 0.03 });
    stars.forEach((s, i) => tl.set(s, { opacity: 0.2 + (i % 4) * 0.15 }, 0.5 + (i * 0.23) % 1.4));
    levels.forEach(({ g, paths, l, k }) => {
      const at = 1.0 + k * 0.16;
      tl.from(g, { y: l * Hz, duration: 0.85, ease: 'power2.out' }, at);
      draw(tl, paths, at, 0.7, { ease: 'power1.out' });
      const final = levelColor(k / (NL - 1));
      tl.fromTo(paths, { stroke: '#1a0a4a' }, { keyframes: [{ stroke: '#5b3cff', duration: 0.25 }, { stroke: final, duration: 0.45 }], immediateRender: false }, at);
    });
    maxMarks.forEach((m, i) => warm(tl, m, PAL.cream, 3.65 + i * 0.08, 0.4));
    draw(tl, branchPaths, 3.9, 0.7, { stagger: 0.1, ease: 'power2.in' });
    sadMarks.forEach((m, i) => tl.set(m, { opacity: 1 }, 4.35 + i * 0.1));

    kick.items.forEach((it, i) => { tl.set(it.t, { opacity: 1, fill: PAL.red }, 4.4 + i * 0.03); tl.to(it.t, { fill: PAL.violet, duration: 0.3 }, 4.45 + i * 0.03); });
    title.items.forEach((it, i) => {
      const at = 4.6 + i * 0.05;
      tl.from(it.g, { y: 150, duration: 0.8, ease: 'power3.out' }, at);
      warm(tl, it.heat, '#fff1cf', at, 0.9);
      tl.to(it.heat, { opacity: 0, duration: 0.4 }, at + 0.85);
    });
    tl.to(tline, { attr: { width: portrait ? 420 : 560 }, duration: 0.6, ease: 'power2.out' }, 5.4);
    legend.items.forEach((it, i) => tl.set(it.t, { opacity: 1 }, 5.5 + i * 0.015));
    note.items.forEach((it, i) => tl.set(it.t, { opacity: 1 }, 5.75 + i * 0.012));
    flick(tl, screen, 6.3, 0.78);
    tl.to({}, { duration: 0.6 }, 6.7);
    return tl;
  }

  /* ================= interactive lab ================= */
  function lab() {
    const cv = document.getElementById('field-canvas');
    const ctx = cv.getContext('2d');
    const thr = document.getElementById('thr'), eps = document.getElementById('eps');
    const thrO = document.getElementById('thr-o'), epsO = document.getElementById('eps-o');
    const readout = document.getElementById('field-readout');
    const treeSvg = document.getElementById('tree-svg'), pdSvg = document.getElementById('pd-svg');
    const NX = 96, NY = 72;
    let seed = 7, fld, T, img;
    const off = document.createElement('canvas'); off.width = NX; off.height = NY;
    const octx = off.getContext('2d');

    function setup() {
      // step to the next seed that gives a field with a few meaningful features
      for (let k = 0; k < 80; k++, seed++) { fld = makeField(NX, NY, seed); if (mergeTree(fld).list.filter((m) => m.p > 0.06).length >= 4) break; }
      T = mergeTree(fld);
      layoutTree();
      render();
    }

    let xs = {};
    function layoutTree() {
      const kids = {};
      T.list.forEach((m) => { if (!m.essential) (kids[m.killer] = kids[m.killer] || []).push(m); });
      const ord = [];
      const walk = (m) => {
        const k = (kids[m.v] || []).sort((a, b) => b.death - a.death);
        const left = k.filter((_, i) => i % 2 === 0), right = k.filter((_, i) => i % 2 === 1);
        left.slice().reverse().forEach(walk);
        ord.push(m.v);
        right.forEach(walk);
      };
      walk(T.gmax);
      xs = {};
      ord.forEach((v, i) => (xs[v] = 30 + (i + 0.5) * (400 / ord.length)));
    }

    function render() {
      const t = thr.value / 1000, e = eps.value / 1000;
      thrO.value = t.toFixed(2); epsO.value = e.toFixed(2);
      // heightmap: below threshold dim, above threshold lit
      const id = octx.createImageData(NX, NY);
      for (let k = 0; k < NX * NY; k++) {
        const v = fld.F[k];
        const c = gsap.utils.splitColor(levelColor(v));
        const on = v >= t;
        const m = on ? 1 : 0.26;
        id.data[k * 4] = c[0] * m; id.data[k * 4 + 1] = c[1] * m; id.data[k * 4 + 2] = c[2] * m; id.data[k * 4 + 3] = 255;
      }
      octx.putImageData(id, 0, 0);
      ctx.imageSmoothingEnabled = true;
      ctx.fillStyle = '#000'; ctx.fillRect(0, 0, cv.width, cv.height);
      ctx.drawImage(off, 0, 0, cv.width, cv.height);
      // threshold contour
      const sx = cv.width / (NX - 1), sy = cv.height / (NY - 1);
      ctx.save(); ctx.shadowColor = '#ffd23a'; ctx.shadowBlur = 8; ctx.strokeStyle = '#ffd23a'; ctx.lineWidth = 2;
      contours(fld, t).forEach((ln) => { ctx.beginPath(); ln.forEach(([x, y], i) => (i ? ctx.lineTo(x * sx, y * sy) : ctx.moveTo(x * sx, y * sy))); ctx.stroke(); });
      ctx.restore();
      // maxima markers
      T.list.forEach((m) => {
        const keep = m.p >= e || m.essential;
        ctx.fillStyle = keep ? '#fff1cf' : '#6b5f8a';
        ctx.beginPath(); const x = m.i * sx, y = m.j * sy; ctx.moveTo(x, y - 6); ctx.lineTo(x + 5, y); ctx.lineTo(x, y + 6); ctx.lineTo(x - 5, y); ctx.fill();
      });
      // vertical raster on the canvas, matching the screens
      ctx.fillStyle = 'rgba(0,0,0,.28)';
      for (let x = 0; x < cv.width; x += 3) ctx.fillRect(x, 0, 1, cv.height);

      // tree
      const Y = (f) => 236 - f * 214;
      treeSvg.innerHTML = '';
      E('rect', { x: 0, y: Y(t) - 0.5, width: 460, height: 1, fill: '#ffd23a' }, treeSvg);
      E('text', { x: 452, y: Y(t) - 6, 'text-anchor': 'end', fill: '#ffd23a', 'font-family': 'IBM Plex Mono', 'font-size': 11 }, treeSvg).textContent = `t = ${t.toFixed(2)}`;
      let alive = 0, aliveS = 0;
      T.list.forEach((m) => {
        const keep = m.p >= e || m.essential;
        const x = xs[m.v];
        const d = m.essential ? `M${x} ${Y(m.f)} L${x} ${Y(m.death) + 8}` : `M${x} ${Y(m.f)} L${x} ${Y(m.death)} L${xs[m.killer]} ${Y(m.death)}`;
        E('path', { d, fill: 'none', stroke: keep ? '#fff1cf' : '#4a3d72', 'stroke-width': keep ? 2 : 1.2, 'stroke-dasharray': keep ? '' : '3 3' }, treeSvg);
        E('circle', { cx: x, cy: Y(m.f), r: keep ? 3.5 : 2, fill: keep ? '#8a6bff' : '#4a3d72' }, treeSvg);
        if (m.f >= t && m.death < t) { alive++; if (keep) aliveS++; }
      });
      // persistence diagram: x = death, y = birth
      pdSvg.innerHTML = '';
      const px = (v) => 40 + v * 400, py = (v) => 220 - v * 200;
      E('path', { d: `M${px(0)} ${py(0)} L${px(1)} ${py(1)}`, stroke: '#ab9c86', 'stroke-width': 1 }, pdSvg);
      E('path', { d: `M${px(0)} ${py(e)} L${px(1 - e)} ${py(1)} L${px(1)} ${py(1)} L${px(0)} ${py(0)} Z`, fill: '#8a6bff', opacity: 0.16 }, pdSvg);
      E('text', { x: 440, y: 234, 'text-anchor': 'end', fill: '#7d6f60', 'font-family': 'IBM Plex Mono', 'font-size': 11 }, pdSvg).textContent = 'death →';
      E('text', { x: 44, y: 16, fill: '#7d6f60', 'font-family': 'IBM Plex Mono', 'font-size': 11 }, pdSvg).textContent = '↑ birth';
      T.list.forEach((m) => {
        const keep = m.p >= e || m.essential;
        if (m.essential) E('path', { d: `M${px(m.death)} ${py(m.f) - 7} l6 10 l-12 0 Z`, fill: '#ffd23a' }, pdSvg);
        else E('circle', { cx: px(m.death), cy: py(m.f), r: keep ? 5 : 3.5, fill: keep ? '#fff1cf' : '#4a3d72', stroke: keep ? '#8a6bff' : 'none', 'stroke-width': 2 }, pdSvg);
      });
      const kept = T.list.filter((m) => m.p >= e || m.essential).length;
      readout.innerHTML = `Superlevel set at <b>t = ${t.toFixed(2)}</b>: <b>${alive}</b> component${alive === 1 ? '' : 's'} (${aliveS} after simplification). Field has <b>${T.list.length}</b> maxima; <b>${kept}</b> survive persistence ≥ ${e.toFixed(2)}.`;
    }

    thr.addEventListener('input', render);
    eps.addEventListener('input', render);
    document.getElementById('reseed').addEventListener('click', () => { seed = (seed * 31 + 11) % 9973 + 1; setup(); });
    let sweepTl = null;
    document.getElementById('sweep').addEventListener('click', () => {
      if (sweepTl) sweepTl.kill();
      const o = { v: 1000 };
      sweepTl = gsap.to(o, { v: 0, duration: AFTER.state.motion ? 6 : 0.01, ease: 'none', onUpdate: () => { thr.value = o.v; render(); } });
    });
    setup();
  }

  AFTER.buildTopo = build;
  AFTER.topoLab = lab;
})();
