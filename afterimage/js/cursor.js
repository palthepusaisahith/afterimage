/* THE AFTERIMAGE — phosphor cursor.
   A beam dot that leaves a fading persistence trail (like a CRT's phosphor),
   tinted by the chapter under it. Over anything interactive a tuning reticle
   locks on with a label; a click sends out signal rings like the hero's tower.
   Fine pointers only; off under reduced motion. */
(function () {
  if (!matchMedia('(pointer: fine)').matches) return;
  const { state, reducedQuery } = AFTER;

  const cv = document.createElement('canvas');
  cv.className = 'cursor-trail'; cv.setAttribute('aria-hidden', 'true');
  const dot = document.createElement('div'); dot.className = 'cursor-dot'; dot.setAttribute('aria-hidden', 'true');
  const ret = document.createElement('div'); ret.className = 'cursor-ret'; ret.setAttribute('aria-hidden', 'true');
  ret.innerHTML = '<i></i><i></i><i></i><i></i><span></span>';
  const label = ret.querySelector('span');
  document.body.append(cv, ret, dot);
  const ctx = cv.getContext('2d');
  let W = 0, H = 0, dpr = 1;
  const size = () => { dpr = Math.min(1.5, devicePixelRatio || 1); W = innerWidth; H = innerHeight; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
  size(); addEventListener('resize', size);

  let x = W / 2, y = H / 2, px = x, py = y, rx = x, ry = y, rw = 34, rh = 34, tw = 34, th = 34;
  let color = '#ffb01f', target = null, seen = false, running = false, idle = 0;
  const rings = [];

  const enabled = () => state.motion && !reducedQuery.matches;
  function setOn(on) { document.documentElement.classList.toggle('afterimage-cursor', on); if (!on) ctx.clearRect(0, 0, W, H); }

  function hotLabel(el) {
    if (el.dataset.cursor) return el.dataset.cursor;
    if (el.matches('[data-tune]')) return 'TUNE IN';
    if (el.matches('a[target="_blank"]')) return 'OPEN ↗';
    if (el.matches('a[href^="mailto:"]')) return 'WRITE';
    if (el.matches('a')) return 'GO';
    if (el.matches('input[type="range"]')) return 'SCRUB';
    if (el.matches('select')) return 'CHOOSE';
    if (el.matches('.ev')) return 'READ';
    return 'PRESS';
  }
  const HOT = 'a, button, select, label, input, [role="button"], .ev';

  let lastTint = 0;
  addEventListener('pointermove', (e) => {
    x = e.clientX; y = e.clientY;
    if (!seen) { px = rx = x; py = ry = y; seen = true; document.documentElement.classList.add('cursor-seen'); }
    idle = 0;
    const now = performance.now();
    if (now - lastTint > 160) {
      lastTint = now;
      const el = document.elementFromPoint(x, y);
      if (el) {
        const c = getComputedStyle(el).getPropertyValue('--world').trim();
        if (c && c.startsWith('#')) color = c;
        const hot = el.closest(HOT);
        if (hot !== target) {
          target = hot;
          ret.classList.toggle('hot', !!hot);
          label.textContent = hot ? hotLabel(hot) : '';
        }
      }
    }
    if (!running && enabled()) { running = true; requestAnimationFrame(tick); }
  }, { passive: true });
  addEventListener('pointerdown', () => { if (enabled()) rings.push({ x, y, t: 0 }); ret.classList.add('down'); });
  addEventListener('pointerup', () => ret.classList.remove('down'));
  document.addEventListener('pointerleave', () => { dot.style.opacity = ret.style.opacity = 0; });
  document.addEventListener('pointerenter', () => { dot.style.opacity = ret.style.opacity = ''; });

  function tick() {
    if (!enabled()) { running = false; setOn(false); return; }
    setOn(true);
    // phosphor decay: the old picture fades rather than vanishing
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = 'rgba(0,0,0,0.14)';
    ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';
    const dx = x - px, dy = y - py, sp = Math.hypot(dx, dy);
    if (sp > 0.5) {
      ctx.lineCap = 'round';
      ctx.strokeStyle = color; ctx.shadowColor = color; ctx.shadowBlur = 14;
      ctx.lineWidth = Math.min(5, 1.5 + sp * 0.06);
      ctx.globalAlpha = 0.55;
      ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(x, y); ctx.stroke();
      // a hot cream core, like the beam itself
      ctx.strokeStyle = '#fff1cf'; ctx.shadowBlur = 0; ctx.lineWidth = 1; ctx.globalAlpha = 0.6;
      ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(x, y); ctx.stroke();
      ctx.globalAlpha = 1;
    }
    for (let i = rings.length - 1; i >= 0; i--) {
      const r = rings[i]; r.t += 1 / 40;
      for (let k = 0; k < 3; k++) {
        const tt = r.t - k * 0.12; if (tt <= 0 || tt >= 1) continue;
        ctx.strokeStyle = color; ctx.shadowColor = color; ctx.shadowBlur = 10; ctx.lineWidth = 2;
        ctx.globalAlpha = (1 - tt) * 0.8;
        ctx.beginPath(); ctx.arc(r.x, r.y, 6 + tt * 46, -Math.PI * 0.32, Math.PI * 0.32); ctx.stroke();
        ctx.beginPath(); ctx.arc(r.x, r.y, 6 + tt * 46, Math.PI * 0.68, Math.PI * 1.32); ctx.stroke();
      }
      ctx.globalAlpha = 1;
      if (r.t > 1.3) rings.splice(i, 1);
    }
    px = x; py = y;

    // reticle: lags behind, then locks onto interactive targets
    if (target && document.contains(target)) {
      const b = target.getBoundingClientRect();
      rx += (b.left + b.width / 2 - rx) * 0.25; ry += (b.top + b.height / 2 - ry) * 0.25;
      tw = Math.min(b.width + 14, 420); th = Math.min(b.height + 12, 160);
    } else {
      rx += (x - rx) * 0.2; ry += (y - ry) * 0.2; tw = 30; th = 30;
    }
    rw += (tw - rw) * 0.25; rh += (th - rh) * 0.25;
    ret.style.transform = `translate(${rx - rw / 2}px, ${ry - rh / 2}px)`;
    ret.style.width = rw + 'px'; ret.style.height = rh + 'px';
    ret.style.setProperty('--c', color);
    dot.style.transform = `translate(${x - 4}px, ${y - 4}px)`;
    dot.style.setProperty('--c', color);

    idle++;
    // keep drawing until the trail and rings have fully faded, then sleep
    if (idle < 60 || rings.length || Math.abs(tw - rw) > 0.5) requestAnimationFrame(tick);
    else running = false;
  }
  setOn(enabled());
})();
