import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * footer — MD Anderson mega footer (template-slotted, eds-conversion-log §3).
 *
 * Fetches content/footer.html. Document contract — one default-content section
 * per band, fixed order:
 *   1. logo (footer logo link + image)
 *   2. Explore link column (<ul>, first <li> = column title)
 *   3. About link column
 *   4. Finding Your Way + Digital Accessibility columns (two <ul>s)
 *   5. Get in Touch (Call tel link, Ask a question link)
 *   6. Stay Connected social links (<ul> of links; icons derived from hostname)
 *   7. Cancerwise Podcast links (same device)
 *   8. More legal sublinks
 *   9. mission band (mission statement paragraph + copyright line)
 * The newsletter bar and EndCancer trio are IN-MAIN blocks, not footer chrome.
 */

/** hostname → canon FontAwesome-build icon class */
const ICON_BY_HOST = [
  [/facebook\./, 'fa-facebook-square'],
  [/(^|\.)x\.com|twitter\./, 'fa-x-twitter-square'],
  [/youtube\./, 'fa-youtube-play-square'],
  [/instagram\./, 'fa-instagram-square'],
  [/linkedin\./, 'fa-linkedin-square'],
  [/bsky\./, 'fa-bluesky-square'],
  [/threads\./, 'fa-threads-square'],
  [/podcasts\.apple\./, 'fa-apple-podcast-square'],
  [/spotify\./, 'fa-spotify-square'],
  [/pandora\./, 'fa-pandora-square'],
  [/iheart\./, 'fa-iheart-square'],
  [/./, 'fa-rss-feed-square'],
];

function iconClassFor(href) {
  try {
    const { hostname } = new URL(href, window.location.href);
    return ICON_BY_HOST.find(([re]) => re.test(hostname))[1];
  } catch (e) {
    return 'fa-rss-feed-square';
  }
}

/** decorates an authored link column <ul>: first <li> = title + mobile toggle */
function decorateColumn(ul) {
  const list = ul.cloneNode(true);
  const title = list.querySelector(':scope > li');
  if (title && !title.querySelector('a')) {
    title.classList.add('title');
    const toggle = document.createElement('div');
    toggle.className = 'toggle';
    title.append(toggle);
    title.addEventListener('click', () => {
      list.classList.toggle('open');
    });
  }
  return list;
}

/** canon icon-circle stack */
function iconCircle(iconClass) {
  const circle = document.createElement('div');
  circle.className = 'icon-circle';
  circle.innerHTML = `<span class="fa-stack fa-2x"><i class="fa fa-circle fa-stack-2x"></i><i class="fa ${iconClass} mda-stack-1x"></i></span>`;
  return circle;
}

/** social/podcast icon rail (canon slick markup, static) */
function socialRail(links) {
  const wrapper = document.createElement('div');
  wrapper.className = 'col-single inner';
  wrapper.innerHTML = `
    <div class="social-links-wrapper"><div class="social-links">
      <div class="social-links-carousel">
        <button class="slick-prev" type="button" aria-label="Previous">Previous</button>
        <div class="slick-list"><div class="slick-track"></div></div>
        <button class="slick-next" type="button" aria-label="Next">Next</button>
      </div>
    </div></div>`;
  const track = wrapper.querySelector('.slick-track');
  links.forEach((a) => {
    const box = document.createElement('a');
    box.className = 'box';
    box.href = a.href;
    box.setAttribute('aria-label', a.textContent.trim() || a.hostname);
    const i = document.createElement('i');
    i.className = `fa ${iconClassFor(a.href)} fa-2x`;
    box.append(i);
    track.append(box);
  });
  const list = wrapper.querySelector('.slick-list');
  wrapper.querySelector('.slick-prev').addEventListener('click', () => {
    list.scrollBy({ left: -80, behavior: 'smooth' });
  });
  wrapper.querySelector('.slick-next').addEventListener('click', () => {
    list.scrollBy({ left: 80, behavior: 'smooth' });
  });
  return wrapper;
}

/** get-in-touch items from the authored links */
function getInTouch(section) {
  const ul = document.createElement('ul');
  ul.id = 'get-in-touch';
  const title = document.createElement('li');
  title.className = 'title';
  title.innerHTML = 'Get in Touch<div class="toggle"></div>';
  ul.append(title);
  [...(section ? section.querySelectorAll('a') : [])].forEach((a) => {
    const li = document.createElement('li');
    li.className = 'footer-contact-item';
    const link = document.createElement('a');
    link.href = a.href;
    if (a.href.startsWith('tel:')) {
      link.className = 'footerTel';
      link.append(iconCircle('mda-icon-call-stroke'));
      // "Call 1-877-790-1139" → label + bold number
      const text = a.textContent.trim();
      const m = text.match(/^(.*?)([\d][\d\s().-]{6,})$/);
      link.append(document.createTextNode(m ? m[1].trim() : text));
      const bold = document.createElement('div');
      bold.className = 'footer-contact-bold';
      bold.textContent = m ? m[2].trim() : '';
      link.append(bold);
    } else {
      li.classList.add('only-label');
      link.append(iconCircle('mda-icon-knowledgecenter'));
      link.append(document.createTextNode(a.textContent.trim()));
      const bold = document.createElement('div');
      bold.className = 'footer-contact-bold';
      link.append(bold);
    }
    li.append(link);
    ul.append(li);
  });
  return ul;
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // load footer as fragment
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);

  const sections = [...fragment.children].filter((el) => el.classList.contains('section'));
  const [
    logoSection, exploreSection, aboutSection, findingSection, touchSection,
    socialSection, podcastSection, moreSection, missionSection,
  ] = sections;

  block.textContent = '';
  const footer = document.createElement('div');
  footer.className = 'global-footer';

  // ===== link columns =====
  const links = document.createElement('div');
  links.className = 'footer-links';

  // logo column (+ Only Possible Here promo card — chrome presentation)
  const logoCol = document.createElement('div');
  logoCol.className = 'col2 mda-logo';
  const logoLink = logoSection ? logoSection.querySelector('a') : null;
  // authored logo variants: 1st image = desktop column logo, 2nd = mobile +
  // bottom mission-bar logo (falls back to the first when only one authored)
  // (query pictures first — 'picture, img' would double-count the nested img)
  let logoImgs = logoSection ? [...logoSection.querySelectorAll('picture')] : [];
  if (!logoImgs.length && logoSection) logoImgs = [...logoSection.querySelectorAll('img')];
  const logoImg = logoImgs[0] || null;
  const barLogoImg = logoImgs[1] || logoImg;
  const logoA = document.createElement('a');
  logoA.href = logoLink ? logoLink.href : '/';
  logoA.setAttribute('aria-label', 'MD Anderson Cancer Center home');
  // class must land on the <img> itself (the pipeline may wrap it in <picture>)
  const cloneLogo = (source, className) => {
    const clone = source.cloneNode(true);
    const img = clone.tagName === 'IMG' ? clone : clone.querySelector('img');
    if (img) img.classList.add(className);
    return clone;
  };
  if (logoImg) {
    logoA.append(cloneLogo(logoImg, 'desktop'), cloneLogo(barLogoImg, 'mobile'));
  }
  logoCol.append(logoA);
  const promo = document.createElement('div');
  promo.className = 'at-sticky-promo-li';
  promo.innerHTML = `
    <a class="at-sticky-promo-link-wrapper" href="https://onlypossiblehere.mdanderson.org">
      <div class="at-sticky-promo-top">
        <div class="at-promo-svg-wrapper"></div>
        <span class="at-promo-arrow"><i class="fa-solid fa-angle-right"></i></span>
      </div>
      <div class="at-sticky-promo-bottom"><span class="at-promo-return-text">Explore what your support makes possible</span></div>
    </a>`;
  logoCol.append(promo);
  links.append(logoCol);

  const gutter = document.createElement('div');
  gutter.className = 'col1';
  links.append(gutter);

  // Explore + About columns
  [exploreSection, aboutSection].forEach((section) => {
    const col = document.createElement('div');
    col.className = 'col2';
    const ul = section ? section.querySelector('ul') : null;
    if (ul) col.append(decorateColumn(ul));
    links.append(col);
  });

  // Finding Your Way + Digital Accessibility (two authored <ul>s)
  const findingCol = document.createElement('div');
  findingCol.className = 'col2';
  const findingUls = findingSection ? [...findingSection.querySelectorAll(':scope ul')] : [];
  findingUls.forEach((ul, i) => {
    const list = decorateColumn(ul);
    if (i === 1) {
      list.id = 'a11y-block';
      list.querySelectorAll(':scope > li a').forEach((a) => {
        a.className = a.querySelector('img') ? 'a11y-icon' : 'a11y-link';
      });
    }
    findingCol.append(list);
  });
  links.append(findingCol);

  // Get in Touch + Stay Connected + Podcast
  const col3 = document.createElement('div');
  col3.className = 'col3 last';
  col3.append(getInTouch(touchSection));

  const social = document.createElement('ul');
  social.id = 'stay-connected';
  social.innerHTML = '<li class="title">Stay Connected<div class="toggle"></div></li>';
  const socialLi = document.createElement('li');
  socialLi.className = 'stay-connected';
  socialLi.append(socialRail([...(socialSection ? socialSection.querySelectorAll('a') : [])]));
  social.append(socialLi);
  col3.append(social);

  const podcast = document.createElement('ul');
  podcast.id = 'podcast';
  podcast.innerHTML = '<li class="title">Cancerwise Podcast<div class="toggle"></div></li>';
  const podcastLi = document.createElement('li');
  podcastLi.className = 'podcast';
  podcastLi.append(socialRail([...(podcastSection ? podcastSection.querySelectorAll('a') : [])]));
  podcast.append(podcastLi);
  col3.append(podcast);

  links.append(col3);
  footer.append(links);

  // ===== sublinks bar =====
  const sublinks = document.createElement('div');
  sublinks.className = 'footer-links sublink-container';
  const sublinksInner = document.createElement('div');
  sublinksInner.className = 'footer-sublinks';
  const sublinksContainer = document.createElement('div');
  sublinksContainer.className = 'sublinks-list-container';
  const moreUl = moreSection ? moreSection.querySelector('ul') : null;
  if (moreUl) sublinksContainer.append(decorateColumn(moreUl));
  sublinksInner.append(sublinksContainer);
  sublinks.append(sublinksInner);
  footer.append(sublinks);

  // ===== bottom mission band =====
  const bottom = document.createElement('div');
  bottom.className = 'bottom-footer-bar';
  const barLogo = document.createElement('div');
  barLogo.className = 'footer-bar-logo';
  const barLogoA = document.createElement('a');
  barLogoA.href = logoLink ? logoLink.href : '/';
  barLogoA.setAttribute('aria-label', 'MD Anderson Cancer Center home');
  if (barLogoImg) barLogoA.append(cloneLogo(barLogoImg, 'logo'));
  barLogo.append(barLogoA);
  bottom.append(barLogo);

  const barText = document.createElement('div');
  barText.className = 'footer-bar-text';
  const paragraphs = missionSection ? [...missionSection.querySelectorAll('p')] : [];
  if (paragraphs[0]) {
    const mission = document.createElement('div');
    mission.className = 'missionstatement';
    mission.append(...paragraphs[0].cloneNode(true).childNodes);
    barText.append(mission);
  }
  if (paragraphs[1]) {
    const copyright = paragraphs[1].cloneNode(true);
    copyright.className = 'copyright';
    barText.append(copyright);
  }
  bottom.append(barText);
  footer.append(bottom);

  block.append(footer);
}
