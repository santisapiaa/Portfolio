// Vercel Analytics custom events (window.va is queued in index.html until the script loads)
function track(name, data) {
  window.va?.('event', { name, data });
}

// Mobile nav toggle
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});
navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => navLinks.classList.remove('open'));
});

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Language
// Spanish comes from the markup; keep a copy so we can switch back to it.
const I18N_ES = {
  'meta.title': document.title,
  'meta.description': document.querySelector('meta[name="description"]').content
};
document.querySelectorAll('[data-i18n]').forEach(el => { I18N_ES[el.dataset.i18n] = el.innerHTML.trim(); });
document.querySelectorAll('[data-i18n-alt]').forEach(el => { I18N_ES[el.dataset.i18nAlt] = el.alt; });
document.querySelectorAll('[data-i18n-aria]').forEach(el => { I18N_ES[el.dataset.i18nAria] = el.getAttribute('aria-label'); });
I18N.es = I18N_ES;

let currentLang = 'es';

function storedLang() {
  try { return localStorage.getItem('lang'); } catch { return null; }
}

function initialLang() {
  const fromUrl = new URLSearchParams(location.search).get('lang');
  if (LANGS.includes(fromUrl)) return fromUrl;
  const saved = storedLang();
  if (LANGS.includes(saved)) return saved;
  const browser = (navigator.language || 'es').slice(0, 2).toLowerCase();
  return LANGS.includes(browser) ? browser : 'es';
}

function setLang(lang, save) {
  const dict = I18N[lang];
  currentLang = lang;
  document.documentElement.lang = HTML_LANG[lang];
  document.title = dict['meta.title'];
  document.querySelector('meta[name="description"]').content = dict['meta.description'];
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const text = dict[el.dataset.i18n];
    if (text !== undefined) el.innerHTML = text;
  });
  document.querySelectorAll('[data-i18n-alt]').forEach(el => { el.alt = dict[el.dataset.i18nAlt]; });
  document.querySelectorAll('[data-i18n-aria]').forEach(el => { el.setAttribute('aria-label', dict[el.dataset.i18nAria]); });

  document.getElementById('langFlag').innerHTML = FLAGS[lang];
  document.getElementById('langCode').textContent = lang.toUpperCase();
  langMenu.querySelectorAll('[data-lang]').forEach(b => b.setAttribute('aria-current', b.dataset.lang === lang));

  restartTyping();
  if (save) {
    try { localStorage.setItem('lang', lang); } catch {}
    track('Language Change', { lang });
  }
}

const langBtn = document.getElementById('langBtn');
const langMenu = document.getElementById('langMenu');
langMenu.querySelectorAll('[data-flag]').forEach(el => { el.innerHTML = FLAGS[el.dataset.flag]; });

function toggleLangMenu(open) {
  langMenu.hidden = !open;
  langBtn.setAttribute('aria-expanded', open);
}
langBtn.addEventListener('click', e => {
  e.stopPropagation();
  toggleLangMenu(langMenu.hidden);
  if (!langMenu.hidden) langMenu.querySelector('[aria-current="true"]')?.focus();
});
langMenu.addEventListener('click', e => {
  const btn = e.target.closest('[data-lang]');
  if (!btn) return;
  setLang(btn.dataset.lang, true);
  toggleLangMenu(false);
  langBtn.focus();
});
document.addEventListener('click', e => {
  if (!langMenu.hidden && !e.target.closest('#lang')) toggleLangMenu(false);
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !langMenu.hidden) { toggleLangMenu(false); langBtn.focus(); }
});

// Typed role text
const typedEl = document.getElementById('typed');
let roleIndex = 0, charIndex = 0, deleting = false, typeTimer;

function typeLoop() {
  const roles = ROLES[currentLang];
  const current = roles[roleIndex];
  if (!deleting) {
    charIndex++;
    typedEl.textContent = current.slice(0, charIndex);
    if (charIndex === current.length) {
      deleting = true;
      typeTimer = setTimeout(typeLoop, 1600);
      return;
    }
  } else {
    charIndex--;
    typedEl.textContent = current.slice(0, charIndex);
    if (charIndex === 0) {
      deleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
    }
  }
  typeTimer = setTimeout(typeLoop, deleting ? 35 : 55);
}

function restartTyping() {
  clearTimeout(typeTimer);
  roleIndex = 0; charIndex = 0; deleting = false;
  if (reduceMotion) {
    typedEl.textContent = ROLES[currentLang][0];
  } else {
    typeLoop();
  }
}

setLang(initialLang(), false);

// Click tracking: CV downloads, project links and contact links
function contactMethod(href) {
  if (href.startsWith('mailto:')) return 'email';
  if (href.startsWith('tel:')) return 'phone';
  if (href.includes('linkedin.com')) return 'linkedin';
  if (href.includes('github.com')) return 'github';
  return null;
}

document.addEventListener('click', e => {
  const a = e.target.closest('a[href]');
  if (!a) return;
  const href = a.getAttribute('href');

  if (href.endsWith('.pdf')) {
    track('CV Download', { lang: currentLang });
    return;
  }

  const card = a.closest('.project-card');
  if (card) {
    const project = card.querySelector('h3').textContent.trim();
    const link = a.classList.contains('project-media') ? 'image'
      : href.includes('github.com') ? 'repo' : 'demo';
    track('Project Click', { project, link });
    return;
  }

  const method = contactMethod(href);
  if (method && a.closest('.hero-links, .contact-grid')) {
    track('Contact Click', { method, location: a.closest('.hero-links') ? 'hero' : 'contact' });
  }
});

// Footer year
document.getElementById('year').textContent = new Date().getFullYear();

// Scroll-reveal for sections
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

if (!reduceMotion) document.querySelectorAll('.project-card, .skill-card, .stat-card, .timeline-item').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(24px)';
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  observer.observe(el);
});
