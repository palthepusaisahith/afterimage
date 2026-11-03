/* THE AFTERIMAGE — arcade cabinet in the ChaosAgent chapter.
   "Lost Response": replies fall out of the broken wire. Catch them before the
   agent times out and retries. With idempotency keys on, a retry is harmless;
   with them off, each retry is a second charge. Conceptual, 30-second rounds. */
(function () {
  const W = 960, H = 380, FLOOR = 340, ROUND = 30;
  let cv, x, idem, startBtn;
  let st = 'attract', t0 = 0, last = 0, raf = 0;
  let px = W / 2, keys = { l: false, r: false };
  let drops = [], pops = [], caught = 0, retries = 0, dups = 0, spawnIn = 0;
  const C = { cream: '#fff1cf', amber: '#ffb01f', red: '#ff3a1c', cyan: '#52e4ff', teal: '#1fe3b2', dim: '#3a2a20' };

  function glow(c, b) { x.shadowColor = c; x.shadowBlur = b; }
  function text(s, X, Y, size, c, align = 'center', font = 'Anton') {
    x.font = `${size}px ${font}`; x.textAlign = align; x.fillStyle = c; glow(c, 12); x.fillText(s, X, Y); glow(c, 0);
  }

  function scenery() {
    x.fillStyle = '#040203'; x.fillRect(0, 0, W, H);
    // the wire, broken in the middle
    x.lineWidth = 3; x.strokeStyle = C.cyan; glow(C.cyan, 10);
    x.beginPath(); x.moveTo(0, 54); x.quadraticCurveTo(200, 74, 400, 56); x.stroke();
    x.beginPath(); x.moveTo(560, 56); x.quadraticCurveTo(760, 74, W, 54); x.stroke();
    x.strokeStyle = C.red; glow(C.red, 10);
    x.beginPath(); x.moveTo(400, 56); x.lineTo(420, 86); x.moveTo(560, 56); x.lineTo(540, 86); x.stroke();
    glow(C.red, 0);
    // floor bands
    [[FLOOR + 14, C.red], [FLOOR + 22, C.amber], [FLOOR + 30, '#4f69ff']].forEach(([y, c]) => { x.fillStyle = c; x.fillRect(0, y, W, 4); });
    x.fillStyle = '#ffffff22'; x.fillRect(0, FLOOR + 2, W, 1);
  }
  function hud(time) {
    x.font = '600 15px "IBM Plex Mono"'; x.textAlign = 'left'; x.fillStyle = C.cream;
    x.fillText(`TIME ${String(Math.max(0, Math.ceil(time))).padStart(2, '0')}`, 16, 26);
    x.fillStyle = C.teal; x.fillText(`CAUGHT ${caught}`, 140, 26);
    x.fillStyle = C.amber; x.fillText(`RETRIES ${retries}`, 280, 26);
    x.fillStyle = dups ? C.red : C.cream; x.fillText(`DUPLICATE CHARGES ${dups}`, 430, 26);
    x.textAlign = 'right'; x.fillStyle = idem.checked ? C.teal : C.red;
    x.fillText(idem.checked ? 'KEYS ON' : 'KEYS OFF', W - 16, 26);
  }
  function raster() { x.fillStyle = 'rgba(0,0,0,.3)'; for (let i = 0; i < W; i += 3) x.fillRect(i, 0, 1, H); }
  function paddle() {
    x.strokeStyle = C.cream; x.lineWidth = 3; glow(C.amber, 14);
    x.beginPath(); x.moveTo(px - 46, FLOOR - 18); x.quadraticCurveTo(px, FLOOR + 6, px + 46, FLOOR - 18); x.stroke();
    x.beginPath(); x.moveTo(px, FLOOR - 6); x.lineTo(px, FLOOR + 10); x.stroke();
    glow(C.amber, 0);
  }

  function attract(now) {
    scenery();
    text('LOST RESPONSE', W / 2, 180, 72, C.cream);
    x.font = '500 16px "IBM Plex Mono"'; x.textAlign = 'center'; x.fillStyle = C.amber;
    x.fillText('CATCH THE REPLIES BEFORE THE AGENT RETRIES', W / 2, 220);
    if (Math.floor(now / 600) % 2) text('▶ INSERT COIN', W / 2, 280, 28, C.teal, 'center', '"Dela Gothic One"');
    raster();
  }

  function over() {
    scenery(); hud(0);
    text('GAME OVER', W / 2, 150, 64, C.cream);
    const ok = dups === 0;
    text(ok ? 'NO DUPLICATE EFFECTS' : `${dups} DUPLICATE CHARGE${dups === 1 ? '' : 'S'}`, W / 2, 210, 34, ok ? C.teal : C.red, 'center', '"Dela Gothic One"');
    x.font = '500 15px "IBM Plex Mono"'; x.fillStyle = C.cream; x.textAlign = 'center';
    x.fillText(`CAUGHT ${caught} · MISSED ${retries} · ${ok ? (retries ? 'every retry was recognised by its key' : 'a perfect run') : 'turn on idempotency keys and try again'}`, W / 2, 250);
    x.fillStyle = C.amber; x.fillText('PRESS ▶ INSERT COIN TO PLAY AGAIN', W / 2, 300);
    raster();
  }

  function frame(now) {
    if (st !== 'play') return;
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    const left = ROUND - (now - t0) / 1000;
    if (left <= 0) { st = 'over'; AFTER.gameActive = false; startBtn.textContent = '▶ Insert coin'; over(); return; }
    // input
    if (keys.l) px -= 620 * dt; if (keys.r) px += 620 * dt;
    px = Math.max(50, Math.min(W - 50, px));
    // spawn from the break, faster as the round goes on
    spawnIn -= dt;
    const pace = 1 - left / ROUND;
    if (spawnIn <= 0) {
      drops.push({ x: 430 + Math.random() * 100, y: 80, vx: (Math.random() - 0.5) * (160 + 220 * pace), vy: 40 + Math.random() * 40 });
      spawnIn = 0.95 - 0.55 * pace + Math.random() * 0.3;
    }
    for (const d of drops) {
      d.vy += (260 + 200 * pace) * dt; d.x += d.vx * dt; d.y += d.vy * dt;
      if (d.x < 12 || d.x > W - 12) d.vx *= -1;
      if (!d.done && d.y > FLOOR - 22 && d.y < FLOOR && Math.abs(d.x - px) < 50) { d.done = 'caught'; caught++; pops.push({ x: d.x, y: FLOOR - 30, s: 'RECOVERED', c: C.teal, t: 0 }); AFTER.sound && AFTER.sound.sfx && AFTER.sound.sfx('clunk'); }
      if (!d.done && d.y > FLOOR + 10) {
        d.done = 'lost'; retries++;
        if (idem.checked) pops.push({ x: d.x, y: FLOOR - 20, s: 'RETRY · KEY MATCHED', c: C.amber, t: 0 });
        else { dups++; pops.push({ x: d.x, y: FLOOR - 20, s: 'DUPLICATE €120', c: C.red, t: 0 }); AFTER.sound && AFTER.sound.sfx && AFTER.sound.sfx('static'); }
      }
    }
    drops = drops.filter((d) => !d.done);
    scenery(); hud(left); paddle();
    for (const d of drops) {
      glow(C.cream, 14); x.fillStyle = C.cream; x.fillRect(d.x - 16, d.y - 9, 32, 18);
      glow(C.cream, 0); x.fillStyle = '#040203'; x.font = '600 11px "IBM Plex Mono"'; x.textAlign = 'center'; x.fillText('200', d.x, d.y + 4);
    }
    for (const p of pops) { p.t += dt; x.globalAlpha = Math.max(0, 1 - p.t / 1.1); text(p.s, p.x, p.y - p.t * 40, 15, p.c, 'center', '"IBM Plex Mono"'); }
    x.globalAlpha = 1;
    pops = pops.filter((p) => p.t < 1.1);
    raster();
    raf = requestAnimationFrame(frame);
  }

  function start() {
    caught = retries = dups = 0; drops = []; pops = []; spawnIn = 0.4; px = W / 2;
    st = 'play'; AFTER.gameActive = true; t0 = last = performance.now();
    startBtn.textContent = '■ Stop';
    cv.focus({ preventScroll: true });
    cancelAnimationFrame(raf); raf = requestAnimationFrame(frame);
  }
  function stop() { st = 'over'; AFTER.gameActive = false; cancelAnimationFrame(raf); startBtn.textContent = '▶ Insert coin'; over(); }

  function init() {
    cv = document.getElementById('arcade-canvas');
    if (!cv) return;
    x = cv.getContext('2d');
    idem = document.getElementById('arcade-idem');
    startBtn = document.getElementById('arcade-start');
    startBtn.addEventListener('click', () => (st === 'play' ? stop() : start()));
    cv.addEventListener('pointermove', (e) => { const r = cv.getBoundingClientRect(); px = (e.clientX - r.left) * (W / r.width); });
    cv.addEventListener('keydown', (e) => {
      if (st !== 'play') { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); start(); } return; }
      if (e.key === 'ArrowLeft') { keys.l = true; e.preventDefault(); e.stopPropagation(); }
      if (e.key === 'ArrowRight') { keys.r = true; e.preventDefault(); e.stopPropagation(); }
      if (e.key === 'Escape') stop();
    });
    cv.addEventListener('keyup', (e) => { if (e.key === 'ArrowLeft') keys.l = false; if (e.key === 'ArrowRight') keys.r = false; });
    document.addEventListener('visibilitychange', () => { if (document.hidden && st === 'play') stop(); });
    // attract mode only animates while the cabinet is on screen
    let vis = false, araf = 0;
    const loop = (now) => { if (st === 'attract' && vis) { attract(now); araf = requestAnimationFrame(loop); } };
    new IntersectionObserver(([en]) => { vis = en.isIntersecting; if (vis && st === 'attract') { cancelAnimationFrame(araf); araf = requestAnimationFrame(loop); } }, { threshold: 0.2 }).observe(cv);
    attract(0);
  }

  AFTER.arcade = { init };
})();
