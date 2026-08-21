/*
 * horizon-motion.js — canonical cinematic motion runtime for the horizon demo
 * (branch horizon only). Adapted from stardust/prototypes/horizon-cinematic.html
 * inline runtime (motion-runtime.md, register `arrival`).
 *
 * EDS adaptations, documented:
 *  - Lenis rides scripts/lenis.min.js (committed, module-imported — CSP
 *    strict-dynamic trusts module imports; no content <script>).
 *  - Boot waits for all main sections to load.
 *  - Prototype <section> selectors map to EDS block containers:
 *    hero → .horizon-hero, rising plate → .horizon-finder-container,
 *    wordmark wipe → .site-footer__wordmark (horizon-footer block).
 *  - Stagger groups by .section (EDS section div); modulus 6 kept.
 *  - prefers-reduced-motion: everything forced to final state.
 */

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function waitFor(cond, timeout = 10000, interval = 100) {
  return new Promise((resolve) => {
    const t0 = performance.now();
    (function poll() {
      if (cond()) { resolve(true); return; }
      if (performance.now() - t0 > timeout) { resolve(false); return; }
      setTimeout(poll, interval);
    }());
  });
}

export default async function initHorizonMotion() {
  try {
    await import('./lenis.min.js');
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('horizon-motion: lenis unavailable, native scroll only', e);
  }

  await waitFor(() => {
    const sections = [...document.querySelectorAll('main .section')];
    return sections.length && sections.every((s) => s.dataset.sectionStatus === 'loaded');
  });

  let lenis = null;
  if (window.Lenis) {
    lenis = new window.Lenis({ lerp: 0.1, smoothWheel: !prefersReducedMotion });
    window.__lenis = lenis;
    (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); }(performance.now()));
  }
  const scrollY = () => (window.__lenis ? window.__lenis.scroll : window.scrollY);

  const nav = document.querySelector('.horizon-header');
  const onScrollNav = () => { if (nav) nav.classList.toggle('scrolled', scrollY() > 40); };
  if (lenis) lenis.on('scroll', onScrollNav);
  else window.addEventListener('scroll', onScrollNav, { passive: true });

  const clamp = (v, lo, hi) => { if (v < lo) return lo; return v > hi ? hi : v; };
  const easeOut3 = (t) => 1 - ((1 - t) ** 3);
  const getDocTop = (el) => el.getBoundingClientRect().top + scrollY();

  const animConfig = {
    hero: { drift: 12, fade: 0.85, exit: 6, range: 80 },
    plate: { translate: 10, range: 80 },
    cards: { trigger: 0.85, range: 0.32, slide: 40, stagger: 0.10 },
    wordmark: { range: 0.6, clip: 80 },
  };

  const animList = [];
  let wordmarkEl = null;
  let wordmarkTop = 0;

  function measure() {
    const plateEl = document.querySelector('.horizon-finder-container');
    const saved = plateEl ? plateEl.style.transform : '';
    if (plateEl) plateEl.style.transform = '';
    animList.forEach(({ el }) => {
      el.style.opacity = ''; el.style.transform = ''; el.style.willChange = '';
    });
    animList.length = 0;
    document.querySelectorAll('[data-anim]').forEach((el) => {
      const parent = el.closest('.section');
      let stagger = 0;
      if (parent) {
        const peers = parent.querySelectorAll('[data-anim]');
        stagger = (Array.prototype.indexOf.call(peers, el) % 6) * animConfig.cards.stagger;
      }
      if (!prefersReducedMotion) {
        el.style.opacity = '0';
        el.style.transform = `translateY(${animConfig.cards.slide}px)`;
        el.style.willChange = 'opacity, transform';
      }
      animList.push({ el, triggerTop: getDocTop(el), staggerDelay: stagger });
    });
    wordmarkEl = document.querySelector('.site-footer__wordmark');
    if (wordmarkEl) {
      wordmarkTop = getDocTop(wordmarkEl);
      if (!prefersReducedMotion) {
        wordmarkEl.style.clipPath = `inset(${animConfig.wordmark.clip}% 0 0 0)`;
        wordmarkEl.style.willChange = 'clip-path';
      }
    }
    if (plateEl) plateEl.style.transform = saved;
  }

  const countSeen = new WeakSet();
  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting || countSeen.has(entry.target)) return;
      countSeen.add(entry.target);
      const target = +entry.target.getAttribute('data-countup');
      if (prefersReducedMotion) { entry.target.textContent = String(target); return; }
      const duration = target > 20 ? 1400 : 900;
      const start = performance.now();
      (function step(now) {
        const t = clamp((now - start) / duration, 0, 1);
        entry.target.textContent = String(Math.round(easeOut3(t) * target));
        if (t < 1) requestAnimationFrame(step);
      }(performance.now()));
    });
  }, { threshold: 0.4 });
  document.querySelectorAll('[data-countup]').forEach((el) => {
    if (!prefersReducedMotion) el.textContent = '0';
    countObserver.observe(el);
  });

  const heroImgEl = document.querySelector('.horizon-hero .hero-media img');
  const heroContentEl = document.querySelector('.horizon-hero .hero-content');
  const plateEl = document.querySelector('.horizon-finder-container');
  let lastMB = null;

  (function tick() {
    if (prefersReducedMotion) { requestAnimationFrame(tick); return; }
    const sY = scrollY();
    const vh = window.innerHeight;
    const isDesktop = window.innerWidth > 767;

    if (heroImgEl && heroContentEl) {
      const p = easeOut3(clamp(sY / ((animConfig.hero.range / 100) * vh), 0, 1));
      if (isDesktop) {
        heroImgEl.style.transform = `translateY(${p * animConfig.hero.drift}vh) scale(1.1)`;
        heroContentEl.style.opacity = String(1 - p * animConfig.hero.fade);
        heroContentEl.style.transform = `translateY(${p * -animConfig.hero.exit}vh)`;
      } else {
        heroImgEl.style.transform = ''; heroContentEl.style.opacity = ''; heroContentEl.style.transform = '';
      }
    }

    let plateOffsetPx = 0;
    if (plateEl) {
      if (isDesktop) {
        const p = easeOut3(clamp(sY / ((animConfig.plate.range / 100) * vh), 0, 1));
        plateOffsetPx = (p * -animConfig.plate.translate * vh) / 100;
        plateEl.style.transform = `translateY(${p * -animConfig.plate.translate}vh)`;
        const newMB = `${p * -animConfig.plate.translate}vh`;
        if (newMB !== lastMB) { plateEl.style.marginBottom = `calc(100px + ${newMB})`; lastMB = newMB; }
      } else {
        plateEl.style.transform = '';
        if (lastMB !== '') { plateEl.style.marginBottom = ''; lastMB = ''; }
      }
    }

    for (let i = 0; i < animList.length; i += 1) {
      const item = animList[i];
      const { trigger, range, slide } = animConfig.cards;
      const raw = (sY + vh * trigger - (item.triggerTop + plateOffsetPx)) / (vh * range);
      const p = easeOut3(clamp(raw - item.staggerDelay, 0, 1));
      item.el.style.opacity = String(p);
      item.el.style.transform = `translateY(${(1 - p) * slide}px)`;
    }

    if (wordmarkEl) {
      const wP = easeOut3(clamp((sY + vh - (wordmarkTop + plateOffsetPx)) / (vh * animConfig.wordmark.range), 0, 1));
      wordmarkEl.style.clipPath = `inset(${(1 - wP) * animConfig.wordmark.clip}% 0 0 0)`;
    }
    requestAnimationFrame(tick);
  }());

  measure();
  window.addEventListener('load', () => requestAnimationFrame(measure), { once: true });
  window.addEventListener('resize', measure, { passive: true });

  if (prefersReducedMotion) {
    document.querySelectorAll('[data-anim]').forEach((el) => {
      el.style.opacity = '1'; el.style.transform = 'none';
    });
    document.querySelectorAll('[data-countup]').forEach((el) => {
      el.textContent = el.getAttribute('data-countup');
    });
    if (wordmarkEl) wordmarkEl.style.clipPath = 'none';
  }
}
