import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * header — MD Anderson chrome (template-slotted, eds-conversion-log §3 / D12).
 *
 * Fetches content/nav.html. Document contract — four default-content sections,
 * fixed order:
 *   1. brand   — logo link (image + home href)
 *   2. links   — primary nav <ul> (6 items; nested <ul> = mega-menu columns,
 *                rendered into the hidden .mda-nav-flyout panels)
 *   3. tools   — utility link row (Clinical Trials, Locations, Careers,
 *                Contact Us, Our Doctors, Languages)
 *   4. utility — utility bar (MyChart / Request an Appointment / Donate Today)
 * Search form is built in block JS (interactive, never authored — D15).
 * Nav decode matches ':scope > a, :scope > p > a' (#98 — the live pipeline
 * wraps li trigger links in <p>).
 */

// canon pinned collapse breakpoint: mobile <= 991px
const isDesktop = window.matchMedia('(min-width: 992px)');

/** #98 — trigger link may be direct or <p>-wrapped on live */
function triggerLink(li) {
  return li.querySelector(':scope > a, :scope > p > a');
}

function closeOnEscape(e) {
  if (e.code === 'Escape') {
    const nav = document.getElementById('nav');
    if (!nav) return;
    if (!isDesktop.matches && nav.getAttribute('aria-expanded') === 'true') {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, false);
      nav.querySelector('.mda-nav-mobile-menu-button')?.focus();
    }
  }
}

function closeOnFocusLost(e) {
  const nav = e.currentTarget;
  if (!nav.contains(e.relatedTarget) && !isDesktop.matches) {
    // eslint-disable-next-line no-use-before-define
    toggleMenu(nav, false);
  }
}

/**
 * Toggles the mobile menu (stock hamburger/aria machinery, restyled)
 * @param {Element} nav The nav container element
 * @param {*} forceExpanded Optional param to force nav expand behavior when not null
 */
function toggleMenu(nav, forceExpanded = null) {
  const expanded = forceExpanded !== null
    ? !forceExpanded
    : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.mda-nav-mobile-menu-button');
  document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  if (button) button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');

  if (!expanded || isDesktop.matches) {
    window.addEventListener('keydown', closeOnEscape);
    nav.addEventListener('focusout', closeOnFocusLost);
  } else {
    window.removeEventListener('keydown', closeOnEscape);
    nav.removeEventListener('focusout', closeOnFocusLost);
  }
}

/** builds the utility bar (canon .mda-cta-list-container) from authored links */
function buildUtilityBar(links) {
  const container = document.createElement('div');
  container.className = 'mda-cta-list-container desktop';
  const ul = document.createElement('ul');
  ul.className = 'mda-cta-list';
  const kinds = ['login', 'appointment', 'donate'];
  links.forEach((a, i) => {
    const li = document.createElement('li');
    li.className = `mda-cta-list-item ${kinds[i] || 'donate'}`;
    const link = a.cloneNode(true);
    link.className = 'dropdown-trigger';
    if (kinds[i] === 'login' && /mychart/i.test(link.textContent)) {
      // canon renders the MyChart wordmark as two tinted spans
      link.innerHTML = '<span class="red-my">My</span><span class="white-chart">Chart</span>';
    }
    if (kinds[i] === 'donate') {
      const heart = document.createElement('i');
      heart.className = 'fa fa-heart mda-inverse';
      link.append(heart);
    }
    li.append(link);
    ul.append(li);
  });
  container.append(ul);
  return container;
}

/** builds the desktop utility link row (canon .mda-nav-utility) */
function buildTools(links) {
  const ul = document.createElement('ul');
  ul.className = 'mda-nav-utility desktop flex-row';
  links.forEach((a) => {
    const li = document.createElement('li');
    const link = a.cloneNode(true);
    const label = link.textContent.trim().toLowerCase();
    if (label.startsWith('careers')) {
      link.className = 'careers';
      const out = document.createElement('span');
      out.className = 'mda-icon-linkout';
      link.append(out);
    } else if (label.startsWith('languages')) {
      link.className = 'mda-nav-utility-languages';
    }
    li.append(link);
    ul.append(li);
  });
  return ul;
}

/** search form — built in block JS, never authored (D15) */
function buildSearch() {
  const search = document.createElement('div');
  search.id = 'nav-search';
  search.innerHTML = `
    <form id="nav-search-form" action="#">
      <i class="search-icon mda-icon-search"></i>
      <input id="site-search" type="text" placeholder="Search" autocomplete="off" aria-label="Search">
    </form>`;
  // replica search is a visual no-op (onsubmit="return false")
  search.querySelector('form').addEventListener('submit', (e) => e.preventDefault());
  return search;
}

/** the red primary nav (canon nav.mda-nav) from the authored links <ul> */
function buildPrimaryNav(linksSection) {
  const wrapper = document.createElement('div');
  wrapper.className = 'mda-nav mda-nav-primary';
  const inner = document.createElement('div');
  inner.className = 'mda-nav-wrapper';
  const main = document.createElement('div');
  main.className = 'mda-nav-main';
  const list = document.createElement('ul');
  list.className = 'mda-nav-main-list';

  const authored = linksSection ? [...linksSection.querySelectorAll(':scope .default-content-wrapper > ul > li')] : [];
  authored.forEach((li, i) => {
    const a = triggerLink(li);
    if (!a) return;
    const item = document.createElement('li');
    item.className = 'dropdown';
    const btnWrap = document.createElement('div');
    btnWrap.className = 'mda-nav-button-wrapper dropdown-trigger';
    const link = a.cloneNode(true);
    link.id = `mda-nav-link-${i + 1}`;
    const drop = document.createElement('button');
    drop.className = 'dropdown-trigger-button';
    drop.type = 'button';
    drop.setAttribute('aria-label', `Open ${link.textContent.trim()} menu`);
    drop.setAttribute('aria-expanded', 'false');
    btnWrap.append(link, drop);
    // mega-menu panel: presentation lives here; columns are the authored
    // nested lists (empty in the replica — panels stay hidden, visual parity)
    const flyout = document.createElement('div');
    flyout.className = 'mda-nav-flyout';
    flyout.hidden = true;
    const columns = [...li.querySelectorAll(':scope > ul')];
    if (columns.length) {
      item.classList.add('nav-drop');
      columns.forEach((col) => {
        const colDiv = document.createElement('div');
        colDiv.className = 'mda-nav-flyout-column';
        colDiv.append(col.cloneNode(true));
        flyout.append(colDiv);
      });
      drop.addEventListener('click', () => {
        const expanded = drop.getAttribute('aria-expanded') === 'true';
        drop.setAttribute('aria-expanded', expanded ? 'false' : 'true');
        flyout.hidden = expanded;
      });
    }
    item.append(btnWrap, flyout);
    list.append(item);
  });

  main.append(list);
  inner.append(main);
  wrapper.append(inner);
  return wrapper;
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // load nav as fragment
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);

  // authored sections, fixed order: brand / links / tools / utility bar
  const sections = [...fragment.children].filter((el) => el.classList.contains('section'));
  const [brandSection, linksSection, toolsSection, utilitySection] = sections;

  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  nav.setAttribute('data-nav-collapse', 'hamburger');
  nav.setAttribute('aria-label', 'Main navigation');

  // ===== top chrome (canon header.mda-nav) =====
  const header = document.createElement('div');
  header.className = 'mda-nav mda-nav-header';

  const skip = document.createElement('a');
  skip.id = 'content-skip-btn';
  skip.href = '#main';
  skip.textContent = 'Skip to Content';
  header.append(skip);
  const pageMain = document.querySelector('main');
  if (pageMain && !pageMain.id) pageMain.id = 'main';

  const utilityLinks = utilitySection ? [...utilitySection.querySelectorAll('a')] : [];
  if (utilityLinks.length) header.append(buildUtilityBar(utilityLinks));

  const top = document.createElement('div');
  top.className = 'mda-nav-top flex-row';

  // brand
  const brandLink = brandSection ? brandSection.querySelector('a') : null;
  const logo = document.createElement('a');
  logo.id = 'nav-logo';
  logo.href = brandLink ? brandLink.href : '/';
  logo.setAttribute('aria-label', 'MD Anderson Cancer Center home');
  const brandImg = brandSection ? brandSection.querySelector('picture, img') : null;
  if (brandImg) logo.append(brandImg.cloneNode(true));
  top.append(logo);

  const spacer = document.createElement('div');
  spacer.className = 'spacer desktop';
  top.append(spacer);

  const toolsLinks = toolsSection ? [...toolsSection.querySelectorAll('a')] : [];
  const toolsList = buildTools(toolsLinks);
  top.append(toolsList);
  top.append(buildSearch());

  // mobile controls — stock hamburger machinery, restyled to the replica's
  const mobileMenu = document.createElement('div');
  mobileMenu.className = 'mda-nav-mobile-menu mobile nav-hamburger';
  mobileMenu.innerHTML = `
    <button class="mda-nav-mobile-search-button" type="button" aria-label="Open search">
      <i class="search-icon mda-icon-search mobile-search"></i>
      <span class="mda-nav-mobile-search-title">Search</span>
    </button>
    <button class="mda-nav-mobile-menu-button" type="button" aria-controls="nav" aria-label="Open navigation">
      <i class="fa fa-2x mda-icon-menu"></i>
      <span class="mda-nav-mobile-menu-title">Menu</span>
    </button>`;
  mobileMenu.querySelector('.mda-nav-mobile-search-button').addEventListener('click', () => {
    nav.classList.toggle('mobile-search-open');
  });
  mobileMenu.querySelector('.mda-nav-mobile-menu-button').addEventListener('click', () => toggleMenu(nav));
  top.append(mobileMenu);

  header.append(top);

  // ===== red primary nav (canon nav.mda-nav) =====
  const primary = buildPrimaryNav(linksSection);

  // mobile menu panel gets the tools + utility links appended (hidden >=992px)
  const mobileTools = document.createElement('ul');
  mobileTools.className = 'mda-nav-mobile-tools';
  [...toolsLinks, ...utilityLinks].forEach((a) => {
    const li = document.createElement('li');
    li.append(a.cloneNode(true));
    mobileTools.append(li);
  });
  primary.append(mobileTools);

  nav.append(header, primary);
  nav.setAttribute('aria-expanded', 'false');
  // prevent mobile nav behavior on window resize
  toggleMenu(nav, isDesktop.matches);
  isDesktop.addEventListener('change', () => toggleMenu(nav, isDesktop.matches));

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);
}
