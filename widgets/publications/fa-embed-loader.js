/**
 * fa-embed-loader — shared FormAssembly (mdanderson.govfa.net) machinery for
 * the publication-subscribe widgets (subscribe-to-*.html). The widget HTML
 * carries the live embed verbatim (stylesheet links, width <style>, and the
 * wFormContainer/form with all tfa_* fields and hidden inputs); scripts
 * inserted via innerHTML never execute, so this loader replays the live
 * script sequence: wforms.js → prefill flag → localization-en_US.js, then
 * dispatches FA__DOMContentLoaded — the event the live
 * FA__DOMContentLoadedEventDispatcher.js emits — so wFORMS initializes
 * (validation, jsonly stylesheet activation) after the DOM-ready event EDS
 * has already consumed.
 *
 * Deliberate live-parity omissions:
 * - open-telemetry + api_v2/sst/copy-and-paste (FormAssembly embed-analytics
 *   beacons — the replica must not phone home);
 * - the inline tfa_dbElapsedJsTime timer (a no-op on live: it looks up form
 *   id "tfa_0"/"0" but these forms use numeric ids 25/26/27/28/31).
 */

const WFORMS_VERSION = '910ede8cddaa51d331c5781cd8fc809dbb1cdd98';
const WFORMS_BASE = 'https://mdanderson.govfa.net/wForms/3.11/js';

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.append(script);
  });
}

let wformsReady;

export default async function decorate() {
  if (!wformsReady) {
    wformsReady = (async () => {
      await loadScript(`${WFORMS_BASE}/wforms.js?v=${WFORMS_VERSION}`);
      if (window.wFORMS) window.wFORMS.behaviors.prefill.skip = false;
      await loadScript(`${WFORMS_BASE}/localization-en_US.js?v=${WFORMS_VERSION}`);
    })();
  }
  await wformsReady;
  const fire = () => document.dispatchEvent(new CustomEvent('FA__DOMContentLoaded'));
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fire, { once: true });
  } else {
    fire();
  }
}
