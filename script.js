// Vercel Analytics custom events (window.va is queued in index.html until the script loads)
function track(name, data) {
  window.va?.('event', { name, data });
}

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Mobile nav toggle
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});
navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => navLinks.classList.remove('open'));
});

// Language
const DEFAULT_LANG = 'es';
const LANG_STORAGE_KEY = 'lang';
const metaDescription = document.querySelector('meta[name="description"]');

// Each translatable attribute: the data-* key that names the text, and how to read/write it
const I18N_TARGETS = [
  { selector: '[data-i18n]', key: el => el.dataset.i18n, get: el => el.innerHTML.trim(), set: (el, text) => { if (text !== undefined) el.innerHTML = text; } },
  { selector: '[data-i18n-alt]', key: el => el.dataset.i18nAlt, get: el => el.alt, set: (el, text) => { el.alt = text; } },
  { selector: '[data-i18n-aria]', key: el => el.dataset.i18nAria, get: el => el.getAttribute('aria-label'), set: (el, text) => { el.setAttribute('aria-label', text); } }
];

// Spanish comes from the markup; keep a copy so we can switch back to it.
function readSpanishFromMarkup() {
  const dict = { 'meta.title': document.title, 'meta.description': metaDescription.content };
  I18N_TARGETS.forEach(({ selector, key, get }) => {
    document.querySelectorAll(selector).forEach(el => { dict[key(el)] = get(el); });
  });
  return dict;
}
I18N.es = readSpanishFromMarkup();

let currentLang = DEFAULT_LANG;

function storedLang() {
  try { return localStorage.getItem(LANG_STORAGE_KEY); } catch { return null; }
}

function saveLang(lang) {
  try { localStorage.setItem(LANG_STORAGE_KEY, lang); } catch {}
}

function initialLang() {
  const fromUrl = new URLSearchParams(location.search).get('lang');
  if (LANGS.includes(fromUrl)) return fromUrl;
  const saved = storedLang();
  if (LANGS.includes(saved)) return saved;
  // Always start in Spanish: auto-switching by browser language made Google index the English version
  return DEFAULT_LANG;
}

function applyTranslations(dict) {
  document.title = dict['meta.title'];
  metaDescription.content = dict['meta.description'];
  I18N_TARGETS.forEach(({ selector, key, set }) => {
    document.querySelectorAll(selector).forEach(el => set(el, dict[key(el)]));
  });
}

function updateLangControls(lang) {
  document.querySelector('.cv-btn').href = CV_FILES[lang];
  document.getElementById('langFlag').innerHTML = FLAGS[lang];
  document.getElementById('langCode').textContent = lang.toUpperCase();
  langMenu.querySelectorAll('[data-lang]').forEach(b => b.setAttribute('aria-current', b.dataset.lang === lang));
}

function setLang(lang, save) {
  currentLang = lang;
  document.documentElement.lang = HTML_LANG[lang];
  applyTranslations(I18N[lang]);
  updateLangControls(lang);

  restartTyping();
  if (save) {
    saveLang(lang);
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
const TYPE_DELAY_MS = 55;
const DELETE_DELAY_MS = 35;
const HOLD_FULL_TEXT_MS = 1600;

const typedEl = document.getElementById('typed');
let roleIndex = 0, charIndex = 0, deleting = false, typeTimer;

function typeLoop() {
  const roles = ROLES[currentLang];
  const current = roles[roleIndex];
  charIndex += deleting ? -1 : 1;
  typedEl.textContent = current.slice(0, charIndex);

  if (!deleting && charIndex === current.length) {
    deleting = true;
    typeTimer = setTimeout(typeLoop, HOLD_FULL_TEXT_MS);
    return;
  }
  if (deleting && charIndex === 0) {
    deleting = false;
    roleIndex = (roleIndex + 1) % roles.length;
  }
  typeTimer = setTimeout(typeLoop, deleting ? DELETE_DELAY_MS : TYPE_DELAY_MS);
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
const CONTACT_METHODS = [
  [href => href.startsWith('mailto:'), 'email'],
  [href => href.startsWith('tel:'), 'phone'],
  [href => href.includes('linkedin.com'), 'linkedin'],
  [href => href.includes('github.com'), 'github']
];

function contactMethod(href) {
  return CONTACT_METHODS.find(([matches]) => matches(href))?.[1] ?? null;
}

function projectLinkType(a, href) {
  if (a.classList.contains('project-media')) return 'image';
  return href.includes('github.com') ? 'repo' : 'demo';
}

document.addEventListener('click', e => {
  const a = e.target.closest('a[href]');
  if (!a) return;
  const href = a.getAttribute('href');

  if (href.endsWith('.pdf')) {
    track('CV Download', { lang: currentLang });
    return;
  }

  // Links that name their own contact method (the freelance project's socials)
  if (a.dataset.contact) {
    track('Contact Click', { method: a.dataset.contact });
    return;
  }

  const card = a.closest('.project-card');
  if (card) {
    const project = card.querySelector('h3').textContent.trim();
    track('Project Click', { project, link: projectLinkType(a, href) });
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
const REVEAL_SELECTOR = '.project-card, .skill-card, .stat-card, .timeline-item';
const REVEAL_OFFSET = 'translateY(24px)';

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

if (!reduceMotion) document.querySelectorAll(REVEAL_SELECTOR).forEach(el => {
  el.style.opacity = '0';
  el.style.transform = REVEAL_OFFSET;
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  observer.observe(el);
});
