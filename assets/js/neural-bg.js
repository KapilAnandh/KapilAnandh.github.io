/* Neural network background — lightweight Canvas 2D.
   Nodes drift, connect when close, and lean toward the cursor. */
(function () {
  const canvas = document.getElementById('neural');
  if (!canvas) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ctx = canvas.getContext('2d');
  let w, h, nodes = [], raf = null;
  const mouse = { x: -9999, y: -9999 };
  const DPR = Math.min(window.devicePixelRatio || 1, 2);

  function isMobile() { return window.innerWidth < 760; }

  function resize() {
    w = canvas.width = Math.floor(window.innerWidth * DPR);
    h = canvas.height = Math.floor(window.innerHeight * DPR);
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    buildNodes();
  }

  function buildNodes() {
    const density = isMobile() ? 34000 : 20000;
    const count = Math.min(120, Math.floor((window.innerWidth * window.innerHeight) / density));
    nodes = [];
    for (let i = 0; i < count; i++) {
      nodes.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.28 * DPR,
        vy: (Math.random() - 0.5) * 0.28 * DPR,
        r: (Math.random() * 1.6 + 0.8) * DPR
      });
    }
  }

  function tick() {
    ctx.clearRect(0, 0, w, h);
    const linkDist = (isMobile() ? 110 : 140) * DPR;
    const mx = mouse.x * DPR, my = mouse.y * DPR;

    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      n.x += n.vx; n.y += n.vy;
      if (n.x < 0 || n.x > w) n.vx *= -1;
      if (n.y < 0 || n.y > h) n.vy *= -1;

      // gentle attraction toward cursor
      const dxm = mx - n.x, dym = my - n.y;
      const dm = Math.hypot(dxm, dym);
      if (dm < 180 * DPR && dm > 1) {
        n.x += (dxm / dm) * 0.5 * DPR;
        n.y += (dym / dm) * 0.5 * DPR;
      }

      // node glow
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(139,150,255,0.65)';
      ctx.fill();

      // links
      for (let j = i + 1; j < nodes.length; j++) {
        const m = nodes[j];
        const dx = n.x - m.x, dy = n.y - m.y;
        const d = Math.hypot(dx, dy);
        if (d < linkDist) {
          const a = (1 - d / linkDist) * 0.35;
          const grad = ctx.createLinearGradient(n.x, n.y, m.x, m.y);
          grad.addColorStop(0, `rgba(139,92,246,${a})`);
          grad.addColorStop(1, `rgba(34,211,238,${a})`);
          ctx.strokeStyle = grad;
          ctx.lineWidth = 1 * DPR;
          ctx.beginPath();
          ctx.moveTo(n.x, n.y);
          ctx.lineTo(m.x, m.y);
          ctx.stroke();
        }
      }
    }
    raf = requestAnimationFrame(tick);
  }

  window.addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
  window.addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999; });

  let rt;
  window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(resize, 200); });

  // pause animation when tab hidden (saves battery)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { cancelAnimationFrame(raf); raf = null; }
    else if (!raf && !reduced) { raf = requestAnimationFrame(tick); }
  });

  resize();
  if (reduced) {
    // draw a single static frame
    tick();
    cancelAnimationFrame(raf);
    raf = null;
  } else {
    raf = requestAnimationFrame(tick);
  }
})();
