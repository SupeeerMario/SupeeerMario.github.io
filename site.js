const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

// Background: drifting wireframe shapes. Every few seconds one "crashes"
// (turns red and shakes), then recovers green and goes back to grey.
const canvas = document.getElementById('bg');
if (canvas) {
  const ctx = canvas.getContext('2d');
  let w, h;
  const resize = () => {
    w = canvas.width = innerWidth * devicePixelRatio;
    h = canvas.height = innerHeight * devicePixelRatio;
  };
  resize();
  addEventListener('resize', resize);

  const shapes = Array.from({ length: innerWidth < 700 ? 10 : 22 }, () => ({
    x: Math.random(), y: Math.random(),
    r: 12 + Math.random() * 40,
    sides: 3 + Math.floor(Math.random() * 4),
    a: Math.random() * Math.PI,
    spin: (Math.random() - 0.5) * 0.004,
    vy: -0.00004 - Math.random() * 0.00008,
    state: 'ok', t: 0,
  }));

  const colors = { ok: 'rgba(233,233,233,.09)', crash: 'rgba(255,95,86,.9)', recover: 'rgba(63,185,80,.8)' };

  const draw = (s) => {
    const shake = s.state === 'crash' ? (Math.random() - 0.5) * 6 : 0;
    const cx = s.x * w + shake, cy = s.y * h + shake, r = s.r * devicePixelRatio;
    ctx.beginPath();
    for (let i = 0; i <= s.sides; i++) {
      const ang = s.a + (i / s.sides) * Math.PI * 2;
      ctx[i ? 'lineTo' : 'moveTo'](cx + Math.cos(ang) * r, cy + Math.sin(ang) * r);
    }
    ctx.strokeStyle = colors[s.state];
    ctx.lineWidth = devicePixelRatio;
    ctx.stroke();
  };

  const frame = (now) => {
    ctx.clearRect(0, 0, w, h);
    for (const s of shapes) {
      s.a += s.spin;
      s.y += s.vy;
      if (s.y < -0.1) { s.y = 1.1; s.x = Math.random(); }
      if (s.state !== 'ok' && now > s.t) {
        s.state = s.state === 'crash' ? 'recover' : 'ok';
        s.t = now + 900;
      }
      draw(s);
    }
    requestAnimationFrame(frame);
  };

  if (reduced) {
    shapes.forEach(draw);
  } else {
    setInterval(() => {
      const s = shapes[Math.floor(Math.random() * shapes.length)];
      if (s.state === 'ok') { s.state = 'crash'; s.t = performance.now() + 700; }
    }, 2200);
    requestAnimationFrame(frame);
  }
}

// Glitch: a few characters briefly scramble, then restore.
if (!reduced) {
  const junk = '!@#$%&*<>/\\|01';
  document.querySelectorAll('.glitch').forEach((el) => {
    // Group letters per word so the name only wraps between words.
    const chars = [];
    const words = el.textContent.split(' ').map((w) => {
      const word = document.createElement('span');
      word.className = 'word';
      for (const c of w) {
        const span = document.createElement('span');
        span.className = 'ch';
        span.textContent = c;
        span.dataset.c = c;
        chars.push(span);
        word.append(span);
      }
      return word;
    });
    el.replaceChildren();
    words.forEach((word, i) => el.append(...(i ? [' ', word] : [word])));
    const hit = () => {
      const span = chars[Math.floor(Math.random() * chars.length)];
      if (span.dataset.c.trim()) {
        span.classList.add('hit');
        span.textContent = junk[Math.floor(Math.random() * junk.length)];
        setTimeout(() => { span.textContent = span.dataset.c; span.classList.remove('hit'); }, 160);
      }
      setTimeout(hit, 900 + Math.random() * 1600);
    };
    hit();
  });
}

// Billing demo: drop the unique index and watch the double charges appear.
const toggle = document.getElementById('toggle');
if (toggle) {
  let on = true;
  const idx = document.getElementById('idx');
  const charges = document.getElementById('charges');
  const verdict = document.getElementById('verdict');
  toggle.addEventListener('click', () => {
    on = !on;
    idx.textContent = on ? 'on' : 'off';
    idx.className = on ? 'pass' : 'fail';
    charges.textContent = on ? '1' : '8';
    verdict.textContent = on ? 'PASS' : 'FAIL';
    verdict.className = 'tag ' + (on ? 'pass' : 'fail');
    toggle.textContent = on ? 'drop the index' : 'restore the index';
  });
}
