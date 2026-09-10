/* ============================================================
   Vineeth Dhagey — portfolio behaviour
   No dependencies. One rAF loop for scroll, one for the canvas.
   ============================================================ */
(() => {
  'use strict';

  const doc = document;
  const root = doc.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(pointer: fine) and (hover: hover)');
  const prefersStill = () => reduceMotion.matches;

  const $  = (sel, ctx = doc) => ctx.querySelector(sel);
  const $$ = (sel, ctx = doc) => Array.from(ctx.querySelectorAll(sel));
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

  /* ---------- entrance ---------- */
  const boot = () => doc.body.classList.add('is-ready');
  if (doc.readyState !== 'loading') boot();
  else doc.addEventListener('DOMContentLoaded', boot);

  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- scroll driver (single listener, rAF gated) ---------- */
  const scrollTasks = [];
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY || window.pageYOffset;
      scrollTasks.forEach((fn) => fn(y));
      ticking = false;
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });

  /* ---------- nav state ---------- */
  const nav = $('#nav');
  const navMenu = $('#navMenu');
  const navToggle = $('#navToggle');
  const navLinks = $$('.nav__link');

  scrollTasks.push((y) => {
    if (nav) nav.classList.toggle('is-stuck', y > 24);
  });

  const closeMenu = () => {
    if (!navMenu || !navToggle) return;
    navMenu.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Open menu');
    doc.body.style.overflow = '';
  };

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      const open = navMenu.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(open));
      navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      doc.body.style.overflow = open ? 'hidden' : '';
      if (open) {
        const first = navMenu.querySelector('a');
        if (first) first.focus({ preventScroll: true });
      }
    });

    navMenu.addEventListener('click', (e) => {
      if (e.target.closest('a')) closeMenu();
    });

    doc.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navMenu.classList.contains('is-open')) {
        closeMenu();
        navToggle.focus({ preventScroll: true });
      }
    });

    // keep focus inside the open sheet
    navMenu.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab' || !navMenu.classList.contains('is-open')) return;
      const items = $$('a', navMenu);
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && doc.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && doc.activeElement === last) { e.preventDefault(); navToggle.focus(); }
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 860) closeMenu();
    });
  }

  /* active section indicator */
  const sections = navLinks
    .map((link) => doc.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  if (sections.length && 'IntersectionObserver' in window) {
    const setActive = (id) => {
      navLinks.forEach((l) => {
        const on = l.getAttribute('href') === `#${id}`;
        l.classList.toggle('is-active', on);
        if (on) l.setAttribute('aria-current', 'true');
        else l.removeAttribute('aria-current');
      });
    };
    const spy = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setActive(visible.target.id);
    }, { rootMargin: '-45% 0px -50% 0px', threshold: [0, 0.25, 0.6] });
    sections.forEach((s) => spy.observe(s));
  }

  /* ---------- hero fade-out / impact fade-in on scroll ---------- */
  const heroSection = $('.hero');
  const heroShell = $('.hero__shell');
  const heroScrollCue = $('.hero__scroll');
  if (heroSection && heroShell && !prefersStill()) {
    scrollTasks.push((y) => {
      const h = heroSection.offsetHeight || 1;
      const p = clamp(y / (h * 0.72), 0, 1);
      const fade = 1 - p;
      heroShell.style.opacity = String(fade);
      heroShell.style.transform = `translateY(${p * -36}px)`;
      if (heroScrollCue) heroScrollCue.style.opacity = String(Math.max(0, 1 - p * 2.2));
    });
  }

  /* ---------- back to top ---------- */
  const toTop = $('#toTop');
  if (toTop) {
    scrollTasks.push((y) => toTop.classList.toggle('is-on', y > window.innerHeight * 0.8));
    toTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: prefersStill() ? 'auto' : 'smooth' });
    });
  }

  /* ---------- reveals ---------- */
  const revealEls = $$('.reveal');
  if (!('IntersectionObserver' in window) || prefersStill()) {
    revealEls.forEach((el) => el.classList.add('is-in'));
  } else {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const group = el.parentElement ? Array.from(el.parentElement.children).filter((c) => c.classList.contains('reveal')) : [el];
        const i = Math.max(0, group.indexOf(el));
        el.style.setProperty('--d', `${Math.min(i, 6) * 70}ms`);
        el.classList.add('is-in');
        obs.unobserve(el);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });
    revealEls.forEach((el) => io.observe(el));
  }

  /* ---------- counters ---------- */
  const counters = $$('[data-count]');
  const runCount = (el) => {
    const target = parseFloat(el.dataset.count);
    if (Number.isNaN(target)) return;
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    const suffix = el.dataset.suffix || '';
    if (prefersStill()) { el.textContent = target.toFixed(decimals) + suffix; return; }
    const dur = 1200;
    const start = performance.now();
    const step = (now) => {
      const p = clamp((now - start) / dur, 0, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * eased).toFixed(decimals) + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  if (counters.length && 'IntersectionObserver' in window) {
    const cio = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) runCount(e.target);
        else e.target.textContent = (0).toFixed(parseInt(e.target.dataset.decimals || '0', 10)) + (e.target.dataset.suffix || '');
      });
    }, { threshold: 0.6 });
    counters.forEach((c) => cio.observe(c));
  }

  /* ---------- pointer-follow glow ---------- */
  $$('[data-glow]').forEach((el) => {
    const surface = el.matches('a') ? el : el.querySelector('a') || el;
    el.addEventListener('pointermove', (e) => {
      if (e.pointerType === 'touch') return;
      const r = surface.getBoundingClientRect();
      surface.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`);
      surface.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`);
    }, { passive: true });
  });

  /* ---------- magnetic buttons ---------- */
  if (finePointer.matches && !prefersStill()) {
    $$('.magnetic').forEach((el) => {
      const strength = el.classList.contains('iconlink') ? 0.34 : 0.22;
      const reset = () => { el.style.transform = ''; };
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        el.style.transform = `translate(${dx * strength}px, ${dy * strength}px)`;
      }, { passive: true });
      el.addEventListener('pointerleave', reset);
      el.addEventListener('blur', reset);
    });
  }

  /* ---------- custom cursor ---------- */
  const cursor = $('#cursor');
  if (cursor && finePointer.matches && !prefersStill()) {
    const dot = $('.cursor__dot', cursor);
    const ring = $('.cursor__ring', cursor);
    const label = $('.cursor__label', cursor);
    let x = window.innerWidth / 2, y = window.innerHeight / 2;
    let rx = x, ry = y;
    let active = false;

    doc.body.classList.add('has-cursor');

    window.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      x = e.clientX; y = e.clientY;
      if (!active) { active = true; rx = x; ry = y; cursor.style.opacity = '1'; }
      dot.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;

      const hot = e.target.closest('a, button, [data-glow], .chips li, .stack__group li');
      const tagged = e.target.closest('[data-cursor]');
      cursor.classList.toggle('is-hot', Boolean(hot) && !tagged);
      cursor.classList.toggle('is-label', Boolean(tagged));
      if (tagged) label.textContent = tagged.dataset.cursor;
    }, { passive: true });

    doc.addEventListener('pointerleave', () => { cursor.style.opacity = '0'; });
    doc.addEventListener('pointerenter', () => { if (active) cursor.style.opacity = '1'; });

    (function follow() {
      rx += (x - rx) * 0.16;
      ry += (y - ry) * 0.16;
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
      requestAnimationFrame(follow);
    })();
  }

  /* ---------- hero: the whole line types itself in ---------- */
  const heroName = $('#heroName');
  const greetEl = $('#typedGreeting');
  if (heroName) {
    const lines = $$('.hero__linetext', heroName);
    const chars = [];

    const split = () => {
      lines.forEach((line) => {
        const text = line.textContent;
        line.textContent = '';
        for (const char of text) {
          const span = doc.createElement('span');
          span.className = 'ch';
          span.textContent = char;
          line.appendChild(span);
          chars.push(span);
        }
      });
    };

    if (prefersStill()) {
      if (greetEl) greetEl.textContent = "Hi, I'm";
    } else {
      split();
      heroName.classList.add('is-armed');

      const caret = doc.createElement('span');
      caret.className = 'caret';

      const typeName = () => {
        let i = 0;
        const step = () => {
          if (i >= chars.length) {
            caret.remove();
            heroName.classList.remove('is-armed');
            return;
          }
          const ch = chars[i++];
          ch.classList.add('is-on');
          ch.after(caret);
          setTimeout(step, ch.textContent === ' ' ? 40 : 62);
        };
        step();
      };

      const phrase = "Hi, I'm";
      if (greetEl) {
        greetEl.textContent = '';
        greetEl.after(caret);
        let i = 0;
        const type = () => {
          greetEl.textContent = phrase.slice(0, i);
          if (i++ <= phrase.length) setTimeout(type, 72);
          else setTimeout(typeName, 260);
        };
        setTimeout(type, 320);
      } else {
        typeName();
      }
    }
  }

  /* ---------- ambient signal field ----------
     A full-page, fixed live-background: a glowing particle network with
     drifting nodes, twinkle, and travelling "data pulses" along links.
     Pauses when tab is hidden. Respects reduced motion. */
  const canvas = $('#signalField');
  if (canvas && canvas.getContext) {
    const ctx = canvas.getContext('2d', { alpha: true });
    let w = 0, h = 0, dpr = 1;
    let pointer = { x: -9999, y: -9999 };
    let running = false, frame = 0, t = 0;
    let nodes = [];
    let pulses = [];

    const LINK_DIST = 165;
    const DENSITY = 13000; // px² per node
    const HUES = ['150, 162, 255', '180, 150, 255', '120, 200, 255'];

    const size = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = Math.max(1, Math.round(rect.width));
      h = Math.max(1, Math.round(rect.height));
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.max(30, Math.min(95, Math.round((w * h) / DENSITY)));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.16,
        vy: (Math.random() - 0.5) * 0.16,
        r: Math.random() * 1.8 + 1.0,
        hue: HUES[(Math.random() * HUES.length) | 0],
        phase: Math.random() * Math.PI * 2,
      }));
      pulses = [];
    };

    const maybeSpawnPulse = (links) => {
      if (pulses.length > 5 || !links.length || Math.random() > 0.02) return;
      const link = links[(Math.random() * links.length) | 0];
      pulses.push({ a: link.a, b: link.b, p: 0, speed: 0.006 + Math.random() * 0.006 });
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      t += 0.012;

      for (const n of nodes) {
        n.x += n.vx; n.y += n.vy;
        if (n.x < -20) n.x = w + 20; else if (n.x > w + 20) n.x = -20;
        if (n.y < -20) n.y = h + 20; else if (n.y > h + 20) n.y = -20;

        const dx = n.x - pointer.x, dy = n.y - pointer.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 42000) {
          const pull = (1 - d2 / 42000) * 0.8;
          n.x -= dx * pull * 0.032;
          n.y -= dy * pull * 0.032;
        }
      }

      // gentle ambient cohesion: nearby nodes drift toward one another,
      // then ease apart once close — a slow "coming together" pulse
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = b.x - a.x, dy = b.y - a.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          if (dist > 60 && dist < LINK_DIST) {
            const f = 0.0015;
            a.vx += (dx / dist) * f; a.vy += (dy / dist) * f;
            b.vx -= (dx / dist) * f; b.vy -= (dy / dist) * f;
          } else if (dist < 22) {
            const f = 0.004;
            a.vx -= (dx / dist) * f; a.vy -= (dy / dist) * f;
            b.vx += (dx / dist) * f; b.vy += (dy / dist) * f;
          }
        }
        a.vx *= 0.985; a.vy *= 0.985;
        const sp = Math.hypot(a.vx, a.vy);
        if (sp > 0.5) { a.vx = (a.vx / sp) * 0.5; a.vy = (a.vy / sp) * 0.5; }
      }

      const links = [];
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > LINK_DIST) continue;
          links.push({ a, b, dist });
          const alpha = (1 - dist / LINK_DIST) * 0.2;
          ctx.beginPath();
          ctx.strokeStyle = `rgba(130, 142, 255, ${alpha.toFixed(3)})`;
          ctx.lineWidth = 1;
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      maybeSpawnPulse(links);
      pulses = pulses.filter((pu) => pu.p < 1);
      for (const pu of pulses) {
        pu.p += pu.speed;
        const px = pu.a.x + (pu.b.x - pu.a.x) * pu.p;
        const py = pu.a.y + (pu.b.y - pu.a.y) * pu.p;
        ctx.beginPath();
        ctx.fillStyle = 'rgba(200, 206, 255, 0.9)';
        ctx.shadowColor = 'rgba(150, 162, 255, 0.9)';
        ctx.shadowBlur = 8;
        ctx.arc(px, py, 1.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      for (const n of nodes) {
        const dx = n.x - pointer.x, dy = n.y - pointer.y;
        const near = dx * dx + dy * dy < 42000;
        const twinkle = 0.55 + Math.sin(t * 1.4 + n.phase) * 0.35;
        const rad = near ? n.r + 1.3 : n.r;
        const alpha = near ? 0.95 : twinkle * 0.75;
        const g = ctx.createRadialGradient(n.x - rad * 0.3, n.y - rad * 0.3, 0, n.x, n.y, rad * 1.8);
        g.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
        g.addColorStop(0.35, `rgba(${n.hue}, ${alpha})`);
        g.addColorStop(1, `rgba(${n.hue}, 0)`);
        ctx.beginPath();
        ctx.fillStyle = g;
        if (near) { ctx.shadowColor = `rgba(${n.hue}, 0.95)`; ctx.shadowBlur = 14; }
        ctx.arc(n.x, n.y, rad * 1.8, 0, Math.PI * 2);
        ctx.fill();
        if (near) ctx.shadowBlur = 0;
      }
    };

    const loop = () => {
      draw();
      frame = requestAnimationFrame(loop);
    };

    const start = () => {
      if (running || prefersStill()) return;
      running = true;
      frame = requestAnimationFrame(loop);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(frame);
    };

    size();
    if (prefersStill()) {
      draw();
    } else {
      start();
      doc.addEventListener('visibilitychange', () => (doc.hidden ? stop() : start()));
      window.addEventListener('pointermove', (e) => {
        pointer = { x: e.clientX, y: e.clientY };
      }, { passive: true });
      window.addEventListener('pointerleave', () => { pointer = { x: -9999, y: -9999 }; });
    }

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => { size(); if (!running) draw(); }, 150);
    }, { passive: true });
  }

  /* ---------- anchor scrolling that respects reduced motion ---------- */
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (!id || id === '#') return;
      const target = doc.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY -
        (id === '#top' ? 0 : parseFloat(getComputedStyle(root).scrollPaddingTop) || 0);
      window.scrollTo({ top: Math.max(0, top), behavior: prefersStill() ? 'auto' : 'smooth' });
      if (typeof target.focus === 'function') {
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      }
    });
  });

  onScroll();
})();
