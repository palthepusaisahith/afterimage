/* THE AFTERIMAGE — shared broadcast engine.
   Motion grammar taken from the reference reels:
   - elements arrive dim red and "warm up" through amber to their final colour
   - outlines trace first, fills follow
   - colour bars streak in from opposite sides and stack into bands
   - forms rise from behind horizons (masked), never just fade
   - compositions finish with a soft flicker, then hold still */
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const reducedQuery = matchMedia('(prefers-reduced-motion: reduce)');

  const PAL = {
    black: '#040203', cream: '#fff1cf', paper: '#eadfc8', amber: '#ffb01f', yellow: '#ffd23a',
    orange: '#ff7a1a', red: '#ff3a1c', deep: '#6d0c05', blue: '#4f69ff', cyan: '#52e4ff',
    teal: '#1fe3b2', pink: '#f5a8d6', violet: '#8a6bff', green: '#6ee36a', ember: '#2a0402'
  };
  // the phosphor warm-up ramp seen on every element in the reels
  const HEAT = ['#2a0402', '#9a1208', '#ff3a1c', '#ff8a1c', '#ffc93a'];

  const state = { motion: !reducedQuery.matches, lite: false };

  function E(tag, attrs, parent) {
    const n = document.createElementNS(NS, tag);
    if (attrs) for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }
  const arr = (x) => (x == null ? [] : Array.isArray(x) ? x : x instanceof NodeList ? [...x] : [x]);
  const rand = (seed) => { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); };

  /* Stroke trace. dir = 1 draws from the path start, -1 from its end. */
  function draw(tl, els, at, dur, opt = {}) {
    els = arr(els);
    els.forEach((p) => {
      const L = p.getTotalLength ? p.getTotalLength() : 1000;
      p.style.strokeDasharray = `${L} ${L}`;
      p.style.strokeDashoffset = (opt.dir === -1 ? -L : L);
    });
    tl.to(els, { strokeDashoffset: 0, duration: dur, ease: opt.ease || 'power1.inOut', stagger: opt.stagger || 0 }, at);
    return tl;
  }

  /* Phosphor warm-up: dim ember -> red -> orange -> final. */
  function warm(tl, els, final, at, dur = 0.9, opt = {}) {
    const prop = opt.prop || 'fill';
    arr(els).forEach((el, i) => {
      const t = at + i * (opt.stagger || 0);
      tl.set(el, { [prop]: HEAT[0], opacity: opt.opacity ?? 1 }, t);
      tl.to(el, {
        keyframes: [
          { [prop]: HEAT[1], duration: dur * 0.18 },
          { [prop]: HEAT[2], duration: dur * 0.22 },
          { [prop]: HEAT[3], duration: dur * 0.25 },
          { [prop]: final, duration: dur * 0.35 }
        ], ease: 'none'
      }, t);
    });
    return tl;
  }

  /* Gentle broadcast flicker on a .screen — luminance dips, never strobes. */
  function flick(tl, screen, at, depth = 0.8) {
    tl.to(screen, {
      keyframes: [
        { '--flick': depth, duration: 0.06 }, { '--flick': 1.04, duration: 0.08 },
        { '--flick': 0.9, duration: 0.07 }, { '--flick': 1, duration: 0.2 }
      ], ease: 'none'
    }, at);
    return tl;
  }

  /* Lay out a string as one <text> per glyph so each letter can be choreographed. */
  function letters(parent, str, o) {
    const g = E('g', { class: o.cls || '' }, parent);
    const base = {
      'font-family': o.family, 'font-size': o.size, 'font-weight': o.weight || 400,
      'font-style': o.italic ? 'italic' : 'normal'
    };
    const fvs = 'white-space:pre;' + (o.fvs ? `font-variation-settings:${o.fvs};` : '');
    const probe = E('text', Object.assign({ x: 0, y: 0, style: fvs + 'opacity:0' }, base), parent);
    probe.textContent = str;
    const sp = o.spacing || 0;
    const n = str.length;
    const pos = [];
    for (let i = 0; i < n; i++) pos.push(probe.getStartPositionOfChar(i).x);
    const gaps = [];
    let acc = 0;
    for (let i = 0; i < n; i++) { gaps.push(acc); if (str[i] === ' ') acc += o.wordGap || 0; }
    const total = probe.getComputedTextLength() + sp * (n - 1) + acc;
    probe.remove();
    const x0 = o.anchor === 'start' ? o.x : o.anchor === 'end' ? o.x - total : o.x - total / 2;
    const items = [];
    for (let i = 0; i < n; i++) {
      const ch = str[i];
      if (ch === ' ') continue;
      const lg = E('g', { class: 'glyph' }, g);
      const t = E('text', Object.assign({ x: (x0 + pos[i] + sp * i + gaps[i]).toFixed(2), y: o.y, style: fvs }, base), lg);
      if (o.fill) t.setAttribute('fill', o.fill);
      t.textContent = ch;
      items.push({ g: lg, t, ch, x: x0 + pos[i] + sp * i + gaps[i] });
    }
    return { g, items, width: total, x0 };
  }

  /* Duplicate a lettered line: a solid "heat" copy over a gradient copy, so letters can warm up
     through the HEAT ramp and then reveal their final gradient face. */
  function heatLetters(parent, str, o) {
    const face = letters(parent, str, Object.assign({}, o, { fill: o.fill }));
    face.items.forEach((it) => {
      const h = it.t.cloneNode(true);
      h.setAttribute('fill', HEAT[0]);
      h.classList.add('heat');
      it.g.appendChild(h);
      it.heat = h;
    });
    return face;
  }

  /* ---------- Reel transport ---------- */
  const reels = {};
  const fmt = (t) => {
    const s = Math.floor(t), f = Math.floor((t - s) * 30);
    return `00:${String(s).padStart(2, '0')}:${String(f).padStart(2, '0')}`;
  };

  class Reel {
    constructor(name, tl, opt = {}) {
      this.name = name; this.tl = tl; this.played = false; this.screen = opt.screen;
      // the bloom groups: on slow machines they glow only once the frame holds still
      this.glow = opt.screen ? [...opt.screen.querySelectorAll('svg.scene > g[filter]')].map((g) => [g, g.getAttribute('filter')]) : [];
      this.onReplay = opt.onReplay;
      reels[name] = this;
      const host = document.querySelector(`[data-reel="${name}"]`);
      if (host) this.mount(host);
      tl.eventCallback('onUpdate', () => this.sync());
      tl.eventCallback('onComplete', () => { this.bloom(true); this.sync(); opt.onComplete && opt.onComplete(); });
    }
    mount(host) {
      host.innerHTML = `
        <button type="button" data-a="replay" aria-label="Replay sequence"><svg viewBox="0 0 10 10" aria-hidden="true"><path d="M5 1a4 4 0 1 1-4 4" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M0 1v4h4" fill="currentColor"/></svg>Replay</button>
        <button type="button" data-a="toggle" aria-label="Pause sequence"><svg viewBox="0 0 10 10" aria-hidden="true"><rect x="1" y="1" width="3" height="8" fill="currentColor"/><rect x="6" y="1" width="3" height="8" fill="currentColor"/></svg><span>Pause</span></button>
        <input type="range" min="0" max="1000" value="0" aria-label="Scrub through the sequence">
        <span class="tc" aria-hidden="true">00:00:00</span>`;
      this.range = host.querySelector('input');
      this.tc = host.querySelector('.tc');
      this.toggleBtn = host.querySelector('[data-a="toggle"]');
      host.querySelector('[data-a="replay"]').addEventListener('click', () => this.replay());
      this.toggleBtn.addEventListener('click', () => (this.tl.isActive() ? this.pause() : this.resume()));
      this.range.addEventListener('input', () => {
        this.tl.pause(); this.tl.progress(this.range.value / 1000); this.bloom(true); this.sync(true);
      });
    }
    bloom(on) {
      this.glow.forEach(([g, f]) => (on || !state.lite ? g.setAttribute('filter', f) : g.removeAttribute('filter')));
    }
    sync(fromScrub) {
      if (!this.range) return;
      if (!fromScrub) this.range.value = Math.round(this.tl.progress() * 1000);
      this.tc.textContent = fmt(this.tl.time());
      const playing = this.tl.isActive() && !this.tl.paused();
      this.toggleBtn.querySelector('span').textContent = playing ? 'Pause' : (this.tl.progress() >= 1 ? 'Play' : 'Resume');
      this.toggleBtn.setAttribute('aria-label', playing ? 'Pause sequence' : 'Play sequence');
    }
    play() {
      this.played = true;
      if (!state.motion) { this.finish(); return; }
      this.bloom(false);
      this.tl.play(0);
      this.sync();
    }
    replay() { AFTER.sound && AFTER.sound.sfx && AFTER.sound.sfx('clunk'); this.onReplay && this.onReplay(); this.played = true; if (!state.motion) { this.finish(); return; } this.bloom(false); this.tl.restart(); this.sync(); }
    pause() { this.tl.pause(); this.bloom(true); this.sync(); }
    resume() { this.bloom(false); if (this.tl.progress() >= 1) this.tl.restart(); else this.tl.resume(); this.sync(); }
    finish() { this.played = true; this.tl.pause(); this.tl.progress(1); this.bloom(true); this.sync(); }
  }

  /* ---------- adaptive quality: measure the first frames of the opening ---------- */
  function probeQuality(onLite) {
    // skip start-up work, then sample the opening while the sun rises (its busiest stretch);
    // under ~50 fps the scenes animate without bloom and glow once they hold
    setTimeout(() => {
      let t0 = 0, frames = 0;
      const f = (t) => {
        if (!t0) t0 = t;
        frames++;
        if (t - t0 < 700) return requestAnimationFrame(f);
        if (frames / ((t - t0) / 1000) < 50) { state.lite = true; document.documentElement.classList.add('lite'); onLite && onLite(); }
      };
      requestAnimationFrame(f);
    }, 1600);
  }

  /* ---------- ambient flicker: occasional, on one visible screen ---------- */
  const visible = new Set();
  const io = new IntersectionObserver((ents) => ents.forEach((e) => (e.isIntersecting ? visible.add(e.target) : visible.delete(e.target))), { threshold: 0.2 });
  function ambient() {
    if (state.motion && visible.size && !document.hidden) {
      const list = [...visible];
      const s = list[Math.floor(Math.random() * list.length)];
      gsap.to(s, { keyframes: [{ '--flick': 0.88, duration: 0.07 }, { '--flick': 1, duration: 0.12 }, { '--flick': 0.94, duration: 0.06 }, { '--flick': 1, duration: 0.25 }], ease: 'none' });
    }
    setTimeout(ambient, 6500 + Math.random() * 6000);
  }
  function watchScreens() { document.querySelectorAll('.screen').forEach((s) => io.observe(s)); setTimeout(ambient, 9000); }

  /* phones get portrait compositions: decided by the room the screen's column has */
  const isPortrait = (svg) => (svg.closest('.screen').parentElement.clientWidth || innerWidth) < 700;

  window.AFTER = { isPortrait, probeQuality, NS, E, PAL, HEAT, arr, rand, draw, warm, flick, letters, heatLetters, Reel, reels, state, reducedQuery, watchScreens };
})();
