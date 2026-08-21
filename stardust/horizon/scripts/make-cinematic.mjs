import { readFileSync, writeFileSync } from 'fs';
let h = readFileSync('stardust/prototypes/horizon-proposed.html', 'utf8');

// provenance variant line
h = h.replace('<!-- stardust:provenance', `<!-- stardust:provenance
  variant: cinematic — register arrival (Lenis + canonical runtime; source: direct via uplift precedent)`);

// lenis css
h = h.replace('<link rel="stylesheet" href="assets/mda-fonts.css">',
  '<link rel="stylesheet" href="assets/mda-fonts.css">\n<link rel="stylesheet" href="assets/uplift/lenis.min.css">');

// extend noscript fallback
h = h.replace('    .site-head { position: absolute; }',
`    .site-head { position: absolute; }
    [data-anim] { opacity: 1 !important; transform: none !important; }
    .post-hero { transform: none !important; margin-bottom: 0 !important; }
    .site-footer__wordmark { clip-path: none !important; }`);

// structural hooks
h = h.replace('<header class="site-head"', '<header class="site-head" id="nav"');
h = h.replace('class="care-finder wrap"', 'class="care-finder wrap post-hero"');
h = h.replace('<span class="brand" style="font-size:19px; color:oklch(100% 0 0);">',
  '<span class="brand site-footer__wordmark" style="font-size:19px; color:oklch(100% 0 0); display:inline-block;">');

// data-anim annotations
h = h.replaceAll('<div class="chap-head">', '<div class="chap-head" data-anim>');
h = h.replaceAll('<p class="chap-lead">', '<p class="chap-lead" data-anim>');
h = h.replaceAll('<article class="care-card">', '<article class="care-card" data-anim>');
h = h.replace('<figure class="care-photo">', '<figure class="care-photo" data-anim>');
h = h.replaceAll('<div class="stat">', '<div class="stat" data-anim>');
h = h.replace('<p class="body">', '<p class="body" data-anim>');
h = h.replace('<figure class="why-photo strike-cut">', '<figure class="why-photo strike-cut" data-anim>');
h = h.replaceAll('<a class="film film--lead"', '<a data-anim class="film film--lead"');
h = h.replaceAll('<a class="film"', '<a data-anim class="film"');
h = h.replaceAll('<span class="film film--type"', '<span data-anim class="film film--type"');
h = h.replaceAll('<span class="film film--type paper"', '<span data-anim class="film film--type paper"');
h = h.replaceAll('<article class="act-tile">', '<article class="act-tile" data-anim>');
h = h.replaceAll('<article class="sup-card">', '<article class="sup-card" data-anim>');
h = h.replace('<div class="quick-pills">', '<div class="quick-pills" data-anim>');
h = h.replace('<b class="num">15</b>', '<b class="num" data-countup="15">15</b>');

// cinematic CSS (inject before final </style>)
const css = `
/* == cinematic layer (arrival register) == */
.hero-media img { will-change: transform; }
.hero-content { will-change: opacity, transform; }
@media (prefers-reduced-motion: no-preference) {
  .hero-content { animation: heroIn 950ms var(--ease) 160ms backwards; }
  @keyframes heroIn { from { opacity: 0; translate: 0 30px; } }
  .npill { transition: background 300ms var(--ease), padding 300ms var(--ease), box-shadow 300ms var(--ease); }
  .site-head.scrolled .npill { background: oklch(14% 0.004 30 / .92); box-shadow: 0 12px 40px oklch(10% 0.01 30 / .4); }
}
`;
const lastStyle = h.lastIndexOf('</style>');
h = h.slice(0, lastStyle) + css + h.slice(lastStyle);

// runtime (adapted canonical arrival runtime) before </body>
const runtime = `
<script src="assets/uplift/lenis.min.js"><\/script>
<script>
/* stardust:horizon — canonical motion runtime (prototype/reference/motion-runtime.md),
   arrival register token defaults. Deviations, documented: (1) stagger modulus 8→6,
   (2) hero parallax adapted to fixed-height photographic hero (image drifts +12vh,
   content fades/rises out), (3) footer wordmark wipe carried from uplift-C. */
(function () {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const lenis = new Lenis({ lerp: 0.1, smoothWheel: !prefersReducedMotion });
  window.__lenis = lenis;
  (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })(performance.now());

  const nav = document.getElementById('nav');
  if (nav) lenis.on('scroll', ({ scroll }) => { nav.classList.toggle('scrolled', scroll > 40); });

  const clamp = (v, lo, hi) => v < lo ? lo : v > hi ? hi : v;
  const easeOut3 = t => 1 - Math.pow(1 - t, 3);
  const getDocTop = el => el.getBoundingClientRect().top + (window.__lenis ? window.__lenis.scroll : window.scrollY);

  const animConfig = {
    hero:          { drift: 12, fade: 0.85, exit: 6, range: 80 },
    plansParallax: { translate: 10, rangeStart: 0, range: 80 },
    cards:         { trigger: 0.85, range: 0.32, slide: 40, stagger: 0.10 },
    wordmark:      { range: 0.6, clip: 80 },
  };

  const animList = [];
  let wordmarkEl = null, wordmarkTop = 0;

  function measure() {
    const postHeroEl = document.querySelector('.post-hero');
    const savedTransform = postHeroEl ? postHeroEl.style.transform : '';
    if (postHeroEl) postHeroEl.style.transform = '';
    animList.forEach(({ el }) => { el.style.opacity = el.style.transform = el.style.willChange = ''; });
    animList.length = 0;
    document.querySelectorAll('[data-anim]').forEach((el) => {
      const parent = el.closest('section');
      let stagger = 0;
      if (parent) {
        const peers = parent.querySelectorAll('[data-anim]');
        stagger = (Array.prototype.indexOf.call(peers, el) % 6) * animConfig.cards.stagger;
      }
      if (!prefersReducedMotion) {
        el.style.opacity = '0';
        el.style.transform = 'translateY(' + animConfig.cards.slide + 'px)';
        el.style.willChange = 'opacity, transform';
      }
      animList.push({ el, triggerTop: getDocTop(el), staggerDelay: stagger });
    });
    wordmarkEl = document.querySelector('.site-footer__wordmark');
    if (wordmarkEl) {
      wordmarkTop = getDocTop(wordmarkEl);
      if (!prefersReducedMotion) {
        wordmarkEl.style.clipPath = 'inset(' + animConfig.wordmark.clip + '% 0 0 0)';
        wordmarkEl.style.willChange = 'clip-path';
      }
    }
    if (postHeroEl) postHeroEl.style.transform = savedTransform;
  }

  const countSeen = new WeakSet();
  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting || countSeen.has(entry.target)) return;
      countSeen.add(entry.target);
      if (prefersReducedMotion) { entry.target.textContent = entry.target.getAttribute('data-countup'); return; }
      const target = +entry.target.getAttribute('data-countup');
      const duration = target > 20 ? 1400 : target > 5 ? 900 : 600;
      const start = performance.now();
      (function step(now) {
        const t = clamp((now - start) / duration, 0, 1);
        entry.target.textContent = String(Math.round(easeOut3(t) * target));
        if (t < 1) requestAnimationFrame(step);
      })(performance.now());
    });
  }, { threshold: 0.4 });
  document.querySelectorAll('[data-countup]').forEach((el) => {
    if (!prefersReducedMotion) el.textContent = '0';
    countObserver.observe(el);
  });

  const heroImgEl = document.querySelector('.hero-media img');
  const heroContentEl = document.querySelector('.hero-content');
  const postHeroEl = document.querySelector('.post-hero');
  let _lastMB = null;

  (function tick() {
    if (prefersReducedMotion) { requestAnimationFrame(tick); return; }
    const sY = window.__lenis ? window.__lenis.scroll : window.scrollY;
    const vh = window.innerHeight;
    const isDesktop = window.innerWidth > 767;

    if (heroImgEl) {
      const p = easeOut3(clamp(sY / (animConfig.hero.range / 100 * vh), 0, 1));
      if (isDesktop) {
        heroImgEl.style.transform = 'translateY(' + (p * animConfig.hero.drift) + 'vh) scale(1.1)';
        heroContentEl.style.opacity = String(1 - p * animConfig.hero.fade);
        heroContentEl.style.transform = 'translateY(' + (p * -animConfig.hero.exit) + 'vh)';
      } else {
        heroImgEl.style.transform = ''; heroContentEl.style.opacity = ''; heroContentEl.style.transform = '';
      }
    }

    let postHeroOffsetPx = 0;
    if (postHeroEl) {
      const pp2 = animConfig.plansParallax;
      if (isDesktop) {
        const p = easeOut3(clamp(sY / (pp2.range / 100 * vh), 0, 1));
        postHeroOffsetPx = p * -pp2.translate / 100 * vh;
        postHeroEl.style.transform = 'translateY(' + (p * -pp2.translate) + 'vh)';
        const newMB = (p * -pp2.translate) + 'vh';
        if (newMB !== _lastMB) { postHeroEl.style.marginBottom = newMB; _lastMB = newMB; }
      } else {
        postHeroEl.style.transform = '';
        if (_lastMB !== '') { postHeroEl.style.marginBottom = ''; _lastMB = ''; }
      }
    }

    for (let i = 0; i < animList.length; i++) {
      const item = animList[i];
      const { trigger, range, slide } = animConfig.cards;
      const raw = (sY + vh * trigger - (item.triggerTop + postHeroOffsetPx)) / (vh * range);
      const p = easeOut3(clamp(raw - item.staggerDelay, 0, 1));
      item.el.style.opacity = String(p);
      item.el.style.transform = 'translateY(' + ((1 - p) * slide) + 'px)';
    }

    if (wordmarkEl) {
      const adjustedTop = wordmarkTop + postHeroOffsetPx;
      const wP = easeOut3(clamp((sY + vh - adjustedTop) / (vh * animConfig.wordmark.range), 0, 1));
      wordmarkEl.style.clipPath = 'inset(' + ((1 - wP) * animConfig.wordmark.clip) + '% 0 0 0)';
    }
    requestAnimationFrame(tick);
  })();

  measure();
  window.addEventListener('load',   () => requestAnimationFrame(measure), { once: true });
  window.addEventListener('resize', measure, { passive: true });

  if (prefersReducedMotion) {
    document.querySelectorAll('[data-anim]').forEach((el) => {
      el.style.opacity = '1'; el.style.transform = 'none'; el.style.filter = 'none'; el.style.clipPath = 'none';
    });
    document.querySelectorAll('[data-countup]').forEach((el) => { el.textContent = el.getAttribute('data-countup'); });
    if (wordmarkEl) wordmarkEl.style.clipPath = 'none';
  }
})();
<\/script>
</body>`;
h = h.replace('</body>', runtime);

writeFileSync('stardust/prototypes/horizon-cinematic.html', h);
console.log('written', h.length, 'bytes; data-anim count:', (h.match(/data-anim/g)||[]).length);
