/* THE AFTERIMAGE — orchestration: reels, channel changes, motion preferences. */
(function () {
  const { Reel, reels, state, reducedQuery } = AFTER;
  const main = document.getElementById('main');
  const tuner = document.getElementById('tuner');
  const CH = { top: '00', about: '01', skills: '02', experience: '03', topology: '04', guide: 'GUIDE', chaosagent: '05', praxismirror: '06', pneumonet: '07', contact: '08' };

  async function fonts() {
    const want = ['400 40px "Dela Gothic One"', '400 40px Anton', '900 40px Fraunces', 'italic 800 40px Fraunces', '400 40px Righteous', '500 20px "IBM Plex Mono"'];
    try { await Promise.race([Promise.all(want.map((f) => document.fonts.load(f))), new Promise((r) => setTimeout(r, 3500))]); } catch (e) { /* fall back to system faces */ }
    await document.fonts.ready;
  }

  function scrollCue(show) {
    gsap.to('.scroll-cue', { opacity: show ? 1 : 0, duration: state.motion ? 0.6 : 0 });
  }

  /* ---------- the CRT channel change ---------- */
  let tuning = false;
  function tune(id, color, name) {
    const target = document.getElementById(id);
    if (!target) return;
    // while the picture is squashed every scene would be "in view"; paint only the real viewport's
    const hideOff = () => document.querySelectorAll('main .screen').forEach((sc) => {
      let y = 0;
      for (let n = sc; n; n = n.offsetParent) y += n.offsetTop;
      sc.classList.toggle('off', !(y < window.scrollY + innerHeight && y + sc.offsetHeight > window.scrollY));
    });
    const land = () => {
      // layout offsets ignore the CRT collapse transform on <main>; getBoundingClientRect would not
      let y = 0;
      for (let n = target; n; n = n.offsetParent) y += n.offsetTop;
      window.scrollTo({ top: id === 'top' ? 0 : y, behavior: 'instant' });
      const h = target.querySelector('h1, h2') || target;
      h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true });
      history.replaceState(null, '', '#' + id);
      hideOff();
    };
    if (!state.motion || tuning) { land(); return; }
    tuning = true;
    tuner.style.setProperty('--tc', color || '#ffb01f');
    tuner.querySelector('.n').textContent = CH[id] && CH[id] !== 'GUIDE' ? `CHANNEL ${CH[id]}` : 'PROGRAMME GUIDE';
    tuner.querySelector('.nm').textContent = name || '';
    const slate = tuner.querySelector('.slate'), line = tuner.querySelector('.line');
    const origin = () => `50% ${window.scrollY + innerHeight / 2 - main.offsetTop}px`;
    document.documentElement.classList.add('tuning');
    hideOff();
    gsap.timeline({ onComplete: () => { tuning = false; document.documentElement.classList.remove('tuning'); document.querySelectorAll('main .screen.off').forEach((sc) => sc.classList.remove('off')); gsap.set(main, { clearProps: 'transform,filter' }); AFTER.tv && AFTER.tv.announce(id); } })
      .call(() => { AFTER.tuning = true; })
      .set(main, { transformOrigin: origin() })
      // the picture collapses to a line, then to a point
      .to(main, { scaleY: 0.006, duration: 0.3, ease: 'power3.in' })
      .to(main, { scaleX: 0.002, duration: 0.14, ease: 'power2.in' })
      .set(tuner, { opacity: 1 })
      .call(() => AFTER.tv && AFTER.tv.staticBurst(0.32))
      .set(slate, { opacity: 0 })
      // a beat of darkness, then the station slate warms in
      .to(slate, { keyframes: [{ opacity: 0.4, duration: 0.06 }, { opacity: 0.15, duration: 0.05 }, { opacity: 1, duration: 0.12 }] }, '+=0.34')
      .call(land)
      .to(slate, { opacity: 0, duration: 0.12 }, '+=0.38')
      .set(line, { scaleX: 0 })
      .to(line, { scaleX: 1, duration: 0.18, ease: 'power3.out' })
      .set(main, { transformOrigin: () => origin(), scaleX: 1, scaleY: 0.006 })
      .set(tuner, { opacity: 0 })
      .set(line, { scaleX: 0 })
      .call(() => {
        // the destination's ident plays as the picture opens
        AFTER.tuning = false;
        const scr = target.querySelector('.screen[data-reel-for]');
        const r = scr && reels[scr.dataset.reelFor];
        if (r) r.replay();
      })
      .to(main, { scaleY: 1, duration: 0.42, ease: 'power3.out' });
  }

  function wireNav() {
    document.querySelectorAll('[data-tune]').forEach((a) => a.addEventListener('click', (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey) return;
      e.preventDefault();
      document.getElementById('channels').classList.remove('open');
      document.querySelector('.menu-btn').setAttribute('aria-expanded', 'false');
      tune(a.dataset.tune, a.dataset.tc, a.dataset.name);
    }));
    const mb = document.querySelector('.menu-btn');
    mb.addEventListener('click', () => {
      const open = document.getElementById('channels').classList.toggle('open');
      mb.setAttribute('aria-expanded', String(open));
    });
    const head = document.getElementById('masthead');
    const onScroll = () => head.classList.toggle('solid', window.scrollY > 40);
    addEventListener('scroll', onScroll, { passive: true }); onScroll();

    // current channel indicator
    const links = [...document.querySelectorAll('.channels a[data-tune]')];
    const io = new IntersectionObserver((ents) => ents.forEach((en) => {
      if (en.isIntersecting) links.forEach((l) => l.setAttribute('aria-current', String(l.dataset.tune === en.target.id)));
    }), { rootMargin: '-45% 0px -50% 0px' });
    document.querySelectorAll('main > section[id]').forEach((s) => io.observe(s));
  }

  /* ---------- motion preference ---------- */
  function setMotion(on) {
    state.motion = on;
    document.documentElement.classList.toggle('no-motion', !on);
    const b = document.getElementById('motion-toggle');
    b.setAttribute('aria-pressed', String(!on));
    b.querySelector('span').textContent = on ? 'Motion on' : 'Motion off';
    if (!on) { Object.values(reels).forEach((r) => r.finish()); scrollCue(true); gsap.set('.station-break i', { scaleX: 1 }); }
  }

  function stationBreaks() {
    const io = new IntersectionObserver((ents) => ents.forEach((en) => {
      if (!en.isIntersecting) return;
      io.unobserve(en.target);
      const bars = en.target.querySelectorAll('i');
      if (!state.motion) { gsap.set(bars, { scaleX: 1 }); return; }
      gsap.fromTo(bars, { scaleX: 0 }, { scaleX: 1, duration: 0.9, ease: 'power3.out', stagger: 0.14 });
    }), { threshold: 0.6 });
    document.querySelectorAll('.station-break').forEach((s) => { gsap.set(s.querySelectorAll('i'), { scaleX: 0 }); io.observe(s); });
  }

  /* ---------- boot ---------- */
  async function boot() {
    await fonts();
    setMotion(state.motion);

    const heroSvg = document.getElementById('hero-svg');
    const heroScreen = document.getElementById('hero-screen');
    const makeHero = () => new Reel('hero', AFTER.buildHero(heroSvg), { screen: heroScreen, onReplay: () => scrollCue(false), onComplete: () => scrollCue(true) });
    let hero = makeHero();
    let portrait = heroSvg.clientWidth / heroSvg.clientHeight < 0.9;
    hero.play();
    // slow GPU/CPU: keep motion smooth by blooming each scene once it holds still
    AFTER.probeQuality(() => Object.values(reels).forEach((r) => { if (r.tl.isActive()) r.bloom(false); }));
    if (!state.motion) scrollCue(true);
    document.getElementById('skip-intro').addEventListener('click', () => { hero.finish(); scrollCue(true); document.getElementById('skip-intro').blur(); });

    const scenes = [
      ['chaos', 'chaos-svg', AFTER.buildChaos],
      ['praxis', 'praxis-svg', AFTER.buildPraxis],
      ['topo', 'topo-svg', AFTER.buildTopo],
      ['pneumo', 'pneumo-svg', AFTER.buildPneumo],
      ['end', 'end-svg', AFTER.buildEnd]
    ];
    scenes.forEach(([name, id, fn]) => {
      const svg = document.getElementById(id);
      try { const r = new Reel(name, fn(svg), { screen: svg.closest('.screen') }); r.portrait = AFTER.isPortrait(svg); } catch (err) { console.error('scene ' + name, err); }
    });
    const io = new IntersectionObserver((ents) => ents.forEach((en) => {
      // ignore intersections caused by the CRT collapse squeezing every screen into view
      if (!en.isIntersecting || AFTER.tuning || main.style.transform) return;
      const r = reels[en.target.dataset.reelFor];
      if (r && !r.played) r.play();
    }), { threshold: 0.45 });
    scenes.forEach(([name, id]) => { const s = document.getElementById(id).closest('.screen'); s.dataset.reelFor = name; io.observe(s); });

    AFTER.chaosLab();
    AFTER.praxisExplorer();
    AFTER.topoLab();
    AFTER.fedButton();
    AFTER.sound.wire();
    AFTER.tune = tune;
    AFTER.tv.init();
    AFTER.extras.init();
    AFTER.ident.init();
    AFTER.arcade.init();
    wireNav();
    stationBreaks();
    AFTER.watchScreens();

    document.getElementById('motion-toggle').addEventListener('click', () => setMotion(!state.motion));
    reducedQuery.addEventListener('change', (e) => setMotion(!e.matches));
    document.getElementById('power-on').addEventListener('click', () => {
      tune('top', '#ffb01f', 'Palthepu Sai Sahith');
      setTimeout(() => { reels.hero.replay(); }, state.motion ? 1300 : 0);
    });

    // re-compose the opening if the screen changes between landscape and portrait
    let rt;
    addEventListener('resize', () => {
      clearTimeout(rt);
      rt = setTimeout(() => {
        // chapter idents that have a portrait composition re-compose at the same moment of their sequence
        scenes.forEach(([name, id, fn]) => {
          const svg = document.getElementById(id), r = reels[name];
          if (!r || !['chaos', 'topo', 'end'].includes(name)) return;
          const now = AFTER.isPortrait(svg);
          if (now === r.portrait) return;
          const prog = r.tl.progress(), playing = r.tl.isActive(), played = r.played;
          r.tl.kill();
          const nr = new Reel(name, fn(svg), { screen: svg.closest('.screen') });
          nr.portrait = now; nr.played = played; nr.tl.progress(prog);
          if (playing) nr.tl.play();
        });
        const p = heroSvg.clientWidth / heroSvg.clientHeight < 0.9;
        if (p === portrait) return;
        portrait = p;
        const prog = reels.hero.tl.progress();
        reels.hero.tl.kill();
        hero = makeHero();
        hero.played = true;
        hero.tl.progress(prog);
        if (prog < 1 && state.motion) hero.tl.play();
      }, 250);
    });
    window.__AFTER = AFTER;
    document.documentElement.dataset.ready = '1';
  }

  boot();
})();
