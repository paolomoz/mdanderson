/**
 * sticky-cta — mobile sticky appointment bar (live `.appt-bar-sticky`).
 * Live (cancer-types/lung-cancer.html + mda-web internal.min.js): a blue
 * #3361ad bar appended to the end of main, hidden on load (`.hide`) and
 * shown ≤752px (`.show`) whenever the in-page `.appointment-bar` scrolls
 * out of the viewport; ≥752px the bar is display:none. Each button is
 * an icon-over-label link (Call tel:, Request appointment, MyChart).
 *
 * Authoring: one link per row — row 1 the tel: "Call" link, row 2 the
 * appointment-page link, optional row 3 (e.g. MyChart). Link text is the
 * button label. The block's authored position is the show/hide trigger
 * (stands in for the live `.appointment-bar` viewport check).
 */

/** live icon classes: call-stroke \e604, appointments \e601, user \e632 */
function buttonType(href, index) {
  if (href.startsWith('tel:')) return { cls: 'sticky-phone-btn', icon: 'mda-icon-call-stroke' };
  if (index >= 2 || href.includes('my.mdanderson.org')) return { cls: 'sticky-mychart-btn', icon: 'mda-icon-user' };
  return { cls: 'sticky-appt-btn', icon: 'mda-icon-appointments' };
}

export default async function decorate(block) {
  const links = [...block.querySelectorAll('a[href]')];
  if (!links.length) {
    block.remove();
    return;
  }

  const bar = document.createElement('div');
  // live: 3 buttons = during-hours widths (25/48/25),
  // 2 buttons = after-hours widths (50/48)
  bar.className = `appt-bar${links.length === 2 ? ' two-up' : ''}`;

  links.forEach((link, i) => {
    const href = link.getAttribute('href');
    const { cls, icon } = buttonType(href, i);

    const btn = document.createElement('div');
    btn.className = `button-block ${cls}`;

    const a = document.createElement('a');
    a.className = 'appt-sticky-cta';
    a.href = href;
    if (link.target) a.target = link.target;

    const circle = document.createElement('div');
    circle.className = 'promo-icon icon-circle';
    const lg = document.createElement('span');
    lg.className = 'fa-lg';
    const glyph = document.createElement('i');
    glyph.className = `fa ${icon} mda-inverse`;
    glyph.setAttribute('aria-hidden', 'true');
    lg.append(glyph);
    circle.append(lg);

    a.append(circle, document.createTextNode(link.textContent.trim()));
    btn.append(a);
    bar.append(btn);
  });

  block.replaceChildren(bar);
  block.classList.add('hide'); // live: bar starts hidden

  // live: $(window).on('resize scroll') shows the bar while the trigger
  // is out of the viewport — replicated with an IntersectionObserver on
  // the block's (now display-detached) authored slot
  const trigger = block.closest('.sticky-cta-wrapper') || block.parentElement;
  if (trigger && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(([entry]) => {
      block.classList.toggle('show', !entry.isIntersecting);
      block.classList.toggle('hide', entry.isIntersecting);
    });
    observer.observe(trigger);
  } else {
    block.classList.add('show');
    block.classList.remove('hide');
  }
}
