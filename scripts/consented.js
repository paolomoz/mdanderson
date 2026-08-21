/*
 * Consented martech — the POC-completion target stack (PLAN.md §4).
 * Loads ONLY after consent (scripts/consent-check.js gates this module;
 * default is declined — test with ?consent=accept).
 *
 * Replaces the live site's ~975 KB Tealium container with:
 *   1. the SAME utag_data page schema the live inline script builds
 *      (page_name/section/category/subcategoryN, Language, Device — logic
 *      lifted verbatim from www.mdanderson.org page source, 2026-08-21)
 *   2. AEP Web SDK (alloy 2.19.2 — the exact version production's Tealium
 *      tag 2993 pins) → existing prod datastream
 *   3. GA4 (production's primary measurement ID)
 *   4. Loyal Health "Guide" chat, deferred to first user interaction
 * NO ad pixels, NO Tealium sync, NO AppMeasurement/VisitorAPI — per the
 * HIPAA review gate (PLAN.md §4 red flags).
 */

const ADOBE_ORG_ID = '13664673527846410A490D45@AdobeOrg';
const AEP_DATASTREAM_ID = '9a7a2f87-0c86-498c-8597-6ab55604def4';
const ALLOY_URL = 'https://cdn1.adoberesources.net/alloy/2.19.2/alloy.min.js';
const GA4_ID = 'G-F59JGPSZ6R';
const LOYAL_CHAT_SRC = 'https://guide.loyalhealth.com/client/client.bundle.js';
const LOYAL_CHAT_ID = '783d8cc0-cd89-4650-81c2-174eb6e2a187';

function loadScript(src, attrs = {}) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.async = true;
    Object.entries(attrs).forEach(([k, v]) => s.setAttribute(k, v));
    s.onload = resolve;
    s.onerror = reject;
    document.head.append(s);
  });
}

/* data layer — same shape/values as the live inline utag_data builder */
function buildDataLayer() {
  const data = {};
  const segments = window.location.pathname.replace('.html', '').trim().split('/').filter(Boolean);
  data.page_name = segments.join(':');
  [data.page_section = '', data.page_category = ''] = segments;
  segments.slice(2).forEach((seg, i) => { data[`page_subcategory${i + 1}`] = seg; });
  data.Language = document.documentElement.lang || 'en';
  const mobileUA = /Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile/i.test(navigator.userAgent);
  const w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
  data.Device = 'desktop';
  if (mobileUA) data.Device = w > 752 ? 'tablet' : 'mobile';
  return data;
}

async function initAlloy(dataLayer) {
  /* alloy base code (official queueing stub) */
  if (!window.alloy) {
    /* eslint-disable no-underscore-dangle -- alloy base-code contract */
    window.__alloyNS = window.__alloyNS || [];
    window.__alloyNS.push('alloy');
    /* eslint-enable no-underscore-dangle */
    window.alloy = (...args) => new Promise((resolve, reject) => {
      window.setTimeout(() => { window.alloy.q.push([resolve, reject, args]); });
    });
    window.alloy.q = [];
  }
  await loadScript(ALLOY_URL);
  await window.alloy('configure', {
    edgeConfigId: AEP_DATASTREAM_ID,
    orgId: ADOBE_ORG_ID,
    defaultConsent: 'in', // this module only runs post-consent
  });
  await window.alloy('sendEvent', {
    xdm: {
      web: {
        webPageDetails: { name: dataLayer.page_name, URL: window.location.href },
        webReferrer: { URL: document.referrer },
      },
    },
    data: { mda: dataLayer },
  });
}

function initGA4(dataLayer) {
  window.dataLayer = window.dataLayer || [];
  function gtag(...args) { window.dataLayer.push(args); }
  window.gtag = window.gtag || gtag;
  loadScript(`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`);
  window.gtag('js', new Date());
  window.gtag('config', GA4_ID, {
    page_section: dataLayer.page_section,
    page_category: dataLayer.page_category,
  });
}

/* chat loads on first real user intent, never on page load */
function initChatOnInteraction() {
  const load = () => {
    ['pointerdown', 'keydown', 'scroll'].forEach((e) => window.removeEventListener(e, load));
    loadScript(LOYAL_CHAT_SRC, { 'data-value': LOYAL_CHAT_ID, id: 'loyal-guide' });
  };
  ['pointerdown', 'keydown', 'scroll'].forEach((e) => window.addEventListener(e, load, { once: true, passive: true }));
}

const dataLayer = buildDataLayer();
window.utag_data = dataLayer; // parity hook for anything expecting the live schema
initAlloy(dataLayer);
initGA4(dataLayer);
initChatOnInteraction();
