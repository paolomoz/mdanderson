/*
 * uplift-motion.js — canonical cinematic motion runtime for the uplift-c demo
 * (branch uplift-c only). Adapted from stardust/prototypes/uplift-c.html
 * inline runtime (motion-runtime.md, register `arrival`).
 *
 * EDS adaptations, documented:
 *  - Lenis rides scripts/lenis.min.js (committed, module-imported — CSP
 *    strict-dynamic trusts module imports; no content <script>, no head edits).
 *  - Boot waits for all main sections + footer chrome to load.
 *  - The prototype's .post-hero wrapper (rising plate: contact strip +
 *    blood drive + care finder) is reconstructed around the decorated
 *    sections at boot.
 *  - The mission wordmark band (.uplift-mission section) relocates below the
 *    footer chrome so the "Making Cancer History" wipe stays the final beat.
 *  - Section-head default-content wrappers (highlights / endcancer) receive
 *    the prototype's data-anim.
 *  - Stagger groups by `.section` (EDS section div), prototype grouped by
 *    <section>; stagger modulus 6 kept (C-cliff budget).
 *  - prefers-reduced-motion: everything forced to final state (as prototype).
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

/** wrap contact strip + blood + finder sections in the rising plate */
function buildPostHero() {
  const main = document.querySelector('main');
  const heroSection = main && main.querySelector('.uplift-hero-container');
  const finderSection = main && main.querySelector('.uplift-finder-container');
  if (!main || !heroSection || !finderSection) return;
  const plate = document.createElement('div');
  plate.className = 'post-hero';
  const toWrap = [];
  let el = heroSection.nextElementSibling;
  while (el) {
    toWrap.push(el);
    if (el === finderSection) break;
    el = el.nextElementSibling;
  }
  if (!toWrap.includes(finderSection)) return;
  heroSection.after(plate);
  plate.append(...toWrap);
}

/** move the mission wordmark band below the loaded footer chrome */
function relocateMission() {
  const mission = document.querySelector('main .uplift-mission-container');
  const footer = document.querySelector('body > footer .footer[data-block-status="loaded"]');
  if (mission && footer) document.querySelector('body > footer').append(mission);
}

/** the prototype's section-head wrappers carry data-anim */
function tagSectionHeads() {
  document.querySelectorAll(
    '.uplift-highlights-container > .default-content-wrapper, .uplift-endcancer-container > .default-content-wrapper',
  ).forEach((el) => el.setAttribute('data-anim', ''));
}

export default async function initUpliftMotion() {
  // Lenis (pure JS, committed to the repo). Graceful if absent: the runtime
  // falls back to native window.scrollY everywhere below.
  try {
    await import('./lenis.min.js');
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('uplift-motion: lenis unavailable, native scroll only', e);
  }

  // wait for the decorated page: all sections loaded, footer chrome in
  await waitFor(() => {
    const sections = [...document.querySelectorAll('main .section')];
    return sections.length > 0 && sections.every((s) => s.dataset.sectionStatus === 'loaded');
  }, 10000);
  await waitFor(() => document.querySelector('body > footer .footer[data-block-status="loaded"]'), 8000);

  relocateMission();
  buildPostHero();
  tagSectionHeads();

  // ── Lenis bootstrap ────────────────────────────────────────────
  if (window.Lenis) {
    const lenis = new window.Lenis({ lerp: 0.1, smoothWheel: !prefersReducedMotion });
    window.__lenis = lenis;
    (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); }(performance.now()));
  }

  // ── Helpers ────────────────────────────────────────────────────
  const clamp = (v, lo, hi) => { if (v < lo) return lo; return v > hi ? hi : v; };
  const easeOut3 = (t) => 1 - ((1 - t) ** 3);
  const getDocTop = (el) => el.getBoundingClientRect().top
    + (window.__lenis ? window.__lenis.scroll : window.scrollY);

  // ── Register-specific configuration (arrival) ──────────────────
  const animConfig = {
    parallax: {
      translate: 35, fade: 0.55, rangeStart: 0, range: 80,
    },
    plansParallax: { translate: 16, rangeStart: 0, range: 80 },
    cards: {
      trigger: 0.85, range: 0.32, slide: 40, stagger: 0.10,
    },
    wordmark: { range: 0.6, clip: 80 },
  };

  // ── Register lists ─────────────────────────────────────────────
  const animList = [];
  let wordmarkEl = null;
  let wordmarkTop = 0;

  function measure() {
    const postHeroEl = document.querySelector('.post-hero');
    const savedTransform = postHeroEl ? postHeroEl.style.transform : '';
    if (postHeroEl) postHeroEl.style.transform = '';

    animList.forEach(({ el }) => {
      el.style.opacity = '';
      el.style.transform = '';
      el.style.willChange = '';
    });
    animList.length = 0;

    document.querySelectorAll('[data-anim]').forEach((el) => {
      const parent = el.closest('.section') || el.closest('section');
      let stagger = 0;
      if (parent) {
        const peers = parent.querySelectorAll('[data-anim]');
        const idx = Array.prototype.indexOf.call(peers, el);
        stagger = (idx % 6) * animConfig.cards.stagger;
      }
      if (!prefersReducedMotion) {
        el.style.opacity = '0';
        el.style.transform = `translateY(${animConfig.cards.slide}px)`;
        el.style.willChange = 'opacity, transform';
      }
      animList.push({ el, triggerTop: getDocTop(el), staggerDelay: stagger });
    });

    // Footer wordmark wipe-up
    wordmarkEl = document.querySelector('.site-footer__wordmark');
    if (wordmarkEl) {
      wordmarkTop = getDocTop(wordmarkEl);
      if (!prefersReducedMotion) {
        wordmarkEl.style.clipPath = `inset(${animConfig.wordmark.clip}% 0 0 0)`;
        wordmarkEl.style.willChange = 'clip-path';
      }
    }

    if (postHeroEl) postHeroEl.style.transform = savedTransform;
  }

  // ── [data-countup]: IO-triggered numeric tween ─────────────────
  const countSeen = new WeakSet();
  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting || countSeen.has(entry.target)) return;
      countSeen.add(entry.target);
      if (prefersReducedMotion) {
        entry.target.textContent = entry.target.getAttribute('data-countup');
        return;
      }
      const target = +entry.target.getAttribute('data-countup');
      let duration = 600;
      if (target > 20) duration = 1400;
      else if (target > 5) duration = 900;
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

  // ── rAF loop: scroll-progress reveals + parallax ───────────────
  const heroMarqueeEl = document.querySelector('.uplift-hero .hero-marquee');
  const postHeroEl = document.querySelector('.post-hero');
  let lastMB = null;

  (function tick() {
    if (prefersReducedMotion) { requestAnimationFrame(tick); return; }
    const sY = window.__lenis ? window.__lenis.scroll : window.scrollY;
    const vh = window.innerHeight;
    const isDesktop = window.innerWidth > 767;

    // Hero parallax + scrim deepen
    if (heroMarqueeEl) {
      const pp = animConfig.parallax;
      if (isDesktop) {
        const rs = (pp.rangeStart / 100) * vh;
        const re = (pp.range / 100) * vh;
        const p = easeOut3(clamp((sY - rs) / (re - rs), 0, 1));
        heroMarqueeEl.style.transform = `translateY(${p * -pp.translate}vh)`;
        document.documentElement.style.setProperty('--uplift-parallax-progress', p);
      } else {
        heroMarqueeEl.style.transform = '';
        document.documentElement.style.setProperty('--uplift-parallax-progress', 0);
      }
    }

    // Post-hero rises faster (rising plate)
    let postHeroOffsetPx = 0;
    if (postHeroEl) {
      const pp2 = animConfig.plansParallax;
      if (isDesktop) {
        const rs = (pp2.rangeStart / 100) * vh;
        const re = (pp2.range / 100) * vh;
        const p = easeOut3(clamp((sY - rs) / (re - rs), 0, 1));
        postHeroOffsetPx = ((p * -pp2.translate) / 100) * vh;
        postHeroEl.style.transform = `translateY(${p * -pp2.translate}vh)`;
        const newMB = `${p * -pp2.translate}vh`;
        if (newMB !== lastMB) { postHeroEl.style.marginBottom = newMB; lastMB = newMB; }
      } else {
        postHeroEl.style.transform = '';
        if (lastMB !== '') { postHeroEl.style.marginBottom = ''; lastMB = ''; }
      }
    }

    // Scroll-progress entrances
    for (let i = 0; i < animList.length; i += 1) {
      const item = animList[i];
      const { trigger, range, slide } = animConfig.cards;
      const raw = (sY + vh * trigger - (item.triggerTop + postHeroOffsetPx)) / (vh * range);
      const p = easeOut3(clamp(raw - item.staggerDelay, 0, 1));
      item.el.style.opacity = String(p);
      item.el.style.transform = `translateY(${(1 - p) * slide}px)`;
    }

    // Footer wordmark wipe-up
    if (wordmarkEl) {
      const adjustedTop = wordmarkTop + postHeroOffsetPx;
      const wP = easeOut3(clamp((sY + vh - adjustedTop) / (vh * animConfig.wordmark.range), 0, 1));
      wordmarkEl.style.clipPath = `inset(${(1 - wP) * animConfig.wordmark.clip}% 0 0 0)`;
    }

    requestAnimationFrame(tick);
  }());

  measure();
  window.addEventListener('load', () => requestAnimationFrame(measure), { once: true });
  window.addEventListener('resize', measure, { passive: true });

  // ── Reduced-motion: force final states ─────────────────────────
  if (prefersReducedMotion) {
    document.querySelectorAll('[data-anim]').forEach((el) => {
      el.style.opacity = '1';
      el.style.transform = 'none';
      el.style.filter = 'none';
      el.style.clipPath = 'none';
    });
    document.querySelectorAll('[data-countup]').forEach((el) => {
      el.textContent = el.getAttribute('data-countup');
    });
    const wm = document.querySelector('.site-footer__wordmark');
    if (wm) wm.style.clipPath = 'none';
  }
}
